"""共享 pytest fixtures - mock 掉所有 Gemini / Chroma 实际调用。"""

from __future__ import annotations

import os
import sys
from collections.abc import AsyncIterator
from pathlib import Path

# 让 `import main` / `import rag_engine` 能找到模块
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Gemini SDK 在 import / Client() 时会校验存在 API key, 给一个占位避免报错。
# 真正的 LLM / retriever 在 stub_rag_engine fixture 里被替换掉, 不会触达网络。
os.environ.setdefault("GEMINI_API_KEY", "AIza-test-not-a-real-key")
os.environ.setdefault("GOOGLE_API_KEY", "AIza-test-not-a-real-key")

import pytest  # noqa: E402

import rag_engine as rag_engine_module  # noqa: E402


class _StubRetriever:
    async def ainvoke(self, _query: str):
        from langchain_core.documents import Document

        return [
            Document(page_content="stub knowledge content", metadata={"source": "stub.md"}),
        ]


class _StubLLM:
    async def astream(self, _messages) -> AsyncIterator:
        from langchain_core.messages import AIMessageChunk

        for tok in ("hello", " ", "world"):
            yield AIMessageChunk(content=tok)


@pytest.fixture(autouse=True)
def stub_rag_engine(monkeypatch):
    """避免任何测试触发真实 Gemini / Chroma 初始化。"""

    engine = rag_engine_module.rag_engine

    def fake_initialize() -> None:
        engine._retriever = _StubRetriever()
        engine._llm = _StubLLM()
        # 设为 None → 跳过 condense 链路 (条件: not history or _condense_llm is None)
        engine._condense_llm = None

    monkeypatch.setattr(engine, "initialize", fake_initialize)
    fake_initialize()
    yield
    engine._sessions.clear()
    # 清除 main 模块中的限流桶, 避免测试间互相污染
    try:
        import main as _main

        _main._rate_buckets.clear()
    except Exception:
        pass
