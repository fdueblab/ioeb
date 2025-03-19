const pj1Flow = {
  name: '元应用工作流',
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
      state: 'running'
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
  name: '元应用工作流',
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
  name: '元应用工作流',
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
      state: 'running'
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
  name: '元应用工作流',
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
      state: 'running'
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
  name: '元应用工作流',
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
      state: 'running'
    },
    {
      id: '8001',
      name: 'transcribe',
      type: 'process',
      url: 'https://myApiServer.com/health/voice/transcribe',
      left: '0',
      top: '155px',
      ico: 'el-icon-microphone',
      input: 'audio file',
      output: 'json',
      version: '1.2',
      state: 'success'
    },
    {
      id: '8101',
      name: 'diagnose',
      type: 'process',
      url: 'https://myApiServer.com/health/diagnose',
      left: '125px',
      top: '340px',
      ico: 'el-icon-picture',
      state: 'success',
      input: 'image file',
      output: 'json',
      version: '1.1'
    },
    {
      id: '8201',
      name: 'analyze',
      type: 'process',
      url: 'https://myApiServer.com/health/monitor/analyze',
      left: '350px',
      top: '340px',
      ico: 'el-icon-data-analysis',
      state: 'success',
      input: 'json',
      output: 'json',
      version: '1.0'
    },
    {
      id: '8202',
      name: 'alert',
      type: 'process',
      url: 'https://myApiServer.com/health/monitor/alert',
      left: '460px',
      top: '75px',
      ico: 'el-icon-bell',
      state: 'warning',
      input: 'json',
      output: 'json',
      version: '0.9'
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
      state: 'running'
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

export function getPj1Flow() {
  return pj1Flow
}

export function getPj1Pj4Pj3Flow() {
  return pj1pj4pj3Flow
}

export function getPj4Flow() {
  return pj4Flow
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
