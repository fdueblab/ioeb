<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-row :gutter="16">
        <a-col :span="24">
          <h2>MCP Server 测试</h2>
          <p>基于智能体通过用户的自然语言指令对远程SSE MCP Server进行测试</p>
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form layout="vertical">
            <a-form-item label="当前服务">
              <a-row>
                <a-col :span="24">
                  <span style="font-weight: bold; font-size: larger">{{ apiList[0].name }}</span>
                  <a-popover title="工具信息">
                    <template slot="content">
                      <p v-for="tool in apiList[0].tools" :key="tool.name">
                        {{ tool.name }}: {{ tool.description }}
                      </p>
                    </template>
                    <a-tag color="cyan" style="margin-left: 20px;">工具列表</a-tag>
                  </a-popover>
                  <a-popover title="服务地址">
                    <template slot="content">
                      <p>{{ apiList[0].url }}</p>
                    </template>
                    <a-tag color="blue" style="margin-left: 10px;">服务地址</a-tag>
                  </a-popover>
                </a-col>
              </a-row>
              <a-row style="margin-top: 10px;">
                <a-col :span="24">
                  <span><b>描述：</b> {{ apiList[0].des }}</span>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item label="与智能体交互">
              <div class="chat-container">
                <div class="chat-header">
                  <span>对话历史</span>
                  <a-button type="link" @click="clearChat" :disabled="isWaitingResponse">
                    <a-icon type="delete" /> 清空对话
                  </a-button>
                </div>
                <div class="chat-messages" ref="chatMessages">
                  <div
                    v-for="(message, index) in chatMessages"
                    :key="index"
                    :class="['message', message.role]"
                  >
                    <div class="message-content">
                      <div v-if="message.role === 'assistant'" class="message-header">
                        <a-avatar icon="robot" />
                        <span>Agent</span>
                      </div>
                      <div class="message-body" v-html="formatMessage(message.content)"></div>
                    </div>
                  </div>
                  <div v-if="isWaitingResponse" class="message assistant">
                    <div class="message-content">
                      <div class="message-header">
                        <a-avatar icon="robot" />
                        <span>Agent</span>
                      </div>
                      <div class="message-body">
                        <a-spin />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="chat-input">
                  <a-row :gutter="8" style="margin-bottom: 8px;">
                    <a-col :span="24">
                      <a-select
                        placeholder="选择示例消息"
                        @change="handleMessageSelect"
                        style="width: 100%"
                        :disabled="isWaitingResponse"
                        v-model="selectedMessageIndex"
                      >
                        <a-select-option v-for="(example, index) in messageExamples" :key="index" :value="index">
                          {{ example.title }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                  <div class="input-container">
                    <a-textarea
                      v-model="userMessage"
                      placeholder="请输入消息... (按Enter发送)"
                      :rows="3"
                      :disabled="isWaitingResponse"
                      @keydown.enter.prevent="handleEnterPress"
                      class="message-textarea"
                    />
                    <a-button
                      type="primary"
                      :loading="isWaitingResponse"
                      :disabled="!userMessage.trim() || isWaitingResponse"
                      @click="sendMessage"
                      class="send-button"
                      shape="circle"
                      icon="left"
                    />
                  </div>
                </div>
              </div>
            </a-form-item>

            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center"
            >
              <a-button type="primary" @click="handleGoBack">返回</a-button>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>
    </a-card>

    <!-- Agent执行面板 -->
    <!-- <agent-execution-panel
      v-if="showAgentPanel"
      :is-running="agentIsRunning"
      :steps="agentSteps"
      :error="agentError"
      :warning="agentWarning"
      :final-results="agentFinalResults"
      @close="closeAgentPanel"
    /> -->
  </page-header-wrapper>
</template>

<script>
import { streamAgent } from '@/utils/request'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { handleFakeResponse, extractResponseContent } from './fakeResponseHandler'

export default {
  name: 'UseMCP',
  components: {
    AgentExecutionPanel
  },
  props: {
    apiList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      userMessage: '',
      initMessage: {
        role: 'assistant',
        content: '您好！我是MCP测试Agent。请输入您的指令，我会调用MCP Server进行相应测试。'
      },
      chatMessages: [],
      isWaitingResponse: false,
      selectedMessageIndex: undefined,

      // Agent面板相关状态
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null,

      // 消息示例 - 根据服务类型动态生成
      messageExamples: []
    }
  },
  created() {
    // 初始化时添加一条欢迎消息
    this.chatMessages.push(this.initMessage)
    // 根据服务类型生成消息示例
    this.generateMessageExamples()
  },
  methods: {
    // 根据服务配置生成消息示例
    generateMessageExamples() {
      // 通用消息示例
      const commonExamples = [
        {
          title: 'MCP Server 介绍',
          content: '请介绍这个MCP Server的功能和用法'
        },
        {
          title: '服务状态检查',
          content: '请检查当前MCP服务的运行状态和功能的完整性'
        }
      ]
      // 从数据库获取特定消息示例
      let specificExamples = []
      if (this.apiList[0].exampleMsg) {
        try {
          specificExamples = this.apiList[0].exampleMsg
        } catch (error) {
          console.error('解析消息示例失败:', error)
          specificExamples = []
        }
      }
      // 合并通用和特定示例
      this.messageExamples = [...commonExamples, ...specificExamples]
    },
    // 处理消息示例选择
    handleMessageSelect(index) {
      if (index !== undefined && this.messageExamples[index]) {
        this.userMessage = this.messageExamples[index].content
      }
    },
    // 处理按下Enter键
    handleEnterPress(e) {
      // 如果不是按住Shift键的情况下按Enter，则发送消息
      if (!e.shiftKey) {
        this.sendMessage()
      }
    },
    // 清空对话历史
    clearChat() {
      this.chatMessages = [this.initMessage]
      // 重置Agent面板
      this.agentSteps = []
      this.agentError = ''
      this.agentWarning = ''
      this.agentFinalResults = null
      this.showAgentPanel = false

      // 重置选择框状态
      this.selectedMessageIndex = undefined
      this.userMessage = ''
    },

    sendMessage() {
      if (!this.userMessage.trim() || this.isWaitingResponse) return

      // 添加用户消息到对话
      this.chatMessages.push({
        role: 'user',
        content: this.userMessage
      })

      const message = this.userMessage
      this.userMessage = ''
      this.isWaitingResponse = true
      this.selectedMessageIndex = undefined // 重置消息选择

      // 重置Agent面板状态
      this.agentSteps = []
      this.agentError = ''
      this.agentWarning = ''
      this.agentFinalResults = null
      this.agentIsRunning = true
      this.showAgentPanel = true

      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      // 检查是否使用假数据
      if (this.apiList[0].isFake) {
        this.handleFakeResponseCall(message)
      } else {
        // 准备FormData
        const formData = new FormData()
        formData.append('message', message)
        formData.append('server_url', this.apiList[0].url)

        // 发送请求到真实的MCP Server
        this.callMcpServer(formData)
      }
    },
    handleGoBack() {
      this.$emit('onGoBack')
    },
    // 调用假数据处理工具
    handleFakeResponseCall(userMessage) {
      handleFakeResponse(this.apiList[0], userMessage, {
        onStart: () => {
          console.log('开始假数据模拟')
          this.agentIsRunning = true
        },
        onStep: (stepData) => {
          this.agentSteps.push(stepData)
        },
        onError: (error) => {
          this.agentError = error
          this.isWaitingResponse = false
          this.agentIsRunning = false

          // 添加错误消息到对话
          this.chatMessages.push({
            role: 'assistant',
            content: `错误: ${error}`
          })

          this.$message.error(`假数据处理失败: ${error}`)
          this.scrollToBottom()
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results
          this.isWaitingResponse = false
          this.agentIsRunning = false

          // 添加响应到对话
          const responseContent = extractResponseContent({ final_result: results })
          this.chatMessages.push({
            role: 'assistant',
            content: responseContent
          })

          this.scrollToBottom()
        },
        onComplete: () => {
          this.isWaitingResponse = false
          this.agentIsRunning = false
        }
      })
    },
    callMcpServer(formData) {
      streamAgent('/api/agent/mcp_test', formData, {
        onStart: () => {
          console.log('开始MCP测试')
          this.agentIsRunning = true
        },
        onStep: (data) => {
          this.agentSteps.push(data)
        },
        onError: (error) => {
          this.agentError = error
          this.isWaitingResponse = false
          this.agentIsRunning = false

          // 添加错误消息到对话
          this.chatMessages.push({
            role: 'assistant',
            content: `错误: ${error}`
          })

          this.$message.error(`MCP测试失败: ${error}`)
          this.scrollToBottom()
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.isWaitingResponse = false
          this.agentIsRunning = false

          // 添加警告消息到对话
          this.chatMessages.push({
            role: 'assistant',
            content: `警告: ${warning}`
          })

          this.$message.warning(`MCP测试警告: ${warning}`)
          this.scrollToBottom()
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results
          this.isWaitingResponse = false
          this.agentIsRunning = false

          // 添加响应到对话
          if (results.mcp_server_list) {
            this.chatMessages.push({
              role: 'assistant',
              content: results.mcp_server_list
            })
          } else if (results.response) {
            this.chatMessages.push({
              role: 'assistant',
              content: results.response
            })
          } else {
            this.chatMessages.push({
              role: 'assistant',
              content: '未能获取到有效的响应'
            })
          }

          this.scrollToBottom()
        },
        onComplete: () => {
          this.isWaitingResponse = false
          this.agentIsRunning = false
        },
        onDataProcessError: (error) => {
          console.error('数据处理错误:', error)
          this.isWaitingResponse = false
          this.agentIsRunning = false

          // 添加错误消息到对话
          this.chatMessages.push({
            role: 'assistant',
            content: `数据处理错误: ${error}`
          })

          this.scrollToBottom()
        }
      })
    },
    closeAgentPanel() {
      this.showAgentPanel = false
    },
    scrollToBottom() {
      const container = this.$refs.chatMessages
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    formatMessage(content) {
      // 简单处理一下换行和链接
      return content
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    }
  }
}
</script>

<style lang="less" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e8e8e8;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 16px;
  max-width: 80%;

  &.user {
    align-self: flex-end;

    .message-content {
      background-color: #1890ff;
      color: white;
      border-radius: 8px 0 8px 8px;
    }

    .message-header {
      color: white;
    }
  }

  &.assistant {
    align-self: flex-start;

    .message-content {
      background-color: white;
      border-radius: 0 8px 8px 8px;
      border: 1px solid #e8e8e8;
    }
  }
}

.message-content {
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .ant-avatar {
    margin-right: 8px;
  }
}

.message-body {
  word-break: break-word;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e8e8e8;
  background-color: white;
}

.input-container {
  display: flex;
  align-items: flex-start;
  position: relative;
}

.message-textarea {
  flex: 1;
  resize: none;
  padding-right: 45px;
  border-radius: 4px;
}

.send-button {
  position: absolute;
  right: 5px;
  bottom: 5px;
}
</style>
