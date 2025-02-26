const amlServiceNodes = [
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
    name: '异常识别微服务',
    open: true,
    children: [
      {
        id: '9101',
        type: 'datasets',
        name: 'datasets',
        ico: 'el-icon-s-data',
        style: {}
      },
      {
        id: '9102',
        type: 'preprocess',
        name: 'preprocess',
        ico: 'el-icon-c-scale-to-original',
        style: {}
      },
      {
        id: '9103',
        type: 'train',
        name: 'train',
        ico: 'el-icon-s-opportunity',
        style: {}
      },
      {
        id: '9104',
        type: 'predict',
        name: 'predict',
        ico: 'el-icon-s-marketing',
        style: {}
      },
      {
        id: '9105',
        type: 'evaluate',
        name: 'evaluate',
        ico: 'el-icon-data-line',
        style: {}
      },
      {
        id: '9106',
        type: 'visualize',
        name: 'visualize',
        ico: 'el-icon-pie-chart',
        style: {}
      },
      {
        id: '9107',
        type: 'models',
        name: 'models',
        ico: 'el-icon-s-platform',
        style: {}
      }
    ]
  },
  {
    id: '92',
    type: 'group',
    name: '技术评测微服务',
    open: true,
    children: [
      {
        id: '9201',
        type: 'performanceTest',
        name: 'performanceTest',
        ico: 'el-icon-s-tools',
        style: {}
      },
      {
        id: '9202',
        type: 'benchmark',
        name: 'benchmark',
        ico: 'el-icon-s-flag',
        style: {}
      },
      {
        id: '9203',
        type: 'analysis',
        name: 'analysis',
        ico: 'el-icon-s-marketing',
        style: {}
      }
    ]
  },
  {
    id: '93',
    type: 'group',
    name: '信用评估微服务',
    open: true,
    children: [
      {
        id: '9301',
        type: 'getRiskInfo',
        name: 'getRiskInfo',
        ico: 'el-icon-data-analysis',
        style: {}
      },
      {
        id: '9302',
        type: 'creditEvaluation',
        name: 'creditEvaluation',
        ico: 'el-icon-data-line',
        style: {}
      },
      {
        id: '9303',
        type: 'riskPrediction',
        name: 'riskPrediction',
        ico: 'el-icon-warning',
        style: {}
      }
    ]
  },
  {
    id: '94',
    type: 'group',
    name: '样例报告生成微服务',
    open: true,
    children: [
      {
        id: '9401',
        type: 'generateReport',
        name: 'generateReport',
        ico: 'el-icon-document-add',
        style: {}
      },
      {
        id: '9402',
        type: 'sendReport',
        name: 'sendReport',
        ico: 'el-icon-upload',
        style: {}
      }
    ]
  }
]

export function getAllAmlServiceNodes() {
  if (sessionStorage.getItem('upload_exception_service') === '4') {
    return amlServiceNodes
  } else {
    return amlServiceNodes.filter(item => item.id !== '90')
  }
}
