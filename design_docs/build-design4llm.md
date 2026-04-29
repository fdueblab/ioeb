# 仿真构建 · 后端接入（LLM 契约）

**读者**：实施改动的 LLM / 工程师。产品叙事与用户文档见 `design_docs/simulation-build-design.md`。本文约定 **HTTP + SSE**；**不要求**领域知识增强（`domainKnowledge` 原样收；`enhancements` 可省略或 `[]`）。

**硬规则（违反即前后端不一致）**：协议路径与事件名以 **§5～§8** 为准；前端何时走 HTTP 以 **§4** 为准。

---

## 1. 三仓库与职责

| 仓库 | 技术栈 | 职责 |
|------|--------|------|
| [**ioeb_backend**](https://github.com/fdueblab/ioeb_backend) | Flask，`app/api` / `app/services` / `app/repositories` | **系统后端**：用户、微服务、算法微服务化、字典等。**不包含仿真构建端点**。Swagger 常见 `/api/docs`，开发端口多为 **5000**。 |
| [**Micro-Agent**](https://github.com/fdueblab/Micro-Agent) | FastAPI，`uvicorn api.app:app`，**8010**，**`/docs`** | **Agent 服务 + 仿真构建引擎**：Skills、RAG、MCP、任务流、**`/api/simulation/*`（会话 + SSE + 研究记录）**。由浏览器直接请求，不经 ioeb_backend。 |
| [**ioeb**](https://github.com/fdueblab/ioeb) | Vue 2，前端 | **前端统一对接**：系统 API → ioeb_backend；智能体 + 仿真 → Micro-Agent。两个后端互不通信。 |

**调用关系**

- **系统 API**（`VUE_APP_API_BASE_URL`）→ **ioeb_backend**（axios `request`）。
- **智能体 / 仿真构建**（`VUE_APP_AGENT_BASE_URL`）→ **Micro-Agent**（`fetch` / `streamAgent` / `simAxios` / `EventSource`），**与 ioeb_backend 解耦**。

**仿真为什么在 Micro-Agent**：仿真构建的核心是 Agent 规划/验证 + MCP 工具调用 + CoW 沙箱拦截，这些能力全部在 Micro-Agent 的 agent 引擎与 Tool 体系内。ioeb_backend 不调用 Micro-Agent，前端统一对接两个后端。

---

## 2. 本前端仓库中的对接证据（实现时必须与此一致）

### 2.1 环境变量（`.env.development` 等）

| 变量 | 用途 |
|------|------|
| `VUE_APP_API_BASE_URL` | axios `request` 的 `baseURL`；**系统 API**（登录、字典、服务等）。 |
| `VUE_APP_AGENT_BASE_URL` | **智能体 + 仿真构建**均走此 base → Micro-Agent。`streamAgent` / `callAgentApi` / `streamLLMChat`（`src/utils/request.js`）用于 `/api/agent/...`；仿真构建 `simulation_builder.js` 用独立 `simAxios` 请求 `/api/simulation/...`。 |

### 2.2 仿真 HTTP/SSE（路径须与 Micro-Agent 路由一致）

当前端 **选用 HTTP 客户端**（判定见 **§4**）时，`src/api/simulation_builder.js` 会发起：

```text
POST   <VUE_APP_AGENT_BASE_URL>/api/simulation/start
POST   <VUE_APP_AGENT_BASE_URL>/api/simulation/{sessionId}/cancel
GET    <VUE_APP_AGENT_BASE_URL>/api/simulation/{sessionId}/result
GET    <VUE_APP_AGENT_BASE_URL>/api/simulation/records
POST   <VUE_APP_AGENT_BASE_URL>/api/simulation/records/compare
GET    EventSource: <VUE_APP_AGENT_BASE_URL>/api/simulation/{id}/stream
```

`simulationApiPath` / `resolveSimulationStreamUrl` 基于 `VUE_APP_AGENT_BASE_URL` 拼接。

### 2.3 响应形状

仿真 HTTP 客户端使用独立 `simAxios`（不经全局 `request` 拦截器），手动取 `.data`。故 **`POST .../start`** 的 JSON **体顶层**须含 `success`、`sessionId`、`streamUrl`，**不要**再包一层。

---

## 3. 在哪里实现（给 LLM 的落地清单）

### 3.1 **Micro-Agent**：仿真构建引擎

仿真构建的所有端点（§5～§8）在 [**Micro-Agent**](https://github.com/fdueblab/Micro-Agent) 中实现：

| 位置 | 内容 |
|------|------|
| `api/routes/simulation.py` | FastAPI 路由：`POST /api/simulation/start`、`GET .../stream`（SSE）、`POST .../cancel`、`GET .../result`、`GET .../records`、`POST .../records/compare`。 |
| `micro_agent/simulation/service.py` | 会话管理、SSE 事件生成。当前为占位流水线；后续替换为 SimulationAgent（Planner + Verifier + CoW 沙箱）。 |

**会话与 SSE**：内存即可联调；`streamUrl` 为相对路径 `/api/simulation/{sessionId}/stream`。

**演进路线**：
- **Week 1**（当前）：占位事件序列，验证前端 SSE 联调。
- **Week 2**：CoW 沙箱代理层（`micro_agent/tool/sandbox/`），拦截 MCP tool 读写。
- **Week 3+**：SimulationAgent（Planner / Verifier 分离）、Trace 结构化记录、轨迹编译器。

### 3.2 **ioeb_backend**：不参与仿真

ioeb_backend **不包含** `/api/simulation/*` 端点，仅负责系统 API（用户、字典、服务等）。两个后端互不通信。

### 3.3 网关（如 fdueblab.cn）

- **`VUE_APP_API_BASE_URL`** → 反代到 **ioeb_backend**（Flask）。
- **`VUE_APP_AGENT_BASE_URL`** → 反代到 **Micro-Agent**（`/api/agent/*`、**`/api/simulation/*`** 等）。
- `EventSource` 无法自定义 Header：同域 Cookie 或 `streamUrl` query token。

---

## 4. 前端：演示 vs 真实（与实现对齐）

| 项 | 约定 |
|----|------|
| 关键字 | `src/config/topicDemo.js` 导出 **`TOPIC_DEMO_KEYWORD`**（默认 **`课题`**）、**`matchesTopicDemoKeyword(text)`**。改演示口径主要改此处。 |
| 仿真 | `POST .../start` 的 body 中 **`appName`** = 画布 **当前展示名称**（`data.preName`，用户可在元应用详情里改）。**含关键字** → **进程内** `simulation_builder_inmemory.js`；**否则** → **§2.2 HTTP + SSE** 调 ioeb_backend。 |
| 会话路由 | `simulation_builder.js` 内 **`sessionUsesMemory: Map<sessionId,boolean>`**，`start` 写入，`cancel` / `subscribe teardown` 清理；`cancel`/`stream`/`result` 须与同一会话一致。 |
| 研究记录 | `fetchSimulationRecords(appName)`、`compareSimulationRecords(ids, appName)` 与仿真使用同一 **`matchesTopicDemoKeyword(appName)`**。 |
| 调度推荐 | `smart_chat.vue` 对用户 **输入** 用 **`matchesTopicDemoKeyword`**：**真** → `useFakeData`；**假** → `callAgentForRecommendation`。 |
| 仿真 UI 入口 | `panel_enhanced` **仅当 `showToolbar=true`** 显示「开始仿真构建」。`GenericSchedule` 默认 `true` 且带 `smart_chat`；**`useMetaApp`** 设 **`show-toolbar=false`**，**无仿真按钮**（使用页不测画布仿真）。 |

**LLM 自检**：改分流规则时须同时核对 **`topicDemo.js`**、**`simulation_builder.js`**、**`smart_chat.vue`**、**`panel_enhanced` 传入的 `app-name`**（须为当前展示名计算属性）。

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

---

**说明**：个人研究用的周历、操作口诀见 `design_docs/research-guide-execution-traces-to-mcp-apps.md`；**实现与联调以本文为准**。
