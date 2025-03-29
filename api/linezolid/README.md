# 利奈唑胺剂量计算器

这是一个用于肝移植患者的利奈唑胺剂量计算器，使用Python实现。本项目将原有的R语言Shiny应用转换为Python实现，采用FastAPI作为后端API和Gradio作为前端界面。

## 功能介绍

本应用程序根据患者的身体特征和实验室检测值（年龄、性别、身高、体重、血清肌酐和总胆红素），计算推荐的利奈唑胺剂量，以达到目标AUC24h范围。主要功能包括：

- 体表面积（BSA）计算，使用Mosteller公式
- 估算肾小球滤过率（eGFR）计算，使用CKD-EPI公式
- 基于群体药代动力学模型的剂量计算
- 微分方程模拟药代动力学过程
- 预测给药方案下的AUC24h值

## 项目结构

```
linezolid/
│
├── app/                    # 应用程序包
│   ├── api/                # API相关代码
│   │   └── linezolid_api.py  # API路由
│   ├── frontend/          # 前端相关代码
│   │   └── gradio_app.py  # Gradio界面
│   ├── models/            # 数据模型
│   │   └── linezolid_models.py  # Pydantic模型
│   ├── utils/             # 工具函数
│   │   └── calculator.py  # 核心计算逻辑
│   ├── __init__.py        # 包初始化文件
│   └── main.py            # FastAPI主应用
│
├── run.py                 # 应用程序入口
├── requirements.txt       # 依赖项
└── README.md              # 项目说明
```

## 安装说明

### 环境要求

- Python 3.8+
- 依赖包见requirements.txt

### 安装步骤

1. 克隆或下载项目到本地

2. 创建并激活虚拟环境（可选但推荐）

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Linux/MacOS
   python -m venv venv
   source venv/bin/activate
   ```

3. 安装依赖包

   ```bash
   pip install -r requirements.txt
   ```

## 使用说明

### 启动应用程序

有多种方式可以启动应用程序：

1. 同时启动API和UI（推荐）

   ```bash
   python run.py
   ```

2. 仅启动API

   ```bash
   python run.py --api-only
   ```

3. 仅启动UI

   ```bash
   python run.py --ui-only
   ```

### 命令行参数

- `--api-only`: 仅启动API服务
- `--ui-only`: 仅启动UI界面
- `--api-port`: API服务端口（默认5000）
- `--ui-port`: UI界面端口（默认7860）

### 访问应用程序

1. API服务：http://localhost:5000
   - API文档：http://localhost:5000/docs

2. UI界面：http://localhost:7860

## 用途声明与免责声明

### 用途声明

"肝移植患者利奈唑胺剂量计算器"是一个为肝移植患者提供个体化利奈唑胺剂量的计算工具。它根据个体的年龄、体表面积、总胆红素和估算肾小球滤过率，推荐达到稳态AUC24在160-291.7 mg/L·h之间所需的剂量。体表面积使用Mosteller公式计算，估算肾小球滤过率使用CKD-EPI公式计算。

此计算器仅用于研究目的，仅应用于肝移植患者。

### 免责声明

本网络计算器按"原样"提供，不提供任何形式的明示或暗示担保，包括但不限于对适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对因软件或软件的使用或其他交易而产生的任何索赔、损害或其他责任承担责任，无论是合同行为、侵权行为还是其他方面。

用户应注意，尽管信息来源于医学研究和文献，但我们不保证其正确性、全面性或时效性。该信息不旨在替代临床医生的临床判断。本软件的用户对基于系统中包含的信息做出的任何决定或采取的行动承担全部责任。 