<template>
  <div class="chat-container">
    <div class="chat-output" ref="chatOutput">
      <div v-for="(message, index) in messages" :key="index" :class="['chat-message', message.isUser ? 'user-message' : 'bot-message']">
        <div class="message-content">{{ message.text }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input
        type="text"
        v-model="userInput"
        @keyup.enter="handleUserInput"
        placeholder="告诉AI你想做什么"
        :disabled="!isInputEnabled"
      />
      <button @click="handleUserInput" :disabled="!isInputEnabled">发送</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: '',
      messages: [],
      welcomeMessage: '请告诉我您的需求，我将根据您的需求提供建议',
      currentIndex: 0,
      isInputEnabled: true
    }
  },
  methods: {
    handleUserInput() {
      if (this.isInputEnabled) {
        this.isInputEnabled = false
        this.messages.push({ text: this.userInput, isUser: true })
        this.messages.push({ text: '', isUser: false })
        const chosenServices = ['异常识别微服务', '报告生成微服务']
        const outputMessage = `按照您的需求，我选择了\`${chosenServices.join('`')}\`中的一些相关接口，并以右侧的流程进行了初步编排。您可以自行拖动流程图以修改它们的构建方式或添加其它所需服务。`
        this.typeWriter(outputMessage)
        this.$emit('update-services', this.getUpdatedServices())
        this.$emit('update-flow', this.getUpdatedFlow())
      }
    },
    typeWriter(text) {
      if (this.currentIndex < text.length) {
        this.messages[this.messages.length - 1].text += text.charAt(this.currentIndex)
        this.currentIndex++
        setTimeout(() => this.typeWriter(text), 100) // 每100毫秒输出一个字符
      }
    },
    getUpdatedServices() {
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
              name: '异常识别微服务',
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
                  type: 'evaluate',
                  name: 'evaluate',
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
              id: '94',
              type: 'group',
              name: '报告生成微服务',
              open: true,
              children: [{
                id: '9401',
                type: 'generateReport',
                name: 'generateReport',
                ico: 'el-icon-document-add',
                style: {}
              }, {
                id: '9402',
                type: 'sendReport',
                name: 'sendReport',
                ico: 'el-icon-upload',
                style: {}
              }]
            }
          ]
        }
      ]
    },
    getUpdatedFlow() {
      return {
        name: 'AI推荐流程',
        nodeList: [
          {
            id: '9000',
            name: 'preprocess',
            type: 'start',
            left: '0',
            top: '0px',
            ico: 'el-icon-c-scale-to-original',
            input: 'csv File',
            output: 'json',
            version: '1.0',
            state: 'success'
          },
          { id: '9001',
            name: 'evaluate',
            type: 'process',
            left: '0',
            top: '250px',
            ico: 'el-icon-s-data',
            state: 'success',
            input: 'json',
            output: 'vector',
            version: '1.1'
          },
          { id: '9002',
            name: 'visualize',
            type: 'process',
            left: '200px',
            top: '120px',
            ico: 'el-icon-pie-chart',
            state: 'warning',
            input: 'vector',
            output: 'image',
            version: '1.2'
          },
          { id: '9101',
            name: 'generateReport',
            type: 'process',
            left: '420px',
            top: '0px',
            ico: 'el-icon-document-add',
            state: 'success',
            input: 'image',
            output: 'pdf',
            version: '1.0'
          },
          { id: '9102',
            name: 'sendReport',
            type: 'end',
            left: '400px',
            top: '220px',
            ico: 'el-icon-upload',
            state: 'error',
            input: 'pdf',
            output: '',
            version: '0.8'
          }
        ],
        lineList: [
          { from: '9000', to: '9001' },
          { from: '9001', to: '9002' },
          { from: '9002', to: '9101' },
          { from: '9101', to: '9102' }
        ]
      }
    }
  },
  mounted() {
    this.messages.push({ text: this.welcomeMessage, isUser: false })
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 35vw;
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

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 8px;
}

.chat-input button {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #357abd;
}

.chat-input input:disabled,
.chat-input button:disabled {
  background-color: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
}
</style>
