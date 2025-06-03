<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-row :gutter="16">
        <a-col :span="24">
          <h2>MCP Server 测试</h2>
          <p>该页面用于对远程SSE MCP Server进行测试，通过Agent与用户对话，执行相关指令。</p>
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form layout="vertical">
            <a-form-item label="服务器地址">
              <a-row :gutter="8">
                <a-col :span="18">
                  <a-input
                    v-model="serverUrl"
                    placeholder="请输入MCP Server地址，例如：https://example.com/api/mcp"
                    allow-clear
                  />
                </a-col>
                <a-col :span="6">
                  <a-select
                    placeholder="选择预设服务器"
                    @change="handleServerSelect"
                    style="width: 100%"
                    v-model="selectedServerIndex"
                  >
                    <a-select-option v-for="(server, index) in serverExamples" :key="index" :value="index">
                      {{ server.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item label="对话内容">
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
                      <div v-if="message.role === 'user'" class="message-header">
                        <a-avatar icon="user" />
                        <span>用户</span>
                      </div>
                      <div v-else class="message-header">
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

export default {
  name: 'McpTest',
  components: {
    AgentExecutionPanel
  },
  data() {
    return {
      serverUrl: '',
      userMessage: '',
      chatMessages: [],
      isWaitingResponse: false,
      selectedServerIndex: undefined,
      selectedMessageIndex: undefined,

      // Agent面板相关状态
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null,

      // 服务器地址示例
      serverExamples: [
        { name: '利奈唑胺给药优化MCP Server', url: 'http://fdueblab.cn:25013/sse' },
        { name: '围标检测MCP Server', url: 'http://fdueblab.cn:26023/sse' }
      ],

      // 消息示例
      messageExamples: [
        {
          title: 'MCP Server 介绍',
          content: '请介绍这个MCP Server的功能和用法'
        }
      ]
    }
  },
  created() {
    // 初始化时添加一条欢迎消息
    this.chatMessages.push({
      role: 'assistant',
      content: '您好！我是MCP测试Agent。请输入您的指令，我会与MCP Server进行交互并执行相应操作。'
    })
  },
  methods: {
    // 处理服务器地址选择
    handleServerSelect(index) {
      if (index !== undefined && this.serverExamples[index]) {
        this.serverUrl = this.serverExamples[index].url
      }
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
      this.chatMessages = [{
        role: 'assistant',
        content: '您好！我是MCP测试Agent。请输入您的指令，我会与MCP Server进行交互并执行相应操作。'
      }]
      // 重置Agent面板
      this.agentSteps = []
      this.agentError = ''
      this.agentWarning = ''
      this.agentFinalResults = null
      this.showAgentPanel = false

      // 重置选择框状态
      this.serverUrl = ''
      this.selectedServerIndex = undefined
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

      // 准备FormData
      const formData = new FormData()
      formData.append('message', message)
      if (this.serverUrl) {
        formData.append('server_url', this.serverUrl)
      }

      // 发送请求到MCP Server
      this.callMcpServer(formData)
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
  height: 60vh;
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
