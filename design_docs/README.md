# design_docs · 仿真构建设计文档索引

更新：2026-06-21。本目录只放“元应用想定式仿真构建”相关设计与研究材料；平台用户指南仍在根目录 `docs/`，不在这里维护。

| 文件 | 用途 | 当前状态 |
| --- | --- | --- |
| `build-design4llm.md` | 给 LLM/工程协作者看的当前接口契约和文件定位 | 与 MicroAgent `lyx` 分支当前 API 对齐 |
| `simulation-build-design.md` | 设计机制、对象边界、前端临时展示与真实链路说明 | 只描述当前真实实现，不再沿用旧 CoW/ArtifactSpec 叙述 |
| `research-guide-execution-traces-to-mcp-apps.md` | 轨迹固化与复用研究执行指南 | 按当前 BuildBundle/MetaAppArtifact/experiment runner 重写 |

维护约定：

- 改 HTTP/SSE/API 字段：先改 `build-design4llm.md`。
- 改机制解释、对象分层、前端展示策略：改 `simulation-build-design.md`。
- 改实验任务、baseline、论文计划：改 `research-guide-execution-traces-to-mcp-apps.md`。
- 不在这些文档里描述 ioeb_backend 已支持 artifact 入库；当前没有。
- 不把 ioeb 进程内 mock 的旧演示数据当成真实构建能力。
