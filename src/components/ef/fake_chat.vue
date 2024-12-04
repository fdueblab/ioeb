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
        placeholder="输入内容..."
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
      fixedOutput2: '按照您的需求，我们选择了右侧的服务，并以右侧的流程图进行了它们的组合与编排。您可以自行拖动流程图以修改它们的构建方式。',
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
        this.typeWriter(this.fixedOutput2)
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
                type: 'getTargetType',
                name: 'getTargetType',
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
              }, {
                id: '1103',
                type: 'runUAV',
                name: 'runUAV',
                ico: 'el-icon-video-play',
                style: {}
              }]
            }
          ]
        }
      ]
    },
    getUpdatedFlow() {
      return {
        name: '初始流程图',
        nodeList: [
          { id: '1001', name: 'getTargetLocation', type: 'start', left: '0', top: '60px', ico: 'el-icon-location-information', state: 'success' },
          { id: '1101', name: 'setTargetLocation', type: 'process', left: '250px', top: '0px', ico: 'el-icon-add-location', state: 'success' },
          { id: '1102', name: 'setMotionMode', type: 'process', left: '300px', top: '250px', ico: 'el-icon-add-location', state: 'success' }
        ],
        lineList: [
          { from: '1001', to: '1101' },
          { from: '1101', to: '1102' },
          { from: '1102', to: '1103' }
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
  height: calc(100vh - 88px);
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
