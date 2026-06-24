<template>
  <nav class="wb-macrobar" aria-label="构建流程">
    <ol class="wb-macrobar-track">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        class="wb-macrobar-item"
        :class="{
          'wb-macrobar-item--active': index === activeIndex,
          'wb-macrobar-item--done': index < activeIndex
        }"
      >
        <div class="wb-macro-step-header">
          <div class="wb-macro-step-indicator">
            <a-icon v-if="index < activeIndex" type="check" class="wb-macro-icon-done" />
            <span v-else class="wb-macro-step-number">{{ index + 1 }}</span>
          </div>
          <div class="wb-macro-step-content">
            <div class="wb-macro-step-title">{{ step.label }}</div>
          </div>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  name: 'MacroBar',
  props: {
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      steps: [
        { key: 'input', label: '想定输入' },
        { key: 'build', label: '仿真构建' },
        { key: 'prepublish', label: '元应用预发布' }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';
</style>
