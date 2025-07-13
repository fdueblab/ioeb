<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <keep-alive include="AmlMonitor">
        <router-view />
      </keep-alive>
    </div>
  </a-config-provider>
</template>

<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'

export default {
  data() {
    return {}
  },
  computed: {
    locale() {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      if (title) {
        const pageTitle = i18nRender(title)
        const isAmlPage = this.$route.path.includes('/aml/')
        const isAmlSystemTitle = pageTitle.includes('跨境贸易支付监管系统')

        // 如果是AML相关页面且标题包含"跨境贸易支付监管系统"，只显示页面标题
        if (isAmlPage && isAmlSystemTitle) {
          setDocumentTitle(pageTitle)
        } else {
          setDocumentTitle(`${pageTitle} - ${domTitle}`)
        }
      }

      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    }
  }
}
</script>
