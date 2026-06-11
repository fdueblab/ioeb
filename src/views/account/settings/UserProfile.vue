<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16" type="flex" justify="center">
      <a-col :order="isMobile ? 2 : 1" :md="24" :lg="16">

        <!-- 完成度 -->
        <div class="profile-completion">
          <span class="label">{{ $t('account.settings.profile.completion') }}</span>
          <a-progress :percent="completion" size="small" style="max-width: 320px;" />
        </div>

        <!-- 简历自动填充 -->
        <a-alert
          type="info"
          show-icon
          :message="$t('account.settings.profile.resume-tip')"
          style="margin: 12px 0 16px;"
        />
        <a-upload
          accept=".pdf,.docx,.txt,.md"
          :file-list="resumeFiles"
          :remove="removeResume"
          :customRequest="handleResumeChoose"
          :multiple="false"
        >
          <a-button :loading="resumeLoading">
            <a-icon type="upload" /> {{ $t('account.settings.profile.upload-resume') }}
          </a-button>
        </a-upload>

        <a-divider />

        <a-form layout="vertical">
          <a-form-item :label="$t('account.settings.profile.domain')">
            <a-select
              v-model="profile.domain"
              allow-clear
              show-search
              :placeholder="$t('account.settings.profile.select-placeholder')"
            >
              <a-select-option v-for="opt in domainOptions" :key="opt.code" :value="opt.text">
                {{ opt.text }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="$t('account.settings.profile.major')">
            <a-select
              v-model="profile.major"
              allow-clear
              show-search
              :placeholder="$t('account.settings.profile.select-placeholder')"
            >
              <a-select-option v-for="opt in majorOptions" :key="opt" :value="opt">{{ opt }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="$t('account.settings.profile.occupation')">
            <a-select
              v-model="profile.occupation"
              allow-clear
              show-search
              :placeholder="$t('account.settings.profile.select-placeholder')"
            >
              <a-select-option v-for="opt in occupationOptions" :key="opt" :value="opt">{{ opt }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="$t('account.settings.profile.tech-needs')">
            <a-select
              v-model="profile.techNeeds"
              mode="multiple"
              allow-clear
              :placeholder="$t('account.settings.profile.multi-placeholder')"
            >
              <a-select-option v-for="opt in techNeedsOptions" :key="opt" :value="opt">{{ opt }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="$t('account.settings.profile.bio')">
            <a-textarea
              v-model="profile.bio"
              :rows="4"
              :placeholder="$t('account.settings.profile.bio-placeholder')"
            />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" :loading="saving" @click="handleSave">
              {{ $t('account.settings.profile.save') }}
            </a-button>
          </a-form-item>
        </a-form>

      </a-col>
    </a-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { baseMixin } from '@/store/app-mixin'
import { loadDict } from '@/utils/dictionaryCache'
import {
  DOMAIN_OPTIONS,
  MAJOR_OPTIONS,
  OCCUPATION_OPTIONS,
  TECH_NEEDS_OPTIONS
} from '@/utils/profileOptions'
import { readResumeText } from '@/utils/resumeReader'
import { extractFromResume } from '@/api/userProfile'

export default {
  name: 'UserProfile',
  mixins: [baseMixin],
  data () {
    return {
      profile: {
        domain: '',
        major: '',
        occupation: '',
        techNeeds: [],
        bio: ''
      },
      domainOptions: DOMAIN_OPTIONS.map(t => ({ text: t, code: t })),
      majorOptions: MAJOR_OPTIONS,
      occupationOptions: OCCUPATION_OPTIONS,
      techNeedsOptions: TECH_NEEDS_OPTIONS,
      resumeFiles: [],
      resumeLoading: false,
      saving: false
    }
  },
  computed: {
    ...mapGetters(['userProfile', 'profileCompletion']),
    completion () {
      return this.profileCompletion
    }
  },
  created () {
    this.loadFromStore()
    this.loadDomainDict()
  },
  methods: {
    loadFromStore () {
      const p = this.userProfile || {}
      this.profile = {
        domain: p.domain || '',
        major: p.major || '',
        occupation: p.occupation || '',
        techNeeds: Array.isArray(p.techNeeds) ? [...p.techNeeds] : [],
        bio: p.bio || ''
      }
    },
    async loadDomainDict () {
      try {
        const dict = await loadDict('domain', [])
        if (Array.isArray(dict) && dict.length > 0) {
          this.domainOptions = dict.map(it => ({ text: it.text, code: it.code || it.text }))
        }
      } catch (e) {
        // 使用内置 fallback
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
        const suggestion = await extractFromResume(text)
        this.applySuggestion(suggestion)
        this.$message.success('已根据简历自动填充画像，请确认或修改后保存')
      } catch (e) {
        this.$message.error(e.message || '简历解析失败，请改用 txt/pdf 或手动填写')
      } finally {
        this.resumeLoading = false
      }
    },
    applySuggestion (s) {
      if (!s) return
      if (s.domain && !this.profile.domain) this.profile.domain = s.domain
      if (s.major && !this.profile.major) this.profile.major = s.major
      if (s.occupation && !this.profile.occupation) this.profile.occupation = s.occupation
      if (Array.isArray(s.techNeeds) && s.techNeeds.length > 0) {
        const merged = new Set([...(this.profile.techNeeds || []), ...s.techNeeds])
        this.profile.techNeeds = Array.from(merged)
      }
    },
    handleSave () {
      this.saving = true
      this.$store.dispatch('SaveProfile', { ...this.profile })
        .then(() => {
          this.$message.success(this.$t('account.settings.profile.save-success'))
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
.profile-completion {
  display: flex;
  align-items: center;

  .label {
    margin-right: 12px;
    color: rgba(0, 0, 0, 0.65);
    white-space: nowrap;
  }
}
</style>
