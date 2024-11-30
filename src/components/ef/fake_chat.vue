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
      fixedOutput2: '右侧微服务应该能实现本模块的需求，后续将基于大模型提供仿真构建功能',
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
      }
    },
    typeWriter(text) {
      if (this.currentIndex < text.length) {
        this.messages[this.messages.length - 1].text += text.charAt(this.currentIndex)
        this.currentIndex++
        setTimeout(() => this.typeWriter(text), 100) // 每100毫秒输出一个字符
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
  width: 25vw;
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
