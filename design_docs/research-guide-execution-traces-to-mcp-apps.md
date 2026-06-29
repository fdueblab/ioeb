# 研究执行指南：轨迹固化与 MCP 元应用复用

更新：2026-06-21。本文按当前 BuildBundle/MetaAppArtifact 实现组织研究执行，不再沿用旧 CoW 沙箱周历。

## 一、研究问题

当前优先研究问题：

> 对单个元应用而言，如何把 Verifier 接受的 ReAct 工具调用轨迹固化为可复用 GoldenPath，并在后续简单任务中以快模式运行，复杂或失败时回退慢模式？

大论文覆盖整个元应用仿真构建系统；小论文先聚焦轨迹固化、复用和优化。

## 二、当前工程基础

| 基础能力 | 当前状态 |
| --- | --- |
| LLM+MCP 构建 | 已由 MicroAgent `SimulationOrchestrator` 实现 |
| Verifier 裁判 | 构建期 Verifier 决定 PASSED/FAILED |
| Trace 事实链 | BuildTrace + `tool_call_record` |
| 成功主干 | AcceptedTrajectory 从最终 PASSED iteration 提取 |
| 最小产物 | MetaAppArtifact v1 |
| 快路径运行 | GoldenPath replay + fallback 慢模式 |
| baseline runner | `real_mcp_reuse` 入口已实现 |
| 前端展示 | ioeb 临时展示 BuildBundle/Artifact 摘要 |

已验证 smoke run：`build-c731a074a75e`，medical-calc，GoldenPath replay 成功。该结果只能证明链路可跑，不证明方法效果。

## 三、实验对象

实验只使用真实、标准化 MCP 服务。demo fake MCP/进程内 mock 可用于演示，但必须排除出 researchEligible 统计。

建议先固定 medical-calc 任务集：

- AKI 肾功能评估。
- Sepsis/ICU 评分。
- GI bleed 风险评分。
- Pre-op risk 评估。
- ICU delirium/CAM-ICU 类评估。

每个任务至少记录：

```json
{
  "taskId": "aki-001",
  "message": "...",
  "expectedTools": [],
  "expectedParams": {},
  "expectedOutputTraits": [],
  "difficulty": "simple|medium|complex"
}
```

## 四、baseline 设计

当前 runner 名称：

| baseline | 运行逻辑 |
| --- | --- |
| `no_reuse` | 不注入历史材料，走慢模式 |
| `raw_trace_prompt` | 把 AcceptedTrajectory 原始 actionSequence 塞进 prompt，仍走慢模式 |
| `workflow_memory` | 把 GoldenPath steps 归纳成工作流记忆塞进 prompt，仍走慢模式 |
| `golden_path` | 先尝试 MetaAppArtifact 内部 GoldenPath，失败回退慢模式 |

注意：当前 `raw_trace_prompt` 和 `workflow_memory` 是最小实现，不代表最终强 baseline。后续可替换 runner 而不改平台入口。

## 五、评价指标

最小指标：

- `taskSuccess`
- `verifierPassed`
- `overallSuccess`
- `fastPathSuccess`
- `fallbackUsed`
- `fallbackSuccess`
- `latencyMs`
- `mcpCallCount`
- `errorType`

待补指标：

- `llmCallCount`
- `tokenUsage`
- `plannerIterations`
- 成本估算
- 服务 schema/hash drift

## 六、第一轮可执行实验步骤

1. 启动 MicroAgent、ioeb 和必要 MCP 服务。
2. 用同一 service catalog 构建 3-5 个源任务，保存 BuildBundle。
3. 对每个 BuildBundle 检查：artifact schema、service bindings、GoldenPath 是否存在。
4. 为每个源任务准备 2-3 个同元应用目标任务。
5. 调 `/api/simulation/{buildId}/experiments/run` 跑四个 baseline。
6. 导出 `experiment/latest_result.json` 为 JSONL/CSV。
7. 按 baseline 聚合成功率、延迟、调用数、fallback 率。
8. 人工抽查失败 case：BindingPlan 错误、MCP observation error、Verifier false negative、任务不适用。

## 七、消融计划

优先消融：

- 无 GoldenPath，仅慢模式。
- GoldenPath 无 `argumentTemplate`。
- GoldenPath 有模板但无 observation semantic failure 判定。
- GoldenPath 有模板但无 Eval-time Verifier。
- workflow memory vs executable artifact。
- 不同 BindingPlan prompt。

这些消融要基于真实运行结果，不要只通过删字段做 offline proxy。

## 八、论文表述边界

可以写：

- 系统实现了从 LLM+MCP 构建 trace 到 MetaAppArtifact 的最小闭环。
- 系统把构建事实、中间解释和最终产物分离。
- 系统支持 GoldenPath 快路径运行和失败回退慢模式。
- 系统提供 baseline runner，用于后续轨迹复用实验。

暂时不能写：

- 已完成 CoW 沙箱。
- 已完成后端服务池自动匹配。
- 已证明 GoldenPath 泛化优于所有 baseline。
- 已完成正式平台入库与发布闭环。

## 九、近期交付物

- `tasks_medical_calc.json`：固定任务集。
- `build_ids.jsonl`：每个源任务对应 BuildBundle。
- `experiment_results.jsonl`：所有 baseline trial。
- `summary.csv`：按 baseline 聚合指标。
- `failure_cases.md`：失败类型和改进点。

这些都是本地科研产物，不进入 ioeb_backend，不提交 git。
