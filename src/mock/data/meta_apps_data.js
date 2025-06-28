// 统一的元应用数据文件
// 简化后的数据结构：去除冗余，只保留核心流程数据

// 金融欺诈检测推理元应用
const fraudDetectionApp = {
  preName: '金融欺诈检测推理元应用',
  preInputName: '金融交易数据',
  preOutputName: '欺诈检测评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '19000',
      name: '基于多智能体协作的金融欺诈检测推理MCP服务',
      url: 'http://fdueblab.cn:8778/sse',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'batchAnalyzeTransactions', des: '批量分析交易数据' },
        { name: 'detectAnomalies', des: '检测异常交易模式' },
        { name: 'calculateRiskScore', des: '计算风险评分' },
        { name: 'extractFeatures', des: '提取交易特征' }
      ]
    },
    {
      id: '9101',
      name: '样例报告生成微服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'generateReport', des: '生成检测报告' },
        { name: 'formatResults', des: '格式化分析结果' },
        { name: 'exportToPDF', des: '导出PDF报告' },
        { name: 'sendNotification', des: '发送报告通知' }
      ]
    },
    {
      id: '19102',
      name: '数据管理服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'getReportData', des: '获取报告数据' },
        { name: 'storeResults', des: '存储分析结果' },
        { name: 'queryHistoricalData', des: '查询历史数据' },
        { name: 'backupData', des: '备份重要数据' }
      ]
    }
  ]
}

// 乡村医疗AI辅助诊断元应用
const medicalDiagnosisApp = {
  preName: '乡村医疗AI辅助诊断元应用',
  preInputName: '患者医疗数据',
  preOutputName: '诊断与健康管理方案',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '8001',
      name: '语音识别服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'transcribe', des: '语音转文字' },
        { name: 'detectLanguage', des: '检测语言类型' },
        { name: 'filterNoise', des: '语音降噪处理' },
        { name: 'extractKeywords', des: '提取关键词' }
      ]
    },
    {
      id: '8101',
      name: '医疗诊断服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'diagnose', des: '医疗影像诊断' },
        { name: 'analyzeSymptoms', des: '症状分析' },
        { name: 'suggestTreatment', des: '治疗建议' },
        { name: 'riskAssessment', des: '风险评估' }
      ]
    },
    {
      id: '8201',
      name: '健康监测服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'analyze', des: '健康数据分析' },
        { name: 'trackVitals', des: '生命体征追踪' },
        { name: 'predictTrends', des: '健康趋势预测' },
        { name: 'generateReports', des: '生成健康报告' }
      ]
    },
    {
      id: '8202',
      name: '预警通知服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'alert', des: '健康预警' },
        { name: 'sendNotification', des: '发送通知' },
        { name: 'escalateUrgent', des: '紧急情况升级' },
        { name: 'logEvents', des: '记录预警事件' }
      ]
    }
  ]
}

// 农业数智AI元应用
const agricultureApp = {
  preName: '农业数智AI元应用',
  preInputName: '农业数据输入',
  preOutputName: '农业智能分析报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '5001',
      name: '图像分析服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'analyzeImage', des: '农作物图像分析' },
        { name: 'identifyDisease', des: '病虫害识别' },
        { name: 'assessGrowth', des: '生长状态评估' },
        { name: 'detectWeeds', des: '杂草检测' }
      ]
    },
    {
      id: '5101',
      name: '作物预测服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'predictYield', des: '产量预测' },
        { name: 'recommendActions', des: '农事建议' },
        { name: 'optimizeIrrigation', des: '灌溉优化' },
        { name: 'fertilizeRecommend', des: '施肥建议' }
      ]
    }
  ]
}

// 智能飞行控制元应用
const aircraftApp = {
  preName: '智能飞行控制元应用',
  preInputName: '智能飞行器参数',
  preOutputName: '智能飞行器任务结果',
  inputType: 1,
  outputType: 1,
  nodeList: [
    {
      id: '13001',
      name: '目标识别服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'getTargetLocation', des: '获取目标位置' },
        { name: 'getTargetInfo', des: '获取目标信息' },
        { name: 'trackTarget', des: '目标跟踪' },
        { name: 'classifyTarget', des: '目标分类' }
      ]
    },
    {
      id: '13101',
      name: '远程控制服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'setTargetLocation', des: '设置目标位置' },
        { name: 'setMotionMode', des: '设置运动模式' },
        { name: 'adjustAltitude', des: '调整飞行高度' },
        { name: 'emergencyLanding', des: '紧急降落' }
      ]
    }
  ]
}

// 跨境电商智能营销元应用
const ecommerceApp = {
  preName: '跨境电商智能营销元应用',
  preInputName: '产品信息与市场需求',
  preOutputName: '多语言营销方案',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '6001',
      name: '多语言内容生成服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'translateContent', des: '内容翻译' },
        { name: 'generateDescription', des: '生成商品描述' },
        { name: 'localizeContent', des: '内容本地化' },
        { name: 'optimizeSEO', des: 'SEO优化' }
      ]
    },
    {
      id: '6101',
      name: '市场分析服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'analyzeTrend', des: '趋势分析' },
        { name: 'predictSales', des: '销量预测' },
        { name: 'competitorAnalysis', des: '竞品分析' },
        { name: 'priceOptimization', des: '价格优化' }
      ]
    }
  ]
}

// 低空飞行AI应用元应用
const evtolApp = {
  preName: 'eVTOL智能飞行控制元应用',
  preInputName: '飞行任务参数',
  preOutputName: '飞行控制结果',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '4001',
      name: '飞行控制服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'pathPlanner', des: '路径规划' },
        { name: 'flightController', des: '飞行控制' },
        { name: 'stabilityControl', des: '稳定性控制' },
        { name: 'autoLanding', des: '自动降落' }
      ]
    },
    {
      id: '4101',
      name: '环境感知服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'environmentPerception', des: '环境感知' },
        { name: 'obstacleDetection', des: '障碍物检测' },
        { name: 'weatherAnalysis', des: '天气分析' },
        { name: 'safetyAssessment', des: '安全评估' }
      ]
    }
  ]
}

// 家庭智能助手元应用
const homeAIApp = {
  preName: '家庭智能助手元应用',
  preInputName: '家庭环境数据与指令',
  preOutputName: '智能家庭管理方案',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '7001',
      name: '环境感知服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'objectDetection', des: '物体检测' },
        { name: 'spatialMapping', des: '空间映射' },
        { name: 'homeSecurityMonitor', des: '家庭安防监控' },
        { name: 'environmentControl', des: '环境控制' }
      ]
    },
    {
      id: '7101',
      name: '智能对话服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'naturalLanguageUnderstanding', des: '自然语言理解' },
        { name: 'emotionRecognition', des: '情感识别' },
        { name: 'voiceInteraction', des: '语音交互' },
        { name: 'personalAssistant', des: '个人助理' }
      ]
    }
  ]
}

// 课题一风险识别报告生成元应用
const pj1App = {
  preName: '课题一风险识别报告生成元应用',
  preInputName: '课题一跨境支付数据',
  preOutputName: '课题一风险评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '9000',
      name: '课题一风险识别模型推理微服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'preprocess', des: '数据预处理' },
        { name: 'predict', des: '风险预测' },
        { name: 'visualize', des: '可视化分析' }
      ]
    },
    {
      id: '9101',
      name: '样例报告生成服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'generateReport', des: '生成样例报告' },
        { name: 'getReportData', des: '获取报告数据' }
      ]
    }
  ]
}

// 课题二风险识别报告生成元应用
const pj2App = {
  preName: '课题二风险识别报告生成元应用',
  preInputName: '跨境支付数据',
  preOutputName: '课题二风险评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: '课题二多方安全计算模型推理微服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'preprocess', des: '安全数据预处理' },
        { name: 'predict', des: '多方计算预测' },
        { name: 'visualize', des: '安全可视化' }
      ]
    },
    {
      id: '9101',
      name: '样例报告生成服务',
      type: 'atomic_mcp',
      state: 'pre_release_unrated',
      tools: [
        { name: 'generateReport', des: '生成课题二报告' },
        { name: 'getReportData', des: '获取安全报告数据' }
      ]
    }
  ]
}

// 课题四模型评测-安全性指纹元应用
const pj4App = {
  preName: '课题四模型评测-安全性指纹',
  preInputName: '课题四模型数据',
  preOutputName: '课题四安全性指纹报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '11000',
      name: '课题四模型评测-安全性指纹微服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'safetyFingerprint', des: '安全性指纹识别' },
        { name: 'modelEvaluation', des: '模型安全评估' },
        { name: 'securityAnalysis', des: '安全性分析' }
      ]
    }
  ]
}

// 金融风险报告生成（课题一+课题四+课题三）
const pj1pj4pj3App = {
  preName: '金融风险报告生成',
  preInputName: '跨境贸易数据',
  preOutputName: '金融风险报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '9000',
      name: '课题一风险识别模型推理服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'preprocess', des: '数据预处理' },
        { name: 'predict', des: '风险预测' }
      ]
    },
    {
      id: '11000',
      name: '课题四模型评测-安全性指纹服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'safetyFingerprint', des: '安全性指纹识别' }
      ]
    },
    {
      id: '3101',
      name: '课题三金融风险报告生成微服务',
      type: 'atomic_mcp',
      state: 'released',
      tools: [
        { name: 'generateReport', des: '生成综合风险报告' },
        { name: 'riskAssessment', des: '综合风险评估' },
        { name: 'reportFormatting', des: '报告格式化' }
      ]
    }
  ]
}

// 服务类型映射表 - 统一管理
const SERVICE_TEXT_MAP = {
  'aircraft': '无人飞机AI监控服务',
  'health': '乡村医疗AI服务',
  'agriculture': '农业数智AI服务',
  'evtol': '低空飞行AI应用服务',
  'ecommerce': '跨境电商AI服务',
  'homeAI': '家庭机器人AI服务',
  'aml': '跨境支付AI监测服务'
}

// 根据流程数据生成服务树结构的工具函数，用于适配现有的输出格式
// todo: 之后应该优化接收端的格式需求
function generateServiceNodes(flowData, rootServiceText = '智能服务') {
  const rootId = '9'
  const groupMap = new Map()
  const chosenServices = []

  // 按服务分组
  flowData.nodeList.forEach(node => {
    const { name, id } = node

    if (!groupMap.has(id)) {
      chosenServices.push(name)
      groupMap.set(id, {
        id,
        name,
        children: []
      })
    }

    const tools = node.tools || []
    tools.forEach((tool, index) => {
      groupMap.get(id).children.push({
        id: `${id}_tool${index}`,
        name: tool.name,
        des: tool.des
      })
    })
  })

  return {
    chosenServices,
    serviceNodes: [
      {
        id: rootId,
        name: rootServiceText,
        children: Array.from(groupMap.values())
      }
    ]
  }
}

// 导出函数
export function getMetaAppNodes(serviceType, userInput) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let flowData

      switch (serviceType) {
        case 'aircraft':
          flowData = aircraftApp
          break
        case 'health':
          flowData = medicalDiagnosisApp
          break
        case 'agriculture':
          flowData = agricultureApp
          break
        case 'evtol':
          flowData = evtolApp
          break
        case 'ecommerce':
          flowData = ecommerceApp
          break
        case 'homeAI':
          flowData = homeAIApp
          break
        case 'aml':
          // 对于金融领域，根据用户输入选择不同的应用
          if (userInput.includes('课题三')) {
            flowData = pj1pj4pj3App
          } else if (userInput.includes('课题四')) {
            flowData = pj4App
          } else if (userInput.includes('课题一')) {
            flowData = pj1App
          } else if (userInput.includes('课题二')) {
            flowData = pj2App
          } else if (userInput.includes('课题一和课题三') || userInput.includes('综合')) {
            flowData = pj1pj4pj3App
          } else if (userInput.includes('欺诈')) {
            flowData = fraudDetectionApp
          } else {
            reject(new Error('未找到对应的元应用'))
            return
          }
          break
        default:
          reject(new Error('未找到对应的元应用'))
          return
      }

      if (flowData) {
        // 根据服务类型确定根服务名称
        const rootServiceText = SERVICE_TEXT_MAP[serviceType] || '智能服务'
        const { chosenServices, serviceNodes } = generateServiceNodes(flowData, rootServiceText)
        resolve({ chosenServices, serviceNodes, flowData })
      }
    }, 1600)
  })
}

// 获取基础服务节点的函数 - 用于重置时恢复初始状态
export function getBaseServiceNodes(serviceType = 'default') {
  // 根据服务类型确定根服务名称 - 与getMetaAppNodes保持一致
  const rootServiceText = SERVICE_TEXT_MAP[serviceType] || '智能服务'
  return [
    {
      id: '9',
      name: rootServiceText,
      children: []
    }
  ]
}
