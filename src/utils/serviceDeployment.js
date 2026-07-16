const DEPLOYMENT_SUCCESS_STATUSES = new Set([
  'pre_release_unrated',
  'pre_release_pending',
  'released'
])

const DEPLOYMENT_FAILURE_STATUSES = new Set([
  'error',
  'not_deployed'
])

const defaultSleep = (milliseconds) => new Promise(resolve => {
  setTimeout(resolve, milliseconds)
})

export async function waitForServiceDeployment(fetchService, options = {}) {
  const timeoutMs = options.timeoutMs || 15 * 60 * 1000
  const intervalMs = options.intervalMs || 3000
  const maxConsecutiveErrors = options.maxConsecutiveErrors || 3
  const now = options.now || Date.now
  const sleep = options.sleep || defaultSleep
  const onStatus = options.onStatus || (() => {})
  const startedAt = now()
  let consecutiveErrors = 0

  while (true) {
    try {
      const response = await fetchService()
      const service = response && response.service
      if (!service || !service.status) {
        throw new Error('查询部署状态返回了无效数据')
      }

      consecutiveErrors = 0
      onStatus(service.status, service)

      if (DEPLOYMENT_SUCCESS_STATUSES.has(service.status)) {
        return service
      }
      if (DEPLOYMENT_FAILURE_STATUSES.has(service.status)) {
        throw new Error('服务容器或 MCP 端点启动失败，请查看后端部署日志')
      }
      if (service.status !== 'deploying') {
        throw new Error(`服务进入了非预期状态：${service.status}`)
      }
    } catch (error) {
      if (
        error.message.includes('启动失败') ||
        error.message.includes('非预期状态')
      ) {
        throw error
      }
      consecutiveErrors += 1
      if (consecutiveErrors >= maxConsecutiveErrors) {
        throw new Error(`连续查询部署状态失败：${error.message || error}`)
      }
    }

    if (now() - startedAt >= timeoutMs) {
      throw new Error('等待服务部署完成超时，请稍后在服务管理中查看状态')
    }
    await sleep(intervalMs)
  }
}
