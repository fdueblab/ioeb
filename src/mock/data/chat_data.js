/* 此文件应该已弃用 */

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
      name: '无人飞机AI监控服务',
      children: [
        {
          id: '100',
          name: '目标识别微服务',
          children: [{
            id: '1001',
            name: 'getTargetLocation'
          }, {
            id: '1002',
            name: 'getTargetInfo'
          }]
        },
        {
          id: '101',
          name: '远程控制微服务',
          children: [{
            id: '1101',
            name: 'setTargetLocation'
          }, {
            id: '1102',
            name: 'setMotionMode'
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
      name: '跨境支付AI监测服务',
      children: [
        {
          id: '90',
          name: '课题一风险识别模型推理微服务',
          children: [
            {
              id: '9002',
              name: 'preprocess'
            },
            {
              id: '9005',
              name: 'predict'
            },
            {
              id: '9006',
              name: 'visualize'
            }
          ]
        },
        {
          id: '91',
          name: '样例报告生成微服务',
          children: [
            {
              id: '9101',
              name: 'generateReport'
            },
            {
              id: '9102',
              name: 'getReportData'
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
      name: '跨境支付AI监测服务',
      children: [
        {
          id: '90',
          name: '课题二多方安全计算模型推理微服务',
          children: [
            {
              id: '9002',
              name: 'preprocess'
            },
            {
              id: '9005',
              name: 'predict'
            },
            {
              id: '9006',
              name: 'visualize'
            }
          ]
        },
        {
          id: '91',
          name: '样例报告生成微服务',
          children: [
            {
              id: '9101',
              name: 'generateReport'
            },
            {
              id: '9102',
              name: 'getReportData'
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
      name: '跨境支付AI监测服务',
      children: [
        {
          id: '90',
          name: '课题一风险识别模型推理微服务',
          children: [
            {
              id: '9002',
              name: 'preprocess'
            },
            {
              id: '9005',
              name: 'predict'
            }
          ]
        },
        {
          id: '94',
          name: '课题四模型评测-安全性指纹微服务',
          children: [
            {
              id: '9401',
              name: 'safetyFingerprint',
              url: '/api/project4/safety-fingerprint'
            }
          ]
        },
        {
          id: '93',
          name: '课题三金融风险报告生成微服务',
          children: [
            {
              id: '9302',
              name: 'generateReport',
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
      name: '跨境支付AI监测服务',
      children: [
        {
          id: '94',
          name: '课题四模型评测-安全性指纹微服务',
          children: [
            {
              id: '9401',
              name: 'safetyFingerprint',
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
      name: '金融风险AI监测服务',
      children: [
        {
          id: '90',
          name: '基于多智能体协作的金融欺诈检测推理服务',
          serviceName: 'DataAnalysisService',
          open: false, // 默认折叠
          children: [
            {
              id: '9001',
              name: 'batchAnalyzeTransactions',
              description: '批量分析交易数据'
            },
            {
              id: '9002',
              name: 'detectAnomalies',
              description: '检测异常交易模式'
            },
            {
              id: '9003',
              name: 'calculateRiskScore',
              description: '计算风险评分'
            },
            {
              id: '9004',
              name: 'extractFeatures',
              description: '提取交易特征'
            }
          ]
        },
        {
          id: '91',
          name: '报告生成服务',
          serviceName: 'ReportService',
          open: false, // 默认折叠
          children: [
            {
              id: '9101',
              name: 'generateReport',
              description: '生成检测报告'
            },
            {
              id: '9102',
              name: 'formatResults',
              description: '格式化分析结果'
            },
            {
              id: '9103',
              name: 'exportToPDF',
              description: '导出PDF报告'
            },
            {
              id: '9104',
              name: 'sendNotification',
              description: '发送报告通知'
            }
          ]
        },
        {
          id: '92',
          name: '数据管理服务',
          serviceName: 'DataManagementService',
          open: false, // 默认折叠
          children: [
            {
              id: '9201',
              name: 'getReportData',
              description: '获取报告数据'
            },
            {
              id: '9202',
              name: 'storeResults',
              description: '存储分析结果'
            },
            {
              id: '9203',
              name: 'queryHistoricalData',
              description: '查询历史数据'
            },
            {
              id: '9204',
              name: 'backupData',
              description: '备份重要数据'
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
      name: '乡村医疗AI服务',
      children: [
        {
          id: '80',
          name: '方言语音识别转写微服务',
          children: [
            {
              id: '8001',
              name: 'transcribe'
            }
          ]
        },
        {
          id: '81',
          name: '基层医疗影像辅助诊断微服务',
          children: [
            {
              id: '8101',
              name: 'diagnose'
            },
            {
              id: '8102',
              name: 'healthCheck'
            }
          ]
        },
        {
          id: '82',
          name: '慢性病管理监测微服务',
          children: [
            {
              id: '8201',
              name: 'analyze'
            },
            {
              id: '8202',
              name: 'alert'
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
      name: '农业数智AI服务',
      children: [
        {
          id: '500',
          name: '图像分析微服务',
          children: [{
            id: '5001',
            name: 'analyzeImage'
          }, {
            id: '5002',
            name: 'identifyDisease'
          }]
        },
        {
          id: '501',
          name: '作物预测微服务',
          children: [{
            id: '5101',
            name: 'predictYield'
          }, {
            id: '5102',
            name: 'recommendActions'
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
      name: '低空飞行AI应用服务',
      children: [
        {
          id: '40',
          name: '飞行控制微服务',
          children: [
            {
              id: '4001',
              name: 'pathPlanner'
            },
            {
              id: '4002',
              name: 'flightController'
            }
          ]
        },
        {
          id: '41',
          name: '环境感知微服务',
          children: [
            {
              id: '4101',
              name: 'environmentPerception'
            },
            {
              id: '4102',
              name: 'obstacleDetection'
            }
          ]
        },
        {
          id: '42',
          name: '能源管理微服务',
          children: [
            {
              id: '4201',
              name: 'batteryManager'
            },
            {
              id: '4202',
              name: 'energyOptimizer'
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
      name: '跨境电商AI服务',
      children: [
        {
          id: '50',
          name: '多语言内容生成微服务',
          children: [
            {
              id: '5001',
              name: 'translateContent'
            },
            {
              id: '5002',
              name: 'generateDescription'
            }
          ]
        },
        {
          id: '51',
          name: '市场分析微服务',
          children: [
            {
              id: '5101',
              name: 'analyzeTrend'
            },
            {
              id: '5102',
              name: 'predictSales'
            }
          ]
        },
        {
          id: '52',
          name: '商品推荐微服务',
          children: [
            {
              id: '5201',
              name: 'recommendProduct'
            },
            {
              id: '5202',
              name: 'generateAd'
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
      name: '家庭机器人AI服务',
      children: [
        {
          id: '60',
          name: '环境感知微服务',
          children: [
            {
              id: '6001',
              name: 'objectDetection'
            },
            {
              id: '6002',
              name: 'spatialMapping'
            }
          ]
        },
        {
          id: '61',
          name: '智能对话微服务',
          children: [
            {
              id: '6101',
              name: 'naturalLanguageUnderstanding'
            },
            {
              id: '6102',
              name: 'emotionRecognition'
            }
          ]
        },
        {
          id: '62',
          name: '健康监测微服务',
          children: [
            {
              id: '6201',
              name: 'vitalSignsMonitor'
            },
            {
              id: '6202',
              name: 'abnormalBehaviorDetection'
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
