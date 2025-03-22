<template>
  <div class="schedule-with-input">
    <fake-chat
      style="height: calc(100vh - 100px)"
      @update-services="updateServices"
      @update-flow="updateFlow"
      @clear-flow="clearFlow"
      :service-type="'homeAI'"
    />
    <flow-panel
      ref="flowPanel"
      style="height: calc(100vh - 100px); width: 100%"
      :initial-flow="initFlow"
      :initial-services="initServices"
      :loading-services="loadingServices"
      :loading-flow="loadingFlow"
      :service-type="'homeAI'"
    />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_with_input'
import FakeChat from '@/components/ef/fake_chat'

export default {
  name: 'HomeAISchedule',
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
          name: '家庭陪伴AI应用服务',
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
          name: '家庭陪伴AI应用服务',
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
