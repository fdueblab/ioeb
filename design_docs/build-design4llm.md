# 仿真构建 · 当前接口契约

更新：2026-06-21。本文是 LLM/工程协作者修改仿真构建时的当前契约。产品与研究叙事见同目录其它文档。

## 一、仓库职责

| 仓库 | 职责 |
| --- | --- |
| ioeb | Vue 2 前端，负责画布、仿真构建面板、临时 JSON/摘要展示 |
| Micro-Agent | FastAPI，负责 LLM+MCP 构建、BuildBundle 落盘、artifact 运行、实验 runner |
| external-mcp | 本地实验 MCP 服务集合 |
| ioeb_backend | 系统后端，当前不参与仿真构建、不写 artifact、不写实验结果 |

调用关系：

```text
ioeb 系统功能      -> VUE_APP_API_BASE_URL   -> ioeb_backend
ioeb 仿真构建      -> VUE_APP_AGENT_BASE_URL -> Micro-Agent
Micro-Agent 真实调用 -> 本地/远程 MCP 服务
```

当前本地默认端口：Micro-Agent `9017`，ioeb `6173`。

## 二、Micro-Agent 关键文件

| 文件 | 作用 |
| --- | --- |
| `api/routes/simulation.py` | `/api/simulation/*` 路由；start/stream/build/run/experiment |
| `micro_agent/simulation/orchestrator.py` | 想定解析、catalog 内服务选择、MCP 注册、ReAct 慢模式、Verifier 循环 |
| `micro_agent/simulation/logging_mcp_tool.py` | 真实 MCP 工具调用记录 |
| `micro_agent/simulation/sandbox_tool.py` | demo fake MCP/SandboxTool 调用记录 |
| `micro_agent/simulation/trace_records.py` | `tool_call_record` 事件和 trace metadata |
| `micro_agent/simulation/build_bundle.py` | BuildBundle 保存/读取 |
| `micro_agent/simulation/artifact_compiler.py` | trace -> ServiceSelectionReport / AcceptedTrajectory / MetaAppArtifact / frontend_state |
| `micro_agent/simulation/artifact_runtime.py` | GoldenPath replay + fallback 慢模式 + Eval-time Verifier |
| `micro_agent/simulation/experiments.py` | `real_mcp_reuse` baseline runner |

## 三、ioeb 关键文件

| 文件 | 作用 |
| --- | --- |
| `src/api/simulation_builder.js` | 仿真构建 API/SSE 客户端；按 appName 分流 inmemory demo 或 Micro-Agent |
| `src/components/ef/simulation_builder.vue` | 主仿真构建面板；读取 trace/evidence summary/artifact，展示临时 JSON/摘要 |
| `src/components/ef/meta_app_build/MetaAppConfigDetail.vue` | 预发布/构建详情中的产物摘要展示 |
| `src/components/ef/meta_app_build/SimulationDetailSidebar.vue` | 构建详情侧栏 |
| `src/mock/services/simulation_builder_inmemory.js` | 课题演示进程内 mock 流 |
| `src/mock/data/topic_simulation_artifacts.js` | 课题演示产物合成；仍可能是旧演示形状，不计入真实链路 |

## 四、Start 请求

`POST {VUE_APP_AGENT_BASE_URL}/api/simulation/start`

```ts
interface SimulationStartRequest {
  appId?: string
  appName?: string
  domain?: string
  serviceIds?: string[]
  servicesMeta?: Record<string, any>[]
  maxIterations?: number
  scenarioDescription?: string
  scenarioSummary?: string
  scenarioParsed?: Record<string, any>
  mode?: 'production' | 'research' | string
  strategy?: Record<string, any>
}
```

返回：

```json
{
  "success": true,
  "sessionId": "build-...",
  "buildId": "build-...",
  "streamUrl": "/api/simulation/build-.../stream",
  "buildRef": {
    "manifestUrl": "/api/simulation/builds/build-.../manifest",
    "traceUrl": "/api/simulation/builds/build-.../trace",
    "serviceSelectionUrl": "/api/simulation/builds/build-.../service-selection",
    "acceptedTrajectoryUrl": "/api/simulation/builds/build-.../accepted-trajectory",
    "artifactUrl": "/api/simulation/builds/build-.../artifact",
    "frontendStateUrl": "/api/simulation/builds/build-.../frontend-state",
    "runUrl": "/api/simulation/builds/build-.../run",
    "experimentUrl": "/api/simulation/builds/build-.../experiments/run"
  }
}
```

## 五、SSE 事件

`GET {VUE_APP_AGENT_BASE_URL}/api/simulation/{buildId}/stream`

当前前端监听：

```text
step
scenario_parsed
service_selection
service
progress
iteration
phase
service_calling
planner_decision
verifier_result
issue
log
metrics
complete
```

典型真实顺序：

```text
scenario_parsed?
step(service matching)
service_selection
service*
step(environment)
progress*
step(intelligent build)
iteration/phase/log/service_calling/planner_decision/verifier_result
issue? + retry iteration*
step(generation)
complete
```

注意：当前后端在 SSE generator `finally` 中保存 BuildBundle，因此 `complete` 到达后 bundle 可能尚未完全稳定可读。前端当前用读取重试规避。

## 六、BuildBundle 读取

新 URL：

```text
GET /api/simulation/builds
GET /api/simulation/builds/{buildId}/manifest
GET /api/simulation/builds/{buildId}/trace
GET /api/simulation/builds/{buildId}/service-selection
GET /api/simulation/builds/{buildId}/accepted-trajectory
GET /api/simulation/builds/{buildId}/artifact
GET /api/simulation/builds/{buildId}/frontend-state
```

当前 ioeb 仍调用部分旧展示 URL，但这些 URL 只读取新 BuildBundle：

```text
GET  /api/simulation/{buildId}/trace
POST /api/simulation/{buildId}/evidence
GET  /api/simulation/{buildId}/artifact
GET  /api/simulation/{buildId}/frontend-state
POST /api/simulation/{buildId}/artifact
```

`POST /evidence` 当前返回 `build_evidence_summary.v1` 派生摘要，不运行旧 trace_evidence pipeline。

## 七、Artifact 运行

`POST /api/simulation/builds/{buildId}/run`

```json
{
  "message": "当前用户任务",
  "preferGoldenPath": true
}
```

返回：

```json
{
  "schemaVersion": "artifact_run_result.v1",
  "artifactId": "app-...",
  "mode": "golden_path | slow_mode | slow_mode_after_fallback",
  "success": true,
  "fastPathSuccess": true,
  "fallbackUsed": false,
  "fastPathError": null,
  "latencyMs": 0,
  "result": {},
  "bindingPlan": {},
  "toolCalls": []
}
```

## 八、实验入口

```text
GET  /api/simulation/experiments/runners
POST /api/simulation/builds/{buildId}/experiments/run
```

`POST /experiments/run` body：

```json
{
  "tasks": [{"taskId": "t1", "message": "..."}],
  "baselines": ["no_reuse", "raw_trace_prompt", "workflow_memory", "golden_path"]
}
```

实验结果写入 MicroAgent 本地 BuildBundle 的 `experiment/latest_result.json`，不写 ioeb_backend。

## 九、真实/演示分流

- 展示名含“课题”：ioeb 走进程内 inmemory demo。
- 展示名含 `【本地MCP】(n)` 或其它真实路径：ioeb 走 Micro-Agent。
- `VUE_APP_LOCAL_MCP_REWRITE=true` 是已有本地开发逻辑，用于把 `fdueblab.cn/mcp-proxy/PORT` 改写为本机同端口；不是本次新机制。

demo/fake MCP 不计入 researchEligible。

## 十、运行命令

Micro-Agent：

```bash
cd /home/lyx/workspace/fdueblab/Micro-Agent
.venv/bin/uvicorn api.app:app --host 127.0.0.1 --port 9017 --reload
```

ioeb：

```bash
cd /home/lyx/workspace/fdueblab/ioeb
npm run serve -- --port 6173 --host 127.0.0.1
```

健康检查：

```bash
curl http://127.0.0.1:9017/docs
curl http://127.0.0.1:9017/api/simulation/experiments/runners
curl http://127.0.0.1:6173/
```
