<template>
  <div class="schedule-with-input">
    <div style="height: 100%; width: 35vw;" v-if="isDev">
      推荐机器人嵌入地址（仅开发环境可见）：
      <a-input v-model="chatBotUrl" placeholder="请输入推荐机器人地址" />
      <iframe
        :src="chatBotUrl"
        style="height: 100%; width: 100%;"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>
    <fake-chat v-else style="height: calc(100vh - 100px)" @update-services="updateServices" @update-flow="updateFlow" :service-type="'aircraft'" />
    <div style="height: 100%; width: 100%;" v-if="isDev">
      流程图嵌入地址（仅开发环境可见）：
      <a-input v-model="flowUrl" placeholder="请输入流程图嵌入地址" />
      <iframe
        :src="flowUrl"
        style="height: 100%; width: 100%;"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>
    <flow-panel
      v-else
      ref="flowPanel"
      style="height: calc(100vh - 100px); width: 100%;"
      :initial-flow="initFlow"
      :initial-services="initServices"
      :loading-services="loadingServices"
      :loading-flow="loadingFlow"
      :service-type="'aml'"
    />
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
      isDev: process.env.NODE_ENV === 'development' || process.env.VUE_APP_PREVIEW === 'true',
      chatBotUrl: 'https://yufanwenshu.cn/chatbot/l3XNgHzLlECqrr0r',
      flowUrl: 'https://yufanwenshu.cn/app/d999c955-66bb-492a-aa98-9327b39ade39/workflow',
      initFlow: {},
      initServices: [
        {
          id: '3',
          type: 'group',
          name: '低空飞行AI监控服务',
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
