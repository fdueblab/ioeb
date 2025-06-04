// 统一的元应用数据文件
// 整合了原来的 chat_data.js 和 flow_data.js 中的数据
// 使用新的数据格式：包含 serviceName 和 tools 数组

// 金融欺诈检测推理元应用
const fraudDetectionApp = {
  chosenServices: ['基于多智能体协作的金融欺诈检测推理服务', '报告生成服务', '数据管理服务'],
  serviceNodes: [
    {
      id: '9',
      type: 'group',
      name: '金融风险AI监测服务',
      open: true,
      children: [
        {
          id: '90',
          type: 'group',
          name: '基于多智能体协作的金融欺诈检测推理服务',
          serviceName: 'DataAnalysisService',
          open: false,
          children: [
            {
              id: '9001',
              type: 'tool',
              name: 'batchAnalyzeTransactions',
              description: '批量分析交易数据'
            },
            {
              id: '9002',
              type: 'tool',
              name: 'detectAnomalies',
              description: '检测异常交易模式'
            },
            {
              id: '9003',
              type: 'tool',
              name: 'calculateRiskScore',
              description: '计算风险评分'
            },
            {
              id: '9004',
              type: 'tool',
              name: 'extractFeatures',
              description: '提取交易特征'
            }
          ]
        },
        {
          id: '91',
          type: 'group',
          name: '报告生成服务',
          serviceName: 'ReportService',
          open: false,
          children: [
            {
              id: '9101',
              name: 'generateReport',
              description: '生成检测报告',
              type: 'tool'
            },
            {
              id: '9102',
              name: 'getReportData',
              description: '获取报告数据',
              type: 'tool'
            }
          ]
        },
        {
          id: '92',
          type: 'group',
          name: '数据管理服务',
          serviceName: 'DataManagementService',
          open: false,
          children: [
            {
              id: '9201',
              name: 'getReportData',
              description: '获取报告数据',
              type: 'tool'
            },
            {
              id: '9202',
              name: 'storeResults',
              description: '存储分析结果',
              type: 'tool'
            },
            {
              id: '9203',
              name: 'queryHistoricalData',
              description: '查询历史数据',
              type: 'tool'
            },
            {
              id: '9204',
              name: 'backupData',
              description: '备份重要数据',
              type: 'tool'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'DataAnalysisService',
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
        serviceName: 'ReportService',
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
        serviceName: 'DataManagementService',
        tools: [
          { name: 'getReportData', description: '获取报告数据' },
          { name: 'storeResults', description: '存储分析结果' },
          { name: 'queryHistoricalData', description: '查询历史数据' },
          { name: 'backupData', description: '备份重要数据' }
        ]
      }
    ]
  }
}

// 乡村医疗AI辅助诊断元应用
const medicalDiagnosisApp = {
  chosenServices: ['语音识别服务', '医疗诊断服务', '健康监测服务'],
  serviceNodes: [
    {
      id: '8',
      type: 'group',
      name: '乡村医疗AI服务',
      open: true,
      children: [
        {
          id: '80',
          type: 'group',
          name: '语音识别服务',
          serviceName: 'SpeechRecognitionService',
          open: false,
          children: [
            {
              id: '8001',
              type: 'tool',
              name: 'transcribe',
              description: '语音转文字'
            },
            {
              id: '8002',
              type: 'tool',
              name: 'detectLanguage',
              description: '检测语言类型'
            },
            {
              id: '8003',
              type: 'tool',
              name: 'filterNoise',
              description: '语音降噪处理'
            },
            {
              id: '8004',
              type: 'tool',
              name: 'extractKeywords',
              description: '提取关键词'
            }
          ]
        },
        {
          id: '81',
          type: 'group',
          name: '医疗诊断服务',
          serviceName: 'MedicalDiagnosisService',
          open: false,
          children: [
            {
              id: '8101',
              type: 'tool',
              name: 'diagnose',
              description: '医疗影像诊断'
            },
            {
              id: '8102',
              type: 'tool',
              name: 'analyzeSymptoms',
              description: '症状分析'
            },
            {
              id: '8103',
              type: 'tool',
              name: 'suggestTreatment',
              description: '治疗建议'
            },
            {
              id: '8104',
              type: 'tool',
              name: 'riskAssessment',
              description: '风险评估'
            }
          ]
        },
        {
          id: '82',
          type: 'group',
          name: '健康监测服务',
          serviceName: 'HealthMonitoringService',
          open: false,
          children: [
            {
              id: '8201',
              type: 'tool',
              name: 'analyze',
              description: '健康数据分析'
            },
            {
              id: '8202',
              type: 'tool',
              name: 'trackVitals',
              description: '生命体征追踪'
            },
            {
              id: '8203',
              type: 'tool',
              name: 'predictTrends',
              description: '健康趋势预测'
            },
            {
              id: '8204',
              type: 'tool',
              name: 'generateReports',
              description: '生成健康报告'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'SpeechRecognitionService',
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
        serviceName: 'MedicalDiagnosisService',
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
        serviceName: 'HealthMonitoringService',
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
        serviceName: 'AlertNotificationService',
        tools: [
          { name: 'alert', description: '健康预警' },
          { name: 'sendNotification', description: '发送通知' },
          { name: 'escalateUrgent', description: '紧急情况升级' },
          { name: 'logEvents', description: '记录预警事件' }
        ]
      }
    ]
  }
}

// 农业数智AI元应用
const agricultureApp = {
  chosenServices: ['图像分析服务', '作物预测服务', '环境监测服务'],
  serviceNodes: [
    {
      id: '5',
      type: 'group',
      name: '农业数智AI服务',
      open: true,
      children: [
        {
          id: '50',
          type: 'group',
          name: '图像分析服务',
          serviceName: 'ImageAnalysisService',
          open: false,
          children: [
            {
              id: '5001',
              type: 'tool',
              name: 'analyzeImage',
              description: '农作物图像分析'
            },
            {
              id: '5002',
              type: 'tool',
              name: 'identifyDisease',
              description: '病虫害识别'
            },
            {
              id: '5003',
              type: 'tool',
              name: 'assessGrowth',
              description: '生长状态评估'
            },
            {
              id: '5004',
              type: 'tool',
              name: 'detectWeeds',
              description: '杂草检测'
            }
          ]
        },
        {
          id: '51',
          type: 'group',
          name: '作物预测服务',
          serviceName: 'CropPredictionService',
          open: false,
          children: [
            {
              id: '5101',
              type: 'tool',
              name: 'predictYield',
              description: '产量预测'
            },
            {
              id: '5102',
              type: 'tool',
              name: 'recommendActions',
              description: '农事建议'
            },
            {
              id: '5103',
              type: 'tool',
              name: 'optimizeIrrigation',
              description: '灌溉优化'
            },
            {
              id: '5104',
              type: 'tool',
              name: 'fertilizeRecommend',
              description: '施肥建议'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'ImageAnalysisService',
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
        serviceName: 'CropPredictionService',
        tools: [
          { name: 'predictYield', description: '产量预测' },
          { name: 'recommendActions', description: '农事建议' },
          { name: 'optimizeIrrigation', description: '灌溉优化' },
          { name: 'fertilizeRecommend', description: '施肥建议' }
        ]
      }
    ]
  }
}

// 智能飞行控制元应用
const aircraftApp = {
  chosenServices: ['目标识别服务', '远程控制服务'],
  serviceNodes: [
    {
      id: '3',
      type: 'group',
      name: '无人飞机AI监控服务',
      open: true,
      children: [
        {
          id: '30',
          type: 'group',
          name: '目标识别服务',
          serviceName: 'TargetRecognitionService',
          open: false,
          children: [
            {
              id: '3001',
              type: 'tool',
              name: 'getTargetLocation',
              description: '获取目标位置'
            },
            {
              id: '3002',
              type: 'tool',
              name: 'getTargetInfo',
              description: '获取目标信息'
            },
            {
              id: '3003',
              type: 'tool',
              name: 'trackTarget',
              description: '目标跟踪'
            },
            {
              id: '3004',
              type: 'tool',
              name: 'classifyTarget',
              description: '目标分类'
            }
          ]
        },
        {
          id: '31',
          type: 'group',
          name: '远程控制服务',
          serviceName: 'RemoteControlService',
          open: false,
          children: [
            {
              id: '3101',
              type: 'tool',
              name: 'setTargetLocation',
              description: '设置目标位置'
            },
            {
              id: '3102',
              type: 'tool',
              name: 'setMotionMode',
              description: '设置运动模式'
            },
            {
              id: '3103',
              type: 'tool',
              name: 'adjustAltitude',
              description: '调整飞行高度'
            },
            {
              id: '3104',
              type: 'tool',
              name: 'emergencyLanding',
              description: '紧急降落'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'TargetRecognitionService',
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
        serviceName: 'RemoteControlService',
        tools: [
          { name: 'setTargetLocation', description: '设置目标位置' },
          { name: 'setMotionMode', description: '设置运动模式' },
          { name: 'adjustAltitude', description: '调整飞行高度' },
          { name: 'emergencyLanding', description: '紧急降落' }
        ]
      }
    ]
  }
}

// 跨境电商智能营销元应用
const ecommerceApp = {
  chosenServices: ['多语言内容生成服务', '市场分析服务', '商品推荐服务'],
  serviceNodes: [
    {
      id: '6',
      type: 'group',
      name: '跨境电商AI服务',
      open: true,
      children: [
        {
          id: '60',
          type: 'group',
          name: '多语言内容生成服务',
          serviceName: 'MultilingualContentService',
          open: false,
          children: [
            {
              id: '6001',
              type: 'tool',
              name: 'translateContent',
              description: '内容翻译'
            },
            {
              id: '6002',
              type: 'tool',
              name: 'generateDescription',
              description: '生成商品描述'
            },
            {
              id: '6003',
              type: 'tool',
              name: 'localizeContent',
              description: '内容本地化'
            },
            {
              id: '6004',
              type: 'tool',
              name: 'optimizeSEO',
              description: 'SEO优化'
            }
          ]
        },
        {
          id: '61',
          type: 'group',
          name: '市场分析服务',
          serviceName: 'MarketAnalysisService',
          open: false,
          children: [
            {
              id: '6101',
              type: 'tool',
              name: 'analyzeTrend',
              description: '趋势分析'
            },
            {
              id: '6102',
              type: 'tool',
              name: 'predictSales',
              description: '销量预测'
            },
            {
              id: '6103',
              type: 'tool',
              name: 'competitorAnalysis',
              description: '竞品分析'
            },
            {
              id: '6104',
              type: 'tool',
              name: 'priceOptimization',
              description: '价格优化'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'MultilingualContentService',
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
        serviceName: 'MarketAnalysisService',
        tools: [
          { name: 'analyzeTrend', description: '趋势分析' },
          { name: 'predictSales', description: '销量预测' },
          { name: 'competitorAnalysis', description: '竞品分析' },
          { name: 'priceOptimization', description: '价格优化' }
        ]
      }
    ]
  }
}

// 低空飞行AI应用元应用
const evtolApp = {
  chosenServices: ['飞行控制服务', '环境感知服务', '能源管理服务'],
  serviceNodes: [
    {
      id: '4',
      type: 'group',
      name: '低空飞行AI应用服务',
      open: true,
      children: [
        {
          id: '40',
          type: 'group',
          name: '飞行控制服务',
          serviceName: 'FlightControlService',
          open: false,
          children: [
            {
              id: '4001',
              type: 'tool',
              name: 'pathPlanner',
              description: '路径规划'
            },
            {
              id: '4002',
              type: 'tool',
              name: 'flightController',
              description: '飞行控制'
            },
            {
              id: '4003',
              type: 'tool',
              name: 'stabilityControl',
              description: '稳定性控制'
            },
            {
              id: '4004',
              type: 'tool',
              name: 'autoLanding',
              description: '自动降落'
            }
          ]
        },
        {
          id: '41',
          type: 'group',
          name: '环境感知服务',
          serviceName: 'EnvironmentPerceptionService',
          open: false,
          children: [
            {
              id: '4101',
              type: 'tool',
              name: 'environmentPerception',
              description: '环境感知'
            },
            {
              id: '4102',
              type: 'tool',
              name: 'obstacleDetection',
              description: '障碍物检测'
            },
            {
              id: '4103',
              type: 'tool',
              name: 'weatherAnalysis',
              description: '天气分析'
            },
            {
              id: '4104',
              type: 'tool',
              name: 'safetyAssessment',
              description: '安全评估'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'FlightControlService',
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
        serviceName: 'EnvironmentPerceptionService',
        tools: [
          { name: 'environmentPerception', description: '环境感知' },
          { name: 'obstacleDetection', description: '障碍物检测' },
          { name: 'weatherAnalysis', description: '天气分析' },
          { name: 'safetyAssessment', description: '安全评估' }
        ]
      }
    ]
  }
}

// 家庭智能助手元应用
const homeAIApp = {
  chosenServices: ['环境感知服务', '智能对话服务', '健康监测服务'],
  serviceNodes: [
    {
      id: '7',
      type: 'group',
      name: '家庭机器人AI服务',
      open: true,
      children: [
        {
          id: '70',
          type: 'group',
          name: '环境感知服务',
          serviceName: 'HomeEnvironmentService',
          open: false,
          children: [
            {
              id: '7001',
              type: 'tool',
              name: 'objectDetection',
              description: '物体检测'
            },
            {
              id: '7002',
              type: 'tool',
              name: 'spatialMapping',
              description: '空间映射'
            },
            {
              id: '7003',
              type: 'tool',
              name: 'homeSecurityMonitor',
              description: '家庭安防监控'
            },
            {
              id: '7004',
              type: 'tool',
              name: 'environmentControl',
              description: '环境控制'
            }
          ]
        },
        {
          id: '71',
          type: 'group',
          name: '智能对话服务',
          serviceName: 'IntelligentDialogService',
          open: false,
          children: [
            {
              id: '7101',
              type: 'tool',
              name: 'naturalLanguageUnderstanding',
              description: '自然语言理解'
            },
            {
              id: '7102',
              type: 'tool',
              name: 'emotionRecognition',
              description: '情感识别'
            },
            {
              id: '7103',
              type: 'tool',
              name: 'voiceInteraction',
              description: '语音交互'
            },
            {
              id: '7104',
              type: 'tool',
              name: 'personalAssistant',
              description: '个人助理'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'HomeEnvironmentService',
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
        serviceName: 'IntelligentDialogService',
        tools: [
          { name: 'naturalLanguageUnderstanding', description: '自然语言理解' },
          { name: 'emotionRecognition', description: '情感识别' },
          { name: 'voiceInteraction', description: '语音交互' },
          { name: 'personalAssistant', description: '个人助理' }
        ]
      }
    ]
  }
}

// 课题一风险识别报告生成元应用
const pj1App = {
  chosenServices: ['课题一风险识别模型推理服务', '样例报告生成服务'],
  serviceNodes: [
    {
      id: '9',
      type: 'group',
      name: '跨境支付AI监测服务',
      open: true,
      children: [
        {
          id: '90',
          type: 'group',
          name: '课题一风险识别模型推理服务',
          serviceName: 'Project1ModelService',
          open: false,
          children: [
            {
              id: '9002',
              type: 'tool',
              name: 'preprocess',
              description: '数据预处理'
            },
            {
              id: '9005',
              type: 'tool',
              name: 'predict',
              description: '风险预测'
            },
            {
              id: '9006',
              type: 'tool',
              name: 'visualize',
              description: '可视化分析'
            }
          ]
        },
        {
          id: '91',
          type: 'group',
          name: '样例报告生成服务',
          serviceName: 'SampleReportService',
          open: false,
          children: [
            {
              id: '9101',
              name: 'generateReport',
              description: '生成样例报告',
              type: 'tool'
            },
            {
              id: '9102',
              name: 'getReportData',
              description: '获取报告数据',
              type: 'tool'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'Project1ModelService',
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
        serviceName: 'SampleReportService',
        tools: [
          { name: 'generateReport', description: '生成样例报告' },
          { name: 'getReportData', description: '获取报告数据' }
        ]
      }
    ]
  }
}

// 课题二风险识别报告生成元应用
const pj2App = {
  chosenServices: ['课题二多方安全计算模型推理服务', '样例报告生成服务'],
  serviceNodes: [
    {
      id: '9',
      type: 'group',
      name: '跨境支付AI监测服务',
      open: true,
      children: [
        {
          id: '90',
          type: 'group',
          name: '课题二多方安全计算模型推理服务',
          serviceName: 'Project2SecureComputingService',
          open: false,
          children: [
            {
              id: '9002',
              type: 'tool',
              name: 'preprocess',
              description: '安全数据预处理'
            },
            {
              id: '9005',
              type: 'tool',
              name: 'predict',
              description: '多方计算预测'
            },
            {
              id: '9006',
              type: 'tool',
              name: 'visualize',
              description: '安全可视化'
            }
          ]
        },
        {
          id: '91',
          type: 'group',
          name: '样例报告生成服务',
          serviceName: 'SampleReportService',
          open: false,
          children: [
            {
              id: '9101',
              name: 'generateReport',
              description: '生成课题二报告',
              type: 'tool'
            },
            {
              id: '9102',
              name: 'getReportData',
              description: '获取安全报告数据',
              type: 'tool'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'Project2SecureComputingService',
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
        serviceName: 'SampleReportService',
        tools: [
          { name: 'generateReport', description: '生成课题二报告' },
          { name: 'getReportData', description: '获取安全报告数据' }
        ]
      }
    ]
  }
}

// 课题四模型评测-安全性指纹元应用
const pj4App = {
  chosenServices: ['课题四模型评测-安全性指纹服务'],
  serviceNodes: [
    {
      id: '9',
      type: 'group',
      name: '跨境支付AI监测服务',
      open: true,
      children: [
        {
          id: '94',
          type: 'group',
          name: '课题四模型评测-安全性指纹服务',
          serviceName: 'Project4SafetyFingerprintService',
          open: false,
          children: [
            {
              id: '9401',
              type: 'tool',
              name: 'safetyFingerprint',
              description: '安全性指纹识别'
            },
            {
              id: '9402',
              type: 'tool',
              name: 'modelEvaluation',
              description: '模型安全评估'
            },
            {
              id: '9403',
              type: 'tool',
              name: 'securityAnalysis',
              description: '安全性分析'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'Project4SafetyFingerprintService',
        tools: [
          { name: 'safetyFingerprint', description: '安全性指纹识别' },
          { name: 'modelEvaluation', description: '模型安全评估' },
          { name: 'securityAnalysis', description: '安全性分析' }
        ]
      }
    ]
  }
}

// 金融风险报告生成（课题一+课题四+课题三）
const pj1pj4pj3App = {
  chosenServices: ['课题一风险识别模型推理服务', '课题四模型评测-安全性指纹服务', '课题三金融风险报告生成服务'],
  serviceNodes: [
    {
      id: '9',
      type: 'group',
      name: '跨境支付AI监测服务',
      open: true,
      children: [
        {
          id: '90',
          type: 'group',
          name: '课题一风险识别模型推理服务',
          serviceName: 'Project1ModelService',
          open: false,
          children: [
            {
              id: '9002',
              type: 'tool',
              name: 'preprocess',
              description: '数据预处理'
            },
            {
              id: '9005',
              type: 'tool',
              name: 'predict',
              description: '风险预测'
            }
          ]
        },
        {
          id: '94',
          type: 'group',
          name: '课题四模型评测-安全性指纹服务',
          serviceName: 'Project4SafetyFingerprintService',
          open: false,
          children: [
            {
              id: '9401',
              type: 'tool',
              name: 'safetyFingerprint',
              description: '安全性指纹识别'
            }
          ]
        },
        {
          id: '93',
          type: 'group',
          name: '课题三金融风险报告生成服务',
          serviceName: 'Project3ReportGenerationService',
          open: false,
          children: [
            {
              id: '9302',
              type: 'tool',
              name: 'generateReport',
              description: '生成综合风险报告'
            },
            {
              id: '9303',
              type: 'tool',
              name: 'riskAssessment',
              description: '综合风险评估'
            },
            {
              id: '9304',
              type: 'tool',
              name: 'reportFormatting',
              description: '报告格式化'
            }
          ]
        }
      ]
    }
  ],
  flowData: {
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
        serviceName: 'Project1ModelService',
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
        serviceName: 'Project4SafetyFingerprintService',
        tools: [
          { name: 'safetyFingerprint', description: '安全性指纹识别' }
        ]
      },
      {
        id: '9101',
        name: '课题三金融风险报告生成服务',
        type: 'process',
        state: 'success',
        serviceName: 'Project3ReportGenerationService',
        tools: [
          { name: 'generateReport', description: '生成综合风险报告' },
          { name: 'riskAssessment', description: '综合风险评估' },
          { name: 'reportFormatting', description: '报告格式化' }
        ]
      }
    ]
  }
}

// 导出函数
export function getMetaAppNodes(serviceType, userInput) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (serviceType) {
        case 'aircraft':
          resolve(aircraftApp)
          break
        case 'health':
          resolve(medicalDiagnosisApp)
          break
        case 'agriculture':
          resolve(agricultureApp)
          break
        case 'evtol':
          resolve(evtolApp)
          break
        case 'ecommerce':
          resolve(ecommerceApp)
          break
        case 'homeAI':
          resolve(homeAIApp)
          break
        case 'aml':
          // 对于金融领域，根据用户输入选择不同的应用
          if (userInput.includes('课题三')) {
            resolve(pj1pj4pj3App)
          } else if (userInput.includes('课题四')) {
            resolve(pj4App)
          } else if (userInput.includes('课题一')) {
            resolve(pj1App)
          } else if (userInput.includes('课题二')) {
            resolve(pj2App)
          } else if (userInput.includes('课题一和课题三') || userInput.includes('综合')) {
            resolve(pj1pj4pj3App)
          } else if (userInput.includes('欺诈')) {
            resolve(fraudDetectionApp)
          } else {
            reject(new Error('未找到对应的元应用'))
          }
          break
        default:
          reject(new Error('未找到对应的元应用'))
      }
    }, 1600)
  })
}
