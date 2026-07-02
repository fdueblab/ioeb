# 仿真构建 · 当前接口契约

更新：2026-06-28。本文是 LLM/工程协作者修改仿真构建时的当前契约。产品与研究叙事见同目录其它文档；本地联调启停见 `~/.cursor/rules/fdueblab-local-dev.mdc`。

## 一、仓库职责

| 仓库 | 职责 |
| --- | --- |
| ioeb | Vue 2 前端，负责画布、仿真构建面板、预发布表单、临时 JSON/摘要展示 |
| Micro-Agent | FastAPI，负责 LLM+MCP 构建、BuildBundle 落盘、artifact 运行、实验 runner |
| external-mcp | 医疗 MCP 服务集合；元数据 SoT 为 `service_catalog.json` |
| ioeb_backend | 系统后端：用户/服务 CRUD；当前不承载 BuildBundle/Artifact |

调用关系：

```text
ioeb 系统功能 / prepublish -> VUE_APP_API_BASE_URL   -> ioeb_backend
ioeb 仿真构建              -> VUE_APP_AGENT_BASE_URL -> Micro-Agent
Micro-Agent 真实调用       -> 远程 MCP（mcpUrl 来自 servicesMeta / 服务库）
```

**端口（ebLab SSH 本地联调）**：ioeb `6173`，Micro-Agent `9017`，ioeb_backend `5000`（`wsgi.py` + `.env_dev` → `ioeb-dev` MySQL）。
**端口（staging/prod）**：经 nginx；Agent 容器 `8010`，backend `5000`，MCP 经 `/mcp-proxy/{port}/sse`。

## 二、Micro-Agent 关键文件

| 文件 | 作用 |
| --- | --- |
| `api/routes/simulation.py` | `/api/simulation/*` 路由；start/stream/build/run/experiment |
| `micro_agent/simulation/orchestrator.py` | 想定规范化、MCP 注册、ReAct 慢模式、Verifier 循环 |
| `micro_agent/simulation/logging_mcp_tool.py` | 真实 MCP 工具调用记录 |
| `micro_agent/simulation/sandbox_tool.py` | demo fake MCP/SandboxTool 调用记录 |
| `micro_agent/simulation/trace_records.py` | `tool_call_record` 事件和 trace metadata |
| `micro_agent/simulation/build_bundle.py` | BuildBundle 保存/读取 |
| `micro_agent/simulation/artifact_compiler.py` | trace -> AcceptedTrajectory / MetaAppArtifact |
| `micro_agent/simulation/artifact_runtime.py` | GoldenPath replay + fallback 慢模式 + Eval-time Verifier |
| `micro_agent/simulation/experiments.py` | `real_mcp_reuse` baseline runner |

## 三、ioeb 关键文件

| 文件 | 作用 |
| --- | --- |
| `src/api/simulation_builder.js` | 仿真构建 API/SSE 客户端；按 appName 分流 inmemory demo 或 Micro-Agent |
| `src/components/ef/simulation_builder.vue` | 主仿真构建面板；读取 trace/evidence summary/artifact，展示临时 JSON/摘要 |
| `src/components/ef/meta_app_build/MetaAppConfigDetail.vue` | 预发布/构建详情中的产物摘要展示 |
| `src/components/ef/meta_app_build/SimulationDetailSidebar.vue` | 构建详情侧栏 |
| `src/components/ef/meta_app_build/MetaAppPublishForm.vue` | 预发布表单 |
| `src/components/ef/meta_app_build/MetaAppBuildShell.vue` | 构建工作台壳 |
| `src/mock/services/simulation_builder_inmemory.js` | 课题演示进程内 mock 流 |
| `src/mock/data/topic_simulation_artifacts.js` | 课题演示产物合成；仍可能是旧演示形状，不计入真实链路 |

## 四、Start 请求

`POST {VUE_APP_AGENT_BASE_URL}/api/simulation/start`

```ts
interface SimulationStartRequest {
  appId?: string
  appName?: string
  domain?: string
  servicesMeta?: Record<string, any>[]
  maxIterations?: number
  scenarioDescription?: string
  scenarioParsed?: Record<string, any>
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
    "manifestUrl": "/api/simulation/build-.../manifest",
    "traceUrl": "/api/simulation/build-.../trace",
    "acceptedTrajectoryUrl": "/api/simulation/build-.../accepted-trajectory",
    "artifactUrl": "/api/simulation/build-.../artifact",
    "runUrl": "/api/simulation/build-.../run",
    "experimentUrl": "/api/simulation/build-.../experiments/run"
  }
}
```

## 五、SSE 事件

`GET {VUE_APP_AGENT_BASE_URL}/api/simulation/{buildId}/stream`

当前前端监听：

```text
step
scenario_parsed
service
iteration
phase
service_calling
planner_decision
verifier_result
issue
log
complete
```

典型真实顺序：

```text
scenario_parsed?
step(connect services)
service*
step(intelligent build)
iteration/phase/log/service_calling/planner_decision/verifier_result
issue? + retry iteration*
complete
```

后端先保存 BuildBundle/manifest，再发送 `complete`；`complete.publishable=true` 表示可以进入预发布。

## 六、BuildBundle 读取

```text
GET /api/simulation/records
GET /api/simulation/{buildId}/manifest
GET /api/simulation/{buildId}/trace
GET /api/simulation/{buildId}/accepted-trajectory
GET /api/simulation/{buildId}/artifact
POST /api/simulation/{buildId}/evidence
```

`POST /evidence` 返回 `build_evidence_summary.v1` 派生摘要。

## 七、Artifact 运行

`POST /api/simulation/{buildId}/run`

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
POST /api/simulation/{buildId}/experiments/run
```

`POST /experiments/run` body：

```json
{
  "tasks": [{"taskId": "t1", "message": "..."}],
  "baselines": ["no_reuse", "raw_trace_prompt", "workflow_memory", "golden_path"]
}
```

实验结果写入 MicroAgent 本地 BuildBundle 的 `experiment/latest_result.json`，不写 ioeb_backend。

## 九、平台持久化边界

当前预发布仍按既有元应用配置入库，不写 BuildBundle/Artifact 引用。待真实构建、运行和实验链路通过后，再给 ioeb_backend 增加独立 Artifact 表；本阶段不修改现有数据库模型。

## 十、真实/演示分流

- 展示名含「课题」：ioeb 走进程内 inmemory demo。
- 其它 health 等真实场景：ioeb 走 Micro-Agent。
- MCP 服务 URL 来自服务库 `service_apis.url`（`https://fdueblab.cn/mcp-proxy/18000–18007/sse`，见 `service_catalog.json`）。`localUrl` 仅本地批量实验直连。

demo/fake MCP 不计入 researchEligible。

## 十一、本地联调（ebLab）

**勿**在 Cursor Agent 背景 Shell 里起长驻进程（易被 SIGKILL）。在服务器上：

```bash
bash ~/workspace/fdueblab/.local-dev/server-start.sh
```

客户端 SSH 隧道（须含 **6173 + 9017 + 5000**）：

```bash
bash ~/workspace/fdueblab/.local-dev/ssh-tunnel-from-client.sh
```

浏览器 `http://127.0.0.1:6173`；env 见 `ioeb/.env.development.local`。

健康检查：

```bash
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:9017/docs
curl http://127.0.0.1:6173/
```

日志：`/tmp/fdueblab-ioeb-backend.log`、`/tmp/fdueblab-micro-agent.log`、`/tmp/fdueblab-ioeb-serve.log`。
