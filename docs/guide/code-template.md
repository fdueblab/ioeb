# 算法代码提交要求

本文档提供算法代码的标准化提交模板，支持两种提交方式。

::: details 为什么需要这个模板？
为了实现算法的自动化部署和微服务化，我们需要将各个课题的核心功能以标准化的方式封装。这样做的目的是：

- **自动化分析**：便于使用大语言模型（LLM）自动分析代码结构
- **自动微服务封装**：自动生成将核心功能封装成MCP工具
- **微服务架构**：生成容器相关文件并自动进行容器化部署

因此，请大家按照以下规范封装核心功能函数。特别注意：**每个核心功能函数都必须完全独立**，能够直接调用执行，不依赖其他函数或外部变量。所有必要的初始化都应在函数内部完成。

例如，如果一个函数需要已加载的模型，那么模型的加载过程应该在函数内部完成，而不是假设模型已经在其他地方被加载好了。这样做是为了确保每个功能函数都可以作为独立的API端点使用。
:::

## 核心要求

::: danger 重要
**每个核心功能函数都必须完全独立**，能够直接调用执行，不依赖其他函数或外部变量。所有必要的初始化都应在函数内部完成。
:::

## 提交方式

### 方式一：单独Python文件

适用于简单算法，直接提交一个`.py`文件。

::: tip 单文件要求
- 文件名不限，建议有意义的命名
- 包含完整的算法功能实现
- 无需提供依赖文件，平台自动处理
:::

### 方式二：ZIP项目压缩包（推荐）

适用于复杂项目，包含多个文件和依赖。

::: warning ZIP要求
- **必须包含**`main.py`作为主入口文件
- 可包含其他模块、模型文件、配置等
- 推荐包含`requirements.txt`和`README.md`
:::

**推荐结构：**
```
algorithm.zip
├── main.py              # 主入口（必需）
├── requirements.txt     # 依赖列表
├── README.md           # 说明文档
├── models/             # 模型文件
├── utils/              # 工具模块
└── configs/            # 配置文件
```

**main.py示例：**
```python
"""
项目主入口文件
"""

from typing import Dict, Optional, Tuple
import torch
import dgl
# 导入项目内其他模块
# from utils.processor import DataProcessor
# from models.model import MyModel

def prepare_graph_data(data_path: str) -> Tuple[dgl.DGLGraph, Dict[str, torch.Tensor], Dict[str, torch.Tensor]]:
    """准备图数据用于模型推理"""
    # 加载数据集
    dataset = dgl.data.CSVDataset(data_path)
    g = dataset[0]
    
    # 设备初始化
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # 特征准备（详细实现省略）
    node_features = {}
    edge_features = {}
    # ... 特征处理逻辑 ...
    
    return g.to(device), node_features, edge_features

def run_inference(data_path: str, model_path: Optional[str] = None) -> str:
    """执行模型推理主函数"""
    try:
        # 模型加载（内部完成）
        # model = load_model(model_path)
        
        # 数据准备
        g, node_features, edge_features = prepare_graph_data(data_path)
        
        # 推理执行
        with torch.no_grad():
            # logits = model(g, node_features, edge_features)
            # predictions = torch.argmax(logits['app'], dim=1)
            
            # 结果格式化
            result_str = "推理结果:\n"
            # for i, pred in enumerate(predictions):
            #     result_str += f"节点 {i}: 类别 {pred.item()}\n"
            
            return result_str
            
    except Exception as e:
        return f"推理过程出错: {str(e)}"

def main_process(input_data: str, config: Optional[Dict] = None) -> str:
    """主处理函数 - 项目核心入口"""
    return run_inference(input_data)
```

## 函数规范

### 命名和注解

```python
def process_data(input_path: str, 
                config: Optional[Dict] = None) -> Dict[str, any]:
    """
    函数功能描述
    
    Args:
        input_path (str): 输入路径说明
        config (Optional[Dict]): 配置参数说明
        
    Returns:
        Dict[str, any]: 返回值说明
    """
    pass
```

### 独立性要求

```python
# ✅ 正确：函数内部完成所有初始化
def good_function(data_path: str) -> str:
    model = load_model("./model.pth")  # 函数内加载
    data = load_data(data_path)        # 函数内处理
    return model.predict(data)

# ❌ 错误：依赖外部变量
model = load_model()  # 全局变量
def bad_function(data_path: str) -> str:
    return model.predict(data_path)  # 依赖全局模型
```

## 提交说明

| 提交方式 | 必需文件 | 推荐文件 | 可选文件 | 说明 |
|----------|----------|----------|----------|------|
| **单文件提交** | `*.py`（任意命名） | - | - | 包含完整算法功能，平台自动处理依赖 |
| **ZIP项目提交** | `main.py`（主入口） | `requirements.txt`<br/>`README.md` | 模型文件<br/>配置文件<br/>示例数据 | 复杂项目的完整结构 |

### 环境依赖要求

| 文件类型 | 格式要求 | 示例 |
|----------|----------|------|
| **requirements.txt** | 指定版本号 | `torch==2.0.1`<br/>`dgl==1.1.0`<br/>`numpy==1.24.3` |
| **README.md** | 环境说明 | Python版本要求<br/>CUDA版本<br/>特殊配置说明 |

### 提交检查清单

| 检查项目 | 单文件提交 | ZIP项目提交 |
|----------|------------|-------------|
| 核心功能文件 | ✅ 单个`.py`文件 | ✅ `main.py`主入口 |
| 类型注解 | ✅ 完整注解 | ✅ 完整注解 |
| 函数文档 | ✅ Google风格 | ✅ Google风格 |
| 独立性 | ✅ 函数独立 | ✅ 函数独立 |
| 依赖管理 | ⚠️ 平台自动处理 | ✅ requirements.txt |
| 项目说明 | ⚠️ 代码注释 | ✅ README.md |

---

::: info 需要帮助？
遇到问题请查看：
- [开发指南](../dev/)
- [常见问题](../faq)
- 联系技术支持
:::
