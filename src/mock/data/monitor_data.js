// 监测页面配置数据

// 数据接入模块配置
const dataInputConfig = {
  title: '数据接入与实时监测',
  tagText: '调用数据接入/实时监测智能体',
  tagColor: 'blue',
  visible: true,
  dataSources: [
    { value: 'default_data', label: '默认数据' },
    { value: 'business_data_1', label: '跨境支付业务数据源1' },
    { value: 'business_data_2', label: '跨境支付业务数据源2' },
    { value: 'agent_1', label: '业务数据智能体1' },
    { value: 'agent_2', label: '业务数据智能体2' },
    { value: 'all', label: '全部数据源' }
  ],
  buttonText: '开始监测',
  buttonStopText: '停止监测',
  alertTitle: '实时预警'
}

// 统计分析模块配置
const statisticsConfig = {
  title: '统计分析',
  tagText: '调用统计分析智能体',
  tagColor: 'green',
  visible: true,
  overviewTitle: '当前监测期间交易总览',
  overviewLabels: {
    duration: '监测时长：',
    totalAmount: '跨境支付总额：',
    transactionCount: '交易总量：',
    avgAmount: '平均交易金额：'
  },
  anomalyTitle: '异常统计',
  anomalyLabels: {
    highRisk: '高风险交易：',
    mediumRisk: '中风险交易：',
    lowRisk: '低风险交易：'
  },
  buttonText: '更新统计分析'
}

// 报告生成模块配置
const reportConfig = {
  title: '监测报告生成',
  tagText: '调用报告生成智能体',
  tagColor: 'purple',
  visible: true,
  description: '生成监测报告将对当前监测期间的交易数据进行分析，包括异常交易检测、风险评估和建议措施。报告将基于图神经网络(GNN)模型对交易网络的分析结果。',
  reportContentTitle: '监测报告',
  generateButtonText: '生成监测报告',
  resetButtonText: '重置监测',
  resetConfirmTitle: '确定要重置监测状态吗？这将清除所有监测数据。',
  resetConfirmOkText: '确定',
  resetConfirmCancelText: '取消'
}

// 默认页面配置
const defaultPageConfig = {
  id: 'default',
  name: '用户前端定制',
  dataInput: dataInputConfig,
  statistics: statisticsConfig,
  report: reportConfig
}

// 页面配置集合
const pageConfigs = [
  defaultPageConfig,
  {
    id: 'custom1',
    name: '自定义监测页面1',
    dataInput: {
      ...dataInputConfig,
      title: '业务数据接入',
      tagText: '业务数据监测智能体'
    },
    statistics: {
      ...statisticsConfig,
      title: '业务分析',
      tagText: '业务分析智能体'
    },
    report: {
      ...reportConfig,
      title: '业务报告生成',
      tagText: '业务报告智能体'
    }
  }
]

// 获取所有页面配置
export function getPageConfigs() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(pageConfigs)
    }, 500)
  })
}

// 获取指定页面配置
export function getPageConfig(pageId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const config = pageConfigs.find(page => page.id === pageId) || defaultPageConfig
      resolve(config)
    }, 500)
  })
}

// 保存页面配置
export function savePageConfig(pageConfig) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = pageConfigs.findIndex(page => page.id === pageConfig.id)
      if (index >= 0) {
        pageConfigs[index] = pageConfig
      } else {
        pageConfigs.push(pageConfig)
      }
      resolve({ success: true, message: '保存成功' })
    }, 800)
  })
}

// 创建新页面
export function createNewPage(pageName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = 'page_' + new Date().getTime()
      const newPage = {
        id: newId,
        name: pageName || `新建页面${pageConfigs.length + 1}`,
        dataInput: { ...dataInputConfig },
        statistics: { ...statisticsConfig },
        report: { ...reportConfig }
      }
      pageConfigs.push(newPage)
      resolve({ success: true, pageId: newId, config: newPage })
    }, 600)
  })
}

// 删除页面
export function deletePage(pageId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = pageConfigs.findIndex(page => page.id === pageId)
      if (index >= 0 && pageId !== 'default') {
        pageConfigs.splice(index, 1)
        resolve({ success: true, message: '删除成功' })
      } else if (pageId === 'default') {
        reject(new Error('默认页面不可删除'))
      } else {
        reject(new Error('页面不存在'))
      }
    }, 500)
  })
}

export default {
  getPageConfigs,
  getPageConfig,
  savePageConfig,
  createNewPage,
  deletePage
}
