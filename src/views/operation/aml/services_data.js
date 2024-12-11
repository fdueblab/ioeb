const amlServices = [
  {
    name: '安全计算微服务',
    netWork: 'bridge',
    port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 1,
    norm: [0, 2]
  },
  {
    name: '技术评测微服务',
    netWork: 'bridge',
    port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 0,
    norm: [1, 2]
  },
  {
    name: '报告生成微服务',
    netWork: 'bridge',
    port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 1,
    norm: [0, 1, 3]
  },
  {
    name: '信用评估微服务',
    netWork: 'bridge',
    port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 2,
    norm: [1, 2, 3]
  },
  {
    name: '异常识别微服务',
    netWork: 'bridge',
    port: '0.0.0.0:8081/TCP → 0.0.0.0:8080',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 0,
    norm: [0, 1, 2]
  }
]

const statusMap = {
  0: {
    status: 'default',
    text: '未启动'
  },
  1: {
    status: 'processing',
    text: '运行中'
  },
  2: {
    status: 'error',
    text: '异常'
  }
}

export function getAmlServices() {
  if (sessionStorage.getItem('upload_exception_service')) {
    amlServices.find(item => item.name === '异常识别微服务').status = Number(sessionStorage.getItem('upload_exception_service'))
    return amlServices
  } else {
    return amlServices.filter(item => item.name !== '异常识别微服务')
  }
}

export function getStatusMap() {
  return statusMap
}
