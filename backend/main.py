"""
NexAsset AI Backend - FastAPI 入口

提供以下 API:
- POST /api/ai/chat        流式 AI 对话 (SSE)
- POST /api/ai/chat/reset  重置对话历史
- POST /api/ai/reindex     强制重建向量索引 (需 X-Admin-Token)
- GET  /api/ai/health      健康检查
"""

import asyncio
import hmac
import json
import logging
import os
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from time import monotonic
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from rag_engine import rag_engine

# 加载 .env
load_dotenv()

# ── 日志 ─────────────────────────────────────────────
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("nexasset.ai")


# ── 简易内存速率限制 (滑动窗口, 按客户端 IP) ──────────
RATE_LIMIT_WINDOW = float(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_MAX = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "30"))
# 部署在反代后时, 信任的代理 IP 头 (X-Forwarded-For) 中第一个 IP 才是真实客户端。
# 默认 false 以防直接暴露端口时限流被伪造头绕过; 在反代后部署时显式设为 true。
TRUST_FORWARDED_FOR = os.getenv("TRUST_FORWARDED_FOR", "false").lower() in ("1", "true", "yes")
_rate_buckets: dict[str, deque[float]] = defaultdict(deque)


def _client_key(http_request: Request) -> str:
    """识别客户端 (用于限流)。反代后取 X-Forwarded-For 的第一个 IP。"""
    if TRUST_FORWARDED_FOR:
        xff = http_request.headers.get("x-forwarded-for")
        if xff:
            first = xff.split(",")[0].strip()
            if first:
                return first
    return http_request.client.host if http_request.client else "unknown"


def _enforce_rate_limit(key: str) -> None:
    """超过窗口限制时抛 429。生产环境请换成 Redis 实现。"""
    now = monotonic()
    cutoff = now - RATE_LIMIT_WINDOW

    # 定期清理不活跃 IP 的空桶 (每 100 次调用清理一次)
    _enforce_rate_limit._call_count = getattr(_enforce_rate_limit, "_call_count", 0) + 1
    if _enforce_rate_limit._call_count % 100 == 0:
        stale_keys = [k for k, v in _rate_buckets.items() if not v or v[-1] < cutoff]
        for k in stale_keys:
            del _rate_buckets[k]

    bucket = _rate_buckets[key]
    while bucket and bucket[0] < cutoff:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="请求过于频繁，请稍后再试",
        )
    bucket.append(now)


# ── 启动/关闭钩子 ────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动时初始化 RAG 引擎 (在线程池中执行同步阻塞 IO)。"""
    logger.info("正在初始化 RAG 引擎...")
    try:
        await asyncio.to_thread(rag_engine.initialize)
        logger.info("RAG 引擎初始化完成")
    except Exception:
        logger.exception("RAG 引擎初始化失败")
        raise
    yield
    logger.info("服务关闭")


# ── FastAPI 应用 ─────────────────────────────────────
app = FastAPI(
    title="NexAsset AI Backend",
    description="企业 IT 资产管理智能助手 - RAG 增强对话服务",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: 默认仅允许同源 (通过反向代理); 通过 ALLOWED_ORIGINS 显式开放
_origins_raw = os.getenv("ALLOWED_ORIGINS", "").strip()
allowed_origins = [o.strip() for o in _origins_raw.split(",") if o.strip()] if _origins_raw else []
if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )
    logger.info("CORS 已为以下来源开放: %s", allowed_origins)
else:
    logger.info("未配置 CORS, 仅允许同源访问 (推荐用反向代理)")


# ── 请求模型 ─────────────────────────────────────────
SESSION_ID_PATTERN = r"^[A-Za-z0-9._\-]+$"


class ChatRequest(BaseModel):
    """前端会话请求 - 加严格长度/字符校验防止滥用"""

    message: str = Field(min_length=1, max_length=2000)
    session_id: str = Field(
        default="default",
        min_length=1,
        max_length=128,
        pattern=SESSION_ID_PATTERN,
    )


# ── API 路由 ─────────────────────────────────────────
@app.get("/api/ai/health")
async def health_check():
    """健康检查 (供 Docker healthcheck 调用)"""
    return {"status": "ok", "service": "NexAsset AI Backend"}


@app.post("/api/ai/chat")
async def chat(request: ChatRequest, http_request: Request):
    """流式 AI 对话接口 (SSE - Server-Sent Events)"""
    _enforce_rate_limit(_client_key(http_request))

    async def event_stream():
        try:
            async for token in rag_engine.query_stream(
                request.message, session_id=request.session_id
            ):
                # 客户端断开后立刻停止生成, 避免空烧 LLM token
                if await http_request.is_disconnected():
                    logger.info(
                        "客户端已断开, 中止流式生成 session=%s", request.session_id
                    )
                    return
                data = json.dumps({"token": token}, ensure_ascii=False)
                yield f"data: {data}\n\n"
            yield "data: [DONE]\n\n"
        except Exception:
            # 不把内部异常细节回传给客户端
            logger.exception("生成回答时出错 session=%s", request.session_id)
            error_data = json.dumps(
                {"error": "AI 服务暂时不可用，请稍后再试"},
                ensure_ascii=False,
            )
            yield f"data: {error_data}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/ai/chat/reset")
async def reset_chat(
    session_id: Annotated[
        str,
        Query(min_length=1, max_length=128, pattern=SESSION_ID_PATTERN),
    ] = "default",
):
    """重置对话历史"""
    rag_engine.reset_memory(session_id)
    return {"status": "ok", "message": "对话历史已清除"}


@app.post("/api/ai/reindex")
async def reindex(http_request: Request):
    """强制重建向量索引 (改了 docs 后调用)。需 X-Admin-Token 头。"""
    expected = os.getenv("ADMIN_TOKEN")
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="未配置 ADMIN_TOKEN, 该端点已禁用",
        )
    token = http_request.headers.get("X-Admin-Token") or ""
    if not hmac.compare_digest(token, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未授权")
    await asyncio.to_thread(rag_engine.rebuild_index)
    return {"status": "ok", "message": "索引已重建"}


# ── 启动入口 ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
