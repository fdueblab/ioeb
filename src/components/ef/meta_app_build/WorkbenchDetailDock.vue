<template>
  <div class="wb-detail-dock">
    <div class="wb-detail-dock-box" :class="{ 'wb-detail-dock-box--expanded': !minimized }">
      <button
        type="button"
        class="wb-detail-dock-head"
        :title="minimized ? '展开详细信息' : '收起详细信息'"
        @click="toggle"
      >
        <span class="wb-detail-dock-title">详细信息</span>
        <span class="wb-detail-dock-sign">{{ minimized ? '+' : '−' }}</span>
      </button>
      <div v-if="!minimized" class="wb-detail-dock-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkbenchDetailDock',
  props: {
    minimized: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    toggle() {
      const next = !this.minimized
      this.$emit('update:minimized', next)
      this.$emit('toggle', next)
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';
</style>
