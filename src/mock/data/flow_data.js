const pj1Flow = {
  name: 'AI推荐流程',
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
      url: 'http://43.130.11.13:25001/api/predict',
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

export function getPj1Flow() {
  return pj1Flow
}
