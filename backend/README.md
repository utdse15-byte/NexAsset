# NexAsset AI Backend

FastAPI + LangChain + ChromaDB 的 RAG 智能助手服务。

## 特性

- 🚀 FastAPI 异步服务，SSE 流式输出
- 🧠 LangChain LCEL 检索-生成管道
- 📚 ChromaDB 持久化向量库 + 文档指纹自动重建
- 🔒 输入校验、速率限制、按需 CORS、`ADMIN_TOKEN` 受控管理端点
- ♻️ 真正 LRU 的会话历史，避免活跃用户被错误淘汰

## 本地开发

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env       # ⚠ 必填 OPENAI_API_KEY, docker compose up 也需要此文件
python main.py             # http://localhost:8000
```

打开 `http://localhost:8000/docs` 可看到 Swagger UI。

### 跑测试 / lint

```bash
ruff check .
pytest -q
```

测试全部 mock OpenAI / Chroma，无需外网或真 key。

## 环境变量

见 `.env.example`。关键项：

| 变量                        | 默认                     | 说明                                |
| --------------------------- | ------------------------ | ----------------------------------- |
| `OPENAI_API_KEY`            | –                        | **必填**                            |
| `OPENAI_BASE_URL`           | –                        | 自定义 endpoint                     |
| `CHAT_MODEL`                | `gpt-4o-mini`            |                                     |
| `EMBEDDING_MODEL`           | `text-embedding-3-small` |                                     |
| `ALLOWED_ORIGINS`           | 空                       | 跨域来源 (逗号分隔)。留空走同源反代 |
| `RATE_LIMIT_WINDOW_SECONDS` | 60                       | 限流时间窗                          |
| `RATE_LIMIT_MAX_REQUESTS`   | 30                       | 窗口内最大请求数 (按 IP)            |
| `ADMIN_TOKEN`               | 空                       | 设置后才能调 `POST /api/ai/reindex` |
| `MAX_HISTORY_LENGTH`        | 20                       | 单会话最多保留消息数                |
| `MAX_SESSIONS`              | 100                      | 总会话数上限 (LRU)                  |
| `LOG_LEVEL`                 | `INFO`                   |                                     |

## API

- `GET  /api/ai/health` — 健康检查
- `POST /api/ai/chat` — `{message, session_id}` → SSE token stream
- `POST /api/ai/chat/reset?session_id=...` — 清除会话历史
- `POST /api/ai/reindex` — 改了 `docs/` 后用 `X-Admin-Token` 调用以重建索引

## 知识库更新

向 `backend/docs/` 增删 `.md`，然后任选其一：

- 重启容器：`rag_engine` 检测到指纹变更会自动重建
- 不停机：`curl -X POST -H "X-Admin-Token: $ADMIN_TOKEN" http://backend/api/ai/reindex`
