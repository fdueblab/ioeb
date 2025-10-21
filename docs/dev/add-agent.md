# 智能体添加指南

本指南将详细介绍如何在Micro-Agent项目中添加新的智能体，以MCP服务推荐智能体为例。

::: tip 快速导航
- [概述](#概述)
- [核心步骤](#核心步骤)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
  :::

## 概述

在[Micro-Agent项目](https://github.com/PolarSnowLeopard/Micro-Agent)中添加智能体需要完成以下步骤：

1. 创建任务模块（Task Module）
2. 在app.py中添加API端点
3. 配置MCP服务器
4. 接入平台验证

## 核心步骤

### 步骤1：创建任务模块

在`app/task/`目录下创建新的任务模块文件。

```python
# app/task/your_task.py
def get_your_task_prompt(param1: str, param2: str):
    return f"""你的智能体提示词..."""
```

**关键要点**：
- 使用`get_<task_name>_prompt`的命名规范
- 根据任务需要设计合适的参数
- 包含具体的数据库表名和SQL查询，避免智能体试错
- 明确定义期望的JSON输出格式

### 步骤2：在app.py中添加API端点

#### 2.1 添加导入语句

```python
from app.task.your_task import get_your_task_prompt
```

#### 2.2 添加API端点

```python
@app.post("/api/agent/your_task", tags=["api"])
async def your_task(param1: str = Form(...), param2: str = Form(...)):
    prompt = get_your_task_prompt(param1, param2)
    task_config = {
        "prompt": prompt,
        "outputs": [{"name": "result", "file": "output.json"}],
        "server_config": [...]
    }
    return create_streaming_response(create_stream_generator(...))
```

**配置要点**：
- 使用`/api/agent/<task_name>`的命名规范
- 使用`Form(...)`定义必需参数
- 包含完整的异常处理和资源清理
- 使用`create_stream_generator`和`create_streaming_response`

### 步骤3：配置MCP服务器

```python
"server_config": [
    {
        "connection_type": "stdio",  # 或 "sse"
        "server_url": None,          # SSE连接时使用
        "command": "python",         # 启动命令
        "args": ["-m", "app.mcp.mysql_server.server"],  # 启动参数
        "server_id": "mysql_server"  # 服务器标识
    }
]
```

**连接类型**：
- **stdio**：标准输入输出连接，用于本地服务器
- **sse**：Server-Sent Events连接，用于远程服务器

**常用MCP服务器**：
- MySQL服务器：`app.mcp.mysql_server.server`
- 时间服务器：`app.mcp.time_server`
- AML服务器：`app.mcp.aml_server.server`
- DeepSeek服务器：`app.mcp.deepseek_server.server`

### 步骤4：接入与验证

#### 4.1 接入平台

可以在[平台前端项目](https://github.com/PolarSnowLeopard/ioeb)中使用API调用的方式接入智能体：

```javascript
const formData = new FormData();
formData.append('param1', 'value1');
formData.append('param2', 'value2');

streamAgent('/api/agent/your_task', formData, callback);
```

#### 4.2 验证要点

- 检查API端点是否正常响应
- 验证流式输出是否正常工作
- 确认最终结果格式是否符合预期
- 测试错误处理是否有效

## 最佳实践

### 1. 提示词设计

- **明确任务目标**：清晰描述智能体的职责
- **提供具体指导**：包含数据库表名、SQL查询等具体信息
- **定义输出格式**：详细说明期望的JSON结构
- **避免歧义**：使用明确的指令和约束条件

### 2. 错误处理

- **资源清理**：确保临时文件被正确清理
- **异常捕获**：捕获并记录所有可能的异常
- **用户反馈**：提供有意义的错误信息

### 3. 性能优化

- **减少试错**：在提示词中提供具体的查询语句
- **合理配置**：根据任务需要配置合适的MCP服务器
- **资源管理**：及时清理临时文件和资源

### 4. 代码规范

- **命名规范**：使用一致的命名约定
- **文档注释**：为函数和类添加详细的文档字符串
- **模块化设计**：将任务逻辑分离到独立的模块中

## 常见问题

### Q1: 如何添加新的MCP服务器？

A1: 在`app/mcp/`目录下创建新的服务器模块，然后在任务配置中引用。

### Q2: 如何处理复杂的数据库查询？

A2: 在提示词中提供具体的SQL查询语句，避免智能体试错。

### Q3: 如何自定义输出格式？

A3: 在任务模块的prompt函数中详细定义期望的JSON结构。

### Q4: 如何调试智能体问题？

A4: 检查日志输出，验证prompt内容，确认MCP服务器配置正确。
