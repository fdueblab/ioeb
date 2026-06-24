<template>
  <div :class="wrpCls">
    <domain-selector :class="prefixCls" />
    <avatar-dropdown :menu="showMenu" :current-user="currentUser" :class="prefixCls" />
    <select-lang :class="prefixCls" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AvatarDropdown from './AvatarDropdown'
import DomainSelector from './DomainSelector'
import SelectLang from '@/components/SelectLang'
export default {
  name: 'RightContent',
  components: {
    AvatarDropdown,
    DomainSelector,
    SelectLang
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action'
    },
    isMobile: {
      type: Boolean,
      default: () => false
    },
    topMenu: {
      type: Boolean,
      required: true
    },
    theme: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      showMenu: true
    }
  },
  computed: {
    ...mapGetters(['nickname', 'avatar']),
    currentUser () {
      return {
        name: this.nickname,
        avatar: this.avatar
      }
    },
    wrpCls () {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-${(this.isMobile || !this.topMenu) ? 'light' : this.theme}`]: true
      }
    }
  }
}
</script>
