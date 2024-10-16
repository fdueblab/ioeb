import { axios } from '@/utils/request'

const api = {
  inspectContainer: '/api/docker/jcontainer',
  startContainer: '/api/docker/container/start',
  stopContainer: '/api/docker/container/stop',
  restartContainer: '/api/docker/container/restart',
  deleteContainer: '/api/docker/container/delete',
  newImage: '/api/docker/newImage',
  createContainer: '/api/docker/container/creat',
  createImage: '/api/docker/test/exec',

}

export default api

// 修改默认前缀
// axios.defaults.baseURL = 'http://49.235.115.169:10031/api'
axios.defaults.baseURL = 'http://localhost:10031'

// container id
export function inspectContainer(parameter) {
  return axios({
    url: api.inspectContainer,
    method: 'get',
    params: parameter
  })
}

export function startContainer(parameter) {
  return axios({
    url: api.startContainer,
    method: 'post',
    data: parameter
  })
}

export function stopContainer(parameter) {
  return axios({
    url: api.stopContainer,
    method: 'post',
    data: parameter
  })
}

export function restartContainer(parameter) {
  return axios({
    url: api.restartContainer,
    method: 'post',
    data: parameter
  })
}

export function deleteContainer(parameter) {
  return axios({
    url: api.deleteContainer,
    method: 'post',
    data: parameter
  })
}


export function createContainer(data) {
  return axios({
    url: api.createContainer,
    method: 'post',
    data: data
  })
}
export function createImage() {
  return axios({
    url: api.createImage,
    method: 'get'
  })
}

export function createDockfile(formData) {
    return axios({
      method: 'post',
      url: api.newImage,
      data: formData
    })
  }

