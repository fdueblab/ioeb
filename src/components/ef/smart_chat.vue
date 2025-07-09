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
              <!-- 步骤列表 -->
              <div v-for="(step, stepIndex) in message.thinking.steps" :key="stepIndex" class="thinking-step">
                <!-- 步骤标题（只有在有summaryText时显示） -->
                <div v-if="step.summaryText" class="step-summary" @click="toggleStep(index, stepIndex)">
                  <a-icon :type="step.collapsed ? 'down' : 'up'" class="step-expand-icon" />
                  {{ step.summaryText }}
                </div>
                <!-- 步骤内容（当没有summaryText或展开时显示） -->
                <div v-if="!step.summaryText || !step.collapsed" class="step-content">
                  <div class="thinking-text" :class="{ 'step-completed': step.completed }">
                    {{ step.currentText }}
                  </div>
                </div>
              </div>
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
import { getMetaAppNodes, generateMockSteps } from '@/mock/data/meta_apps_data'
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
    // 清理定时器
    if (this.stepTypewriterTimer) {
      clearTimeout(this.stepTypewriterTimer)
    }
    if (this.finalCollapseTimer) {
      clearTimeout(this.finalCollapseTimer)
    }
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
      thinkingMessageIndex: -1, // 追踪思考消息的索引
      stepTypewriterTimer: null, // 步骤打字机定时器
      finalCollapseTimer: null, // 最终收起定时器
      isTaskFinishing: false // 标记任务是否正在结束
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
        if (input.includes('课题')) {
          this.useFakeData(input)
        } else {
          this.callAgentForRecommendation(input)
        }
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
        return `已生成元应用`
      } else {
        return `智能体决策中`
      }
    },
    // 切换思考过程的展示状态
    toggleThinking(index) {
      if (this.messages[index] && this.messages[index].type === 'agent' && this.messages[index].thinking) {
        this.$set(this.messages[index].thinking, 'collapsed', !this.messages[index].thinking.collapsed)
      }
    },
    // 切换步骤的展示状态
    toggleStep(index, stepIndex) {
      if (this.messages[index] && this.messages[index].type === 'agent' && this.messages[index].thinking) {
        this.$set(this.messages[index].thinking.steps[stepIndex], 'collapsed', !this.messages[index].thinking.steps[stepIndex].collapsed)
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
              steps: [],
              currentStep: step,
              collapsed: false,
              finished: false
            },
            result: null,
            isUser: false
          })
          this.thinkingMessageIndex = loadingIndex
        }
      }
      if (this.thinkingMessageIndex !== -1) {
        const thinking = this.messages[this.thinkingMessageIndex].thinking

        // 检查是否是新步骤
        const existingStepIndex = thinking.steps.findIndex(s => s.step === step)

        if (existingStepIndex === -1) {
          // 新步骤：先处理前一步（如果存在且不是第一步）
          if (thinking.steps.length > 0) {
            const prevStep = thinking.steps[thinking.steps.length - 1]
            // 停止当前打字机
            if (this.stepTypewriterTimer) {
              clearTimeout(this.stepTypewriterTimer)
              this.stepTypewriterTimer = null
            }
            // 完全展示前一步的内容
            this.$set(prevStep, 'currentText', prevStep.thought)
            this.$set(prevStep, 'completed', true)
            // 收缩前一步（只有当有新步骤时才收缩）
            this.$set(prevStep, 'collapsed', true)
            this.$set(prevStep, 'summaryText', `第${prevStep.step}步执行完成`)
          }

          // 添加新步骤
          thinking.steps.push({
            step: step,
            thought: thought,
            completed: false,
            collapsed: false,
            currentText: '',
            summaryText: '' // 初始时不设置summaryText
          })

          // 更新当前步骤
          this.$set(thinking, 'currentStep', step)

          // 开始新步骤的打字机效果
          this.startStepTypewriter(thinking.steps.length - 1, thought)
        } else {
          // 更新现有步骤
          const stepObj = thinking.steps[existingStepIndex]
          if (stepObj.thought !== thought) {
            this.$set(stepObj, 'thought', thought)
            // 重新开始打字机效果
            this.startStepTypewriter(existingStepIndex, thought)
          }
        }
      }
      this.scrollToBottom()
    },
    // 步骤打字机效果
    startStepTypewriter(stepIndex, fullText) {
      if (this.stepTypewriterTimer) {
        clearTimeout(this.stepTypewriterTimer)
      }
      const thinking = this.messages[this.thinkingMessageIndex].thinking
      const stepObj = thinking.steps[stepIndex]
      let currentIndex = 0

      const typeNextChar = () => {
        if (currentIndex < fullText.length) {
          this.$set(stepObj, 'currentText', fullText.substring(0, currentIndex + 1))
          currentIndex++
          this.stepTypewriterTimer = setTimeout(typeNextChar, 15) // 快速打字机效果
          this.scrollToBottom()
        } else {
          // 打字完成，标记步骤完成
          this.$set(stepObj, 'completed', true)
          this.$set(stepObj, 'currentText', fullText)
        }
      }
      // 重置当前文本并开始打字
      this.$set(stepObj, 'currentText', '')
      this.$set(stepObj, 'completed', false)
      typeNextChar()
    },
    // 处理最后一步（任务结束时调用）
    handleFinalStep() {
      if (this.thinkingMessageIndex !== -1) {
        const thinking = this.messages[this.thinkingMessageIndex].thinking
        if (thinking.steps.length > 0) {
          const lastStep = thinking.steps[thinking.steps.length - 1]
          // 停止打字机
          if (this.stepTypewriterTimer) {
            clearTimeout(this.stepTypewriterTimer)
            this.stepTypewriterTimer = null
          }
          // 完全展示最后一步的内容，不使用打字机效果
          this.$set(lastStep, 'currentText', lastStep.thought)
          this.$set(lastStep, 'completed', true)
          // 最后一步不收缩，保持collapsed为false

          // 标记思考过程完成
          this.$set(thinking, 'finished', true)

          // 收起所有步骤到大标题内
          this.$set(thinking, 'collapsed', true)
        }
      }
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
          this.$emit('stop-loading') // 停止loading状态
          const outputMessage = this.messageManager.getErrorReply()
          this.agentTypeWriter(outputMessage)
          this.isInputEnabled = true
        },
        onWarning: (warning) => {
          console.warn('智能体推荐警告:', warning)
          this.$emit('stop-loading') // 停止loading状态
          const outputMessage = this.messageManager.getErrorReply()
          this.agentTypeWriter(outputMessage)
          this.isInputEnabled = true
        },
        onFinalResult: (results) => {
          console.log('智能体推荐结果:', results)
          // 标记任务结束并处理最后一步
          this.isTaskFinishing = true
          this.handleFinalStep()
          this.handleAgentResponse(results)
        },
        onComplete: () => {
          console.log('智能体推荐完成')
        },
        onDataProcessError: (error) => {
          console.error('智能体数据处理错误:', error)
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
      // 开始模拟推理过程
      this.fakeThinkingProcess(input)
    },
    // 模拟推理过程
    fakeThinkingProcess(input) {
      // 从meta_apps_data中获取模拟的推理步骤数据
      const mockSteps = generateMockSteps(this.verticalType, input)
      // 模拟步骤执行
      let currentStepIndex = 0
      const executeNextStep = () => {
        if (currentStepIndex < mockSteps.length) {
          const step = mockSteps[currentStepIndex]
          // 模拟延迟
          setTimeout(() => {
            this.updateThinkingMessage(step.thought, step.step)
            currentStepIndex++
            // 继续下一步
            executeNextStep()
          }, 1000 + Math.random() * 1500) // 随机延迟1-2.5秒
        } else {
          this.handleMockFinalResult(input)
        }
      }
      // 开始执行第一步
      executeNextStep()
    },

    // 处理模拟的最终结果
    handleMockFinalResult(input) {
      // 标记任务结束并处理最后一步
      this.isTaskFinishing = true
      this.handleFinalStep()
      // 获取原始数据并处理
      getMetaAppNodes(this.verticalType, input).then((flowData) => {
        // 使用utils中的方法生成服务节点
        const { chosenServices, serviceNodes } = generateServiceNodes(flowData, this.verticalType)
        const outputMessage = this.messageManager.generateSuccessReply(chosenServices)
        // 向父组件发送数据
        this.$emit('update-services', serviceNodes)
        this.$emit('update-flow', flowData)
        this.placeholder = '已智能生成元应用'
        this.isGenerated = true
        // 使用agentTypeWriter在智能体消息中显示结果
        this.agentTypeWriter(outputMessage)
      }).catch(() => {
        this.$emit('stop-loading') // 停止loading状态
        const outputMessage = this.messageManager.getErrorReply()
        this.agentTypeWriter(outputMessage)
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
      // 清理定时器
      if (this.stepTypewriterTimer) {
        clearTimeout(this.stepTypewriterTimer)
        this.stepTypewriterTimer = null
      }
      if (this.finalCollapseTimer) {
        clearTimeout(this.finalCollapseTimer)
        this.finalCollapseTimer = null
      }

      this.userInput = ''
      this.placeholder = this.messageManager ? this.messageManager.getPlaceholder() : ''
      this.messages = []
      this.isInputEnabled = true
      this.isInputLoading = false
      this.isGenerated = false
      this.showSuggestions = false
      this.filteredSuggestions = this.messageManager ? this.messageManager.getSuggestions() : []
      this.thinkingMessageIndex = -1 // 重置思考消息索引
      this.isTaskFinishing = false // 重置任务结束标志
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
  font-size: 14px;
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
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;
}

/* 打字机光标效果 */
.thinking-text::after {
  content: '|';
  color: #4a90e2;
  animation: cursor-blink 1s infinite;
  margin-left: 1px;
}

@keyframes cursor-blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 当步骤完成时隐藏光标 */
.thinking-text.step-completed::after {
  display: none;
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

/* 步骤相关样式 */
.thinking-step {
  margin-bottom: 0;
}

.step-summary {
  font-size: 13px;
  color: #9aa0a6;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.step-expand-icon {
  font-size: 10px;
  color: #9aa0a6;
  transition: transform 0.2s ease;
  margin-right: 8px;
}

.step-content {
  animation: step-appear 0.3s ease-out;
  border-bottom: 1px solid #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  margin-top: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

@keyframes step-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
