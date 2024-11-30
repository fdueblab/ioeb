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
  data() {
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
          id: '9',
          type: 'group',
          name: '跨境支付反洗钱服务',
          open: true,
          children: [
            {
              id: '900',
              type: 'group',
              name: '安全计算微服务',
              open: true,
              children: [{
                id: '9001',
                type: 'securityCalculation',
                name: 'securityCalculation',
                ico: 'el-icon-s-data',
                style: {}
              }]
            },
            {
              id: '901',
              type: 'group',
              name: '报告生成微服务',
              open: true,
              children: [{
                id: '9101',
                type: 'getReport',
                name: 'getReport',
                ico: 'el-icon-document-add',
                style: {}
              }, {
                id: '9102',
                type: 'sendReport',
                name: 'sendReport',
                ico: 'el-icon-upload',
                style: {}
              }]
            },
            {
              id: '902',
              type: 'group',
              name: '信用评估微服务',
              open: true,
              children: [{
                id: '9201',
                type: 'getRiskInfo',
                name: 'getRiskInfo',
                ico: 'el-icon-data-analysis',
                style: {}
              }, {
                id: '9202',
                type: 'creditEvaluation',
                name: 'creditEvaluation',
                ico: 'el-icon-data-line',
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
