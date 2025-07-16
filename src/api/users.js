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
 * @param {string} userData.password 用户密码（必填）
 * @returns {Promise} 返回创建的用户信息
 */
export function createUser(userData) {
  return request({
    url: `${API_BASE_URL}/users`,
    method: 'post',
    data: userData
  })
}

/**
 * 更新用户信息
 * @param {string} userId 用户ID（UUID字符串）
 * @param {Object} userData 更新的用户数据
 * @param {string} userData.username 用户名
 * @param {string} userData.name 用户姓名
 * @param {string} userData.avatar 头像路径
 * @param {string} userData.telephone 电话号码
 * @param {string} userData.merchantCode 商户代码
 * @returns {Promise} 返回更新后的用户信息
 */
export function updateUser(userId, userData) {
  return request({
    url: `${API_BASE_URL}/users/${userId}/update`,
    method: 'post',
    data: userData
  })
}

/**
 * 更新用户密码
 * @param {string} userId 用户ID（UUID字符串）
 * @param {string} password 新密码
 * @returns {Promise} 返回更新结果
 */
export function updateUserPassword(userId, password) {
  return request({
    url: `${API_BASE_URL}/users/${userId}/password`,
    method: 'post',
    data: { password }
  })
}

/**
 * 更新用户角色
 * @param {string} userId 用户ID（UUID字符串）
 * @param {string} roleId 角色ID
 * @returns {Promise} 返回更新结果
 */
export function updateUserRole(userId, roleId) {
  return request({
    url: `${API_BASE_URL}/users/${userId}/role`,
    method: 'post',
    data: { roleId }
  })
}

/**
 * 删除用户（逻辑删除）
 * @param {string} userId 用户ID（UUID字符串）
 * @returns {Promise} 返回删除结果
 */
export function deleteUser(userId) {
  return request({
    url: `${API_BASE_URL}/users/${userId}/delete`,
    method: 'get'
  })
}

/**
 * 更新用户状态
 * @param {string} userId 用户ID（UUID字符串）
 * @param {number} status 用户状态（1-正常，0-禁用）
 * @returns {Promise} 返回更新结果
 */
export function updateUserStatus(userId, status) {
  return request({
    url: `${API_BASE_URL}/users/${userId}/status`,
    method: 'get',
    params: { status }
  })
}

/**
 * 启用用户
 * @param {string} userId 用户ID（UUID字符串）
 * @returns {Promise} 返回更新结果
 */
export function enableUser(userId) {
  return updateUserStatus(userId, 1)
}

/**
 * 禁用用户
 * @param {string} userId 用户ID（UUID字符串）
 * @returns {Promise} 返回更新结果
 */
export function disableUser(userId) {
  return updateUserStatus(userId, 0)
}

/**
 * 获取所有角色
 * @returns {Promise} 返回所有角色数据列表
 */
export function getAllRoles() {
  return request({
    url: `${API_BASE_URL}/auth/roles`,
    method: 'get'
  })
}
