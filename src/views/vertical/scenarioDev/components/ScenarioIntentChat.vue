<template>
  <div class="intent-chat">
    <div class="intent-chat__header">
      <div class="intent-chat__title">用自然语言说清需求</div>
      <div class="intent-chat__subtitle">我会一步步问清关键点，并完善右侧叙述与上方配置</div>
    </div>

    <div ref="messageList" class="intent-chat__messages">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="intent-chat__row"
        :class="msg.role === 'user' ? 'is-user' : 'is-assistant'"
      >
        <div class="intent-chat__bubble" :class="{ 'is-question': msg.isQuestion }">
          <div class="intent-chat__text">{{ msg.content }}</div>
          <div v-if="msg.summary" class="intent-chat__summary">
            {{ msg.summary }}
          </div>
        </div>
      </div>
      <div v-if="loading" class="intent-chat__row is-assistant">
        <div class="intent-chat__bubble is-loading">正在理解您的需求…</div>
      </div>
    </div>

    <div v-if="suggestionChips.length" class="intent-chat__chips">
      <a-tag
        v-for="(chip, i) in suggestionChips"
        :key="i"
        class="intent-chat__chip"
        @click="sendChip(chip)"
      >
        {{ chip }}
      </a-tag>
    </div>

    <div class="intent-chat__composer">
      <a-textarea
        v-model="draft"
        :rows="3"
        :disabled="disabled || loading"
        placeholder="直接回答上一个问题，或补充您的算法需求…"
        @pressEnter="onPressEnter"
      />
      <a-button
        type="primary"
        icon="send"
        :loading="loading"
        :disabled="disabled || !canSend"
        @click="sendMessage()"
      >
        发送
      </a-button>
    </div>
  </div>
</template>

<script>
import { callAmlScenarioIntake } from '@/api/scenarioDev'

const MAX_FOLLOWUPS = 5

export default {
  name: 'ScenarioIntentChat',
  props: {
    domain: {
      type: String,
      default: 'generic'
    },
    domainTitle: {
      type: String,
      default: ''
    },
    dictionarySnapshot: {
      type: Object,
      default: () => ({})
    },
    partialForm: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      draft: '',
      loading: false,
      sessionId: '',
      messages: [],
      followupCount: 0,
      lastAssistantWasQuestion: true,
      latestHint: ''
    }
  },
  computed: {
    canSend() {
      return !!(this.draft || '').trim()
    },
    suggestionChips() {
      if (this.latestHint) {
        return [this.latestHint]
      }
      const title = this.domainTitle || '当前领域'
      return [
        `想在${title}里识别可疑业务并给出可解释结果`,
        '输入是结构化业务数据',
        '输出风险标签和简要原因'
      ]
    }
  },
  created() {
    this.resetConversation()
  },
  methods: {
    resetConversation() {
      const title = this.domainTitle || '当前领域'
      this.draft = ''
      this.loading = false
      this.sessionId = ''
      this.followupCount = 0
      this.lastAssistantWasQuestion = true
      this.latestHint = '例如：识别跨境支付中的可疑交易，并给出可解释结论'
      this.messages = [{
        role: 'assistant',
        content: `您好！我来帮您理清「${title}」里要做的算法需求。不用懂技术术语，用业务话说就行。先请问：您最想用算法解决什么业务问题？`,
        summary: '',
        isQuestion: true
      }]
      this.$nextTick(() => {
        const el = this.$refs.messageList
        if (el) {
          el.scrollTop = 0
        }
      })
    },
    onPressEnter(e) {
      if (e.ctrlKey || e.metaKey) {
        this.sendMessage()
      }
    },
    sendChip(text) {
      if (this.loading || this.disabled) return
      this.draft = text
      this.sendMessage()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },
    buildChangeSummary(draft, changedFields) {
      if (!draft || !changedFields || !changedFields.length) return ''
      const labels = {
        free_narrative: '需求叙述',
        industry: '行业',
        scenario: '场景',
        technology: '技术',
        algorithm_category: '算法类别',
        category_params: '类别参数',
        model_name: '模型名称'
      }
      const parts = changedFields
        .map(k => labels[k] || k)
        .filter(Boolean)
      return parts.length ? `已更新：${parts.join(' · ')}` : ''
    },
    async sendMessage() {
      const text = (this.draft || '').trim()
      if (!text || this.loading || this.disabled) return

      this.messages.push({ role: 'user', content: text, summary: '', isQuestion: false })
      this.draft = ''
      this.loading = true
      this.$emit('busy', true)
      this.scrollToBottom()

      // 已发生的追问次数：开场后首次为 0；每次 API 返回 question 后 +1
      const requestFollowup = this.followupCount

      try {
        const fd = new FormData()
        fd.append('message', text)
        fd.append('domain', this.domain || 'generic')
        if (this.sessionId) {
          fd.append('session_id', this.sessionId)
        }
        fd.append('partial_form', JSON.stringify(this.partialForm || {}))
        fd.append('dictionary_snapshot', JSON.stringify(this.dictionarySnapshot || {}))
        fd.append('followup_count', String(requestFollowup))

        const res = await callAmlScenarioIntake(fd)
        if (!res || res.success === false) {
          throw new Error((res && res.message) || '对话填表失败')
        }

        if (res.session_id) {
          this.sessionId = res.session_id
        }

        const status = res.status || 'updated'
        const isQuestion = status === 'question'
        if (isQuestion) {
          this.followupCount = Math.min(MAX_FOLLOWUPS, this.followupCount + 1)
        }
        this.lastAssistantWasQuestion = isQuestion
        this.latestHint = isQuestion ? (res.hint || '') : ''

        const formDraft = res.formDraft || {}
        const changedFields = Array.isArray(res.changedFields) ? res.changedFields : []
        const summary = this.buildChangeSummary(formDraft, changedFields)

        this.messages.push({
          role: 'assistant',
          content: res.text || '已收到。',
          summary,
          isQuestion
        })

        if (formDraft && Object.keys(formDraft).length) {
          this.$emit('form-draft', {
            status,
            formDraft,
            changedFields,
            text: res.text || ''
          })
        }
      } catch (e) {
        const raw = (e && e.message) ? e.message : String(e)
        const isTimeout = /timeout|timed out|超时/i.test(raw)
        const isHttp5xx = /状态码：5\d\d|status code:?\s*5\d\d|HTTP错误/i.test(raw)
        const msg = (isTimeout || isHttp5xx)
          ? '智能助手暂时繁忙或网络超时，请稍后重试；您也可先在右侧直接编辑需求叙述。'
          : `暂时无法完成填表：${raw}。您仍可直接在右侧编辑需求叙述。`
        this.lastAssistantWasQuestion = false
        this.latestHint = '稍后再发一次，或直接在右侧补充需求'
        this.messages.push({
          role: 'assistant',
          content: msg,
          summary: '',
          isQuestion: false
        })
      } finally {
        this.loading = false
        this.$emit('busy', false)
        this.scrollToBottom()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.intent-chat {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.intent-chat__header {
  flex-shrink: 0;
  margin-bottom: 10px;
}

.intent-chat__title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.intent-chat__subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.5;
}

.intent-chat__messages {
  flex: none;
  height: 260px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 4px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  -webkit-overflow-scrolling: touch;
}

.intent-chat__row {
  display: flex;
  margin-bottom: 10px;

  &.is-user {
    justify-content: flex-end;
  }

  &.is-assistant {
    justify-content: flex-start;
  }
}

.intent-chat__bubble {
  max-width: 92%;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
}

.is-user .intent-chat__bubble {
  background: #e6f7ff;
  color: rgba(0, 0, 0, 0.85);
  border: 1px solid #91d5ff;
}

.is-assistant .intent-chat__bubble {
  background: #fff;
  color: rgba(0, 0, 0, 0.75);
  border: 1px solid #f0f0f0;
}

.is-assistant .intent-chat__bubble.is-question {
  border-color: #91d5ff;
  background: #f9fcff;
}

.intent-chat__bubble.is-loading {
  color: rgba(0, 0, 0, 0.45);
  font-style: italic;
}

.intent-chat__summary {
  margin-top: 6px;
  font-size: 12px;
  color: #1890ff;
}

.intent-chat__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 4px;
  flex-shrink: 0;
}

.intent-chat__chip {
  cursor: pointer;
  max-width: 100%;
  white-space: normal;
  height: auto;
  line-height: 1.4;
  padding: 4px 8px;
}

.intent-chat__composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  flex-shrink: 0;

  .ant-btn {
    align-self: flex-end;
  }
}
</style>
