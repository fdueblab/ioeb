/**
 * 用户画像 API
 *
 * 当前为「前端优先」实现：数据读写 localStorage（按 username 区分）。
 * 后端就绪后，只需把下面三个函数的内部实现替换为 request(...) 调用即可，
 * 调用方（store / 组件）无需改动。
 */

const PROFILE_PREFIX = 'user_profile_'
const SURVEY_DONE_PREFIX = 'profile_survey_done_'
const DEFAULT_VERTICAL = 'aml'

function currentUsername () {
  return localStorage.getItem('username') || 'anonymous'
}

function profileKey () {
  return `${PROFILE_PREFIX}${currentUsername()}`
}

/**
 * 获取当前用户画像
 * @returns {Promise<Object>}
 */
export function getProfile () {
  return new Promise((resolve) => {
    try {
      const raw = localStorage.getItem(profileKey())
      resolve(raw ? JSON.parse(raw) : {})
    } catch (e) {
      resolve({})
    }
  })
}

/**
 * 保存当前用户画像
 * @param {Object} profile
 * @returns {Promise<Object>}
 */
export function saveProfile (profile) {
  return new Promise((resolve) => {
    try {
      localStorage.setItem(profileKey(), JSON.stringify(profile || {}))
    } catch (e) {
      // ignore quota errors
    }
    resolve(profile)
  })
}

export function getPreferredVertical () {
  try {
    const raw = localStorage.getItem(profileKey())
    const profile = raw ? JSON.parse(raw) : {}
    return profile.preferredVertical || DEFAULT_VERTICAL
  } catch (e) {
    return DEFAULT_VERTICAL
  }
}

export function setPreferredVertical (verticalCode) {
  return getProfile().then(profile => {
    const nextProfile = {
      ...(profile || {}),
      preferredVertical: verticalCode || DEFAULT_VERTICAL
    }
    return saveProfile(nextProfile)
  })
}

/**
 * 问卷是否已完成 / 跳过
 */
export function isSurveyDone () {
  return localStorage.getItem(`${SURVEY_DONE_PREFIX}${currentUsername()}`) === '1'
}

/**
 * 标记问卷已完成 / 跳过
 */
export function markSurveyDone () {
  localStorage.setItem(`${SURVEY_DONE_PREFIX}${currentUsername()}`, '1')
}

/**
 * 从简历文本抽取画像（前端实现）。
 * 预留：后端/LLM 就绪后可改为远程调用以提升准确率。
 * @param {string} text 简历纯文本
 * @returns {Promise<Object>} 建议填充的画像字段
 */
export function extractFromResume (text) {
  return new Promise((resolve) => {
    // 延迟引入，避免在不需要时加载匹配字典
    import('@/utils/profileExtractor').then(({ extractProfileFromText }) => {
      resolve(extractProfileFromText(text || ''))
    }).catch(() => resolve({}))
  })
}

export default {
  getProfile,
  saveProfile,
  getPreferredVertical,
  setPreferredVertical,
  isSurveyDone,
  markSurveyDone,
  extractFromResume
}
