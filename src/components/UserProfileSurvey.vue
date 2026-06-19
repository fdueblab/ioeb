<template>
  <a-modal
    :visible="visible"
    title="兴趣调查"
    :width="760"
    :footer="null"
    :mask-closable="false"
    :keyboard="false"
    @cancel="handleSkip"
  >
    <div class="survey-body">
      <div class="survey-header-row">
        <div class="survey-title-inline">兴趣调查</div>
        <div class="survey-target">
          <span class="survey-target-label">前往</span>
          <a-radio-group v-model="form.preferredVertical" button-style="solid" class="vertical-group" @change="handleVerticalChange">
            <a-radio-button
              v-for="opt in verticalOptions"
              :key="opt.code"
              :value="opt.code"
              :disabled="!opt.enabled"
            >
              {{ opt.label }}<span v-if="!opt.enabled" class="disabled-tip">（暂未开通）</span>
            </a-radio-button>
          </a-radio-group>
        </div>
        <div class="survey-actions">
          <a-button type="primary" :loading="saving" @click="handleSave">保存</a-button>
          <a-button @click="handleSkip">跳过</a-button>
        </div>
      </div>

      <a-alert
        type="info"
        show-icon
        class="survey-intro"
        message="请选择您希望进入的平台垂域。系统会根据您的选择，只展示对应垂域的功能入口。下方兴趣点可选填，也可以直接跳过。"
      />

      <div class="survey-item">
        <div class="survey-label">{{ currentVerticalLabel }}兴趣点<span class="optional-tip">（可跳过）</span></div>
        <a-checkbox-group v-model="form.interestPoints" class="opt-group">
          <a-checkbox v-for="opt in currentInterestOptions" :key="opt" :value="opt">{{ opt }}</a-checkbox>
        </a-checkbox-group>
      </div>

      <div class="survey-item">
        <div class="survey-label">身份情况<span class="optional-tip">（可选）</span></div>
        <a-radio-group v-model="form.occupation" button-style="solid" class="opt-group">
          <a-radio-button v-for="opt in occupationOptions" :key="opt" :value="opt">{{ opt }}</a-radio-button>
        </a-radio-group>
      </div>

      <div class="survey-item">
        <div class="survey-label">专业背景<span class="optional-tip">（可选）</span></div>
        <a-radio-group v-model="form.major" button-style="solid" class="opt-group">
          <a-radio-button v-for="opt in majorOptions" :key="opt" :value="opt">{{ opt }}</a-radio-button>
        </a-radio-group>
      </div>

      <a-divider />

      <!-- 简历快速填充 -->
      <a-upload
        accept=".pdf,.docx,.txt,.md"
        :file-list="resumeFiles"
        :remove="removeResume"
        :customRequest="handleResumeChoose"
        :multiple="false"
      >
        <a-button :loading="resumeLoading" size="small">
          <a-icon type="upload" /> {{ $t('account.settings.profile.survey-upload') }}
        </a-button>
      </a-upload>
    </div>

  </a-modal>
</template>

<script>
import {
  MAJOR_OPTIONS,
  OCCUPATION_OPTIONS
} from '@/utils/profileOptions'
import { readResumeText } from '@/utils/resumeReader'
import { extractFromResume, markSurveyDone } from '@/api/userProfile'

const VERTICAL_OPTIONS = [
  { code: 'aml', label: '跨境支付监测', domain: '跨境支付AI监测', enabled: true },
  { code: 'health', label: '心理健康分析', domain: '心理健康分析', enabled: true },
  { code: 'digitalHuman', label: '数智人', domain: '数智人', enabled: false },
  { code: 'uav', label: '无人飞控', domain: '无人飞控', enabled: false },
  { code: 'other', label: '其他垂域', domain: '其他垂域', enabled: false }
]

const INTEREST_OPTIONS_BY_VERTICAL = {
  aml: ['反洗钱监测', '异常交易识别', '跨境资金流向', '商户风险画像', '规则与模型结合', '合规报告生成'],
  health: ['情绪识别', '心理风险筛查', '问卷量表分析', '对话文本分析', '压力趋势观察', '干预建议生成']
}

export default {
  name: 'UserProfileSurvey',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      form: {
        preferredVertical: '',
        domain: '',
        major: '',
        occupation: '',
        techNeeds: [],
        interestPoints: []
      },
      verticalOptions: VERTICAL_OPTIONS,
      majorOptions: MAJOR_OPTIONS,
      occupationOptions: OCCUPATION_OPTIONS,
      resumeFiles: [],
      resumeLoading: false,
      saving: false
    }
  },
  computed: {
    currentVertical() {
      return this.verticalOptions.find(opt => opt.code === this.form.preferredVertical) || null
    },
    currentVerticalLabel() {
      return this.currentVertical ? this.currentVertical.label : '所选垂域'
    },
    currentInterestOptions() {
      return INTEREST_OPTIONS_BY_VERTICAL[this.form.preferredVertical] || []
    }
  },
  methods: {
    handleVerticalChange () {
      const allowed = new Set(this.currentInterestOptions)
      this.form.interestPoints = (this.form.interestPoints || []).filter(item => allowed.has(item))
      this.form.techNeeds = [...this.form.interestPoints]
      this.form.domain = this.currentVertical ? this.currentVertical.domain : ''
    },
    handleResumeChoose (options) {
      const { file } = options
      if (!file) return false
      this.resumeFiles = [{ uid: file.uid, name: file.name, status: 'done' }]
      this.parseResume(file.originFileObj || file)
    },
    removeResume () {
      this.resumeFiles = []
      return true
    },
    async parseResume (rawFile) {
      this.resumeLoading = true
      try {
        const text = await readResumeText(rawFile)
        if (!text || !text.trim()) {
          this.$message.warning('未能从文件中读取到文本内容')
          return
        }
        const s = await extractFromResume(text)
        if (s.domain && !this.form.domain) this.form.domain = s.domain
        if (s.major) this.form.major = s.major
        if (s.occupation) this.form.occupation = s.occupation
        if (Array.isArray(s.techNeeds) && s.techNeeds.length) {
          const merged = Array.from(new Set([...(this.form.interestPoints || []), ...s.techNeeds]))
          const allowed = new Set(this.currentInterestOptions)
          this.form.interestPoints = merged.filter(item => allowed.has(item))
          this.form.techNeeds = [...this.form.interestPoints]
        }
        this.$message.success('已根据简历自动填充，请确认后保存')
      } catch (e) {
        this.$message.error(e.message || '简历解析失败，请手动选择')
      } finally {
        this.resumeLoading = false
      }
    },
    handleSkip () {
      this.form.preferredVertical = this.form.preferredVertical || 'aml'
      this.handleVerticalChange()
      this.persistSurvey(true)
    },
    handleSave () {
      const selected = this.verticalOptions.find(opt => opt.code === this.form.preferredVertical)
      if (!selected || !selected.enabled) {
        this.$message.warning('请选择要前往的垂域')
        return
      }
      this.persistSurvey(false)
    },
    persistSurvey (skipped) {
      this.saving = true
      const selected = this.currentVertical || this.verticalOptions[0]
      const payload = {
        ...this.form,
        preferredVertical: selected.code,
        domain: selected.domain,
        techNeeds: [...(this.form.interestPoints || [])],
        interestPoints: [...(this.form.interestPoints || [])]
      }
      this.$store.dispatch('SaveProfile', payload)
        .then(() => {
          markSurveyDone()
          this.$message.success(skipped ? `已跳过兴趣点填写，将进入${selected.label}` : '兴趣调查已保存')
          this.$emit('done')
        })
        .catch(() => {
          this.$message.error('保存失败')
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
.survey-body {
  max-height: 60vh;
  overflow-y: auto;
}
.survey-intro {
  margin: 12px 0 16px;
}
.survey-header-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.survey-title-inline {
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 600;
  line-height: 32px;
  color: rgba(0, 0, 0, 0.85);
}
.survey-target {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}
.survey-target-label {
  flex: 0 0 auto;
  line-height: 32px;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.85);
}
.vertical-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.disabled-tip {
  color: #bfbfbf;
  font-size: 12px;
}
.survey-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}
.survey-item {
  margin-bottom: 16px;

  .survey-label {
    font-weight: 500;
    margin-bottom: 8px;
  }
  .optional-tip {
    margin-left: 4px;
    color: #8c8c8c;
    font-weight: normal;
    font-size: 12px;
  }
  .opt-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
