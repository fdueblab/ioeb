<template>
  <span v-if="domains.length">
    <a-dropdown placement="bottomRight" :trigger="['click']">
      <span class="domain-selector">
        <a-icon type="cluster" />
        <span class="domain-selector__text">{{ currentDomainText }}</span>
        <a-icon type="down" />
      </span>
      <template v-slot:overlay>
        <a-menu :selected-keys="[currentDomainCode]" @click="handleSelect">
          <a-menu-item v-for="domain in domains" :key="domain.code">
            {{ domain.text }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import { loadDict } from '@/utils/dictionaryCache'
import {
  DEFAULT_DOMAIN,
  isDomainRoutedPath,
  replaceDomainInPath,
  resolveCurrentDomain
} from '@/utils/domainContext'

export default {
  name: 'DomainSelector',
  data () {
    return {
      domains: [DEFAULT_DOMAIN]
    }
  },
  computed: {
    ...mapGetters(['currentDomain', 'currentDomainCode', 'roles']),
    currentDomainText () {
      const matched = this.domains.find(domain => domain.code === this.currentDomainCode)
      return (matched && matched.text) || (this.currentDomain && this.currentDomain.text) || DEFAULT_DOMAIN.text
    },
    permissionList () {
      return (this.roles && this.roles.permissionList) || []
    }
  },
  created () {
    this.loadDomains()
  },
  methods: {
    async loadDomains () {
      const domains = await loadDict('domain', [DEFAULT_DOMAIN])
      this.domains = domains && domains.length ? domains : [DEFAULT_DOMAIN]
      const currentDomain = resolveCurrentDomain(this.domains, this.currentDomainCode)
      this.$store.dispatch('SetCurrentDomain', currentDomain)
    },
    handleSelect ({ key }) {
      if (!key || key === this.currentDomainCode) {
        return
      }

      const domain = this.domains.find(item => item.code === key)
      if (!domain) {
        return
      }

      this.$store.dispatch('SetCurrentDomain', domain)
      if (!isDomainRoutedPath(this.$route.path)) {
        return
      }

      const nextPath = replaceDomainInPath(this.$route.path, domain.code, this.permissionList)
      if (nextPath && nextPath !== this.$route.path) {
        this.$router.push({ path: nextPath, query: this.$route.query }).catch(() => {})
      }
    }
  }
}
</script>

<style lang="less" scoped>
.domain-selector {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  max-width: 220px;
  padding: 0 12px;
  cursor: pointer;
  white-space: nowrap;
}

.domain-selector__text {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
