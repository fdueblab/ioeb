const statusMap = [
  {
    status: 'error',
    text: '容器分配失败'
  },
  {
    status: 'warning',
    text: '运行中(未通过测评)'
  },
  {
    status: 'default',
    text: '未运行'
  },
  {
    status: 'error',
    text: '异常'
  },
  {
    status: 'success',
    text: '运行中(已通过测评)'
  },
  {
    status: 'processing',
    text: '部署中'
  }
]

const normMap = [
  {
    text: '安全性'
  },
  {
    text: '鲁棒性'
  },
  {
    text: '隐私性'
  },
  {
    text: '可信性'
  }
]

const apiTypeMap = ['RESTful API', 'GraphQL API', 'WebSocket API']

const serviceTypeMap = ['原子微服务', '元应用服务']

const amlIndustryMap = ['金融风控', '自贸监管', '跨境贸易', '跨境电商']

const aircraftIndustryMap = ['城市治理', '文旅农林', '教育培训']

const amlScenarioMap = ['反洗钱', '合规监测', '税务稽查', '业务统计', '信用评估']

const aircraftScenarioMap = ['应急救援', '交通巡逻', '低空物流', '低空测绘', '目标识别']

const amlTechnologyMap = ['异常识别', '安全计算', '技术评测', '报告生成', '配套技术', '关联技术']

const aircraftTechnologyMap = ['线路设计', '虚拟仿真', '智能感知', '远程控制', '视频分析', '技术评价']

const performanceMetricMap = ['查全率', '查准率', '计算效率']

export function getServiceStatusMap() {
  return statusMap
}

export function getNormMap() {
  return normMap
}

export function getServiceTypeMap() {
  return serviceTypeMap
}

export function getIndustryMap(type) {
  if (type === 'aml') {
    return amlIndustryMap
  } else {
    return aircraftIndustryMap
  }
}

export function getScenarioMap(type) {
  if (type === 'aml') {
    return amlScenarioMap
  } else {
    return aircraftScenarioMap
  }
}

export function getTechnologyMap(type) {
  if (type === 'aml') {
    return amlTechnologyMap
  } else {
    return aircraftTechnologyMap
  }
}

export function getApiTypeMap() {
  return apiTypeMap
}

export function getPerformanceMetricMap() {
  return performanceMetricMap
}
