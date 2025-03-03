import { axios } from '@/utils/request'

// 修改默认前缀
axios.defaults.baseURL = ''

// container id
export function serviceDetection () {
  return axios({
    url: 'getAllUrl',
    method: 'get'
  })
}
