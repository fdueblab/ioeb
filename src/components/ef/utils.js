// 图形连线相关工具函数
// 是否具有该线
export function hasLine(data, from, to) {
    for (let i = 0; i < data.lineList.length; i++) {
        const line = data.lineList[i]
        if (line.from === from && line.to === to) {
            return true
        }
    }
    return false
}

// 是否含有相反的线
export function hashOppositeLine(data, from, to) {
    return hasLine(data, to, from)
}

// 获取连线
export function getConnector(jsp, from, to) {
    const connection = jsp.getConnections({
        source: from,
        target: to
    })[0]
    return connection
}

// 获取唯一标识
export function uuid() {
    return Math.random().toString(36).substr(3, 10)
}

// =====================================================
// 数据结构 Schema 定义
// =====================================================

/**
 * 标准节点数据结构Schema
 */
export const NODE_SCHEMA = {
  id: { required: true, default: null },
  name: { required: true, default: '' },
  url: { required: false, default: '' },
  des: { required: false, default: '' },
  apiName: { required: false, default: '' },
  tools: { required: false, default: () => [] },
  status: { required: false, default: null },
  state: { required: false, default: '未知状态' },
  stateStyle: { required: false, default: 'default' }
}

/**
 * 智能体节点Schema
 */
export const AGENT_NODE_SCHEMA = {
  id: { required: true, default: () => 'metaAppAgent_' + uuid() },
  name: { required: true, default: 'metaAppAgent' },
  type: { required: false, default: 'start' },
  state: { required: false, default: '待构建' },
  stateStyle: { required: false, default: 'default' },
  des: { required: false, default: '支持独立运行和柔性集成的任务智能体' }
}

/**
 * 服务项Schema
 */
export const SERVICE_ITEM_SCHEMA = {
  id: { required: true, default: null },
  name: { required: true, default: '' },
  url: { required: false, default: '' },
  des: { required: false, default: '' },
  apiName: { required: false, default: '' },
  tools: { required: false, default: () => [] },
  state: { required: false, default: '未知状态' },
  stateStyle: { required: false, default: 'default' },
  children: { required: false, default: () => [] }
}

/**
 * 服务类型映射表
 */
export const SERVICE_TEXT_MAP = {
  'aircraft': '无人飞机AI监控服务',
  'health': '乡村医疗AI应用服务',
  'agriculture': '农业数智AI应用服务',
  'evtol': '低空飞行AI应用服务',
  'ecommerce': '跨境电商AI应用服务',
  'homeAI': '家庭陪伴AI应用服务',
  'aml': '跨境支付AI监测服务'
}

// =====================================================
// 通用数据处理器
// =====================================================

/**
 * 通用字典查找器
 * @param {*} code - 代码
 * @param {Array} dict - 字典数据
 * @param {string} defaultValue - 默认值
 * @returns {string} - 查找结果
 */
export function lookupFromDict(code, dict = [], defaultValue = '未知') {
  if (code === undefined || code === null) {
    return defaultValue
  }
  if (!Array.isArray(dict)) {
    return defaultValue
  }
  const item = dict.find(entry => entry && entry.code === code)
  return item ? item.text : defaultValue
}

/**
 * 通用状态过滤器
 */
export function statusFilter(type, statusDict = []) {
  return lookupFromDict(type, statusDict, '未知状态')
}

/**
 * 通用状态样式过滤器
 */
export function statusStyleFilter(type, statusStyleDict = []) {
  return lookupFromDict(type, statusStyleDict, 'default')
}

/**
 * 根据Schema创建数据对象
 * @param {Object} schema - 数据Schema
 * @param {Object} rawData - 原始数据
 * @param {Object} context - 上下文数据（如statusDict等）
 * @returns {Object} - 标准化的数据对象
 */
export function createDataFromSchema(schema, rawData = {}, context = {}) {
  const result = {}

  for (const [field, config] of Object.entries(schema)) {
    if (rawData.hasOwnProperty(field)) {
      // 使用原始数据的值
      result[field] = rawData[field]
    } else if (config.required) {
      // 必填字段使用默认值
      result[field] = typeof config.default === 'function'
        ? config.default()
        : config.default
    } else {
      // 可选字段使用默认值
      result[field] = typeof config.default === 'function'
        ? config.default()
        : config.default
    }
  }

  // 处理特殊字段转换
  if (rawData.status && context.statusDict) {
    result.state = statusFilter(rawData.status, context.statusDict)
  }
  if (rawData.status && context.statusStyleDict) {
    result.stateStyle = statusStyleFilter(rawData.status, context.statusStyleDict)
  }

  return result
}

/**
 * 批量创建数据对象
 * @param {Object} schema - 数据Schema
 * @param {Array} rawDataArray - 原始数据数组
 * @param {Object} context - 上下文数据
 * @returns {Array} - 标准化的数据对象数组
 */
export function createDataArrayFromSchema(schema, rawDataArray = [], context = {}) {
  if (!Array.isArray(rawDataArray)) {
    return []
  }
  return rawDataArray.map(rawData => createDataFromSchema(schema, rawData, context))
}

/**
 * 数据转换器配置
 */
export const DATA_TRANSFORMERS = {
  // 节点数据转换器
  node: {
    schema: NODE_SCHEMA,
    transform: (rawData, context) => createDataFromSchema(NODE_SCHEMA, rawData, context)
  },

  // 智能体节点转换器
  agentNode: {
    schema: AGENT_NODE_SCHEMA,
    transform: (rawData, context) => createDataFromSchema(AGENT_NODE_SCHEMA, rawData, context)
  },

  // 服务项转换器
  serviceItem: {
    schema: SERVICE_ITEM_SCHEMA,
    transform: (rawData, context) => {
      const result = createDataFromSchema(SERVICE_ITEM_SCHEMA, rawData, context)
      // 服务项特殊处理：children默认为tools
      if (!result.children.length && result.tools && result.tools.length) {
        result.children = [...result.tools]
      }
      return result
    }
  }
}

// =====================================================
// 重构后的核心函数
// =====================================================

/**
 * 标准化节点数据格式
 */
export function normalizeNodeData(rawNode, statusDict = [], statusStyleDict = []) {
  return DATA_TRANSFORMERS.node.transform(rawNode, { statusDict, statusStyleDict })
}

/**
 * 批量标准化节点数据
 */
export function normalizeNodesData(rawNodes, statusDict = [], statusStyleDict = []) {
  return createDataArrayFromSchema(NODE_SCHEMA, rawNodes, { statusDict, statusStyleDict })
}

/**
 * 创建智能体节点
 */
export function createAgentNode(customData = {}) {
  return DATA_TRANSFORMERS.agentNode.transform(customData)
}

/**
 * 解析初始流程数据并转换为标准格式
 */
export function parseInitialFlow(initialFlow, statusDict = [], statusStyleDict = []) {
  if (!initialFlow || !initialFlow.nodeList) {
    return null
  }

  try {
    // 自动添加智能体节点
    const agentNode = createAgentNode()

    // 标准化初始节点
    const initNodes = normalizeNodesData(initialFlow.nodeList, statusDict, statusStyleDict)

    return {
      ...initialFlow,
      nodeList: [agentNode, ...initNodes],
      lineList: []
    }
  } catch (error) {
    console.error('解析初始流程失败:', error)
    return null
  }
}

/**
 * 将节点同步到服务列表格式
 */
export function syncNodesToServices(nodes, verticalType) {
  if (!nodes || nodes.length === 0) {
    return []
  }

  // 过滤并转换为服务列表格式
  const serviceNodes = nodes
    .filter(node => node.name !== 'metaAppAgent')
    .map(node => DATA_TRANSFORMERS.serviceItem.transform(node))

  if (serviceNodes.length === 0) {
    return []
  }

  // 构建服务列表结构
  return [{
    id: 'rootNode',
    name: SERVICE_TEXT_MAP[verticalType] || '智能服务',
    children: serviceNodes
  }]
}

/**
 * 根据流程数据生成服务树结构
 */
export function generateServiceNodes(flowData, verticalType) {
  const chosenServices = []
  const groupMap = new Map()

  // 按服务分组
  flowData.nodeList.forEach(node => {
    const { name, id } = node

    if (!groupMap.has(id)) {
      chosenServices.push(name)
      groupMap.set(id, {
        id,
        name,
        children: []
      })
    }

    const tools = node.tools || []
    tools.forEach((tool) => {
      groupMap.get(id).children.push({
        id: tool.id || tool.name,
        name: tool.name,
        des: tool.description || tool.des
      })
    })
  })

  // 获取正确的根服务名称
  const rootServiceText = SERVICE_TEXT_MAP[verticalType] || '智能服务'

  const serviceNodes = [
    {
      id: 'rootNode',
      name: rootServiceText,
      children: Array.from(groupMap.values())
    }
  ]

  return { chosenServices, serviceNodes }
}

/**
 * 获取基础服务节点
 */
export function getBaseServiceNodes(serviceType = 'default') {
  const rootServiceText = SERVICE_TEXT_MAP[serviceType] || '智能服务'
  return [
    {
      id: 'rootNode',
      name: rootServiceText,
      children: []
    }
  ]
}

/**
 * 生成默认数据结构（包含智能体节点）
 */
export function createDefaultFlowData() {
  return {
    name: '新元应用',
    preName: '新元应用',
    preDes: '以支持独立运行和柔性集成的大模型智能体为软件载体的最小粒度应用',
    preInputName: '输入内容',
    preOutputName: '输出内容',
    inputType: 0,
    outputType: 0,
    nodeList: [createAgentNode()],
    lineList: []
  }
}

/**
 * 准备数据用于重载（清除位置信息等）
 */
export function prepareDataForReload(data) {
  const clonedData = JSON.parse(JSON.stringify(data)) // 深拷贝

  // 清除输入数据中的位置信息
  if (clonedData.nodeList) {
    clonedData.nodeList.forEach(node => {
      delete node.left
      delete node.top
    })
  }

  return clonedData
}

/**
 * 转换节点信息用于显示
 */
export function transformNodesForDisplay(nodeList, preName, preDes) {
  if (!Array.isArray(nodeList)) {
    return []
  }

  return nodeList.map(node => {
    if (node.name === 'metaAppAgent') {
      return {
        name: preName,
        des: preDes
      }
    } else {
      return {
        name: node.name,
        url: node.url || '',
        des: node.des || '',
        state: node.state,
        stateStyle: node.stateStyle,
        tools: node.tools || []
      }
    }
  })
}

/**
 * 从服务列表中递归移除指定ID的服务
 */
export function removeServiceById(services, serviceId) {
  if (!services || !Array.isArray(services)) {
    return services
  }

  // 递归函数来移除服务
  const removeFromChildren = (children) => {
    if (!children || !Array.isArray(children)) return children

    return children.filter(child => {
      if (child.id === serviceId) {
        console.log('从服务列表中移除服务:', child.name, 'ID:', serviceId)
        return false // 移除这个服务
      }

      // 如果有子节点，递归处理
      if (child.children) {
        child.children = removeFromChildren(child.children)
      }

      return true // 保留这个服务
    })
  }

  // 更新服务列表
  return services.map(rootService => ({
    ...rootService,
    children: removeFromChildren(rootService.children || [])
  }))
}

/**
 * 转换服务数据为节点格式
 */
export function transformServicesToNodes(selectedServices, statusDict = [], statusStyleDict = []) {
  return createDataArrayFromSchema(NODE_SCHEMA, selectedServices, { statusDict, statusStyleDict })
}

/**
 * 转换服务数据为服务列表项格式
 */
export function transformServicesToServiceItems(selectedServices, statusDict = [], statusStyleDict = []) {
  return createDataArrayFromSchema(SERVICE_ITEM_SCHEMA, selectedServices, { statusDict, statusStyleDict })
}

/**
 * 从画布节点中提取服务信息，用于标记已选中的服务
 */
export function extractCanvasServices(nodeList, statusFilterFn, statusStyleFilterFn) {
  if (!nodeList || nodeList.length === 0) {
    return []
  }

  // 过滤出非智能体节点，并构建服务信息
  return nodeList
    .filter(node => node.name !== 'metaAppAgent')
    .map(node => ({
      id: node.id,
      name: node.name,
      url: node.url,
      state: statusFilterFn ? statusFilterFn(node.status) : node.state,
      stateStyle: statusStyleFilterFn ? statusStyleFilterFn(node.status) : node.stateStyle,
      apiName: node.apiName,
      tools: node.tools || []
    }))
    .filter(service => service.id) // 确保有有效的ID
}

/**
 * 导出和导入相关的工具函数
 */

/**
 * 验证导出数据的完整性
 */
export function validateExportData(data) {
  if (!data || typeof data !== 'object') return false
  // 验证必要的元应用信息
  if (!data.metaApp || !data.metaApp.preName) {
    return false
  }
  // 验证服务列表
  if (!data.services || !Array.isArray(data.services)) {
    return false
  }
  // 验证服务引用格式
  return data.services.every(service =>
    service && typeof service === 'object' && service.serviceRef
  )
}

/**
 * 构建标准化的导出数据格式
 */
export function buildMetaAppExportData(flowData, verticalType, encodingFn) {
  // 提取服务节点（排除智能体节点）
  const serviceNodes = (flowData.nodeList || []).filter(node => node.name !== 'metaAppAgent')
  // 构建轻量化的服务引用列表 - 只保留加密的服务引用
  const services = serviceNodes.map(node => ({
    serviceRef: encodingFn ? encodingFn(node.id) : node.id
  }))

  return {
    metaApp: {
      preName: flowData.preName || '未命名元应用',
      preDes: flowData.preDes || '元应用描述',
      preInputName: flowData.preInputName || '输入内容',
      preOutputName: flowData.preOutputName || '输出内容',
      inputType: flowData.inputType || 0,
      outputType: flowData.outputType || 0
    },
    services: services,
    version: '1.0',
    exportTime: new Date().toISOString(),
    verticalType: verticalType,
    checksum: generateChecksum(services) // 数据完整性校验
  }
}

/**
 * 生成数据校验和
 */
export function generateChecksum(services) {
  const serviceIds = services.map(s => s.serviceRef).sort().join('|')
  return btoa(serviceIds).substring(0, 8)
}

/**
 * 解析导入数据并进行格式转换
 */
export function parseImportData(importData, decodingFn) {
  // 解码服务引用
  const serviceIds = []
  const failedServices = []
  for (const [index, service] of importData.services.entries()) {
    const decodedId = decodingFn ? decodingFn(service.serviceRef) : service.serviceRef
    if (decodedId) {
      serviceIds.push({
        id: decodedId,
        index: index // 保留索引用于错误追踪
      })
    } else {
      failedServices.push(`服务引用${index + 1}`)
    }
  }
  if (failedServices.length > 0) {
    console.warn('以下服务无法解析:', failedServices)
  }
  return {
    metaAppInfo: importData.metaApp,
    serviceIds: serviceIds,
    metadata: {
      version: importData.version,
      exportTime: importData.exportTime,
      verticalType: importData.verticalType,
      failedServices: failedServices
    }
  }
}

/**
 * 转换API服务数据为NODE_SCHEMA格式
 */
export function transformApiServiceToNodeFormat(apiService) {
  if (!apiService || !apiService.apiList) return null
  const serverInfo = apiService.apiList[0]
  return {
    id: apiService.id,
    name: apiService.name || '',
    url: serverInfo ? serverInfo.url : '',
    des: serverInfo ? serverInfo.des : '',
    apiName: serverInfo ? serverInfo.name : '',
    tools: serverInfo && serverInfo.tools ? serverInfo.tools : [],
    status: apiService.status,
    // 这些字段会在parseInitialFlow中被statusFilter和statusStyleFilter处理
    state: '未知状态',
    stateStyle: 'default'
  }
}

/**
 * 构建导入后的完整流程数据
 */
export function buildImportedFlowData(importData, fullServices) {
  const metaApp = importData.metaApp || {}

  // 转换API服务数据为标准NODE格式
  const transformedServices = (fullServices || []).map(apiService => {
    return transformApiServiceToNodeFormat(apiService)
  }).filter(service => service !== null) // 过滤掉转换失败的服务

  return {
    preName: metaApp.preName || '未命名元应用',
    preDes: metaApp.preDes || '',
    preInputName: metaApp.preInputName || '输入内容',
    preOutputName: metaApp.preOutputName || '输出内容',
    inputType: metaApp.inputType || 0,
    outputType: metaApp.outputType || 0,
    nodeList: transformedServices
  }
}

/**
 * 服务ID编码器工厂
 */
export function createServiceIdEncoder() {
  return function(id) {
    if (!id) return null
    const timestamp = Date.now().toString(36)
    const encoded = btoa(id + '_' + timestamp)
    return 'ref_' + encoded
  }
}

/**
 * 服务ID解码器工厂
 */
export function createServiceIdDecoder() {
  return function(encodedId) {
    try {
      if (!encodedId || !encodedId.startsWith('ref_')) {
        return null
      }
      const encoded = encodedId.substring(4)
      const decoded = atob(encoded)
      return decoded.split('_')[0]
    } catch (error) {
      console.error('解码服务ID失败:', error)
      return null
    }
  }
}

/**
 * 数据安全处理：移除敏感信息
 */
export function sanitizeExportData(data) {
  const sanitized = JSON.parse(JSON.stringify(data))
  // 移除可能的敏感字段（当前导出数据已经是最小化的，但保留此函数以防将来扩展）
  if (sanitized.services) {
    sanitized.services.forEach(service => {
      // 确保只保留serviceRef字段
      Object.keys(service).forEach(key => {
        if (key !== 'serviceRef') {
          delete service[key]
        }
      })
    })
  }

  return sanitized
}

/**
 * 数据完整性和兼容性检查
 */
export function checkCompatibility(importData, currentVerticalType) {
  const warnings = []
  const errors = []
  // 验证必要的元应用信息
  if (!importData.metaApp || !(typeof (importData.metaApp) === 'object') || !importData.metaApp.preName) {
    errors.push(`元应用信息缺失`)
  }
  // 验证服务列表和服务引用格式
  if (!importData.services || !Array.isArray(importData.services)) {
    errors.push(`服务列表缺失`)
  } else if (!importData.services.every(service =>
    service && typeof service === 'object' && service.serviceRef
  )) {
    errors.push(`服务信息缺失`)
  }
  // 检查垂直领域兼容性
  if (importData.verticalType && importData.verticalType !== currentVerticalType) {
    errors.push(`垂直领域类型与当前不匹配`)
  }
  // 检查版本兼容性
  if (!importData.version) {
    warnings.push(`未获取到版本号`)
  } else if (importData.version !== '1.0') {
    warnings.push(`系统版本为1.0，导入的版本为${importData.version}`)
  }
  // 检查服务数量
  if (importData.services && importData.services.length === 0) {
    warnings.push('导入文件中没有服务数据')
  }
  // 验证数据校验和
  if (importData.checksum !== generateChecksum(importData.services)) {
    warnings.push('数据校验不匹配，可能存在数据损坏')
  }
  return {
    errors,
    warnings
  }
}
