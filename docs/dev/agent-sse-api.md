# Agent SSE 接口调用指南

本文档面向需要集成后端Agent功能的开发者，帮助你理解平台的智能体架构，以及如何正确调用Agent流式接口。

::: tip Swagger API 文档
**完整接口文档：** [http://fdueblab.cn:8010/](http://fdueblab.cn:8010/)

通过Swagger文档可以查看平台上所有已有Agent的接口、参数说明和调用示例。
:::

---

## 一、平台背景：面向任务的智能体架构

我们的算法模型智能体平台整合了多个大模型智能体（Agent），这些智能体是平台核心功能的支撑力量。

::: info 智能体设计理念
**每个智能体都针对一个特定的完整任务而设计**。

一个智能体可以独立完成从数据处理、分析计算到结果生成的完整任务流程。例如：

| 智能体类型 | 完整任务流程 |
|-----------|------------|
| **代码分析Agent** | 文件解析 → 代码分析 → 生成报告 |
| **服务评测Agent** | 数据准备 → 多维度评测 → 结果汇总 |
| **报告生成Agent** | 数据分析 → 内容编写 → 格式化输出 |
| **模型评估Agent** | 加载数据 → 运行评测 → 生成指标 |
:::

### 智能体的核心特征

1. **多步骤执行**
   - 一个任务通常包含5-10个步骤
   - 每个步骤都有明确的目标和输出

2. **执行耗时长**
   - 整个任务可能需要3-10分钟
   - 涉及文件处理、模型推理、数据分析等耗时操作

3. **过程透明化**
   - 用户需要看到智能体的**观察**（Observation）
   - 用户需要看到智能体的**思考**（Thought）  
   - 用户需要看到智能体的**执行**（Action）

---

## 二、传统REST接口的局限性

假设我们使用传统的REST API来实现智能体功能：

```javascript
// 传统REST方式（不推荐）
const response = await fetch('/api/agent/analyze', {
  method: 'POST',
  body: formData
})
const result = await response.json()
```

::: danger 传统REST的致命缺陷

### 问题1：用户体验极差

智能体任务可能需要运行5分钟。在REST模式下，用户只能看到转圈的loading，完全不知道：
- ❓ 任务进行到哪一步了？
- ❓ 是卡住了还是正在正常执行？
- ❓ 还需要等多久？
- ❓ 智能体在做什么、为什么这么做？

**用户心理：** "这东西到底还在跑吗？要不要刷新页面？"

### 问题2：HTTP超时问题

大多数HTTP客户端和代理服务器都有超时限制（通常30-60秒）。任务还在执行，但连接已经断开，前端永远拿不到结果。

### 问题3：无法获取中间过程

**这是最致命的问题！** 传统REST只能返回最终结果，用户完全看不到智能体的观察、思考、执行过程。**这让AI决策过程变成了黑盒，用户无法理解和信任智能体的工作。**

:::

---

## 三、为什么选择SSE（Server-Sent Events）？

为了解决上述问题，我们采用了**SSE流式接口**方案。

::: tip SSE的核心优势

### 🎯 最重要：实时透明化智能体运行过程

**这是我们选择SSE的首要原因！**

智能体在执行任务时，会不断经历 **"观察 → 思考 → 执行"** 的循环过程。通过SSE，前端可以：

✅ **实时看到智能体的观察结果** - 智能体看到了什么数据？发现了什么问题？

✅ **实时看到智能体的思考过程** - 智能体如何分析问题？为什么选择这个方案？

✅ **实时看到智能体的执行动作** - 调用了什么工具？获得了什么结果？

**这让整个AI决策过程对用户完全透明**，用户可以理解智能体在做什么、知道为什么这么做、信任智能体的决策。

### 其他重要优势

| 优势 | 说明 |
|------|------|
| 🎨 **实时进度反馈** | 每完成一个步骤立即推送，用户不焦虑 |
| ⏱️ **无超时问题** | 连接持续保持，任务再长也不会断开 |
| 🐛 **便于调试** | 即使失败也能看到完整的执行过程 |
| 📊 **可监控性强** | 可以收集每个步骤的性能数据 |

:::

### REST vs SSE 对比

![REST vs SSE对比](https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/sse对比.png)

<table>
<thead>
<tr>
<th>对比维度</th>
<th>传统REST方式</th>
<th>SSE流式方式</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>执行阶段</strong></td>
<td>服务器执行任务，客户端无感知</td>
<td>服务器边执行边推送步骤进度</td>
</tr>
<tr>
<td><strong>等待体验</strong></td>
<td>只能看loading转圈，不知道进度</td>
<td>实时看到执行进展，知道在做什么</td>
</tr>
<tr>
<td><strong>超时风险</strong></td>
<td>有超时限制（30-60秒）</td>
<td>无超时问题</td>
</tr>
<tr>
<td><strong>透明度</strong></td>
<td>黑盒，看不到内部过程</td>
<td>白盒，完全透明</td>
</tr>
</tbody>
</table>

### SSE事件流格式

SSE使用纯文本协议，每个事件的格式：

```
data: {JSON对象}\n\n
```

**示例事件流：**

```
data: {"step": 1, "step_name": "解析文件", "content": "正在解析ZIP文件...", "is_last": false}

data: {"step": 2, "step_name": "代码分析", "content": "正在分析代码结构...", "is_last": false}

data: {"is_last": true, "is_final_result": true, "final_results": {"function": {...}}}
```

### 事件类型说明

<table>
<thead>
<tr>
<th width="20%">事件类型</th>
<th width="25%">标识字段</th>
<th width="20%">何时发送</th>
<th width="35%">说明</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>步骤事件</strong></td>
<td><code>"step": n</code></td>
<td>每完成一个步骤</td>
<td>包含智能体的观察、思考和执行信息</td>
</tr>
<tr>
<td><strong>成功完成</strong></td>
<td><code>"is_final_result": true</code></td>
<td>任务成功完成</td>
<td>包含最终结果数据</td>
</tr>
<tr>
<td><strong>错误事件</strong></td>
<td><code>"error": "..."</code></td>
<td>任务执行失败</td>
<td>包含错误信息</td>
</tr>
<tr>
<td><strong>警告事件</strong></td>
<td><code>"warning": "..."</code></td>
<td>出现警告但未失败</td>
<td>包含警告信息</td>
</tr>
</tbody>
</table>

**关键字段：**

- `step` - 当前步骤编号
- `step_name` - 步骤名称
- `content` - 步骤详细内容（包含智能体的观察、思考、执行过程）
- `is_last` - 是否是最后一个事件
- `is_final_result` - 是否包含最终结果
- `final_results` - 任务输出结果

---

## 四、如何调用Agent接口

### 核心调用函数

::: tip 参考实现
平台前端封装了一个通用的 `streamAgent` 函数，已在生产环境稳定运行。
:::

**JavaScript/TypeScript实现：**

```javascript
/**
 * 调用Agent SSE接口的通用函数
 * 
 * @param {string} path - API路径，如 '/api/agent/code_analysis'
 * @param {FormData} formData - 包含文件和参数的FormData对象
 * @param {Object} callbacks - 各种事件的回调函数
 */
export const streamAgent = async (path, formData, callbacks = {}) => {
  const BASE_URL = 'https://fdueblab.cn'
  const url = `${BASE_URL}${path}`

  // 解构回调函数（都是可选的）
  const {
    onStart = () => {},              // 任务开始时调用
    onStep = (step) => {},            // 每个步骤完成时调用
    onFinalResult = (results) => {},  // 任务成功完成时调用
    onError = (error) => {},          // 发生错误时调用
    onComplete = () => {}             // 连接关闭时调用
  } = callbacks

  try {
    onStart()

    // 发送POST请求
    const response = await fetch(url, {
      method: 'POST',
      body: formData  // 浏览器会自动设置Content-Type
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    // 创建流读取器
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    // 循环读取数据流
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 解码并添加到缓冲区
      buffer += decoder.decode(value, { stream: true })

      // 按 \n\n 分割事件
      const events = buffer.split('\n\n')
      buffer = events.pop() // 保留未完成的部分

      // 处理每个完整的事件
      for (const event of events) {
        if (!event.startsWith('data: ')) continue
        
        const data = JSON.parse(event.substring(6))

        // 根据事件类型调用相应回调
        if (data.error) {
          onError(data.error)
          return
        }
        
        if (data.is_final_result) {
          onFinalResult(data.final_results)
          return
        }
        
        if (data.step) {
          onStep(data)
        }
      }
    }

    onComplete()
  } catch (error) {
    onError(error.message)
  }
}
```

### 使用示例

```javascript
// 1. 准备FormData
const formData = new FormData()
formData.append('service_name', 'face-recognition')
formData.append('metrics', JSON.stringify(['privacy', 'fairness']))
formData.append('data_file', fileObject)

// 2. 调用接口
await streamAgent('/api/agent/service_evaluation', formData, {
  onStart: () => {
    showLoading('正在启动评测任务...')
  },
  
  onStep: (step) => {
    // 实时更新进度 - 展示智能体的观察、思考、执行过程
    updateProgress({
      stepNumber: step.step,
      stepName: step.step_name,
      content: step.content  // 包含智能体的详细思考过程
    })
    console.log(`[步骤 ${step.step}] ${step.step_name}`)
  },
  
  onFinalResult: (results) => {
    // 展示最终结果
    displayResults(results.evaluation_result)
    hideLoading()
    showSuccess('评测完成！')
  },
  
  onError: (error) => {
    hideLoading()
    showError(`任务失败: ${error}`)
  }
})
```

::: details 其他语言/平台如何实现？

**核心原理（5个步骤）：**

1. 发送POST请求（`multipart/form-data` 格式）
2. 以流式方式读取响应体（不要一次性读取）
3. 按 `\n\n` 分割事件
4. 解析 `data:` 后面的JSON
5. 根据事件类型做相应处理

**各语言实现要点：**

| 语言/平台 | HTTP库 | 关键参数 |
|----------|--------|---------|
| **Python** | `requests` | `stream=True`, 然后 `iter_lines()` |
| **Java** | `OkHttp` | 使用流式API读取响应 |
| **Swift (iOS)** | `URLSession` | `dataTask` 的代理方法 |
| **Kotlin (Android)** | `OkHttp` / `Ktor` | 流式读取响应体 |

SSE是标准HTTP协议，所有语言的实现逻辑都是相同的。

:::

---

## 五、可用的Agent接口（示例）

::: warning 接口说明
平台提供了多个Agent接口，每个接口对应一个特定的任务。下面是**部分示例接口**，完整的接口列表请查看 [Swagger文档](http://fdueblab.cn:8010/)。

**基础URL：** `https://fdueblab.cn`
:::

### 原子微服务技术评测接口

**任务描述：** 对微服务进行多维度技术评测

```http
POST /api/agent/service_evaluation
Content-Type: multipart/form-data
```

**参数：**
- `service_name` (必需, string): 待评测的服务名称
- `metrics` (必需, string): JSON数组格式，可选值：
  - `privacy` - 隐私性评测
  - `safety-fingerprint` - 安全性评测（数字指纹）
  - `safety-watermark` - 安全性评测（数字水印）
  - `fairness` - 公平性评测
  - `robustness` - 鲁棒性评测
  - `explainability` - 可解释性评测
- `data_file` 或 `file_url` (二选一): 测试数据集

**调用示例：**
```javascript
const formData = new FormData()
formData.append('service_name', 'face-recognition')
formData.append('metrics', JSON.stringify(['privacy', 'fairness', 'robustness']))
formData.append('data_file', zipFile)  // 或使用 file_url

await streamAgent('/api/agent/service_evaluation', formData, {
  onStep: (step) => console.log(`步骤${step.step}: ${step.step_name}`),
  onFinalResult: (results) => console.log(results.evaluation_result)
})
```

**返回结果：**
```json
{
  "evaluation_result": {
    "privacy": { "score": 0.85, "details": "..." },
    "fairness": { "score": 0.90, "details": "..." },
    "robustness": { "score": 0.88, "details": "..." }
  }
}
```

::: tip 文件上传的两种方式

所有接口都支持两种文件提供方式，**二选一即可**：

1. **直接上传**：使用 `file` / `data_file` 参数上传本地文件
   - 适合文件较小（< 50MB）的情况
   
2. **URL下载**：使用 `file_url` 参数提供远程文件地址
   - 适合文件较大（> 50MB）或文件已在云存储的情况
   - 服务器直接从云存储下载，速度更快

:::

---

## 六、常见问题

::: details Q: 如何判断任务是否完成？

**判断标准：**

- `is_final_result: true` → ✅ 任务成功完成，结果在 `final_results` 字段
- `error: "..."` → ❌ 任务失败，错误信息在 `error` 字段
- `warning: "..."` → ⚠️ 有警告但未完全失败

:::

::: details Q: 如何提取智能体的观察、思考、执行信息？

步骤事件的 `content` 字段包含了智能体当前步骤的详细信息。智能体通常的输出格式：

```
Observation: [智能体观察到的信息]
Thought: [智能体的思考过程]
Action: [智能体采取的行动]
```

你可以解析 `content` 字段来提取这些信息并展示给用户，让用户了解AI的决策过程。

:::

::: details Q: 移动端如何实现？

核心原理完全相同，只是使用不同的HTTP库：

- **iOS**: 使用 `URLSession` 的流式API
- **Android**: 使用 `OkHttp` 或 `Ktor` 的流式读取

关键是要流式读取响应，按 `\n\n` 分割事件，解析JSON。

:::

---

::: tip 相关资源
- **Swagger API文档：** [http://fdueblab.cn:8010/](http://fdueblab.cn:8010/)
- **项目仓库：** [https://github.com/PolarSnowLeopard/ioeb](https://github.com/PolarSnowLeopard/ioeb)
- **相关文档：**
  - [模型上下文协议（MCP）介绍](/dev/mcp-intro)
  - [大模型智能体介绍](/dev/ai-agent-intro)
  - [智能体添加指南](/dev/add-agent)
:::
