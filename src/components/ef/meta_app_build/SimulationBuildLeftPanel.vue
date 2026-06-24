<template>
  <div class="wb-build-left">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SimulationBuildLeftPanel'
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.wb-build-left {
  flex: 1 1 0;
  min-height: 0;
  height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}
</style>
