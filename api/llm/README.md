# FastAPI LLM 流式服务

这是一个使用FastAPI实现的大语言模型流式API服务，它可以将用户的请求转发给大模型（如OpenAI的GPT模型），并以流式方式返回模型生成的结果。

## 功能特性

- 基于FastAPI构建的API服务
- 支持流式返回大模型的响应
- 可配置不同的模型和参数
- 简单的错误处理机制

## 安装方法

1. 克隆项目代码
2. 安装依赖:
   ```bash
   pip install -r requirements.txt
   ```
3. 配置环境变量:
   ```bash
   cp .env.example .env
   ```
   然后编辑`.env`文件，填入你的OpenAI API密钥

## 使用方法

### 启动服务

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

或者直接运行:

```bash
python main.py
```

### API调用示例

可以使用以下代码调用API:

```python
import requests
import json

# 使用Server-Sent Events格式接收流式响应
def chat_with_model(messages):
    url = "http://localhost:8000/api/chat"
    headers = {"Content-Type": "application/json"}
    data = {
        "messages": messages,
        "model": "gpt-3.5-turbo",  # 指定模型
        "temperature": 0.7         # 可选参数
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(data), stream=True)
    
    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                data = line[6:]  # 去掉'data: '前缀
                if data == "[DONE]":
                    break
                try:
                    content = json.loads(data)
                    if 'content' in content:
                        print(content['content'], end='', flush=True)
                except json.JSONDecodeError:
                    pass

# 示例调用
messages = [
    {"role": "user", "content": "你好，请介绍一下自己"}
]
chat_with_model(messages)
```

### 前端示例

对于JavaScript/前端应用，可以使用EventSource接收流式响应:

```javascript
async function chatWithModel(messages) {
  const response = await fetch("http://localhost:8000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messages,
      model: "gpt-3.5-turbo",
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n\n");
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.substring(6);
        if (data === "[DONE]") break;
        
        try {
          const content = JSON.parse(data);
          if (content.content) {
            // 处理收到的内容
            console.log(content.content);
          }
        } catch (e) {
          // 处理解析错误
        }
      }
    }
  }
}
```

## API文档

启动服务后，访问 http://localhost:8000/docs 可查看自动生成的API文档。

## OpenAI SDK 说明

本项目使用OpenAI SDK 1.0.0+版本。如果您遇到API兼容性问题，请确保您已安装最新版本的SDK：

```bash
pip install openai>=1.0.0
```

## 故障排除

### 1. API连接问题

如果前端或测试客户端无法连接到API:
- 确认服务确实在运行中
- 检查端口号是否正确(默认8000)
- 检查OpenAI API密钥是否正确设置在.env文件中

### 2. OpenAI API错误

如果收到OpenAI API的错误:
- 确认API密钥有效且未过期
- 检查是否有足够的API余额
- 确认所请求的模型是可用的

如果需要进一步帮助，请查看健康检查端点获取更多信息:
```
GET http://localhost:8000/health
```
该端点将显示当前使用的OpenAI SDK版本和其他有用信息。 