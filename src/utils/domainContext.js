import storage from 'store'

export const DOMAIN_STORAGE_KEY = 'ioeb_current_domain'
export const DEFAULT_DOMAIN = {
  code: 'aml',
  text: '跨境支付AI监测'
}
export const DEFAULT_LANDING_PATH = '/dashboard/workplace'

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

export function getCurrentDomainCode() {
  return storage.get(DOMAIN_STORAGE_KEY) || DEFAULT_DOMAIN.code
}

export function setCurrentDomainCode(code) {
  storage.set(DOMAIN_STORAGE_KEY, code || DEFAULT_DOMAIN.code)
}

export function resolveCurrentDomain(domains = [], preferredCode = getCurrentDomainCode()) {
  const normalized = normalizeDomains(domains)
  const matched = normalized.find(domain => domain.code === preferredCode) || normalized[0]
  setCurrentDomainCode(matched.code)
  return matched
}

export function getDomainModuleEntryPath(basePath, domainCode = getCurrentDomainCode(), permissionList = []) {
  const code = domainCode || DEFAULT_DOMAIN.code
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

  const rules = [
    { pattern: /^\/vertical-user\/[^/]+/, replacement: `/vertical-user/${domainCode}` },
    { pattern: /^\/vertical-scenario-dev\/[^/]+/, replacement: `/vertical-scenario-dev/${domainCode}` },
    { pattern: /^\/vertical-ms\/[^/]+/, replacement: `/vertical-ms/${domainCode}` },
    { pattern: /^\/vertical-atom-app\/[^/]+/, replacement: `/vertical-atom-app/${domainCode}` },
    { pattern: /^\/evaluation\/[^/]+/, replacement: `/evaluation/${domainCode}` },
    { pattern: /^\/operation\/[^/]+/, replacement: `/operation/${domainCode}` }
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

  return topLevelRule ? getDomainModuleEntryPath(topLevelRule, domainCode, permissionList) : path
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
  return menus.map(menu => {
    if (!menu || !menu.path) {
      return menu
    }

    if (SINGLE_DOMAIN_MENU_PATHS.includes(menu.path)) {
      const entryPath = getDomainModuleEntryPath(menu.path, domainCode, permissionList)
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
      const domainPath = `/${menu.path.split('/')[1]}/${domainCode}`
      const selectedDomainRoute = (menu.children || []).find(child => child.path === domainPath) || (menu.children || [])[0]
      return {
        ...menu,
        redirect: getDomainModuleEntryPath(menu.path, domainCode, permissionList),
        children: selectedDomainRoute && selectedDomainRoute.children ? selectedDomainRoute.children : []
      }
    }

    return menu
  })
}
