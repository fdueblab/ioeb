import request from '@/utils/request'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL

export function getUserActionLogs(params) {
  return request({
    url: `${API_BASE_URL}/audit/action-logs`,
    method: 'get',
    params
  })
}
