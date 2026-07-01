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
  </page-header-wrapper>
</template>

<script>
import { submitFeedback } from '@/api/feedback'

const defaultForm = () => ({ content: '' })

export default {
  name: 'Feedback',
  data() {
    return {
      submitting: false,
      form: defaultForm(),
      rules: {
        content: [{ required: true, message: '请填写反馈内容', trigger: 'blur' }]
      }
    }
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
    handleSubmit() {
      this.$refs.feedbackForm.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          const res = await submitFeedback(this.form)
          if (res && res.status === 'success') {
            this.$message.success('感谢反馈，我们已收到你的建议。')
            this.resetForm()
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
.feedback-card {
  max-width: 760px;
  margin: 0 auto;
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
</style>
