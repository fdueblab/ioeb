<template>
  <div class="schedule-with-input">
    <!-- TODO: 解决跨域问题，对接真正后端 -->
    <!--    <iframe-->
    <!--      src="http://111.229.9.133/chatbot/DLtQcvLBRB0RfPUT"-->
    <!--      style="height: calc(100vh - 88px); width: 25vw;"-->
    <!--      frameborder="0"-->
    <!--      allow="microphone">-->
    <!--    </iframe>-->
    <fake-chat />
    <flow-panel style="height: calc(100vh - 88px); width: 100%;" :initial-flow="initFlow" :initial-services="initServices" />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_with_input'
import FakeChat from '@/components/ef/fake_chat'

export default {
  name: 'ServiceComposition',
  components: {
    FlowPanel,
    FakeChat
  },
  data () {
    return {
      initFlow: {
        // name: '初始流程图',
        // nodeList: [
        //   { id: 'node1', name: '节点1', type: 'start', left: '100px', top: '100px', ico: 'el-icon-user', state: 'success' },
        //   { id: 'node2', name: '节点2', type: 'process', left: '300px', top: '100px', ico: 'el-icon-user', state: 'success' }
        // ],
        // lineList: [
        //   { from: 'node1', to: 'node2' }
        // ]
      },
      initServices: [
        {
          id: '3',
          type: 'group',
          name: '低空飞行器操控服务',
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
  methods: {}
}
</script>

<style scoped>
.schedule-with-input {
  display: flex;
}
</style>
