const amlServices = [
  {
    name: '安全计算微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 1,
    netWork: 'bridge',
    port: '0.0.0.0:8000/TCP → 0.0.0.0:80000',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 1,
    number: '2423',
    norm: [0, 2]
  },
  {
    name: '技术评测微服务',
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8001/TCP → 0.0.0.0:80001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 0,
    number: '0',
    norm: [1, 2]
  },
  {
    name: '报告生成微服务',
    type: 0,
    domain: 0,
    industry: 2,
    scenario: 3,
    technology: 3,
    netWork: 'bridge',
    port: '0.0.0.0:8002/TCP → 0.0.0.0:80002',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 3,
    number: '345',
    norm: [0, 1, 3]
  },
  {
    name: '信用评估微服务',
    type: 0,
    domain: 0,
    industry: 3,
    scenario: 4,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8003/TCP → 0.0.0.0:80003',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 2,
    number: '1234',
    norm: [1, 2, 3]
  },
  {
    name: '异常识别微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 0,
    technology: 0,
    netWork: 'bridge',
    port: '0.0.0.0:8004/TCP → 0.0.0.0:80004',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 0,
    number: '0',
    norm: [0, 1, 2]
  }
]

const airCraftServices = [
  {
    name: '无人机虚拟仿真微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 0,
    technology: 1,
    netWork: 'bridge',
    port: '0.0.0.0:8080/TCP → 0.0.0.0:80080',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 1,
    norm: [0, 1, 2],
    number: '2342'
  },
  {
    name: '无人机低空测绘微服务',
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 3,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8081/TCP → 0.0.0.0:80081',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 0,
    norm: [0, 2],
    number: '2342'
  },
  {
    name: '无人机目标识别微服务',
    type: 0,
    domain: 0,
    industry: 2,
    scenario: 4,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8082/TCP → 0.0.0.0:80082',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 3,
    norm: [1, 2],
    number: '2342'
  },
  {
    name: '无人机远程控制微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 3,
    netWork: 'bridge',
    port: '0.0.0.0:8083/TCP → 0.0.0.0:80083',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 2,
    norm: [0, 1, 3],
    number: '2342'
  },
  {
    name: '无人机视频分析微服务',
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8084/TCP → 0.0.0.0:80084',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 1,
    norm: [1, 2, 3],
    number: '2342'
  }
]

export function getAmlServices() {
  if (sessionStorage.getItem('upload_exception_service')) {
    amlServices.find(item => item.name === '异常识别微服务').status = Number(sessionStorage.getItem('upload_exception_service'))
    return amlServices
  } else {
    return amlServices.filter(item => item.name !== '异常识别微服务')
  }
}

export function getAssignedAmlService() {
  return getAmlServices().filter(item => item.status !== 0)
}

export function getAirCraftServices() {
  return airCraftServices
}

export function getAssignedAirCraftService() {
  return airCraftServices.filter(item => item.status !== 0)
}
