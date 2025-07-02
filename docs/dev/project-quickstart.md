# 平台项目快速开始

本文档介绍了平台各项目的quick start方案，便于开发成员快速概览并尝试开发相应项目。

## 平台简介

本平台是一个面向垂直领域的AI算法模型智能体平台，支持算法微服务化、应用构建和智能运维管理。

## 📦 相关仓库

本项目采用前后端分离架构，包含以下核心组件：

- **前端界面**: [ioeb](https://github.com/PolarSnowLeopard/ioeb) - Vue.js前端界面，提供可视化操作平台
- **后端服务**: [ioeb_backend](https://github.com/PolarSnowLeopard/ioeb_backend) - Flask后端API服务，处理算法微服务化和业务逻辑
- **智能体框架**: [Micro-Agent](https://github.com/PolarSnowLeopard/Micro-Agent) - 微服务智能体开发框架，支持算法快速封装为可调用的智能体服务

## 🚀 前端项目quick start

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

## 🚀 后端项目quick start

### 环境要求

- **python**: 3.10

### 安装依赖

```bash
pip install -r requirements.txt
```

### 环境变量配置

创建`.env`文件并设置以下变量：

```
FLASK_APP=wsgi.py
FLASK_DEBUG=1
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///dev.db
REMOTE_SERVICE_URL=http://your-remote-service.com/api/process
```

### 初始化数据库

```bash
python manage.py create_db  # 创建数据库表
python manage.py seed_db    # 添加示例数据
```

### 运行应用

```bash
python wsgi.py
```

或者使用Flask CLI：

```bash
flask run
```

### 运行模拟服务

```bash
python -m mocks.run
```

### 访问Swagger文档

应用启动后，访问：
```
http://localhost:5000/api/docs
```

### 更新数据库

项目内包含数据库更新脚本，运行脚本会清空现有数据并写入mock内的数据：
```bash
# Windows
refresh_dev_db.bat

# Linux
cd ioeb_backend
./db.sh
```
⚠️ 注意：此操作会删除当前数据库数据并且不可恢复

### 部署
```bash
cd ioeb_backend
docker-compose up -d
```

## 🚀 智能体框架quick start

### 通过 Docker 运行（推荐）

```bash
# 克隆项目
git clone https://github.com/PolarSnowLeopard/Micro-Agent
cd Micro-Agent

# 配置环境
cp .env.example .env
cp config/config.example.toml config/config.toml
# 编辑配置文件，设置API密钥等

# 启动容器
docker-compose up -d
docker-compose exec micro_agent bash

# 在容器内运行
python main.py
# 或启动Web界面
python app.py  # 访问 http://localhost:8010
```

### 本地环境运行

```bash
# 克隆项目
git clone https://github.com/PolarSnowLeopard/Micro-Agent
cd Micro-Agent

# 创建Python环境（推荐3.12）
conda create -n micro-agent python=3.12
conda activate micro-agent

# 配置环境
cp .env.example .env
cp config/config.example.toml config/config.toml
# 编辑配置文件，设置API密钥等

# 安装依赖
pip install -r requirements.txt

# 运行项目
python main.py
# 或启动Web界面
python app.py  # 访问 http://localhost:8010
```

> ⚠️ **安全提示**：由于本项目可能执行系统命令，强烈建议在容器环境中运行，以避免对宿主系统的潜在影响。

### 使用 main.py 构建智能体

`main.py` 是框架的核心入口，可以快速利用已有的 MCP 服务器构建智能体。

#### 1. 配置 MCP 服务器

在 `config.json` 文件中配置要连接的 MCP 服务器：

```json
{
  "servers": [
    {
      "connection_type": "sse",
      "server_url": "http://your-server.com/sse",
      "command": null,
      "args": null,
      "server_id": "remote_sse_server"
    },
    {
      "connection_type": "stdio",
      "server_url": null,
      "command": "python",
      "args": ["-m", "your_module.mcp_server"],
      "server_id": "local_stdio_server"
    }
  ]
}
```

**MCP 服务器配置说明：**

- `connection_type`: 连接类型，支持 `"sse"` 和 `"stdio"`
- `server_url`: SSE 服务器 URL（仅用于 SSE 类型）
- `command`: 启动命令（仅用于 stdio 类型）
- `args`: 命令参数（仅用于 stdio 类型）
- `server_id`: 服务器标识符（可选，自动生成）

**连接类型详解：**

1. **SSE 连接**：适用于远程 MCP 服务器
  - 通过 HTTP/SSE 协议连接
  - 需要提供 `server_url`
  - 适合连接部署在其他服务器上的 MCP 服务

2. **Stdio 连接**：适用于本地 MCP 服务器
  - 通过子进程启动 MCP 服务器
  - 需要提供 `command` 和 `args`
  - 适合运行本地 Python 模块作为 MCP 服务

#### 2. 编写提示词和配置智能体

在 `main.py` 的 `if __name__ == "__main__":` 部分直接修改智能体配置：

```python
if __name__ == "__main__":
    # 直接配置智能体名称（可以是任何你想要的名称）
    agent_name = "Code Analysis Agent"  # 或 "我的智能助手" 等
    
    # 定义任务提示词
    prompt = """
你是一个专业的代码分析师。
请分析给定的代码库结构，识别主要功能模块，并生成分析报告。

请按以下步骤执行：
1. 检查项目文件结构
2. 分析主要代码文件
3. 识别依赖关系
4. 生成分析报告
"""
    
    # 运行智能体（task_name用于生成保存的文件名）
    asyncio.run(run_agent("code_analysis", prompt))
```

**配置说明：**
- `agent_name`: 智能体显示名称，可以任意自定义
- `prompt`: 任务提示词，定义智能体的角色和任务
- `task_name`（第一个参数）: 用于生成保存文件的名称

#### 3. 智能体执行流程

智能体会自动：
1. 连接配置的所有 MCP 服务器
2. 获取可用工具列表
3. 根据提示词执行任务
4. 保存执行记录到 JSON 文件
5. 生成可视化 HTML 报告

#### 4. 查看可视化结果

执行结果文件会保存在 `visualization/` 目录下：
- `{task_name}_record.json`: 执行记录（JSON格式）
- `{task_name}.html`: 可视化报告（HTML格式）

**查看可视化报告：**

```bash
# 切换到可视化目录
cd visualization

# 启动本地HTTP服务器
python -m http.server 8000

# 在浏览器中访问
# http://localhost:8000/{task_name}.html
```