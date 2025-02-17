<template>
  <div class="preview-container">
    <div class="chat-output" ref="chatOutput">
      <div v-for="(message, index) in messages" :key="index" :class="['chat-message', message.isUser ? 'user-message' : 'bot-message']">
        <div class="message-content" v-html="message.text"></div>
      </div>
    </div>

    <!-- 应用预览区域 -->
    <!--    <div class="app-preview" ref="appPreview">-->
    <!-- 初始状态：显示提示文字 -->
    <!--      <div v-if="!showPreviewImage" class="preview-placeholder">-->
    <!--        元应用预览区域-->
    <!--      </div>-->
    <!-- 构建后：显示图片 -->
    <!--      <img-->
    <!--        v-if="showPreviewImage"-->
    <!--        src="@/assets/app-preview.png"-->
    <!--        alt="应用预览"-->
    <!--        class="preview-image"-->
    <!--      />-->
    <!--    </div>-->

    <!-- 输入框区域 -->
    <div class="chat-input">
      <a-input-search
        style="width: 100%"
        v-model="userInput"
        @search="handleUserInput"
        :placeholder="placeholder"
        :disabled="!isInputEnabled"
      >
        <template #enterButton>
          <a-button type="primary" icon="deployment-unit" :loading="isInputLoading" :disabled="!userInput">智能生成</a-button>
        </template>
      </a-input-search>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FakeChat',
  props: {
    serviceType: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.messages.push({ text: '请告诉我您对应用的需求，我将根据您的需求生成元应用工作流', isUser: false })
  },
  data() {
    return {
      userInput: '',
      placeholder: '请输入您对应用的需求',
      messages: [],
      isUser: [],
      currentIndex: 0,
      isInputEnabled: true,
      isInputLoading: false,
      showPreviewImage: false // 控制是否显示图片
    }
  },
  methods: {
    handleUserInput() {
      this.isInputLoading = true
      this.isInputEnabled = false
      this.messages.push({ text: this.userInput, isUser: true })
      this.messages.push({ text: '', isUser: false })
      if (this.userInput.includes('课题一')) {
        const chosenServices = ['课题一风险识别模型推理微服务', '课题一报告生成微服务']
        const outputMessage = `按照您的需求，我选择了<code>${chosenServices.join('</code>, <code>')}</code>中的相关接口，并以右侧的流程进行了初步编排。您可以自行拖动流程图以修改它们的构建方式或添加其它所需服务。`
        this.typeWriter(outputMessage)
        this.$emit('update-services', this.getUpdatedServices())
        this.$emit('update-flow', this.getUpdatedFlow())
        // 模拟处理用户输入的逻辑
        setTimeout(() => {
          this.userInput = ''
          this.placeholder = '已智能生成微服务工作流'
          this.isInputLoading = false
        }, 1600) // 模拟异步操作
      } else {
        const outputMessage = '抱歉，未理解您的需求，请提供进一步的描述。'
        this.userInput = ''
        this.typeWriter(outputMessage)
        // 模拟处理用户输入的逻辑
        setTimeout(() => {
          this.isInputLoading = false
          this.isInputEnabled = true
        }, 800) // 模拟异步操作
      }
    },
    typeWriter(text) {
      if (this.currentIndex < text.length) {
        this.messages[this.messages.length - 1].text += text.charAt(this.currentIndex)
        this.currentIndex++
        setTimeout(() => this.typeWriter(text), 20)
      } else {
        this.isInputLoading = false
        this.currentIndex = 0
      }
    },
    getUpdatedServices() {
      if (this.serviceType === 'aircraft') {
        return [
          {
            id: '3',
            type: 'group',
            name: '低空飞行AI监控服务',
            open: true,
            children: [
              {
                id: '100',
                type: 'group',
                name: '目标识别微服务',
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
                name: '远程控制微服务',
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
      } else {
        return [
          {
            id: '9',
            type: 'group',
            name: '跨境支付AI监测服务',
            open: true,
            children: [
              {
                id: '90',
                type: 'group',
                name: '课题一风险识别模型推理微服务',
                open: true,
                children: [
                  {
                    id: '9002',
                    type: 'preprocess',
                    name: 'preprocess',
                    ico: 'el-icon-c-scale-to-original',
                    style: {}
                  },
                  {
                    id: '9005',
                    type: 'predict',
                    name: 'predict',
                    ico: 'el-icon-data-line',
                    style: {}
                  },
                  {
                    id: '9006',
                    type: 'visualize',
                    name: 'visualize',
                    ico: 'el-icon-pie-chart',
                    style: {}
                  }
                ]
              },
              {
                id: '91',
                type: 'group',
                name: '课题一报告生成微服务',
                open: true,
                children: [
                  {
                    id: '9101',
                    name: 'generateReport',
                    type: 'process',
                    ico: 'el-icon-document-add',
                    style: {}
                  },
                  {
                    id: '9102',
                    name: 'getReportData',
                    type: 'process',
                    ico: 'el-icon-zoom-in',
                    style: {}
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    getUpdatedFlow() {
      if (this.serviceType === 'aircraft') {
        return {
          name: 'AI推荐流程',
          nodeList: [
            {
              id: '10000',
              name: 'metaAppAgent',
              type: 'start',
              url: 'ms.kxyun.net/agent',
              left: '200px',
              top: '0',
              ico: 'el-icon-cpu',
              input: 'csv File',
              output: 'json',
              version: '1.0',
              state: 'success'
            },
            {
              id: '10001',
              name: 'getTargetLocation',
              type: 'process',
              url: 'ms.kxyun.net/getTargetLocation',
              left: '0',
              top: '140px',
              ico: 'el-icon-location-information',
              state: 'success',
              input: 'csv File',
              output: 'json',
              version: '1.0'
            },
            {
              id: '10002',
              name: 'getTargetInfo',
              type: 'process',
              url: 'ms.kxyun.net/getTargetInfo',
              left: '200px',
              top: '300px',
              ico: 'el-icon-user',
              state: 'success',
              input: 'json',
              output: 'json',
              version: '1.0'
            },
            {
              id: '10101',
              name: 'setMotionMode',
              type: 'end',
              url: 'ms.kxyun.net/setMotionMode',
              left: '400px',
              top: '160px',
              ico: 'el-icon-rank',
              state: 'warning',
              input: 'json',
              output: 'json',
              version: '1.0'
            }
          ],
          lineList: [
            { from: '10000', to: '10001' },
            { from: '10001', to: '10000' },
            { from: '10000', to: '10002' },
            { from: '10002', to: '10000' },
            { from: '10000', to: '10101' }
          ]
        }
      }
      return {
        name: 'AI推荐流程',
        nodeList: [
          {
            id: '10000',
            name: 'metaAppAgent',
            type: 'start',
            url: 'http://43.130.11.13:5000/api/pj1_report_app',
            left: '200px',
            top: '0',
            ico: 'el-icon-cpu',
            input: 'zip File',
            output: 'json',
            version: '1.0',
            state: 'running'
          },
          {
            id: '9000',
            name: 'preprocess',
            type: 'process',
            url: 'ms.kxyun.net/preprocess',
            left: '0',
            top: '130px',
            ico: 'el-icon-c-scale-to-original',
            input: 'zip File',
            output: 'vector',
            version: '2.0',
            state: 'success'
          },
          {
            id: '9001',
            name: 'predict',
            type: 'process',
            url: 'http://43.130.11.13:25001/api/predict',
            left: '75px',
            top: '380px',
            ico: 'el-icon-s-data',
            state: 'success',
            input: 'vector',
            output: 'vector',
            version: '1.1'
          },
          {
            id: '9101',
            name: 'generateReport',
            type: 'process',
            url: 'ms.kxyun.net/generateReport',
            left: '300px',
            top: '300px',
            ico: 'el-icon-document-add',
            state: 'warning',
            input: 'vector',
            output: 'pdf',
            version: '0.9'
          },
          {
            id: '9102',
            name: 'getReportData',
            type: 'process',
            url: 'ms.kxyun.net/getReportData',
            left: '450px',
            top: '80px',
            ico: 'el-icon-zoom-in',
            state: 'warning',
            input: 'pdf',
            output: 'json',
            version: '0.9'
          }
        ],
        lineList: [
          { from: '10000', to: '9000' },
          { from: '9000', to: '9001' },
          { from: '9001', to: '10000' },
          { from: '10000', to: '9101' },
          { from: '9101', to: '9102' },
          { from: '9102', to: '10000' }
        ]
      }
    }
  }
}
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  width: 30vw;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-output {
  flex: 1;
  padding: 16px;
  background-color: #f9f9f9;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-message {
  margin-bottom: 16px;
  font-size: 1.1em;
  color: #333;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 70%;
}

.user-message {
  align-self: flex-end;
  background-color: #4a90e2;
  color: #fff;
}

.bot-message {
  align-self: flex-start;
  background-color: #fff;
}

.chat-input {
  display: flex;
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #ccc;
}

/* 添加样式以支持 <code> 标签的显示 */
.message-content code {
  background-color: #f4f4f4;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  color: #d63384;
}
</style>
