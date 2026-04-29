# 仿真构建 · 后端接入（LLM 契约）

> **本文目的**：当你（LLM / AI 助手）需要**修改、扩展或调试**仿真构建系统时，阅读本文即可理解**所有接口约定和代码位置**。
>
> 产品叙事见 `design_docs/simulation-build-design.md`。本文约定 **HTTP + SSE**；**不要求**实现领域知识增强（`domainKnowledge` 原样收、可选回传；`enhancements` 可省略或 `[]`）。

---

## 1. 三仓库职责

| 仓库 | 技术栈 | 职责 |
|------|--------|------|
| **ioeb**（前端） | Vue 2 | 系统 UI、画布编辑、仿真面板（`simulation_builder.vue`）、对话（`smart_chat.vue`） |
| **ioeb_backend** | Flask | **系统后端**：用户、微服务、字典等。**不参与仿真构建与研究功能** |
| **Micro-Agent** | FastAPI | **Agent 服务 + 仿真构建**：双 Agent（Planner/Verifier）、轨迹持久化、SSE 事件流 |

**调用关系**

- **系统 API** → `VUE_APP_API_BASE_URL` → **ioeb_backend**（axios `request`）
- **仿真构建 + 智能体** → `VUE_APP_AGENT_BASE_URL` → **Micro-Agent**（`fetch` / `EventSource`），**与 ioeb_backend 解耦**

---

## 2. 仿真构建架构

### 2.1 Micro-Agent 侧

| 模块 | 路径 | 说明 |
|------|------|------|
| `SimulationOrchestrator` | `micro_agent/simulation/orchestrator.py` | 4 阶段编排器，Phase 2 使用 Planner + Verifier 双 Agent |
| `TraceStore` / `FileTraceStore` | `micro_agent/simulation/trace_store.py` | 轨迹持久化接口 + JSON 文件实现 |
| 仿真路由 | `api/routes/simulation.py` | `POST /start`、`GET /{id}/stream`、`POST /{id}/cancel`、`GET /records`、`POST /records/compare` |

**Planner Agent**：注册 `SimulatedMCPTool`（mock），按服务列表逐一调用，产出执行轨迹。

**Verifier Agent**：审查 Planner 轨迹，判断完整性和正确性。不通过则反馈问题，Planner 重新执行。

**SimulatedMCPTool**：当前为 mock 实现，返回结构化模拟数据。后续替换为真实 MCP 只需改 `orchestrator._build_planner()` 中的 tool 注册逻辑。

### 2.2 前端侧

| 文件 | 变更 |
|------|------|
| `src/api/simulation_builder.js` | `SIMULATION_USE_MOCK = false`；HTTP 客户端 URL 改指 `AGENT_BASE_URL` |
| `src/components/ef/smart_chat.vue` | 新增 `agentSessionId`，支持多轮对话 session |
| `src/utils/request.js` | `streamAgent` 新增 `onSessionInfo` 回调，捕获 session_id |

### 2.3 环境变量

| 变量 | 用途 |
|------|------|
| `VUE_APP_API_BASE_URL` | axios `request` → ioeb_backend（用户、字典等系统功能） |
| `VUE_APP_AGENT_BASE_URL` | 仿真构建 + 智能体 → Micro-Agent（仿真 SSE、Agent 推理） |

---

## 3. HTTP 路径与方法

所有仿真接口均在 Micro-Agent 上，前缀 `VUE_APP_AGENT_BASE_URL`：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/simulation/start` | body 见 §4；返回 `{ success, sessionId, streamUrl }` |
| GET | `/api/simulation/{sessionId}/stream` | SSE 命名事件流（EventSource 兼容） |
| POST | `/api/simulation/{sessionId}/cancel` | 取消；流内尽快发 `complete` 且 `cancelled: true` |
| GET | `/api/simulation/records` | 历史轨迹列表 |
| POST | `/api/simulation/records/compare` | body `{ recordIds: string[] }` |

---

## 4. `POST .../start` body

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

---

## 5. SSE 事件

- `Content-Type: text/event-stream`；UTF-8
- SSE **`event:` 具名事件**；`data:` **单行** JSON
- 事件名：`step` `iteration` `phase` `issue` `service` `log` `metrics` `progress` `complete`
- **最后一条须为 `complete`**，然后关流

| event | payload |
|-------|---------|
| `step` | `{ step: 0..3, name: string }` |
| `iteration` | `{ iteration: number, status: 'running'\|'retry'\|'passed'\|'failed' }` |
| `phase` | `{ phase: 'data'\|'logic'\|'check', status: 'running'\|'done' }` |
| `issue` | `{ message: string, fix?: string }` |
| `service` | `{ id: string, status: string, latency?: number }` |
| `log` | `{ level: string, message: string }` |
| `metrics` | `{ metric: string, value: number }` |
| `progress` | `{ ctx: 'env'\|'generate', index: number, text: string, active?: boolean, done?: boolean }` |
| `complete` | 见 §6 |

**推荐顺序**：`step:0` → `service`/`log` → `step:1` → `progress(env*)` → `step:2` → `iteration` → `phase` → `iteration` → `step:3` → `progress(generate*)` → 可选 `metrics*` → **`complete`**。

**实际事件流示例**（1 个服务、1 轮、生产模式）：

```
event: step
data: {"step": 0, "name": "服务匹配"}

event: log
data: {"level": "INFO", "message": "检测服务: 数据采集服务"}

event: service
data: {"id": "s1", "status": "online", "latency": 120}

event: step
data: {"step": 1, "name": "环境准备"}

event: progress
data: {"ctx": "env", "index": 0, "text": "初始化仿真运行时", "active": true}

event: progress
data: {"ctx": "env", "index": 0, "text": "初始化仿真运行时", "done": true}

event: step
data: {"step": 2, "name": "智能构建"}

event: iteration
data: {"iteration": 1, "status": "running"}

event: phase
data: {"phase": "data", "status": "running"}

event: log
data: {"level": "INFO", "message": "规划 Agent 执行中…"}

event: log
data: {"level": "INFO", "message": "[Planner] think: 分析服务调度方案…"}

event: phase
data: {"phase": "data", "status": "done"}

event: phase
data: {"phase": "check", "status": "running"}

event: log
data: {"level": "INFO", "message": "验证 Agent 执行中…"}

event: phase
data: {"phase": "check", "status": "done"}

event: iteration
data: {"iteration": 1, "status": "passed"}

event: step
data: {"step": 3, "name": "方案生成"}

event: progress
data: {"ctx": "generate", "index": 0, "text": "编译执行方案", "done": true}

event: complete
data: {"success": true, "metrics": {"iterations": 1, "elapsedMs": 3200}, "result": {"executionPath": ["用户输入", "数据采集服务", "输出结果"], "appName": "测试"}}
```

---

## 6. `complete` 与轨迹持久化

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
  result?: {
    executionPath?: string[]
    strategy?: object
    appName?: string
    domain?: string
    error?: string
    suggestion?: string
  }
}
```

仿真完成后，`FileTraceStore` 自动将完整事件序列 + 元数据写入 `data/traces/{sessionId}.json`。

---

## 7. 多轮对话（smart_chat）

`smart_chat.vue` 通过 `streamAgent('/api/agent/mcp_service_recommendation', ...)` 与 Micro-Agent 交互。新增 session 支持：

1. 首次请求不带 `session_id`，Micro-Agent 返回 `{status: "components", session_id: "xxx"}` 事件
2. 前端通过 `onSessionInfo` 回调捕获并存储 `agentSessionId`
3. 后续请求 FormData 中附带 `session_id`，Agent 从 `FileMemory` 恢复上下文

---

## 8. `domain` 枚举

`generic` `aircraft` `health` `agriculture` `evtol` `ecommerce` `homeAI` `aml`；未知按 `generic`。

---

## 9. 代码修改速查

> LLM 接到任务后，按此表定位需要修改的文件。

| 修改意图 | 涉及文件（Micro-Agent） | 涉及文件（ioeb 前端） |
|----------|------------------------|---------------------|
| 修改 Planner/Verifier 的 prompt | `micro_agent/simulation/orchestrator.py` → `_planner_system_prompt()`, `_build_verifier()` | — |
| 替换 mock 工具为真实 MCP | `orchestrator.py` → `_build_planner()` 中 `SimulatedMCPTool` → `MCPAgent.connect()` | — |
| 增加新 SSE 事件类型 | `orchestrator.py` → `yield SimulationEvent("新类型", {...})` | `simulation_builder.vue` → `subscribeSimulationStream` 里增加 handler |
| 修改轨迹存储格式/后端 | `micro_agent/simulation/trace_store.py` → `FileTraceStore`（或新建实现类） | — |
| 添加新仿真端点 | `api/routes/simulation.py` | `src/api/simulation_builder.js` |
| 修改策略配置选项 | `orchestrator.py` → `__init__` 和对应 phase | `simulation_builder.vue` → 策略面板 |
| 多轮对话 / session | `api/routes/agent.py` → `build_agent(enable_session=True, session_id=...)` | `smart_chat.vue` → `agentSessionId` |

### 9.1 运行方式

```bash
# Micro-Agent（FastAPI）
cd Micro-Agent && source .venv/bin/activate
cp .env.example .env  # 填入 LLM_API_KEY
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload

# ioeb_backend（Flask）
cd ioeb_backend && source .venv/bin/activate
# 环境变量：FLASK_DEBUG=1, DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
python wsgi.py

# ioeb（Vue）
cd ioeb && nvm use && npm run serve
# .env.development.local 中 VUE_APP_AGENT_BASE_URL=http://localhost:8000
```
