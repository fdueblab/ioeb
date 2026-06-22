# 生产发布流程

本文档定义 IOEB 平台的开发测试环境与生产环境发布流程。

## 环境规则

- 合并到默认分支后自动部署到开发测试环境 `dev.fdueblab.cn`。
- 生产环境只通过 GitHub Release 发布。
- 所有代码改动必须通过 Pull Request 合并。
- 常规生产发布固定在每周三执行。
- 紧急修复使用补丁版本发布，并在发布记录中说明原因。

## 版本号

常规发布使用日期版本号：

```text
v2026.06.24
v2026.07.01
```

同一天补丁发布追加补丁序号：

```text
v2026.06.24.1
```

## 发布组件

平台生产发布包含三个仓库：

| 组件 | 仓库 | 生产部署内容 |
| --- | --- | --- |
| 后端 | `fdueblab/ioeb_backend` | `backend` |
| 智能体 | `fdueblab/Micro-Agent` | `agent` |
| 前端与文档 | `fdueblab/ioeb` | `frontend`、`docs` |

推荐发布顺序：

```text
ioeb_backend -> Micro-Agent -> ioeb
```

后端先发布，可以降低前端调用新接口时遇到旧后端的风险。

## 每周发布节奏

1. 周一到周二正常合并 PR，改动自动部署到开发测试环境。
2. 周二下午冻结本周候选版本，记录三个仓库的 commit SHA。
3. 周二晚或周三上午在开发测试环境完成冒烟测试。
4. 周三创建生产 GitHub Release，触发生产部署。
5. 发布后记录 release notes、已发布 commit、验证结果和回滚目标。

## Release Manifest

生产发布必须使用 release manifest 固定三个仓库的发布 commit。复制模板：

```bash
cp release/platform-release.example.json release/platform-release.v2026.06.24.json
```

将 `version` 和每个组件的 `ref` 替换为冻结时验证过的 commit SHA。不要在正式发布 manifest 中保留 `main` 或 `master`。

查看本地发布计划：

```bash
python3 scripts/create-platform-release.py release/platform-release.v2026.06.24.json
```

确认无误后创建生产发布：

```bash
python3 scripts/create-platform-release.py release/platform-release.v2026.06.24.json --execute
```

脚本会按 manifest 顺序创建三个仓库的同名 GitHub Release，并等待对应 release workflow 成功完成。创建 GitHub Release 会触发生产部署 webhook。

如果确实需要重跑已有 release，可使用：

```bash
python3 scripts/create-platform-release.py release/platform-release.v2026.06.24.json --execute --skip-existing
```

## 服务镜像发布

`linezolid` 和 `project-1` 到 `project-4` 不随每周平台发布自动部署，避免某个科研服务镜像构建失败阻塞核心平台上线。

这些服务需要单独发布时，在 `fdueblab/ioeb` 创建 `services-vYYYY.MM.DD` 或 `services-vYYYY.MM.DD.N` 格式的 GitHub Release。只有这个前缀会触发 `Build & Deploy Services` 的生产部署；前端和文档 workflow 只响应 `v*` 平台版本，不会被服务版本误触发。

服务发布前需要额外确认：

- 需要发布的服务镜像在开发测试环境或本地构建通过。
- 该服务依赖的数据、模型文件和端口配置已在生产环境准备好。
- 如果只需要发布前端、后端、文档或智能体，不要创建 `services-v*` release。

## 发布前检查

发布前至少确认：

- 开发测试环境首页、登录、核心 API 健康检查正常。
- 生产数据库已按发布风险完成备份。
- 涉及数据库结构或数据修正时，已准备回滚或补偿脚本。
- 生产当前版本和镜像 tag 已记录。
- Release manifest 中所有 `ref` 都是固定 commit SHA。

## 发布后检查

发布后至少确认：

- `https://fdueblab.cn/api/health` 返回正常。
- 前端首页可以打开并登录。
- 关键业务链路可用。
- 微服务代理 `/mcp-proxy/{port}/...` 可用。
- 新增日志或审计记录写入生产数据库。

## 回滚

回滚优先使用上一版 release manifest 对应的镜像 tag，不通过临时改代码回滚。回滚步骤：

1. 找到上一版生产 release manifest。
2. 重新部署上一版各组件镜像。
3. 如果发布包含数据库破坏性变更，执行预先准备的回滚或补偿脚本。
4. 验证生产健康检查和关键链路。
5. 在事故记录中说明回滚原因、影响范围和后续修复计划。

## Micro-Agent PyPI 发布

平台生产发布和 SDK 发包是两类动作。平台发布使用 `vYYYY.MM.DD` 标签；PyPI 发包使用 `sdk-vX.Y.Z` 标签，避免每周平台发布误触发 Python 包发布。
