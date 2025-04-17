import request from '@/utils/request'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL

/**
 * 获取指定类别的字典列表
 * @param {string} category 字典类别
 * @returns {Promise} 返回字典列表数据
 */
export function getDictionaryByCategory(category) {
  return request({
    url: `${API_BASE_URL}/dictionaries/${category}`,
    method: 'get'
  })
}

/**
 * 获取指定类别和代码的字典项
 * @param {string} category 字典类别
 * @param {string} code 字典代码
 * @returns {Promise} 返回字典项数据
 */
export function getDictionaryByCode(category, code) {
  return request({
    url: `${API_BASE_URL}/dictionaries/${category}/${code}`,
    method: 'get'
  })
}

/**
 * 创建字典
 * @param {string} category 字典类别
 * @param {object} data 字典数据对象，包含code, text, sort等字段
 * @returns {Promise} 返回创建结果
 */
export function createDictionary(category, data) {
  return request({
    url: `${API_BASE_URL}/dictionaries/${category}`,
    method: 'post',
    data
  })
}

/**
 * 更新字典
 * @param {string} category 字典类别
 * @param {string} code 字典代码
 * @param {object} data 字典更新数据对象，包含text, sort等字段
 * @returns {Promise} 返回更新结果
 */
export function updateDictionary(category, code, data) {
  return request({
    url: `${API_BASE_URL}/dictionaries/${category}/${code}`,
    method: 'put',
    data
  })
}

/**
 * 删除字典
 * @param {string} category 字典类别
 * @param {string} code 字典代码
 * @returns {Promise} 返回删除结果
 */
export function deleteDictionary(category, code) {
  return request({
    url: `${API_BASE_URL}/dictionaries/${category}/${code}`,
    method: 'delete'
  })
}

/**
 * 获取所有字典数据
 * @returns {Promise} 返回所有字典数据
 */
export function getAllDictionaries() {
  return request({
    url: `${API_BASE_URL}/dictionaries/all`,
    method: 'get'
  })
}
