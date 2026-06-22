const RECENT_ROUTES_KEY = 'ioeb_recent_routes'
const MAX_RECENT_ROUTES = 8

const ignoredPathRules = [
  /^\/user(\/|$)/,
  /^\/404$/,
  /^\/dashboard\/workplace$/
]

function isRecordableRoute (route) {
  if (!route || !route.path || route.path === '/') {
    return false
  }
  return !ignoredPathRules.some(rule => rule.test(route.path))
}

export function getRecentRoutes () {
  try {
    const raw = localStorage.getItem(RECENT_ROUTES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

export function recordRecentRoute (route) {
  if (!isRecordableRoute(route)) {
    return
  }

  const title = route.meta && route.meta.title ? route.meta.title : route.name
  const nextRoute = {
    path: route.path,
    title,
    visitedAt: Date.now()
  }
  const routes = getRecentRoutes()
    .filter(item => item && item.path !== nextRoute.path)

  try {
    localStorage.setItem(
      RECENT_ROUTES_KEY,
      JSON.stringify([nextRoute, ...routes].slice(0, MAX_RECENT_ROUTES))
    )
  } catch (e) {}
}
