#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findLocalImageRefs } from './transform-markdown.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const docsRoot = path.join(repoRoot, 'docs')
const publicRoot = path.join(docsRoot, 'public')

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const rewrite = args.has('--rewrite')
const deleteLocal = args.has('--delete-local')

main().catch((error) => {
  console.error(error?.stack || String(error))
  process.exit(1)
})

async function main() {
  const config = await readJson(path.join(docsRoot, 'feishu-sync.json'))
  const markdownFiles = await findMarkdownFiles(docsRoot)
  const imageRefs = []

  for (const file of markdownFiles) {
    const relFile = path.relative(docsRoot, file).replaceAll(path.sep, '/')
    const markdown = await fs.readFile(file, 'utf8')
    for (const ref of findLocalImageRefs(markdown, relFile)) {
      if (!ref.normalizedPath.startsWith('/images/')) continue
      imageRefs.push({
        ...ref,
        file,
        localPath: path.join(publicRoot, ref.normalizedPath.replace(/^\//, '')),
        cosKey: joinKey('docs', ref.normalizedPath.replace(/^\//, '')),
        cosUrl: joinUrl(config.imageBaseUrl, encodeKey(ref.normalizedPath.replace(/^\/images\//, 'images/')))
      })
    }
  }

  if (imageRefs.length === 0) {
    console.log('No local image references found.')
    return
  }

  console.log(`Found ${imageRefs.length} local image references.`)
  for (const ref of imageRefs) {
    console.log(`- ${ref.relFile}: ${ref.url} -> ${ref.cosUrl}`)
  }

  if (dryRun) return

  const cos = createCosClient()
  for (const ref of imageRefs) {
    await fs.access(ref.localPath)
    await cos.putObject(ref.cosKey, await fs.readFile(ref.localPath), contentTypeFor(ref.localPath))
    console.log(`uploaded: ${ref.cosKey}`)
  }

  if (rewrite) {
    await rewriteMarkdownFiles(imageRefs)
  }

  if (deleteLocal) {
    for (const ref of imageRefs) {
      await fs.rm(ref.localPath)
      console.log(`deleted: ${path.relative(repoRoot, ref.localPath)}`)
    }
    await removeEmptyDirs(path.join(publicRoot, 'images'))
  }
}

function createCosClient() {
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY
  const bucket = process.env.COS_BUCKET || 'ioeb-1317429791'
  const region = process.env.COS_REGION || 'ap-shanghai'

  if (!secretId || !secretKey) {
    throw new Error('Missing COS credentials. Set TENCENT_SECRET_ID and TENCENT_SECRET_KEY.')
  }

  const host = `${bucket}.cos.${region}.myqcloud.com`

  return {
    async putObject(key, body, contentType) {
      const encodedPath = `/${encodeKey(key)}`
      const authorization = signCosRequest({
        method: 'put',
        pathname: `/${key}`,
        host,
        secretId,
        secretKey
      })
      const response = await fetch(`https://${host}${encodedPath}`, {
        method: 'PUT',
        headers: {
          Authorization: authorization,
          'Content-Type': contentType,
          Host: host
        },
        body
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`COS upload failed for ${key}: ${response.status} ${text}`)
      }
    }
  }
}

function signCosRequest({ method, pathname, host, secretId, secretKey }) {
  const now = Math.floor(Date.now() / 1000)
  const end = now + 600
  const keyTime = `${now};${end}`
  const headerString = `host=${host}\n`
  const httpString = `${method}\n${pathname}\n\n${headerString}`
  const stringToSign = `sha1\n${keyTime}\n${sha1(httpString)}\n`
  const signKey = hmacSha1(secretKey, keyTime)
  const signature = hmacSha1(signKey, stringToSign)

  return [
    'q-sign-algorithm=sha1',
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    'q-header-list=host',
    'q-url-param-list=',
    `q-signature=${signature}`
  ].join('&')
}

async function rewriteMarkdownFiles(imageRefs) {
  const refsByFile = new Map()
  for (const ref of imageRefs) {
    const refs = refsByFile.get(ref.file) || []
    refs.push(ref)
    refsByFile.set(ref.file, refs)
  }

  for (const [file, refs] of refsByFile.entries()) {
    let markdown = await fs.readFile(file, 'utf8')
    for (const ref of refs) {
      markdown = markdown.split(`](${ref.url})`).join(`](${ref.cosUrl})`)
    }
    await fs.writeFile(file, markdown, 'utf8')
    console.log(`rewritten: ${path.relative(repoRoot, file)}`)
  }
}

async function removeEmptyDirs(root) {
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => [])
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    await removeEmptyDirs(path.join(root, entry.name))
  }
  const remaining = await fs.readdir(root).catch(() => [])
  if (remaining.length === 0) {
    await fs.rmdir(root)
  }
}

async function findMarkdownFiles(root) {
  const files = []
  const entries = await fs.readdir(root, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.vitepress') continue
      files.push(...(await findMarkdownFiles(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.svg') return 'image/svg+xml'
  return 'application/octet-stream'
}

function joinKey(...parts) {
  return parts
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
}

function joinUrl(base, suffix) {
  return `${base.replace(/\/$/, '')}/${suffix.replace(/^\//, '')}`
}

function encodeKey(key) {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function sha1(value) {
  return crypto.createHash('sha1').update(value).digest('hex')
}

function hmacSha1(key, value) {
  return crypto.createHmac('sha1', key).update(value).digest('hex')
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}
