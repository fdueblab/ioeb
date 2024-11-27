<template>
  <div class="schedule-with-input">
    <iframe
      src="http://111.229.9.133/chatbot/DLtQcvLBRB0RfPUT"
      style="height: calc(100vh - 64px); width: 25vw;"
      frameborder="0"
      allow="microphone">
    </iframe>
    <flow-panel style="height: calc(100vh - 64px); width: 100%;" :initialFlowText="initialFlowText" />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/aircraft_panel'

export default {
  name: 'ServiceComposition',
  components: {
    FlowPanel
  },
  props: {
    // 接收父组件传递的服务列表
    services: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      modalVisible: false,
      modalContent: 'buttons',
      largeModelInput: '',
      largeModelResult: '',
      largeModalLoading: false,
      initialFlowText: '' // 初始化文本形式的流程图
    }
  },
  methods: {
    handleCombine () {
      this.modalVisible = true
      this.modalContent = 'buttons'
    },
    handleVisualArrangement () {
      this.modalContent = 'schedule'
      this.generateInitialFlowText() // 生成初始的文本形式的流程图
    },
    handleLargeModelCombination () {
      this.modalContent = 'largeModel'
    },
    handleLargeModelSubmit () {
      this.largeModelResult = ''
      this.largeModalLoading = true
      let result = '根据您的需求，微服务组合方案如下：'
      for (let i = 0; i < this.services.length; i++) {
        // 模拟异步请求,假设有大模型组合算法
        console.log(this.services[i])
        result += this.services[i].name + '->'
      }
      result = result.substring(0, result.length - 2)
      let index = 0
      // 模拟异步请求,结束之后loading消失
      const interval = setInterval(() => {
        if (index < result.length) {
          this.largeModelResult += result[index]
          index++
        } else {
          this.largeModalLoading = false
          clearInterval(interval)
        }
      }, 100) // 每100毫秒显示一个字符
    },
    handleModalOk () {
      this.modalVisible = false
    },
    handleModalCancel () {
      this.modalVisible = false
    },
    generateInitialFlowText () {
      // 这里可以根据用户的输入生成文本形式的流程图
      // 例如，假设生成的流程图如下：
      this.initialFlowText = JSON.stringify({
        name: '初始流程图',
        nodeList: [
          { id: 'node1', name: '节点1', type: 'start', left: '100px', top: '100px', ico: 'el-icon-user', state: 'success' },
          { id: 'node2', name: '节点2', type: 'process', left: '300px', top: '100px', ico: 'el-icon-user', state: 'success' }
        ],
        lineList: [
          { from: 'node1', to: 'node2' }
        ]
      })
    }
  }
}
</script>

<style scoped>
.schedule-with-input {
  display: flex;
}
</style>
