"""API 烟测 - 完全离线, 不打 OpenAI。"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

import main as main_module


@pytest.fixture
async def client():
    transport = ASGITransport(app=main_module.app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def test_health(client: AsyncClient) -> None:
    r = await client.get("/api/ai/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


async def test_chat_message_too_long_rejected(client: AsyncClient) -> None:
    r = await client.post(
        "/api/ai/chat",
        json={"message": "x" * 3000, "session_id": "alice"},
    )
    assert r.status_code == 422


async def test_chat_session_id_pattern_rejected(client: AsyncClient) -> None:
    r = await client.post(
        "/api/ai/chat",
        json={"message": "你好", "session_id": "bad id with space!"},
    )
    assert r.status_code == 422


async def test_chat_streams_tokens(client: AsyncClient) -> None:
    async with client.stream(
        "POST",
        "/api/ai/chat",
        json={"message": "你好", "session_id": "alice"},
    ) as r:
        assert r.status_code == 200
        body = b""
        async for chunk in r.aiter_bytes():
            body += chunk
        text = body.decode("utf-8")
        assert "data: " in text
        assert "[DONE]" in text
        # stub LLM 会吐出 "hello world"
        assert "hello" in text


async def test_reset(client: AsyncClient) -> None:
    r = await client.post("/api/ai/chat/reset?session_id=alice")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


async def test_reindex_disabled_without_token(client: AsyncClient, monkeypatch) -> None:
    monkeypatch.delenv("ADMIN_TOKEN", raising=False)
    r = await client.post("/api/ai/reindex")
    assert r.status_code == 503


async def test_reindex_unauthorized(client: AsyncClient, monkeypatch) -> None:
    monkeypatch.setenv("ADMIN_TOKEN", "secret")
    r = await client.post("/api/ai/reindex", headers={"X-Admin-Token": "wrong"})
    assert r.status_code == 401


async def test_rate_limit_kicks_in(client: AsyncClient, monkeypatch) -> None:
    # 把限制压到极小, 验证 429
    monkeypatch.setattr(main_module, "RATE_LIMIT_MAX", 2)
    main_module._rate_buckets.clear()
    for _ in range(2):
        async with client.stream(
            "POST",
            "/api/ai/chat",
            json={"message": "你好", "session_id": "alice"},
        ) as r:
            assert r.status_code == 200
            async for _ in r.aiter_bytes():
                pass
    r = await client.post(
        "/api/ai/chat",
        json={"message": "你好", "session_id": "alice"},
    )
    assert r.status_code == 429
