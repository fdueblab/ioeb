import request from '@/utils/request'
import { API_BASE_URL } from '@/utils/baseUrl'

export function submitFeedback(data) {
  return request({
    url: `${API_BASE_URL}/feedback`,
    method: 'post',
    data
  })
}
