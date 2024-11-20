<template>
  <div>
    <a-button type="primary" @click="handleCombine" icon="api">应用服务动态组合</a-button>
    <a-modal
      title="应用服务动态组合"
      :visible="modalVisible"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :width="'auto'"
      :bodyStyle="{ width: modalContent === 'schedule' ? 'auto' : ( modalContent === 'largeModel' ? '100vw' : '400px' ), height: modalContent === 'largeModel' ? 'calc(100vh - 60px)' : 'auto' }"
      :dialog-style="modalContent === 'schedule' ? { top: 0 } : ( modalContent === 'largeModel' ? { top: '-100%', left: 0 } : {})"
      :footer="false"
      :centered="modalContent !== 'schedule'"
      :maskClosable="modalContent !== 'schedule'"
    >
      <div v-if="modalContent === 'buttons'">
        <a-form>
          <a-form-item label="请选择组合方式">
            <a-button type="primary" @click="handleVisualArrangement">手动可视化编排</a-button>
            <a-button type="primary" @click="handleLargeModelCombination" style="margin-left: 20px;">大模型组合</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div v-else-if="modalContent === 'schedule'">
        <flow-panel :initialFlowText="initialFlowText" />
      </div>
      <div v-else-if="modalContent === 'largeModel'">
        <!--        <a-form>-->
        <!--          <a-form-item label="组合编排结果">-->
        <!--            <a-textarea-->
        <!--              :value="largeModelResult"-->
        <!--              placeholder="此处将根据您的需求提供组合编排结果"-->
        <!--              :rows="6"-->
        <!--              :readonly="true"-->
        <!--              :style="{-->
        <!--                border: 'none',-->
        <!--                resize: 'none',-->
        <!--                cursor: 'default',-->
        <!--              }" />-->
        <!--          </a-form-item>-->
        <!--          <a-form-item label="组合编排需求">-->
        <!--            <a-textarea v-model="largeModelInput" placeholder="通过对话描述您的需求" :rows="4" allowClear />-->
        <!--          </a-form-item>-->
        <!--          <a-button type="primary" @click="handleLargeModelSubmit" :loading="largeModalLoading" :disabled="largeModelInput === ''">提交</a-button>-->
        <!--        </a-form>-->
        <iframe
          src="http://111.229.9.133/chatbot/DLtQcvLBRB0RfPUT"
          style="width: 100%; height: 100%; min-height: 600px;"
          frameborder="0"
          allow="microphone">
        </iframe>
      </div>
    </a-modal>
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_with_input'

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

</style>
