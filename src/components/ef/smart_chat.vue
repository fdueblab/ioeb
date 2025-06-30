<template>
  <div class="chat-container">
    <div class="chat-output" ref="chatOutput">
      <div v-for="(message, index) in messages" :key="index" :class="['chat-message', message.isUser ? 'user-message' : 'bot-message', message.type === 'agent' ? 'agent-message-wrapper' : '', message.text === 'agentLoading' ? 'loading-text-wrapper' : '']">
        <!-- 智能体连接状态 -->
        <div v-if="message.text === 'agentLoading'" class="agent-connecting">
          <a-icon type="global" style="margin-right: 8px" />正在连接智能体
          <div class="connecting-indicator">
            <div class="connecting-dot"></div>
            <div class="connecting-dot"></div>
            <div class="connecting-dot"></div>
          </div>
        </div>
        <!-- 智能体消息（包含思考过程和结果） -->
        <div v-else-if="message.type === 'agent'" class="agent-message-container">
          <!-- 思考过程部分 -->
          <div v-if="message.thinking" class="thinking-section">
            <div class="thinking-header" @click="toggleThinking(index)">
              <a-icon :type="message.thinking.collapsed ? 'down' : 'up'" class="thinking-toggle" />
              <span class="thinking-title">
                {{ getThinkingTitle(message.thinking) }}
              </span>
              <div v-if="!message.thinking.finished" class="thinking-indicator">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
              </div>
              <a-icon v-else type="check" style="color: green; margin-right: 6px;" />
            </div>
            <div v-if="!message.thinking.collapsed" class="thinking-content">
              <div class="thinking-text">{{ message.thinking.thought }}</div>
            </div>
          </div>
          <!-- 结果部分 -->
          <div v-if="message.result" class="result-section">
            <div class="message-content" v-html="message.result" />
          </div>
        </div>
        <!-- 普通消息 -->
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
import { ChatMessageManager } from './chat_messages'
import { streamAgent } from '@/utils/request'
import { generateServiceNodes } from './utils'

export default {
  name: 'SmartChat',
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  mounted() {
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
      placeholder: '',
      messages: [],
      currentIndex: 0,
      isInputEnabled: true,
      isInputLoading: false,
      isGenerated: false,
      showSuggestions: false,
      messageManager: null,
      filteredSuggestions: [],
      thinkingMessageIndex: -1 // 追踪思考消息的索引
    }
  },
  watch: {
    verticalType: {
      handler(newVal) {
        if (newVal) {
          this.messageManager = new ChatMessageManager(newVal)
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    handleKeyDown(e) {
      if (e.key === 'Enter' && this.userInput && !this.isInputLoading && this.isInputEnabled) {
        this.handleUserInput()
      }
    },
    onInputChange() {
      if (this.messageManager) {
        this.filteredSuggestions = this.messageManager.filterSuggestions(this.userInput)
        this.showSuggestions = true
      }
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

      // 发出开始loading事件，让其他界面进入loading状态
      this.$emit('start-loading')

      // 根据领域类型选择数据源
      if (this.verticalType === 'aml') {
        this.callAgentForRecommendation(input)
      } else {
        this.useFakeData(input)
      }
    },
    // 获取思考过程标题
    getThinkingTitle(thinking) {
      if (!thinking) return ''
      // 如果有自定义标题，优先使用
      if (thinking.title) {
        return thinking.title
      }
      // 根据状态显示相应标题
      if (thinking.finished) {
        return `已生成元应用 (共用${thinking.step}步)`
      } else {
        return `智能体决策中 (第${thinking.step}步)`
      }
    },
    // 切换思考过程的展示状态
    toggleThinking(index) {
      if (this.messages[index] && this.messages[index].type === 'agent' && this.messages[index].thinking) {
        this.$set(this.messages[index].thinking, 'collapsed', !this.messages[index].thinking.collapsed)
      }
    },
    // 添加或更新思考过程消息
    updateThinkingMessage(thought, step) {
      if (this.thinkingMessageIndex === -1) {
        // 创建新的智能体消息，替换loading消息
        const loadingIndex = this.messages.findIndex(msg => msg.text === 'agentLoading')
        if (loadingIndex !== -1) {
          this.$set(this.messages, loadingIndex, {
            type: 'agent',
            thinking: {
              thought: thought,
              step: step,
              collapsed: false,
              finished: false
            },
            result: null,
            isUser: false
          })
          this.thinkingMessageIndex = loadingIndex
        }
      } else {
        // 更新现有的思考消息
        this.$set(this.messages[this.thinkingMessageIndex].thinking, 'thought', thought)
        this.$set(this.messages[this.thinkingMessageIndex].thinking, 'step', step)
      }
      this.scrollToBottom()
    },
    // 完成思考过程，自动收起
    finishThinking() {
      if (this.thinkingMessageIndex !== -1) {
        const agentMessage = this.messages[this.thinkingMessageIndex]
        if (agentMessage.thinking) {
          this.$set(agentMessage.thinking, 'collapsed', true)
          this.$set(agentMessage.thinking, 'finished', true)
          // 标题由getThinkingTitle方法动态计算，不需要手动设置
        }
      }
      // 注意：不重置 thinkingMessageIndex，因为后续还需要在同一消息中添加结果
    },
    // 调用智能体获取推荐服务
    callAgentForRecommendation(input) {
      const formData = new FormData()
      formData.append('message', input)
      formData.append('service_type', this.verticalType)

      streamAgent('/api/agent/mcp_service_recommendation', formData, {
        onStart: () => {
          console.log('开始智能体服务推荐')
        },
        onStep: (data) => {
          console.log('智能体执行步骤:', data)
          // 更新思考过程展示
          if (data.thought && data.step) {
            this.updateThinkingMessage(data.thought, data.step)
          }
        },
        onError: (error) => {
          console.error('智能体推荐失败:', error)
          this.finishThinking() // 结束思考过程
          this.$emit('stop-loading') // 停止loading状态
          const outputMessage = this.messageManager.getErrorReply()
          this.agentTypeWriter(outputMessage)
          this.isInputEnabled = true
        },
        onWarning: (warning) => {
          console.warn('智能体推荐警告:', warning)
          this.finishThinking() // 结束思考过程
          this.$emit('stop-loading') // 停止loading状态
          const outputMessage = this.messageManager.getErrorReply()
          this.agentTypeWriter(outputMessage)
          this.isInputEnabled = true
        },
        onFinalResult: (results) => {
          console.log('智能体推荐结果:', results)
          this.handleAgentResponse(results)
        },
        onComplete: () => {
          console.log('智能体推荐完成')
        },
        onDataProcessError: (error) => {
          console.error('智能体数据处理错误:', error)
          this.finishThinking() // 结束思考过程
          this.$emit('stop-loading') // 停止loading状态
          const outputMessage = this.messageManager.getErrorReply()
          this.agentTypeWriter(outputMessage)
          this.isInputEnabled = true
        }
      })
    },
    // 处理智能体返回的数据
    handleAgentResponse(results) {
      try {
        // 完成思考过程
        this.finishThinking()
        // eslint-disable-next-line camelcase
        const { recommendation_result } = results
        // 检查返回数据格式
        if (recommendation_result.success) {
          // eslint-disable-next-line camelcase
          const { result } = recommendation_result
          // 转换数据格式以适配现有系统
          const flowData = {
            preName: result.preName,
            preInputName: result.preInputName,
            preOutputName: result.preOutputName,
            nodeList: result.nodeList
          }
          // 生成服务节点和选中服务列表
          const { chosenServices, serviceNodes } = generateServiceNodes(flowData, this.verticalType)
          // 生成成功回复消息
          const outputMessage = this.messageManager.generateSuccessReply(chosenServices)
          // 向父组件发送数据
          this.$emit('update-services', serviceNodes)
          this.$emit('update-flow', flowData)
          this.placeholder = '已智能生成元应用'
          this.isGenerated = true
          // 使用agentTypeWriter在智能体消息中显示结果
          this.agentTypeWriter(outputMessage)
        } else {
          this.$emit('stop-loading') // 停止loading状态
          const outputMessage = this.messageManager.getErrorReply()
          this.agentTypeWriter(outputMessage)
          this.isInputEnabled = true
        }
      } catch (error) {
        console.error('处理智能体返回数据失败:', error)
        this.$emit('stop-loading') // 停止loading状态
        const outputMessage = this.messageManager.getErrorReply(true)
        this.agentTypeWriter(outputMessage)
        this.isInputEnabled = true
      }
    },
    // 使用假数据的逻辑
    useFakeData(input) {
      getMetaAppNodes(this.verticalType, input).then((flowData) => {
        // 使用utils中的方法生成服务节点
        const { chosenServices, serviceNodes } = generateServiceNodes(flowData, this.verticalType)
        const outputMessage = this.messageManager.generateSuccessReply(chosenServices)
        this.typeWriter(outputMessage)
        this.$emit('update-services', serviceNodes)
        this.$emit('update-flow', flowData)
        this.placeholder = '已智能生成元应用'
        this.isGenerated = true
      }).catch(() => {
        this.$emit('stop-loading') // 停止loading状态
        const outputMessage = this.messageManager.getErrorReply()
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
    // 智能体消息的打字机效果
    agentTypeWriter(text) {
      if (this.thinkingMessageIndex !== -1) {
        const agentMessage = this.messages[this.thinkingMessageIndex]
        if (this.currentIndex < text.length) {
          this.$set(agentMessage, 'result', text.substring(0, this.currentIndex + 1))
          this.currentIndex++
          setTimeout(() => this.agentTypeWriter(text), 20)
        } else {
          this.userInput = ''
          this.isInputLoading = false
          this.currentIndex = 0
          this.thinkingMessageIndex = -1 // 完成后重置索引
          this.scrollToBottom()
        }
      } else {
        // 如果没有思考过程，则创建一个纯结果的智能体消息
        const loadingIndex = this.messages.findIndex(msg => msg.text === 'agentLoading')
        if (loadingIndex !== -1) {
          this.$set(this.messages, loadingIndex, {
            type: 'agent',
            thinking: null,
            result: text,
            isUser: false
          })
          this.userInput = ''
          this.isInputLoading = false
          this.currentIndex = 0
          this.scrollToBottom()
        } else {
          // 回退到普通消息处理
          this.messages.push({ text: '', isUser: false })
          this.typeWriter(text)
        }
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
      this.placeholder = this.messageManager ? this.messageManager.getPlaceholder() : ''
      this.messages = []
      this.isInputEnabled = true
      this.isInputLoading = false
      this.isGenerated = false
      this.showSuggestions = false
      this.filteredSuggestions = this.messageManager ? this.messageManager.getSuggestions() : []
      this.thinkingMessageIndex = -1 // 重置思考消息索引
      const initialMessage = this.messageManager ? this.messageManager.getInitialMessage() : '智能体未获取到必要信息，请刷新后重试'
      this.messages.push({ text: initialMessage, isUser: false })
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
  width: 230px;
}

.user-message {
  align-self: flex-end;
  background-color: #4a90e2;
  color: #fff;
  width: auto;
  max-width: 230px;
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

.loading-text-wrapper {
  padding-right: 15px;
  width: auto;
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

/* 智能体消息容器样式 */
.agent-message-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  width: 230px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 思考过程部分样式 */
.thinking-section {
  background-color: #f8f9fa;
}

.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f1f3f4;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.thinking-header:hover {
  background-color: #e8eaed;
}

.thinking-toggle {
  color: #5f6368;
  font-size: 12px;
  margin-right: 8px;
  transition: transform 0.2s ease;
}

.thinking-title {
  display: flex;
  align-items: center;
  flex: 1;
  font-weight: 400;
  color: #5f6368;
  font-size: 12px;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.thinking-dot {
  width: 4px;
  height: 4px;
  background-color: #4a90e2;
  border-radius: 50%;
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

.thinking-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking-pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.thinking-content {
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e9ecef;
  animation: thinking-expand 0.3s ease-out;
}

@keyframes thinking-expand {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 300px;
    padding-top: 16px;
    padding-bottom: 16px;
  }
}

.thinking-text {
  color: #9aa0a6;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

/* 结果部分样式 */
.result-section {
  background-color: #ffffff;
  border-top: 1px solid #e9ecef;
  padding: 16px;
}

.result-section .message-content {
  margin: 0;
  padding: 0;
  box-shadow: none;
  background: transparent;
  color: #333;
}

/* 智能体消息外层容器样式 */
.agent-message-wrapper {
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

/* 智能体连接状态样式 */
.agent-connecting {
  display: flex;
  align-items: center;
  border-radius: 8px;
  color: #5f6368;
  font-size: 14px;
}

.connecting-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
}

.connecting-dot {
  width: 4px;
  height: 4px;
  background-color: #9aa0a6;
  border-radius: 50%;
  animation: connecting-pulse 1.5s ease-in-out infinite;
}

.connecting-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.connecting-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes connecting-pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 智能体消息特殊的样式 */
.chat-message .agent-message-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
