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

// 数据处理相关工具函数

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

/**
 * 根据流程数据生成服务树结构
 * @param {Object} flowData - 流程数据
 * @param {string} verticalType - 服务类型
 * @returns {Object} - 包含chosenServices和serviceNodes的对象
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
 * 处理智能体返回的数据
 * @param {string|Object} results - 智能体返回的原始数据
 * @param {string} verticalType - 服务类型
 * @returns {Object} - 处理后的数据 {success: boolean, flowData?: Object, chosenServices?: Array, serviceNodes?: Array, error?: string}
 */
export function processAgentResponse(results, verticalType) {
  try {
    let agentData

    // 解析智能体返回的数据
    if (typeof results === 'string') {
      agentData = JSON.parse(results)
    } else {
      agentData = results
    }

    // 检查返回数据格式
    if (agentData.success && agentData.result) {
      const { result } = agentData

      // 转换数据格式以适配现有系统
      const flowData = {
        preName: result.preName,
        preInputName: result.preInputName,
        preOutputName: result.preOutputName,
        nodeList: result.nodeList
      }

      // 生成服务节点和选中服务列表
      const { chosenServices, serviceNodes } = generateServiceNodes(flowData, verticalType)

      return {
        success: true,
        flowData,
        chosenServices,
        serviceNodes
      }
    } else {
      return {
        success: false,
        error: '智能体返回数据格式不正确'
      }
    }
  } catch (error) {
    console.error('解析智能体返回数据失败:', error)
    return {
      success: false,
      error: `解析数据失败: ${error.message}`
    }
  }
}

/**
 * 获取基础服务节点 - 用于重置时恢复初始状态
 * @param {string} serviceType - 服务类型
 * @returns {Array} - 基础服务节点数组
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
