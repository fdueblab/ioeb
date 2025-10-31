<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-row :gutter="16">
        <a-col :span="24">
          <div class="page-title">
            <a-icon type="robot" class="title-icon" />
            <div>
              <h2>MCP Server 测试</h2>
              <p class="subtitle">基于智能体通过用户的自然语言指令对远程SSE MCP Server进行测试</p>
            </div>
          </div>
        </a-col>
      </a-row>

      <a-divider style="margin: 16px 0;" />

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
                        <a-avatar icon="robot" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" />
                        <span>Agent</span>
                      </div>
                      <div v-if="message.role === 'user'" class="message-header user-header">
                        <span>You</span>
                      </div>
                      <div class="message-body" v-html="formatMessage(message.content)"></div>
                    </div>
                  </div>
                  <div v-if="isWaitingResponse" class="message assistant">
                    <div class="message-content">
                      <div class="message-header">
                        <a-avatar icon="robot" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" />
                        <span>Agent</span>
                      </div>
                      <div class="message-body typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
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
                    >
                      <a-icon type="up" v-if="!isWaitingResponse" />
                    </a-button>
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
/* eslint-disable */
import { streamAgent } from '@/utils/request'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { handleFakeResponse, extractResponseContent } from './fakeResponseHandler'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // 使用暗色代码高亮主题

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
    // 配置 marked
    this.configureMarked()
  },
  methods: {
    // 配置 marked
    configureMarked() {
      marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value
            } catch (err) {
              console.error('代码高亮失败:', err)
            }
          }
          return hljs.highlightAuto(code).value
        },
        pedantic: false,
        gfm: true, // 启用 GitHub Flavored Markdown
        breaks: true, // 支持换行
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
      })
    },
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
      // 使用 marked 解析 Markdown
      try {
        return marked.parse(content)
      } catch (error) {
        console.error('Markdown 解析失败:', error)
        // 降级处理：简单的换行和链接替换
        return content
          .replace(/\n/g, '<br>')
          .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 页面标题样式
.page-title {
  display: flex;
  align-items: center;
  gap: 16px;

  .title-icon {
    font-size: 32px;
    color: #667eea;
  }

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .subtitle {
    margin: 4px 0 0 0;
    color: #666;
    font-size: 14px;
  }
}

// 聊天容器
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-radius: 12px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

// 聊天头部
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  font-size: 15px;

  /deep/ .ant-btn-link {
    color: white;
    opacity: 0.9;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

// 消息列表区域
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #ffffff;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 3px;

    &:hover {
      background: #b0b0b0;
    }
  }
}

// 消息容器
.message {
  margin-bottom: 0;
  max-width: 75%;
  animation: slideIn 0.3s ease-out;

  &.user {
    align-self: flex-end;

    .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .message-header {
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
      margin-bottom: 6px;
      justify-content: flex-end;
    }

    .message-body {
      /deep/ code {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }

      /deep/ a {
        color: white;
        text-decoration: underline;
      }
    }
  }

  &.assistant {
    align-self: flex-start;

    .message-content {
      background-color: #f7f7f8;
      color: #2c3e50;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #e8e8ea;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }
  }
}

// 消息内容
.message-content {
  padding: 14px 18px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

// 消息头部
.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;

  .ant-avatar {
    margin-right: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  span {
    opacity: 0.8;
  }

  &.user-header {
    justify-content: flex-end;
    color: rgba(255, 255, 255, 0.9);
  }
}

// 消息体
.message-body {
  word-break: break-word;
  line-height: 1.65;
  font-size: 14px;

  // Markdown 样式
  /deep/ p {
    margin: 0.6em 0;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  /deep/ h1, /deep/ h2, /deep/ h3, /deep/ h4, /deep/ h5, /deep/ h6 {
    margin: 1.2em 0 0.6em 0;
    font-weight: 600;
    line-height: 1.3;
    &:first-child {
      margin-top: 0;
    }
  }

  /deep/ h1 { font-size: 1.75em; }
  /deep/ h2 { font-size: 1.5em; }
  /deep/ h3 { font-size: 1.25em; }
  /deep/ h4 { font-size: 1.1em; }

  /deep/ ul, /deep/ ol {
    margin: 0.8em 0;
    padding-left: 1.8em;
  }

  /deep/ li {
    margin: 0.3em 0;
  }

  /deep/ blockquote {
    margin: 0.8em 0;
    padding: 0.8em 1.2em;
    border-left: 4px solid #667eea;
    background-color: rgba(102, 126, 234, 0.05);
    color: #555;
    border-radius: 4px;
  }

  /deep/ code {
    padding: 0.2em 0.5em;
    margin: 0;
    font-size: 0.88em;
    background-color: rgba(102, 126, 234, 0.1);
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'SF Mono', 'Courier New', monospace;
    color: #667eea;
    font-weight: 500;
  }

  /deep/ pre {
    margin: 1em 0;
    padding: 16px;
    overflow-x: auto;
    background-color: #2d2d2d;
    border-radius: 8px;
    line-height: 1.5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    code {
      padding: 0;
      margin: 0;
      font-size: 0.88em;
      background-color: transparent;
      border-radius: 0;
      display: block;
      color: #f8f8f2;
      font-weight: normal;
    }
  }

  /deep/ table {
    border-collapse: collapse;
    margin: 1em 0;
    width: 100%;
    overflow: auto;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /deep/ table th,
  /deep/ table td {
    padding: 10px 14px;
    border: 1px solid #e8e8ea;
  }

  /deep/ table th {
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  /deep/ table tr:nth-child(2n) {
    background-color: #f8f9fa;
  }

  /deep/ a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;

    &:hover {
      border-bottom-color: #667eea;
    }
  }

  /deep/ hr {
    height: 2px;
    padding: 0;
    margin: 1.5em 0;
    background: linear-gradient(90deg, transparent, #667eea, transparent);
    border: 0;
  }

  /deep/ img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 0.8em 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /deep/ strong {
    font-weight: 600;
    color: inherit;
  }

  /deep/ em {
    font-style: italic;
  }
}

// 打字动画
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #667eea;
    animation: typing 1.4s infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

// 输入区域
.chat-input {
  padding: 16px 20px 20px;
  border-top: 1px solid #e8e8ea;
  background: linear-gradient(to top, #f8f9fa 0%, #ffffff 100%);

  /deep/ .ant-select {
    .ant-select-selection {
      border-radius: 8px;
      border-color: #e8e8ea;
      transition: all 0.3s;

      &:hover, &:focus {
        border-color: #667eea;
      }
    }
  }
}

.input-container {
  display: flex;
  align-items: flex-end;
  position: relative;
  gap: 10px;
}

.message-textarea {
  flex: 1;
  resize: none;
  border-radius: 12px;
  border: 2px solid #e8e8ea;
  padding: 12px 50px 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s;

  &:hover {
    border-color: #c0c0c0;
  }

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }

  &::placeholder {
    color: #b0b0b0;
  }
}

.send-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /deep/ .anticon {
    font-size: 16px;
  }
}

// 动画
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
</style>
