import { axios } from '@/utils/request'

const api = {
  getServiceList: '/schedule/services',
  sendFlowData: '/schedule/checkDAG',
  saveFile: '/schedule/saveFile'
}

axios.defaults.baseURL = '' // 仅修改所在文件
// axios.defaults.baseURL = 'http://124.222.217.145:8089'  //仅修改所在文件
export function getServiceList () {
  return axios({
    url: api.getServiceList,
    method: 'get'
  })
}

export function addFlowService (param) {
  return axios({
    url: api.sendFlowData,
    method: 'post',
    body: param
  })
}
export function saveFile (formData) {
  return axios({
    method: 'post',
    url: api.saveFile,
    data: formData
  })
}
