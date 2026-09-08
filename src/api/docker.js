import { axios } from '@/utils/request'

const api = {
  inspectContainer: '/api/docker/jcontainer',
  startContainer: '/api/docker/container/start',
  stopContainer: '/api/docker/container/stop',
  restartContainer: '/api/docker/container/restart',
  deleteContainer: '/api/docker/container/delete',
  newImage: '/api/docker/newImage',
  createContainer: '/api/docker/container/creat',
  createImage: '/api/docker/test/exec'

}

export default api

// 修改默认前缀
if (process.env.VUE_APP_UNIONPAY_DEMO !== 'true') axios.defaults.baseURL = 'http://49.235.115.169:10031/api'
// axios.defaults.baseURL = 'http://localhost:10031'

// container id
export function inspectContainer (parameter) {
  return axios({
    url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.inspectContainer : api.inspectContainer,
    method: 'get',
    params: parameter
  })
}

export function startContainer (parameter) {
  return axios({
    url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.startContainer : api.startContainer,
    method: 'post',
    data: parameter
  })
}

export function stopContainer (parameter) {
  return axios({
    url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.stopContainer : api.stopContainer,
    method: 'post',
    data: parameter
  })
}

export function restartContainer (parameter) {
  return axios({
    url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.restartContainer : api.restartContainer,
    method: 'post',
    data: parameter
  })
}

export function deleteContainer (parameter) {
  return axios({
    url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.deleteContainer : api.deleteContainer,
    method: 'post',
    data: parameter
  })
}

export function createContainer (data) {
  return axios({
    url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.createContainer : api.createContainer,
    method: 'post',
    data: data
  })
}
export function createImage () {
  return axios({
    url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.createImage : api.createImage,
    method: 'get'
  })
}

export function createDockfile (formData) {
    return axios({
      method: 'post',
      url: process.env.VUE_APP_UNIONPAY_DEMO === 'true' ? '/upstream/docker' + api.newImage : api.newImage,
      data: formData
    })
  }
