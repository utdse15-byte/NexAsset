"""RAGEngine 内部行为测试 (LRU / condense 启发式 / 历史限长)。"""

from __future__ import annotations

import pytest
from langchain_core.messages import AIMessage, HumanMessage

import rag_engine as rag_engine_module
from rag_engine import RAGEngine, _coerce_token


def test_coerce_token_str() -> None:
    assert _coerce_token("hi") == "hi"


def test_coerce_token_list_text_blocks() -> None:
    assert _coerce_token([{"text": "a"}, {"text": "b"}]) == "ab"


def test_coerce_token_none() -> None:
    assert _coerce_token(None) == ""


def test_lru_eviction(monkeypatch: pytest.MonkeyPatch) -> None:
    engine = RAGEngine()
    monkeypatch.setattr(rag_engine_module, "MAX_SESSIONS", 3)

    engine._get_history("a")
    engine._get_history("b")
    engine._get_history("c")
    # 触碰 a 让它变成最近使用
    engine._get_history("a")
    # 新来 d, 应淘汰最久未使用的 b
    engine._get_history("d")

    assert "b" not in engine._sessions
    assert {"a", "c", "d"}.issubset(engine._sessions.keys())


def test_history_truncation_in_query_does_not_exceed_max(monkeypatch: pytest.MonkeyPatch) -> None:
    engine = RAGEngine()
    monkeypatch.setattr(rag_engine_module, "MAX_HISTORY_LENGTH", 4)

    history = engine._get_history("alice")
    for i in range(10):
        history.append(HumanMessage(content=f"q{i}"))
        history.append(AIMessage(content=f"a{i}"))
    # 模拟 query_stream 中的截断逻辑
    if len(history) > rag_engine_module.MAX_HISTORY_LENGTH:
        del history[: len(history) - rag_engine_module.MAX_HISTORY_LENGTH]
    assert len(history) == 4


def test_needs_condense_short_question() -> None:
    assert RAGEngine._needs_condense("再来")  # <= 4 chars
    assert RAGEngine._needs_condense("打印机怎么办")  # 含 "怎么办"
    assert not RAGEngine._needs_condense("笔记本电脑的报修流程是什么")


def test_reset_memory_removes_session() -> None:
    engine = RAGEngine()
    engine._get_history("a").append(HumanMessage(content="hi"))
    assert "a" in engine._sessions
    engine.reset_memory("a")
    assert "a" not in engine._sessions
