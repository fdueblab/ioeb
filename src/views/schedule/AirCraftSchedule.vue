<template>
  <div class="schedule-with-input">
    <!--    TODO: 解决跨域问题，对接真正后端-->
    <iframe
      src="http://111.229.9.133/chatbot/l3XNgHzLlECqrr0r"
      style="height: calc(100vh - 88px); width: 35vw;"
      frameborder="0"
      allow="microphone">
    </iframe>
    <!--    <fake-chat @update-services="updateServices" @update-flow="updateFlow" />-->
    <flow-panel style="height: calc(100vh - 88px); width: 100%;" :initial-flow="initFlow"
                :initial-services="initServices" ref="flowPanel" />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_with_input'
import FakeChat from '@/components/ef/fake_chat'

export default {
  name: 'AirCraftSchedule',
  components: {
    FlowPanel,
    FakeChat
  },
  data () {
    return {
      initFlow: {},
      initServices: [
        {
          id: '3',
          type: 'group',
          name: '低空飞行器操控服务',
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
}
</style>
