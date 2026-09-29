<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="16">
      <a-col :xs="24" :lg="7">
        <a-card title="临床算法模型" :bordered="false">
          <a-input-search v-model="search" placeholder="搜索模型名称" style="margin-bottom: 12px" />
          <a-spin :spinning="listLoading">
            <a-list :data-source="visibleModels" size="small">
              <a-list-item slot="renderItem" slot-scope="item">
                <a-button type="link" style="white-space: normal; text-align: left; height: auto" @click="selectModel(item)">
                  {{ item.name }}
                </a-button>
              </a-list-item>
            </a-list>
          </a-spin>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="17">
        <a-card :title="selectedModel ? selectedModel.name : '算法模型使用'" :bordered="false">
          <a-alert v-if="isPreview" type="warning" show-icon message="预览模式仅展示当前浏览器保存的模型及输入界面；尚未部署算法运行服务，不能在线计算。" style="margin-bottom: 16px" />
          <a-empty v-if="!selectedModel" description="请选择左侧临床算法模型" />
          <a-spin v-else :spinning="artifactLoading">
            <template v-if="artifact">
              <a-alert
                v-if="artifact.status !== 'ready'"
                type="warning"
                show-icon
                :message="artifact.validationError || '模型尚未通过运行验证，暂不能在线使用'"
                style="margin-bottom: 16px"
              />
              <a-alert
                v-else
                type="info"
                show-icon
                message="本页展示算法输出；请结合模型适用范围理解结果，勿输入可识别患者身份的信息。"
                style="margin-bottom: 16px"
              />
              <a-descriptions :column="1" size="small" bordered style="margin-bottom: 16px">
                <a-descriptions-item label="版本">{{ artifact.version }}</a-descriptions-item>
                <a-descriptions-item label="适用范围">{{ artifact.spec.clinicalScope || '请查看模型说明' }}</a-descriptions-item>
                <a-descriptions-item label="说明">{{ artifact.spec.description || '按下方字段填写后运行' }}</a-descriptions-item>
                <a-descriptions-item label="输出说明">{{ artifact.spec.output.description || '请查看模型返回结果' }}</a-descriptions-item>
              </a-descriptions>
              <a-collapse v-if="artifact.source && artifact.source.references && artifact.source.references.length" style="margin-bottom: 16px">
                <a-collapse-panel key="references" header="资料来源（请核对原文与版本）">
                  <ul>
                    <li v-for="(reference, index) in artifact.source.references" :key="index">
                      {{ reference.title || reference.source || '未命名资料' }}：{{ reference.what_referenced || reference.summary || '未提供摘要' }}
                    </li>
                  </ul>
                </a-collapse-panel>
              </a-collapse>
              <a-form v-if="artifact.status === 'ready' || isPreview" layout="vertical" @submit.prevent="runModel">
                <a-row :gutter="16">
                  <a-col v-for="field in artifact.spec.inputs" :key="field.name" :xs="24" :md="12">
                    <a-form-item :label="field.label + (field.unit ? ` (${field.unit})` : '')" :required="field.required">
                      <a-select v-if="field.options && field.options.length" v-model="inputValues[field.name]" :placeholder="field.description || '请选择'">
                        <a-select-option v-for="option in field.options" :key="option" :value="option">{{ option }}</a-select-option>
                      </a-select>
                      <a-input-number v-else-if="field.type === 'number' || field.type === 'integer'" v-model="inputValues[field.name]" style="width: 100%" :step="field.type === 'integer' ? 1 : 0.1" :placeholder="field.description" />
                      <a-switch v-else-if="field.type === 'boolean'" v-model="inputValues[field.name]" />
                      <a-textarea v-else v-model="inputValues[field.name]" :rows="field.description && field.description.length > 80 ? 4 : 2" :placeholder="field.description" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-button type="primary" html-type="submit" :loading="running" :disabled="isPreview">运行算法</a-button>
                <a-button style="margin-left: 8px" @click="resetInputs">清空</a-button>
                <a-button v-if="isPreview" style="margin-left: 8px" @click="downloadPreviewCode">下载源码</a-button>
              </a-form>
              <a-divider v-if="result !== null" />
              <div v-if="result !== null">
                <h3>计算结果</h3>
                <pre style="white-space: pre-wrap; word-break: break-word">{{ formattedResult }}</pre>
                <a-alert type="info" message="结果基于当前输入与所选算法版本生成；页面不会保存本次输入。" />
              </div>
            </template>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </page-header-wrapper>
</template>

<script>
import { getServicesByVerticalType, getClinicalAlgorithmArtifact, runClinicalAlgorithm } from '@/api/service'
import { IS_CLINICAL_PREVIEW } from '@/utils/domainContext'
import { listPreviewModels, getPreviewModel } from '@/utils/clinicalPreviewStore'

export default {
  name: 'ClinicalAlgorithmUse',
  data() {
    return {
      models: [],
      search: '',
      selectedModel: null,
      artifact: null,
      inputValues: {},
      result: null,
      listLoading: false,
      artifactLoading: false,
      running: false
    }
  },
  computed: {
    isPreview() { return IS_CLINICAL_PREVIEW },
    visibleModels() {
      return this.models.filter(item => item.name.includes(this.search.trim()))
    },
    formattedResult() {
      return typeof this.result === 'string' ? this.result : JSON.stringify(this.result, null, 2)
    }
  },
  created() {
    this.loadModels()
  },
  watch: {
    '$route.query.id'(id) {
      if (!id || !this.models.length) return
      const item = this.models.find(model => model.id === id)
      if (item && (!this.selectedModel || this.selectedModel.id !== id)) this.selectModel(item)
    }
  },
  methods: {
    async loadModels() {
      this.listLoading = true
      try {
        if (IS_CLINICAL_PREVIEW) {
          this.models = listPreviewModels()
        } else {
          const res = await getServicesByVerticalType('clinical', { type: 'generated_algorithm' })
          this.models = (res && res.services) || []
        }
        const id = this.$route.query.id
        const first = this.models.find(item => item.id === id) || this.models[0]
        if (first) await this.selectModel(first)
      } catch (error) {
        this.$message.error('临床算法列表加载失败')
      } finally {
        this.listLoading = false
      }
    },
    async selectModel(model) {
      this.selectedModel = model
      this.artifact = null
      this.result = null
      this.inputValues = {}
      this.artifactLoading = true
      try {
        if (IS_CLINICAL_PREVIEW) {
          const saved = getPreviewModel(model.id)
          this.artifact = saved && saved.artifact
        } else {
          const res = await getClinicalAlgorithmArtifact(model.id)
          this.artifact = res.artifact
        }
        this.resetInputs()
        if (this.$route.query.id !== model.id) {
          await this.$router.replace({ path: '/clinical-algorithm-use', query: { id: model.id } })
        }
      } catch (error) {
        this.$message.warning('该模型尚未配置在线使用')
      } finally {
        this.artifactLoading = false
      }
    },
    resetInputs() {
      const defaults = {}
      if (this.artifact && this.artifact.spec && this.artifact.spec.inputs) {
        this.artifact.spec.inputs.forEach(field => {
          if (field.type === 'boolean') defaults[field.name] = false
        })
      }
      this.inputValues = defaults
      this.result = null
    },
    async runModel() {
      if (IS_CLINICAL_PREVIEW) return
      if (!this.artifact || this.artifact.status !== 'ready') return
      this.running = true
      this.result = null
      try {
        const res = await runClinicalAlgorithm(this.selectedModel.id, this.inputValues)
        this.result = res.result
      } catch (error) {
        this.$message.error((error && error.message) || '算法运行失败')
      } finally {
        this.running = false
      }
    },
    downloadPreviewCode() {
      const saved = getPreviewModel(this.selectedModel.id)
      if (!saved || !saved.code) return
      const url = URL.createObjectURL(new Blob([saved.code], { type: 'text/x-python' }))
      const link = document.createElement('a')
      link.href = url
      link.download = saved.codeFilename || 'clinical_algorithm.py'
      link.click()
      URL.revokeObjectURL(url)
    }
  }
}
</script>
