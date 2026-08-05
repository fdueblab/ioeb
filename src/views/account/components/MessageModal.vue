<template>
  <a-modal
    :visible="visible"
    :width="640"
    :title="modalTitle"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <div class="message-container">
        <div class="message-list" ref="messageList">
          <a-empty v-if="messages.length === 0" description="暂无消息，请发送第一条消息" />
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-item', msg.isMine ? 'message-mine' : 'message-other']"
          >
            <div class="message-content">
              <div v-if="!msg.isMine" class="message-sender">{{ msg.senderName || '对方' }}</div>
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.createTime) }}</div>
            </div>
          </div>
        </div>

        <div class="message-input">
          <a-textarea
            v-model="inputMessage"
            placeholder="请输入消息内容"
            :rows="3"
            :max-length="500"
            @pressEnter="handleSend"
          />
          <div class="message-actions">
            <span class="char-count">{{ inputMessage.length }} / 500</span>
            <a-button
              type="primary"
              :loading="sending"
              :disabled="!inputMessage.trim()"
              @click="handleSend"
            >
              发送
            </a-button>
          </div>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { getMessages, sendPurchaseContactMessage, sendUseServiceMessage, replyMessage } from '@/api/service'
import moment from 'moment'

export default {
  name: 'MessageModal',
  data () {
    return {
      visible: false,
      loading: false,
      sending: false,
      messages: [],
      inputMessage: '',
      currentService: null,
      messageType: 'contact_purchase',
      modalTitle: '消息对话'
    }
  },
  methods: {
    open (service, options = {}) {
      this.currentService = service
      this.messageType = options.messageType || 'contact_purchase'
      const typeText = this.messageType === 'use_service' ? '使用服务' : '联系购买'
      this.modalTitle = `${typeText} - ${service.name || '未知服务'}`
      this.visible = true
      this.loadMessages()
    },
    async loadMessages () {
      if (!this.currentService) {
        return
      }

      this.loading = true
      try {
        const res = await getMessages(this.currentService.id)
        if (res && res.status === 'success') {
          this.messages = (res.messages || []).map(msg => ({
            ...msg,
            isMine: msg.isMine || false
          }))
          this.scrollToBottom()
        } else {
          this.$message.error((res && res.message) || '获取消息失败')
        }
      } catch (e) {
        this.$message.error('获取消息失败：' + ((e && e.message) || e))
      } finally {
        this.loading = false
      }
    },
    async handleSend () {
      if (!this.inputMessage.trim()) {
        return
      }

      this.sending = true
      try {
        const payload = {
          serviceId: this.currentService.id,
          content: this.inputMessage.trim()
        }

        let res
        // 如果已有消息，使用回复接口；否则根据类型使用对应接口
        if (this.messages.length > 0) {
          // 找到对方发送的最后一条消息进行回复
          const lastReceivedMsg = [...this.messages].reverse().find(msg => !msg.isMine)
          if (lastReceivedMsg) {
            res = await replyMessage(lastReceivedMsg.id, payload.content)
          } else {
            // 如果没有对方的消息，使用发送接口
            if (this.messageType === 'use_service') {
              res = await sendUseServiceMessage(payload)
            } else {
              res = await sendPurchaseContactMessage(payload)
            }
          }
        } else {
          // 第一条消息，根据类型选择接口
          if (this.messageType === 'use_service') {
            res = await sendUseServiceMessage(payload)
          } else {
            res = await sendPurchaseContactMessage(payload)
          }
        }

        if (res && res.status === 'success') {
          this.$message.success('发送成功')
          this.inputMessage = ''
          this.loadMessages()
          this.$emit('sent')
        } else {
          this.$message.error((res && res.message) || '发送失败')
        }
      } catch (e) {
        this.$message.error('发送失败：' + ((e && e.message) || e))
      } finally {
        this.sending = false
      }
    },
    handleCancel () {
      this.visible = false
      this.messages = []
      this.inputMessage = ''
    },
    scrollToBottom () {
      this.$nextTick(() => {
        const list = this.$refs.messageList
        if (list) {
          list.scrollTop = list.scrollHeight
        }
      })
    },
    formatTime (timestamp) {
      if (!timestamp) return ''
      return moment(timestamp).format('MM-DD HH:mm')
    }
  }
}
</script>

<style lang="less" scoped>
.message-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.message-list {
  flex: 1;
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 16px;
}

.message-item {
  margin-bottom: 16px;
  display: flex;

  &.message-mine {
    justify-content: flex-end;

    .message-content {
      background: #95ec69;
      color: #000;
      max-width: 70%;
      padding: 10px 14px;
      border-radius: 8px 8px 0 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .message-time {
      color: rgba(0, 0, 0, 0.45);
    }
  }

  &.message-other {
    justify-content: flex-start;

    .message-content {
      background: #fff;
      color: #000;
      max-width: 70%;
      padding: 10px 14px;
      border-radius: 8px 8px 8px 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .message-sender {
      color: #1890ff;
      font-weight: 500;
    }

    .message-time {
      color: rgba(0, 0, 0, 0.45);
    }
  }
}

.message-sender {
  font-size: 13px;
  margin-bottom: 4px;
}

.message-text {
  word-break: break-word;
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  margin-top: 4px;
}

.message-input {
  .message-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
}

.char-count {
  font-size: 12px;
  color: #999;
}
</style>
