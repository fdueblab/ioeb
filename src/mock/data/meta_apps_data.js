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
      id: '9000',
      name: '基于多智能体协作的金融欺诈检测推理服务',
      type: 'process',
      state: 'success',
      serviceKey: 'DataAnalysisService',
      tools: [
        { name: 'batchAnalyzeTransactions', description: '批量分析交易数据' },
        { name: 'detectAnomalies', description: '检测异常交易模式' },
        { name: 'calculateRiskScore', description: '计算风险评分' },
        { name: 'extractFeatures', description: '提取交易特征' }
      ]
    },
    {
      id: '9101',
      name: '报告生成服务',
      type: 'process',
      state: 'success',
      serviceKey: 'ReportService',
      tools: [
        { name: 'generateReport', description: '生成检测报告' },
        { name: 'formatResults', description: '格式化分析结果' },
        { name: 'exportToPDF', description: '导出PDF报告' },
        { name: 'sendNotification', description: '发送报告通知' }
      ]
    },
    {
      id: '9102',
      name: '数据管理服务',
      type: 'process',
      state: 'warning',
      serviceKey: 'DataManagementService',
      tools: [
        { name: 'getReportData', description: '获取报告数据' },
        { name: 'storeResults', description: '存储分析结果' },
        { name: 'queryHistoricalData', description: '查询历史数据' },
        { name: 'backupData', description: '备份重要数据' }
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
      type: 'process',
      state: 'success',
      serviceKey: 'SpeechRecognitionService',
      tools: [
        { name: 'transcribe', description: '语音转文字' },
        { name: 'detectLanguage', description: '检测语言类型' },
        { name: 'filterNoise', description: '语音降噪处理' },
        { name: 'extractKeywords', description: '提取关键词' }
      ]
    },
    {
      id: '8101',
      name: '医疗诊断服务',
      type: 'process',
      state: 'success',
      serviceKey: 'MedicalDiagnosisService',
      tools: [
        { name: 'diagnose', description: '医疗影像诊断' },
        { name: 'analyzeSymptoms', description: '症状分析' },
        { name: 'suggestTreatment', description: '治疗建议' },
        { name: 'riskAssessment', description: '风险评估' }
      ]
    },
    {
      id: '8201',
      name: '健康监测服务',
      type: 'process',
      state: 'success',
      serviceKey: 'HealthMonitoringService',
      tools: [
        { name: 'analyze', description: '健康数据分析' },
        { name: 'trackVitals', description: '生命体征追踪' },
        { name: 'predictTrends', description: '健康趋势预测' },
        { name: 'generateReports', description: '生成健康报告' }
      ]
    },
    {
      id: '8202',
      name: '预警通知服务',
      type: 'process',
      state: 'warning',
      serviceKey: 'AlertNotificationService',
      tools: [
        { name: 'alert', description: '健康预警' },
        { name: 'sendNotification', description: '发送通知' },
        { name: 'escalateUrgent', description: '紧急情况升级' },
        { name: 'logEvents', description: '记录预警事件' }
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
      type: 'process',
      state: 'success',
      serviceKey: 'ImageAnalysisService',
      tools: [
        { name: 'analyzeImage', description: '农作物图像分析' },
        { name: 'identifyDisease', description: '病虫害识别' },
        { name: 'assessGrowth', description: '生长状态评估' },
        { name: 'detectWeeds', description: '杂草检测' }
      ]
    },
    {
      id: '5101',
      name: '作物预测服务',
      type: 'process',
      state: 'success',
      serviceKey: 'CropPredictionService',
      tools: [
        { name: 'predictYield', description: '产量预测' },
        { name: 'recommendActions', description: '农事建议' },
        { name: 'optimizeIrrigation', description: '灌溉优化' },
        { name: 'fertilizeRecommend', description: '施肥建议' }
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
      id: '3001',
      name: '目标识别服务',
      type: 'process',
      state: 'success',
      serviceKey: 'TargetRecognitionService',
      tools: [
        { name: 'getTargetLocation', description: '获取目标位置' },
        { name: 'getTargetInfo', description: '获取目标信息' },
        { name: 'trackTarget', description: '目标跟踪' },
        { name: 'classifyTarget', description: '目标分类' }
      ]
    },
    {
      id: '3101',
      name: '远程控制服务',
      type: 'process',
      state: 'warning',
      serviceKey: 'RemoteControlService',
      tools: [
        { name: 'setTargetLocation', description: '设置目标位置' },
        { name: 'setMotionMode', description: '设置运动模式' },
        { name: 'adjustAltitude', description: '调整飞行高度' },
        { name: 'emergencyLanding', description: '紧急降落' }
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
      type: 'process',
      state: 'success',
      serviceKey: 'MultilingualContentService',
      tools: [
        { name: 'translateContent', description: '内容翻译' },
        { name: 'generateDescription', description: '生成商品描述' },
        { name: 'localizeContent', description: '内容本地化' },
        { name: 'optimizeSEO', description: 'SEO优化' }
      ]
    },
    {
      id: '6101',
      name: '市场分析服务',
      type: 'process',
      state: 'success',
      serviceKey: 'MarketAnalysisService',
      tools: [
        { name: 'analyzeTrend', description: '趋势分析' },
        { name: 'predictSales', description: '销量预测' },
        { name: 'competitorAnalysis', description: '竞品分析' },
        { name: 'priceOptimization', description: '价格优化' }
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
      type: 'process',
      state: 'success',
      serviceKey: 'FlightControlService',
      tools: [
        { name: 'pathPlanner', description: '路径规划' },
        { name: 'flightController', description: '飞行控制' },
        { name: 'stabilityControl', description: '稳定性控制' },
        { name: 'autoLanding', description: '自动降落' }
      ]
    },
    {
      id: '4101',
      name: '环境感知服务',
      type: 'process',
      state: 'success',
      serviceKey: 'EnvironmentPerceptionService',
      tools: [
        { name: 'environmentPerception', description: '环境感知' },
        { name: 'obstacleDetection', description: '障碍物检测' },
        { name: 'weatherAnalysis', description: '天气分析' },
        { name: 'safetyAssessment', description: '安全评估' }
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
      type: 'process',
      state: 'success',
      serviceKey: 'HomeEnvironmentService',
      tools: [
        { name: 'objectDetection', description: '物体检测' },
        { name: 'spatialMapping', description: '空间映射' },
        { name: 'homeSecurityMonitor', description: '家庭安防监控' },
        { name: 'environmentControl', description: '环境控制' }
      ]
    },
    {
      id: '7101',
      name: '智能对话服务',
      type: 'process',
      state: 'success',
      serviceKey: 'IntelligentDialogService',
      tools: [
        { name: 'naturalLanguageUnderstanding', description: '自然语言理解' },
        { name: 'emotionRecognition', description: '情感识别' },
        { name: 'voiceInteraction', description: '语音交互' },
        { name: 'personalAssistant', description: '个人助理' }
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
      name: '课题一风险识别模型推理服务',
      type: 'process',
      state: 'success',
      serviceKey: 'Project1ModelService',
      tools: [
        { name: 'preprocess', description: '数据预处理' },
        { name: 'predict', description: '风险预测' },
        { name: 'visualize', description: '可视化分析' }
      ]
    },
    {
      id: '9101',
      name: '样例报告生成服务',
      type: 'process',
      state: 'warning',
      serviceKey: 'SampleReportService',
      tools: [
        { name: 'generateReport', description: '生成样例报告' },
        { name: 'getReportData', description: '获取报告数据' }
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
      id: '9000',
      name: '课题二多方安全计算模型推理服务',
      type: 'process',
      state: 'success',
      serviceKey: 'Project2SecureComputingService',
      tools: [
        { name: 'preprocess', description: '安全数据预处理' },
        { name: 'predict', description: '多方计算预测' },
        { name: 'visualize', description: '安全可视化' }
      ]
    },
    {
      id: '9101',
      name: '样例报告生成服务',
      type: 'process',
      state: 'warning',
      serviceKey: 'SampleReportService',
      tools: [
        { name: 'generateReport', description: '生成课题二报告' },
        { name: 'getReportData', description: '获取安全报告数据' }
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
      name: '课题四模型评测-安全性指纹服务',
      type: 'process',
      state: 'success',
      serviceKey: 'Project4SafetyFingerprintService',
      tools: [
        { name: 'safetyFingerprint', description: '安全性指纹识别' },
        { name: 'modelEvaluation', description: '模型安全评估' },
        { name: 'securityAnalysis', description: '安全性分析' }
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
      type: 'process',
      state: 'success',
      serviceKey: 'Project1ModelService',
      tools: [
        { name: 'preprocess', description: '数据预处理' },
        { name: 'predict', description: '风险预测' }
      ]
    },
    {
      id: '11000',
      name: '课题四模型评测-安全性指纹服务',
      type: 'process',
      state: 'success',
      serviceKey: 'Project4SafetyFingerprintService',
      tools: [
        { name: 'safetyFingerprint', description: '安全性指纹识别' }
      ]
    },
    {
      id: '9101',
      name: '课题三金融风险报告生成服务',
      type: 'process',
      state: 'success',
      serviceKey: 'Project3ReportGenerationService',
      tools: [
        { name: 'generateReport', description: '生成综合风险报告' },
        { name: 'riskAssessment', description: '综合风险评估' },
        { name: 'reportFormatting', description: '报告格式化' }
      ]
    }
  ]
}

// 根据流程数据生成服务树结构的工具函数，用于适配现有的输出格式
// todo: 之后应该优化接收端的格式需求
function generateServiceNodes(flowData, rootServiceText = '智能服务') {
  const rootId = '9'
  const groupMap = new Map()
  const chosenServices = []

  // 按服务分组
  flowData.nodeList.forEach(node => {
    const { name, serviceKey } = node

    if (!groupMap.has(serviceKey)) {
      chosenServices.push(name)
      groupMap.set(serviceKey, {
        id: serviceKey.toLowerCase().replace(/service$/i, ''),
        type: 'group',
        name,
        serviceKey,
        open: false,
        children: []
      })
    }

    const tools = node.tools || []
    tools.forEach((tool, index) => {
      groupMap.get(serviceKey).children.push({
        id: `${node.id}${String(index + 1).padStart(2, '0')}`,
        type: 'tool',
        name: tool.name,
        description: tool.description
      })
    })
  })

  return {
    chosenServices,
    serviceNodes: [
      {
        id: rootId,
        type: 'group',
        name: rootServiceText,
        open: true,
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
        const serviceTextMap = {
          'aircraft': '无人飞机AI监控服务',
          'health': '乡村医疗AI服务',
          'agriculture': '农业数智AI服务',
          'evtol': '低空飞行AI应用服务',
          'ecommerce': '跨境电商AI服务',
          'homeAI': '家庭机器人AI服务',
          'aml': '跨境支付AI监测服务'
        }

        const rootServiceText = serviceTextMap[serviceType] || '智能服务'
        const { chosenServices, serviceNodes } = generateServiceNodes(flowData, rootServiceText)

        resolve({ chosenServices, serviceNodes, flowData })
      }
    }, 1600)
  })
}
