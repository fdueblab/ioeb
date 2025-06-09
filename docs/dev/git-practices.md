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

# 查看提交历史
git log --oneline --graph

# 查看文件修改
git diff
git diff --cached  # 查看暂存区修改
```

### 撤销操作
```bash
# 撤销工作区修改
git checkout -- <file>

# 撤销暂存区修改
git reset HEAD <file>

# 修改最后一次提交
git commit --amend
```

### 分支操作
```bash
# 查看所有分支
git branch -a

# 删除本地分支
git branch -d feature/old-branch

# 删除远程分支
git push origin --delete feature/old-branch
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