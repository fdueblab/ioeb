# 仿真构建 · 后端接入（LLM 契约）

产品叙事见 `design_docs/simulation-build-design.md`。本文约定 **HTTP + SSE**；**不要求**实现领域知识增强（`domainKnowledge` 原样收、可选回传；`enhancements` 可省略或 `[]`）。

---

## 1. 双后端仓库与职责（与当前部署一致）

| 仓库 | 技术栈 | 职责 |
|------|--------|------|
| [**ioeb_backend**](https://github.com/fdueblab/ioeb_backend) | Flask，`app/api` / `app/services` / `app/repositories` | **系统后端**：用户、微服务、算法微服务化、字典等。**当前代码库中不包含对 Micro-Agent 的调用**；仿真构建若接入真实 `/api/simulation/*`，会话与 SSE 由本服务（或网关）提供。Swagger 常见 `/api/docs`，开发端口多为 **5000**。 |
| [**Micro-Agent**](https://github.com/fdueblab/Micro-Agent) | FastAPI，`uvicorn api.app:app`，**8010**，**`/docs`** | **Agent 服务**：Skills、RAG、MCP、任务流等。**与现有「智能体」能力一致：由浏览器直接请求**，不经 ioeb_backend 转发。 |

**调用关系（事实）**

- **系统 API**（含未来的 `VUE_APP_API_BASE_URL` + `/api/simulation/*`）→ **ioeb_backend**（axios `request`）。
- **智能体 / LLM 流式能力** → **`VUE_APP_AGENT_BASE_URL` + `/api/agent/...`**（`fetch`/`streamAgent`），**与 ioeb_backend 解耦**。

**与本页契约的关系**：`/api/simulation/*` 描述的是 **会话与进度 SSE**（可先做规则/占位实现）；若要将「调度规划 / 验证」等步骤接到 **真实 Micro-Agent 任务**，与站内其它智能体相同，宜在 **前端** 增加对 Micro-Agent 的调用（见 §3.2），而不是假定 **ioeb_backend 已代理 Agent**。

---

## 2. 本前端仓库中的对接证据（实现时必须与此一致）

### 2.1 环境变量（`.env.development` 等）

| 变量 | 用途 |
|------|------|
| `VUE_APP_API_BASE_URL` | axios `request` 的 `baseURL`；**仿真构建会话** 使用 `src/api/simulation_builder.js` 中对该常量的拼接（见下）。 |
| `VUE_APP_AGENT_BASE_URL` | **智能体直连 Micro-Agent**：`streamAgent` / `callAgentApi` / `streamLLMChat`（`src/utils/request.js`），路径为 **`/api/agent/...`**。与画布同页的 MCP 推荐、元应用运行等均走此 base，**不经 ioeb_backend**。 |

**仿真构建组件**（`simulation_builder.vue`）当前 **未** `import streamAgent`；进程内 mock 不访问 Agent。若产品要在「非演示」路径中接入真实 Agent，与现有模式一致：**在前端**对 `VUE_APP_AGENT_BASE_URL` 发请求（例见 §3.2）。

### 2.2 仿真会话 HTTP/SSE（`simulation_builder.js`，必须与后端路由一致）

源码：`src/api/simulation_builder.js`，`SIMULATION_USE_MOCK === false` 时：

```text
POST   ${VUE_APP_API_BASE_URL}/api/simulation/start
POST   ${VUE_APP_API_BASE_URL}/api/simulation/{sessionId}/cancel
GET    ${VUE_APP_API_BASE_URL}/api/simulation/{sessionId}/result
GET    ${VUE_APP_API_BASE_URL}/api/simulation/records
POST   ${VUE_APP_API_BASE_URL}/api/simulation/records/compare
GET    EventSource: ${VUE_APP_API_BASE_URL}${streamUrl}   // streamUrl 多为 `/api/simulation/{id}/stream`
```

**路径注意**：若 `VUE_APP_API_BASE_URL` 已带后缀 `/api`（例如 `https://host/api`），则最终路径会出现 **`/api/api/simulation/...`**。接入时二选一对齐：**(a)** 网关/Flask 按实际完整 URL 注册；**(b)** 或把 `VUE_APP_API_BASE_URL` 改为不含末尾 `/api` 的根（如 `https://host`），或改前端 `simulation_builder.js` 中拼接串去掉一层 `/api`（仅此文件）。

### 2.3 响应形状（axios）

`request` 响应拦截器返回 **`response.data`**（`src/utils/request.js`）。故 **`POST .../start`** 的 JSON **体顶层**须含 `success`、`sessionId`、`streamUrl`，**不要**再包一层 `{ data: { ... } }`（除非你们统一改前端拦截器）。

---

## 3. 在哪里实现（给 LLM 的落地清单）

### 3.1 **ioeb_backend**：仅实现下文 **§5～§8** 的 `/api/simulation/*`

在 [**ioeb_backend**](https://github.com/fdueblab/ioeb_backend) 中新增与 **§2.2 URL** 完全一致的路由（与 `app/api/namespaces/*_ns.py` 模式一致）：

| 建议位置 | 内容 |
|----------|------|
| `app/api/namespaces/simulation_ns.py`（或等价蓝图） | `POST /api/simulation/start`、`GET .../stream`（SSE）、`POST .../cancel`、`GET .../result`、`GET .../records`、`POST .../records/compare`。 |
| `app/services/simulation_service.py`（新） | 会话表、取消标志、按 **§7～§8** 推送事件与 **§5** 路径约定；**不负责**调用 Micro-Agent（与当前架构一致）。 |

**会话与 SSE**：内存即可联调；`streamUrl` 建议相对路径 `/api/simulation/{sessionId}/stream`。

### 3.2 **Micro-Agent**：由前端直连（与现有智能体一致）

**当前 ioeb_backend 不调用 Micro-Agent**；站内智能体均为 **浏览器 → `VUE_APP_AGENT_BASE_URL` → `/api/agent/...`**，例如：

| 文件 | 说明 |
|------|------|
| `src/components/ef/smart_chat.vue` | `streamAgent('/api/agent/mcp_service_recommendation', formData, …)` |
| `src/components/ef/meta_app_builder.vue` | `url = '/api/agent/meta_app/run'`（经同目录内封装请求） |
| `src/views/vertical/user/useMetaApp.vue` 等 | `streamAgent('/api/agent/meta_app/run', …)` |
| `src/views/vertical/ms/GenericMicroService.vue` | `streamAgent('/api/agent/code_analysis' \| 'service_packaging', …)` 等 |

仿真构建若需 **真实 Agent 推理**，扩展方式应为：**在 `simulation_builder.vue`（或子模块）中** 增加对上述模式的调用，或新增 Micro-Agent 任务后在 **前端** 触发；**不是**在 ioeb_backend 内新增对 Agent 的 HTTP 客户端（除非产品另行改版）。

Micro-Agent 仓库内任务定义、端口、`/docs` 见各自 README。

### 3.3 网关（如 fdueblab.cn）

- **`VUE_APP_API_BASE_URL`** → 反代到 **ioeb_backend**（Flask）。
- **`VUE_APP_AGENT_BASE_URL`** → 反代到 **Micro-Agent**（`/api/agent/*` 等）。
- `EventSource` 无法自定义 Header：同域 Cookie 或 `streamUrl` query token。

---

## 4. 前端开关

`src/api/simulation_builder.js`：`SIMULATION_USE_MOCK = false` 时走真实 HTTP+SSE；`true` 时用 `src/mock/services/simulation_builder_inmemory.js`（黄金顺序见该文件 `runStream`）。

---

## 5. HTTP 路径与方法

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/simulation/start` | body 见 §6；返回 `{ success, sessionId, streamUrl, error? }` |
| GET | `/api/simulation/{sessionId}/stream` | SSE，须与 `start` 返回的 `streamUrl` 一致 |
| POST | `/api/simulation/{sessionId}/cancel` | 取消；流内尽快发 `complete` 且 `cancelled: true` |
| GET | `/api/simulation/{sessionId}/result` | 终态，可与 `complete.result` 同形 |
| GET | `/api/simulation/records` | 研究模式记录列表 |
| POST | `/api/simulation/records/compare` | body `{ recordIds: string[] }` |

---

## 6. `POST .../start` body（与 `simulation_builder.vue` → `buildStartPayload` 一致）

```typescript
interface StartSimulationRequest {
  appId: string
  appName: string
  domain: string
  domainKnowledge: object
  serviceIds: string[]
  servicesMeta: { id: string; name: string }[]
  maxIterations: number
  scenarioDescription: string
  mode: 'production' | 'research'
  strategy?: {
    sandbox: 'cow' | 'none' | 'full_mock'
    planning: 'llm_autonomous' | 'preset_workflow'
    verification: 'multi_agent' | 'single_agent' | 'rule_based'
    repair: 'llm_repair' | 'rule_repair' | 'none'
    solidify: 'golden_trace' | 'replan' | 'static'
  }
}
```

```typescript
interface StartSimulationResponse {
  success: boolean
  sessionId: string
  streamUrl: string
  error?: string
}
```

---

## 7. SSE

- `Content-Type: text/event-stream`；UTF-8。
- SSE **`event:` 具名事件**；`data:` **单行** JSON。
- 事件名：`step` `iteration` `phase` `issue` `service` `log` `metrics` `progress` `complete`
- **最后一条须为 `complete`**，然后关流。

| event | payload |
|-------|---------|
| `step` | `{ step: 0..3, name: string }` |
| `iteration` | `{ iteration: number, status: 'running'\|'retry'\|'passed'\|'failed' }` |
| `phase` | `{ phase: 'data'\|'logic'\|'check', status: 'running'\|'done' }` |
| `issue` | `{ message: string, fix?: string, type?: string }` |
| `service` | `{ id: string, status: string, latency?: number }` |
| `log` | `{ level: string, message: string }` |
| `metrics` | `{ metric: string, value: number, module?: string }` |
| `progress` | `{ ctx: 'env'\|'generate', index: number, text: string, active?: boolean, done?: boolean }` |
| `complete` | 见 §8 |

**推荐顺序**（对齐 mock）：`step:0` → `service`/`log` → `step:1` → `progress(env*)` → `step:2` → `iteration` → `phase` → `iteration` → `step:3` → `progress(generate*)` → 可选 `metrics*` → **`complete`**。参考 `src/mock/services/simulation_builder_inmemory.js` → `runStream`。

**取消**：`complete` 带 `{ success: false, cancelled: true, metrics?, result? }`。

---

## 8. `complete` 与 `result`

```typescript
interface CompleteEvent {
  success: boolean
  cancelled?: boolean
  metrics?: {
    iterations: number
    elapsedMs: number
    sandboxFidelity?: number
    planningAccuracy?: number
    verificationAccuracy?: number
    repairEffectiveness?: number
  }
  result?: object
}
```

前端会读 `result.executionPath`、`result.error`、`result.suggestion`。**`enhancements`**：`{ stage, promptFragment, sections }[]`，可省略或 `[]`。

---

## 9. `domain` 枚举

`generic` `aircraft` `health` `agriculture` `evtol` `ecommerce` `homeAI` `aml`；未知宜按 `generic`。
