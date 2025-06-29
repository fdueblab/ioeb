// 聊天消息管理模块
// 统一管理各个领域的建议输入、成功回复和错误回复

// 各领域的建议输入
const DOMAIN_SUGGESTIONS = {
  aml: [
    { value: '我想基于课题一的算法生成一个跨境支付报告生成应用' },
    { value: '我想基于课题二的算法生成一个经过检测的跨境支付报告生成应用' },
    { value: '我想基于课题三的算法构建一个智能分析系统，并用课题四的算法对其进行检测' },
    { value: '我想基于课题四的算法开发一个数据处理应用' },
    { value: '我需要基于各课题组的算法开发一个金融风控系统' },
    { value: '请帮我实现一个简单的金融欺诈检测应用' },
    { value: '我需要一个围标检测应用' }
  ],
  aircraft: [
    { value: '请帮我构建一个智能飞行控制应用' }
  ],
  health: [
    { value: '我想开发一个乡村医疗AI辅助诊断系统' }
  ],
  agriculture: [
    { value: '请帮我构建一个智能农业分析应用' }
  ],
  evtol: [
    { value: '我想开发一个eVTOL智能飞行控制应用' }
  ],
  ecommerce: [
    { value: '我想开发一个跨境电商智能营销应用' }
  ],
  homeAI: [
    { value: '我想开发一个家庭智能助手应用' }
  ]
}

// 各领域的成功回复模板
const SUCCESS_REPLY_TEMPLATES = {
  aml: '按照您的需求，我选取了<b>{services}</b>作为可供任务智能体调用的跨境支付AI监测服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。',
  aircraft: '按照您的需求，我选取了<b>{services}</b>作为可供任务智能体调用的无人飞机AI监控服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。',
  health: '按照您的需求，我选取了<b>{services}</b>作为可供任务智能体调用的乡村医疗AI应用服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。',
  agriculture: '按照您的需求，我选取了<b>{services}</b>作为可供任务智能体调用的农业数智AI应用服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。',
  evtol: '按照您的需求，我选取了<b>{services}</b>作为可供任务智能体调用的低空飞行AI应用服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。',
  ecommerce: '按照您的需求，我选取了<b>{services}</b>作为可供任务智能体调用的跨境电商AI应用服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。',
  homeAI: '按照您的需求，我选取了<b>{services}</b>作为可供任务智能体调用的家庭陪伴AI应用服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。'
}

// 各领域的错误回复
const ERROR_REPLIES = {
  error: '服务器异常，请稍后再试',
  aml: '非常抱歉，未能理解您的需求。本系统目前仅支持基于课题一、课题二、课题三、课题四或课题组内的金融欺诈检测相关算法构建简单的跨境支付元应用。',
  aircraft: '非常抱歉，未能理解您的需求。本系统目前仅支持基于无人机控制和目标识别相关技术构建简单的无人飞机元应用。',
  health: '非常抱歉，未能理解您的需求。本系统目前仅支持基于医疗AI诊断和健康监测相关技术构建简单的乡村医疗元应用。',
  agriculture: '非常抱歉，未能理解您的需求。本系统目前仅支持基于农业AI和作物分析相关技术构建简单的数字农业元应用。',
  evtol: '非常抱歉，未能理解您的需求。本系统目前仅支持基于eVTOL飞行控制和环境感知相关技术构建简单的低空飞行元应用。',
  ecommerce: '非常抱歉，未能理解您的需求。本系统目前仅支持基于跨境电商和智能营销相关技术构建简单的跨境电商元应用。',
  homeAI: '非常抱歉，未能理解您的需求。本系统目前仅支持基于家庭AI和智能家居相关技术构建简单的家庭陪伴元应用。'
}

// 各领域的占位符文本
const PLACEHOLDERS = {
  aml: '请输入您对跨境支付应用的需求',
  aircraft: '请输入您对无人飞机应用的需求',
  health: '请输入您对乡村医疗应用的需求',
  agriculture: '请输入您对数字农业应用的需求',
  evtol: '请输入您对低空飞行应用的需求',
  ecommerce: '请输入您对跨境电商应用的需求',
  homeAI: '请输入您对家庭陪伴应用的需求'
}

// 各领域的初始消息
const INITIAL_MESSAGES = {
  aml: '请告诉我您对跨境支付应用的需求，我将根据您的需求尝试生成元应用',
  aircraft: '请告诉我您对无人飞机应用的需求，我将根据您的需求尝试生成元应用',
  health: '请告诉我您对乡村医疗应用的需求，我将根据您的需求尝试生成元应用',
  agriculture: '请告诉我您对数字农业应用的需求，我将根据您的需求尝试生成元应用',
  evtol: '请告诉我您对低空飞行应用的需求，我将根据您的需求尝试生成元应用',
  ecommerce: '请告诉我您对跨境电商应用的需求，我将根据您的需求尝试生成元应用',
  homeAI: '请告诉我您对家庭陪伴应用的需求，我将根据您的需求尝试生成元应用'
}

/**
 * 聊天消息管理类
 */
export class ChatMessageManager {
  constructor(verticalType) {
    this.verticalType = verticalType
  }

  /**
   * 获取当前领域的建议输入
   */
  getSuggestions() {
    return DOMAIN_SUGGESTIONS[this.verticalType] || []
  }

  /**
   * 获取当前领域的占位符文本
   */
  getPlaceholder() {
    return PLACEHOLDERS[this.verticalType] || ''
  }

  /**
   * 获取当前领域的初始消息
   */
  getInitialMessage() {
    return INITIAL_MESSAGES[this.verticalType] || ''
  }

  /**
   * 生成成功回复消息
   * @param {Array} chosenServices - 选中的服务列表
   */
  generateSuccessReply(chosenServices) {
    const template = SUCCESS_REPLY_TEMPLATES[this.verticalType] || SUCCESS_REPLY_TEMPLATES.aml
    const servicesText = chosenServices.join('</b>, <b>')
    return template.replace('{services}', servicesText)
  }

  /**
   * 获取当前领域的错误回复
   */
  getErrorReply(error = false) {
    if (error) {
      return ERROR_REPLIES.error
    }
    return ERROR_REPLIES[this.verticalType] || ERROR_REPLIES.error
  }

  /**
   * 过滤建议输入
   * @param {string} input - 用户输入
   */
  filterSuggestions(input) {
    const suggestions = this.getSuggestions()
    if (!input) {
      return [...suggestions]
    }
    return suggestions.filter(item =>
      item.value.toLowerCase().includes(input.toLowerCase())
    )
  }
}

export default ChatMessageManager
