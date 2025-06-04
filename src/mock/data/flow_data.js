const pj1Flow = {
  name: '新元应用',
  preName: '课题一风险识别报告生成元应用',
  preInputName: '课题一跨境支付数据',
  preOutputName: '课题一风险评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'https://43.130.11.13:5000/api/pj1_report_app',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'zip File',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '9000',
      name: 'preprocess',
      type: 'process',
      url: 'ms.kxyun.net/preprocess',
      left: '0',
      top: '130px',
      ico: 'el-icon-c-scale-to-original',
      input: 'zip File',
      output: 'vector',
      version: '2.0',
      state: 'success'
    },
    {
      id: '9001',
      name: 'predict',
      type: 'process',
      url: '/api/project1/predict',
      left: '75px',
      top: '380px',
      ico: 'el-icon-s-data',
      state: 'success',
      input: 'vector',
      output: 'vector',
      version: '1.1'
    },
    {
      id: '9101',
      name: 'generateReport',
      type: 'process',
      url: 'ms.kxyun.net/generateReport',
      left: '300px',
      top: '300px',
      ico: 'el-icon-document-add',
      state: 'warning',
      input: 'vector',
      output: 'pdf',
      version: '0.9'
    },
    {
      id: '9102',
      name: 'getReportData',
      type: 'process',
      url: 'https://myApiServer.com/report/get',
      left: '450px',
      top: '80px',
      ico: 'el-icon-zoom-in',
      state: 'warning',
      input: 'pdf',
      output: 'json',
      version: '0.9'
    }
  ],
  lineList: [
    { from: '10000', to: '9000' },
    { from: '9000', to: '9001' },
    { from: '9001', to: '10000' },
    { from: '10000', to: '9101' },
    { from: '9101', to: '9102' },
    { from: '9102', to: '10000' }
  ]
}

const pj2Flow = {
  name: '新元应用',
  preName: '课题二风险识别报告生成元应用',
  preInputName: '跨境支付数据',
  preOutputName: '课题二风险评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'https://43.130.11.13:5000/api/pj1_report_app',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'zip File',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '9000',
      name: 'preprocess',
      type: 'process',
      url: 'ms.kxyun.net/preprocess',
      left: '0',
      top: '130px',
      ico: 'el-icon-c-scale-to-original',
      input: 'zip File',
      output: 'vector',
      version: '2.0',
      state: 'success'
    },
    {
      id: '9001',
      name: 'predict',
      type: 'process',
      url: '/api/project1/predict',
      left: '75px',
      top: '380px',
      ico: 'el-icon-s-data',
      state: 'success',
      input: 'vector',
      output: 'vector',
      version: '1.1'
    },
    {
      id: '9101',
      name: 'generateReport',
      type: 'process',
      url: 'ms.kxyun.net/generateReport',
      left: '300px',
      top: '300px',
      ico: 'el-icon-document-add',
      state: 'warning',
      input: 'vector',
      output: 'pdf',
      version: '0.9'
    },
    {
      id: '9102',
      name: 'getReportData',
      type: 'process',
      url: 'https://myApiServer.com/report/get',
      left: '450px',
      top: '80px',
      ico: 'el-icon-zoom-in',
      state: 'warning',
      input: 'pdf',
      output: 'json',
      version: '0.9'
    }
  ],
  lineList: [
    { from: '10000', to: '9000' },
    { from: '9000', to: '9001' },
    { from: '9001', to: '10000' },
    { from: '10000', to: '9101' },
    { from: '9101', to: '9102' },
    { from: '9102', to: '10000' }
  ]
}

const aircraftFlow = {
  name: '新元应用',
  preName: '智能飞行控制',
  preInputName: '智能飞行器参数',
  preOutputName: '智能飞行器任务结果',
  inputType: 1,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'ms.kxyun.net/agent',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'csv File',
      output: 'json',
      version: '1.0',
      state: 'success'
    },
    {
      id: '10001',
      name: 'getTargetLocation',
      type: 'process',
      url: 'ms.kxyun.net/getTargetLocation',
      left: '0',
      top: '140px',
      ico: 'el-icon-location-information',
      state: 'success',
      input: 'csv File',
      output: 'json',
      version: '1.0'
    },
    {
      id: '10002',
      name: 'getTargetInfo',
      type: 'process',
      url: 'ms.kxyun.net/getTargetInfo',
      left: '200px',
      top: '300px',
      ico: 'el-icon-user',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '10101',
      name: 'setMotionMode',
      type: 'end',
      url: 'ms.kxyun.net/setMotionMode',
      left: '400px',
      top: '160px',
      ico: 'el-icon-rank',
      state: 'warning',
      input: 'json',
      output: 'json',
      version: '1.0'
    }
  ],
  lineList: [
    { from: '10000', to: '10001' },
    { from: '10001', to: '10000' },
    { from: '10000', to: '10002' },
    { from: '10002', to: '10000' },
    { from: '10000', to: '10101' }
  ]
}

const pj1pj4pj3Flow = {
  name: '新元应用',
  preName: '金融风险报告生成',
  preInputName: '跨境贸易数据',
  preOutputName: '金融风险报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'ms.kxyun.net/api/pj3_app',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'text',
      output: 'pdf',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '9000',
      name: 'preprocess',
      type: 'process',
      url: 'ms.kxyun.net/preprocess',
      left: '0',
      top: '130px',
      ico: 'el-icon-c-scale-to-original',
      input: 'zip File',
      output: 'vector',
      version: '2.0',
      state: 'success'
    },
    {
      id: '9001',
      name: 'predict',
      type: 'process',
      url: '/api/project1/predict',
      left: '75px',
      top: '380px',
      ico: 'el-icon-s-data',
      state: 'success',
      input: 'vector',
      output: 'vector',
      version: '1.1'
    },
    {
      id: '11000',
      name: 'safetyFingerprint',
      type: 'process',
      url: '/api/project4/safety/safety-fingerprint',
      left: '280px',
      top: '360px',
      ico: 'el-icon-finished',
      input: 'vector',
      output: 'json',
      version: '2.0',
      state: 'success'
    },
    {
      id: '9101',
      name: 'generateReport',
      type: 'process',
      url: '/api/project3/generate-report',
      left: '460px',
      top: '200px',
      ico: 'el-icon-document-add',
      state: 'success',
      input: 'text',
      output: 'pdf',
      version: '1.1'
    }
  ],
  lineList: [
    { from: '10000', to: '9000' },
    { from: '9000', to: '9001' },
    { from: '9001', to: '10000' },
    { from: '10000', to: '11000' },
    { from: '11000', to: '10000' },
    { from: '10000', to: '9101' },
    { from: '9101', to: '10000' }
  ]
}

const pj4Flow = {
  name: '新元应用',
  preName: '课题四模型评测-安全性指纹',
  preInputName: '课题四模型数据',
  preOutputName: '课题四安全性指纹报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'ms.kxyun.net/api/pj4_app',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'vector',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '11000',
      name: 'safetyFingerprint',
      type: 'process',
      url: '/api/project4/safety/safety-fingerprint',
      left: '410px',
      top: '180px',
      ico: 'el-icon-c-scale-to-original',
      input: 'vector',
      output: 'json',
      version: '2.0',
      state: 'success'
    }
  ],
  lineList: [
    { from: '10000', to: '11000' },
    { from: '11000', to: '10000' }
  ]
}

const healthFlow = {
  name: '新元应用',
  preName: '乡村医疗AI辅助诊断元应用',
  preInputName: '患者医疗数据',
  preOutputName: '诊断与健康管理方案',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'https://myApiServer.com/health/metaApp',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'multipart',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
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
  ],
  lineList: [
    { from: '10000', to: '8001' },
    { from: '8001', to: '10000' },
    { from: '10000', to: '8101' },
    { from: '8101', to: '10000' },
    { from: '10000', to: '8201' },
    { from: '8201', to: '8202' },
    { from: '8202', to: '10000' }
  ]
}

const agricultureFlow = {
  name: '农业数智AI服务工作流',
  preName: '农业数智AI元应用',
  preInputName: '农业数据输入',
  preOutputName: '农业智能分析报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '30000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'https://myApiServer.com/app',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'json/image',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '30001',
      name: 'dataPreprocessor',
      type: 'process',
      url: 'https://myApiServer.com/preprocess',
      left: '0',
      top: '130px',
      ico: 'el-icon-c-scale-to-original',
      input: 'image/sensor',
      output: 'vector',
      version: '1.0',
      state: 'success'
    },
    {
      id: '30002',
      name: 'imageAnalyzer',
      type: 'process',
      url: 'https://myApiServer.com/api/agriculture/analyze',
      left: '75px',
      top: '380px',
      ico: 'el-icon-picture',
      state: 'success',
      input: 'image',
      output: 'vector',
      version: '1.0'
    },
    {
      id: '30003',
      name: 'cropPredictor',
      type: 'process',
      url: 'https://myApiServer.com/api/agriculture/predict',
      left: '245px',
      top: '185px',
      ico: 'el-icon-s-data',
      state: 'success',
      input: 'vector',
      output: 'json',
      version: '1.0'
    },
    {
      id: '30004',
      name: 'recommendationEngine',
      type: 'process',
      url: 'https://myApiServer.com/api/agriculture/recommend',
      left: '462px',
      top: '60px',
      ico: 'el-icon-s-promotion',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '30005',
      name: 'reportGenerator',
      type: 'end',
      url: 'https://myApiServer.com/api/agriculture/report',
      left: '435px',
      top: '315px',
      ico: 'el-icon-document',
      state: 'success',
      input: 'json',
      output: 'pdf',
      version: '1.0'
    }
  ],
  lineList: [
    {
      from: '30000',
      to: '30001'
    },
    {
      from: '30001',
      to: '30002'
    },
    {
      from: '30002',
      to: '30003'
    },
    {
      from: '30003',
      to: '30004'
    },
    {
      from: '30004',
      to: '30005'
    }
  ]
}

const evtolFlow = {
  name: '新元应用',
  preName: 'eVTOL智能飞行控制元应用',
  preInputName: '飞行任务参数',
  preOutputName: '飞行控制结果',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '40000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'https://myApiServer.com/evtol/metaApp',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'json',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '40001',
      name: 'pathPlanner',
      type: 'process',
      url: 'https://myApiServer.com/evtol/path/plan',
      left: '0',
      top: '130px',
      ico: 'el-icon-map-location',
      input: 'json',
      output: 'json',
      version: '1.0',
      state: 'success'
    },
    {
      id: '40002',
      name: 'environmentPerception',
      type: 'process',
      url: 'https://myApiServer.com/evtol/perception',
      left: '200px',
      top: '260px',
      ico: 'el-icon-view',
      state: 'success',
      input: 'multimodal',
      output: 'json',
      version: '1.0'
    },
    {
      id: '40003',
      name: 'flightController',
      type: 'process',
      url: 'https://myApiServer.com/evtol/control',
      left: '400px',
      top: '130px',
      ico: 'el-icon-rank',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '40004',
      name: 'batteryManager',
      type: 'process',
      url: 'https://myApiServer.com/evtol/battery',
      left: '200px',
      top: '390px',
      ico: 'el-icon-lightning',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '40005',
      name: 'safetyMonitor',
      type: 'end',
      url: 'https://myApiServer.com/evtol/safety',
      left: '400px',
      top: '260px',
      ico: 'el-icon-warning',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    }
  ],
  lineList: [
    { from: '40000', to: '40001' },
    { from: '40001', to: '40002' },
    { from: '40002', to: '40003' },
    { from: '40003', to: '40004' },
    { from: '40004', to: '40005' },
    { from: '40005', to: '40000' }
  ]
}

const ecommerceFlow = {
  name: '新元应用',
  preName: '跨境电商智能营销元应用',
  preInputName: '产品信息与市场需求',
  preOutputName: '多语言营销方案',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '50000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'https://myApiServer.com/ecommerce/metaApp',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'json',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '50001',
      name: 'marketAnalyzer',
      type: 'process',
      url: 'https://myApiServer.com/ecommerce/market/analyze',
      left: '0',
      top: '130px',
      ico: 'el-icon-data-analysis',
      input: 'json',
      output: 'json',
      version: '1.0',
      state: 'success'
    },
    {
      id: '50002',
      name: 'contentGenerator',
      type: 'process',
      url: 'https://myApiServer.com/ecommerce/content/generate',
      left: '200px',
      top: '260px',
      ico: 'el-icon-edit-outline',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '50003',
      name: 'multilinguaTranslator',
      type: 'process',
      url: 'https://myApiServer.com/ecommerce/translate',
      left: '400px',
      top: '130px',
      ico: 'el-icon-document',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '50004',
      name: 'mediaGenerator',
      type: 'process',
      url: 'https://myApiServer.com/ecommerce/media/generate',
      left: '200px',
      top: '390px',
      ico: 'el-icon-picture',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '50005',
      name: 'complianceChecker',
      type: 'end',
      url: 'https://myApiServer.com/ecommerce/compliance/check',
      left: '400px',
      top: '260px',
      ico: 'el-icon-check',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    }
  ],
  lineList: [
    { from: '50000', to: '50001' },
    { from: '50001', to: '50002' },
    { from: '50002', to: '50003' },
    { from: '50003', to: '50004' },
    { from: '50004', to: '50005' },
    { from: '50005', to: '50000' }
  ]
}

const homeAIFlow = {
  name: '新元应用',
  preName: '家庭智能助手元应用',
  preInputName: '家庭环境数据与指令',
  preOutputName: '智能家庭管理方案',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '60000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'https://myApiServer.com/homeAI/metaApp',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'json',
      output: 'json',
      version: '1.0',
      state: 'toBuild'
    },
    {
      id: '60001',
      name: 'environmentSensor',
      type: 'process',
      url: 'https://myApiServer.com/homeAI/environment/sense',
      left: '0',
      top: '130px',
      ico: 'el-icon-view',
      input: 'multimodal',
      output: 'json',
      version: '1.0',
      state: 'success'
    },
    {
      id: '60002',
      name: 'dialogProcessor',
      type: 'process',
      url: 'https://myApiServer.com/homeAI/dialog/process',
      left: '200px',
      top: '260px',
      ico: 'el-icon-chat-line-round',
      state: 'success',
      input: 'audio',
      output: 'json',
      version: '1.0'
    },
    {
      id: '60003',
      name: 'taskPlanner',
      type: 'process',
      url: 'https://myApiServer.com/homeAI/task/plan',
      left: '400px',
      top: '130px',
      ico: 'el-icon-date',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '60004',
      name: 'healthMonitor',
      type: 'process',
      url: 'https://myApiServer.com/homeAI/health/monitor',
      left: '200px',
      top: '390px',
      ico: 'el-icon-first-aid-kit',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '60005',
      name: 'securityGuard',
      type: 'end',
      url: 'https://myApiServer.com/homeAI/security/guard',
      left: '400px',
      top: '260px',
      ico: 'el-icon-lock',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    }
  ],
  lineList: [
    { from: '60000', to: '60001' },
    { from: '60001', to: '60002' },
    { from: '60002', to: '60003' },
    { from: '60003', to: '60004' },
    { from: '60004', to: '60005' },
    { from: '60005', to: '60000' }
  ]
}

const pjNewFlow = {
  preName: '金融欺诈检测推理元应用',
  preInputName: '金融交易数据',
  preOutputName: '欺诈检测评估报告',
  inputType: 2,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      state: 'toBuild'
    },
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
  ],
  lineList: [
    { from: '10000', to: '9000' },
    { from: '9000', to: '10000' },
    { from: '10000', to: '9101' },
    { from: '9101', to: '9102' },
    { from: '9102', to: '10000' }
  ]
}

export function getPj1Flow() {
  return pj1Flow
}

export function getPj2Flow() {
  return pj2Flow
}

export function getPj1Pj4Pj3Flow() {
  return pj1pj4pj3Flow
}

export function getPj4Flow() {
  return pj4Flow
}

export function getPjNewFlow() {
  return pjNewFlow
}

export function getTecTempFlow() {
  return pj4Flow
}

export function getAircraftFlow() {
  return aircraftFlow
}

export function getHealthFlow() {
  return healthFlow
}

export function getAgricultureFlow() {
  return agricultureFlow
}

export function getEvtolFlow() {
  return evtolFlow
}

export function getEcommerceFlow() {
  return ecommerceFlow
}

export function getHomeAIFlow() {
  return homeAIFlow
}
