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
      url: 'http://43.130.11.13:5000/api/pj1_report_app',
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
      // url: 'http://43.130.11.13:25001/api/predict',
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
      url: 'ms.kxyun.net/getReportData',
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

const tecTempFlow = {
  name: '元应用工作流',
  preName: '技术评测元应用',
  preInputName: '',
  preOutputName: '',
  inputType: 1,
  outputType: 1,
  nodeList: [
    {
      id: '10000',
      name: 'metaAppAgent',
      type: 'start',
      url: 'http://43.130.11.13:5000/api/tec_test_app',
      left: '200px',
      top: '0',
      ico: 'el-icon-cpu',
      input: 'zip File',
      output: 'json',
      version: '1.0',
      state: 'running'
    },
    {
      id: '9001',
      name: 'predict',
      type: 'process',
      // url: 'http://43.130.11.13:25001/api/predict',
      url: '/api/project1/predict',
      left: '350px',
      top: '200px',
      ico: 'el-icon-s-data',
      state: 'success',
      input: 'vector',
      output: 'vector',
      version: '0.9'
    }
  ],
  lineList: [
    { from: '10000', to: '9001' },
    { from: '9001', to: '10000' }
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

const pj3Flow = {
  name: '元应用工作流',
  preName: '课题三金融风险报告生成',
  preInputName: '课题三金融数据',
  preOutputName: '课题三金融风险报告',
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
      name: 'nl2gql',
      type: 'process',
      // url: 'http://43.130.11.13:25003/api/nl2gql',
      url: '/api/project3/nl2gql',
      left: '0',
      top: '130px',
      ico: 'el-icon-c-scale-to-original',
      input: 'text',
      output: 'json',
      version: '2.0',
      state: 'success'
    },
    {
      id: '9001',
      name: 'generateReport',
      type: 'process',
      // url: 'http://43.130.11.13:25003/api/generate-report',
      url: '/api/project3/generate-report',
      left: '320px',
      top: '260px',
      ico: 'el-icon-s-data',
      state: 'success',
      input: 'text',
      output: 'pdf',
      version: '1.1'
    }
  ],
  lineList: [
    { from: '10000', to: '9000' },
    { from: '9000', to: '9001' },
    { from: '9001', to: '10000' }
  ]
}

const pj1Pj4Flow = {
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
      // url: 'http://43.130.11.13:25004/safety/safety-fingerprint',
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

export function getPj1Flow() {
  return pj1Flow
}

export function getPj3Flow() {
  return pj3Flow
}

export function getPj4Flow() {
  return pj1Pj4Flow
}

export function getTecTempFlow() {
  return tecTempFlow
}

export function getAircraftFlow() {
  return aircraftFlow
}
