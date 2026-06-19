<template>
  <div class="wb-build-left">
    <div class="wb-panel-scroll">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimulationBuildLeftPanel'
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.wb-panel-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0;
  background: #fff;
}

.wb-build-left {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
}
</style>
