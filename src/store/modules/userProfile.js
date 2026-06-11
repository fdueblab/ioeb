import { getProfile, saveProfile } from '@/api/userProfile'

// 画像字段定义（用于完成度计算与展示顺序）
// domain: 领域, major: 专业, occupation: 职业, techNeeds: 技术需求(多选)
export const PROFILE_FIELDS = ['domain', 'major', 'occupation', 'techNeeds']

const emptyProfile = () => ({
  domain: '',
  major: '',
  occupation: '',
  techNeeds: [],
  bio: ''
})

// 计算完成度（0-100），基于核心字段是否已填写
export function computeCompletion (profile) {
  if (!profile) return 0
  let filled = 0
  PROFILE_FIELDS.forEach(key => {
    const val = profile[key]
    if (Array.isArray(val)) {
      if (val.length > 0) filled++
    } else if (val !== undefined && val !== null && String(val).trim() !== '') {
      filled++
    }
  })
  return Math.round((filled / PROFILE_FIELDS.length) * 100)
}

const userProfile = {
  state: {
    profile: emptyProfile(),
    completion: 0,
    loaded: false
  },

  mutations: {
    SET_PROFILE: (state, profile) => {
      state.profile = { ...emptyProfile(), ...(profile || {}) }
      state.completion = computeCompletion(state.profile)
      state.loaded = true
    },
    SET_PROFILE_COMPLETION: (state, completion) => {
      state.completion = completion
    }
  },

  actions: {
    // 加载当前用户画像（前端优先：localStorage）
    LoadProfile ({ commit }) {
      return new Promise((resolve) => {
        getProfile().then(profile => {
          commit('SET_PROFILE', profile)
          resolve(profile)
        }).catch(() => {
          commit('SET_PROFILE', emptyProfile())
          resolve(emptyProfile())
        })
      })
    },
    // 保存画像
    SaveProfile ({ commit }, profile) {
      return new Promise((resolve, reject) => {
        saveProfile(profile).then(saved => {
          commit('SET_PROFILE', saved || profile)
          resolve(saved || profile)
        }).catch(reject)
      })
    },
    // 清空画像（登出时调用，避免串号）
    ResetProfile ({ commit }) {
      commit('SET_PROFILE', emptyProfile())
      commit('SET_PROFILE_COMPLETION', 0)
    }
  }
}

export default userProfile
