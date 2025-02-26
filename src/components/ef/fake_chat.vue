<template>
  <div class="chat-container">
    <div class="chat-output" ref="chatOutput">
      <div v-for="(message, index) in messages" :key="index" :class="['chat-message', message.isUser ? 'user-message' : 'bot-message']">
        <a-icon v-if="message.text === 'agentLoading'" type="loading" />
        <div v-else class="message-content" v-html="message.text" />
      </div>
    </div>
    <a-button v-if="isGenerated" class="retry-button" icon="sync" @click="refresh">重新生成</a-button>
    <div class="chat-input">
      <a-input-search
        style="width: 100%"
        v-model="userInput"
        @search="handleUserInput"
        :placeholder="placeholder"
        :disabled="!isInputEnabled"
      >
        <template #enterButton>
          <a-button type="primary" icon="deployment-unit" :loading="isInputLoading" :disabled="!userInput" />
        </template>
      </a-input-search>
    </div>
  </div>
</template>

<script>
import { getChatData } from '@/mock/data/chat_data'

export default {
  name: 'FakeChat',
  props: {
    serviceType: {
      type: String,
      default: 'aml'
    }
  },
  mounted() {
    this.init()
  },
  data() {
    return {
      userInput: '',
      placeholder: '请输入您对应用的需求',
      messages: [],
      currentIndex: 0,
      isInputEnabled: true,
      isInputLoading: false,
      isGenerated: false
    }
  },
  methods: {
    handleUserInput() {
      this.isInputLoading = true
      this.isInputEnabled = false
      this.messages.push({ text: this.userInput, isUser: true })
      this.messages.push({ text: 'agentLoading', isUser: false })
      getChatData(this.serviceType, this.userInput).then((res) => {
        const { chosenServices, serviceNodes, flowData } = res
        const outputMessage = `按照您的需求，我选择了<code>${chosenServices.join('</code>, <code>')}</code>中的相关接口，并以右侧的流程进行了初步编排。您可以自行拖动流程图以修改它们的构建方式或添加其它所需服务。`
        this.typeWriter(outputMessage)
        this.$emit('update-services', serviceNodes)
        this.$emit('update-flow', flowData)
        this.placeholder = '已智能生成工作流'
        this.isGenerated = true
      }).catch(() => {
        const outputMessage = '抱歉，未理解您的需求，请提供进一步的描述。'
        this.typeWriter(outputMessage)
        this.isInputEnabled = true
      })
    },
    typeWriter(text) {
      if (this.currentIndex < text.length) {
        this.messages[this.messages.length - 1].text = text.substring(0, this.currentIndex + 1)
        this.currentIndex++
        setTimeout(() => this.typeWriter(text), 20)
      } else {
        this.userInput = ''
        this.isInputLoading = false
        this.currentIndex = 0
      }
    },
    init() {
      this.userInput = ''
      this.placeholder = '请输入您对应用的需求'
      this.messages = []
      this.isInputEnabled = true
      this.isInputLoading = false
      this.isGenerated = false
      this.messages.push({ text: '请告诉我您对应用的需求，我将根据您的需求生成元应用工作流', isUser: false })
    },
    refresh() {
      this.init()
      this.$emit('clear-flow')
    }
  }
}
</script>

<style scoped>
.chat-container {
  position: relative;
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

.retry-button {
  position: absolute;
  bottom: 75px;
  left: 50%;
  transform: translateX(-50%);
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
