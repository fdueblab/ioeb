# 算法模型智能体平台

<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/PolarSnowLeopard/ioeb?style=flat&logo=github)
![GitHub Forks](https://img.shields.io/github/forks/PolarSnowLeopard/ioeb?style=flat&logo=github)
![Vue](https://img.shields.io/badge/Vue-2.6.14-4FC08D?style=flat&logo=vue.js)
![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-1.7.8-0170FE?style=flat&logo=ant-design)
![Node.js](https://img.shields.io/badge/Node.js-≥16.0.0-339933?style=flat&logo=node.js)

一个面向垂直领域的AI算法模型智能体平台，支持算法微服务化、应用构建和智能运维管理。

</div>

## 🌐 平台地址

- **平台访问**: [https://ioeb.fdueblab.cn](https://ioeb.fdueblab.cn) - 在线平台体验地址
- **完整文档**: [https://fdueblab.cn/docs](https://fdueblab.cn/docs) - 详细使用文档和开发指南

## 📦 相关仓库

本项目采用前后端分离架构，包含以下核心组件：

- **前端界面** (当前仓库): [ioeb](https://github.com/PolarSnowLeopard/ioeb) - Vue.js前端界面，提供可视化操作平台
- **后端服务**: [ioeb_backend](https://github.com/PolarSnowLeopard/ioeb_backend) - Flask后端API服务，处理算法微服务化和业务逻辑
- **智能体框架**: [Micro-Agent](https://github.com/PolarSnowLeopard/Micro-Agent) - 微服务智能体开发框架，支持算法快速封装为可调用的智能体服务

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 16.0.0
- **Yarn**: >= 1.22.0 (推荐)
- **Vue CLI**: >= 5.0.8

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/PolarSnowLeopard/ioeb.git
cd ioeb

# 安装依赖 (推荐使用yarn)
yarn install
```

### 开发环境运行

```bash
# 启动开发服务器
yarn serve

# 访问地址: http://localhost:8000
```

### 构建部署

```bash
# 构建生产版本
yarn build

# 构建预览版本
yarn build:preview
```

## 🐳 Docker 部署

```bash
# 构建前端镜像
docker build -t algorithm-platform:latest .

# 使用 docker-compose 启动完整服务
docker-compose up -d
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🔗 相关链接

- [在线平台](https://ioeb.fdueblab.cn) - 平台体验地址
- [项目文档](https://fdueblab.cn/docs) - 完整使用文档和开发指南
- [算法提交规范](https://fdueblab.cn/docs/guide/code-template) - 算法代码提交要求
- [Ant Design Vue](https://antdv.com/) - UI 组件库文档

## 💬 技术支持

如有问题，请通过以下方式联系：

- 🐛 Issues: [GitHub Issues](https://github.com/PolarSnowLeopard/ioeb/issues)
- 📖 文档: [在线文档](https://fdueblab.cn/docs)

---

<div align="center">
  <strong>算法模型智能体平台</strong><br>
  让AI算法更容易被发现、使用和管理
</div>
