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
import { buildPageDocumentTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'

export default {
  data() {
    return {}
  },
  computed: {
    locale() {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && setDocumentTitle(buildPageDocumentTitle(i18nRender(title)))

      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    }
  }
}
</script>
