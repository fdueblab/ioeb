/**
 * 元应用预发布就绪状态（构建产物是否可进入预发布 / 提交）。
 */

export function getPrepublishReadiness({
  build,
  artifact,
  detailArtifact,
  isCompleted = true,
  hasFailed = false
} = {}) {
  if (!isCompleted || hasFailed) {
    return { ready: false, reason: '', loading: false }
  }

  const artState = detailArtifact || {}
  if (artState.loading) {
    return { ready: false, reason: '产物仍在加载中，请稍候', loading: true }
  }
  if (artState.error) {
    return { ready: false, reason: artState.error, loading: false, error: artState.error }
  }

  const art = artifact || artState.data
  if (!art) {
    if (artState.skipped) {
      return {
        ready: false,
        reason: '演示产物未生成，请查看构建详情或重新构建',
        loading: false
      }
    }
    return { ready: false, reason: '构建产物尚未就绪', loading: false }
  }

  const b = build || {}
  const buildId = b.buildId || ''
  const artifactId = b.artifactId || art.artifactId || ''
  const artifactHash = b.artifactHash || ''

  if (!buildId) return { ready: false, reason: '缺少构建 ID', loading: false }
  if (!artifactId || !artifactHash) {
    return { ready: false, reason: '产物摘要不完整，请重新构建', loading: false }
  }

  return {
    ready: true,
    reason: '',
    loading: false,
    build: { buildId, artifactId, artifactHash },
    artifact: art
  }
}

export function assertPrepublishReady(readiness) {
  const state = readiness || {}
  if (state.ready) return state
  throw new Error(state.reason || '构建产物不完整，请返回重新构建')
}
