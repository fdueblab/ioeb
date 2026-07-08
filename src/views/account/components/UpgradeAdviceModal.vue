<template>
  <a-modal
    :title="modalTitle"
    :visible="visible"
    :width="760"
    :footer="null"
    @cancel="handleClose"
  >
    <a-spin :spinning="generating">
      <template v-if="advice">
        <a-card size="small" title="领先情况分析" class="advice-block">
          <p class="advice-text">{{ advice.leadingAnalysis || '暂无内容' }}</p>
        </a-card>
        <a-card size="small" title="自动升级建议" class="advice-block">
          <p class="advice-text">{{ advice.autoUpgradeSuggestion || '暂无内容' }}</p>
        </a-card>
        <a-card size="small" title="人工更新建议" class="advice-block">
          <p class="advice-text">{{ advice.manualUpdateSuggestion || '暂无内容' }}</p>
        </a-card>
      </template>
      <a-empty v-else-if="!generating" description="暂无升级建议" />
      <div v-if="generating" class="generating-tip">正在生成升级建议，请稍候…</div>
    </a-spin>
  </a-modal>
</template>

<script>
export default {
  name: 'UpgradeAdviceModal',
  data() {
    return {
      visible: false,
      generating: false,
      advice: null,
      serviceName: ''
    }
  },
  computed: {
    modalTitle() {
      return this.serviceName ? `升级建议 - ${this.serviceName}` : '升级建议'
    }
  },
  methods: {
    openView(record) {
      this.serviceName = record.name || ''
      this.advice = record.upgradeAdvice || null
      this.generating = false
      this.visible = true
    },
    openGenerating(record) {
      this.serviceName = record.name || ''
      this.advice = null
      this.generating = true
      this.visible = true
    },
    setAdvice(advice) {
      this.advice = advice
      this.generating = false
    },
    setGenerating(flag) {
      this.generating = flag
    },
    handleClose() {
      this.visible = false
      this.generating = false
    }
  }
}
</script>

<style lang="less" scoped>
.advice-block {
  margin-bottom: 12px;
}

.advice-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
  color: rgba(0, 0, 0, 0.75);
}

.generating-tip {
  margin-top: 12px;
  color: #6b7280;
  text-align: center;
}
</style>
