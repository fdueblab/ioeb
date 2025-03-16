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

const methodTypeMap = ['GET', 'POST', 'PUT', 'DELETE']

const ioTypeMap = ['none', 'string', 'formData', 'json']

const serviceTypeMap = ['原子微服务', '元应用服务']

const amlIndustryMap = ['金融风控', '自贸监管', '跨境贸易', '跨境电商']

const aircraftIndustryMap = ['城市治理', '文旅农林', '教育培训']

const healthIndustryMap = ['基层医疗卫生', '公共卫生管理', '医疗设备制造', '医疗保险服务']

const amlScenarioMap = ['反洗钱', '合规监测', '税务稽查', '业务统计', '信用评估']

const aircraftScenarioMap = ['应急救援', '交通巡逻', '低空物流', '低空测绘', '目标识别']

const healthScenarioMap = ['远程会诊支持', '基层疾病筛查', '慢性病管理', '急诊分诊', '预防保健']

const amlTechnologyMap = ['异常识别', '安全计算', '技术评测', '报告生成', '配套技术', '关联技术']

const aircraftTechnologyMap = ['线路设计', '虚拟仿真', '智能感知', '远程控制', '视频分析', '技术评价']

const healthTechnologyMap = ['计算机视觉', '自然语言处理', '时序数据分析', '强化学习', '联邦学习']

const performanceMetricMap = ['查全率', '查准率', '计算效率']

const attributeMap = ['非智能体服务', '开源模型', '付费模型', '定制模型']

// 农村医疗AI服务特殊考量
const healthSpecialConsiderationsMap = [
  '轻量化模型（适应低算力环境）',
  '离线推理能力（应对网络不稳定）',
  '方言语音识别（服务方言地区）',
  '多设备协同计算（整合手机/医疗设备）',
  '数据隐私保护（符合农村数据安全需求）'
]

// 农村医疗AI服务领域分类
const healthDomainMap = [
  '医学影像处理',
  '病理数据分析',
  '健康监测管理',
  '流行病预测',
  '药物研发支持'
]

// 农村医疗AI服务作用分类
const healthRoleMap = [
  '诊断辅助',
  '治疗建议',
  '资源优化',
  '风险预警',
  '教育培训'
]

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
  } else if (type === 'aircraft') {
    return aircraftIndustryMap
  } else if (type === 'health') {
    return healthIndustryMap
  } else {
    return aircraftIndustryMap
  }
}

export function getScenarioMap(type) {
  if (type === 'aml') {
    return amlScenarioMap
  } else if (type === 'aircraft') {
    return aircraftScenarioMap
  } else if (type === 'health') {
    return healthScenarioMap
  } else {
    return aircraftScenarioMap
  }
}

export function getTechnologyMap(type) {
  if (type === 'aml') {
    return amlTechnologyMap
  } else if (type === 'aircraft') {
    return aircraftTechnologyMap
  } else if (type === 'health') {
    return healthTechnologyMap
  } else {
    return aircraftTechnologyMap
  }
}

export function getApiTypeMap() {
  return apiTypeMap
}

export function getMethodTypeMap() {
  return methodTypeMap
}

export function getIOTypeMap() {
  return ioTypeMap
}

export function getPerformanceMetricMap() {
  return performanceMetricMap
}

export function getAttributeMap() {
  return attributeMap
}

export function getHealthDomainMap() {
  return healthDomainMap
}

export function getHealthRoleMap() {
  return healthRoleMap
}

export function getHealthSpecialConsiderationsMap() {
  return healthSpecialConsiderationsMap
}
