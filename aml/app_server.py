import os
import shutil
import httpx
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import dotenv

dotenv.load_dotenv()

DATA_PATH = os.getenv("DATA_PATH", "data/test_dataset.zip")
# 使用外部AML报告API
AML_REPORT_API_URL = os.getenv("AML_REPORT_API_URL", "http://fdueblab.cn/api/agent/aml_report")

# 创建FastAPI应用
app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 主页路由
@app.get("/")
async def root():
    return FileResponse("static/aml.html")

# AML报告生成API - 直接转发到真实API
@app.post("/api/agent/aml_report")
async def aml_report_endpoint(file: UploadFile = None):
    """
    处理AML报告请求
    直接调用真实的aml_report智能体API
    """
    # 使用默认数据集路径
    default_dataset_path = DATA_PATH
    
    # 检查默认数据集是否存在
    if not os.path.exists(default_dataset_path):
        return JSONResponse(
            status_code=404,
            content={"error": f"默认数据集未找到: {default_dataset_path}"}
        )
    
    # 创建转发请求到真实API的流式响应
    async def forward_to_real_api():
        # 准备要发送的文件
        files = {"file": (os.path.basename(default_dataset_path), open(default_dataset_path, "rb"), "application/zip")}
        
        # 发送请求到真实的AML报告智能体API
        real_api_url = AML_REPORT_API_URL
        
        # 使用httpx异步客户端创建流式请求
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", real_api_url, files=files) as response:
                # 转发响应头
                if response.status_code != 200:
                    yield f"data: {{\"error\": \"API返回错误状态码: {response.status_code}\", \"is_last\": true}}\n\n"
                    return
                
                # 逐块转发响应内容
                async for chunk in response.aiter_bytes():
                    yield chunk.decode('utf-8')
    
    # 返回流式响应
    return StreamingResponse(
        forward_to_real_api(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

# 启动应用
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860) 