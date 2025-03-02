> 课题三两个大模型微服务对接流程
> * 第一步：在linux系统上安装easyconnect
>   * 参考网址：https://blog.csdn.net/m0_60789828/article/details/140356886
> * 第二步：在课题五的系统中打开四个不同的terminal，两个用作课题三子任务二，两个用作课题三子任务三
>   * terminal1运行`ssh -i C:\Users\MSI-NB\.ssh\id_rsa_pj3 -L 8893:127.0.0.1:8893 zhaofanyu@10.176.55.210`
>   * terminal2运行`ssh -i C:\Users\MSI-NB\.ssh\id_rsa_pj3 -L 8889:127.0.0.1:8889 zhaofanyu@10.176.55.210`
>   * terminal3运行microservice_3_3_local.py
>   * terminal4运行microservice_3_2_local.py
> * 第三步：在terminal3和4中会返回对应的结果
>   * 在terminal3中会产生金融风险报告的文本内容，并且在terminal的路径中会产生一个output.pdf
  * 在terminal4中会返回NL2GQL的结果，为json字典，其中包含GQL语句以及查询结果

---

# 金融风险报告生成服务

这是一个基于 Flask 的 RESTful API 服务，提供自然语言查询转换和金融风险报告生成功能。该系统支持将自然语言查询转换为图数据库查询，并能生成格式化的PDF风险报告。本项目的 API 服务部分由基于 LLM 的智能体自动分析和生成，体现了 AI 辅助开发的创新应用

## 功能特点

- 自然语言转图数据库查询
- PDF格式金融风险报告生成
- 中文字体自适应支持
- RESTful API 接口
- Swagger 文档支持
- 自动文件清理机制
- 智能体辅助开发
- Docker容器化部署

## 系统要求

### 使用Docker部署（推荐）
- Docker 20.10+
- Docker Compose 2.0+

### 本地部署
- Python 3.10
- Windows/Linux/MacOS 系统
- 系统安装中文字体（或使用项目提供的备用字体）

## 快速开始

### 方法1：使用Docker Compose（推荐）

1. 克隆项目到本地

2. 构建并启动服务：
```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

3. 验证服务是否正常运行：
```bash
curl http://localhost:25003/api/health
```

4. 停止服务：
```bash
docker-compose down
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
- URL: `http://localhost:5000/docs`
- 方法: GET
- 描述: 查看交互式 API 文档

### 自然语言查询转换
- URL: `/api/nl2gql`
- 方法: GET
- 参数：
  - query: 自然语言查询字符串
- 响应示例:
```json
{
    "result": "..."
}
```

### 生成风险报告
- URL: `/api/generate-report`
- 方法: GET
- 参数：
  - query: 用于生成报告的查询语句
- 响应：
  - 直接返回生成的PDF文件

### 健康检查
- URL: `/api/health`
- 方法: GET
- 描述: 检查 API 服务是否正常运行
- 响应示例:
```json
{
    "status": "healthy"
}
```

## 项目结构
```
.
├── app.py              # 主应用程序（API服务）
├── core.py            # 核心功能实现
├── output/            # PDF输出目录
├── Dockerfile         # Docker构建文件
├── docker-compose.yml # Docker Compose配置文件
└── requirements.txt   # 项目依赖
```

## 故障排除

1. Docker相关问题：
   - 确保Docker服务正在运行
   - 检查端口25003是否被占用
   - 查看容器日志：
     ```bash
     docker-compose logs -f
     ```
   - 检查容器健康状态：
     ```bash
     docker-compose ps
     ```

2. 如果服务无法启动，检查：
   - 端口 5000 是否被占用
   - Docker容器是否正常运行
   - 容器内日志输出

3. 如果报告生成失败，检查：
   - 容器内中文字体是否正确安装
   - output目录的挂载是否正确
   - 容器内外文件权限是否正确

4. 中文字体问题：
   - 确保Dockerfile中已安装中文字体
   - 检查字体文件是否正确复制到容器中
   - 或将simhei.ttf放置在项目根目录

## 维护和支持

- 定期清理output目录中的临时文件
- 监控Docker容器状态
- 确保容器日志轮转配置正确
- 定期更新基础镜像和依赖

## 许可证

MIT
