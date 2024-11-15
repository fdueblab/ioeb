import { axios } from '@/utils/request'

const api = {
  scaleService: '/swarm/scale',
  deployStack: '/swarm/deploy'
}

export default api

/**
 *
 * @param parameter
 */
export function scaleService (parameter) {
  return axios({
    url: api.scaleService,
    method: 'post',
    data: parameter
  })
}

export function deployStack (parameter) {
  return axios({
    url: api.deployStack,
    method: 'post',
    data: parameter
  })
}
