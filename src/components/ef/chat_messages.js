// 聊天消息管理模块
// 统一管理各个领域的建议输入、成功回复和错误回复

import { AML_TOPIC_DEMO_INPUTS } from '@/mock/data/topic_demo_inputs'

// 各领域的建议输入
const DOMAIN_SUGGESTIONS = {
  aml: [
    ...AML_TOPIC_DEMO_INPUTS.map(value => ({ value })),
    { value: '请帮我实现一个简单的金融欺诈检测应用' },
    { value: '我需要一个围标检测应用' }
  ],
  aircraft: [
    { value: '请帮我构建一个智能飞行控制应用' }
  ],
  health: [
    { value: '急诊一位疑似感染的患者，GCS 14、呼吸频率 24/min、收缩压 96 mmHg，请帮我做 qSOFA 床旁评分并判断是否需要升级为脓毒症进一步评估' },
    { value: '门诊患者突发胸痛伴呼吸困难，疑似肺栓塞，请用 Geneva 评分评估临床风险，并检索相关临床试验与文献证据' },
    { value: '肿瘤 MDT 讨论一位 BRAF 突变患者，请检索 BRAF 靶点关联疾病、在研药物以及相关临床试验证据' },
    { value: '一位住院患者需要使用利奈唑胺抗感染，请帮我优化给药方案' }
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

// 仅用于没有业务回复的基础设施错误
const ERROR_REPLIES = {
  network: '网络连接异常或请求超时，请稍后重试。',
  server: '服务器处理异常，请稍后重试。'
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
    return INITIAL_MESSAGES[this.verticalType] || '智能体未获取到必要信息，请刷新后重试'
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
  getErrorReply(kind = 'server') {
    return ERROR_REPLIES[kind] || ERROR_REPLIES.server
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
