# ── Stage 1: builder (装 wheels) ──────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ── Stage 2: runtime (slim, 非 root) ─────────────────
FROM python:3.12-slim AS runtime

# 创建非 root 用户
RUN groupadd --system --gid 1001 appuser \
    && useradd --system --uid 1001 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

# 安装 wheels (无编译工具链, 镜像更小更安全)
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

# 复制项目
COPY --chown=appuser:appuser . .

# data 目录用于 ChromaDB 持久化, docker volume 会挂载在此
RUN mkdir -p /app/data && chown -R appuser:appuser /app/data

USER appuser

EXPOSE 8000

# Docker healthcheck (无 curl, 用 python 标准库)
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/ai/health', timeout=3).status==200 else 1)"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
