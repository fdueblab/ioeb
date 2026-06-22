# 生产与开发测试环境隔离及发布流程建设报告

本文档用于汇报 IOEB 平台从“线上即开发测试环境”演进到“开发测试环境与生产环境隔离”的阶段性工作进展，并沉淀后续稳定执行的发布流程。

## 一、建设结论

截至 2026-06-23，平台已完成以下关键改造：

- 开发测试环境与生产环境已拆分，默认分支合并后部署到开发测试环境，生产环境只通过 GitHub Release 发布。
- 生产数据库与开发测试数据库已隔离，生产侧切换到独立数据库 `ioeb-production`，开发测试侧继续使用 `ioeb-dev`。
- COS 对象存储已通过环境前缀隔离新增资源，生产使用 `prod` 前缀，开发测试使用 `staging` 前缀。
- 平台生产发布范围已收敛为四个核心容器：`backend`、`agent`、`frontend`、`docs`。
- `project-1` 到 `project-4` 以及 `linezolid` 已从平台发布主链路中拆出，改为单独的服务镜像发布流程。
- 生产发布流程已固化到 GitHub Actions，`Platform Release` workflow 已验证 dry-run 成功。
- `v2026.06.23` 已按新规则完成一次生产闭环发布，核心平台四个容器全部部署成功，`Build & Deploy Services` 按预期跳过。

## 二、背景问题

早期平台没有严格区分开发测试环境和生产环境。线上环境承担了开发测试、用户试用、内测验证等多种职责，随着系统进入内测阶段，这种模式暴露出几个问题：

- 开发改动直接影响用户正在使用的线上版本。
- 数据库、COS 等状态资源没有清晰环境边界。
- 每次推送后的自动部署与正式生产发布缺乏区分。
- 平台核心服务和科研项目服务混在同一个发布链路里，非核心服务构建失败会阻塞核心平台上线。
- 版本号、发布记录、回滚目标缺乏统一规则。

本轮改造的目标是把现有线上版本正式定义为生产环境，并新增独立开发测试环境，让后续迭代具备稳定、可审计、可回滚的发布机制。

## 三、环境边界

### 3.1 环境职责

| 环境 | 域名 | 触发方式 | 主要用途 |
| --- | --- | --- | --- |
| 开发测试环境 | `dev.fdueblab.cn` | 默认分支 push 后自动部署 | PR 合并后的集成验证、人工测试、后续自动化测试 |
| 生产环境 | `fdueblab.cn` | GitHub Release 触发 | 内测用户真实使用环境 |

默认分支仍然承担开发测试环境部署职责：

| 仓库 | 默认分支 |
| --- | --- |
| `fdueblab/ioeb` | `master` |
| `fdueblab/ioeb_backend` | `main` |
| `fdueblab/Micro-Agent` | `master` |

### 3.2 部署目录

| 环境 | SSH alias | 部署目录 |
| --- | --- | --- |
| 生产环境 | `fdueblab` | `~/ioeb` |
| 开发测试环境 | `fdueblab-dev` | `/root/ioeb` |

开发测试环境使用独立服务器，避免同一台机器上运行两套 Docker Compose 造成端口、容器名、数据目录和 Nginx 配置冲突。

### 3.3 Docker Compose 与项目服务

平台主服务通过 Docker Compose 编排。开发测试环境中，`project-1` 到 `project-4` 不作为真实服务部署，已改为占位，避免不必要的镜像拉取、模型文件、端口和依赖维护成本。

生产环境中这些服务仍可保留，但不再随平台核心版本自动发布。需要更新时走单独的 `services-v*` 发布流程。

## 四、状态资源隔离

### 4.1 数据库

| 用途 | 数据库 |
| --- | --- |
| 生产环境 | `ioeb-production` |
| 开发测试环境 | `ioeb-dev` |
| 银联 demo 历史环境 | `ioeb-prob` |

处理结果：

- 保留历史 `ioeb-dev` 和 `ioeb-prob`。
- 新建生产数据库 `ioeb-production`。
- 从原线上数据库完整同步表结构和数据到 `ioeb-production`。
- 生产后端切换到 `ioeb-production` 并重启生效。
- 已通过登录登出操作记录确认生产与开发测试数据库隔离。

后续规则：

- 开发测试环境可以承载日常测试数据。
- 生产数据库仅由生产服务写入。
- 涉及 schema 变更或批量数据修正时，生产发布前必须确认备份、回滚或补偿方案。

### 4.2 COS 对象存储

COS 采用环境前缀隔离新增对象：

| 环境 | COS 前缀 |
| --- | --- |
| 生产环境 | `prod` |
| 开发测试环境 | `staging` |

处理原则：

- 新上传资源按环境前缀隔离。
- 历史文档图片等已存在资源不做无意义复制，避免破坏已有文档引用。
- 删除操作增加环境前缀保护，降低跨环境误删风险。

因此，已有文档中的图片引用不会因为新增前缀策略而失效；后续新增上传会按当前运行环境落到对应前缀。

## 五、发布范围重构

### 5.1 平台核心发布范围

平台生产发布固定为四个核心容器：

| 容器 | 来源仓库 | 说明 |
| --- | --- | --- |
| `backend` | `fdueblab/ioeb_backend` | 后端 API 与业务逻辑 |
| `agent` | `fdueblab/Micro-Agent` | 智能体运行组件 |
| `frontend` | `fdueblab/ioeb` | 前端应用 |
| `docs` | `fdueblab/ioeb` | 用户与开发文档站 |

这四个容器是后续频繁发布的主要对象。

### 5.2 服务镜像独立发布范围

以下服务不再随平台核心版本发布：

- `linezolid`
- `project-1`
- `project-2`
- `project-3`
- `project-4`

原因：

- 它们不属于每周平台主链路的必要发布对象。
- 依赖和镜像构建更重，失败概率更高。
- 与核心平台绑定会导致非核心服务失败阻塞登录、前端、后端、文档上线。

后续只有创建 `services-vYYYY.MM.DD` 或 `services-vYYYY.MM.DD.N` release 时，才会触发 `Build & Deploy Services`。

### 5.3 DGL 构建问题修复

第一次生产发布中，`project-1`、`project-2`、`project-4` 构建失败，原因是 Dockerfile 中未固定 DGL 版本，`pip install dgl` 解析到了当前不可下载的 `dgl 2.5.0` wheel。

处理结果：

- `project-1`、`project-2` 固定为 `dgl==2.3.0`。
- `project-4` 保留并尊重已有 `dgl==2.2.1`。
- Dockerfile 改为通过 PyTorch 2.3 专用 wheel 源安装 requirements 中声明的 DGL 版本。

该修复保障后续服务镜像单独发布时不再因 unpinned DGL 解析到不可用版本而失败。

## 六、发布流程固化

### 6.1 开发测试发布

开发测试发布由默认分支 push 自动触发。

常规流程：

1. 从默认分支创建功能分支。
2. 完成开发并提交 PR。
3. PR 合并到默认分支。
4. GitHub Actions 构建镜像并推送。
5. Actions 调用开发测试环境 webhook。
6. 开发测试环境拉取镜像并重启对应容器。
7. 在 `dev.fdueblab.cn` 完成人工测试或自动化测试。

所有代码改动必须通过 PR 合并，不直接推送默认分支。

### 6.2 生产核心平台发布

生产核心平台发布通过 `fdueblab/ioeb` 仓库的 `Platform Release` workflow 执行。

操作入口：

```text
fdueblab/ioeb -> Actions -> Platform Release -> Run workflow
```

常规输入：

| 输入 | 示例 | 说明 |
| --- | --- | --- |
| `mode` | `release` | 执行生产发布；`dry-run` 只生成计划 |
| `version` | `v2026.06.24` | 生产版本号 |
| `confirm_version` | `v2026.06.24` | 发布确认，必须与 `version` 相同 |
| `backend_ref` | `main` | 后端发布 ref |
| `agent_ref` | `master` | 智能体发布 ref |
| `ioeb_ref` | `master` | 前端与文档发布 ref |

workflow 自动执行：

1. 校验版本号格式。
2. 校验 `confirm_version`。
3. 检查 `dev.fdueblab.cn` 与 `fdueblab.cn` 健康状态。
4. 将三个仓库 ref 解析为固定 commit SHA。
5. 生成 release manifest。
6. dry-run 输出发布计划。
7. 进入 `production` environment。
8. 创建三个仓库同名 GitHub Release。
9. 等待四个核心容器构建、推送、部署完成。

如 GitHub Environment `production` 配置了 required reviewers，真正创建生产 release 前会在 GitHub Actions 页面等待人工批准。

### 6.3 版本号规则

常规发布使用日期版本号：

```text
v2026.06.24
```

同一天多次发布时追加补丁序号：

```text
v2026.06.24
v2026.06.24.1
v2026.06.24.2
```

规则：

- 当天第一次发布：`vYYYY.MM.DD`
- 当天第二次发布：`vYYYY.MM.DD.1`
- 当天第三次发布：`vYYYY.MM.DD.2`

### 6.4 服务镜像发布

服务镜像不随平台核心发布自动部署。

需要发布 `linezolid` 或 `project-*` 时，在 `fdueblab/ioeb` 创建：

```text
services-vYYYY.MM.DD
services-vYYYY.MM.DD.N
```

只有 `services-v*` 会触发 `Build & Deploy Services` 生产部署。普通 `v*` 平台版本下，该 workflow 会被跳过。

## 七、自动化发布依赖

`Platform Release` workflow 依赖 `fdueblab/ioeb` 仓库中的 Repository secret：

```text
PLATFORM_RELEASE_TOKEN
```

该 token 需要能在以下三个仓库创建 GitHub Release，并读取 Actions 状态：

- `fdueblab/ioeb_backend`
- `fdueblab/Micro-Agent`
- `fdueblab/ioeb`

权限建议：

| Token 类型 | 权限 |
| --- | --- |
| Fine-grained token | 三个仓库的 `Contents: Read and write`、`Actions: Read` |
| Classic token | `repo` scope |

安全注意：

- token 不应通过聊天、文档或代码明文传递。
- 如 token 曾明文暴露，应生成新 token 后重新设置 secret，并撤销旧 token。
- 建议配置 GitHub Environment `production` 的 required reviewers，保留生产发布人工确认点。

## 八、已完成 PR 与验证

| PR | 仓库 | 内容 |
| --- | --- | --- |
| `#117` | `fdueblab/ioeb` | 建立生产发布脚本、release manifest 模板和发布流程文档 |
| `#64` | `fdueblab/Micro-Agent` | 限制 PyPI 发包只响应 `sdk-v*`，避免平台发布误触发 |
| `#118` | `fdueblab/ioeb` | 拆分平台发布与服务镜像发布，修复 DGL pin |
| `#119` | `fdueblab/ioeb` | 新增 `Platform Release` GitHub Actions 自动化入口 |

关键验证结果：

- `v2026.06.23` 按新流程完成生产闭环发布。
- `backend`、`agent`、`frontend`、`docs` 全部成功构建、推送、部署。
- `Build & Deploy Services` 在 `v2026.06.23` 下按预期跳过。
- 生产健康检查 `https://fdueblab.cn/api/health` 返回正常。
- `Platform Release` workflow dry-run 已成功，证明 Actions 自动生成 manifest、解析 commit、健康检查、上传 artifact 的链路可用。

相关 release：

- `fdueblab/ioeb_backend`: `v2026.06.23`
- `fdueblab/Micro-Agent`: `v2026.06.23`
- `fdueblab/ioeb`: `v2026.06.23`

## 九、发布前后检查清单

### 发布前

- PR 均已合并到默认分支。
- 开发测试环境核心链路已通过人工测试或自动化测试。
- 数据库变更已确认备份、回滚或补偿方案。
- 本次发布版本号符合规则。
- `Platform Release` 输入的 ref 符合预期。
- 如本次只发布核心平台，不创建 `services-v*`。

### 发布中

- 观察 `Platform Release` workflow 是否成功。
- 确认 `backend`、`agent`、`frontend`、`docs` 对应 release workflow 成功。
- 确认 `Build & Deploy Services` 在普通 `v*` 发布中为 skipped。

### 发布后

- 检查生产健康接口：

```bash
curl -fsSL https://fdueblab.cn/api/health
```

- 打开生产前端并完成登录。
- 检查关键业务链路。
- 如涉及日志或审计，确认记录写入生产数据库。
- 记录版本号、发布时间、发布 commit 和回滚目标。

## 十、后续建议

- 将当前人工测试用例逐步沉淀为 E2E 自动化测试，并在生产发布前自动执行。
- 配置 GitHub Environment `production` required reviewers，保证 release job 有明确人工批准点。
- 为数据库变更建立固定 migration、backup、rollback 规范。
- 在首次需要更新 `project-*` 或 `linezolid` 时，单独走一次 `services-v*` 发布验证。
- 定期轮换 `PLATFORM_RELEASE_TOKEN`，并避免在聊天、文档、代码中明文出现。
