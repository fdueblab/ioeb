/**
 * 简历/背景材料 文本读取（前端）。
 *
 * - .txt / .md：直接读取
 * - .pdf：使用 pdfjs-dist（动态加载）
 * - .docx：使用 mammoth（动态加载）
 *
 * 若相应依赖未安装，会抛出可读错误，由调用方提示用户改用 txt 或手动填写。
 */

function readAsText (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result || '')
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function readAsArrayBuffer (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

async function readPdf (file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf')
  try {
    // 关闭 worker，使用主线程解析，避免 worker 路径配置问题
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''
  } catch (e) { /* ignore */ }
  const data = await readAsArrayBuffer(file)
  const loadingTask = pdfjsLib.getDocument({ data, disableWorker: true })
  const pdf = await loadingTask.promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(it => it.str).join(' ') + '\n'
  }
  return text
}

async function readDocx (file) {
  // 使用浏览器构建，避免 webpack5 解析 node 核心模块(path/fs)报错
  const mammoth = await import('mammoth/mammoth.browser')
  const arrayBuffer = await readAsArrayBuffer(file)
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value || ''
}

/**
 * 读取文件文本内容
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function readResumeText (file) {
  if (!file) return ''
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv')) {
    return readAsText(file)
  }
  if (name.endsWith('.pdf')) {
    return readPdf(file)
  }
  if (name.endsWith('.docx')) {
    return readDocx(file)
  }
  if (name.endsWith('.doc')) {
    throw new Error('暂不支持 .doc 旧格式，请转存为 .docx 或 .pdf 后重试')
  }
  // 兜底按文本读取
  return readAsText(file)
}

export default { readResumeText }
