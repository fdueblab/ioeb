// 统一的元应用数据文件
// 简化后的数据结构：去除冗余，只保留核心流程数据
// todo: 从数据库中获取nodeList对应的服务

// 金融欺诈检测推理元应用
const fraudDetectionApp = {
  preName: '金融欺诈检测推理元应用',
  preInputName: '金融交易数据',
  preOutputName: '欺诈检测评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: 'c48aad98-4a7b-4498-a4d5-ac2f991d1c0d',
      name: '基于多智能体协作的金融欺诈检测推理MCP服务',
      url: 'http://fdueblab.cn:8778/sse',
      des: '供智能体调用的基于多智能体协作的金融欺诈检测推理服务，基于多个金融欺诈检测模型的协作，可以对交易进行多维度的风险评估和欺诈预警',
      attribute: 'custom',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '1',
      scenario: '2',
      technology: '1',
      status: 'pre_release_unrated',
      number: 67,
      deleted: 0,
      tools: [
        { id: 'tool-001-health-check-mcp1', name: 'healthCheck', des: '判断微服务状态是否正常可用' },
        { id: 'tool-002-analyze-transaction', name: 'analyzeTransaction', des: '单笔交易风险分析' },
        { id: 'tool-003-batch-analyze-transactions', name: 'batchAnalyzeTransactions', des: '批量交易风险分析' },
        { id: 'tool-004-get-agents-status', name: 'getAgentsStatus', des: '获取各智能体状态' },
        { id: 'tool-005-get-model-info', name: 'getModelInfo', des: '获取模型信息' }
      ]
    },
    {
      id: '02a951d1-09b1-4d65-9f6c-cf048e5f620f',
      name: '样例报告生成MCP服务',
      url: 'https://myMcpServer.com/report-generation/sse',
      method: 'sse',
      des: '供智能体调用的课题五mcp样例服务，用于功能演示',
      attribute: 'non_intelligent',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '2',
      scenario: '3',
      technology: '3',
      status: 'pre_release_unrated',
      number: 45,
      deleted: 0,
      tools: [
        { id: 'tool-011-report-generation-health', name: 'healthCheck', des: '判断样例报告生成MCP服务状态是否正常可用' },
        { id: 'tool-012-generate-report', name: 'generateReport', des: '基于输入数据生成分析报告' }
      ]
    },
    {
      id: 'c582ad98-4a7b-4498-a4d5-a52f991d1c0e',
      name: '课题四模型评测-安全性指纹MCP服务',
      des: '供智能体调用的基于课题四算法的mcp服务，可用于模型安全性评测和指纹识别',
      url: 'https://myMcpServer.com/model-security-fingerprint/sse',
      method: 'sse',
      attribute: 'paid',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '3',
      scenario: '4',
      technology: '4',
      status: 'released',
      number: 134,
      deleted: 0,
      tools: [
        { id: 'tool-019-security-fingerprint-health', name: 'healthCheck', des: '判断课题四模型评测-安全性指纹MCP服务状态是否正常可用' },
        { id: 'tool-020-security-fingerprint-detect', name: 'securityFingerprintDetect', des: '对机器学习模型进行安全性指纹检测' },
        { id: 'tool-021-evaluate-model-security', name: 'evaluateModelSecurity', des: '评估模型抗攻击能力和安全风险等级' }
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
      status: 'released',
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
      status: 'pre_release_unrated',
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
      status: 'pre_release_unrated',
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
      status: 'pre_release_unrated',
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
      status: 'released',
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
      status: 'pre_release_unrated',
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
      id: '75e5ff68-23a9-4109-967d-a5a76f29ba6b',
      name: '无人机目标识别MCP服务',
      des: '供智能体调用的无人机目标识别mcp服务，可用于空中目标检测和识别任务',
      url: 'https://myMcpServer.com/aircraft-detection/sse',
      method: 'sse',
      type: 'atomic_mcp',
      parameter_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-028-aircraft-detection-health', name: 'healthCheck', des: '判断无人机目标识别MCP服务状态是否正常可用' },
        { id: 'tool-029-detect-targets', name: 'detectTargets', des: '检测和识别空中或地面目标' },
        { id: 'tool-030-analyze-objects', name: 'analyzeObjects', des: '分析识别到的目标对象特征' }
      ]
    },
    {
      id: 'db43a293-fb67-4efb-b65b-ec22d9cca5af',
      name: '无人机远程控制MCP服务',
      des: '供智能体调用的无人机远程控制mcp服务，可用于无人机远程操控和飞行管理',
      url: 'https://myMcpServer.com/aircraft-control/sse',
      method: 'sse',
      type: 'atomic_mcp',
      parameter_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-031-aircraft-control-health', name: 'healthCheck', des: '判断无人机远程控制MCP服务状态是否正常可用' },
        { id: 'tool-032-remote-control', name: 'remoteControl', des: '远程控制无人机飞行和操作' },
        { id: 'tool-033-flight-monitoring', name: 'flightMonitoring', des: '实时监控无人机飞行状态和参数' }
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
      status: 'released',
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
      status: 'pre_release_unrated',
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
      status: 'released',
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
      status: 'pre_release_unrated',
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
      status: 'pre_release_unrated',
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
      status: 'pre_release_unrated',
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
      id: '3c3d4e4d-36e4-4436-bea1-63af2117d0cd',
      name: '课题一风险识别模型推理MCP服务',
      des: '供智能体调用的基于课题一算法的mcp服务，可用于金融风险识别和模型推理',
      url: 'https://myMcpServer.com/risk-identification/sse',
      method: 'sse',
      attribute: 'open_source',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '0',
      scenario: '1',
      technology: '1',
      status: 'released',
      number: 89,
      deleted: 0,
      parameter_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-013-risk-identification-health', name: 'healthCheck', des: '判断课题一风险识别模型推理MCP服务状态是否正常可用' },
        { id: 'tool-014-risk-predict', name: 'predict', des: '对客户信息进行风险识别和模型推理分析' },
        { id: 'tool-015-risk-evaluate', name: 'evaluate', des: '评估风险等级和给出风控建议' }
      ]
    },
    {
      id: '02a951d1-09b1-4d65-9f6c-cf048e5f620f',
      name: '样例报告生成MCP服务',
      url: 'https://myMcpServer.com/report-generation/sse',
      method: 'sse',
      des: '供智能体调用的课题五mcp样例服务，用于功能演示',
      attribute: 'non_intelligent',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '2',
      scenario: '3',
      technology: '3',
      status: 'pre_release_unrated',
      number: 45,
      deleted: 0,
      tools: [
        { id: 'tool-011-report-generation-health', name: 'healthCheck', des: '判断样例报告生成MCP服务状态是否正常可用' },
        { id: 'tool-012-generate-report', name: 'generateReport', des: '基于输入数据生成分析报告' }
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
      id: '5fda9469-dcd7-4032-affb-9c9df0cd2cc7',
      name: '课题二多方安全计算模型推理MCP服务',
      des: '供智能体调用的基于课题二多方安全计算算法的mcp服务，可用于多机构联合反洗钱分析而无需共享敏感数据',
      url: 'https://myMcpServer.com/multi-party-computation/sse',
      method: 'sse',
      attribute: 'open_source',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '0',
      scenario: '1',
      technology: '1',
      network: 'ioeb_app-network',
      port: '8770/tcp → 0.0.0.0:8770 :::8770',
      volume: '/home/ubuntu/ioeb/api/Project_2/mcp -> /app/mcp',
      status: 'pre_release_unrated',
      number: 112,
      deleted: 0,
      create_time: 1744635999632,
      creator_id: '',
      parameter_type: 1,
      response_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-037-mpc-health-check', name: 'healthCheck', des: '判断课题二多方安全计算MCP服务状态是否正常可用' },
        { id: 'tool-038-mpc-compute', name: 'multiPartyCompute', des: '启动多方安全计算协议，联合分析多机构数据而不泄露隐私' },
        { id: 'tool-039-mpc-analyze', name: 'jointAnalyze', des: '执行跨机构联合反洗钱分析和洗钱网络识别' }
      ]
    },
    {
      id: '02a951d1-09b1-4d65-9f6c-cf048e5f620f',
      name: '样例报告生成MCP服务',
      url: 'https://myMcpServer.com/report-generation/sse',
      method: 'sse',
      des: '供智能体调用的课题五mcp样例服务，用于功能演示',
      attribute: 'non_intelligent',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '2',
      scenario: '3',
      technology: '3',
      status: 'pre_release_unrated',
      number: 45,
      deleted: 0,
      tools: [
        { id: 'tool-011-report-generation-health', name: 'healthCheck', des: '判断样例报告生成MCP服务状态是否正常可用' },
        { id: 'tool-012-generate-report', name: 'generateReport', des: '基于输入数据生成分析报告' }
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
      id: 'c582ad98-4a7b-4498-a4d5-a52f991d1c0e',
      name: '课题四模型评测-安全性指纹MCP服务',
      des: '供智能体调用的基于课题四算法的mcp服务，可用于模型安全性评测和指纹识别',
      url: 'https://myMcpServer.com/model-security-fingerprint/sse',
      method: 'sse',
      attribute: 'paid',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '3',
      scenario: '4',
      technology: '4',
      status: 'released',
      number: 134,
      deleted: 0,
      parameter_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-019-security-fingerprint-health', name: 'healthCheck', des: '判断课题四模型评测-安全性指纹MCP服务状态是否正常可用' },
        { id: 'tool-020-security-fingerprint-detect', name: 'securityFingerprintDetect', des: '对机器学习模型进行安全性指纹检测' },
        { id: 'tool-021-evaluate-model-security', name: 'evaluateModelSecurity', des: '评估模型抗攻击能力和安全风险等级' }
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
      id: '3c3d4e4d-36e4-4436-bea1-63af2117d0cd',
      name: '课题一风险识别模型推理MCP服务',
      des: '供智能体调用的基于课题一算法的mcp服务，可用于金融风险识别和模型推理',
      url: 'https://myMcpServer.com/risk-identification/sse',
      method: 'sse',
      attribute: 'open_source',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '0',
      scenario: '1',
      technology: '1',
      status: 'released',
      number: 89,
      deleted: 0,
      parameter_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-013-risk-identification-health', name: 'healthCheck', des: '判断课题一风险识别模型推理MCP服务状态是否正常可用' },
        { id: 'tool-014-risk-predict', name: 'predict', des: '对客户信息进行风险识别和模型推理分析' },
        { id: 'tool-015-risk-evaluate', name: 'evaluate', des: '评估风险等级和给出风控建议' }
      ]
    },
    {
      id: 'c582ad98-4a7b-4498-a4d5-a52f991d1c0e',
      name: '课题四模型评测-安全性指纹MCP服务',
      des: '供智能体调用的基于课题四算法的mcp服务，可用于模型安全性评测和指纹识别',
      url: 'https://myMcpServer.com/model-security-fingerprint/sse',
      method: 'sse',
      attribute: 'paid',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '3',
      scenario: '4',
      technology: '4',
      status: 'released',
      number: 134,
      deleted: 0,
      parameter_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-019-security-fingerprint-health', name: 'healthCheck', des: '判断课题四模型评测-安全性指纹MCP服务状态是否正常可用' },
        { id: 'tool-020-security-fingerprint-detect', name: 'securityFingerprintDetect', des: '对机器学习模型进行安全性指纹检测' },
        { id: 'tool-021-evaluate-model-security', name: 'evaluateModelSecurity', des: '评估模型抗攻击能力和安全风险等级' }
      ]
    },
    {
      id: 'b452ae47-92db-4281-8faf-9491ab6baea4',
      name: '课题三金融风险报告生成MCP服务',
      des: '供智能体调用的基于课题三算法的mcp服务，可用于金融风险报告自动化生成',
      method: 'sse',
      attribute: 'paid',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '3',
      scenario: '4',
      technology: '4',
      status: 'released',
      number: 26,
      deleted: 0,
      parameter_type: 1,
      is_fake: 1,
      tools: [
        { id: 'tool-016-financial-risk-health', name: 'healthCheck', des: '判断课题三金融风险报告生成MCP服务状态是否正常可用' },
        { name: 'generateReport', des: '生成金融风险报告，包含信用风险、市场风险和操作风险分析' },
        { id: 'tool-018-analyze-risk-data', name: 'analyzeRiskData', des: '分析多维度风险数据和指标' }
      ]
    }
  ]
}

// 围标检测元应用
const bidRiggingDetectionApp = {
  preName: '围标检测元应用',
  preInputName: '投标数据与招标信息',
  preOutputName: '围标风险评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: 'ad43a293-fb67-4efb-b65b-ec22d9cca5ae',
      name: '围标检测MCP服务',
      des: '提供机器学习模型预测和风险调整功能的MCP服务',
      url: 'http://fdueblab.cn:26023/sse',
      method: 'sse',
      attribute: 'custom',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '1',
      scenario: '2',
      technology: '4',
      status: 'pre_release_unrated',
      number: 7,
      deleted: 0,
      parameter_type: 1,
      response_type: 1,
      is_fake: 0,
      tools: [
        { id: 'tool-008-health-check-mcp3', name: 'healthCheck', des: '判断微服务状态是否正常可用' },
        { id: 'tool-009-flask-predict', name: 'flask_predict', des: '传入特征数组，获取模型预测结果和解释' }
      ]
    },
    {
      id: '02a951d1-09b1-4d65-9f6c-cf048e5f620f',
      name: '样例报告生成MCP服务',
      url: 'https://myMcpServer.com/report-generation/sse',
      method: 'sse',
      des: '供智能体调用的课题五mcp样例服务，用于功能演示',
      attribute: 'non_intelligent',
      type: 'atomic_mcp',
      domain: 'aml',
      industry: '2',
      scenario: '3',
      technology: '3',
      status: 'pre_release_unrated',
      number: 45,
      deleted: 0,
      tools: [
        { id: 'tool-011-report-generation-health', name: 'healthCheck', des: '判断样例报告生成MCP服务状态是否正常可用' },
        { id: 'tool-012-generate-report', name: 'generateReport', des: '基于输入数据生成分析报告' }
      ]
    }
  ]
}

// 服务类型映射表 - 统一管理
export const SERVICE_TEXT_MAP = {
  'aircraft': '无人飞机AI监控服务',
  'health': '乡村医疗AI应用服务',
  'agriculture': '农业数智AI应用服务',
  'evtol': '低空飞行AI应用服务',
  'ecommerce': '跨境电商AI应用服务',
  'homeAI': '家庭陪伴AI应用服务',
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
    tools.forEach((tool) => {
      groupMap.get(id).children.push({
        id: tool.id,
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
          } else if (userInput.includes('围标')) {
            flowData = bidRiggingDetectionApp
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
