# design_docs · 仿真构建设计文档索引

更新：2026-06-28。本目录只放“元应用想定式仿真构建”相关设计与研究材料；平台用户指南仍在根目录 `docs/`，不在这里维护。本地联调启停见 `~/.cursor/rules/fdueblab-local-dev.mdc` 与 `workspace/fdueblab/.local-dev/`。

| 文件 | 用途 | 当前状态 |
| --- | --- | --- |
| `build-design4llm.md` | 给 LLM/工程协作者看的当前接口契约和文件定位 | 与当前 API 对齐 |
| `simulation-build-design.md` | 设计机制、对象边界、前端展示与真实链路说明 | BuildBundle / MetaAppArtifact v1 |
| `research-guide-execution-traces-to-mcp-apps.md` | 轨迹固化与复用研究执行指南 | 按当前 BuildBundle/MetaAppArtifact/experiment runner 重写 |

维护约定：

- 改 HTTP/SSE/API 字段：先改 `build-design4llm.md`。
- 改机制解释、对象分层、前端展示策略：改 `simulation-build-design.md`。
- 改实验任务、baseline、论文计划：改 `research-guide-execution-traces-to-mcp-apps.md`。
- 数据库 Artifact 适配在真实链路通过后单独设计；当前文档不得写成已实现。
- 本地三端启停、SSH 隧道、MCP 进程：**不写本目录**；见 Cursor 规则 `fdueblab-local-dev.mdc`。
- 不要把 ioeb 进程内 mock 的旧演示数据当成真实构建能力。
