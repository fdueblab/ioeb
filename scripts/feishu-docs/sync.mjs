#!/usr/bin/env node

import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  contentHash,
  extractTitle,
  findImageRefs,
  findLocalImageRefs,
  markdownPathFromRoute,
  normalizeMarkdownForFeishu
} from './transform-markdown.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const docsRoot = path.join(repoRoot, 'docs')
const syncConfigPath = path.join(docsRoot, 'feishu-sync.json')
const vitePressConfigPath = path.join(docsRoot, '.vitepress/config.mjs')
const docsRequire = createRequire(path.join(docsRoot, 'package.json'))
const textRenderer = 'drive-import-v1'
const imageRenderer = 'docx-blocks-v1'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const refreshHashes = args.has('--refresh-hashes')
const writeMap = args.has('--write-map') || refreshHashes
const strictImages = args.has('--strict-images')

main().catch((error) => {
  console.error(error?.stack || String(error))
  process.exit(1)
})

async function main() {
  const config = await readJson(syncConfigPath)
  const desiredDocuments = await loadDesiredDocuments(config)
  const localDocs = await loadLocalDocuments(config, desiredDocuments)
  const localImageRefs = localDocs.flatMap((doc) => doc.localImageRefs)

  if (strictImages && localImageRefs.length > 0) {
    console.error(formatLocalImageError(localImageRefs))
    process.exit(2)
  }

  if (refreshHashes) {
    refreshConfigHashes(config, localDocs)
    await writeJson(syncConfigPath, config)
    console.log(`Refreshed ${localDocs.length} document hashes in docs/feishu-sync.json`)
    if (localImageRefs.length > 0) {
      console.log(`Found ${localImageRefs.length} local image references; these should be migrated to COS next.`)
    }
    return
  }

  const plan = buildPlan(config, localDocs)
  printPlan(plan, localImageRefs)

  if (dryRun) return

  const client = await createFeishuClient(config)
  await ensureGroups(client, config, plan)
  await applyPlan(client, config, plan)

  if (writeMap || plan.some((item) => item.action !== 'skip')) {
    await writeJson(syncConfigPath, config)
  }
}

async function loadDesiredDocuments(config) {
  const vitepressConfig = await import(`${pathToFileURL(vitePressConfigPath).href}?t=${Date.now()}`)
  const sidebar = vitepressConfig.default?.themeConfig?.sidebar?.['/guide/'] || []
  const desired = []

  for (const entry of config.fixedDocuments || []) {
    desired.push({ file: entry.file, group: entry.group || 'root', order: desired.length })
  }

  for (const group of sidebar) {
    for (const item of group.items || []) {
      desired.push({
        file: markdownPathFromRoute(item.link),
        groupTitle: group.text,
        order: desired.length
      })
    }
  }

  for (const entry of config.trailingDocuments || []) {
    desired.push({ file: entry.file, group: entry.group || 'root', order: desired.length })
  }

  return desired
}

async function loadLocalDocuments(config, desiredDocuments) {
  const docs = []
  for (const desired of desiredDocuments) {
    const absPath = path.join(docsRoot, desired.file)
    const markdown = await fs.readFile(absPath, 'utf8')
    const transformed = normalizeMarkdownForFeishu(markdown, desired.file, {
      siteBaseUrl: config.siteBaseUrl,
      imageBaseUrl: config.imageBaseUrl
    })
    const title = extractTitle(markdown, path.basename(desired.file, '.md'))
    const groupKey = desired.group || groupKeyForTitle(config, desired.groupTitle)
    const imageRefs = findImageRefs(transformed, desired.file)
    const renderer = imageRefs.length > 0 ? imageRenderer : textRenderer
    docs.push({
      ...desired,
      group: groupKey,
      title,
      markdown,
      transformed,
      renderer,
      hash: contentHash(renderer === imageRenderer ? `${renderer}\n${transformed}` : transformed),
      imageRefs,
      localImageRefs: findLocalImageRefs(markdown, desired.file)
    })
  }
  return docs
}

function buildPlan(config, localDocs) {
  return localDocs.map((doc) => {
    const existing = config.documents?.[doc.file]
    if (!existing) return { action: 'create', doc }
    if (existing.contentHash !== doc.hash) return { action: 'replace', doc, existing }
    return { action: 'skip', doc, existing }
  })
}

function refreshConfigHashes(config, localDocs) {
  config.documents ||= {}
  for (const doc of localDocs) {
    const current = config.documents[doc.file] || {}
    config.documents[doc.file] = {
      ...current,
      title: doc.title,
      group: doc.group,
      renderer: doc.renderer,
      contentHash: doc.hash
    }
  }
}

async function ensureGroups(client, config, plan) {
  const neededGroups = new Set(plan.filter((item) => item.action !== 'skip').map((item) => item.doc.group))
  for (const groupKey of neededGroups) {
    if (groupKey === 'root') continue
    const group = config.groups?.[groupKey]
    if (!group) {
      throw new Error(`Missing group mapping for ${groupKey}. Add it to docs/feishu-sync.json first.`)
    }
    if (group.nodeToken) continue

    const created = await client.createWikiNode({
      title: group.title,
      parentNodeToken: config.root.nodeToken
    })
    group.nodeToken = created.node_token
    group.url = created.url
  }
}

async function applyPlan(client, config, plan) {
  config.documents ||= {}
  const archive = await ensureArchiveGroup(client, config)

  for (const item of plan) {
    if (item.action === 'skip') continue

    const parentNodeToken = parentTokenFor(config, item.doc.group)
    console.log(`${item.action}: ${item.doc.file} -> ${item.doc.title}`)

    const imported = item.doc.renderer === imageRenderer
      ? await client.createDocxFromMarkdown(item.doc.title, item.doc.transformed)
      : await client.importMarkdown(item.doc.title, item.doc.transformed)
    const node = await client.moveDocToWiki({
      title: item.doc.title,
      objToken: imported.objToken,
      parentNodeToken
    })

    if (item.existing?.nodeToken) {
      const archivedTitle = `${item.existing.title || item.doc.title}（归档 ${timestamp()}）`
      await client.updateWikiTitle(item.existing.nodeToken, archivedTitle)
      await client.moveWikiNode(item.existing.nodeToken, archive.nodeToken)
    }

    config.documents[item.doc.file] = {
      title: item.doc.title,
      group: item.doc.group,
      nodeToken: node.node_token,
      objToken: node.obj_token || imported.objToken,
      url: node.url,
      renderer: item.doc.renderer,
      contentHash: item.doc.hash
    }
  }
}

async function ensureArchiveGroup(client, config) {
  config.archive ||= { title: '同步归档' }
  if (config.archive.nodeToken) return config.archive
  const node = await client.createWikiNode({
    title: config.archive.title,
    parentNodeToken: config.root.nodeToken
  })
  config.archive.nodeToken = node.node_token
  config.archive.url = node.url
  return config.archive
}

async function createFeishuClient(config) {
  const appId = process.env.FEISHU_APP_ID
  const appSecret = process.env.FEISHU_APP_SECRET
  const explicitToken = process.env.FEISHU_USER_ACCESS_TOKEN || process.env.FEISHU_ACCESS_TOKEN
  const userRefreshToken = process.env.FEISHU_USER_REFRESH_TOKEN

  if (!explicitToken && !userRefreshToken && (!appId || !appSecret)) {
    throw new Error(
      'Missing Feishu credentials. Set FEISHU_APP_ID and FEISHU_APP_SECRET, FEISHU_USER_REFRESH_TOKEN, or FEISHU_USER_ACCESS_TOKEN.'
    )
  }

  let accessToken = explicitToken
  if (!accessToken && userRefreshToken) {
    if (!appId || !appSecret) {
      throw new Error('FEISHU_USER_REFRESH_TOKEN requires FEISHU_APP_ID and FEISHU_APP_SECRET.')
    }
    const tokenResponse = await requestJson(config.larkDomain, '/open-apis/authen/v2/oauth/token', {
      method: 'POST',
      body: {
        grant_type: 'refresh_token',
        client_id: appId,
        client_secret: appSecret,
        refresh_token: userRefreshToken
      }
    })
    accessToken = tokenResponse.access_token
    if (!accessToken) {
      throw new Error('Feishu OAuth refresh succeeded but access_token is missing.')
    }
  }

  if (!accessToken) {
    const tokenResponse = await requestJson(config.larkDomain, '/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      body: { app_id: appId, app_secret: appSecret }
    })
    accessToken = tokenResponse.tenant_access_token
  }

  return new FeishuClient({
    domain: config.larkDomain,
    spaceId: process.env.FEISHU_SPACE_ID || config.spaceId,
    accessToken
  })
}

class FeishuClient {
  constructor({ domain, spaceId, accessToken }) {
    this.domain = domain.replace(/\/$/, '')
    this.spaceId = spaceId
    this.accessToken = accessToken
  }

  async createWikiNode({ title, parentNodeToken }) {
    const data = await this.request(`/open-apis/wiki/v2/spaces/${this.spaceId}/nodes`, {
      method: 'POST',
      body: {
        obj_type: 'docx',
        node_type: 'origin',
        title,
        ...(parentNodeToken ? { parent_node_token: parentNodeToken } : {})
      }
    })
    return data.node
  }

  async importMarkdown(title, markdown) {
    const file = new File([markdown], 'docx.md', { type: 'text/markdown' })
    const form = new FormData()
    form.append('file_name', 'docx.md')
    form.append('parent_type', 'ccm_import_open')
    form.append('parent_node', '/')
    form.append('size', String(Buffer.byteLength(markdown, 'utf8')))
    form.append('file', file)
    form.append('extra', JSON.stringify({ obj_type: 'docx', file_extension: 'md' }))

    const upload = await this.request('/open-apis/drive/v1/medias/upload_all', {
      method: 'POST',
      form
    })

    const task = await this.request('/open-apis/drive/v1/import_tasks', {
      method: 'POST',
      body: {
        file_extension: 'md',
        file_name: title.slice(0, 27),
        file_token: upload.file_token,
        type: 'docx',
        point: { mount_type: 1, mount_key: '' }
      }
    })

    for (let i = 0; i < 90; i += 1) {
      const status = await this.request(`/open-apis/drive/v1/import_tasks/${task.ticket}`)
      const result = status.result
      if (result?.job_status === 0) {
        const objToken = result.token || result.obj_token || result.url?.match(/\/docx\/([^/?#]+)/)?.[1]
        if (!objToken) throw new Error(`Import succeeded but obj token is missing for ${title}`)
        return { objToken, result }
      }
      if (result && ![1, 2].includes(result.job_status)) {
        throw new Error(`Import failed for ${title}: ${JSON.stringify(status)}`)
      }
      await sleep(1000)
    }
    throw new Error(`Import timed out for ${title}`)
  }

  async createDocxFromMarkdown(title, markdown) {
    const { FeishuMarkdown } = await loadFeishuMarkdown()
    const converter = new FeishuMarkdown({
      appId: 'user-oauth',
      appSecret: 'user-oauth',
      baseUrl: this.domain,
      timeout: 60000,
      retryTimes: 5,
      retryDelay: 1000
    })

    converter.client.getAccessToken = async () => this.accessToken
    const result = await converter.convert(markdown, {
      title,
      imageBaseDir: docsRoot,
      downloadImages: true,
      mermaid: { enabled: false }
    })

    if (!result.documentId) {
      throw new Error(`Docx block import succeeded but document ID is missing for ${title}`)
    }
    return { objToken: result.documentId, result }
  }

  async moveDocToWiki({ title, objToken, parentNodeToken }) {
    const moved = await this.request(`/open-apis/wiki/v2/spaces/${this.spaceId}/nodes/move_docs_to_wiki`, {
      method: 'POST',
      body: {
        parent_wiki_token: parentNodeToken,
        obj_type: 'docx',
        obj_token: objToken,
        apply: true
      }
    })

    if (moved.node?.node_token) return moved.node

    for (let i = 0; i < 120; i += 1) {
      const children = await this.listWikiChildren(parentNodeToken)
      const node = children.find((child) => child.title === title)
      if (node) return node
      await sleep(1000)
    }
    throw new Error(`Moving ${title} to wiki timed out`)
  }

  async listWikiChildren(parentNodeToken) {
    const items = []
    let pageToken
    do {
      const search = new URLSearchParams({ page_size: '50' })
      if (parentNodeToken) search.set('parent_node_token', parentNodeToken)
      if (pageToken) search.set('page_token', pageToken)
      const data = await this.request(`/open-apis/wiki/v2/spaces/${this.spaceId}/nodes?${search}`)
      items.push(...(data.items || []))
      pageToken = data.page_token
      if (!data.has_more) break
    } while (pageToken)
    return items
  }

  async updateWikiTitle(nodeToken, title) {
    await this.request(`/open-apis/wiki/v2/spaces/${this.spaceId}/nodes/${nodeToken}/update_title`, {
      method: 'POST',
      body: { title }
    })
  }

  async moveWikiNode(nodeToken, targetParentToken) {
    await this.request(`/open-apis/wiki/v2/spaces/${this.spaceId}/nodes/${nodeToken}/move`, {
      method: 'POST',
      body: {
        target_parent_token: targetParentToken,
        target_space_id: this.spaceId
      }
    })
  }

  async request(apiPath, options = {}) {
    return requestJson(this.domain, apiPath, {
      ...options,
      accessToken: this.accessToken
    })
  }
}

async function requestJson(domain, apiPath, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.accessToken) headers.set('Authorization', `Bearer ${options.accessToken}`)

  let body
  if (options.form) {
    body = options.form
  } else if (options.body) {
    headers.set('Content-Type', 'application/json; charset=utf-8')
    body = JSON.stringify(options.body)
  }

  const response = await fetch(`${domain.replace(/\/$/, '')}${apiPath}`, {
    method: options.method || 'GET',
    headers,
    body
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.code !== 0) {
    throw new Error(`Feishu API failed: ${response.status} ${JSON.stringify(payload)}`)
  }
  return payload.data || payload
}

function parentTokenFor(config, groupKey) {
  if (groupKey === 'root') return config.root.nodeToken
  const group = config.groups?.[groupKey]
  if (!group?.nodeToken) throw new Error(`Missing node token for group ${groupKey}`)
  return group.nodeToken
}

function groupKeyForTitle(config, title) {
  const existing = Object.entries(config.groups || {}).find(([, group]) => group.title === title)
  if (existing) return existing[0]
  return slugify(title)
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

function printPlan(plan, localImageRefs) {
  const counts = plan.reduce((acc, item) => {
    acc[item.action] = (acc[item.action] || 0) + 1
    return acc
  }, {})
  console.log(`Feishu docs sync plan: ${JSON.stringify(counts)}`)

  for (const item of plan) {
    if (item.action === 'skip') continue
    console.log(`- ${item.action}: ${item.doc.file} (${item.doc.title})`)
  }

  if (localImageRefs.length > 0) {
    console.log(`Local image references detected: ${localImageRefs.length}`)
  }
}

async function loadFeishuMarkdown() {
  try {
    const resolved = docsRequire.resolve('feishu-markdown')
    return import(pathToFileURL(resolved).href)
  } catch (error) {
    throw new Error(
      `Missing docs dependency feishu-markdown. Run "npm --prefix docs install --ignore-scripts --package-lock=false" before syncing. ${error.message}`
    )
  }
}

function formatLocalImageError(refs) {
  return [
    `Found ${refs.length} local image references. Migrate them to COS before strict sync:`,
    ...refs.map((ref) => `- ${ref.relFile}: ${ref.url}`)
  ].join('\n')
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function timestamp() {
  return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
