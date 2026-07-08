import request from '@/utils/request'
import { API_BASE_URL } from '@/utils/baseUrl'

export function submitFeedback(data) {
  return request({
    url: `${API_BASE_URL}/feedback`,
    method: 'post',
    data
  })
}

export function getMyFeedbacks() {
  return request({
    url: `${API_BASE_URL}/feedback/mine`,
    method: 'get'
  })
}
