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

// 添加农业数智AI服务的行业映射
const agricultureIndustryMap = ['智慧种植', '畜牧养殖', '农产品流通', '乡村治理']

const amlScenarioMap = ['反洗钱', '合规监测', '税务稽查', '业务统计', '信用评估']

const aircraftScenarioMap = ['应急救援', '交通巡逻', '低空物流', '低空测绘', '目标识别']

const healthScenarioMap = ['远程会诊支持', '基层疾病筛查', '慢性病管理', '急诊分诊', '预防保健']

// 添加农业数智AI服务的场景映射
const agricultureScenarioMap = ['精准播种', '病虫害防治', '智能灌溉', '产量预测', '质量溯源']

const amlTechnologyMap = ['异常识别', '安全计算', '技术评测', '报告生成', '配套技术', '关联技术']

const aircraftTechnologyMap = ['线路设计', '虚拟仿真', '智能感知', '远程控制', '视频分析', '技术评价']

const healthTechnologyMap = ['计算机视觉', '自然语言处理', '时序数据分析', '强化学习', '联邦学习']

// 添加农业数智AI服务的技术映射
const agricultureTechnologyMap = ['计算机视觉', '自然语言处理', '时序分析与预测', '多模态融合', '联邦学习']

const performanceMetricMap = ['查全率', '查准率', '计算效率']

const attributeMap = ['非智能体服务', '开源模型', '付费模型', '定制模型']

// 乡村医疗AI服务特殊考量
const healthSpecialConsiderationsMap = [
  '轻量化模型（适应低算力环境）',
  '离线推理能力（应对网络不稳定）',
  '方言语音识别（服务方言地区）',
  '多设备协同计算（整合手机/医疗设备）',
  '数据隐私保护（符合农村数据安全需求）'
]

// 乡村医疗AI服务领域分类
const healthDomainMap = [
  '医学影像处理',
  '病理数据分析',
  '健康监测管理',
  '流行病预测',
  '药物研发支持'
]

// 乡村医疗AI服务作用分类
const healthRoleMap = [
  '诊断辅助',
  '治疗建议',
  '资源优化',
  '风险预警',
  '教育培训'
]

// 添加农业数智AI服务特殊考量
const agricultureSpecialConsiderationsMap = [
  '轻量化模型（适配低算力设备）',
  '边缘计算支持（田间实时处理）',
  '多传感器数据融合（综合监测）',
  '卫星遥感兼容（大范围监测）',
  '气候适应性（应对复杂气候条件）'
]

// 添加农业数智AI服务领域分类
const agricultureDomainMap = [
  '作物生长监测',
  '病虫害识别',
  '农产品质量评估',
  '农机自动化控制',
  '农产品市场分析'
]

// 添加农业数智AI服务作用分类
const agricultureRoleMap = [
  '决策辅助',
  '资源优化',
  '风险预警',
  '产量提升',
  '成本降低'
]

// 添加低空飞行AI应用的行业映射
const evtolIndustryMap = ['城市空中交通', '物流配送', '紧急救援与医疗', '文旅与低空旅游']

// 添加低空飞行AI应用的场景映射
const evtolScenarioMap = ['飞行路径规划', '乘客服务与交互', '航空器控制', '安全监控与维护', '能源与电池管理']

// 添加低空飞行AI应用的技术映射
const evtolTechnologyMap = ['强化学习', '计算机视觉', '多模态融合', '时序预测', '图搜索算法', '深度学习']

// 添加跨境电商AI应用的行业映射
const ecommerceIndustryMap = ['跨境营销与广告', '客户服务与沟通', '选品与产品开发', '合规与风险管理']

// 添加跨境电商AI应用的场景映射
const ecommerceScenarioMap = ['多语言翻译与本地化', '智能客服与互动', '内容生成与优化', '数据分析与决策支持']

// 添加跨境电商AI应用的技术映射
const ecommerceTechnologyMap = ['自然语言处理', '计算机视觉', '推荐系统', '供应链优化', '多模态大模型', '深度学习']

// 添加家庭机器人AI应用的行业映射
const homeAIIndustryMap = ['智能家居', '健康管理', '安防与应急', '情感陪伴', '家务处理']

// 添加家庭机器人AI应用的场景映射
const homeAIScenarioMap = ['家务处理场景', '疾病诊断场景', '应急联络场景', '来客接待场景', '情感陪伴场景']

// 添加家庭机器人AI应用的技术映射
const homeAITechnologyMap = ['计算机视觉', '自然语言处理', '强化学习', '多传感器融合', '具身智能', '多模态技术']

// 添加低空飞行AI应用的特殊考量
const evtolSpecialConsiderationsMap = [
  '实时性要求（低延迟控制）',
  '安全冗余设计（降低系统故障风险）',
  '极端天气适应性（应对不同气候条件）',
  '低空空域协同（与其他飞行器避让）',
  '城市环境适应（建筑物密集区域导航）'
]

// 添加跨境电商AI应用的特殊考量
const ecommerceSpecialConsiderationsMap = [
  '多语言多地区适配（支持全球市场）',
  '实时交互响应（提升用户体验）',
  '跨平台数据整合（多渠道销售支持）',
  '合规风险控制（应对各国法规差异）',
  '个性化定制（满足不同市场文化需求）'
]

// 添加家庭机器人AI应用的特殊考量
const homeAISpecialConsiderationsMap = [
  '隐私保护（个人健康数据安全）',
  '实时响应（低延迟决策）',
  '低功耗设计（长时间运行）',
  '适应性环境感知（复杂家庭环境）',
  '高安全性要求（物理交互安全）'
]

// 添加低空飞行AI应用的领域分类
const evtolDomainMap = [
  '航空器控制与飞行管理',
  '导航与感知系统',
  '能源与电池管理',
  '运营与调度优化',
  '乘客体验与安全'
]

// 添加跨境电商AI应用的领域分类
const ecommerceDomainMap = [
  '自然语言处理',
  '计算机视觉',
  '推荐系统',
  '供应链与物流优化'
]

// 添加家庭机器人AI应用的领域分类
const homeAIDomainMap = [
  '计算机视觉',
  '自然语言处理',
  '强化学习与决策优化',
  '多模态与具身智能'
]

// 添加低空飞行AI应用的作用分类
const evtolRoleMap = [
  '感知与识别',
  '决策与规划',
  '优化与控制',
  '预测与预警',
  '人机交互'
]

// 添加跨境电商AI应用的作用分类
const ecommerceRoleMap = [
  '分类与识别',
  '预测与优化',
  '生成与增强',
  '智能决策支持'
]

// 添加家庭机器人AI应用的作用分类
const homeAIRoleMap = [
  '感知层算法',
  '决策层算法',
  '执行层算法',
  '多模态交互'
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
  } else if (type === 'agriculture') {
    return agricultureIndustryMap
  } else if (type === 'evtol') {
    return evtolIndustryMap
  } else if (type === 'ecommerce') {
    return ecommerceIndustryMap
  } else if (type === 'homeAI') {
    return homeAIIndustryMap
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
  } else if (type === 'agriculture') {
    return agricultureScenarioMap
  } else if (type === 'evtol') {
    return evtolScenarioMap
  } else if (type === 'ecommerce') {
    return ecommerceScenarioMap
  } else if (type === 'homeAI') {
    return homeAIScenarioMap
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
  } else if (type === 'agriculture') {
    return agricultureTechnologyMap
  } else if (type === 'evtol') {
    return evtolTechnologyMap
  } else if (type === 'ecommerce') {
    return ecommerceTechnologyMap
  } else if (type === 'homeAI') {
    return homeAITechnologyMap
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

// 添加农业数智AI服务相关的获取函数
export function getAgricultureDomainMap() {
  return agricultureDomainMap
}

export function getAgricultureRoleMap() {
  return agricultureRoleMap
}

export function getAgricultureSpecialConsiderationsMap() {
  return agricultureSpecialConsiderationsMap
}

// 添加低空飞行AI应用相关的获取函数
export function getEvtolDomainMap() {
  return evtolDomainMap
}

export function getEvtolRoleMap() {
  return evtolRoleMap
}

export function getEvtolSpecialConsiderationsMap() {
  return evtolSpecialConsiderationsMap
}

// 添加跨境电商AI应用相关的获取函数
export function getEcommerceDomainMap() {
  return ecommerceDomainMap
}

export function getEcommerceRoleMap() {
  return ecommerceRoleMap
}

export function getEcommerceSpecialConsiderationsMap() {
  return ecommerceSpecialConsiderationsMap
}

// 添加家庭机器人AI应用相关的获取函数
export function getHomeaiDomainMap() {
  return homeAIDomainMap
}

export function getHomeaiRoleMap() {
  return homeAIRoleMap
}

export function getHomeaiSpecialConsiderationsMap() {
  return homeAISpecialConsiderationsMap
}
