import request from '@/utils/request'
import { API_BASE_URL } from '@/utils/baseUrl'

export function getUserActionLogs(params) {
  return request({
    url: `${API_BASE_URL}/audit/action-logs`,
    method: 'get',
    params
  })
}
