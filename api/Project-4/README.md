# 算法模型评测系统

这是一个基于 Flask 的 RESTful API 服务，用于评测算法模型的性能和安全性。该系统提供了一系列评测指标，帮助用户全面了解模型的各项性能表现。本项目的 API 服务部分由基于 LLM 的智能体自动分析和生成，体现了 AI 辅助开发的创新应用。

## 功能特点

- 支持多维度模型评测
- 提供安全性指纹检测
- RESTful API 接口
- Swagger 文档支持
- Docker 容器化部署
- 智能体辅助开发

## 系统要求

- Docker
- Docker Compose
- Python 3.10+（如果不使用 Docker）
- CUDA（可选，用于 GPU 加速）

## 快速开始

### 方法1：使用 Docker（推荐）

1. 克隆项目到本地
2. 确保 `weights` 目录中包含训练好的模型文件：
```
weights/
└── model_hattengcn.pt
```

3. 在项目根目录下运行：
```bash
docker-compose up --build -d
```

4. 验证服务是否正常运行：
```bash
curl http://localhost:25004/safety/health
```

### 方法2：本地安装

1. 克隆项目到本地
2. 创建并激活虚拟环境（推荐）：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 运行服务：
```bash
python app.py
```

## API 接口

### 文档访问
- URL: `http://localhost:25004/docs`
- 方法: GET
- 描述: 查看交互式 API 文档

### 安全性指纹检测
- URL: `/safety/safety-fingerprint`
- 方法: POST
- 请求格式: multipart/form-data
- 参数：
  - file: ZIP格式的数据集文件
  - model_name: 模型名称（当前支持 HattenGCN）
- 响应示例:
```json
{
    "score": {
        "safety_score": 0.85,
        "details": {...}
    },
    "details": {...}
}
```

### 健康检查
- URL: `/safety/health`
- 方法: GET
- 描述: 检查 API 服务是否正常运行
- 响应示例:
```json
{
    "status": "healthy"
}
```

## 智能体辅助开发

本项目的 API 服务部分采用了基于大语言模型（LLM）的智能体辅助开发方法：

1. 智能体分析：通过 LLM 智能体对 `eval_methods.py` 进行深入分析，理解评测方法的实现逻辑和接口需求
2. 自动生成：基于分析结果，智能体自动生成了：
   - `app.py`：Flask RESTful API 服务实现
   - `Dockerfile`：容器化配置文件
   - `docker-compose.yml`：容器编排配置
3. 优势：
   - 加速开发流程
   - 确保接口设计的一致性
   - 自动化工程实践的应用

## 项目结构
```
.
├── app.py              # 主应用程序（智能体生成）
├── data.py            # 数据处理模块
├── dataset.py         # 数据集定义
├── eval_methods.py    # 评测方法实现
├── utils.py           # 工具函数
├── requirements.txt   # 项目依赖
├── Dockerfile         # Docker配置文件（智能体生成）
└── docker-compose.yml # Docker Compose配置（智能体生成）
```

## 故障排除

1. 如果服务无法启动，检查：
   - 端口 5000 是否被占用
   - 模型文件是否存在
   - Docker 服务是否正常运行

2. 如果评测失败，检查：
   - 上传的数据集格式是否正确
   - 数据集是否为有效的 ZIP 格式
   - 查看 Docker 日志获取详细错误信息：
     ```bash
     docker-compose logs -f
     ```

## 维护和支持

- 定期检查日志文件
- 监控服务健康状态
- 确保模型文件的安全备份

## 许可证

MIT
