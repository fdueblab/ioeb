<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="16">
      <a-col :xs="24" :lg="7">
        <a-card title="算法模型云端服务" :bordered="false">
          <a-input-search v-model="search" placeholder="搜索模型名称" style="margin-bottom: 12px" />
          <div class="model-list-scroll">
            <a-spin :spinning="listLoading">
              <a-list :data-source="visibleModels" size="small">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-button type="link" :disabled="loading" @click="selectModel(item)">{{ item.name }}</a-button>
                  <a-tag v-if="item.onlineUsage" :color="item.onlineUsage.canRun ? 'green' : 'orange'">
                    {{ item.onlineUsage.canRun ? '可运行' : item.onlineUsage.status === 'draft' ? '验证未通过' : '待配置' }}
                  </a-tag>
                </a-list-item>
              </a-list>
            </a-spin>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="17">
        <a-card :title="selectedModel ? selectedModel.name : '请选择模型'" :bordered="false">
          <a-empty v-if="!selectedModel" description="请选择左侧算法模型" />
          <a-spin v-else :spinning="loading">
            <a-alert v-if="loadError" type="warning" show-icon :message="loadError" style="margin-bottom: 16px" />
            <template v-if="artifact && artifact.spec">
              <a-descriptions :column="1" size="small" bordered style="margin-bottom: 16px">
                <a-descriptions-item label="版本">{{ artifact.version }}</a-descriptions-item>
                <a-descriptions-item label="用途">{{ artifact.spec.description || '请查看模型说明' }}</a-descriptions-item>
                <a-descriptions-item v-if="artifact.spec.clinicalScope" label="适用范围">{{ artifact.spec.clinicalScope }}</a-descriptions-item>
                <a-descriptions-item label="输出说明">{{ artifact.spec.output && artifact.spec.output.description || '结构化计算结果' }}</a-descriptions-item>
              </a-descriptions>
              <a-alert v-if="artifact.status !== 'ready'" type="warning" show-icon
                       :message="artifact.validationError || '尚未通过平台运行验证，暂不能在线使用'" style="margin-bottom: 16px" />
              <a-form v-else layout="vertical" @submit.prevent="runModel">
                <a-row :gutter="16">
                  <a-col v-for="field in artifact.spec.inputs" :key="field.name" :xs="24" :md="12">
                    <a-form-item :label="field.label + (field.unit ? `（${field.unit}）` : '')" :required="field.required">
                      <a-select v-if="field.options && field.options.length" v-model="values[field.name]" :placeholder="field.description || '请选择'">
                        <a-select-option v-for="option in field.options" :key="option" :value="option">{{ option }}</a-select-option>
                      </a-select>
                      <a-input-number v-else-if="field.type === 'number' || field.type === 'integer'"
                                      v-model="values[field.name]" style="width: 100%"
                                      :step="field.type === 'integer' ? 1 : 0.1" :placeholder="field.description" />
                      <a-switch v-else-if="field.type === 'boolean'" v-model="values[field.name]" />
                      <a-textarea v-else v-model="values[field.name]" :rows="3" :placeholder="field.description" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-button type="primary" html-type="submit" :loading="running">运行算法</a-button>
                <a-button style="margin-left: 8px" @click="resetInputs">清空</a-button>
              </a-form>
              <a-divider v-if="result !== null" />
              <div v-if="result !== null">
                <h3>计算结果</h3>
                <pre style="white-space: pre-wrap; word-break: break-word">{{ formattedResult }}</pre>
              </div>
              <a-collapse v-if="artifact.source && artifact.source.references && artifact.source.references.length" style="margin-top: 16px">
                <a-collapse-panel key="references" header="参考资料">
                  <ul><li v-for="(reference, index) in artifact.source.references" :key="index">
                    {{ reference.title || reference.source || '未命名资料' }}：{{ reference.what_referenced || reference.summary || '未提供摘要' }}
                  </li></ul>
                </a-collapse-panel>
              </a-collapse>
              <a-collapse v-if="artifact.source && artifact.source.generationEvidence" style="margin-top: 8px">
                <a-collapse-panel key="evidence" header="生成与验证说明">
                  <div v-for="(line, index) in artifact.source.generationEvidence" :key="index">{{ line }}</div>
                </a-collapse-panel>
              </a-collapse>
            </template>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </page-header-wrapper>
</template>

<script>
import { getServicesByVerticalType, getAlgorithmArtifact, runAlgorithm } from '@/api/service'
import { getCurrentDomainCode } from '@/utils/domainContext'

export default {
  name: 'AlgorithmCloud',
  data() {
    return {
      models: [],
      search: '',
      selectedModel: null,
      artifact: null,
      values: {},
      result: null,
      loadError: '',
      listLoading: false,
      loading: false,
      running: false,
      selectionToken: 0
    }
  },
  computed: {
    visibleModels() { return this.models.filter(item => item.name.includes(this.search.trim())) },
    formattedResult() { return typeof this.result === 'string' ? this.result : JSON.stringify(this.result, null, 2) }
  },
  created() { this.loadModels() },
  watch: {
    '$route.query.serviceId'(id) {
      if (!id || !this.models.length || (this.selectedModel && this.selectedModel.id === id)) return
      const model = this.models.find(item => item.id === id)
      if (model) this.selectModel(model)
    },
    '$route.query.domain'() { this.loadModels() }
  },
  methods: {
    async loadModels() {
      this.listLoading = true
      this.selectedModel = null
      this.artifact = null
      try {
        const domain = this.$route.query.domain || getCurrentDomainCode()
        const response = await getServicesByVerticalType(domain, { type: 'generated_algorithm' })
        this.models = response.services || []
        const id = this.$route.query.serviceId
        if (id) {
          const selected = this.models.find(item => item.id === id)
          if (selected) await this.selectModel(selected)
          else this.$message.warning('该领域没有找到指定模型')
        }
      } catch (error) {
        this.$message.error('模型列表加载失败')
      } finally {
        this.listLoading = false
      }
    },
    async selectModel(model) {
      const token = ++this.selectionToken
      this.selectedModel = model
      this.artifact = null
      this.result = null
      this.loadError = ''
      this.values = {}
      this.loading = true
      try {
        const response = await getAlgorithmArtifact(model.id)
        if (token !== this.selectionToken) return
        this.artifact = response.artifact
        this.resetInputs()
        if (this.$route.query.serviceId !== model.id) {
          await this.$router.replace({ path: '/algorithm-cloud', query: { domain: model.domain, serviceId: model.id } })
        }
      } catch (error) {
        if (token === this.selectionToken) this.loadError = '该模型尚未配置在线使用，或您无权查看。'
      } finally {
        if (token === this.selectionToken) this.loading = false
      }
    },
    resetInputs() {
      const next = {}
      if (this.artifact && this.artifact.spec) {
        this.artifact.spec.inputs.forEach(field => { if (field.type === 'boolean') next[field.name] = false })
      }
      this.values = next
      this.result = null
    },
    async runModel() {
      if (!this.selectedModel || !this.artifact || this.artifact.status !== 'ready') return
      const modelId = this.selectedModel.id
      this.running = true
      this.result = null
      try {
        const response = await runAlgorithm(modelId, this.values)
        if (this.selectedModel && this.selectedModel.id === modelId) this.result = response.result
      } catch (error) {
        this.$message.error((error && error.message) || '算法运行失败')
      } finally {
        this.running = false
      }
    }
  }
}
</script>

<style scoped>
.model-list-scroll {
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
