# 仿真构建 · 后端接入（LLM 契约）

产品叙事见 `docs/dev/simulation-build-design.md`。本文只约定 **HTTP + SSE**；**不要求**实现领域知识增强（`domainKnowledge` 原样收、可选回传；`enhancements` 可省略或 `[]`）。

**前端切真实后端**：`src/api/simulation_builder.js` 设 `SIMULATION_USE_MOCK = false`；Base `VUE_APP_API_BASE_URL`。axios 拦截器返回 `response.data`，故 **`/start` 响应体顶层**须含 `success`、`sessionId`、`streamUrl`（勿多套一层 `data`）。SSE 用 `EventSource`，**不能带自定义 Header** → 同域 Cookie 或 `streamUrl` query token。

---

## HTTP

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/simulation/start` | body 见下表；返回 `{ success, sessionId, streamUrl, error? }` |
| GET | `/api/simulation/{sessionId}/stream` | SSE，路径须与 `streamUrl` 一致 |
| POST | `/api/simulation/{sessionId}/cancel` | 取消；流内尽快发 `complete` 且 `cancelled: true` |
| GET | `/api/simulation/{sessionId}/result` | 终态，可与 `complete.result` 同形 |
| GET | `/api/simulation/records` | 研究模式记录列表 |
| POST | `/api/simulation/records/compare` | body `{ recordIds: string[] }` |

---

## `POST .../start` body（与 `simulation_builder.vue` → `buildStartPayload` 一致）

```typescript
interface StartSimulationRequest {
  appId: string
  appName: string
  domain: string
  domainKnowledge: object   // 可不解析，仅透传/回显；常见含 summary、sections、meta、scenarioContext
  serviceIds: string[]
  servicesMeta: { id: string; name: string }[]
  maxIterations: number      // 默认约 5，上限约 8
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

**响应**：`success === false` 或缺 `sessionId` 时前端视为启动失败。

```typescript
interface StartSimulationResponse {
  success: boolean
  sessionId: string
  streamUrl: string   // 相对如 `/api/simulation/{id}/stream` 或绝对 URL
  error?: string
}
```

---

## SSE

- `Content-Type: text/event-stream`；UTF-8。
- 使用 SSE **`event:` 具名事件**（勿用默认 `message` 混传）；`data:` **单行** JSON，`JSON.parse`。
- 事件名（与 `src/api/simulation_builder.js` 中列表一致）：`step` `iteration` `phase` `issue` `service` `log` `metrics` `progress` `complete`
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
| `complete` | 见下 |

**推荐顺序**（联调参考 `src/mock/services/simulation_builder_inmemory.js` → `runStream`）：`step:0` → 若干 `service`/`log` → `step:1` → `progress(env*)` → `step:2` → `iteration(running)` → `phase` data→logic→check → `iteration(passed|…)` → `step:3` → `progress(generate*)` → 可选 `metrics*` → **`complete`**。

**取消**：`complete` 带 `{ success: false, cancelled: true, metrics?, result? }`。

---

## `complete` 与 `result`

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

前端会读 `result.executionPath`、`result.error`、`result.suggestion`。成功时可含 `executionPath: string[]`、`strategy`、`scenarioDescription`、`appName`、`domain`、`domainKnowledge`（回显）。**`enhancements`**：`{ stage, promptFragment, sections }[]`，未实现增强则省略或 `[]`。

---

## `domain` 枚举

`generic` `aircraft` `health` `agriculture` `evtol` `ecommerce` `homeAI` `aml`；未知宜按 `generic`。
