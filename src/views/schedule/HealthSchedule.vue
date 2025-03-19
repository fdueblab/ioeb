<template>
  <div class="schedule-with-input">
    <fake-chat
      style="height: calc(100vh - 100px)"
      @update-services="updateServices"
      @update-flow="updateFlow"
      @clear-flow="clearFlow"
      :service-type="'health'"
    />
    <flow-panel
      ref="flowPanel"
      style="height: calc(100vh - 100px); width: 100%"
      :initial-flow="initFlow"
      :initial-services="initServices"
      :loading-services="loadingServices"
      :loading-flow="loadingFlow"
      :service-type="'health'"
    />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_with_input'
import FakeChat from '@/components/ef/fake_chat'

export default {
  name: 'HealthSchedule',
  components: {
    FlowPanel,
    FakeChat
  },
  data() {
    return {
      initFlow: {},
      initServices: [
        {
          id: '9',
          type: 'group',
          name: '乡村医疗AI智能服务',
          open: true,
          children: []
        }
      ],
      loadingServices: false, // 新增 loadingServices 状态
      loadingFlow: false // 新增 loadingFlow 状态
    }
  },
  methods: {
    updateServices(newServices) {
      this.loadingServices = true
      setTimeout(() => {
        this.initServices = newServices
        this.loadingServices = false
      }, 800)
    },
    updateFlow(newFlow) {
      this.loadingFlow = true
      setTimeout(() => {
        this.$refs.flowPanel.updateInitialFlow(newFlow)
        this.loadingFlow = false
      }, 1600)
    },
    clearFlow() {
      this.$refs.flowPanel.dataReloadClear()
      this.$refs.flowPanel.setServices([
        {
          id: '9',
          type: 'group',
          name: '乡村医疗AI智能服务',
          open: true,
          children: []
        }
      ])
    }
  }
}
</script>

<style scoped>
.schedule-with-input {
  display: flex;
  height: calc(100vh + 100px);
}
</style>
