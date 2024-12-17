<template>
  <div class="schedule-with-input">
    <div style="height: 100%; width: 35vw;">
      聊天机器人嵌入地址：
      <a-input v-model="chatBotUrl" placeholder="请输入聊天机器人地址" />
      <iframe
        :src="chatBotUrl"
        style="height: 100%; width: 100%;"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>
    <div style="height: 100%; width: 100%;">
      流程图嵌入地址：
      <a-input v-model="flowUrl" placeholder="请输入流程图嵌入地址" />
      <iframe
        :src="flowUrl"
        style="height: 100%; width: 100%;"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>

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
      chatBotUrl: 'https://yufanwenshu.cn/chatbot/l3XNgHzLlECqrr0r',
      flowUrl: 'https://yufanwenshu.cn/app/d999c955-66bb-492a-aa98-9327b39ade39/workflow',
      initFlow: {},
      initServices: [
        {
          id: '3',
          type: 'group',
          name: '低空飞行AI监控服务',
          open: true,
          children: [
            {
              id: '100',
              type: 'group',
              name: '无人机目标识别服务',
              open: true,
              children: [{
                id: '1001',
                type: 'getTargetLocation',
                name: 'getTargetLocation',
                ico: 'el-icon-location-information',
                style: {}
              }, {
                id: '1002',
                type: 'getTargetInfo',
                name: 'getTargetInfo',
                ico: 'el-icon-user',
                style: {}
              }]
            },
            {
              id: '101',
              type: 'group',
              name: '无人机远程控制服务',
              open: true,
              children: [{
                id: '1101',
                type: 'setTargetLocation',
                name: 'setTargetLocation',
                ico: 'el-icon-add-location',
                style: {}
              }, {
                id: '1102',
                type: 'setMotionMode',
                name: 'setMotionMode',
                ico: 'el-icon-rank',
                style: {}
              }]
            }
          ]
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
  height: calc(100vh - 100px);
}
</style>
