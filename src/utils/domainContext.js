import storage from 'store'

export const DOMAIN_STORAGE_KEY = 'ioeb_current_domain'
export const DEFAULT_DOMAIN = {
  code: 'aml',
  text: '跨境支付AI监测'
}
export const DEFAULT_LANDING_PATH = '/dashboard/workplace'

export const OPENED_VERTICAL_LABELS = {
  aml: '跨境支付AI监测',
  health: '心理健康分析'
}

export const OPENED_VERTICAL_CODES = Object.keys(OPENED_VERTICAL_LABELS)

const SINGLE_DOMAIN_MENU_PATHS = [
  '/vertical-user',
  '/vertical-scenario-dev',
  '/vertical-ms',
  '/vertical-meta-app'
]

export function normalizeDomains(domains = []) {
  const normalized = domains
    .map(item => ({
      code: item && (item.code || item.value || item.text),
      text: item && (item.text || item.label || item.code || item.value)
    }))
    .filter(item => item.code && item.text)

  return normalized.length > 0 ? normalized : [DEFAULT_DOMAIN]
}

export function isOpenedVerticalDomain(code) {
  return OPENED_VERTICAL_CODES.includes(code)
}

export function normalizeOpenedDomainCode(code) {
  return isOpenedVerticalDomain(code) ? code : DEFAULT_DOMAIN.code
}

export function filterOpenedDomains(domains = []) {
  const normalized = normalizeDomains(domains)
  const domainMap = normalized.reduce((map, domain) => {
    map[domain.code] = domain
    return map
  }, {})

  return OPENED_VERTICAL_CODES.map(code => {
    const hit = domainMap[code]
    return {
      code,
      text: (hit && hit.text) || OPENED_VERTICAL_LABELS[code] || DEFAULT_DOMAIN.text
    }
  })
}

export function getCurrentDomainCode() {
  return normalizeOpenedDomainCode(storage.get(DOMAIN_STORAGE_KEY) || DEFAULT_DOMAIN.code)
}

export function setCurrentDomainCode(code) {
  storage.set(DOMAIN_STORAGE_KEY, normalizeOpenedDomainCode(code || DEFAULT_DOMAIN.code))
}

export function resolveCurrentDomain(domains = [], preferredCode = getCurrentDomainCode()) {
  const normalized = filterOpenedDomains(domains)
  const matched = normalized.find(domain => domain.code === normalizeOpenedDomainCode(preferredCode)) || normalized[0]
  setCurrentDomainCode(matched.code)
  return matched
}

export function getDomainModuleEntryPath(basePath, domainCode = getCurrentDomainCode(), permissionList = []) {
  const code = normalizeOpenedDomainCode(domainCode || DEFAULT_DOMAIN.code)
  switch (basePath) {
    case '/vertical-user':
      return `/vertical-user/${code}`
    case '/vertical-scenario-dev':
      return `/vertical-scenario-dev/${code}`
    case '/vertical-ms':
      return `/vertical-ms/${code}`
    case '/vertical-meta-app':
      return `/vertical-atom-app/${code}`
    case '/evaluation':
      if (permissionList.includes('admin') || permissionList.includes('publisher')) {
        return `/evaluation/${code}/technology`
      }
      return `/evaluation/${code}/emulation`
    case '/operation':
      if (permissionList.includes('publisher')) {
        return `/operation/${code}/container-status`
      }
      if (permissionList.includes('admin')) {
        return `/operation/${code}/container-manage`
      }
      return `/operation/${code}/container-status`
    default:
      return basePath
  }
}

export function getDefaultLandingPath() {
  return DEFAULT_LANDING_PATH
}

export function replaceDomainInPath(path, domainCode, permissionList = []) {
  if (!path || !domainCode) {
    return path
  }
  const code = normalizeOpenedDomainCode(domainCode)

  const rules = [
    { pattern: /^\/vertical-user\/[^/]+/, replacement: `/vertical-user/${code}` },
    { pattern: /^\/vertical-scenario-dev\/[^/]+/, replacement: `/vertical-scenario-dev/${code}` },
    { pattern: /^\/vertical-ms\/[^/]+/, replacement: `/vertical-ms/${code}` },
    { pattern: /^\/vertical-atom-app\/[^/]+/, replacement: `/vertical-atom-app/${code}` },
    { pattern: /^\/evaluation\/[^/]+/, replacement: `/evaluation/${code}` },
    { pattern: /^\/operation\/[^/]+/, replacement: `/operation/${code}` }
  ]

  for (const rule of rules) {
    if (rule.pattern.test(path)) {
      return path.replace(rule.pattern, rule.replacement)
    }
  }

  const topLevelRule = [
    '/vertical-user',
    '/vertical-scenario-dev',
    '/vertical-ms',
    '/vertical-meta-app',
    '/evaluation',
    '/operation'
  ].find(basePath => path === basePath)

  return topLevelRule ? getDomainModuleEntryPath(topLevelRule, code, permissionList) : path
}

export function isDomainRoutedPath(path) {
  return [
    /^\/vertical-user(\/|$)/,
    /^\/vertical-scenario-dev(\/|$)/,
    /^\/vertical-ms(\/|$)/,
    /^\/vertical-atom-app(\/|$)/,
    /^\/vertical-meta-app(\/|$)/,
    /^\/evaluation(\/|$)/,
    /^\/operation(\/|$)/
  ].some(pattern => pattern.test(path || ''))
}

export function projectDomainMenus(menus = [], domainCode = getCurrentDomainCode(), permissionList = []) {
  const code = normalizeOpenedDomainCode(domainCode)
  return menus.map(menu => {
    if (!menu || !menu.path) {
      return menu
    }

    if (SINGLE_DOMAIN_MENU_PATHS.includes(menu.path)) {
      const entryPath = getDomainModuleEntryPath(menu.path, code, permissionList)
      const selectedDomainRoute = (menu.children || []).find(child => child.path === entryPath) || (menu.children || [])[0]
      const projectedMenu = {
        ...menu,
        path: selectedDomainRoute ? selectedDomainRoute.path : entryPath,
        name: selectedDomainRoute ? selectedDomainRoute.name : menu.name,
        redirect: entryPath
      }
      delete projectedMenu.children
      delete projectedMenu.hideChildrenInMenu
      return projectedMenu
    }

    if (menu.path === '/evaluation' || menu.path === '/operation') {
      const domainPath = `/${menu.path.split('/')[1]}/${code}`
      const selectedDomainRoute = (menu.children || []).find(child => child.path === domainPath) || (menu.children || [])[0]
      return {
        ...menu,
        redirect: getDomainModuleEntryPath(menu.path, code, permissionList),
        children: selectedDomainRoute && selectedDomainRoute.children ? selectedDomainRoute.children : []
      }
    }

    return menu
  })
}
