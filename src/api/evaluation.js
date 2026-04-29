import request from '@/utils/request'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL
const AGENT_BASE_URL = process.env.VUE_APP_AGENT_BASE_URL || 'https://fdueblab.cn'

/**
 * AI分析评测数据
 * @param {FormData} formData 包含文件和服务信息的FormData
 * @returns {Promise} 返回数据分析结果
 */
export function analyzeEvaluationData(formData) {
  return request({
    url: `${AGENT_BASE_URL}/api/agent/analyze_evaluation_data`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  })
}

/**
 * AI转换评测数据格式（使用流式响应，需要使用streamAgent）
 * @param {FormData} formData 包含文件和目标格式的FormData
 * @returns {Promise} 返回转换后的数据信息
 *
 * 注意：此接口应使用 streamAgent 调用以获得实时进度
 * import { streamAgent } from '@/utils/request'
 * streamAgent('/api/agent/convert_evaluation_data', formData, callbacks)
 */
export function convertEvaluationData(formData) {
  return request({
    url: `${AGENT_BASE_URL}/api/agent/convert_evaluation_data`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000
  })
}

/**
 * 上传示例数据集
 * @param {FormData} formData 包含文件的FormData
 * @returns {Promise} 返回上传后的URL
 */
export function uploadDataset(formData) {
  return request({
    url: `${API_BASE_URL}/api/upload/dataset`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  })
}

/**
 * 执行服务评测
 * @param {string} serviceId 服务ID
 * @param {FormData} formData 包含评测数据和指标的FormData
 * @returns {Promise} 返回评测结果
 */
export function evaluateService(serviceId, formData) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/evaluate`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000
  })
}

/**
 * 获取服务的评测历史
 * @param {string} serviceId 服务ID
 * @param {Object} params 查询参数
 * @returns {Promise} 返回评测历史列表
 */
export function getEvaluationHistory(serviceId, params = {}) {
  return request({
    url: `${API_BASE_URL}/services/${serviceId}/evaluations`,
    method: 'get',
    params
  })
}

/**
 * 获取评测详情
 * @param {string} evaluationId 评测ID
 * @returns {Promise} 返回评测详细结果
 */
export function getEvaluationDetail(evaluationId) {
  return request({
    url: `${API_BASE_URL}/evaluations/${evaluationId}`,
    method: 'get'
  })
}

/**
 * 获取支持的评测指标列表
 * @returns {Promise} 返回评测指标配置
 */
export function getSupportedMetrics() {
  return request({
    url: `${API_BASE_URL}/evaluations/metrics`,
    method: 'get'
  })
}

/**
 * 验证数据格式
 * @param {FormData} formData 包含数据文件的FormData
 * @param {string} targetFormat 目标格式
 * @returns {Promise} 返回验证结果
 */
export function validateDataFormat(formData, targetFormat) {
  formData.append('target_format', targetFormat)
  return request({
    url: `${API_BASE_URL}/api/validate/data_format`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30000
  })
}

/**
 * 下载转换后的数据
 * @param {string} downloadUrl 下载URL
 * @returns {Promise} 返回文件blob
 */
export function downloadConvertedData(downloadUrl) {
  return request({
    url: downloadUrl,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 批量评测多个服务
 * @param {Array} serviceIds 服务ID数组
 * @param {Object} config 评测配置
 * @returns {Promise} 返回批量评测任务ID
 */
export function batchEvaluate(serviceIds, config) {
  return request({
    url: `${API_BASE_URL}/evaluations/batch`,
    method: 'post',
    data: {
      service_ids: serviceIds,
      config
    }
  })
}

/**
 * 获取批量评测任务状态
 * @param {string} taskId 任务ID
 * @returns {Promise} 返回任务状态
 */
export function getBatchEvaluationStatus(taskId) {
  return request({
    url: `${API_BASE_URL}/evaluations/batch/${taskId}`,
    method: 'get'
  })
}

export default {
  analyzeEvaluationData,
  convertEvaluationData,
  uploadDataset,
  evaluateService,
  getEvaluationHistory,
  getEvaluationDetail,
  getSupportedMetrics,
  validateDataFormat,
  downloadConvertedData,
  batchEvaluate,
  getBatchEvaluationStatus
}
