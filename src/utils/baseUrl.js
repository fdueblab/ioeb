const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const normalizePath = (path) => {
  const normalized = (path || '').trim().replace(/^\/+|\/+$/g, '')
  return normalized ? `/${normalized}` : ''
}

export const resolveRuntimeBaseUrl = (configuredValue, fallbackPath = '') => {
  const configured = (configuredValue || '').trim()
  const fallback = normalizePath(fallbackPath)
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : ''

  if (!configured) {
    return origin ? `${origin}${fallback}` : fallback
  }

  if (configured.startsWith('/')) {
    return origin ? `${origin}${trimTrailingSlash(configured)}` : trimTrailingSlash(configured)
  }

  return trimTrailingSlash(configured)
}

export const API_BASE_URL = resolveRuntimeBaseUrl(process.env.VUE_APP_API_BASE_URL, '/api')
export const AGENT_BASE_URL = resolveRuntimeBaseUrl(process.env.VUE_APP_AGENT_BASE_URL, '')
export const DOCS_BASE_URL = resolveRuntimeBaseUrl(process.env.VUE_APP_DOCS_BASE_URL, '/docs')

export const buildServiceApiUrl = (serviceUrl) => {
  const normalizedServiceUrl = String(serviceUrl || '').replace(/^\/+/, '')
  return `${API_BASE_URL}/${normalizedServiceUrl}`
}

export const buildDocsUrl = (docsPath = '') => {
  const normalizedDocsPath = String(docsPath || '').replace(/^\/+|\/+$/g, '')
  return normalizedDocsPath ? `${DOCS_BASE_URL}/${normalizedDocsPath}` : `${DOCS_BASE_URL}/`
}
