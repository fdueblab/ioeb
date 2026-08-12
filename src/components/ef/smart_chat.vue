<template>
  <div class="chat-container" :class="{ 'chat-container--workbench': workbenchLayout }">
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
    <div class="chat-input">
      <div class="input-wrapper" style="width: 100%; position: relative;" ref="inputWrapper">
        <a-input
          style="width: 100%; padding-right: 44px"
          v-model="userInput"
          :placeholder="placeholder"
          :disabled="!canTypeInput"
          @input="onInputChange"
          @focus="activateSuggestions"
          @blur="hideSuggestionsDelayed"
          @keydown.enter.prevent="handleUserInput"
          ref="inputElement"
        />
        <a-button
          type="primary"
          icon="deployment-unit"
          @click="handleUserInput"
          :loading="isInputLoading"
          :disabled="!canSubmit"
          class="submit-button"
        />
        <div
          class="suggestion-dropdown"
          v-if="allowInputSuggestions && showSuggestions && filteredSuggestions.length > 0 && canTypeInput"
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
import { ChatMessageManager } from './chat_messages'
import { streamAgent, callAgentApi } from '@/utils/request'
import { buildCanvasFlow, flowServiceNames } from './utils'
import { batchGetServices } from '@/api/service'
import {
  getMetaAppNodes,
  generateMockSteps,
  matchesScheduleDemoInput
} from '@/mock/data/meta_apps_data'
import { matchesTopicDemoInput } from '@/mock/data/topic_demo_route'
import { runTopicMockScenarioIntakeTurn, toScenarioIntakeEvent } from '@/mock/data/topic_scenario_intake'

export default {
  name: 'SmartChat',
  props: {
    verticalType: {
      type: String,
      required: true
    },
    workbenchLayout: {
      type: Boolean,
      default: false
    }
  },
  beforeDestroy() {
    // 清理定时器
    if (this.stepTypewriterTimer) {
      clearTimeout(this.stepTypewriterTimer)
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
      showSuggestions: false,
      allowInputSuggestions: true,
      messageManager: null,
      filteredSuggestions: [],
      thinkingMessageIndex: -1,
      stepTypewriterTimer: null,
      receivedFinalResult: false,
      agentSessionId: null,
      intakeSessionId: null,
      topicMockIntakeSession: null,
      scenarioSummary: '',
      scenarioParsed: null,
      userRemark: '',
      hasGeneratedRecommendation: false
    }
  },
  computed: {
    canTypeInput() {
      return this.isInputEnabled && !this.isInputLoading
    },
    canSubmit() {
      return this.canTypeInput && !!this.userInput.trim()
    },
    canRegenerate() {
      return this.messages.some((m) => m.isUser) && !this.isInputLoading
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
    onInputChange() {
      if (!this.allowInputSuggestions || !this.messageManager) return
      this.filteredSuggestions = this.messageManager.filterSuggestions(this.userInput)
      this.showSuggestions = true
    },
    activateSuggestions() {
      if (!this.allowInputSuggestions) return
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
    beginAgentTurn() {
      if (this.stepTypewriterTimer) {
        clearTimeout(this.stepTypewriterTimer)
        this.stepTypewriterTimer = null
      }
      this.thinkingMessageIndex = -1
      this.receivedFinalResult = false
      this.currentIndex = 0
    },

    finishAgentTurn() {
      this.isInputLoading = false
      this.isInputEnabled = true
      this.thinkingMessageIndex = -1
      this.currentIndex = 0
    },

    handleRegenerate() {
      if (!this.canRegenerate) return
      this.$emit('stop-loading')
      this.$emit('regenerate')
      this.init()
    },

    handleUserInput() {
      if (!this.canSubmit) return
      this.allowInputSuggestions = false
      this.showSuggestions = false
      const shouldUseReadyScenario = !!this.scenarioParsed
      this.beginAgentTurn()
      this.isInputLoading = true
      this.isInputEnabled = false
      this.messages.push({ text: this.userInput, isUser: true })
      this.$emit('regenerate-available')
      this.messages.push({ text: 'agentLoading', isUser: false })
      this.scrollToBottom()
      const input = this.userInput.trim()
      this.userInput = ''

      // 课题演示 → 进程内 mock 推荐；其余（含 health）→ 真实想定追问再推荐
      if (matchesScheduleDemoInput(input)) {
        // 新的演示示例优先，不能被上一次待补充会话当成回答。
        this.topicMockIntakeSession = null
        if (this.handleTopicMockScenarioIntake(input)) return
        this.$emit('start-loading')
        this.useScheduleDemoData(input)
      } else if (this.topicMockIntakeSession) {
        this.handleTopicMockScenarioIntake(input)
      } else if (shouldUseReadyScenario) {
        this.$emit('start-loading')
        this.callAgentForRecommendation(input)
      } else {
        this.callScenarioIntake(input)
      }
    },

    handleTopicMockScenarioIntake(input) {
      const turn = runTopicMockScenarioIntakeTurn({
        message: input,
        session: this.topicMockIntakeSession
      })
      if (!turn) return false

      if (turn.status === 'question') {
        this.topicMockIntakeSession = turn.session
        this.placeholder = '请补充想定信息…'
        this.playMockAgentIntakeReply({
          thought: '正在解析课题一报告生成需求…',
          result: this.formatIntakeQuestionHtml(turn.text, turn.hint),
          finishedTitle: '想定待补充'
        })
        return true
      }

      this.topicMockIntakeSession = null
      const intakeEvent = toScenarioIntakeEvent(turn.intake)
      this.scenarioSummary = intakeEvent.scenarioSummary || ''
      this.scenarioParsed = intakeEvent.scenarioParsed || null
      this.userRemark = intakeEvent.userRemark || ''
      this.$emit('scenario-intake', intakeEvent)
      this.playMockAgentIntakeReply({
        thought: '已将补充要求写入课题一结构化想定…',
        result: turn.text,
        finishedTitle: '想定已就绪',
        onComplete: () => {
          this.beginAgentTurn()
          this.isInputLoading = true
          this.isInputEnabled = false
          this.messages.push({ text: 'agentLoading', isUser: false })
          this.scrollToBottom()
          this.$emit('start-loading')
          this.useScheduleDemoData(turn.initialInput, turn.analysisChoice)
        }
      })
      return true
    },

    formatIntakeQuestionHtml(text, hint) {
      if (!hint) return text
      return `${text}<br/><br/><span style="color:#888;font-size:12px;">提示：${hint}</span>`
    },

    playMockAgentIntakeReply({ thought, result, finishedTitle, onComplete }) {
      setTimeout(() => {
        this.updateThinkingMessage(thought, 1)
        setTimeout(() => {
          if (this.thinkingMessageIndex !== -1) {
            this.$set(this.messages[this.thinkingMessageIndex].thinking, 'title', finishedTitle)
          }
          this.handleFinalStep()
          this.currentIndex = 0
          this.typeAgentResult(result, onComplete)
        }, 900)
      }, 800)
    },

    typeAgentResult(text, onComplete) {
      if (this.thinkingMessageIndex === -1) {
        this.agentTypeWriter(text)
        if (onComplete) setTimeout(onComplete, text.length * 20 + 80)
        return
      }
      const message = this.messages[this.thinkingMessageIndex]
      let index = 0
      const tick = () => {
        if (index < text.length) {
          this.$set(message, 'result', text.substring(0, ++index))
          this.scrollToBottom()
          setTimeout(tick, 20)
          return
        }
        this.finishAgentTurn()
        this.scrollToBottom()
        if (onComplete) onComplete()
      }
      tick()
    },

    removeAgentLoadingMessage() {
      const idx = this.messages.findIndex((m) => m.text === 'agentLoading')
      if (idx !== -1) this.messages.splice(idx, 1)
    },

    async callScenarioIntake(input) {
      const formData = new FormData()
      formData.append('message', input)
      formData.append('domain', this.verticalType)
      if (this.intakeSessionId) {
        formData.append('session_id', this.intakeSessionId)
      }

      try {
        const res = await callAgentApi('/api/agent/scenario_intake', formData)
        if (!res.success) {
          throw new Error('想定追问失败')
        }
        if (res.session_id) {
          this.intakeSessionId = res.session_id
        }

        this.removeAgentLoadingMessage()

        if (res.status === 'question') {
          const text = res.hint ? `${res.text}<br/><span style="color:#888;font-size:12px;">提示：${res.hint}</span>` : res.text
          this.messages.push({ text, isUser: false })
          this.placeholder = '请补充想定信息…'
          this.finishAgentTurn()
          this.scrollToBottom()
          return
        }

        if (res.status === 'ready') {
          this.scenarioSummary = res.scenarioSummary || ''
          this.scenarioParsed = res.scenarioParsed || null
          this.userRemark = res.userRemark || ''
          this.$emit('scenario-intake', {
            scenarioParsed: this.scenarioParsed,
            scenarioSummary: this.scenarioSummary,
            userRemark: this.userRemark,
            intakeSessionId: this.intakeSessionId
          })
          if (res.text) {
            this.messages.push({ text: res.text, isUser: false })
            this.scrollToBottom()
          }
          this.messages.push({ text: 'agentLoading', isUser: false })
          this.scrollToBottom()
          this.$emit('start-loading')
          this.callAgentForRecommendation(input)
          return
        }

        throw new Error('想定追问返回未知状态')
      } catch (error) {
        console.error('想定追问失败:', error)
        this.removeAgentLoadingMessage()
        this.$emit('stop-loading')
        const outputMessage = this.messageManager.getErrorReply(error.kind)
        this.messages.push({ text: outputMessage, isUser: false })
        this.finishAgentTurn()
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

    callAgentForRecommendation(input) {
      const formData = new FormData()
      formData.append('message', input)
      formData.append('service_type', this.verticalType)
      if (this.scenarioSummary) {
        formData.append('scenario_summary', this.scenarioSummary)
      }
      if (this.scenarioParsed) {
        formData.append('scenario_parsed', JSON.stringify(this.scenarioParsed))
      }
      if (this.userRemark) {
        formData.append('user_remark', this.userRemark)
      }
      if (this.agentSessionId) {
        formData.append('session_id', this.agentSessionId)
      }

      streamAgent('/api/agent/mcp_service_recommendation', formData, {
        onStart: () => {
          console.log('开始智能体服务推荐')
        },
        onSessionInfo: (info) => {
          if (info.session_id) {
            this.agentSessionId = info.session_id
            console.log('会话已建立:', this.agentSessionId)
          }
        },
        onStep: (data) => {
          console.log('智能体执行步骤:', data)
          // 更新思考过程展示
          if (data.thought && data.step) {
            this.updateThinkingMessage(data.thought, data.step)
          }
        },
        onError: (error, kind) => {
          console.error('智能体推荐失败:', error)
          this.$emit('stop-loading')
          const outputMessage = this.messageManager.getErrorReply(kind)
          this.agentTypeWriter(outputMessage)
        },
        onWarning: (warning) => {
          console.warn('智能体推荐警告:', warning)
          this.$emit('stop-loading')
          const outputMessage = this.messageManager.getErrorReply('server')
          this.agentTypeWriter(outputMessage)
        },
        onFinalResult: (results) => {
          console.log('智能体推荐结果:', results)
          this.receivedFinalResult = true
          this.handleFinalStep()
          this.handleAgentResponse(results)
        },
        onComplete: () => {
          console.log('智能体推荐完成')
          this.$emit('stop-loading')
          if (this.isInputLoading && !this.receivedFinalResult) {
            const outputMessage = this.messageManager.getErrorReply('server')
            this.agentTypeWriter(outputMessage)
          }
        },
        onDataProcessError: (error) => {
          console.error('智能体数据处理错误:', error)
          this.$emit('stop-loading')
          const outputMessage = this.messageManager.getErrorReply('server')
          this.agentTypeWriter(outputMessage)
        }
      })
    },
    // 处理智能体返回的数据
    async handleAgentResponse(results) {
      try {
        // eslint-disable-next-line camelcase
        const { recommendation_result } = results
        if (!recommendation_result?.success) {
          const failText = recommendation_result?.result
          if (typeof failText !== 'string' || !failText.trim()) {
            throw new Error('推荐失败结果缺少可展示内容')
          }
          this.$emit('stop-loading')
          this.agentTypeWriter(failText.trim())
          return
        }
        // eslint-disable-next-line camelcase
        const { result } = recommendation_result
        const serviceIds = result.serviceIds
        if (!Array.isArray(serviceIds) || !serviceIds.length) {
          throw new Error('推荐结果未包含有效服务 ID')
        }
        const response = await batchGetServices(serviceIds)
        if (response?.status !== 'success' || !response.services?.length) {
          throw new Error(response?.message || '获取服务目录失败')
        }
        const flowData = buildCanvasFlow({
          preName: result.preName,
          preDes: result.preDes || this.userRemark || '',
          preInputName: result.preInputName,
          preOutputName: result.preOutputName
        }, response.services, serviceIds)
        flowData.scenarioSummary = this.scenarioSummary || ''
        flowData.scenarioParsed = this.scenarioParsed || null
        const outputMessage = this.messageManager.generateSuccessReply(flowServiceNames(flowData))
        this.$emit('apply-flow', flowData)
        this.hasGeneratedRecommendation = true
        this.placeholder = '可继续对话补充想定，或打开仿真构建前在准备页编辑'
        this.agentTypeWriter(outputMessage)
      } catch (error) {
        console.error('处理智能体返回数据失败:', error)
        this.$emit('stop-loading')
        this.agentTypeWriter(this.messageManager.getErrorReply('server'))
      }
    },
    useScheduleDemoData(input, analysisChoice = null) {
      const steps = generateMockSteps(this.verticalType, input, analysisChoice)
      const runStep = (idx) => {
        if (idx >= steps.length) return this.finishScheduleDemo(input, analysisChoice)
        const step = steps[idx]
        setTimeout(() => {
          this.updateThinkingMessage(step.thought, step.step)
          runStep(idx + 1)
        }, 800 + Math.random() * 900)
      }
      runStep(0)
    },
    finishScheduleDemo(input, analysisChoice = null) {
      this.handleFinalStep()
      const isTopic = matchesTopicDemoInput(input)
      getMetaAppNodes(this.verticalType, input, analysisChoice)
        .then((flowData) => {
          if (isTopic && flowData.scenarioParsed && !this.scenarioParsed) {
            const intakeEvent = toScenarioIntakeEvent({
              scenarioParsed: flowData.scenarioParsed,
              scenarioSummary: flowData.scenarioSummary,
              userRemark: flowData.preDes,
              intakeSessionId: null
            })
            this.scenarioSummary = intakeEvent.scenarioSummary || ''
            this.scenarioParsed = intakeEvent.scenarioParsed || null
            this.userRemark = intakeEvent.userRemark || ''
            this.$emit('scenario-intake', intakeEvent)
          }
          const outputMessage = this.messageManager.generateSuccessReply(flowServiceNames(flowData))
          this.$emit('apply-flow', flowData)
          this.hasGeneratedRecommendation = true
          this.placeholder = isTopic
            ? '可继续对话补充想定，或点击「开始仿真构建」进入构建'
            : '继续补充或调整需求…'
          this.agentTypeWriter(outputMessage)
        })
        .catch((error) => {
          console.error('课题演示流程生成失败:', error)
          this.$emit('stop-loading')
          this.agentTypeWriter(this.messageManager.getErrorReply('server'))
          this.finishAgentTurn()
        })
    },
    typeWriter(text) {
      if (this.currentIndex < text.length) {
        this.messages[this.messages.length - 1].text = text.substring(0, this.currentIndex + 1)
        this.currentIndex++
        setTimeout(() => this.typeWriter(text), 20)
      } else {
        this.finishAgentTurn()
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
          this.finishAgentTurn()
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
          this.finishAgentTurn()
          this.scrollToBottom()
        } else {
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

      this.userInput = ''
      this.placeholder = this.messageManager ? this.messageManager.getPlaceholder() : ''
      this.messages = []
      this.isInputEnabled = true
      this.isInputLoading = false
      this.showSuggestions = false
      this.allowInputSuggestions = true
      this.filteredSuggestions = this.messageManager ? this.messageManager.getSuggestions() : []
      this.thinkingMessageIndex = -1
      this.receivedFinalResult = false
      this.agentSessionId = null
      this.intakeSessionId = null
      this.topicMockIntakeSession = null
      this.scenarioSummary = ''
      this.scenarioParsed = null
      this.userRemark = ''
      this.hasGeneratedRecommendation = false
      const initialMessage = this.messageManager ? this.messageManager.getInitialMessage() : '智能体未获取到必要信息，请刷新后重试'
      this.messages.push({ text: initialMessage, isUser: false })
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
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  :deep(.anticon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.loading-text-wrapper {
  padding-right: 15px;
  width: auto;
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

.chat-container--workbench {
  width: 100%;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-container--workbench .chat-output {
  flex: 1 1 0;
  min-height: 0;
  max-height: none !important;
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-container--workbench .chat-input {
  flex: 0 0 auto;
  flex-shrink: 0;
}

</style>
