<template>
  <div class="preview-container">
    <div class="chat-output" ref="chatOutput">
      <div v-for="(message, index) in messages" :key="index" :class="['chat-message', message.isUser ? 'user-message' : 'bot-message']">
        <a-icon v-if="message.text === 'agentLoading'" type="loading" />
        <div v-else class="message-content" v-html="message.text" />
      </div>
    </div>

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
import { getAircraftFlow, getPj1Flow } from '@/mock/data/flow_data'

export default {
  name: 'FakeChat',
  props: {
    serviceType: {
      type: String,
      default: 'aml'
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
      this.messages.push({ text: 'agentLoading', isUser: false })
      if (this.serviceType === 'aircraft') {
        const chosenServices = ['目标识别微服务', '远程控制微服务']
        const outputMessage = `按照您的需求，我选择了<code>${chosenServices.join('</code>, <code>')}</code>中的相关接口，并以右侧的流程进行了初步编排。您可以自行拖动流程图以修改它们的构建方式或添加其它所需服务。`
        this.typeWriter(outputMessage)
        this.$emit('update-services', this.getUpdatedServices())
        this.$emit('update-flow', this.getUpdatedFlow())
        this.userInput = ''
        this.placeholder = '已智能生成微服务工作流'
        this.isInputLoading = false
      } else {
        setTimeout(() => {
          if (this.userInput.includes('课题一')) {
            const chosenServices = ['课题一风险识别模型推理微服务', '课题一报告生成微服务']
            const outputMessage = `按照您的需求，我选择了<code>${chosenServices.join('</code>, <code>')}</code>中的相关接口，并以右侧的流程进行了初步编排。您可以自行拖动流程图以修改它们的构建方式或添加其它所需服务。`
            this.typeWriter(outputMessage)
            this.$emit('update-services', this.getUpdatedServices())
            this.$emit('update-flow', this.getUpdatedFlow())
            this.userInput = ''
            this.placeholder = '已智能生成微服务工作流'
            this.isInputLoading = false
          } else {
            const outputMessage = '抱歉，未理解您的需求，请提供进一步的描述。'
            this.userInput = ''
            this.typeWriter(outputMessage)
            this.isInputLoading = false
            this.isInputEnabled = true
          }
        }, 1600)
      }
    },
    typeWriter(text) {
      if (this.currentIndex < text.length) {
        this.messages[this.messages.length - 1].text = text.substring(0, this.currentIndex + 1)
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
        return getAircraftFlow()
      } else {
        return getPj1Flow()
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

@keyframes blink {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
</style>
