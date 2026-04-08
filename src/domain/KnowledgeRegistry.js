/**
 * 领域知识注册表：内置 profile + 可插拔 provider，与 UI 解耦。
 */

import { builtinProfilesById } from './profiles'

/** @type {Map<string, (ctx: object) => object>} */
const providers = new Map()

/**
 * 注册或覆盖某 domain 的知识构造器（后注册覆盖先注册）。
 * @param {string} domainId
 * @param {(ctx: object) => object} fn
 */
export function registerProvider(domainId, fn) {
  if (!domainId || typeof fn !== 'function') return
  providers.set(String(domainId), fn)
}

export function unregisterProvider(domainId) {
  providers.delete(String(domainId))
}

export function mergeKnowledge(base, patch) {
  if (!base) return patch ? JSON.parse(JSON.stringify(patch)) : {}
  if (!patch) return JSON.parse(JSON.stringify(base))
  return deepMerge(JSON.parse(JSON.stringify(base)), patch)
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object') return base
  const out = Array.isArray(base) ? [...base] : { ...base }
  Object.keys(patch).forEach((k) => {
    const pv = patch[k]
    const bv = out[k]
    if (pv && typeof pv === 'object' && !Array.isArray(pv) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
      out[k] = deepMerge(bv, pv)
    } else {
      out[k] = pv
    }
  })
  return out
}

function normalizeDomainId(domain) {
  const d = (domain && String(domain).trim()) || 'generic'
  return builtinProfilesById[d] ? d : 'generic'
}

/**
 * @param {string} [domain]
 * @param {{ appId?: string, appName?: string, scenarioDescription?: string, serviceNames?: string[], mode?: string }} [context]
 * @returns {object}
 */
export function getKnowledge(domain, context = {}) {
  const id = normalizeDomainId(domain)
  const base = builtinProfilesById[id] || builtinProfilesById.generic
  const baseClone = JSON.parse(JSON.stringify(base))
  let merged = baseClone

  const provider = providers.get(id)
  if (provider) {
    const extra = provider(context) || {}
    merged = deepMerge(baseClone, extra)
  }

  merged.meta = {
    resolvedDomain: id,
    requestedDomain: domain || 'generic',
    appId: context.appId,
    appName: context.appName,
    mode: context.mode,
    serviceCount: Array.isArray(context.serviceNames) ? context.serviceNames.length : undefined
  }

  if (context.scenarioDescription) {
    merged.scenarioContext = {
      excerpt:
        context.scenarioDescription.length > 400
          ? `${context.scenarioDescription.slice(0, 400)}…`
          : context.scenarioDescription
    }
  }

  return merged
}
