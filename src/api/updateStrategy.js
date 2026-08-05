import { API_BASE_URL } from '@/utils/baseUrl'
import request from '@/utils/request'

/**
 * 获取成果的更新策略配置
 * @param {string} serviceId 成果ID
 * @returns {Promise}
 */
export function getUpdateStrategy(serviceId) {
  return request({
    url: `${API_BASE_URL}/update-strategy/${serviceId}`,
    method: 'get'
  })
}

/**
 * 保存成果的更新策略配置
 * @param {string} serviceId 成果ID
 * @param {Object} data 策略配置
 * @param {boolean} data.autoTestEnabled 是否启用自动测试
 * @param {number} data.autoTestPeriod 自动测试周期（天）
 * @param {string} data.updateStrategyType 更新策略类型：manual/auto/scheduled
 * @param {Object} data.updateConfig 更新策略详细配置
 * @returns {Promise}
 */
export function saveUpdateStrategy(serviceId, data) {
  return request({
    url: `${API_BASE_URL}/update-strategy/${serviceId}`,
    method: 'post',
    data
  })
}

/**
 * 删除成果的更新策略配置
 * @param {string} serviceId 成果ID
 * @returns {Promise}
 */
export function deleteUpdateStrategy(serviceId) {
  return request({
    url: `${API_BASE_URL}/update-strategy/${serviceId}`,
    method: 'delete'
  })
}

/**
 * 手动触发测试
 * @param {string} serviceId 成果ID
 * @returns {Promise}
 */
export function triggerManualTest(serviceId) {
  return request({
    url: `${API_BASE_URL}/update-strategy/${serviceId}/trigger-test`,
    method: 'post'
  })
}
