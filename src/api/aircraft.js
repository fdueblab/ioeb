/* eslint-disable */
import { axios } from '@/utils/request'

const api = {
  getAllRecord: '/api/aircraft/record',
  getTrace: '/api/aircraft/trace',
}

export default api

export function getAllRecord() {
  return axios({
    url: api.getAllRecord,
    method: 'get',
  })
}

export function getTrace(parameter) {
  return axios({
    url: api.getTrace,
    method: 'get',
    data: parameter
  })
}