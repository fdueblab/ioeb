<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="feedback-card">
      <div class="feedback-title">意见反馈</div>
      <div class="feedback-desc">
        欢迎留下你在使用平台过程中的感受、建议或遇到的问题。
      </div>

      <a-form-model
        ref="feedbackForm"
        :model="form"
        :rules="rules"
        layout="vertical"
        class="feedback-form"
      >
        <a-form-model-item label="反馈内容" prop="content">
          <a-textarea
            v-model="form.content"
            :rows="8"
            placeholder="请输入你的反馈内容"
            :max-length="2000"
          />
        </a-form-model-item>

        <div class="feedback-actions">
          <a-button type="primary" :loading="submitting" @click="handleSubmit">
            提交反馈
          </a-button>
        </div>
      </a-form-model>
    </a-card>

    <a-card :bordered="false" class="feedback-records-card">
      <div class="feedback-title">我的反馈记录</div>
      <a-spin :spinning="loadingRecords">
        <a-table
          v-if="records.length"
          row-key="id"
          :columns="columns"
          :data-source="records"
          :pagination="false"
          size="middle"
        >
          <span slot="content" slot-scope="text">
            <ellipsis :length="80" tooltip>{{ text }}</ellipsis>
          </span>
          <span slot="createdAt" slot-scope="text">
            {{ formatTime(text) }}
          </span>
          <span slot="displayStatus" slot-scope="text, record">
            <a-badge :status="statusBadge(record.status)" :text="text || '待处理'" />
          </span>
          <span slot="responseSummary" slot-scope="text">
            <span v-if="text">{{ text }}</span>
            <span v-else class="no-response">暂无回复，我们会尽快处理</span>
          </span>
        </a-table>
        <a-empty v-else description="暂无反馈记录" />
      </a-spin>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { Ellipsis } from '@/components'
import { submitFeedback, getMyFeedbacks } from '@/api/feedback'

const defaultForm = () => ({ content: '' })

export default {
  name: 'AccountFeedback',
  components: { Ellipsis },
  data() {
    return {
      submitting: false,
      loadingRecords: false,
      form: defaultForm(),
      records: [],
      rules: {
        content: [{ required: true, message: '请填写反馈内容', trigger: 'blur' }]
      },
      columns: [
        {
          title: '反馈内容',
          dataIndex: 'content',
          scopedSlots: { customRender: 'content' }
        },
        {
          title: '提交时间',
          dataIndex: 'createdAt',
          width: 180,
          scopedSlots: { customRender: 'createdAt' }
        },
        {
          title: '处理状态',
          dataIndex: 'displayStatus',
          width: 120,
          scopedSlots: { customRender: 'displayStatus' }
        },
        {
          title: '平台回复',
          dataIndex: 'responseSummary',
          scopedSlots: { customRender: 'responseSummary' }
        }
      ]
    }
  },
  mounted() {
    this.loadRecords()
  },
  activated() {
    this.loadRecords()
  },
  methods: {
    resetForm() {
      this.form = defaultForm()
      this.$nextTick(() => {
        if (this.$refs.feedbackForm) {
          this.$refs.feedbackForm.clearValidate()
        }
      })
    },
    formatTime(timestamp) {
      if (!timestamp) return '-'
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    statusBadge(status) {
      const map = {
        open: 'default',
        processing: 'processing',
        closed: 'success'
      }
      return map[status] || 'default'
    },
    async loadRecords() {
      this.loadingRecords = true
      try {
        const res = await getMyFeedbacks()
        if (res && res.status === 'success') {
          this.records = res.feedbacks || []
        } else {
          this.$message.error((res && res.message) || '获取反馈记录失败')
        }
      } catch (e) {
        const msg = (e && e.message) || e
        if (msg && String(msg).includes('401')) {
          this.$message.warning('请先登录后再查看反馈记录')
        } else {
          this.$message.error('获取反馈记录失败：' + msg)
        }
      } finally {
        this.loadingRecords = false
      }
    },
    handleSubmit() {
      this.$refs.feedbackForm.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          const res = await submitFeedback(this.form)
          if (res && res.status === 'success') {
            this.$message.success('感谢您的意见，我们将进行论证！')
            this.resetForm()
            this.loadRecords()
          } else {
            this.$message.error((res && res.message) || '提交失败，请稍后重试')
          }
        } catch (e) {
          this.$message.error('提交失败：' + ((e && e.message) || e))
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.feedback-card,
.feedback-records-card {
  max-width: 960px;
  margin: 0 auto 16px;
}

.feedback-title {
  font-size: 22px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 8px;
}

.feedback-desc {
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 20px;
}

.feedback-form {
  max-width: 100%;
}

.feedback-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.no-response {
  color: #9ca3af;
}
</style>
