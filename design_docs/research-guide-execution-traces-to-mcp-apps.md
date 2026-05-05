# 研究指导：从执行轨迹到可复用 MCP 应用

> **性质**：个人自用研究指导文档，非平台用户文档。  
> **用途**：按步骤完成「沙箱验证轨迹 → 编译 MCP 原生应用」课题的全部工程与论文工作。  
> **阅读方式**：从头到尾按顺序读一遍（约 30 分钟），之后每周回来对照 §6 的周历表执行。

---

## 目录

- [0. 先决条件自检](#0-先决条件自检)
- [1. 课题定位与一句话摘要](#1-课题定位与一句话摘要)
- [2. 你的系统到底做什么（给自己讲清楚）](#2-你的系统到底做什么给自己讲清楚)
- [3. 当前工程基础与缺口](#3-当前工程基础与缺口)
- [4. 相关工作全景：读什么、怎么读、怎么写](#4-相关工作全景读什么怎么读怎么写)
- [5. 论文骨架与贡献填写模板](#5-论文骨架与贡献填写模板)
- [6. 十二周执行日程](#6-十二周执行日程)
- [7. 数据结构速查](#7-数据结构速查)
- [8. 实验设计手册](#8-实验设计手册)
- [9. 论文期要不要改前端？](#9-论文期要不要改前端)
- [10. 论文写作模板与常见坑](#10-论文写作模板与常见坑)
- [11. 风险与应急](#11-风险与应急)
- [12. 每周例行清单](#12-每周例行清单)

---

## 0. 先决条件自检

按顺序逐项确认，**缺哪项就先补哪项，不要跳着做**。

- [ ] 扫一眼 **`design_docs/README.md`**（三十秒）：确认三篇文档各自分工，避免改错文件

### 0.1 文档已读

- [ ] `design_docs/simulation-build-design.md` 的 **§2 当前状态**、**§4 仿真构建机制**、**§8 研究方向**、**§9 实验设计**
- [ ] `design_docs/build-design4llm.md` 全文（约 10 分钟）——**与工程实现一致的唯一契约**；改后端或分流时对照此文

### 0.2 本地环境：能动手即可

- [ ] Node 18（`nvm use`），`npm install` 无报错
- [ ] `npm run serve` 能打开平台（端口以 `vue.config.js` 为准）
- [ ] Micro-Agent 虚拟环境就绪：`cd Micro-Agent && source .venv/bin/activate && uvicorn api.app:app --port 8000`
- [ ] ioeb_backend 虚拟环境就绪：`cd ioeb_backend && source .venv/bin/activate && python wsgi.py`
- [ ] `.env.development.local` 配好 `VUE_APP_AGENT_BASE_URL=http://localhost:8000`
- [ ] **入口**：调度页 → 画布工具栏 → 「开始仿真构建」→ 看到 4 阶段跑完

> **注意**：仿真构建直连 Micro-Agent（`VUE_APP_AGENT_BASE_URL`），**不经过** ioeb_backend。ioeb_backend 只管用户登录、字典等系统功能。

### 0.3 论文工具就绪

- [ ] Overleaf 或本地 LaTeX 能编译 ACL 模板
- [ ] Zotero/Mendeley 里已建好本课题文件夹
- [ ] 有一个能运行 Python 的环境（后续写评测脚本/画图用）

---

## 1. 课题定位与一句话摘要

### 1.1 中文一句话（开题/汇报直接念）

> 在 **Copy-on-Write 沙箱**中，通过 **Planner / Verifier 分离验证**得到可信执行轨迹，再将轨迹**编译**为可部署的 **MCP 原生**智能体应用配置。

### 1.2 英文标题备选（投稿时二选一）

| 候选 | 侧重 |
|------|------|
| *SimBuild: From Sandbox-Verified Execution Traces to Deployable MCP Applications* | 突出系统名 |
| *Trace2App: Compiling Verified Agent Trajectories into Reusable MCP-Native Applications* | 突出方法 |

### 1.3 课题的本质（用来回答「这和 XX 有什么区别」）

```
输入：自然语言需求 + 一组 MCP 服务
       ↓
    [沙箱中 Agent 试跑 + 独立验证]
       ↓
中间产物：经过验证的结构化执行轨迹
       ↓
    [轨迹编译器]
       ↓
输出：可部署的 MCP 智能体应用配置
```

关键词解释：
- **MCP 原生**：产出的应用配置直接描述 MCP 工具调用，而非通用代码或 Web UI 操作
- **CoW 沙箱**：写操作被拦截存入沙箱状态层，后续读操作先查沙箱再穿透真实服务，既保护生产数据又保证状态连贯
- **分离验证**：Planner 和 Verifier 是两个独立 agent（独立上下文），避免「自己评自己」

---

## 2. 你的系统到底做什么（给自己讲清楚）

整个系统分三个阶段，对应论文 Method 的三个子节：

### Phase 1：沙箱执行与验证

```
用户说「我要一个跨境支付监控应用」
  → 系统解析需求 + 注入垂域知识（如 AML 领域术语、校验规则）
  → Planner Agent 自主决定：先调交易查询，再调异常检测，再调报告生成
  → 每个 MCP 工具调用经过 CoW 沙箱：
      - 读操作：先看沙箱里有没有之前写入的数据，有就返回，没有就穿透到真实服务
      - 写操作：拦截，生成模拟回执，结果存沙箱状态层
  → Verifier Agent（独立上下文）检查：
      - 数据仿真：输入输出格式对不对
      - 逻辑仿真：业务规则满足不满足
      - 链路检视：有没有冗余/遗漏/顺序错误
  → 不通过 → issues 反馈给 Planner → 下一轮
  → 通过 → 捕获这条「黄金轨迹」
```

### Phase 2：轨迹编译

```
拿到验证通过的轨迹（包含每一步的 agent/tool/params/result/sandbox_state）
  → 状态抽象：提取关键变量（哪些字段在步骤间传递）
  → 工具路由图：把调用序列变成 DAG，标注数据依赖边
  → 异常分支：从历史失败-修复对生成 fallback 路径
  → 输出：CompiledApp 配置 JSON
```

### Phase 3：自改进闭环（论文加分项，非必须）

```
编译出的应用部署运行
  → 收集运行时轨迹
  → 从中提取经验（strategy tips / recovery tips / optimization tips）
  → 存入经验库
  → 下次构建时，Planner 可检索相关经验
```

---

## 3. 当前工程基础与缺口

### 3.1 已有的（论文可以写「我们在已有平台基础上」）

| 能力 | 论文怎么提 |
|------|-----------|
| 仿真构建 UI（五步 + 生产/研究双模式） | 「系统提供生产/研究双模式仿真构建界面」 |
| SSE 命名事件全链路（前端←→Micro-Agent） | 「前后端通过具名 SSE 事件实时同步构建阶段」 |
| 双 Agent 编排器（Planner + Verifier） | 「采用 Planner/Verifier 分离验证架构」 |
| 轨迹持久化（FileTraceStore + records API） | 「完整事件序列自动持久化」 |
| 策略 M1–M5 配置与研究记录视图 | 「支持模块化策略与研究记录」 |
| 多阶段领域知识裁剪与注入 | 「在想定解析 / 规划 / 验证阶段可注入垂域知识」 |
| Agent 运行时（Micro-Agent, ReAct 引擎） | 「复用已有智能体框架」 |
| smart_chat 多轮 session | 「对话具备跨请求上下文保持」 |

### 3.2 缺口清单（2026-04-29 更新）

| 缺口 | 影响 | 优先级 | 状态 |
|------|------|--------|------|
| ~~后端仿真控制器~~ | ~~无法真实跑仿真~~ | ~~P0~~ | **已完成** — `SimulationOrchestrator` 4 阶段 + SSE |
| ~~Trace 结构化存储~~ | ~~轨迹无法持久化/查询~~ | ~~P0~~ | **已完成** — `FileTraceStore` JSON 文件 |
| ~~smart_chat 多轮~~ | ~~对话无上下文~~ | ~~P0~~ | **已完成** — session_id + FileMemory |
| CoW 沙箱代理层 | 无读写拦截 | **P0** | 待实现，§6 第 2 周 |
| SimulatedMCPTool → 真 MCP | 当前 tool 是 mock | **P1** | 待实现，改 `orchestrator._build_planner()` |
| 轨迹编译器 | 无法从轨迹生成应用配置 | **P1 核心方法** | 待实现，§6 第 4–7 周 |
| 评测任务集 | 无法做实验 | **P1** | 待实现，§6 第 8 周 |
| 策略真分支（M1–M5） | 消融实验无效 | **P1** | 待实现，§6 第 8 周 |
| 验证标准量化 | Verifier 判断靠 LLM | P2 | 待实现 |
| 经验固化回放 | `golden_trace` 仅为标签 | P2 | 待实现 |
| 自改进闭环 | 论文加分项 | P3 | 待实现 |

### 3.3 不需要改的（省时间）

- 前端 UI：已有的仿真面板、画布联动、研究模式界面 → **不碰**
- 领域知识 profile：仓库内垂域模板集已齐 → **直接复用**
- SSE 事件名与载荷格式 → **以后端契约文档为准**（`design_docs/build-design4llm.md`）

---

## 4. 相关工作全景：读什么、怎么读、怎么写

### 4.1 必须精读的 8 篇（按重要性排序）

#### 第一梯队：直接对标（你的 Related Work 表格必须有它们）

| # | 论文 | 链接 | 读它的目的 | 预计精读时间 |
|---|------|------|-----------|-------------|
| 1 | **ReUseIt**: Synthesizing Reusable AI Agent Workflows for Web Automation | [arXiv:2510.14308](https://arxiv.org/abs/2510.14308) | 最直接的竞品，做「轨迹→可复用workflow」；你需要说清楚你和它不同在哪 | 3h |
| 2 | **FlowMind**: Execute-Summarize for Structured Workflow Generation | [arXiv:2602.11782](https://arxiv.org/abs/2602.11782) | 「先执行后固化」范式的直接来源；你的 Phase 1→Phase 2 借鉴了这个思路 | 2h |
| 3 | **Trajectory-Informed Memory** for Self-Improving Agent Systems | [arXiv:2603.10600](https://arxiv.org/abs/2603.10600) | IBM 的四组件经验提取框架，指导你 Phase 3 设计；AppWorld 上 +14.3pp | 3h |
| 4 | **EvolveR**: Self-Evolving LLM Agents through Experience-Driven Lifecycle | [arXiv:2510.16079](https://arxiv.org/abs/2510.16079) | offline 蒸馏 + online 检索的闭环范式，对标你的自改进 | 2h |

#### 第二梯队：方法借鉴

| # | 论文 | 链接 | 读它的目的 | 预计精读时间 |
|---|------|------|-----------|-------------|
| 5 | **ASTRA**: Automated Synthesis of Agentic Trajectories and RL Arenas | [arXiv:2601.21558](https://arxiv.org/abs/2601.21558) | tool-call 图拓扑建模方法，可借鉴做 MCP 调用 DAG | 2h |
| 6 | **LLM-in-Sandbox** Elicits General Agentic Intelligence | [arXiv:2601.16206](https://arxiv.org/abs/2601.16206) | 证明「沙箱范式有效」的实证，支撑你的 CoW 设计动机 | 1.5h |
| 7 | **AWO**: Agent Workflow Optimization | [arXiv:2601.22037](https://arxiv.org/abs/2601.22037) | trace → meta-tool 发现，可作为固化产物的补充形式 | 1.5h |
| 8 | **AppWorld**: A Controllable World of Apps and People | [ACL '24, arXiv:2407.18901](https://arxiv.org/abs/2407.18901) | 如需对标跨应用基准；读评测设计部分即可 | 1.5h |

### 4.1.1 官方代码与「复现」指什么（避免误解）

计划里写的 **Baseline 2 / 3** 对应的是 **ReUseIt 思路**、**FlowMind（Execute–Summarize）思路**，在多数情况下 **不等于**「把作者 GitHub 原样跑起来」。原因如下。

**（1）这几篇在 arXiv 页面上通常没有稳定的「官方 GitHub」入口**

| 论文 | 公开实现（截至 2026-04 的常见情况） | 说明 |
|------|--------------------------------------|------|
| ReUseIt | **未见广泛引用的官方开源仓库** | 领域是 Web 自动化，即便未来有代码，也未必能直接接到你的 MCP 评测管线 |
| FlowMind | **同上** | 论文引入 FlowBench；复现成本往往在 **数据/环境** 而非单文件脚本 |
| Trajectory-Informed Memory（IBM） | **有第三方开源实现**：[adamkrawczyk/trajectory-tips](https://github.com/adamkrawczyk/trajectory-tips)（npm `trajectory-tips`）README 写明基于 *Trajectory-Informed Memory Generation…*（IBM Research）、并给出与论文 **Fang et al. 2026** 各组件的对照表；**不是 IBM 官方仓库** | 可作 Phase 3 / 记忆基线的 **参考实现**；若写进论文需注明为 **community reimplementation**，与 IBM 内部系统不等价 |
| **EvolveR** | **有** | 官方仓库：[https://github.com/Edaizi/EvolveR](https://github.com/Edaizi/EvolveR)（MIT）。若要做「闭环自改进」对照，这是四篇里**最适合真跑代码**的一篇 |

**（2）对你当前课题，更合理的「复现」定义**

| 类型 | 含义 | 何时用 |
|------|------|--------|
| **方法复现（re-implementation）** | 按论文算法/流程图，用你自己的栈（Micro-Agent + MCP 任务集）写一版 | ReUseIt / FlowMind / TIM 的 baseline 应优先走这条 |
| **思想对齐 + 简化基线** | 只保留论文里 1–2 个关键机制（如「先执行再摘要」「多轮试错取最短成功轨迹」） | 工期紧、或原论文环境与 MCP 不兼容时 |
| **原仓库跑分** | 克隆作者代码、按其 README 复现表格数字 | 仅当仓库存在、协议与任务一致、且你有时间对齐环境时 |

**（3）与本文 §8.3 的衔接（你实际要写的 baseline）**

- **Baseline A（Zero-shot）**：不依赖任何上述仓库。  
- **Baseline B（FlowMind 式）**：两阶段 prompt + 轨迹日志即可，**不需要** FlowMind 官方代码。  
- **Baseline C（ReUseIt 式）**：在同一 MCP 任务上「多次 rollout → 选成功轨迹 → 合成 guards/分支」的**简化实现**，**不需要** ReUseIt 的浏览器环境。  
- **EvolveR**：若审稿人或你自己要求「和自进化框架同场对比」，可单独开一小节：在**相同任务集**上跑 [EvolveR](https://github.com/Edaizi/EvolveR) 或只对其 **offline 蒸馏 + memory 检索** 做对齐。

**（4）论文里怎么写才诚实**

在 Experiments / Setup 中建议写类似表述（按实际改写）：

> *We do not have access to official implementations for ReUseIt and FlowMind at the time of writing. We therefore implement **faithful but simplified** instantiations of their core procedures on our MCP-based benchmark, following the algorithmic descriptions in their papers.*

若未来某篇放出官方代码，再改为「we compare against the released codebase」即可。

#### 只需引用、不用精读的背景工作

这些是 2022–2023 的「常识级」基础，论文 Related Work 中一句话带过：

- **ReAct** (Yao et al., 2022) — 思考-行动交织
- **Toolformer** (Schick et al., 2023) — 自监督学调工具
- **Gorilla** (Patil et al., 2023) — 大规模 API 调用
- **API-Bank** (Li et al., 2023) — 工具评测基准
- **Reflexion** (Shinn et al., 2023) — 语言反馈自改进

### 4.2 相关工作技术详解（指导后续研究）

以下按「问题—机制—技术要点—实验与指标—迁移到你课题」组织。**细粒度以能写 Method / 设计 baseline / 做对照实验为准**；具体公式与超参务必以论文 PDF 为准核对。

---

#### 4.2.1 ReUseIt（Web 自动化：从成败轨迹合成可复用 workflow）

- **要解决的问题**：Web agent 在重复任务上成功率低（论文报告无充分引导时约 **24.2%** / 十五个任务量级），且用户每次都要给细粒度指导；缺乏可跨次复用的结构化流程。
- **核心机制**：不只利用**成功**轨迹，而是利用**成功 + 失败**的多次尝试，**自动合成**「可复用 workflow」。
- **合成物结构（读论文时对照画图）**：
  - **主动作序列**：与任务类型对应的核心 UI/操作步骤；
  - **条件检查（condition checks）**：用于自反思路（是否偏离、是否出现异常状态）；
  - **execution guards**：在易错步骤旁挂**守卫**（检测 + 提示/纠偏），使 agent 能发现并修复错误，并向用户同步进度与问题。
- **流程层面的典型做法**（概念级）：对同一类任务生成**任务变体** → 多次 rollout → 从轨迹中归纳 workflow 与 guards（具体聚类/摘要算法以原文为准）。
- **实验侧**：十五个任务上成功率提升至约 **70.1%**；另有 **9 名用户**参与的用户研究（成功率、所需引导量、可理解性等）。
- **迁移到你课题**：
  - **Baseline C**：在 MCP 任务上多轮 rollout，用**最短成功轨迹**或 **成功轨迹 + 失败轨迹中的 guard 模式** 合成配置；环境从浏览器换成 **MCP 工具调用图**。
  - **与系统的差异**：ReUseIt **无 MCP 协议语义、无 CoW 沙箱、无独立 Verifier**；你的贡献要写清 **沙箱 + 分离验证 + MCP 编译产物**。
  - **实现提示**：guards 在你的栈里可落地为 **对 tool 入参/出参的断言**（JSON Schema / 规则 / 小模型分类器）。

---

#### 4.2.2 FlowMind（Execute–Summarize：执行与 workflow 构建解耦）

- **要解决的问题**：若在**同一次生成过程中**既「解题」又「搭 workflow」，两类目标互相干扰，workflow 易错、不稳。
- **核心机制（两阶段严格分工）**：
  1. **Execute 阶段**：模型**只**用领域工具完成任务；可自由探索，产出完整 **execution trajectory**（工具调用序列、中间状态、最终结果）。此阶段**不要求**输出结构化 workflow 语法。
  2. **Summarize 阶段**：在任务已完成后，**仅用 workflow 构造原语**（节点、边、条件分支等）从轨迹**重构**结构化 workflow；该阶段**不再调用业务工具**，避免执行与抽象混在一起。
- **评测**：引入 **FlowBench**（以论文描述为准：对比「边执行边建图」类方法）；主结论为 ES 在 workflow 正确性、鲁棒性上更优。
- **迁移到你课题**：
  - **Baseline B**：Phase A = 在 MCP 上跑通任务并记录轨迹；Phase B = 独立 prompt 让模型输出 `CompiledApp` / DAG（**无 CoW、无 Verifier**）。
  - **与你系统的对齐点**：你的 **Phase 1（沙箱内验证通过）→ Phase 2（编译）** 与 ES **同型**；差别在于你在两阶段之间插入了 **CoW + Planner/Verifier 闭环**，产出是 **MCP 应用配置** 而非通用 workflow。
  - **实现提示**：Summarize 阶段要**冻结**工具集描述为「只读规格」，避免模型在编译阶段偷偷「再调一次工具」。

---

#### 4.2.3 Trajectory-Informed Memory（IBM：轨迹驱动的记忆生成）

- **要解决的问题**：智能体完成很多任务，但**不积累**可迁移经验：重复低效路径、同类错误反复出现、成功策略未复用。
- **四组件（论文核心，建议画成框图）**：
  1. **Trajectory Intelligence Extractor**：对轨迹中的自然语言推理做**语义分析**，例如将 thought 归为分析、规划、校验、反思等类型（具体类别以原文为准）。
  2. **Decision Attribution Analyzer**：做**归因**——失败/恢复/低效分别对应哪些决策与推理步骤（区分直接原因、近因、根因等层次）。
  3. **Contextual Learning Generator**：产出三类可注入记忆的 **tips**：
     - **strategy tips**（来自干净、高效的成功执行）；
     - **recovery tips**（来自「先失败后修复」序列）；
     - **optimization tips**（来自成功但路径冗余/代价高的执行）。
  4. **Adaptive Memory Retrieval**：按任务上下文做相似度检索；常见设计包括 **embedding 余弦相似**（快、无额外 LLM 调用）与 **LLM 指导的条目选择**（更准、更贵）。
- **实验侧（摘要中的量级）**：**AppWorld** 上 scenario goal 等指标有显著提升（如摘要所述 **+14.3pp** 等；复杂任务上相对提升更大——写论文时以原文表格为准）。
- **迁移到你课题**：
  - **Phase 3 经验库**：可将四组件**降级实现**为：从 `Trace` + Verifier 的 `issues` 字段做归因，再生成 tips 写入向量库；构建时注入 Planner prompt。
  - **与 EvolveR 的分工**：TIM 偏 **检索式记忆**；EvolveR 偏 **蒸馏成原则 + 强化式更新**。二者可二选一作主对比，或分模块借鉴。
  - **开源参考（非官方）**：社区项目 [trajectory-tips](https://github.com/adamkrawczyk/trajectory-tips) 将论文中的 Trajectory Intelligence Extractor、Decision Attribution Analyzer、三类 tips、YAML+embedding 存储、余弦检索等做成 CLI；README 中有 **Paper vs Implementation** 对照表（部分能力为 Planned）。可用于快速试跑「轨迹→tips→注入 prompt」管线，但 **不能** 在论文里写成「复现 IBM 官方代码」。

---

#### 4.2.4 EvolveR（经验生命周期：离线蒸馏 + 在线交互）

- **要解决的问题**：智能体难以**系统性地**从自身交互中迭代改进策略。
- **两阶段生命周期（论文叙事）**：
  1. **Offline Self-Distillation**：将多条交互轨迹**蒸馏**为 **抽象、可复用的策略原则**（非原始日志）；通常含**去重、合并、质量过滤**，形成可检索原则库。
  2. **Online Interaction**：执行任务时**检索**相关原则指导决策；持续积累新轨迹，并通过 **policy reinforcement**（策略强化/迭代更新机制，具体算法见原文）刷新原则库或检索分布。
- **实现侧**：存在公开仓库 [EvolveR](https://github.com/Edaizi/EvolveR)（MIT），便于做 **同任务集** 的对比实验（若协议与任务可对齐）。
- **迁移到你课题**：
  - **对照实验**：在相同 MCP 任务上对比「仅仿真编译」vs「EvolveR 式蒸馏 + 检索」对**后续任务成功率**的影响。
  - **概念边界**：EvolveR 目标是 **agent 能力持续进化**；你主线的目标是 **可部署应用配置**。论文中应写清：**蒸馏对象**是「构建策略」还是「运行时策略」，避免贡献混淆。

---

#### 4.2.5 ASTRA（工具调用图拓扑 + 轨迹/环境合成 + 训练）

- **要解决的问题**：工具增强智能体的训练数据难构造；人工标注或脆弱仿真成本高。
- **核心思想**：
  - 利用 **tool-call graph 的静态拓扑**（工具为节点、合法调用序为边或路径约束）**合成多样化轨迹**，覆盖更广的工具使用模式；
  - 另有将分解后的问答/推理轨迹转为 **可执行、可规则校验的合成环境**，用于 **SFT + 在线 RL**（轨迹级奖励等）。
- **与你课题的关系**：**正交**。ASTRA 主要服务 **模型训练**；你侧重 **部署级应用配置**。
- **迁移到你课题**：
  - **轨迹编译**：借鉴 **调用图 / DAG** 表示，把 MCP 调用序列建成 **带拓扑约束的图**（便于做依赖检查、环检测、剪枝）。
  - **一般不做**：整段 RL 管线，除非课题组有训练资源且论文故事改为「数据合成」。

---

#### 4.2.6 LLM-in-Sandbox（沙箱内探索与泛化）

- **要解决的问题**：强模型在**代码沙箱/虚拟环境**中通过探索，可把能力泛化到数学、科学、长上下文等任务。
- **技术要点**：强调 **sandbox 作为一等公民**：读写文件、执行脚本、持久化状态等；可扩展 **RL 微调**（论文中的 LLM-in-Sandbox-RL）。
- **与你课题的关系**：提供「**沙箱有用**」的旁证；你的 **CoW** 针对 **MCP 读写语义与生产隔离**，与「通用代码沙箱探索」**目标不同**。
- **迁移**：Introduction / Related Work 中一句话引用即可；Method 中写清 **CoW 的定义**（读优先命中沙箱写层、写拦截与模拟回执）。

---

#### 4.2.7 AWO（Agent Workflow Optimization：从 trace 到 meta-tool）

- **要解决的问题**：workflow 中重复出现同类 **工具调用子序列**，导致 token 与延迟浪费。
- **机制**：分析现有 workflow **trace**，发现**高频子序列**，封装为 **meta-tool**（一次调用等价多步原子工具调用）；从而在保持效果的同时减少 LLM 决策次数（论文报告约 **11.9%** 级 LLM 调用减少等，以原文为准）。
- **迁移到你课题**：
  - 作为 **编译产物的可选层**：在 `CompiledApp` 稳定后，对频繁子路径做 **meta-tool 封装**（工程优化项，非核心贡献）。
  - 与主文「应用配置 + 异常分支」区分：**AWO 偏效率**，你主文偏 **正确性 + 可部署性**。

---

#### 4.2.8 AppWorld（跨应用交互基准）

- **定位**：模拟多应用、多 API 的长程交互任务，用于评测 **agent 在「应用世界」中的执行力**（非专门 MCP）。
- **规模（常见引用）**：大量任务、多「日」场景、众多 API（具体数字以官方仓库 [appworld](https://github.com/StonyBrookNLP/appworld) 与论文为准）。
- **迁移**：
  - **可选外部基准**：若环境能接通，可作 **补充实验**；注意与自建 MCP 任务 **设置分开报告**。
  - **更轻量用法**：借鉴其 **任务难度分层、子目标分解、评测脚本化** 思路，设计你自己的 **24–40 条 MCP 任务集**。

---

#### 4.2.9 对照总表（写 Related Work / 实验章节用）

| 工作 | 对象空间 | 中间表示 | 验证/安全 | 产出 |
|------|----------|----------|-----------|------|
| ReUseIt | Web UI | workflow + guards | 用户侧可观测 | 可复用 Web workflow |
| FlowMind | 通用工具任务 | ES 两阶段 | 无独立验证器 | 结构化 workflow |
| TIM | 通用 agent | 轨迹 → tips | 无架构级 Verifier | 记忆检索 |
| EvolveR | QA 等 | 轨迹 → 原则 | 强化式更新 | 进化中的策略库 |
| ASTRA | tool graph | 合成轨迹/环境 | RL 信号 | 训练数据与模型 |
| 你的目标 | **MCP 工具** | **沙箱内轨迹** | **CoW + Planner/Verifier** | **CompiledApp** |

---

### 4.3 每篇怎么读（模板）

对上面 8 篇，每篇读完后写一段笔记，格式如下：

```markdown
### [论文简称]
- **核心 idea**（一句话）：
- **方法三步**：1. ... 2. ... 3. ...
- **主要实验**：在什么 benchmark 上，主指标是什么，最好成绩是多少
- **我能借鉴什么**：
- **我和它不同在哪**（写进 Related Work 的那句话）：
```

### 4.4 Related Work 段落写法（填空模板）

论文 Related Work 分三个小节：

**Tool-Augmented LLM Agents.**
> 近年来，大量工作探索了工具增强的 LLM 智能体 [ReAct, Toolformer, Gorilla, API-Bank]。这些工作建立了「思考-行动」交织、自监督工具学习和大规模 API 调用的基础范式。然而，它们主要关注单轮或短程的工具调用，未涉及如何将成功的调用序列固化为可复用的应用。

**Workflow Synthesis from Agent Traces.**
> FlowMind [引用] 提出 Execute-Summarize 范式，先让 agent 完成任务再从轨迹重建 workflow，但缺乏执行验证环节。ReUseIt [引用] 从 agent 的成功/失败尝试中合成带 execution guards 的 workflow，但限于 Web 自动化场景。AWO [引用] 从轨迹中发现 meta-tool 以减少 LLM 调用。与这些工作不同，我们的方法 (1) 在 CoW 沙箱中执行以保护生产数据并保证状态连贯，(2) 使用独立的 Verifier Agent 验证轨迹质量，(3) 编译出的是 MCP 原生的应用配置而非通用 workflow 模板。

**Agent Self-Improvement.**
> Trajectory-Informed Memory [引用] 从轨迹中提取 strategy/recovery/optimization tips 并存入记忆用于后续任务。EvolveR [引用] 将轨迹蒸馏为抽象策略原则形成闭环。ASTRA [引用] 利用 tool-call 图拓扑合成轨迹训练数据。LLM-in-Sandbox [引用] 证明了沙箱环境对提升智能体通用能力的有效性。我们的系统在自改进维度上借鉴了这些思路，但核心目标不是改进模型能力，而是编译出可部署的应用。

---

## 5. 论文骨架与贡献填写模板

### 5.1 论文结构

```
Title
Abstract (150词)
1. Introduction (1.5页)
   - 问题：自然语言需求→可部署应用，现有方法的gap
   - 我们的方法：一句话
   - 贡献列表（4条）
2. Related Work (1页)
   - 三小节（见§4.4模板）
3. System Overview (1页)
   - 三阶段架构图
   - 与平台的关系（MCP服务、领域知识）
4. Method (2页)
   4.1 CoW Sandbox Execution
   4.2 Planner-Verifier Decoupled Verification
   4.3 Trace Compilation
   4.4 Domain Knowledge Enhancement
5. Experiments (2页)
   5.1 Setup（任务集、模型、指标）
   5.2 Main Results（表格：我们 vs 3个Baseline）
   5.3 Ablation Study（M1-M5消融表）
   5.4 Case Study（1-2个具体例子）
6. Analysis & Discussion (0.5页)
7. Conclusion (0.5页)
References
Appendix（任务集详情、完整轨迹样例）
```

### 5.2 四条贡献（直接复制到 Introduction 末尾）

> Our contributions are as follows:
> 1. We propose a **Copy-on-Write sandbox** mechanism that intercepts write operations while maintaining state coherence for subsequent reads, enabling safe yet realistic agent execution traces. *(对比: FlowMind 无沙箱; LLM-in-Sandbox 无 CoW 语义)*
> 2. We introduce a **Planner-Verifier decoupled verification** architecture where planning and verification agents operate with independent contexts, reducing self-evaluation bias. *(对比: ReUseIt 单 agent 试错)*
> 3. We design a **trace compilation** pipeline that transforms verified execution traces into deployable MCP-native application configurations, including state abstraction, tool routing graphs, and exception branches. *(对比: ASTRA 面向训练; AWO 面向 meta-tool)*
> 4. We demonstrate that **domain knowledge injection** at the scenario parsing, planning, and verification stages improves first-round pass rates on domain-specific tasks. *(对比: EvolveR 无领域特化)*

### 5.3 投稿目标

| 会议 | 适合程度 | 适合的 Track | DDL 参考 |
|------|---------|-------------|---------|
| EMNLP | 高 | Industry / Demo / Main | 通常 6 月 |
| ACL | 高 | Industry / Demo | 通常 2 月 |
| NAACL | 中高 | Industry / Demo | 通常 10 月 |
| AAAI | 中 | Main / Short | 通常 8 月 |
| IJCAI | 中 | Main / Short | 通常 1 月 |

建议：优先投 **EMNLP Industry Track** 或 **ACL Demo Track**，因为本课题有完整系统，Demo/Industry 轨道更看重系统完整性。

---

## 6. 十二周执行日程

### 第 1 周：仿真会话 + SSE 打通 ✅ 已完成

> **已实现**（2026-04-29）：`SimulationOrchestrator` 4 阶段 + 双 Agent（Planner/Verifier）+ SSE 命名事件 + `FileTraceStore` 轨迹持久化。前端 `SIMULATION_USE_MOCK=false`，直连 Micro-Agent。详见 `simulation-build-design.md` §2.1。

### 第 2 周：CoW 沙箱代理

**做什么**：
1. 实现 MCP 调用代理层：在 Agent 和真实 MCP 服务之间插入一个中间层
2. 实现读写分类：先用命名约定（`get*`/`query*`/`list*` = 读，`create*`/`update*`/`delete*`/`send*` = 写），后续可加 LLM 推断
3. 实现 CoW 语义：
   - 写操作 → 拦截 → 生成模拟回执（先用 Schema 推导） → 存沙箱状态
   - 读操作 → 先查沙箱状态 → 命中则返回沙箱数据 → 未命中则穿透真实服务

**验收标准**：
- [ ] 一个写操作被拦截，沙箱状态中能查到写入记录
- [ ] 一个后续读操作命中沙箱中之前的写入数据
- [ ] 一个无关读操作穿透到真实服务

### 第 3 周：轨迹落库 ✅ 已完成（基础版）

> **已实现**（2026-04-29）：`FileTraceStore` 将完整事件序列 + 元数据存为 `data/traces/{sessionId}.json`。`GET /records` 可列出、`POST /records/compare` 可对比。
>
> **待完善**：当前存储的是 SSE 事件流，§7.1 中定义的细粒度 `Trace` 结构（含 planner toolCalls、sandbox writes/readHits、verifier verdict）尚需补充。这是后续接真实 MCP 后的重点工作。

### 第 4 周：状态抽象

**做什么**：
1. 从 Trace 的 steps 中提取：哪些字段是「输出→下一步输入」的传递变量
2. 生成 stateSchema：每个变量的名称、类型、来源步骤、消费步骤

**思路**：遍历 trace steps，对每个 step 的 result 字段和下一个 step 的 arguments 字段做字段匹配（精确匹配 + LLM 辅助模糊匹配）

**验收标准**：
- [ ] 对 5 条不同轨迹运行状态抽象，人工检查提取的变量是否正确

### 第 5 周：工具路由 DAG

**做什么**：
1. 从 Trace steps 提取 MCP 工具调用顺序
2. 根据状态抽象的数据依赖关系，构建 DAG（节点=工具调用，边=数据依赖）
3. 处理分支（如果 Verifier 标注了条件判断）和无环保证

**验收标准**：
- [ ] 输出的 DAG 与 trace 中的实际调用序列一致
- [ ] DAG 可以序列化为 JSON（`executionGraph: { nodes, edges }`）

### 第 6 周：异常分支

**做什么**：
1. 收集历史失败-修复对（iteration 中 verdict=fail 且后续 repair 成功的 case）
2. 从 issue 类型和修复动作中生成条件分支和 fallback 策略
3. 将异常处理器附加到 DAG 的对应节点上

**验收标准**：
- [ ] 至少 1 个编译出的应用，在模拟异常输入时能触发 fallback 路径

### 第 7 周：端到端打通

**做什么**：
1. 组装 `CompiledApp` 完整配置（见 §7.2）
2. 让 Micro-Agent 的 `/api/agent/meta_app/run` 能消费这个配置
3. 端到端 demo：自然语言 → 仿真 → 轨迹 → 编译 → 运行

**验收标准**：
- [ ] 至少 1 个垂域的 1 个任务，从头到尾跑通
- [ ] 编译出的应用能独立运行（不依赖原始仿真会话）

### 第 8 周：评测任务集 + 策略真分支

**做什么**：
1. 设计评测任务集（见 §8.1）
2. 在后端实现 M1–M5 策略真分支（之前 mock 里策略不改变行为，现在必须让每个策略选项产生不同的执行路径）

**验收标准**：
- [ ] 任务集 JSON 写好，包含至少 24 个任务
- [ ] 切换 `sandbox: 'none'` 后行为确实不同（无拦截）
- [ ] 切换 `verification: 'single_agent'` 后只用一个 agent

### 第 9 周：主实验

**做什么**：
1. 跑全量任务集，收集所有指标（见 §8.2）
2. 跑 3 个 Baseline（见 §8.3）
3. 整理主实验结果表格

### 第 10 周：消融实验

**做什么**：
1. M1–M5 逐个消融（见 §8.4）
2. 选 1–2 个有代表性的 case 做 Case Study
3. 所有数字填入论文表格

### 第 11 周：论文初稿

**做什么**：
1. 按 §5.1 的骨架写完所有 section
2. 画架构图（系统总览 + 轨迹编译流水线）
3. 排版表格和图

### 第 12 周：修改 + 提交

**做什么**：
1. 自查：每个 claim 是否有实验数据支撑
2. 请人帮读一遍：是否能看懂 Method
3. 准备可复现包（代码、配置、任务集、随机种子）
4. 提交

---

## 7. 数据结构速查

### 7.1 轨迹 `Trace`

```jsonc
{
  "traceId": "trc-20260501-a3f8",
  "sessionId": "sim-xxx",
  "appId": "meta-app-draft",
  "domain": "aml",
  "strategy": {
    "sandbox": "cow",
    "planning": "llm_autonomous",
    "verification": "multi_agent",
    "repair": "llm_repair",
    "solidify": "golden_trace"
  },
  "iterations": [
    {
      "index": 0,
      "planner": {
        "messagesDigest": "sha256-of-planner-context",
        "toolCalls": [
          { "tool": "queryTransactions", "args": { "dateRange": "..." }, "callId": "step-0" },
          { "tool": "detectAnomalies", "args": { "data": "ref:step-0" }, "callId": "step-1" }
        ]
      },
      "sandbox": {
        "writes": [
          { "callId": "step-2", "tool": "generateReport", "intercepted": true, "mockResult": { "reportId": "mock-001" } }
        ],
        "readHits": [
          { "callId": "step-3", "tool": "getReport", "hitFrom": "step-2" }
        ]
      },
      "verifier": {
        "verdict": "fail",
        "issues": [
          { "type": "data_format", "message": "异常检测输出格式与风控规则输入不匹配", "fix": "添加数据适配器" }
        ]
      },
      "repair": { "applied": true, "summary": "在 step-1 和 step-2 之间插入格式转换" }
    },
    {
      "index": 1,
      "planner": { "messagesDigest": "...", "toolCalls": [ /* 修复后的序列 */ ] },
      "sandbox": { "writes": [], "readHits": [] },
      "verifier": { "verdict": "pass", "issues": [] },
      "repair": { "applied": false, "summary": "" }
    }
  ],
  "steps": [
    { "t": "2026-05-01T10:00:01Z", "agent": "planner", "tool": "queryTransactions", "arguments": {}, "result": {}, "sandboxAction": "passthrough" },
    { "t": "2026-05-01T10:00:02Z", "agent": "planner", "tool": "detectAnomalies", "arguments": {}, "result": {}, "sandboxAction": "passthrough" },
    { "t": "2026-05-01T10:00:03Z", "agent": "planner", "tool": "generateReport", "arguments": {}, "result": { "reportId": "mock-001" }, "sandboxAction": "intercepted" },
    { "t": "2026-05-01T10:00:04Z", "agent": "verifier", "tool": null, "arguments": {}, "result": { "verdict": "fail" }, "sandboxAction": null }
  ],
  "enhancements": [
    { "stage": "scenarioParsing", "promptFragment": "【领域摘要】反洗钱...", "sections": {} },
    { "stage": "planning", "promptFragment": "...", "sections": {} },
    { "stage": "verification", "promptFragment": "...", "sections": {} }
  ],
  "metrics": {
    "iterations": 2,
    "elapsedMs": 45000,
    "sandboxFidelity": 0.95,
    "planningAccuracy": 0.5,
    "verificationAccuracy": 1.0,
    "repairEffectiveness": 1.0
  }
}
```

**与当前实现对齐（2026-05）**：真链路中领域知识由 Micro-Agent 根据 `domain` 加载 `workspace/skills/domain_*/SKILL.md` 并写入 Planner/Verifier 的 system prompt，**不存在**请求/响应里的 `domainKnowledge` 大块对象。上表中的 `enhancements` 仅适用于**未来**结构化轨迹或**进程内 mock**（文案来源：`src/mock/data/simulation_builder_data.js` 的 `SIMULATION_BUILD_MOCK_ENHANCEMENTS`）；`FileTraceStore` 当前落盘格式见 `build-design4llm.md` §6。

### 7.2 编译产物 `CompiledApp`

```jsonc
{
  "version": "1",
  "sourceTraceId": "trc-20260501-a3f8",
  "appName": "跨境支付交易监控",
  "domain": "aml",
  "entrypoint": "userInput",
  "mcpServices": [
    { "id": "svc-001", "name": "交易查询服务", "tools": ["queryTransactions"] },
    { "id": "svc-002", "name": "异常检测服务", "tools": ["detectAnomalies"] },
    { "id": "svc-003", "name": "风控规则服务", "tools": ["checkRiskRules"] },
    { "id": "svc-004", "name": "报告生成服务", "tools": ["generateReport"] }
  ],
  "stateSchema": {
    "userInput": { "type": "object", "source": "entrypoint" },
    "transactions": { "type": "array", "source": "queryTransactions.result" },
    "anomalies": { "type": "array", "source": "detectAnomalies.result" },
    "riskAssessment": { "type": "object", "source": "checkRiskRules.result" },
    "report": { "type": "object", "source": "generateReport.result" }
  },
  "executionGraph": {
    "nodes": [
      { "id": "n0", "tool": "queryTransactions", "service": "svc-001" },
      { "id": "n1", "tool": "detectAnomalies", "service": "svc-002" },
      { "id": "n2", "tool": "checkRiskRules", "service": "svc-003" },
      { "id": "n3", "tool": "generateReport", "service": "svc-004" }
    ],
    "edges": [
      { "from": "n0", "to": "n1", "dataField": "transactions" },
      { "from": "n1", "to": "n2", "dataField": "anomalies" },
      { "from": "n2", "to": "n3", "dataField": "riskAssessment" }
    ]
  },
  "exceptionHandlers": [
    {
      "triggerNode": "n1",
      "condition": "output schema mismatch with n2 input",
      "fallback": "insert format adapter between n1 and n2",
      "learnedFrom": "trc-20260501-a3f8, iteration 0, issue 0"
    }
  ]
}
```

### 7.3 `complete.result` 扩展（兼容现有前端）

与 **`build-design4llm.md` §6** 一致：`POST /api/simulation/start` **不包含** `domainKnowledge`；领域上下文只在 Micro-Agent 侧通过 Skill 注入。

在现有 `result` 基础上可新增字段（前端不认识的字段会被忽略）：

```jsonc
{
  // 当前实现常见字段（见 build-design4llm.md §6）
  "executionPath": ["用户输入", "交易查询服务", "...", "输出结果"],
  "strategy": { /* ... */ },
  "appName": "...",
  "domain": "aml",
  // "enhancements": 仅进程内 mock 可选；真链路 Micro-Agent 当前不返回

  // 以下为论文/未来扩展占位
  "traceId": "trc-20260501-a3f8",
  "compiledApp": { /* 见 §7.2 */ }
}
```

---

## 8. 实验设计手册

### 8.1 评测任务集

**设计原则**：每个 domain 3–5 个任务，按难度梯度，共 24–40 个。

**单条任务格式**：

```jsonc
{
  "taskId": "aml-medium-01",
  "domain": "aml",
  "difficulty": "medium",    // simple | medium | complex
  "description": "构建一个跨境支付交易监控应用，能够实时监测跨境交易，自动识别异常交易并生成风险报告。",
  "availableServices": ["svc-001", "svc-002", "svc-003", "svc-004", "svc-005"],
  "expectedServiceCount": 4,
  "validationCriteria": {
    "L1_structural": "调用链完整，所有服务响应格式正确",
    "L2_basic_logic": "输出类型正确，无空值异常",
    "L3_use_case": "给定测试输入，能生成包含异常交易列表的风险报告"
  },
  "testInputs": [
    { "input": { "dateRange": "2026-04-01/2026-04-30", "minAmount": 10000 }, "expectedOutputContains": ["anomalyCount", "reportId"] }
  ]
}
```

**难度定义**（对齐 simulation-build-design §9.4）：

| 维度 | 简单 | 中等 | 复杂 |
|------|------|------|------|
| 服务数量 | 2 个 | 4 个 | 8 个 |
| 调用关系 | 线性链 | 有分支 | 有循环依赖 |
| 数据兼容性 | 完全兼容 | 需适配 | 格式冲突 |
| 写操作比例 | 纯读 | 读写混合 | 写密集 |

**8 个 domain 的任务数分配建议**：

| domain | 简单 | 中等 | 复杂 | 合计 |
|--------|------|------|------|------|
| generic | 1 | 1 | 1 | 3 |
| aircraft | 1 | 1 | 1 | 3 |
| health | 1 | 1 | 1 | 3 |
| agriculture | 1 | 1 | 1 | 3 |
| evtol | 1 | 1 | 1 | 3 |
| ecommerce | 1 | 1 | 1 | 3 |
| homeAI | 1 | 1 | 1 | 3 |
| aml | 1 | 2 | 2 | 5 |
| **合计** | 8 | 9 | 9 | **26** |

aml 多给 2 个，因为平台对跨境支付场景支持最完善。

### 8.2 评测指标

| 层级 | 指标名 | 公式/定义 | 对应论文哪张表 |
|------|--------|----------|--------------|
| 端到端 | **构建成功率** | 通过 L1–L3 验证的任务数 / 总任务数 | 主实验表 |
| 端到端 | **平均迭代轮次** | 所有成功任务的 iteration 数均值 | 主实验表 |
| 端到端 | **构建耗时** | start 到 complete 的 elapsedMs 均值 | 主实验表 |
| 新增 | **应用可复用率** | 编译出的应用在 *新输入* 上仍通过 L1–L3 的比例 | 主实验表 |
| 新增 | **编译保真度** | 编译产物执行结果与原始轨迹执行结果的工具调用序列一致率 | 主实验表 |
| 模块级 | **沙箱保真度** | 沙箱执行结果 vs 真实执行结果的一致率 | 消融表 M1 行 |
| 模块级 | **规划合理率** | 首轮即通过验证的比例 | 消融表 M2 行 |
| 模块级 | **验证准确率** | 验证判定与人工标注的一致率 | 消融表 M3 行 |
| 模块级 | **修复有效率** | 发现问题后成功修复的比例 | 消融表 M4 行 |
| 模块级 | **轨迹泛化率** | 固化轨迹在新输入上仍正确的比例 | 消融表 M5 行 |

### 8.3 三个 Baseline

| Baseline | 做法 | 实现难度 | 预期表现 |
|----------|------|---------|---------|
| **A: Zero-shot** | 直接让 LLM 根据需求描述 + 可用服务列表一次性生成应用配置 JSON，无仿真 | 最低（就是一个 prompt） | 成功率低，无错误修复能力 |
| **B: Execute-Summarize** | 让 agent 在无沙箱环境中完成任务（单 agent，直连服务），然后用 LLM 从轨迹摘要出 workflow | 中等 | 比 A 好，但无验证导致质量不稳定 |
| **C: Multi-Trial** | 同一任务跑 N 次（如 5 次），选成功轨迹中最短的合成 workflow；类 ReUseIt 思路 | 中等，但计算成本高 | 成功率可能不错，但耗时高、无沙箱保护 |

**Baseline A 实现提示**（prompt 模板）：

```
你是一个应用配置生成器。用户需求如下：
{scenarioDescription}

可用的 MCP 服务：
{servicesMeta 列表}

请直接生成一个 JSON 格式的应用配置，包含 executionGraph（节点和边）、stateSchema、exceptionHandlers。
不要解释，直接输出 JSON。
```

### 8.4 消融实验

每次**只改一个 M**，其余保持默认值 `{cow, llm_autonomous, multi_agent, llm_repair, golden_trace}`。

| 实验 | 改什么 | 改成什么 | 预期效果 |
|------|--------|---------|---------|
| M1-a | sandbox | none | 成功率可能差不多但沙箱保真度无法度量；写操作会影响真实数据 |
| M1-b | sandbox | full_mock | 沙箱保真度下降，读操作全是假数据 |
| M2 | planning | preset_workflow | 灵活性下降，简单任务可能不受影响，复杂任务成功率下降 |
| M3 | verification | single_agent | 验证准确率下降（自评偏差） |
| M4-a | repair | rule_repair | 修复有效率下降 |
| M4-b | repair | none | 单次执行，成功率大幅下降 |
| M5-a | solidify | replan | 应用可复用率下降（每次重新规划不一致） |
| M5-b | solidify | static | 轨迹泛化率下降（完全静态无法适应新输入） |

---

## 9. 论文期要不要改前端？

**默认**：仿真面板、画布、领域规则、策略默认、编排页结构——**尽量不动**，把时间花在轨迹、沙箱、评测上。

**例外**：若产品要调整「什么叫演示」（例如演示关键字从「课题」改成别的），属于**平台维护**范畴——**具体改哪些文件、怎么与后端对齐**，以 **`design_docs/build-design4llm.md` §4** 为准；本研究文档不跟踪路径。

### 9.1 不需要碰的（省时间）

- 仿真五步 UI、研究模式面板、画布与仿真的联动——已可用，论文期优先不改。
- 垂域知识 profile、策略默认值——直接复用来做实验叙事即可。

### 9.2 你可能会碰的（论文核心，多在仓库外）

| 要做的 | 说明 |
|--------|------|
| 仿真控制器 / SSE | 后端会话与事件流；契约见 `design_docs/build-design4llm.md` |
| CoW 沙箱代理 | MCP 与真实服务之间的拦截层 |
| Planner / Verifier | 多在 Agent 侧或独立服务 |
| Trace 存储与查询 | DB / 文件 + API |
| 轨迹编译与评测脚本 | 后端或独立 Python |

---

## 10. 论文写作模板与常见坑

### 10.1 Abstract 模板（填空）

> Building intelligent applications from natural language requirements remains challenging, as LLM agents' non-deterministic behavior makes execution results unreliable and non-reproducible. We present **[系统名]**, a system that compiles verified agent execution traces into reusable MCP-native application configurations. Our approach operates in three phases: (1) agents execute tasks within a **Copy-on-Write sandbox** that intercepts write operations while maintaining state coherence, (2) a **decoupled Planner-Verifier** architecture validates trace quality through independent evaluation, and (3) a **trace compilation** pipeline transforms verified traces into deployable configurations with state abstraction, tool routing graphs, and exception branches. Experiments on **[N]** tasks across **[M]** domains show that [系统名] achieves **[X]%** build success rate, outperforming zero-shot generation by **[Y]** percentage points and execute-summarize baselines by **[Z]** percentage points. Ablation studies confirm the contribution of each component.

### 10.2 常见坑

| 坑 | 怎么避 |
|----|--------|
| 贡献写得太虚 | 每条贡献后必须有对应的实验数据支撑 |
| Related Work 没有对比 | 每篇相关工作必须写「我们不同在哪」 |
| Method 画了图但没有数学/算法描述 | 轨迹编译至少要有一段 Algorithm 伪代码 |
| 实验只有主表没有消融 | 消融表是审稿人必看的，缺了几乎必 reject |
| 任务集太小 | 至少 20+ 任务，否则统计意义不足 |
| 没有 Case Study | 至少写 1 个端到端的具体例子（成功 + 失败各一个最好） |
| 声称「系统已部署」但没有证据 | 如实说前端已部署、后端在开发中，或只说「implemented and evaluated」 |

### 10.3 图表清单（论文至少需要这些）

| 图/表 | 内容 | 出现在 |
|-------|------|--------|
| Figure 1 | 系统总览三阶段架构图 | Introduction 或 System Overview |
| Figure 2 | CoW 沙箱读写流程图 | Method §4.1 |
| Figure 3 | 轨迹编译流水线 | Method §4.3 |
| Table 1 | 主实验结果（我们 vs 3 Baseline × 5 指标） | Experiments §5.2 |
| Table 2 | 消融实验（M1–M5 × 关键指标） | Experiments §5.3 |
| Figure 4 | Case Study 可视化（轨迹→编译→应用） | Experiments §5.4 |
| Table 3（可选）| 各 domain 的分领域结果 | Analysis |

---

## 11. 风险与应急

| 风险 | 概率 | 应急方案 |
|------|------|---------|
| 后端仿真控制器开发滞后 | 高 | 先用增强版 mock（让 mock 支持策略真分支），论文中标注「在受控环境中评测」 |
| 真实 MCP 服务不稳定 | 中 | 评测时用固定的 mock MCP 服务，附录说明与真实服务的差异 |
| 沙箱模拟回执偏离真实 | 中 | 设计「沙箱 vs 真实」对照子实验，报告沙箱保真度指标 |
| 评测任务集太主观 | 中 | 每条任务附可执行检查脚本；邀请至少 1 人独立标注验证 |
| 12 周做不完 | 中 | **优先保证**：基础设施(W1-3) + 核心方法(W4-7) + 最简实验(W8-9) + 论文初稿(W11)；Phase 3 自改进和精细消融可以延后 |
| 投稿 DDL 赶不上 | 低 | EMNLP/ACL/NAACL/AAAI/IJCAI 全年有多个窗口；先写完再选会议 |

**如果真的只有 8 周怎么办**（压缩版）：

| 周 | 内容 |
|----|------|
| 1–2 | 后端 SSE + CoW 沙箱 + 轨迹存储（合并） |
| 3–5 | 轨迹编译器全部（状态抽象+DAG+异常+CompiledApp） |
| 6 | 任务集设计 + 策略真分支 |
| 7 | 实验 + 消融 |
| 8 | 论文初稿 |

---

## 12. 每周例行清单

每周一开始时复制这段到笔记本：

```markdown
## W[N] | [日期范围]

### 本周目标
- [ ] ...

### 完成情况
- [ ] ...

### 阻塞项
- ...

### 论文进展
- 新增段落/图表：
- 累计页数：

### 下周计划
- [ ] ...

### 实验记录
| 实验ID | 策略配置 | 任务范围 | 成功率 | 迭代轮次 | 耗时 | 备注 |
|--------|---------|---------|--------|---------|------|------|
| ... | ... | ... | ... | ... | ... | ... |
```

---

## 附录 A：技术细节去哪看

- **前后端仿真契约、SSE 事件、演示/真实分流规则**：只看 **`design_docs/build-design4llm.md`**（给实施者 / LLM 用，随代码更新）。
- **产品级仿真叙事与线框**：`design_docs/simulation-build-design.md`。
- 本篇**不再维护**「文件路径速查」类附录，避免与契约文档重复、也容易过期。

## 附录 B：论文用语对照

| 代码/设计文档中的术语 | 论文中的写法 |
|---------------------|-------------|
| 仿真构建 | simulation-based application construction |
| 想定式构建 | scenario-driven construction |
| 元应用 | meta-application / composite agent application |
| 经验固化 | trace compilation / experience crystallization |
| 黄金轨迹 | golden trace / verified execution trace |
| 沙箱中间层 | Copy-on-Write sandbox proxy |
| 规划智能体 | Planner Agent |
| 验证智能体 | Verifier Agent |
| 拟真数据 | simulated / synthetic data |
| 调度方案 | execution plan / tool invocation sequence |
| MCP 服务 | MCP-compliant tool server |
| 策略 M1–M5 | module-level strategy configurations |

---

*文档修订*

| 日期 | 说明 |
|------|------|
| 2026-04-12 | 初版：完整 12 周指导、数据结构、实验手册、论文写作模板、代码库地图 |
| 2026-04-14 | §4.1.1：补充 ReUseIt / FlowMind / TIM 与 EvolveR 的公开代码情况，及「方法复现 vs 原仓库跑分」与论文表述建议 |
| 2026-04-15 | §4.2：新增相关工作技术详解（8 篇机制要点、迁移建议、对照总表） |
| 2026-04-16 | §4.1.1 / §4.2.3：更正 TIM——补充 [trajectory-tips](https://github.com/adamkrawczyk/trajectory-tips) 为基于 IBM 论文的社区实现（非官方） |
| 2026-04-29 | 文档分工：`build-design4llm.md` = LLM/工程契约；研究篇侧重傻瓜操作与目的，删附录路径表、弱化 §9 实现罗列 |
| 2026-04-29 | **工程进展同步**：标记 W1/W3 已完成（SimulationOrchestrator + FileTraceStore）；更新 §0.2 本地环境（nvm/venv/三服务启动）；更新 §3.1 已有能力；更新 §3.2 缺口表（3 项标记完成） |
