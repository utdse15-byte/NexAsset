<div align="center">
  <h1>NexAsset 🚀</h1>
  <p>An Enterprise-Grade IT Asset Management System (ITAM)</p>
  
  <p>
    <a href="https://nex-asset.vercel.app"><b>Live Demo</b></a> •
    <a href="README_CN.md">中文文档</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue" alt="React">
    <img src="https://img.shields.io/badge/Vite-6-brightgreen" alt="Vite">
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
    <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
  </p>
</div>

## 📌 Introduction

**NexAsset** is a modern, enterprise-ready IT Asset Management (ITAM) system designed to track and manage the entire lifecycle of hardware and software assets within an organization. It provides a robust architecture for inventory tracking, procurement workflows, role-based access control, and comprehensive data analytics.

> ⚠️ **Production note** — Out of the box this repo ships with:
>
> - A **production-ready AI backend** (`backend/`, FastAPI + LangChain RAG, served at `/api/ai/*`)
> - A **frontend mock layer** (MSW) that intercepts all other `/api/*` calls (`/api/user`, `/api/assets`, …) **only in development**.
>
> The MSW worker is intentionally not started in production builds. Once you run `pnpm build && docker compose up`, only `/api/ai/*` is wired to a real backend; every other business endpoint will return the SPA fallback. Before deploying for real use, replace the mock handlers with a real backend service or extend `backend/` with the necessary CRUD endpoints.

## 🏗️ Engineering Highlights

The bits I think are worth a closer look during code review:

### AI assistant (RAG, streaming, production-grade)

- **LangChain LCEL pipeline** with MMR retrieval against a persisted **ChromaDB** vector store, sources cited in the response.
- **Document fingerprinting**: SHA-256 over `docs/` decides whether to reuse the existing vector store or rebuild on startup, so editing knowledge base files is a single restart away.
- **SSE streaming with client-disconnect cancellation**: the backend checks `request.is_disconnected()` between tokens, so closing the chat panel actually stops billing OpenAI tokens — not a given in most LangChain demos.
- **Adaptive query condensation**: a heuristic detects pronoun-heavy follow-ups (e.g. "那它怎么办") and only then spends a second LLM call to rewrite the question into a standalone retrieval query.
- **Prompt-injection hardening**: retrieved documents are wrapped in `<context>` tags with `</context>` escaped inside payloads, plus a system-level rule that explicitly tells the model to treat both context and user input as data, not instructions.

### Backend hardening (FastAPI)

- **Sliding-window rate limiter** keyed by client IP (with explicit `TRUST_FORWARDED_FOR` opt-in to avoid header spoofing when the service is exposed directly).
- **Real LRU session memory** (`OrderedDict.move_to_end`) — active users don't get evicted just because they're chatty.
- **`hmac.compare_digest`** for the admin reindex endpoint to avoid timing-side-channel leakage.
- **Multi-stage Docker build**: wheel cache layer in `builder`, slim runtime, dedicated non-root `appuser`, container-native `HEALTHCHECK` using only the Python stdlib.

### Frontend resilience

- **SSE parser extracted to a pure module** (`src/components/ai-chat/sse-parser.ts`) so half-line buffering, keepalive frames and `[DONE]` termination are unit-tested without rendering the chat widget.
- **Per-frame batching with `requestAnimationFrame`** in the chat UI: each chunk doesn't trigger a full message-list re-render, only a coalesced commit per frame.
- **90-second fetch fallback timeout** in addition to the user-driven `AbortController`, with distinct UX copy for "you cancelled" vs "we timed out".
- **Axios interceptor** that handles three subtle edge cases properly: `204` / null body as a successful empty response, falsy `data` (`0` / `false` / `""`) returned as-is, and `401` redirecting to `/auth/login` only when not already there (no redirect loop).

### Security headers, CSP, container

- Nginx ships **CSP / Permissions-Policy / X-Content-Type-Options / X-Frame-Options / Referrer-Policy** with a policy tuned for Antd's css-in-js runtime injection and the in-app `iframe` page (`frame-src https:`).
- SPA `index.html` is `no-cache`, hashed assets are `public, immutable` for 30 days, SSE upstream has buffering / chunked-encoding turned off so the stream actually streams.

### Tooling

- **Biome** for both linting and formatting (single source of truth, fast).
- **Lefthook** pre-commit pipeline runs Biome lint + format on staged files _and_ a project-wide `tsc --noEmit`, so type errors never reach CI.
- **GitHub Actions** runs Biome / `tsc` / Vitest on the frontend, Ruff / Pytest on the backend, plus advisory `pnpm audit` and `pip-audit` jobs that surface CVEs without blocking PRs.
- **35 frontend tests + 15 backend tests** covering the things that matter: SSE chunk parsing, axios interceptor edge cases, RBAC guard branching, RAG LRU eviction, rate-limit kick-in, admin-token comparison.

## ✨ Key Features

- **📊 Smart Dashboard & Analytics**: Visualize asset lifecycle, depreciation, departmental usage, and maintenance statistics.
- **💻 Asset Inventory**: Full lifecycle management including filtering, searching, checkout/return, maintenance, and retirement tracking.
- **📦 Consumables & Purchasing**: Track stock levels with low-stock alerts. Manage end-to-end procurement workflows from request to approval and receiving.
- **🔐 Enterprise Security**: Comprehensive User & Department management with strict Role-Based Access Control (RBAC) at both the page and button levels.
- **🌍 Internationalization (i18n)**: Seamless switching between English and Simplified Chinese setups.
- **🌙 Dark Mode Support**: Beautifully crafted dark mode for low-light environments.
- **🧪 Engineering Excellence**:
  - **React Query** for server-state caching with sensible `staleTime` / `gcTime` tuned defaults.
  - **35 frontend + 15 backend tests** covering SSE parsing, axios interceptor edge cases, RBAC, RAG LRU, rate limiting and admin-token comparison.
  - **GitHub Actions** runs lint + typecheck + tests + advisory CVE audits on every PR.
  - **MSW** intercepts business APIs in development for offline-first work; production builds skip it (see Production note above).
  - See [Engineering Highlights](#-engineering-highlights) for the things that took the most thought.

## 🛠️ Technology Stack

### Frontend

| Category           | Technology                        |
| ------------------ | --------------------------------- |
| Framework          | **React 19**                      |
| Build Tool         | **Vite 6**                        |
| Language           | **TypeScript 5**                  |
| UI Library         | **Ant Design 5**                  |
| Styling            | **Tailwind CSS 4**                |
| State Management   | **Zustand**                       |
| Data Fetching      | **Axios + @tanstack/react-query** |
| Routing            | **React Router 7**                |
| Charts             | **ApexCharts**                    |
| Animation          | **Framer Motion**                 |
| Linter & Formatter | **Biome**                         |
| Testing            | **Vitest + Testing Library**      |

### AI Backend (`backend/`)

| Category       | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | **FastAPI** (async, SSE)                |
| LLM Pipeline   | **LangChain LCEL**                      |
| Vector Store   | **ChromaDB** (persistent)               |
| Embeddings     | **OpenAI** `text-embedding-3-small`     |
| Chat Model     | **OpenAI** `gpt-4o-mini` (configurable) |
| Linter / Tests | **Ruff + Pytest + httpx ASGI client**   |
| Container      | **Multi-stage Dockerfile, non-root**    |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/NexAsset.git
cd NexAsset

# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Run unit tests
pnpm test
```

The development server will be running at `http://localhost:3001` with MSW intercepting all API requests locally.

## 📂 Project Structure

This project is built upon the excellent foundation of [slash-admin by d3george](https://github.com/d3george/slash-admin).

```text
src/
├── api/          # Axios instances and API service definitions
├── assets/       # Static resources (images, icons)
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks (e.g., useCopyToClipboard)
├── layouts/      # Global layout components
├── locales/      # i18n translation files (en_US, zh_CN)
├── pages/        # Application view components categorized by feature
├── routes/       # React Router 7 configuration
├── store/        # Zustand state stores
├── theme/        # Ant Design & Tailwind theme configurations
├── types/        # TypeScript interfaces and type definitions
├── utils/        # Utility functions and helpers
└── _mock/        # MSW handlers and local persistent mock data
```

## 🔧 Router modes

`VITE_APP_ROUTER_MODE` controls which navigation tree the dashboard renders.

- `backend` (default, recommended) — menu and routes are generated from `DB_MENU`, i.e. the actual NexAsset product surface (assets / purchasing / consumables / users / departments / audit / analytics).
- `frontend` — renders the demo menu inherited from the underlying slash-admin template (Components / Menu Level / Iframe / etc.). Use only when inspecting the template base.

Both modes currently read the same local `DB_MENU` mock; the difference is which menu tree gets shown. Before pointing `backend` mode at a real `/api/menu` endpoint, follow the migration checklist in the JSDoc above `getBackendDashboardRoutes` (failure fallback, loading UX, 401 handling).

## 📝 License

Released under the [MIT License](LICENSE).
