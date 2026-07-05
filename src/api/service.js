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
