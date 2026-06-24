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
      <div class="survey-heading">
        <div>
          <div class="survey-title-inline">兴趣调查</div>
          <p>完善画像后，平台会记住您的垂域和技术背景，后续可在个人中心继续修改。</p>
        </div>
        <div class="survey-actions">
          <a-button @click="handleSkip">跳过</a-button>
          <a-button type="primary" :loading="saving" @click="handleSave">保存</a-button>
        </div>
      </div>

      <a-alert
        type="info"
        show-icon
        class="survey-intro"
        message="请选择您希望进入的平台垂域。"
      />

      <div class="survey-card survey-card--highlight">
        <div class="survey-label">前往</div>
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

      <div class="survey-grid">
        <div class="survey-item">
          <div class="survey-label">领域</div>
          <a-select v-model="form.domain" disabled class="survey-control">
            <a-select-option v-for="opt in verticalOptions" :key="opt.code" :value="opt.domain">
              {{ opt.domain }}
            </a-select-option>
          </a-select>
        </div>

        <div class="survey-item survey-upload-card">
          <div class="survey-label">简历快速填充<span class="optional-tip">（可选）</span></div>
          <a-upload
            accept=".pdf,.docx,.txt,.md"
            :file-list="resumeFiles"
            :remove="removeResume"
            :customRequest="handleResumeChoose"
            :multiple="false"
          >
            <a-button :loading="resumeLoading" icon="upload">
              {{ $t('account.settings.profile.survey-upload') }}
            </a-button>
          </a-upload>
        </div>
      </div>

      <div class="survey-item">
        <div class="survey-label">专业<span class="optional-tip">（可选）</span></div>
        <a-select
          v-model="form.major"
          allow-clear
          show-search
          class="survey-control"
          placeholder="请选择专业"
        >
          <a-select-option v-for="opt in majorOptions" :key="opt" :value="opt">{{ opt }}</a-select-option>
        </a-select>
      </div>

      <div class="survey-item">
        <div class="survey-label">职业<span class="optional-tip">（可选）</span></div>
        <a-select
          v-model="form.occupation"
          allow-clear
          show-search
          class="survey-control"
          placeholder="请选择职业"
        >
          <a-select-option v-for="opt in occupationOptions" :key="opt" :value="opt">{{ opt }}</a-select-option>
        </a-select>
      </div>

      <div class="survey-item">
        <div class="survey-label">技术需求<span class="optional-tip">（可多选）</span></div>
        <a-select
          v-model="form.techNeeds"
          mode="multiple"
          allow-clear
          class="survey-control"
          placeholder="请选择技术需求"
        >
          <a-select-option v-for="opt in techNeedsOptions" :key="opt" :value="opt">{{ opt }}</a-select-option>
        </a-select>
      </div>

      <div class="survey-item">
        <div class="survey-label">技术背景<span class="optional-tip">（可选）</span></div>
        <a-textarea
          v-model="form.bio"
          :rows="3"
          placeholder="简要介绍您的研究方向、技术背景或关注点"
        />
      </div>

    </div>

  </a-modal>
</template>

<script>
import {
  MAJOR_OPTIONS,
  OCCUPATION_OPTIONS,
  TECH_NEEDS_OPTIONS
} from '@/utils/profileOptions'
import { readResumeText } from '@/utils/resumeReader'
import { extractFromResume, markSurveyDone } from '@/api/userProfile'

const VERTICAL_OPTIONS = [
  { code: 'aml', label: '跨境支付AI监测', domain: '跨境支付AI监测', enabled: true },
  { code: 'aircraft', label: '无人飞机AI监控', domain: '无人飞机AI监控', enabled: true },
  { code: 'health', label: '乡村医疗AI应用', domain: '乡村医疗AI应用', enabled: true },
  { code: 'agriculture', label: '数字农业AI应用', domain: '数字农业AI应用', enabled: true },
  { code: 'evtol', label: '低空飞行AI应用', domain: '低空飞行AI应用', enabled: true },
  { code: 'ecommerce', label: '跨境电商AI应用', domain: '跨境电商AI应用', enabled: true },
  { code: 'homeAI', label: '家庭陪伴AI应用', domain: '家庭陪伴AI应用', enabled: true }
]

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
        bio: ''
      },
      verticalOptions: VERTICAL_OPTIONS,
      majorOptions: MAJOR_OPTIONS,
      occupationOptions: OCCUPATION_OPTIONS,
      techNeedsOptions: TECH_NEEDS_OPTIONS,
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
    }
  },
  methods: {
    handleVerticalChange () {
      this.form.domain = this.currentVertical ? this.currentVertical.domain : ''
    },
    syncVerticalByDomain (domain) {
      const matched = this.verticalOptions.find(opt => opt.domain === domain || opt.label === domain)
      if (matched) {
        this.form.preferredVertical = matched.code
        this.form.domain = matched.domain
      }
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
        if (s.domain) this.syncVerticalByDomain(s.domain)
        if (s.major) this.form.major = s.major
        if (s.occupation) this.form.occupation = s.occupation
        if (Array.isArray(s.techNeeds) && s.techNeeds.length) {
          this.form.techNeeds = Array.from(new Set([...(this.form.techNeeds || []), ...s.techNeeds]))
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
        techNeeds: [...(this.form.techNeeds || [])],
        interestPoints: [...(this.form.techNeeds || [])],
        bio: this.form.bio || ''
      }
      this.$store.dispatch('SaveProfile', payload)
        .then(() => {
          markSurveyDone()
          this.$message.success(skipped ? `已跳过兴趣点填写，将进入${selected.label}` : '兴趣调查已保存')
          this.$emit('done', selected)
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

.survey-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0 8px;

  p {
    margin: 6px 0 0;
    color: rgba(0, 0, 0, 0.45);
  }
}

.survey-intro {
  margin: 12px 0 16px;
}

.survey-title-inline {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.survey-card {
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #d9ecff;
  border-radius: 8px;
  background: #f7fbff;
}

.survey-card--highlight {
  border-color: #91d5ff;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.survey-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.vertical-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.ant-radio-button-wrapper) {
    margin-bottom: 4px;
    border-radius: 4px;
  }
}

.disabled-tip {
  color: #bfbfbf;
  font-size: 12px;
}

.survey-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
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

.survey-upload-card {
  padding: 12px;
  border: 1px dashed #b7d8ff;
  border-radius: 6px;
  background: #fbfdff;
}

.survey-control {
  width: 100%;
}

@media (max-width: 768px) {
  .survey-heading {
    flex-direction: column;
  }

  .survey-grid {
    grid-template-columns: 1fr;
  }
}
</style>
