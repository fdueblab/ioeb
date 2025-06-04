import {
  getAircraftFlow,
  getPj1Flow,
  getPj4Flow,
  getPj2Flow,
  getPj1Pj4Pj3Flow,
  getHealthFlow,
  getAgricultureFlow,
  getEvtolFlow,
  getEcommerceFlow,
  getHomeAIFlow,
  getPjNewFlow
} from '@/mock/data/flow_data'

const aircraftPj = {
  chosenServices: ['目标识别微服务', '远程控制微服务'],
  serviceNodes: [
    {
      id: '3',
      type: 'group',
      name: '无人飞机AI监控服务',
      open: true,
      children: [
        {
          id: '100',
          type: 'group',
          name: '目标识别微服务',
          open: true,
          children: [{
            id: '1001',
            type: 'getTargetLocation',
            name: 'getTargetLocation',
            ico: 'el-icon-location-information',
            style: {}
          }, {
            id: '1002',
            type: 'getTargetInfo',
            name: 'getTargetInfo',
            ico: 'el-icon-user',
            style: {}
          }]
        },
        {
          id: '101',
          type: 'group',
          name: '远程控制微服务',
          open: true,
          children: [{
            id: '1101',
            type: 'setTargetLocation',
            name: 'setTargetLocation',
            ico: 'el-icon-add-location',
            style: {}
          }, {
            id: '1102',
            type: 'setMotionMode',
            name: 'setMotionMode',
            ico: 'el-icon-rank',
            style: {}
          }]
        }
      ]
    }
  ],
  flowData: getAircraftFlow()
}

const pj1 = {
  chosenServices: ['课题一风险识别模型推理微服务', '样例报告生成微服务'],
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
          name: '课题一风险识别模型推理微服务',
          open: true,
          children: [
            {
              id: '9002',
              type: 'preprocess',
              name: 'preprocess',
              ico: 'el-icon-c-scale-to-original',
              style: {}
            },
            {
              id: '9005',
              type: 'predict',
              name: 'predict',
              ico: 'el-icon-data-line',
              style: {}
            },
            {
              id: '9006',
              type: 'visualize',
              name: 'visualize',
              ico: 'el-icon-pie-chart',
              style: {}
            }
          ]
        },
        {
          id: '91',
          type: 'group',
          name: '样例报告生成微服务',
          open: true,
          children: [
            {
              id: '9101',
              name: 'generateReport',
              type: 'process',
              ico: 'el-icon-document-add',
              style: {}
            },
            {
              id: '9102',
              name: 'getReportData',
              type: 'process',
              ico: 'el-icon-zoom-in',
              style: {}
            }
          ]
        }
      ]
    }
  ],
  flowData: getPj1Flow()
}

const pj2 = {
  chosenServices: ['课题二多方安全计算模型推理微服务', '样例报告生成微服务'],
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
          name: '课题二多方安全计算模型推理微服务',
          open: true,
          children: [
            {
              id: '9002',
              type: 'preprocess',
              name: 'preprocess',
              ico: 'el-icon-c-scale-to-original',
              style: {}
            },
            {
              id: '9005',
              type: 'predict',
              name: 'predict',
              ico: 'el-icon-data-line',
              style: {}
            },
            {
              id: '9006',
              type: 'visualize',
              name: 'visualize',
              ico: 'el-icon-pie-chart',
              style: {}
            }
          ]
        },
        {
          id: '91',
          type: 'group',
          name: '样例报告生成微服务',
          open: true,
          children: [
            {
              id: '9101',
              name: 'generateReport',
              type: 'process',
              ico: 'el-icon-document-add',
              style: {}
            },
            {
              id: '9102',
              name: 'getReportData',
              type: 'process',
              ico: 'el-icon-zoom-in',
              style: {}
            }
          ]
        }
      ]
    }
  ],
  flowData: getPj2Flow()
}

const pj1pj4pj3 = {
  chosenServices: ['课题一风险识别模型推理微服务', '课题四模型评测-安全性指纹微服务', '课题三金融风险报告生成微服务'],
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
          name: '课题一风险识别模型推理微服务',
          open: true,
          children: [
            {
              id: '9002',
              type: 'preprocess',
              name: 'preprocess',
              ico: 'el-icon-c-scale-to-original',
              style: {}
            },
            {
              id: '9005',
              type: 'predict',
              name: 'predict',
              ico: 'el-icon-data-line',
              style: {}
            }
          ]
        },
        {
          id: '94',
          type: 'group',
          name: '课题四模型评测-安全性指纹微服务',
          open: true,
          children: [
            {
              id: '9401',
              type: 'safetyFingerprint',
              name: 'safetyFingerprint',
              ico: 'el-icon-finished',
              style: {},
              url: '/api/project4/safety-fingerprint'
            }
          ]
        },
        {
          id: '93',
          type: 'group',
          name: '课题三金融风险报告生成微服务',
          open: true,
          children: [
            {
              id: '9302',
              type: 'generateReport',
              name: 'generateReport',
              ico: 'el-icon-document-add',
              style: {},
              url: '/api/project3/generate-report'
            }
          ]
        }
      ]
    }
  ],
  flowData: getPj1Pj4Pj3Flow()
}

const pj4 = {
  chosenServices: ['课题四模型评测-安全性指纹微服务'],
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
          name: '课题四模型评测-安全性指纹微服务',
          open: true,
          children: [
            {
              id: '9401',
              type: 'safetyFingerprint',
              name: 'safetyFingerprint',
              ico: 'el-icon-finished',
              style: {},
              url: '/api/project4/safety-fingerprint'
            }
          ]
        }
      ]
    }
  ],
  flowData: getPj4Flow()
}

const pjNew = {
  chosenServices: ['基于多智能体协作的金融欺诈检测推理服务', '报告生成服务'],
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
          open: false, // 默认折叠
          children: [
            {
              id: '9001',
              type: 'tool',
              name: 'batchAnalyzeTransactions',
              description: '批量分析交易数据',
              ico: 'el-icon-data-analysis',
              style: {}
            },
            {
              id: '9002',
              type: 'tool',
              name: 'detectAnomalies',
              description: '检测异常交易模式',
              ico: 'el-icon-warning',
              style: {}
            },
            {
              id: '9003',
              type: 'tool',
              name: 'calculateRiskScore',
              description: '计算风险评分',
              ico: 'el-icon-pie-chart',
              style: {}
            },
            {
              id: '9004',
              type: 'tool',
              name: 'extractFeatures',
              description: '提取交易特征',
              ico: 'el-icon-folder-opened',
              style: {}
            }
          ]
        },
        {
          id: '91',
          type: 'group',
          name: '报告生成服务',
          serviceName: 'ReportService',
          open: false, // 默认折叠
          children: [
            {
              id: '9101',
              name: 'generateReport',
              description: '生成检测报告',
              type: 'tool',
              ico: 'el-icon-document-add',
              style: {}
            },
            {
              id: '9102',
              name: 'formatResults',
              description: '格式化分析结果',
              type: 'tool',
              ico: 'el-icon-edit-outline',
              style: {}
            },
            {
              id: '9103',
              name: 'exportToPDF',
              description: '导出PDF报告',
              type: 'tool',
              ico: 'el-icon-download',
              style: {}
            },
            {
              id: '9104',
              name: 'sendNotification',
              description: '发送报告通知',
              type: 'tool',
              ico: 'el-icon-message',
              style: {}
            }
          ]
        },
        {
          id: '92',
          type: 'group',
          name: '数据管理服务',
          serviceName: 'DataManagementService',
          open: false, // 默认折叠
          children: [
            {
              id: '9201',
              name: 'getReportData',
              description: '获取报告数据',
              type: 'tool',
              ico: 'el-icon-zoom-in',
              style: {}
            },
            {
              id: '9202',
              name: 'storeResults',
              description: '存储分析结果',
              type: 'tool',
              ico: 'el-icon-folder-add',
              style: {}
            },
            {
              id: '9203',
              name: 'queryHistoricalData',
              description: '查询历史数据',
              type: 'tool',
              ico: 'el-icon-search',
              style: {}
            },
            {
              id: '9204',
              name: 'backupData',
              description: '备份重要数据',
              type: 'tool',
              ico: 'el-icon-upload',
              style: {}
            }
          ]
        }
      ]
    }
  ],
  flowData: getPjNewFlow()
}

const healthPj = {
  chosenServices: ['基层医疗影像辅助诊断微服务', '方言语音识别转写微服务', '慢性病管理监测微服务'],
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
          name: '方言语音识别转写微服务',
          open: true,
          children: [
            {
              id: '8001',
              type: 'transcribe',
              name: 'transcribe',
              ico: 'el-icon-microphone',
              style: {}
            }
          ]
        },
        {
          id: '81',
          type: 'group',
          name: '基层医疗影像辅助诊断微服务',
          open: true,
          children: [
            {
              id: '8101',
              type: 'diagnose',
              name: 'diagnose',
              ico: 'el-icon-picture',
              style: {}
            },
            {
              id: '8102',
              type: 'healthCheck',
              name: 'healthCheck',
              ico: 'el-icon-first-aid-kit',
              style: {}
            }
          ]
        },
        {
          id: '82',
          type: 'group',
          name: '慢性病管理监测微服务',
          open: true,
          children: [
            {
              id: '8201',
              type: 'analyze',
              name: 'analyze',
              ico: 'el-icon-data-analysis',
              style: {}
            },
            {
              id: '8202',
              type: 'alert',
              name: 'alert',
              ico: 'el-icon-bell',
              style: {}
            }
          ]
        }
      ]
    }
  ],
  flowData: getHealthFlow()
}

const agriculturePj = {
  chosenServices: ['图像分析微服务', '作物预测微服务'],
  serviceNodes: [
    {
      id: '5',
      type: 'group',
      name: '农业数智AI服务',
      open: true,
      children: [
        {
          id: '500',
          type: 'group',
          name: '图像分析微服务',
          open: true,
          children: [{
            id: '5001',
            type: 'analyzeImage',
            name: 'analyzeImage',
            ico: 'el-icon-picture',
            style: {}
          }, {
            id: '5002',
            type: 'identifyDisease',
            name: 'identifyDisease',
            ico: 'el-icon-warning',
            style: {}
          }]
        },
        {
          id: '501',
          type: 'group',
          name: '作物预测微服务',
          open: true,
          children: [{
            id: '5101',
            type: 'predictYield',
            name: 'predictYield',
            ico: 'el-icon-data-line',
            style: {}
          }, {
            id: '5102',
            type: 'recommendActions',
            name: 'recommendActions',
            ico: 'el-icon-s-check',
            style: {}
          }]
        }
      ]
    }
  ],
  flowData: getAgricultureFlow()
}

const evtolPj = {
  chosenServices: ['飞行控制微服务', '环境感知微服务', '能源管理微服务'],
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
          name: '飞行控制微服务',
          open: true,
          children: [
            {
              id: '4001',
              type: 'pathPlanner',
              name: 'pathPlanner',
              ico: 'el-icon-map-location',
              style: {}
            },
            {
              id: '4002',
              type: 'flightController',
              name: 'flightController',
              ico: 'el-icon-rank',
              style: {}
            }
          ]
        },
        {
          id: '41',
          type: 'group',
          name: '环境感知微服务',
          open: true,
          children: [
            {
              id: '4101',
              type: 'environmentPerception',
              name: 'environmentPerception',
              ico: 'el-icon-view',
              style: {}
            },
            {
              id: '4102',
              type: 'obstacleDetection',
              name: 'obstacleDetection',
              ico: 'el-icon-warning',
              style: {}
            }
          ]
        },
        {
          id: '42',
          type: 'group',
          name: '能源管理微服务',
          open: true,
          children: [
            {
              id: '4201',
              type: 'batteryManager',
              name: 'batteryManager',
              ico: 'el-icon-lightning',
              style: {}
            },
            {
              id: '4202',
              type: 'energyOptimizer',
              name: 'energyOptimizer',
              ico: 'el-icon-data-line',
              style: {}
            }
          ]
        }
      ]
    }
  ],
  flowData: getEvtolFlow()
}

const ecommercePj = {
  chosenServices: ['多语言内容生成微服务', '市场分析微服务', '商品推荐微服务'],
  serviceNodes: [
    {
      id: '5',
      type: 'group',
      name: '跨境电商AI服务',
      open: true,
      children: [
        {
          id: '50',
          type: 'group',
          name: '多语言内容生成微服务',
          open: true,
          children: [
            {
              id: '5001',
              type: 'translateContent',
              name: 'translateContent',
              ico: 'el-icon-document',
              style: {}
            },
            {
              id: '5002',
              type: 'generateDescription',
              name: 'generateDescription',
              ico: 'el-icon-edit-outline',
              style: {}
            }
          ]
        },
        {
          id: '51',
          type: 'group',
          name: '市场分析微服务',
          open: true,
          children: [
            {
              id: '5101',
              type: 'analyzeTrend',
              name: 'analyzeTrend',
              ico: 'el-icon-data-analysis',
              style: {}
            },
            {
              id: '5102',
              type: 'predictSales',
              name: 'predictSales',
              ico: 'el-icon-data-line',
              style: {}
            }
          ]
        },
        {
          id: '52',
          type: 'group',
          name: '商品推荐微服务',
          open: true,
          children: [
            {
              id: '5201',
              type: 'recommendProduct',
              name: 'recommendProduct',
              ico: 'el-icon-shopping-cart-1',
              style: {}
            },
            {
              id: '5202',
              type: 'generateAd',
              name: 'generateAd',
              ico: 'el-icon-picture',
              style: {}
            }
          ]
        }
      ]
    }
  ],
  flowData: getEcommerceFlow()
}

const homeAIPj = {
  chosenServices: ['环境感知微服务', '智能对话微服务', '健康监测微服务'],
  serviceNodes: [
    {
      id: '6',
      type: 'group',
      name: '家庭机器人AI服务',
      open: true,
      children: [
        {
          id: '60',
          type: 'group',
          name: '环境感知微服务',
          open: true,
          children: [
            {
              id: '6001',
              type: 'objectDetection',
              name: 'objectDetection',
              ico: 'el-icon-view',
              style: {}
            },
            {
              id: '6002',
              type: 'spatialMapping',
              name: 'spatialMapping',
              ico: 'el-icon-map-location',
              style: {}
            }
          ]
        },
        {
          id: '61',
          type: 'group',
          name: '智能对话微服务',
          open: true,
          children: [
            {
              id: '6101',
              type: 'naturalLanguageUnderstanding',
              name: 'naturalLanguageUnderstanding',
              ico: 'el-icon-chat-line-round',
              style: {}
            },
            {
              id: '6102',
              type: 'emotionRecognition',
              name: 'emotionRecognition',
              ico: 'el-icon-user',
              style: {}
            }
          ]
        },
        {
          id: '62',
          type: 'group',
          name: '健康监测微服务',
          open: true,
          children: [
            {
              id: '6201',
              type: 'vitalSignsMonitor',
              name: 'vitalSignsMonitor',
              ico: 'el-icon-first-aid-kit',
              style: {}
            },
            {
              id: '6202',
              type: 'abnormalBehaviorDetection',
              name: 'abnormalBehaviorDetection',
              ico: 'el-icon-warning',
              style: {}
            }
          ]
        }
      ]
    }
  ],
  flowData: getHomeAIFlow()
}

export function getChatData(serviceType, userInput) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (serviceType) {
        case 'aircraft':
          resolve(aircraftPj)
          break
        case 'health':
          resolve(healthPj)
          break
        case 'agriculture':
          resolve(agriculturePj)
          break
        case 'evtol':
          resolve(evtolPj)
          break
        case 'ecommerce':
          resolve(ecommercePj)
          break
        case 'homeAI':
          resolve(homeAIPj)
          break
        case 'aml':
          if (userInput.includes('课题三')) {
            resolve(pj1pj4pj3)
          } else if (userInput.includes('课题四')) {
            resolve(pj4)
          } else if (userInput.includes('课题一')) {
            resolve(pj1)
          } else if (userInput.includes('课题二')) {
            resolve(pj2)
          } else if (userInput.includes('欺诈')) {
            resolve(pjNew)
          } else {
            reject(new Error())
          }
          break
        default:
          reject(new Error())
      }
    }, 1600)
  })
}
