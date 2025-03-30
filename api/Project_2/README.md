# 图神经网络推理服务

这是一个基于图神经网络的推理服务，提供 RESTful API 接口，用于处理异构图数据集并进行模型推理。

## 功能特点

- 支持异构图数据处理
- 提供 RESTful API 接口
- 自动生成 Swagger API 文档
- Docker 容器化部署
- 支持 GPU 和 CPU 推理

## 系统要求

- Docker
- Docker Compose
- Python 3.10+（如果不使用 Docker）
- CUDA（可选，用于 GPU 加速）

## 快速开始

### 使用 Docker 部署（推荐）

1. 克隆项目：
```bash
git clone https://github.com/PolarSnowLeopard/Project_1.git
cd Project_1
```

2. 确保 `checkpoint` 目录中包含训练好的模型文件：
```
checkpoint/
└── model_horizontal.pt
```

3. 构建并启动服务：
```bash
docker-compose up --build -d
```

4. 验证服务是否正常运行：
```bash
curl http://localhost:25002/api/health
```

### 手动部署

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 运行服务：
```bash
python app.py
```

## API 接口

### 文档访问
- URL: `http://localhost:25002/docs`
- 方法: GET
- 描述: 查看交互式 API 文档

### 健康检查
- URL: `http://localhost:25002/api/health`
- 方法: GET
- 响应示例:
```json
{
    "status": "healthy"
}
```

### 模型推理
- URL: `http://localhost:25002/api/predict`
- 方法: POST
- 请求格式: multipart/form-data
- 参数:
  - file: ZIP格式的数据集文件
- 响应示例:
```json
{
    "result": "推理结果:\n节点 0: 类别 1\n节点 1: 类别 0\n..."
}
```

## 数据集格式

上传的 ZIP 文件必须包含以下内容：
- `meta.yaml`: 数据集元信息
- `edges_*.csv`: 边数据文件
- `nodes_*.csv`: 节点数据文件

## 开发指南

### 项目结构
```
.
├── app.py              # Flask 应用主文件
├── inference.py        # 推理模型实现
├── methods/
│   └── train.py       # 模型定义
├── checkpoint/         # 模型文件目录
├── Dockerfile         # Docker 构建文件
├── docker-compose.yml # Docker Compose 配置
└── requirements.txt   # Python 依赖
```

### 环境变量
- `FLASK_APP`: Flask 应用入口
- `FLASK_ENV`: 运行环境（production/development）

## 故障排除

1. 如果服务无法启动，检查：
   - 端口 25002 是否被占用
   - 模型文件是否存在
   - Docker 服务是否正常运行

2. 如果推理失败，检查：
   - 上传的数据集格式是否正确
   - 数据集是否包含所有必需文件
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