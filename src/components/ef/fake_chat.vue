<template>
  <div class="chat-container">
    <div class="chat-output" ref="chatOutput">
      <div v-for="(message, index) in messages" :key="index" :class="['chat-message', message.isUser ? 'user-message' : 'bot-message']">
        <a-icon v-if="message.text === 'agentLoading'" type="loading" />
        <div v-else class="message-content" v-html="message.text" />
      </div>
    </div>
    <a-button v-if="isGenerated && !isInputLoading" class="retry-button" icon="sync" @click="refresh">重新生成</a-button>
    <div class="chat-input">
      <div class="input-wrapper" style="width: 100%; position: relative;" ref="inputWrapper">
        <a-input
          style="width: 100%"
          v-model="userInput"
          :placeholder="placeholder"
          :disabled="!isInputEnabled"
          @input="onInputChange"
          @focus="activateSuggestions"
          @blur="hideSuggestionsDelayed"
          @keydown.enter="handleUserInput"
          ref="inputElement"
        />
        <a-button type="primary" icon="deployment-unit" @click="handleUserInput" :loading="isInputLoading" :disabled="!userInput" class="submit-button" />
        <div
          class="suggestion-dropdown"
          v-if="showSuggestions && filteredSuggestions.length > 0 && isInputEnabled"
        >
          <div
            class="suggestion-item"
            v-for="(item, index) in filteredSuggestions"
            :key="index"
            @mousedown="selectSuggestion(item.value)"
          >
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMetaAppNodes } from '@/mock/data/meta_apps_data'

export default {
  name: 'FakeChat',
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.init()
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeyDown)
  },
  beforeDestroy() {
    // 移除键盘事件监听
    document.removeEventListener('keydown', this.handleKeyDown)
  },
  data() {
    return {
      userInput: '',
      placeholder: '请输入您对应用的需求',
      messages: [],
      currentIndex: 0,
      isInputEnabled: true,
      isInputLoading: false,
      isGenerated: false,
      showSuggestions: false,
      suggestions: [
        { value: '我想基于课题一的算法生成一个跨境支付报告生成应用' },
        { value: '我想基于课题二的算法生成一个跨境支付报告生成应用' },
        { value: '我想基于课题三的算法构建一个智能分析系统' },
        { value: '我想基于课题四的算法开发一个数据处理应用' },
        { value: '我需要使用课题一和课题三的技术开发一个金融风控系统' },
        { value: '请帮我实现一个简单的金融欺诈检测应用' }
      ],
      defaultSuggestions: [
        { value: '我想基于课题一的算法生成一个跨境支付报告生成应用' },
        { value: '我想基于课题二的算法生成一个跨境支付报告生成应用' },
        { value: '我想基于课题三的算法构建一个智能分析系统' },
        { value: '我想基于课题四的算法开发一个数据处理应用' },
        { value: '我需要使用课题一和课题三的技术开发一个金融风控系统' },
        { value: '请帮我实现一个简单的金融欺诈检测应用' }
      ],
      filteredSuggestions: []
    }
  },
  methods: {
    handleKeyDown(e) {
      if (e.key === 'Enter' && this.userInput && !this.isInputLoading && this.isInputEnabled) {
        this.handleUserInput()
      }
    },
    onInputChange() {
      if (!this.userInput) {
        this.filteredSuggestions = [...this.defaultSuggestions]
      } else {
        this.filteredSuggestions = this.defaultSuggestions.filter(item =>
          item.value.toLowerCase().includes(this.userInput.toLowerCase())
        )
      }
      this.showSuggestions = true
    },
    activateSuggestions() {
      this.showSuggestions = true
    },
    selectSuggestion(value) {
      this.userInput = value
      this.showSuggestions = false
      this.handleUserInput()
    },
    hideSuggestionsDelayed() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },
    handleUserInput() {
      if (!this.userInput.trim()) return
      this.isInputLoading = true
      this.isInputEnabled = false
      this.messages.push({ text: this.userInput, isUser: true })
      this.messages.push({ text: 'agentLoading', isUser: false })
      this.scrollToBottom()
      const input = this.userInput
      this.userInput = ''
      getMetaAppNodes(this.verticalType, input).then((res) => {
        const { chosenServices, serviceNodes, flowData } = res
        const outputMessage = `按照您的需求，我选取了<b>${chosenServices.join('</b>, <b>')}</b>作为可供任务智能体调用的服务。您可以通过右上角的添加服务按钮来增加智能体可调用的服务或在右侧删除不必要的服务。`
        this.typeWriter(outputMessage)
        this.$emit('update-services', serviceNodes)
        this.$emit('update-flow', flowData)
        this.placeholder = '已智能生成工作流'
        this.isGenerated = true
      }).catch(() => {
        const outputMessage = '非常抱歉，未能理解您的需求。本系统目前仅支持基于课题一、课题二、课题三、课题四或课题组内的金融欺诈检测相关算法构建简单的元应用。'
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
        this.scrollToBottom()
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatOutput) {
          this.$refs.chatOutput.scrollTop = this.$refs.chatOutput.scrollHeight
        }
      })
    },
    init() {
      this.userInput = ''
      this.placeholder = '请输入您对应用的需求'
      this.messages = []
      this.isInputEnabled = true
      this.isInputLoading = false
      this.isGenerated = false
      this.showSuggestions = false
      this.suggestions = [...this.defaultSuggestions]
      this.filteredSuggestions = [...this.defaultSuggestions]
      this.messages.push({ text: '请告诉我您对应用的需求，我将根据您的需求尝试生成元应用', isUser: false })
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
  overflow: visible;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-output {
  flex: 1;
  padding: 16px;
  background-color: #f9f9f9;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-height: calc(100vh - 150px); /* 设置最大高度 */
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
  position: relative;
  z-index: 100;
}

.input-wrapper {
  position: relative;
  width: 100%;
  z-index: 101;
}

.suggestion-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 2px;
  transform: translateZ(0);
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  white-space: normal;
  line-height: 1.5;
  word-break: break-word;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.submit-button {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
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
</style>
