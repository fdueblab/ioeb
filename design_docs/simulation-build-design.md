# 元应用想定式仿真构建设计

更新：2026-06-22。本文描述当前 BuildBundle / MetaAppArtifact v1 实现。

## 一、系统定位

目标：从用户想定和已知 MCP 服务池出发，构建一个任务级最小元应用，并为同一元应用内部的简单任务提供可复用 GoldenPath 快路径。

完整系统逻辑：

```text
算法/模型想定式生成
-> 标准 MCP 服务封装
-> 从既有 MCP 服务池选择与组合服务
-> 元应用想定式仿真构建
-> 后续多元应用/多智能体系统组合
```

本文只覆盖“元应用想定式仿真构建”。算法开发、MCP 自动封装、服务池数据库管理属于其它模块。

## 二、第一性原理对象边界

当前实现不靠末端 gate 补丁制造语义，而是用对象边界区分事实、解释、中间数据和产物：

```text
BuildTrace             完整事实链，本地中间数据
tool_call_record       唯一调用事实源
ServiceSelectionReport 构建期服务选择解释，本地中间数据
AcceptedTrajectory     Verifier 接受的最终成功主干，本地中间数据
MetaAppArtifact        最小可运行元应用产物
ExperimentRun          本地科研实验结果
```

最终 `MetaAppArtifact` 是最小运行闭包，只保留 `app`、`taskContract`、`runtime`、`goldenPaths` 四类运行必需信息；不包含 trace、service selection、accepted trajectory、verifier refs、experiment result、产物哈希反向引用。完整详情入口展示的是 BuildBundle 视图，不等于把这些中间数据写进 artifact。

## 三、当前真实流程

```text
ioeb start
-> MicroAgent scenario parse
-> LLM 在传入 catalog 内做服务选择
-> 注册真实 MCP 或 demo SandboxTool
-> ReAct 慢模式 Agent 调用工具
-> Verifier 审查并驱动迭代修正
-> 保存 BuildTrace
-> 编译 ServiceSelectionReport / AcceptedTrajectory / MetaAppArtifact / frontend_state
-> ioeb 临时展示 JSON/摘要
-> /run 可运行 artifact
-> /experiments/run 可跑本地 baseline
```

### 服务选择

当前只在请求传入的 `servicesMeta` catalog 内做 LLM 选择。它不是后端服务池自动发现，也不是跨库检索。

输出为 `service_selection.json`，不进入 artifact。

### 慢模式

慢模式保留 ReAct/tool-calling 探索范式。Planner 不先生成完整 step graph，而是在工具调用过程中形成轨迹，最终由 Verifier 判断是否通过。

### Verifier

构建期 Verifier 是最终裁判。只有最终 PASSED iteration 的业务 tool call 会进入 AcceptedTrajectory；失败尝试留在 BuildTrace 中。

当前 Verifier 的通过条件是“任务目标、关键服务、数据流和调用顺序看起来成立”，不是“轨迹已经最短/最优”。因此 AcceptedTrajectory 表示被接受的成功主干，不等价于优化后的主干；无效重复调用、参数试错、discover/schema 探索等剪枝应在后续 `OptimizedTrajectory`/GoldenPath 编译阶段处理，而不应由前端展示层伪装成已优化。

### GoldenPath

GoldenPath 是单个 MetaApp 内部的快路径资产。运行时 LLM 判断当前任务是否适用，并生成 BindingPlan；确定性 executor 执行；失败则回退慢模式。

当前 GoldenPath 主要支持最小 replay，泛化数据流仍是后续研究重点。

## 四、当前工程状态

| 能力 | 当前状态 |
| --- | --- |
| 平台入口 | ioeb 可调用 MicroAgent start/stream，展示构建阶段 |
| 真实 MCP | MicroAgent 可通过 SSE/HTTP/stdio 配置注册真实 MCP；失败时按策略可能回退 SandboxTool |
| BuildBundle | 按 build 目录保存 trace、selection、accepted trajectory、artifact、frontend state |
| MetaAppArtifact | v1 最小运行产物，可通过 `/run` 本地运行 |
| GoldenPath | 已支持 replay + fallback 慢模式；单次 medical-calc smoke run 验证过成功路径 |
| 实验 runner | 四个 baseline 名称与 runner 入口已实现，批量实验还未完成 |
| ioeb 展示 | 临时摘要/JSON 展示；不改 ioeb_backend |

## 五、前端展示设计

当前前端不做正式产物 UI，只证明对象存在：

- 构建阶段和日志：SSE 驱动。
- Trace：展示调用链和原始 JSON 预览。
- Evidence summary：读取 MicroAgent 从 BuildBundle 派生的 `build_evidence_summary.v1`。
- Artifact：展示 `MetaAppArtifact v1` 摘要与 JSON。
- 预发布页：展示 service bindings、GoldenPath steps、assertions 的摘要。

ioeb 中仍保留“课题”进程内 mock 路线；它用于演示，不代表真实链路和科研实验。

## 六、当前明确未实现

- CoW 沙箱读写拦截层。
- ioeb_backend artifact 入库。
- 后端服务池语义检索/自动发现。
- 批量 source-target reuse benchmark。
- 完整 token/cost/LLM call metrics。
- 强数据流依赖归纳与可执行 L2 断言。
- 成功轨迹优化：剪掉无效重复调用、失败试错、无产出的 schema/discover 探索，并保留必要证据链。
- 多 GoldenPath 管理策略。

## 七、研究目标

大论文聚焦“元应用想定式仿真构建方法及系统”：

- 从想定到元应用产物的 LLM+MCP 构建链路。
- BuildTrace/AcceptedTrajectory/MetaAppArtifact 分层对象模型。
- 快慢模式运行与可复用 GoldenPath。
- 平台展示与科研实验双入口系统。

小论文优先聚焦“轨迹固化、复用、优化”：

- 从成功 ReAct 轨迹固化为 verified executable artifact。
- 在固化前识别并压缩无效重复调用和试错片段，比较 raw accepted trajectory 与 optimized trajectory 的调用数、延迟和成功率。
- 对比 no reuse、raw trace prompt、workflow memory、golden path。
- 指标包括成功率、延迟、成本、MCP 调用数、fallback 率、Verifier 通过率和错误类型。

## 八、下一步工程顺序

1. 固定真实 MCP 任务集，重复构建与运行。
2. 批量跑四个 baseline，输出 JSONL/CSV。
3. 构造 GoldenPath 失败用例，验证 fallback 慢模式。
4. 增强 BindingPlan 与 L2 数据流断言。
5. 增加轨迹优化编译阶段，先处理重复调用、失败试错和无效 discover/schema 探索。
6. 等 ioeb_backend 阶段再设计正式持久化。

## 九、代码定位

接口契约见 `design_docs/build-design4llm.md`。

MicroAgent 关键文件：

- `api/routes/simulation.py`
- `micro_agent/simulation/orchestrator.py`
- `micro_agent/simulation/artifact_compiler.py`
- `micro_agent/simulation/build_bundle.py`
- `micro_agent/simulation/artifact_runtime.py`
- `micro_agent/simulation/experiments.py`

ioeb 关键文件：

- `src/api/simulation_builder.js`
- `src/components/ef/simulation_builder.vue`
- `src/components/ef/meta_app_build/MetaAppConfigDetail.vue`
- `src/components/ef/meta_app_build/SimulationDetailSidebar.vue`
- `src/mock/services/simulation_builder_inmemory.js`
