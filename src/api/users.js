import request from '@/utils/request'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL

/**
 * 获取所有用户
 * @returns {Promise} 返回所有用户数据列表
 */
export function getAllUsers() {
  return request({
    url: `${API_BASE_URL}/users`,
    method: 'get'
  })
}

/**
 * 获取特定ID的用户
 * @param {string} userId 用户ID（UUID字符串）
 * @returns {Promise} 返回特定用户详情
 */
export function getUserById(userId) {
  return request({
    url: `${API_BASE_URL}/users/${userId}`,
    method: 'get'
  })
}

/**
 * 创建新用户
 * @param {Object} userData 用户数据对象
 * @param {string} userData.username 用户名（必填）
 * @param {string} userData.name 用户姓名（必填）
 * @returns {Promise} 返回创建的用户信息
 */
export function createUser(userData) {
  return request({
    url: `${API_BASE_URL}/users`,
    method: 'post',
    data: userData
  })
}
