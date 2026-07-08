/**
 * 课题演示：按 scenarioKey 预生成且缓存 BuildBundle 形状产物；运行时仅绑定 sessionId / 展示名。
 */

import { getMetaAppNodes } from './meta_apps_data'
import { buildTopicDemoArtifacts } from './topic_simulation_artifacts'
import {
  canonicalDemoInputForBundle,
  resolveTopicDemoAnalysisChoice,
  resolveTopicDemoKey,
  topicDemoBundleCacheKey
} from './topic_demo_route'

const bundleCache = new Map()

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value))
}

function servicesMetaFromFlow(flow) {
  return (flow.nodeList || [])
    .filter((node) => node && node.name !== 'metaAppAgent')
    .map((svc) => ({
      id: String(svc.id),
      name: svc.name,
      mcpUrl: svc.url || svc.mcpUrl || '',
      tools: svc.tools || [],
      isFake: !!(svc.isFake || svc.is_fake),
      mcpMethod: svc.mcpMethod || 'sse'
    }))
}

async function buildCanonicalBundle(scenarioKey, analysisChoice) {
  const userInput = canonicalDemoInputForBundle(scenarioKey, analysisChoice)
  const flow = await getMetaAppNodes('aml', userInput, analysisChoice)
  const cacheKey = topicDemoBundleCacheKey(scenarioKey, analysisChoice)
  const sessionId = `topic-demo-bundle-${cacheKey}`
  const packs = await buildTopicDemoArtifacts({
    sessionId,
    appName: flow.preName,
    appId: flow.name || 'meta-app-draft',
    scenarioParsed: flow.scenarioParsed,
    scenarioDescription: flow.scenarioSummary || flow.preDes || '',
    servicesMeta: servicesMetaFromFlow(flow),
    finalResult: { success: true }
  })
  bundleCache.set(cacheKey, packs)
  return packs
}

async function getCachedBundle(scenarioKey, analysisChoice) {
  const cacheKey = topicDemoBundleCacheKey(scenarioKey, analysisChoice)
  if (!bundleCache.has(cacheKey)) {
    await buildCanonicalBundle(scenarioKey, analysisChoice)
  }
  return bundleCache.get(cacheKey)
}

function bindBundleToSession(template, runtimeCtx) {
  const sessionId = runtimeCtx.sessionId
  const packs = cloneJson(template)
  packs.manifest.buildId = sessionId
  packs.manifest.artifactId = template.manifest.artifactId
  if (packs.manifest.ref) {
    Object.keys(packs.manifest.ref).forEach((key) => {
      if (typeof packs.manifest.ref[key] === 'string') {
        packs.manifest.ref[key] = packs.manifest.ref[key].replace(template.manifest.buildId, sessionId)
      }
    })
  }
  if (packs.trace && packs.trace.buildId) packs.trace.buildId = sessionId
  if (packs.artifact && runtimeCtx.appName) {
    packs.artifact.app = { ...(packs.artifact.app || {}), name: runtimeCtx.appName }
  }
  return packs
}

/**
 * @param {object} runtimeCtx buildStartPayload 字段 + sessionId
 */
export async function materializeTopicDemoBundle(runtimeCtx) {
  const scenarioKey = resolveTopicDemoKey(runtimeCtx)
  if (!scenarioKey) {
    throw new Error('非课题演示上下文，无法加载预生成产物')
  }
  const analysisChoice = resolveTopicDemoAnalysisChoice(runtimeCtx)
  const template = await getCachedBundle(scenarioKey, analysisChoice)
  return bindBundleToSession(template, runtimeCtx)
}

/** 测试 / 预热：按全部 canonical 样例预生成 */
export async function warmAllTopicDemoBundles() {
  const jobs = [
    ['pj1', null],
    ['pj2', null],
    ['pj4', null],
    ['pj_combo', 'pj1'],
    ['pj_combo', 'pj2']
  ]
  await Promise.all(jobs.map(([key, choice]) => buildCanonicalBundle(key, choice)))
}
