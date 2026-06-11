<template>
  <a-modal
    :visible="visible"
    :title="$t('account.settings.profile.survey-title')"
    :width="640"
    :mask-closable="false"
    :keyboard="false"
    @cancel="handleSkip"
  >
    <div class="survey-body">
      <p class="survey-intro">{{ $t('account.settings.profile.survey-intro') }}</p>

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

      <a-divider />

      <div class="survey-item">
        <div class="survey-label">{{ $t('account.settings.profile.domain') }}</div>
        <a-radio-group v-model="form.domain" button-style="solid" class="opt-group">
          <a-radio-button v-for="opt in domainOptions" :key="opt" :value="opt">{{ opt }}</a-radio-button>
        </a-radio-group>
      </div>

      <div class="survey-item">
        <div class="survey-label">{{ $t('account.settings.profile.major') }}</div>
        <a-radio-group v-model="form.major" button-style="solid" class="opt-group">
          <a-radio-button v-for="opt in majorOptions" :key="opt" :value="opt">{{ opt }}</a-radio-button>
        </a-radio-group>
      </div>

      <div class="survey-item">
        <div class="survey-label">{{ $t('account.settings.profile.occupation') }}</div>
        <a-radio-group v-model="form.occupation" button-style="solid" class="opt-group">
          <a-radio-button v-for="opt in occupationOptions" :key="opt" :value="opt">{{ opt }}</a-radio-button>
        </a-radio-group>
      </div>

      <div class="survey-item">
        <div class="survey-label">{{ $t('account.settings.profile.tech-needs') }}</div>
        <a-checkbox-group v-model="form.techNeeds" class="opt-group">
          <a-checkbox v-for="opt in techNeedsOptions" :key="opt" :value="opt">{{ opt }}</a-checkbox>
        </a-checkbox-group>
      </div>
    </div>

    <template v-slot:footer>
      <a-button @click="handleSkip">{{ $t('account.settings.profile.survey-skip') }}</a-button>
      <a-button type="primary" :loading="saving" @click="handleSave">{{ $t('account.settings.profile.survey-save') }}</a-button>
    </template>
  </a-modal>
</template>

<script>
import {
  DOMAIN_OPTIONS,
  MAJOR_OPTIONS,
  OCCUPATION_OPTIONS,
  TECH_NEEDS_OPTIONS
} from '@/utils/profileOptions'
import { readResumeText } from '@/utils/resumeReader'
import { extractFromResume, markSurveyDone } from '@/api/userProfile'

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
        domain: '',
        major: '',
        occupation: '',
        techNeeds: []
      },
      domainOptions: DOMAIN_OPTIONS,
      majorOptions: MAJOR_OPTIONS,
      occupationOptions: OCCUPATION_OPTIONS,
      techNeedsOptions: TECH_NEEDS_OPTIONS,
      resumeFiles: [],
      resumeLoading: false,
      saving: false
    }
  },
  methods: {
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
        if (s.domain) this.form.domain = s.domain
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
      markSurveyDone()
      this.$emit('close')
    },
    handleSave () {
      this.saving = true
      this.$store.dispatch('SaveProfile', { ...this.form })
        .then(() => {
          markSurveyDone()
          this.$message.success(this.$t('account.settings.profile.survey-save-success'))
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
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 12px;
}
.survey-item {
  margin-bottom: 16px;

  .survey-label {
    font-weight: 500;
    margin-bottom: 8px;
  }
  .opt-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
