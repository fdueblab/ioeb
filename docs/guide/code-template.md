# 算法提交代码模板

本文档为开发者提供算法代码的标准化提交模板，确保算法能够顺利集成到平台的微服务架构中。

## 模板目标

::: info 为什么需要标准化模板？
为了实现算法的自动化部署和微服务化，我们需要将各个课题的核心功能以标准化的方式封装。这样做的目的是：

- **自动化分析**：便于使用大语言模型（LLM）自动分析代码结构
- **接口生成**：自动生成 API 接口（基于 Flask）和 Swagger 文档
- **微服务架构**：支持快速构建微服务架构
- **模块化复用**：实现算法功能的模块化复用
:::

::: danger 核心要求
**每个核心功能函数都应该是完全独立的**，能够直接调用执行，而不依赖于其他函数的预先调用或外部变量的设置。所有必要的初始化和依赖都应该在函数内部完成。

例如：如果一个函数需要已加载的模型，那么模型的加载过程应该在函数内部完成，而不是假设模型已经在其他地方被加载好了。
:::

## 文件组织结构

::: tip 推荐的项目结构
```
your_algorithm/
├── core_functions.py      # 核心功能函数（必需）
├── requirements.txt       # 依赖包列表（必需）
├── README.md             # 项目说明文档（必需）
├── models/               # 模型文件目录
├── data/                 # 示例数据目录
└── utils/                # 辅助工具函数
```
:::

### 核心文件说明

| 文件名 | 必需性 | 说明 |
|--------|--------|------|
| `core_functions.py` | **必需** | 包含所有核心功能函数的独立文件 |
| `requirements.txt` | **必需** | Python包依赖，需指定版本号 |
| `README.md` | **必需** | 项目说明和环境配置 |

::: warning 独立性要求
为了确保代码的清晰性和独立性，请将所有核心功能函数集中放在 `core_functions.py` 文件中。这样做有两个目的：

1. **便于LLM分析**：大语言模型可以直接分析和处理核心功能
2. **强制独立性**：避免各个功能函数与其他逻辑耦合
:::

## 函数封装规范

### 1. 函数命名规范

::: details 命名要求详解
- **清晰反映功能**：函数名应准确描述其作用
- **小写下划线**：使用小写字母和下划线组合（snake_case）
- **动词开头**：表明函数的具体操作

**良好示例：**
```python
def prepare_graph(...)     # ✅ 清晰表达"准备图数据"
def infer_model(...)       # ✅ 明确表示"模型推理"
def process_data(...)      # ✅ 说明"数据处理"
```

**避免的命名：**
```python
def func1(...)            # ❌ 无意义命名
def do_something(...)     # ❌ 过于泛化
def graph(...)           # ❌ 缺少动词
```
:::

### 2. 类型注解要求

::: code-group
```python [正确示例]
from typing import Tuple, Dict, List, Optional
import torch
import dgl

def prepare_graph(data_path: str) -> Tuple[dgl.DGLGraph, 
                                          Dict[str, torch.Tensor], 
                                          Dict[str, torch.Tensor]]:
    """准备图数据用于模型推理"""
    pass

def process_batch(data: List[str], 
                 batch_size: Optional[int] = None) -> Dict[str, any]:
    """批量处理数据"""
    pass
```

```python [错误示例]
def prepare_graph(data_path):        # ❌ 缺少类型注解
    pass

def process_data(data, size=None):   # ❌ 缺少返回值类型
    pass
```
:::

### 3. 函数文档规范

采用 **Google 风格**的函数文档，必须包含以下部分：

::: code-group
```python [完整文档示例]
def infer_model(data_path: str, model_config: Dict[str, any]) -> str:
    """执行模型推理并返回预测结果。

    该函数是模型推理的主要入口点，负责加载数据、执行推理并返回格式化的结果。
    函数内部会自动完成模型加载和数据预处理，确保完全独立运行。

    Args:
        data_path (str): 输入数据的路径，需要与训练数据格式保持一致。
        model_config (Dict[str, any]): 模型配置参数，包含模型路径和超参数。

    Returns:
        str: 推理结果字符串，包含各节点的预测类别和置信度。

    Raises:
        FileNotFoundError: 当数据文件或模型文件不存在时抛出。
        ValueError: 当输入数据格式不正确时抛出。

    Example:
        >>> config = {"model_path": "./models/best.pth", "device": "cpu"}
        >>> result = infer_model("./data/test.csv", config)
        >>> print(result)
        推理结果:
        节点 0: 类别 1 (置信度: 0.95)
    """
    pass
```

```python [最简文档示例]
def prepare_data(file_path: str) -> Dict[str, any]:
    """准备训练数据。

    Args:
        file_path (str): 数据文件路径。

    Returns:
        Dict[str, any]: 处理后的数据字典。
    """
    pass
```
:::

## 完整示例代码

以下是一个完整的 `core_functions.py` 示例，展示了两个核心函数的标准化封装：

::: details 点击查看完整示例代码
```python
"""
课题算法核心功能函数
包含数据准备和模型推理的独立函数实现
"""

import os
import shutil
from typing import Tuple, Dict
import torch
import dgl


class AlgorithmCore:
    """算法核心功能类"""
    
    def __init__(self):
        """初始化算法核心组件"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None

    def prepare_graph(self, data_path: str) -> Tuple[dgl.DGLGraph,
                                                    Dict[str, torch.Tensor],
                                                    Dict[str, torch.Tensor]]:
        """准备图数据用于模型推理。

        该函数负责加载数据集并进行特征初始化，将数据转换为适合模型输入的格式。
        所有必要的数据处理和特征工程都在此函数内部完成，确保完全独立运行。

        Args:
            data_path (str): 数据集的路径，应包含必要的CSV文件。

        Returns:
            Tuple[dgl.DGLGraph, Dict[str, torch.Tensor], Dict[str, torch.Tensor]]:
                - dgl.DGLGraph: 处理后的图数据结构
                - Dict[str, torch.Tensor]: 节点特征字典，key为节点类型，value为特征张量
                - Dict[str, torch.Tensor]: 边特征字典，key为边类型，value为特征张量

        Raises:
            FileNotFoundError: 当数据路径不存在时抛出。
            ValueError: 当数据格式不正确时抛出。
        """
        try:
            # 加载数据集
            dataset = dgl.data.CSVDataset(data_path)
            g = dataset[0]

            # 准备特征
            node_features = {}
            edge_features = {}
            feature_dim = g.nodes['app'].data['feat'].shape[1]
            edge_feature_dim = g.edges['edges_1'].data['feat'].shape[1]

            # 初始化特征
            self._initialize_features(g, feature_dim, init_type='zero')
            self._edge_initialize_features(g, edge_feature_dim, init_type='zero')

            # 收集特征
            for ntype in g.ntypes:
                feat = g.nodes[ntype].data['feat']
                if feat is not None:
                    node_features[ntype] = feat

            for etype in g.etypes:
                feat = g.edges[etype].data['feat']
                if feat is not None:
                    edge_features[etype] = feat

            # 将数据移到指定设备
            g = g.to(self.device)
            node_features = {ntype: feats.to(self.device) 
                           for ntype, feats in node_features.items()}
            edge_features = {etype: feats.to(self.device) 
                           for etype, feats in edge_features.items()}

            return g, node_features, edge_features

        except Exception as e:
            raise ValueError(f"数据准备失败: {str(e)}")

    def infer(self, data_path: str, model_path: str = None) -> str:
        """执行模型推理并返回预测结果。

        该函数是模型推理的主要入口点，负责模型加载、数据准备、推理执行和结果格式化。
        函数完全独立运行，内部包含所有必要的初始化过程。

        Args:
            data_path (str): 输入数据的路径，需要与训练数据格式保持一致。
            model_path (str, optional): 模型文件路径，如果未指定则使用默认路径。

        Returns:
            str: 推理结果字符串，包含各节点的预测类别和统计信息。

        Raises:
            FileNotFoundError: 当数据文件或模型文件不存在时抛出。
            RuntimeError: 当推理过程出现错误时抛出。
        """
        try:
            # 加载模型（如果尚未加载）
            if self.model is None:
                self._load_model(model_path)

            # 准备数据
            g, node_features, edge_features = self.prepare_graph(data_path)

            # 进行推理
            with torch.no_grad():
                logits = self.model(g, node_features, edge_features)

                # 获取app节点的预测结果
                app_logits = logits['app']
                predictions = torch.argmax(app_logits, dim=1)
                probabilities = torch.softmax(app_logits, dim=1)

                # 将预测结果转换为可读格式
                result_lines = ["推理结果:", "=" * 50]
                
                for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
                    confidence = prob[pred].item()
                    result_lines.append(
                        f"节点 {i:04d}: 类别 {pred.item()} (置信度: {confidence:.4f})"
                    )

                # 添加统计信息
                unique_preds, counts = torch.unique(predictions, return_counts=True)
                result_lines.extend(["", "统计信息:", "-" * 30])
                for pred, count in zip(unique_preds, counts):
                    result_lines.append(f"类别 {pred.item()}: {count.item()} 个节点")

                result_str = "\n".join(result_lines)

                # 清理临时数据集
                self._cleanup_temp_data(data_path)

                return result_str

        except Exception as e:
            # 确保清理临时文件
            self._cleanup_temp_data(data_path)
            raise RuntimeError(f"推理过程出错: {str(e)}")

    def _load_model(self, model_path: str = None):
        """内部方法：加载模型"""
        if model_path is None:
            model_path = "./models/best_model.pth"
        
        # 这里应该包含实际的模型加载逻辑
        # self.model = torch.load(model_path, map_location=self.device)
        pass

    def _initialize_features(self, g, feature_dim, init_type='zero'):
        """内部方法：初始化节点特征"""
        # 特征初始化逻辑
        pass

    def _edge_initialize_features(self, g, edge_feature_dim, init_type='zero'):
        """内部方法：初始化边特征"""
        # 边特征初始化逻辑
        pass

    def _cleanup_temp_data(self, data_path: str):
        """内部方法：清理临时数据"""
        if os.path.dirname(data_path) == 'temp_dataset':
            shutil.rmtree(data_path, ignore_errors=True)


# 为了便于平台自动化处理，提供模块级别的便捷函数
def prepare_graph_data(data_path: str) -> Tuple[dgl.DGLGraph, 
                                               Dict[str, torch.Tensor], 
                                               Dict[str, torch.Tensor]]:
    """模块级数据准备函数"""
    core = AlgorithmCore()
    return core.prepare_graph(data_path)


def run_inference(data_path: str, model_path: str = None) -> str:
    """模块级推理函数"""
    core = AlgorithmCore()
    return core.infer(data_path, model_path)
```
:::

## 提交清单

### 📋 必需文件

::: warning 提交前检查清单
在提交代码前，请确保包含以下所有文件：

**✅ 代码文件**
- [ ] `core_functions.py` - 核心功能函数文件
- [ ] 完整的项目代码
- [ ] 其他必要的工具函数和配置文件

**✅ 模型相关文件**
- [ ] 训练好的模型参数文件
- [ ] 示例数据集（用于测试）
- [ ] 其他必要的模型相关文件

**✅ 环境配置文件**
- [ ] `requirements.txt` - Python包依赖列表
- [ ] `README.md` - 项目说明文档
:::

### 📦 依赖文件规范

#### requirements.txt 示例

::: code-group
```txt [推荐格式]
# 深度学习框架
torch==2.0.1
torchvision==0.15.2
dgl==1.1.0

# 数据处理
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0

# 工具库
tqdm==4.65.0
matplotlib==3.7.2
seaborn==0.12.2

# Web框架（用于API生成）
flask==2.3.2
flask-restx==1.1.0
```

```txt [基础格式]
torch>=2.0.0
dgl>=1.1.0
numpy>=1.24.0
flask>=2.3.0
```
:::

#### README.md 模板

::: details 点击查看README模板
```markdown
# 算法名称

## 功能描述
简要描述算法的主要功能和用途。

## 环境要求
- Python: 3.8+
- CUDA: 11.8+ (如需GPU支持)
- 内存: 建议8GB+

## 安装依赖
```bash
pip install -r requirements.txt
```

## 核心函数说明

### prepare_graph_data
- **功能**: 准备图数据用于模型推理
- **输入**: 数据文件路径
- **输出**: 图数据结构和特征字典

### run_inference  
- **功能**: 执行模型推理
- **输入**: 数据路径和模型路径
- **输出**: 推理结果字符串

## 使用示例
```python
from core_functions import run_inference

result = run_inference("./data/test.csv", "./models/best.pth")
print(result)
```

## 模型文件
- `models/best.pth` - 训练好的模型参数
- `data/example.csv` - 示例数据文件

## 注意事项
- 确保数据格式与训练时一致
- GPU内存不足时会自动切换到CPU
- 推理结果包含置信度信息
```
:::

## 常见问题

::: details 函数独立性问题
**Q: 如何确保函数的完全独立性？**

A: 每个函数应该：
- 内部完成所有必要的初始化
- 不依赖全局变量或外部状态
- 包含完整的错误处理
- 能够独立测试和调用

**示例：**
```python
# ❌ 错误：依赖外部变量
model = load_model()  # 全局变量

def infer(data):
    return model.predict(data)  # 依赖全局模型

# ✅ 正确：函数内部加载
def infer(data, model_path):
    model = load_model(model_path)  # 函数内部加载
    return model.predict(data)
```
:::

::: details 类型注解问题
**Q: 复杂类型如何进行注解？**

A: 使用 `typing` 模块：
```python
from typing import Union, Optional, List, Dict, Tuple, Any

def complex_function(
    data: Union[str, List[str]],
    config: Optional[Dict[str, Any]] = None,
    batch_size: int = 32
) -> Tuple[List[str], Dict[str, float]]:
    pass
```
:::

::: details 文档格式问题
**Q: Google风格文档的具体格式是什么？**

A: 标准格式包括：
```python
def function_name(param1, param2):
    """简短的功能描述。

    详细的功能说明（可选）。

    Args:
        param1 (type): 参数1的说明。
        param2 (type): 参数2的说明。

    Returns:
        type: 返回值的说明。

    Raises:
        ExceptionType: 异常情况说明。
    """
```
:::

::: tip 提交建议
1. **测试完整性**：提交前请确保所有函数都能独立运行
2. **文档完整性**：检查所有函数都有完整的类型注解和文档
3. **依赖明确性**：`requirements.txt` 中指定具体版本号
4. **示例数据**：提供小规模的示例数据用于测试
:::

---

::: info 需要帮助？
如果您在模板使用过程中遇到问题，请：
- 查看[开发指南](../dev/)了解更多技术细节
- 查看[常见问题](../faq)寻找解决方案
- 联系平台技术支持团队
:::
