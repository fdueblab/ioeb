import { getDictionaryByCategory, getAllDictionaries } from '@/api/dictionary'
import storage from 'store'

// 字典缓存的键前缀
const DICT_CACHE_KEY = 'DICT_'
// 字典缓存版本号，用于在版本更新时清除缓存
const DICT_CACHE_VERSION = '1.0'
const DICT_CACHE_VERSION_KEY = 'DICT_CACHE_VERSION'

/**
 * 初始化字典缓存版本
 */
function initDictCacheVersion() {
  const version = storage.get(DICT_CACHE_VERSION_KEY)
  if (version !== DICT_CACHE_VERSION) {
    // 版本变更，清除所有字典缓存
    clearAllDictCache()
    storage.set(DICT_CACHE_VERSION_KEY, DICT_CACHE_VERSION)
  }
}

/**
 * 清除所有字典缓存
 */
export function clearAllDictCache() {
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    if (key.startsWith(DICT_CACHE_KEY)) {
      storage.remove(key)
    }
  }
}

/**
 * 获取字典缓存
 * @param {string} dictType 字典类型
 * @returns {Object|null} 字典映射对象或null
 */
export function getDictCache(dictType) {
  const key = `${DICT_CACHE_KEY}${dictType}`
  return storage.get(key)
}

/**
 * 设置字典缓存
 * @param {string} dictType 字典类型
 * @param {Object} dictData 字典数据
 * @param {number} expires 过期时间（毫秒），默认24小时
 */
export function setDictCache(dictType, dictData, expires = 24 * 60 * 60 * 1000) {
  const key = `${DICT_CACHE_KEY}${dictType}`
  storage.set(key, dictData, new Date().getTime() + expires)
}

/**
 * 从缓存中获取字典数据
 * @param {string} dictType 字典类型
 * @param {Object} defaultValue 默认值，如果无法获取数据时返回
 * @returns {Promise<Object>} 字典映射对象
 */
export async function loadDict(dictType, defaultValue = []) {
  // 首先检查缓存
  const cached = getDictCache(dictType)
  if (cached) {
    return cached
  }

  try {
    // 缓存不存在，从API获取
    const response = await getDictionaryByCategory(dictType)

    if (response && response.status === 'success' && response.dictionaries.length > 0) {
      const map = response.dictionaries.map(item => ({ text: item.text, code: item.code }))
      // 缓存结果
      setDictCache(dictType, map)
      return map
    }
    return defaultValue
  } catch (error) {
    console.error(`加载字典数据失败: ${dictType}`, error)
    return defaultValue
  }
}

/**
 * 加载并缓存所有字典
 * @returns {Promise<boolean>} 处理结果
 */
export async function preloadAllDict() {
  initDictCacheVersion()

  try {
    // 从API获取所有字典
    const response = await getAllDictionaries()

    if (response && response.status === 'success' && response.dictionaries) {
      const allDictionaries = response.dictionaries

      // 遍历所有字典类型并分别缓存
      for (const [dictType, dictItems] of Object.entries(allDictionaries)) {
        if (Array.isArray(dictItems) && dictItems.length > 0) {
          // 缓存结果
          setDictCache(dictType, dictItems)
        }
      }
      console.log('所有字典预加载完成')
      return true
    }
    console.warn('获取字典数据失败: 响应数据格式不正确')
    return false
  } catch (error) {
    console.error('加载所有字典数据失败', error)
    return false
  }
}

// 默认导出
export default {
  loadDict,
  preloadAllDict,
  getDictCache,
  setDictCache,
  clearAllDictCache
}
