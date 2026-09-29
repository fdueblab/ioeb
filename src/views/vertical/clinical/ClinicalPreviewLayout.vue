<template>
  <a-layout class="clinical-preview-layout">
    <a-layout-sider :collapsed="collapsed" :trigger="null" collapsible width="260" :collapsed-width="80">
      <div class="clinical-preview-brand">{{ collapsed ? '临床' : '临床医疗算法模型众智工场' }}</div>
      <a-menu theme="dark" mode="inline" :inline-collapsed="collapsed" :selected-keys="[$route.path]" @click="navigate">
        <a-menu-item key="/clinical-preview/overview"><a-icon type="dashboard" />工作台与数据统计</a-menu-item>
        <a-menu-item key="/vertical-scenario-dev/clinical"><a-icon type="code" />算法模型想定式开发</a-menu-item>
        <a-menu-item key="/clinical-algorithm-use"><a-icon type="experiment" />算法模型云端服务</a-menu-item>
        <a-menu-item key="/clinical-preview/resources"><a-icon type="appstore" />算法模型组件列表</a-menu-item>
        <a-menu-item key="/clinical-preview/publish"><a-icon type="cloud-upload" />MCP 服务封装</a-menu-item>
        <a-menu-item key="/clinical-preview/meta-app"><a-icon type="deployment-unit" />元应用智能体构建</a-menu-item>
        <a-menu-item key="/clinical-preview/evaluation"><a-icon type="radar-chart" />技术评测与业务验证</a-menu-item>
        <a-menu-item key="/clinical-preview/operation"><a-icon type="control" />运维管理</a-menu-item>
        <a-menu-item key="/clinical-preview/account"><a-icon type="user" />个人中心</a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="clinical-preview-header">
        <a-icon class="clinical-preview-trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="collapsed = !collapsed" />
        <span>临床医疗算法模型众智工场</span>
        <a :href="docsUrl" target="_blank" rel="noopener">临床知识索引与使用指南</a>
      </a-layout-header>
      <a-layout-content class="clinical-preview-content"><router-view /></a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import { buildDocsUrl } from '@/utils/baseUrl'

export default {
  name: 'ClinicalPreviewLayout',
  data() { return { collapsed: false } },
  computed: {
    docsUrl() { return buildDocsUrl() }
  },
  methods: {
    navigate(item) { this.$router.push(item.key) }
  }
}
</script>

<style scoped>
.clinical-preview-layout { min-height: 100vh; }
.clinical-preview-brand { color: #fff; line-height: 1.5; padding: 22px 16px; min-height: 78px; font-size: 17px; font-weight: 600; text-align: center; }
.clinical-preview-header { display: flex; gap: 20px; align-items: center; background: #fff; padding: 0 24px; }
.clinical-preview-trigger { font-size: 19px; cursor: pointer; }
.clinical-preview-header span { flex: 1; font-weight: 600; }
.clinical-preview-content { padding: 20px; min-height: calc(100vh - 64px); background: #f0f2f5; }
</style>
