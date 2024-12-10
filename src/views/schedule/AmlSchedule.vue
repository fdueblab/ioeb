<template>
  <div class="schedule-with-input">
    <fake-chat style="height: calc(100vh - 100px)" @update-services="updateServices" @update-flow="updateFlow" />
    <flow-panel style="height: calc(100vh - 100px); width: 100%;" :initial-flow="initFlow"
                :initial-services="initServices" ref="flowPanel" />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_with_input'
import FakeChat from '@/components/ef/fake_chat'

export default {
  name: 'AmlSchedule',
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
          name: '跨境支付AI监测服务',
          open: true,
          children: []
        }
      ]
    }
  },
  methods: {
    updateServices(newServices) {
      this.initServices = newServices
    },
    updateFlow(newFlow) {
      this.$refs.flowPanel.updateInitialFlow(newFlow)
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
