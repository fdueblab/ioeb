import config from '@/config/defaultSettings'

export const setDocumentTitle = function (title) {
  document.title = title
  const ua = navigator.userAgent
  // eslint-disable-next-line
  const regex = /\bMicroMessenger\/([\d\.]+)/
  if (regex.test(ua) && /ip(hone|od|ad)/i.test(ua)) {
    const i = document.createElement('iframe')
    i.src = '/favicon.ico'
    i.style.display = 'none'
    i.onload = function () {
      setTimeout(function () {
        i.remove()
      }, 9)
    }
    document.body.appendChild(i)
  }
}

export const domTitle = config.title
export const pageTitleBrand = config.pageTitleBrand || '算法模型众智工场'

export const buildPageDocumentTitle = function (menuTitle) {
  const label = (menuTitle || '').trim()
  if (!label) {
    return domTitle
  }
  return `${pageTitleBrand}#${label}`
}
