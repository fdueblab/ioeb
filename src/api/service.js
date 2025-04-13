import request from '@/utils/request'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL

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
 * 获取特定垂直领域的服务
 * @param {string} verticalType 垂直领域类型
 * @returns {Promise} 返回指定垂直领域的服务列表
 */
export function getServicesByVerticalType(verticalType) {
  // 垂直领域类型到领域ID的映射
  const verticalDomainMap = {
    'aml': 0, // 金融领域
    'aircraft': 1, // 航空领域
    'health': 2, // 医疗领域
    'agriculture': 3, // 农业领域
    'evtol': 4, // 低空飞行领域
    'ecommerce': 5, // 电商领域
    'homeAI': 6 // 家庭陪伴领域
  }

  // 将垂直领域类型转换为领域ID进行筛选
  const domainId = verticalDomainMap[verticalType] !== undefined ? verticalDomainMap[verticalType] : -1

  if (domainId === -1) {
    // 如果没有匹配的领域ID，返回空服务列表
    return Promise.resolve({
      status: 'success',
      message: '未找到匹配的领域',
      total: 0,
      services: []
    })
  }

  return filterServices({ domain: domainId })
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
 * 更新微服务
 * @param {string} serviceId 服务ID
 * @param {Object} serviceData 更新的服务数据
 * @returns {Promise} 返回更新后的服务信息
 */
export function updateService(serviceId, serviceData) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}`,
    method: 'put',
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
    url: `${API_BASE_URL}/services/${serviceId}`,
    method: 'delete'
  })
}
