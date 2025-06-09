# Git 工作流与最佳实践

本文档规定了我们团队的Git使用规范，请所有开发成员严格遵守。

## 🌳 分支管理策略

### 主要分支
- **master** - 生产环境分支，只接受来自develop的合并
- **develop** - 开发主分支，功能开发完成后合并到此分支
- **feature/xxx** - 功能开发分支，从develop分出，开发完成后合并回develop

### 分支命名规范
```
feature/用户名-功能描述
例如：feature/zhangsan-mcp-server-impl
例如：feature/lisi-agent-simulation-ui
```

## 📝 提交信息规范

### 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型
- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更新
- **style**: 代码格式调整（不影响功能）
- **refactor**: 代码重构
- **test**: 测试相关
- **chore**: 构建工具、依赖更新等

### 示例
```
feat(mcp-server): 实现算法模型自动封装为MCP Server

- 添加代码解析模块
- 实现Docker容器自动构建
- 完成微服务注册机制

Closes #123
```

## 🔄 工作流程

### 1. 开始新功能开发
```bash
# 切换到develop分支并拉取最新代码
git checkout develop
git pull origin develop

# 创建功能分支
git checkout -b feature/你的名字-功能描述

# 开始开发...
```

### 2. 开发过程中
```bash
# 经常提交小的改动
git add .
git commit -m "feat(scope): 具体改动描述"

# 定期推送到远程
git push origin feature/你的名字-功能描述
```

### 3. 功能开发完成
```bash
# 确保develop分支最新
git checkout develop
git pull origin develop

# 回到功能分支，rebase到最新develop
git checkout feature/你的名字-功能描述
git rebase develop

# 解决冲突（如果有）
# ... 解决冲突 ...
git add .
git rebase --continue

# 推送更新
git push origin feature/你的名字-功能描述 --force-with-lease
```

### 4. 创建Pull Request
1. 在GitHub上创建PR，从你的feature分支到develop
2. 填写PR描述，说明改动内容
3. 指定审查者（通常是项目负责人）
4. 等待代码审查和合并

### 5. 合并策略（重要！解决merge记录问题）

#### 🎯 推荐：使用Squash Merge
```bash
# 在GitHub PR页面选择 "Squash and merge"
# 这会将你的多个提交合并为一个清晰的提交记录
```

**优点**：
- 保持develop分支历史简洁
- 每个功能对应一个提交记录
- 易于回滚和代码追踪

#### 🔄 替代方案：Interactive Rebase
如果需要本地合并提交：
```bash
# 在功能分支上，合并最近3个提交
git rebase -i HEAD~3

# 在编辑器中：
# pick <commit1>    第一个提交保持不变
# squash <commit2>  合并到第一个提交
# squash <commit3>  合并到第一个提交

# 编辑合并后的提交信息
git commit --amend
```

#### ❌ 避免使用：常规Merge
```bash
# 避免这样做，会产生大量merge记录
git checkout develop
git merge feature/your-branch  # 会创建merge commit
```

### 6. 清理分支
```bash
# 功能合并后删除本地分支
git branch -d feature/你的名字-功能描述

# 删除远程分支
git push origin --delete feature/你的名字-功能描述
```

## 📈 进阶：定期同步策略

### 长期功能分支同步
如果功能开发周期较长，定期同步develop：
```bash
# 每周同步一次develop分支
git checkout feature/your-branch
git fetch origin
git rebase origin/develop

# 解决冲突后推送
git push origin feature/your-branch --force-with-lease
```

### 协作分支管理
多人协作同一功能时：
```bash
# 创建共享功能分支
git checkout -b feature/team-shared-feature

# 团队成员创建子分支
git checkout -b feature/your-name-shared-feature-part

# 完成后先合并到共享分支（使用squash）
# 最后由负责人将共享分支合并到develop
```

## 🔍 代码审查流程

### 审查者责任
- 检查代码质量和规范
- 验证功能实现是否正确
- 确保没有引入新的bug
- 检查是否有充分的测试

### 被审查者责任
- 确保代码已经自测通过
- 提供清晰的PR描述
- 及时响应审查意见
- 根据反馈修改代码

## 🚫 常见错误与避免

### ❌ 不要这样做
```bash
# 直接在master分支开发
git checkout master
# 开发代码...
git commit -m "update"

# 提交信息不规范
git commit -m "fix"
git commit -m "update code"

# 强制推送到共享分支
git push origin develop --force
```

### ✅ 正确的做法
```bash
# 从develop创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/myname-new-feature

# 规范的提交信息
git commit -m "feat(auth): 添加用户认证模块"

# 安全的强制推送（只用于自己的功能分支）
git push origin feature/myname-new-feature --force-with-lease
```

## 🛠️ 实用Git命令

### 查看状态和历史
```bash
# 查看当前状态
git status

# 查看提交历史（简洁图形化）
git log --oneline --graph --decorate

# 查看分支历史（更详细）
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'

# 查看文件修改
git diff
git diff --cached  # 查看暂存区修改
```

### 清理和优化历史
```bash
# 压缩最近的N个提交
git rebase -i HEAD~N

# 查看哪些分支已经合并（可以安全删除）
git branch --merged

# 批量删除已合并的本地分支
git branch --merged | grep -v "\*\|master\|develop" | xargs -n 1 git branch -d

# 清理远程追踪分支
git remote prune origin
```

### 解决merge记录过多的紧急方案
```bash
# 如果已经有很多merge记录，可以重写历史（谨慎使用！）
# 只在个人分支或征得团队同意后使用

# 方案1：重置到某个干净的提交点
git reset --hard <clean-commit-hash>
git cherry-pick <commit1> <commit2> <commit3>  # 挑选需要的提交

# 方案2：创建新的干净分支
git checkout -b feature/your-name-clean-version
git cherry-pick <needed-commits>
```

### 撤销操作
```bash
# 撤销工作区修改
git checkout -- <file>

# 撤销暂存区修改
git reset HEAD <file>

# 修改最后一次提交
git commit --amend

# 撤销最近的merge（如果还没有推送）
git reset --hard HEAD~1
```

### 分支操作
```bash
# 查看所有分支
git branch -a

# 查看分支的上游关系
git branch -vv

# 删除本地分支
git branch -d feature/old-branch

# 强制删除本地分支
git branch -D feature/old-branch

# 删除远程分支
git push origin --delete feature/old-branch

# 重命名当前分支
git branch -m new-branch-name
```

## 📋 检查清单

提交代码前请确认：
- [ ] 代码已经自测通过
- [ ] 提交信息符合规范
- [ ] 没有提交不必要的文件（检查.gitignore）
- [ ] 代码符合团队编码规范
- [ ] 相关文档已更新

创建PR前请确认：
- [ ] 功能分支已rebase到最新develop
- [ ] 所有测试通过
- [ ] PR描述清晰完整
- [ ] 指定了合适的审查者

---

遇到Git问题时，可以：
1. 查阅本文档
2. 在团队群询问
3. 向项目负责人请教 