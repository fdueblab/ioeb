<template>
  <div class="schedule-with-input">
    <fake-chat @update-services="updateServices" @update-flow="updateFlow" />
    <flow-panel style="height: calc(100vh - 88px); width: 100%;" :initial-flow="initFlow"
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
