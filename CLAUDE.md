# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **frontend** of the "算法模型智能体平台" (AI Algorithm Model Agent Platform) — a Vue 2 SPA for managing algorithm microservices, application building, and intelligent operations across vertical domains. The backend is a separate Flask service (ioeb_backend repo); the agent framework lives in the Micro-Agent repo.

Production URL: https://fdueblab.cn

## Commands

```bash
# Install dependencies (yarn preferred)
yarn install

# Dev server (http://localhost:8001)
yarn serve

# Production build
yarn build

# Preview build (uses .env.preview)
yarn build:preview

# Lint (auto-fix)
yarn lint

# Lint JS only
yarn lint:js

# Lint CSS/Less only
yarn lint:css

# Run unit tests
yarn test:unit

# Documentation dev server (VitePress)
yarn docs:dev
```

## Architecture

### Tech Stack
- **Vue 2.6** + Vue Router (hash mode) + Vuex
- **Ant Design Vue 1.7** as primary UI framework (also has Element UI for legacy components)
- **Less** for styling, with Ant Design theme variables
- **Webpack** via Vue CLI 5
- **ECharts / AntV G2Plot / G6** for data visualization
- Path alias: `@$` → `src/`, `@` → `src/`

### Source Layout (`src/`)

- **`api/`** — Axios API modules organized by domain (login, service, docker, evaluation, etc.)
- **`components/`** — Shared components (Agent chat, Charts, Editor, flow editor `ef/`, monitor dashboards, Table, etc.)
- **`config/`** — App settings (`defaultSettings.js`) and route definitions (`router.config.js`)
- **`core/`** — App bootstrap, global directives, icon registration, permission directives
- **`domain/`** — Domain knowledge system: `KnowledgeRegistry` + `KnowledgeEnhancer` with pluggable profiles per vertical domain (aml, aircraft, health, agriculture, evtol, ecommerce, homeAI)
- **`layouts/`** — Page layout shells: BasicLayout (main sidebar+header), BlankLayout, UserLayout (login), AppView, PageView
- **`locales/`** — i18n (zh-CN / en-US)
- **`router/`** — Vue Router setup; routes are dynamically generated from `asyncRouterMap` filtered by user permissions
- **`store/`** — Vuex modules: `user` (auth/token), `app` (settings), `async-router` (permission-based routing)
- **`utils/`** — HTTP client (`request.js`), dictionary cache, code generators, validators
- **`views/`** — Page views organized by feature area

### Key Architectural Patterns

**Dynamic routing by domain**: Routes under `/vertical-user/`, `/vertical-ms/`, `/vertical-scenario-dev/`, `/vertical-atom-app/`, `/evaluation/`, `/operation/` are generated dynamically from the backend dictionary API (`loadDict('domain')`). A shared `GenericVerticalDomain.vue` / `GenericMicroService.vue` / `GenericScenarioDev.vue` renders each domain by accepting a `verticalType` prop.

**Permission system**: Three roles — `admin`, `publisher`, `user`. Route meta `permission` arrays control visibility. The Vuex `async-router` module filters `asyncRouterMap` based on the logged-in user's role.

**Auth flow**: Token stored via `store` (localStorage with expiry). Header `Access-Token` sent on every request. On 401, auto-logout and reload.

**HTTP clients**: `src/utils/request.js` exports the standard Axios instance (baseURL from `VUE_APP_API_BASE_URL`), plus `streamAgent` / `callAgentApi` / `streamLLMChat` for SSE streaming to the agent service (baseURL from `VUE_APP_AGENT_BASE_URL`).

**Domain knowledge**: `src/domain/` provides a registry of vertical-domain profiles. Call `getKnowledge(domainId, context)` to retrieve domain-specific metadata (prompts, service catalogs, terminology) used by the AI assistant and scenario builder components.

**Dictionary cache**: `src/utils/dictionaryCache.js` caches backend dictionary data in localStorage with 24h expiry. Used heavily for dynamic route generation and dropdown options.

### Top-level `api/` Directory

Contains standalone algorithm microservice projects (Project_1 through Project_4, linezolid, llm) — each is a Python Flask app with its own Dockerfile. These are NOT part of the Vue frontend build; they are deployed as separate containers.

## Deployment

- CI: GitHub Actions (`.github/workflows/master.yml`) — on push to master: yarn build → Docker image → deploy webhook
- Docker: `Dockerfile` builds the frontend into an nginx image; `docker-compose.yml` orchestrates frontend + backend + agent + algorithm services
- The frontend nginx serves on ports 80/443 and reverse-proxies to backend services

## Code Style

- ESLint: `plugin:vue/strongly-recommended` + `@vue/standard`
- No semicolons, single quotes, no trailing commas
- Commit messages follow Conventional Commits: `feat|fix|docs|style|refactor|test|chore|revert`
- Husky + lint-staged for pre-commit checks
