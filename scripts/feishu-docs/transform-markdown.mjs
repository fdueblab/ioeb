import crypto from 'node:crypto'
import path from 'node:path'

const containerLabels = {
  tip: '提示',
  warning: '注意',
  danger: '重要',
  info: '说明',
  details: '详情'
}

export function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m)
  return (match ? match[1].trim() : fallback).replace(
    /^https:\/\/vitepress\.dev\/reference\/default-theme-home-page$/,
    '首页'
  )
}

export function contentHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

export function markdownPathFromRoute(route) {
  const cleanRoute = route.split('#')[0].replace(/^\//, '').replace(/\/$/, '/index')
  if (!cleanRoute) return 'index.md'
  return cleanRoute.endsWith('.md') ? cleanRoute : `${cleanRoute}.md`
}

export function normalizeMarkdownForFeishu(markdown, relFile, options = {}) {
  const siteBaseUrl = options.siteBaseUrl || 'https://fdueblab.cn/docs'
  const imageBaseUrl = options.imageBaseUrl || siteBaseUrl
  let output = transformVitePressContainers(markdown)

  output = output.replace(/(!\[[^\]]*\]\()\/images\/([^)]+)(\))/g, (_, prefix, imagePath, suffix) => {
    return `${prefix}${joinUrl(imageBaseUrl, 'images', encodePath(imagePath))}${suffix}`
  })

  output = output.replace(/(!\[[^\]]*\]\()(\.\.?\/[^)]+)(\))/g, (_, prefix, imagePath, suffix) => {
    const resolved = path.posix.normalize(
      path.posix.join('/', path.posix.dirname(relFile.replaceAll('\\', '/')), imagePath)
    )
    if (!resolved.startsWith('/public/images/')) {
      return `${prefix}${imagePath}${suffix}`
    }
    return `${prefix}${joinUrl(imageBaseUrl, encodePath(resolved.replace(/^\/public\//, '')))}${suffix}`
  })

  output = output.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (_, text, target) => {
    return `[${text}](${normalizeLinkTarget(target, relFile, siteBaseUrl)})`
  })

  return output
}

export function findLocalImageRefs(markdown, relFile) {
  const refs = []
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match
  while ((match = imageRegex.exec(markdown))) {
    const [, alt, url] = match
    if (/^(https?:|data:)/.test(url)) continue
    refs.push({
      alt,
      url,
      relFile,
      normalizedPath: normalizeLocalImagePath(url, relFile)
    })
  }
  return refs
}

function transformVitePressContainers(markdown) {
  const lines = markdown.split(/\r?\n/)
  const out = []
  let inContainer = false

  for (const line of lines) {
    const open = line.match(/^:::\s*(tip|warning|danger|info|details)\s*(.*)$/)
    if (open) {
      inContainer = true
      const label = containerLabels[open[1]]
      const title = open[2].trim()
      out.push(`> **${label}${title ? `：${title}` : ''}**`)
      out.push('>')
      continue
    }

    if (inContainer && /^:::\s*$/.test(line)) {
      inContainer = false
      out.push('')
      continue
    }

    out.push(inContainer ? `> ${line}` : line)
  }

  return out.join('\n')
}

function normalizeLinkTarget(target, relFile, siteBaseUrl) {
  if (!target || /^(https?:|mailto:|tel:|#)/.test(target)) return target

  const [targetPath, hash = ''] = target.split('#')
  let route
  if (targetPath.startsWith('/')) {
    route = targetPath
  } else {
    route = path.posix.normalize(path.posix.join('/', path.posix.dirname(relFile.replaceAll('\\', '/')), targetPath))
  }

  route = route.replace(/\.md$/, '').replace(/\/index$/, '/')
  if (route === '/.') route = '/'

  return `${siteBaseUrl.replace(/\/$/, '')}${route}${hash ? `#${hash}` : ''}`
}

function normalizeLocalImagePath(url, relFile) {
  if (url.startsWith('/')) return url
  return path.posix.normalize(path.posix.join('/', path.posix.dirname(relFile.replaceAll('\\', '/')), url))
}

function joinUrl(base, ...parts) {
  const cleanBase = base.replace(/\/$/, '')
  const cleanParts = parts
    .filter(Boolean)
    .map((part) => String(part).replace(/^\/+/, '').replace(/\/+$/, ''))
  return [cleanBase, ...cleanParts].join('/')
}

function encodePath(value) {
  return value
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/')
}
