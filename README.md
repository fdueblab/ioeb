<div align="center">

# 算法模型智能体平台

![GitHub Stars](https://img.shields.io/github/stars/PolarSnowLeopard/ioeb?style=flat&logo=github)
![GitHub Forks](https://img.shields.io/github/forks/PolarSnowLeopard/ioeb?style=flat&logo=github)
![Vue](https://img.shields.io/badge/Vue-2.6.14-4FC08D?style=flat&logo=vue.js)
![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-1.7.8-0170FE?style=flat&logo=ant-design)
![Node.js](https://img.shields.io/badge/Node.js-≥16.0.0-339933?style=flat&logo=node.js)

一个面向垂直领域的AI算法模型智能体平台，支持算法微服务化、应用构建和智能运维管理。

</div>

## 🌐 平台地址

- **平台访问**: [https://fdueblab.cn](https://fdueblab.cn) - 在线平台体验地址
- **完整文档**: [https://fdueblab.cn/docs](https://fdueblab.cn/docs) - 详细使用文档和开发指南

## 📦 相关仓库

本项目采用前后端分离架构，包含以下核心组件：

- **前端界面** (当前仓库): [ioeb](https://github.com/PolarSnowLeopard/ioeb) - Vue.js前端界面，提供可视化操作平台
- **后端服务**: [ioeb_backend](https://github.com/PolarSnowLeopard/ioeb_backend) - Flask后端API服务，处理算法微服务化和业务逻辑
- **智能体框架**: [Micro-Agent](https://github.com/PolarSnowLeopard/Micro-Agent) - 微服务智能体开发框架，支持算法快速封装为可调用的智能体服务

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 16（推荐 **18**，与仓库根目录 `.nvmrc` 一致）
- **Yarn**: >= 1.22.0 (推荐)
- **Vue CLI**: >= 5.0.8

已安装 [nvm](https://github.com/nvm-sh/nvm) 时，可在项目根目录执行 `nvm install` / `nvm use`，以统一 Node 版本。

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