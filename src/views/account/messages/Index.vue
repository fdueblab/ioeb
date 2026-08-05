<template>
  <page-header-wrapper title="我的消息">
    <a-card :bordered="false">
      <a-list
        :loading="loading"
        :data-source="messages"
        item-layout="horizontal"
      >
        <a-list-item slot="renderItem" slot-scope="item" class="message-item-clickable" @click="handleReply(item)">
          <a-list-item-meta>
            <template slot="title">
              <div class="message-title">
                <span>{{ item.serviceName }}</span>
                <a-tag :color="getMessageTypeColor(item.messageType)">
                  {{ getMessageTypeText(item.messageType) }}
                </a-tag>
              </div>
            </template>
            <template slot="description">
              <div class="message-content">
                <div class="message-text">{{ item.content }}</div>
                <div class="message-meta">
                  <span class="sender">来自: {{ item.senderName }}</span>
                  <span class="time">{{ item.createTime | formatDate }}</span>
                </div>
              </div>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </a-list>

      <a-empty
        v-if="!loading && messages.length === 0"
        description="暂无消息"
        style="margin-top: 24px"
      />
    </a-card>

    <message-modal
      ref="messageModal"
      @sent="handleMessageSent"
    />
  </page-header-wrapper>
</template>

<script>
import { getUnreadMessages } from '@/api/service'
import MessageModal from '@/views/account/components/MessageModal'
import moment from 'moment'

export default {
  name: 'AccountMessages',
  components: {
    MessageModal
  },
  data () {
    return {
      loading: false,
      messages: []
    }
  },
  filters: {
    formatDate (timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted () {
    this.loadMessages()
  },
  activated () {
    this.loadMessages()
  },
  methods: {
    async loadMessages () {
      this.loading = true
      try {
        const res = await getUnreadMessages()
        if (res && res.status === 'success') {
          this.messages = res.messages || []
        } else {
          this.$message.error((res && res.message) || '获取消息失败')
        }
      } catch (e) {
        this.$message.error('获取消息失败：' + ((e && e.message) || e))
      } finally {
        this.loading = false
      }
    },
    getMessageTypeText (type) {
      const typeMap = {
        'contact_purchase': '购买联系',
        'use_service': '使用服务',
        'general': '普通消息'
      }
      return typeMap[type] || '未知'
    },
    getMessageTypeColor (type) {
      const colorMap = {
        'contact_purchase': 'blue',
        'use_service': 'green',
        'general': 'default'
      }
      return colorMap[type] || 'default'
    },
    handleReply (item) {
      const serviceData = {
        id: item.serviceId,
        name: item.serviceName
      }
      this.$refs.messageModal.open(serviceData, {
        messageType: item.messageType === 'use_service' ? 'use_service' : 'contact_purchase'
      })
    },
    handleMessageSent () {
      this.$message.success('回复成功')
      this.loadMessages()
    }
  }
}
</script>

<style lang="less" scoped>
.message-item-clickable {
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
}

.message-title {
  display: flex;
  align-items: center;
  gap: 8px;

  > span:first-child {
    font-weight: 600;
    font-size: 16px;
  }
}

.message-content {
  .message-text {
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.85);
  }

  .message-meta {
    display: flex;
    gap: 16px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;

    .sender {
      font-style: italic;
    }
  }
}
</style>
