import request from '@/utils/request'
import { API_BASE_URL } from '@/utils/baseUrl'

/**
 * 获取所有微服务
 * @returns {Promise} 返回所有微服务数据列表
 */
export function getAllServices() {
  return request({
    url: `${API_BASE_URL}/services`,
    method: 'get'
  })
}

/**
 * 获取特定ID的微服务
 * @param {string} serviceId 服务ID
 * @returns {Promise} 返回特定服务详情
 */
export function getServiceById(serviceId) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}`,
    method: 'get'
  })
}

/**
 * 按关键词搜索微服务
 * @param {string} keyword 搜索关键词
 * @returns {Promise} 返回符合关键词的服务列表
 */
export function searchServices(keyword) {
  return request({
    url: `${API_BASE_URL}/services/search`,
    method: 'get',
    params: { keyword }
  })
}

/**
 * 领域内智能检索（全表模糊匹配）
 * @param {{ domain: string, name?: string, description?: string, role?: string, function?: string, requirement?: string }} params
 */
export function smartSearch(params) {
  return request({
    url: `${API_BASE_URL}/services/smart-search`,
    method: 'get',
    params
  })
}

/**
 * 按条件筛选微服务
 * @param {Object} filters 筛选条件对象，可包含attribute, type, domain, industry, scenario, technology, status
 * @returns {Promise} 返回筛选后的服务列表
 */
export function filterServices(filters) {
  return request({
    url: `${API_BASE_URL}/services/filter`,
    method: 'get',
    params: filters
  })
}

/**
 * 仿真构建 MCP 服务选择器（含 tools，不分页）
 * @param {string} domain 垂直领域
 */
export function getMcpServiceOptions(domain) {
  return request({
    url: `${API_BASE_URL}/services/mcp-options`,
    method: 'get',
    params: { domain }
  })
}

/**
 * 获取特定垂直领域的服务（支持分页）
 * @param {string} verticalType 垂直领域类型
 * @param {{ page?: number, pageSize?: number }} [pagination]
 */
export function getServicesByVerticalType(verticalType, pagination = {}) {
  return filterServices({ domain: verticalType, ...pagination })
}

/**
 * 创建微服务
 * @param {Object} serviceData 服务数据
 * @returns {Promise} 返回创建的服务信息
 */
export function createService(serviceData) {
  return request({
    url: `${API_BASE_URL}/services`,
    method: 'post',
    data: serviceData
  })
}

/**
 * 预发布新服务
 * @param {Object} serviceData 服务数据
 * @returns {Promise} 返回创建的服务信息
 */
export function prepublishService(serviceData) {
  return request({
    url: `${API_BASE_URL}/services/prepublish`,
    method: 'post',
    data: serviceData
  })
}

/**
 * 更新微服务
 * @param {string} serviceId 服务ID
 * @param {Object} serviceData 更新的服务数据
 * @returns {Promise} 返回更新后的服务信息
 */
export function updateService(serviceId, serviceData) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}`,
    method: 'post',
    data: serviceData
  })
}

/**
 * 删除微服务
 * @param {string} serviceId 服务ID
 * @returns {Promise} 返回删除结果
 */
export function deleteService(serviceId) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/delete`,
    method: 'get'
  })
}

/**
 * 部署微服务
 * @param {string} serviceId 服务ID
 * @returns {Promise} 返回部署结果
 */
export function deployService(serviceId) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/deploy`,
    method: 'get'
  })
}

/**
 * 停止微服务
 * @param {string} serviceId 服务ID
 * @returns {Promise} 返回停止结果
 */
export function stopService(serviceId) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/stop`,
    method: 'get'
  })
}

/**
 * 批量获取微服务
 * @param {string[]} serviceIds 服务ID数组
 * @returns {Promise} 返回批量获取的服务信息
 */
export function batchGetServices(serviceIds) {
  return request({
    url: `${API_BASE_URL}/services/batch`,
    method: 'post',
    data: {
      ids: serviceIds
    }
  })
}

/**
 * 想定式开发：上传生成的 .py 并登记为垂域可检索资源（type=generated_algorithm）
 * @param {FormData} formData 含 file、name、domain 及可选 industry/scenario/technology
 */
export function uploadScenarioGeneratedAlgorithm(formData) {
  return request({
    url: `${API_BASE_URL}/services/scenario-generated/upload`,
    method: 'post',
    data: formData,
    timeout: 120000
  })
}

/**
 * 下载想定式开发生成的算法源码（type=generated_algorithm）
 * @param {string} serviceId 服务 ID
 */
export function downloadScenarioGeneratedAlgorithm(serviceId) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/scenario-generated-code`,
    method: 'get',
    responseType: 'blob'
  })
}

export function getMyServices() {
  return request({
    url: `${API_BASE_URL}/services/mine`,
    method: 'get'
  })
}

export function saveUpgradeAdvice(serviceId, payload) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/upgrade-advice`,
    method: 'post',
    data: payload
  })
}

/**
 * 获取用户已购买的成果
 * @returns {Promise} 返回已购买的服务列表
 */
export function getPurchasedServices() {
  return request({
    url: `${API_BASE_URL}/services/user/purchased`,
    method: 'get'
  })
}

/**
 * 获取用户感兴趣的成果
 * @returns {Promise} 返回感兴趣的服务列表
 */
export function getInterestedServices() {
  return request({
    url: `${API_BASE_URL}/services/user/interested`,
    method: 'get'
  })
}

/**
 * 发布服务销售
 * @param {string} serviceId 服务ID
 * @param {Object} payload 销售信息
 * @param {number} payload.price 价格
 * @param {string} payload.description 销售说明
 * @returns {Promise} 返回发布结果
 */
export function publishSale(serviceId, payload) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/publish-sale`,
    method: 'post',
    data: payload
  })
}

/**
 * 停止销售服务
 * @param {string} serviceId 服务ID
 * @returns {Promise} 返回停止销售结果
 */
export function unpublishSale(serviceId) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/unpublish-sale`,
    method: 'delete'
  })
}

/**
 * 获取成果的对话消息列表
 * @param {string} serviceId 服务ID
 * @returns {Promise} 返回消息列表
 */
export function getMessages(serviceId) {
  return request({
    url: `${API_BASE_URL}/messages/service/${serviceId}`,
    method: 'get'
  })
}

/**
 * 发送购买联系消息
 * @param {Object} payload 消息内容
 * @param {string} payload.serviceId 服务ID
 * @param {string} payload.content 消息内容
 * @returns {Promise} 返回发送结果
 */
export function sendPurchaseContactMessage(payload) {
  return request({
    url: `${API_BASE_URL}/messages/contact-purchase`,
    method: 'post',
    data: payload
  })
}

/**
 * 发送使用服务消息
 * @param {Object} payload 消息内容
 * @param {string} payload.serviceId 服务ID
 * @param {string} payload.content 消息内容
 * @returns {Promise} 返回发送结果
 */
export function sendUseServiceMessage(payload) {
  return request({
    url: `${API_BASE_URL}/messages/use-service`,
    method: 'post',
    data: payload
  })
}

/**
 * 回复消息
 * @param {number} messageId 消息ID
 * @param {string} content 回复内容
 * @returns {Promise} 返回回复结果
 */
export function replyMessage(messageId, content) {
  return request({
    url: `${API_BASE_URL}/messages/${messageId}/reply`,
    method: 'post',
    data: { content }
  })
}

/**
 * 获取未读消息列表
 * @returns {Promise} 返回未读消息列表
 */
export function getUnreadMessages() {
  return request({
    url: `${API_BASE_URL}/messages/user/unread`,
    method: 'get'
  })
}

/**
 * 标记消息为已读
 * @param {number} messageId 消息ID
 * @returns {Promise} 返回标记结果
 */
export function markMessageAsRead(messageId) {
  return request({
    url: `${API_BASE_URL}/messages/${messageId}/mark-read`,
    method: 'post'
  })
}

/**
 * 添加成果关系（感兴趣/已购买）
 * @param {string} serviceId 服务ID
 * @param {string} relationType 关系类型：interested-感兴趣/purchased-已购买
 * @returns {Promise} 返回添加结果
 */
export function addServiceRelation(serviceId, relationType) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/relation`,
    method: 'post',
    data: { relationType }
  })
}

/**
 * 删除成果关系
 * @param {string} serviceId 服务ID
 * @param {string} relationType 关系类型
 * @returns {Promise} 返回删除结果
 */
export function removeServiceRelation(serviceId, relationType) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/relation`,
    method: 'delete',
    params: { relationType }
  })
}
