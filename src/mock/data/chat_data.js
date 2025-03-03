import { getAircraftFlow, getPj1Flow, getPj4Flow, getPj3Flow } from '@/mock/data/flow_data'

const aircraftPj = {
  chosenServices: ['目标识别微服务', '远程控制微服务'],
  serviceNodes: [
    {
      id: '3',
      type: 'group',
      name: '低空飞行AI监控服务',
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

const pj3 = {
  chosenServices: ['课题三金融风险报告生成微服务'],
  serviceNodes: [
    {
      id: '9',
      type: 'group',
      name: '跨境支付AI监测服务',
      open: true,
      children: [
        {
          id: '93',
          type: 'group',
          name: '课题三金融风险报告生成微服务',
          open: true,
          children: [
            {
              id: '9301',
              type: 'nl2gql',
              name: 'nl2gql',
              ico: 'el-icon-connection',
              style: {},
              // url: 'http://43.130.11.13:25003/api/nl2gql'
              url: '/api/project3/nl2gql'
            },
            {
              id: '9302',
              type: 'generateReport',
              name: 'generateReport',
              ico: 'el-icon-document-add',
              style: {},
              // url: 'http://43.130.11.13:25003/api/generate-report'
              url: '/api/project3/generate-report'
            }
          ]
        }
      ]
    }
  ],
  flowData: getPj3Flow()
}

const pj4 = {
  chosenServices: ['课题一风险识别模型推理微服务', '课题四模型评测-安全性指纹微服务'],
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
              // url: 'http://43.130.11.13:25004/safety/safety-fingerprint'
              url: '/api/project4/safety-fingerprint'
            }
          ]
        }
      ]
    }
  ],
  flowData: getPj4Flow()
}

export function getChatData(serviceType, userInput) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (serviceType === 'aircraft') {
        resolve(aircraftPj)
      }
      if (userInput.includes('课题一')) {
        resolve(pj1)
      } else if (userInput.includes('课题三')) {
        resolve(pj3)
      } else if (userInput.includes('课题四')) {
        resolve(pj4)
      } else {
        reject(new Error())
      }
    }, 1600)
  })
}
