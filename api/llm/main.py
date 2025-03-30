from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
import json
from openai import OpenAI

# 加载环境变量
load_dotenv()

# 初始化OpenAI客户端
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if os.getenv("OPENAI_API_BASE"):
    client.base_url = os.getenv("OPENAI_API_BASE")

app = FastAPI(
    title="LLM API 流式服务",
    description="LLM API 流式服务",
    version="1.0",
    docs_url="/docs",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，实际生产环境应限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "gpt-3.5-turbo"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    stream: bool = True

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    流式调用大模型API并返回结果
    """
    try:
        def generate():
            # 将Pydantic模型转换为API所需的格式
            messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
            
            # 调用新版 OpenAI SDK API
            response = client.chat.completions.create(
                model=request.model,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=True
            )
            
            # 处理流式响应
            for chunk in response:
                if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                    if hasattr(chunk.choices[0], 'delta') and hasattr(chunk.choices[0].delta, 'content'):
                        content = chunk.choices[0].delta.content
                        if content:
                            # 返回JSON格式响应
                            yield f"data: {json.dumps({'content': content})}\n\n"
                            
            # 发送结束信号
            yield "data: [DONE]\n\n"
                
        return StreamingResponse(generate(), media_type="text/event-stream")
    
    except Exception as e:
        # 这里可以添加更详细的错误处理
        return StreamingResponse(
            iter([f"data: {json.dumps({'error': str(e)})}\n\n"]),
            media_type="text/event-stream"
        )

@app.get("/", response_class=HTMLResponse)
async def root():
    """
    主页，重定向到HTML客户端
    """
    # 读取并返回static/index.html内容
    with open('static/index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.get("/health")
async def health_check():
    """
    健康检查端点
    """
    return {
        "status": "ok", 
        "message": "LLM API 服务运行正常",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 