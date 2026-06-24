<template>
  <pro-layout
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :i18nRender="i18nRender"
    v-bind="settings"
  >
    <!-- 1.0.0+ 版本 pro-layout 提供 API，
          我们推荐使用这种方式进行 LOGO 和 title 自定义
    -->
    <template v-slot:menuHeaderRender>
      <div>
        <img src="@/assets/logo.svg" alt="" />
        <div class="tit">{{ title }}</div>
        <div class="subtit">{{ subTitle }}</div>
      </div>
    </template>
    <!-- 1.0.0+ 版本 pro-layout 提供 API,
          增加 Header 左侧内容区自定义
    -->
    <!-- <template v-slot:headerContentRender>
      <div>
        <a-tooltip title="刷新页面">
          <a-icon type="reload" style="font-size: 18px;cursor: pointer;" @click="() => { $message.info('只是一个DEMO') }" />
        </a-tooltip>
      </div>
    </template> -->

    <setting-drawer v-if="isDev" :settings="settings" @change="handleSettingChange">
      <div style="margin: 12px 0">This is SettingDrawer custom footer content.</div>
    </setting-drawer>
    <template v-slot:rightContentRender>
      <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile="isMobile" :theme="settings.theme" />
    </template>
    <router-view />
    <user-profile-survey :visible="surveyVisible" @close="surveyVisible = false" @done="handleSurveyDone" />
  </pro-layout>
</template>

<script>
import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { mapGetters, mapState } from 'vuex'
import { CONTENT_WIDTH_TYPE, SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'
import cloneDeep from 'lodash.clonedeep'

import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'
import UserProfileSurvey from '@/components/UserProfileSurvey'
import { consumeSurveyPromptPending, isSurveyDone } from '@/api/userProfile'
import { DEFAULT_LANDING_PATH, projectDomainMenus } from '@/utils/domainContext'
// import { asyncRouterMap } from '@/config/router.config.js'
export default {
  name: 'BasicLayout',
  components: {
    SettingDrawer,
    RightContent,
    UserProfileSurvey
  },
  data() {
    return {
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end
      // isDev: this.$route.query.isDev === 'true' || process.env.NODE_ENV === 'development' || process.env.VUE_APP_PREVIEW === 'true',
      isDev: this.$route.query.isDev === 'true',

      // 侧栏收起状态
      collapsed: false,
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // CONTENT_WIDTH_TYPE
        contentWidth: defaultSettings.layout === 'sidemenu' ? CONTENT_WIDTH_TYPE.Fluid : defaultSettings.contentWidth,
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,

        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},
      // 用户类型
      title: '面向垂域应用',
      subTitle: '的算法模型智能体平台',
      // 是否手机模式
      isMobile: false,
      // 登录后用户画像问卷弹窗
      surveyVisible: false
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: (state) => state.permission.addRouters
    }),
    ...mapGetters(['currentDomainCode', 'roles']),
    permissionList () {
      return (this.roles && this.roles.permissionList) || []
    },
    menus () {
      const routes = this.mainMenu.find((item) => item.path === '/')
      const children = cloneDeep((routes && routes.children) || [])
      return projectDomainMenus(children, this.currentDomainCode, this.permissionList)
    }
  },
  created() {
    // const username = localStorage.getItem('username')
    // if (username === 'user') {
    //   this.subTitle = '应用平台'
    // } else {
    //   this.subTitle = '研发与验证平台'
    // }
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
  },
  mounted() {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }
    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    if (process.env.NODE_ENV !== 'production' && process.env.VUE_APP_PREVIEW === 'true') {
      updateTheme(this.settings.primaryColor)
    }
    // 仅在登录成功后的首次进入检查问卷；刷新页面或切换模块不触发。
    this.maybeShowSurvey()
  },
  methods: {
    i18nRender,
    maybeShowSurvey() {
      if (!consumeSurveyPromptPending() || isSurveyDone()) {
        return
      }
      if (this.$route.path !== DEFAULT_LANDING_PATH) {
        return
      }
      // 已有任意画像内容时不再弹出，保留用户上次填写的最新记录。
      this.$store.dispatch('LoadProfile').then(() => {
        if (!isSurveyDone() && this.$store.getters.profileCompletion === 0) {
          // 略微延迟，等待主界面渲染完成，体验更平滑
          setTimeout(() => {
            this.surveyVisible = true
          }, 800)
        }
      })
    },
    handleSurveyDone() {
      this.surveyVisible = false
      window.location.reload()
    },
    handleMediaQuery(val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse(val) {
      this.collapsed = val
    },
    handleSettingChange({ type, value }) {
      console.log('type', type, value)
      type && (this.settings[type] = value)
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value
          break
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
          } else {
            this.settings.fixSiderbar = false
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fixed
          }
          break
      }
    }
  }
}
</script>

<style lang="less">
@import './BasicLayout.less';
.ant-pro-sider-menu-logo img {
  height: 40px;
  width: 40px;
}
.ant-pro-sider-menu-logo .tit {
  top: -8px;
  left: 80px;
  font-weight: 500;
  font-size: 16px;
  position: absolute;
  color: #fff;
}
.ant-pro-sider-menu-logo .subtit {
  top: 14px;
  left: 80px;
  font-weight: 400;
  position: absolute;
  color: #fff;
}
</style>
