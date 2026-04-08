<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="想定式开发配置">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="4">
              <a-form-item label="领域">
                <span style="margin-left: 5px; font-size: 14px">{{ domainTitle }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item>
                <span slot="label">行业<span class="label-optional">（选填）</span></span>
                <a-select v-model="programInfo.industry" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item>
                <span slot="label">场景<span class="label-optional">（选填）</span></span>
                <a-select v-model="programInfo.scenario" placeholder="请选择场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item>
                <span slot="label">技术<span class="label-optional">（选填）</span></span>
                <a-select v-model="programInfo.technology" placeholder="请选择技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item required>
                <span slot="label">算法模型名称<span class="label-required-tip">（必填）</span></span>
                <a-input v-model="form.serviceName" placeholder="请输入算法模型名称"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="20" style="margin-top: 8px;">
            <a-col :span="12">
              <a-form-item>
                <span slot="label">想定式描述文件<span class="label-optional">（选填）</span></span>
                <a-upload
                  accept=".pdf,.doc,.docx"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="false">
                  <a-button icon="file-add"> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="20" style="margin-top: 16px;">
            <a-col :span="24">
              <div class="narrative-block">
                <div class="narrative-title">
                  进一步需求和要求请在下面自由叙述<span class="label-required-tip">（必填）</span>
                </div>
                <a-alert
                  type="info"
                  show-icon
                  class="narrative-hint"
                  message="请具体描述您希望生成的算法模型具备哪些功能、输入与输出形式、以及主要使用场景。"
                >
                  <template slot="description">
                    <div class="example-title">正确、完整的描述示例：</div>
                    <div class="example-text">
                      创建一个可以处理图像识别的算法服务：接收图像 URL 或 Base64 图像数据作为输入，返回图像中的主要物体类别标签及置信度列表；服务需支持批量请求，单次最多 32 张图；适用于电商商品图审核场景。
                    </div>
                  </template>
                </a-alert>
                <a-textarea
                  v-model="freeNarrative"
                  :rows="8"
                  class="narrative-textarea"
                  placeholder="请详细描述您希望生成的算法服务功能，例如：创建一个可以处理图像识别的算法服务，它可以接收图像URL并返回识别结果..."
                />
              </div>
            </a-col>
          </a-row>

          <a-row :gutter="20" style="margin-top: 16px;">
            <a-col :span="24">
              <a-form-item label="操作">
                <a-button
                  type="primary"
                  icon="thunderbolt"
                  @click="onGenerateClick"
                  :disabled="generateDisabled"
                  :loading="generateLoading"
                >
                  生成算法模型
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- 生成进度 -->
    <a-card v-if="generateProgress.show" :bordered="false" style="margin-top: 10px;">
      <div slot="title">
        <a-icon type="loading" v-if="generateProgress.status === 'process'" />
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" v-else-if="generateProgress.status === 'finish'" />
        <a-icon type="close-circle" theme="twoTone" two-tone-color="#f5222d" v-else-if="generateProgress.status === 'error'" />
        <span style="margin-left: 8px;">生成进度</span>
      </div>

      <div class="publish-steps">
        <div
          :class="['step-item', {
            'active': generateProgress.status === 'process',
            'completed': generateProgress.status === 'finish',
            'error': generateProgress.status === 'error'
          }]"
        >
          <div class="step-header" @click="toggleMainStep">
            <div class="step-indicator">
              <a-icon v-if="generateProgress.status === 'finish'" type="check-circle" class="icon-completed" />
              <a-icon v-else-if="generateProgress.status === 'error'" type="close-circle" class="icon-error" />
              <a-icon v-else type="loading" class="icon-loading" />
            </div>
            <div class="step-content">
              <div class="step-title">智能体执行</div>
              <div class="step-description">{{ generateProgress.description }}</div>
            </div>
            <a-icon
              v-if="generateProgress.agentSteps.length > 0"
              :type="generateProgress.expanded ? 'up' : 'down'"
              class="expand-icon"
            />
          </div>

          <div v-if="generateProgress.expanded && generateProgress.agentSteps.length > 0" class="agent-steps">
            <div
              v-for="(agentStep, agentIndex) in generateProgress.agentSteps"
              :key="agentIndex"
              class="agent-step-item"
            >
              <div class="agent-step-header" @click="toggleAgentStepDetail(agentIndex)">
                <span class="agent-step-number">步骤 {{ agentStep.step }}</span>
                <span class="agent-step-summary">{{ getAgentStepSummary(agentStep) }}</span>
                <a-icon
                  :type="agentStep.expanded ? 'up' : 'down'"
                  class="expand-icon-small"
                />
              </div>

              <div v-if="agentStep.expanded" class="agent-step-details">
                <div v-if="agentStep.thought" class="detail-section thought">
                  <div class="detail-label">💭 思考</div>
                  <div class="detail-content">{{ agentStep.thought }}</div>
                </div>
                <div v-if="agentStep.action" class="detail-section action">
                  <div class="detail-label">⚙️ 行动</div>
                  <div class="detail-content">{{ agentStep.action }}</div>
                </div>
                <div v-if="agentStep.action_result" class="detail-section observation">
                  <div class="detail-label">👁️ 结果</div>
                  <div class="detail-content">{{ agentStep.action_result }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 生成结果 -->
    <a-card v-if="generateResult.show" :bordered="false" style="margin-top: 10px;">
      <div slot="title">
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
        <span style="margin-left: 8px;">算法模型生成完成</span>
      </div>

      <a-tabs default-active-key="code">
        <!-- 下载与资源库（不展示源码全文） -->
        <a-tab-pane key="code" tab="下载与资源库">
          <div class="code-header">
            <span class="code-filename">
              <a-icon type="file-text" style="margin-right: 4px;" />
              {{ generateResult.codeFilename || '生成代码' }}
            </span>
            <div>
              <a-button size="small" icon="download" type="primary" @click="downloadCode">下载代码</a-button>
            </div>
          </div>
          <a-alert
            type="info"
            show-icon
            message="可在「垂域应用AI资源检索」模块查看并下载"
            style="margin-top: 12px;"
          />
        </a-tab-pane>

        <!-- 六维测试结果 -->
        <a-tab-pane key="test">
          <template slot="tab">
            <a-badge :count="testPassedCount" :number-style="{ backgroundColor: '#52c41a' }" :overflow-count="99">
              <span>测试结果</span>
            </a-badge>
          </template>
          <a-table
            :columns="testColumns"
            :data-source="generateResult.testResults"
            :pagination="false"
            row-key="name"
            size="middle"
          >
            <template slot="status" slot-scope="text">
              <a-tag :color="text === 'passed' ? 'green' : 'orange'">
                {{ text === 'passed' ? '通过' : '警告' }}
              </a-tag>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 参考资料 -->
        <a-tab-pane key="references">
          <template slot="tab">
            <a-badge :count="generateResult.references.length" :overflow-count="99">
              <span>参考资料</span>
            </a-badge>
          </template>
          <a-list
            :data-source="generateResult.references"
            :locale="{ emptyText: '暂无参考资料' }"
          >
            <a-list-item slot="renderItem" slot-scope="item">
              <a-list-item-meta>
                <span slot="title">
                  <a-tag :color="item.type === 'paper' ? 'blue' : 'purple'">
                    {{ item.type === 'paper' ? '论文' : '模型' }}
                  </a-tag>
                  {{ item.title }}
                </span>
                <span slot="description">{{ item.summary }}</span>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </page-header-wrapper>
</template>

<script>
/* eslint-disable */
import { streamAgent } from '@/utils/request'
import dictionaryCache from '@/utils/dictionaryCache'
import { uploadScenarioGeneratedAlgorithm } from '@/api/service'

export default {
  name: 'GenericScenarioDev',
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      domainTitle: '',
      programFiles: [],
      uploadFiles: [],
      freeNarrative: '',
      form: {
        serviceName: undefined
      },
      programInfo: {
        industry: undefined,
        scenario: undefined,
        technology: undefined
      },
      industryOptions: [],
      scenarioOptions: [],
      technologyOptions: [],
      generateLoading: false,
      generateProgress: {
        show: false,
        status: 'process',
        description: '',
        expanded: true,
        agentSteps: []
      },
      generateResult: {
        show: false,
        generatedCode: '',
        codeFilename: '',
        testResults: [],
        references: []
      },
      testColumns: [
        { title: '测试维度', dataIndex: 'name', key: 'name', width: 120 },
        { title: '状态', dataIndex: 'status', key: 'status', width: 80, scopedSlots: { customRender: 'status' } },
        { title: '描述', dataIndex: 'description', key: 'description', width: 160 },
        { title: '详情', dataIndex: 'details', key: 'details' }
      ]
    }
  },
  computed: {
    generateDisabled() {
      const name = (this.form.serviceName || '').trim()
      const narrative = (this.freeNarrative || '').trim()
      return !name || !narrative
    },
    testPassedCount() {
      return this.generateResult.testResults.filter(t => t.status === 'passed').length
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      try {
        this.industryOptions = await dictionaryCache.loadDict(`${this.verticalType}_industry`) || []
        this.scenarioOptions = await dictionaryCache.loadDict(`${this.verticalType}_scenario`) || []
        this.technologyOptions = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
        const domains = await dictionaryCache.loadDict('domain') || []
        this.domainTitle = domains.find(d => d.code === this.verticalType)?.text || '未知领域'
      } catch (e) {
        console.error('加载字典失败:', e)
        this.$message.error('加载数据字典失败，请刷新重试')
        this.industryOptions = []
        this.scenarioOptions = []
        this.technologyOptions = []
      }
    },

    customProgramFilesChose(options) {
      const { file } = options
      if (!file) return false
      this.uploadFiles = [file]
      this.programFiles = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]
    },

    removeProgramFile() {
      this.uploadFiles = []
      this.programFiles = []
    },

    onGenerateClick() {
      const name = (this.form.serviceName || '').trim()
      const narrative = (this.freeNarrative || '').trim()
      if (!name) {
        this.$message.warning('请填写算法模型名称。')
        return
      }
      if (!narrative) {
        this.$message.warning(
          '请在下方的「自由叙述」中具体说明您要生成的算法模型功能。可参考上方蓝色提示中的完整示例进行填写。'
        )
        return
      }
      this.startGenerate(name, narrative)
    },

    startGenerate(modelName, narrative) {
      this.generateLoading = true
      this.generateProgress = {
        show: true,
        status: 'process',
        description: '正在初始化智能体...',
        expanded: true,
        agentSteps: []
      }
      this.generateResult.show = false

      const formData = new FormData()
      formData.append('model_name', modelName)
      formData.append('free_narrative', narrative)

      if (this.programInfo.industry) {
        formData.append('industry', this.programInfo.industry)
      }
      if (this.programInfo.scenario) {
        formData.append('scenario', this.programInfo.scenario)
      }
      if (this.programInfo.technology) {
        formData.append('technology', this.programInfo.technology)
      }
      if (this.uploadFiles.length > 0) {
        const rawFile = this.uploadFiles[0]
        formData.append('file', rawFile.originFileObj || rawFile)
      }

      streamAgent('/api/aml_auto_generate/generate_code', formData, {
        onStart: () => {
          this.generateProgress.description = '智能体已启动，正在生成算法模型...'
        },
        onStep: (data) => {
          this.generateProgress.agentSteps.push({
            step: data.step || this.generateProgress.agentSteps.length + 1,
            thought: data.thought || '',
            action: data.action || '',
            action_result: data.action_result || '',
            expanded: false
          })
          this.generateProgress.description = this.getAgentStepSummary(data)
        },
        onError: (error) => {
          this.generateProgress.status = 'error'
          this.generateProgress.description = '生成失败: ' + error
          this.generateLoading = false
          this.$message.error('算法模型生成失败：' + error)
        },
        onWarning: (warning) => {
          this.generateProgress.status = 'error'
          this.generateProgress.description = '生成警告: ' + warning
          this.generateLoading = false
          this.$message.warning('算法模型生成警告：' + warning)
        },
        onFinalResult: (results) => {
          this.generateProgress.status = 'finish'
          this.generateProgress.description = '算法模型生成完成'
          this.generateLoading = false
          this.processFinalResult(results)
          this.$message.success('算法模型生成成功！')
          this.$nextTick(() => {
            this.registerGeneratedToPlatform()
          })
        },
        onComplete: () => {
          this.generateLoading = false
          if (this.generateProgress.status === 'process') {
            this.generateProgress.status = 'finish'
            this.generateProgress.description = '执行完成'
          }
        },
        onDataProcessError: (e, line) => {
          console.error('解析智能体数据失败:', e, line)
        }
      })
    },

    processFinalResult(results) {
      const data = results.aml_generate_result
      if (!data) {
        this.generateResult = {
          show: false,
          generatedCode: '',
          codeFilename: '',
          testResults: [],
          references: []
        }
        this.$message.warning('未获取到生成结果文件')
        return
      }

      let parsed = data
      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data)
        } catch (e) {
          this.generateResult = {
            show: true,
            generatedCode: data,
            codeFilename: 'generated_code.py',
            testResults: [],
            references: []
          }
          return
        }
      }

      this.generateResult = {
        show: true,
        generatedCode: parsed.generated_code || '',
        codeFilename: parsed.code_filename || `${parsed.model_name || 'algorithm'}.py`,
        testResults: Array.isArray(parsed.test_results) ? parsed.test_results : [],
        references: Array.isArray(parsed.references) ? parsed.references : []
      }
    },

    toggleMainStep() {
      this.generateProgress.expanded = !this.generateProgress.expanded
    },

    toggleAgentStepDetail(agentIndex) {
      const step = this.generateProgress.agentSteps[agentIndex]
      if (step) {
        this.$set(this.generateProgress.agentSteps, agentIndex, {
          ...step,
          expanded: !step.expanded
        })
      }
    },

    getAgentStepSummary(agentStep) {
      if (agentStep.thought && agentStep.thought.length > 0) {
        const preview = agentStep.thought.length > 50
          ? agentStep.thought.substring(0, 50) + '...'
          : agentStep.thought
        return `💭 ${preview}`
      } else if (agentStep.action) {
        const preview = agentStep.action.length > 50
          ? agentStep.action.substring(0, 50) + '...'
          : agentStep.action
        return `⚙️ ${preview}`
      } else if (agentStep.action_result) {
        return '👁️ 查看执行结果'
      }
      return '处理中...'
    },

    async registerGeneratedToPlatform() {
      const code = this.generateResult.generatedCode
      if (!code || !String(code).trim()) {
        this.$message.warning('未获取到源码内容，已跳过同步到资源库')
        return
      }
      const name = (this.form.serviceName || '').trim()
      if (!name) {
        return
      }
      const filename = this.generateResult.codeFilename || 'generated_algorithm.py'
      const blob = new Blob([code], { type: 'text/x-python' })
      const fd = new FormData()
      fd.append('file', blob, filename)
      fd.append('name', name)
      fd.append('domain', this.verticalType)
      if (this.programInfo.industry) {
        fd.append('industry', this.programInfo.industry)
      }
      if (this.programInfo.scenario) {
        fd.append('scenario', this.programInfo.scenario)
      }
      if (this.programInfo.technology) {
        fd.append('technology', this.programInfo.technology)
      }
      try {
        const res = await uploadScenarioGeneratedAlgorithm(fd)
        if (res && res.status === 'success') {
          try {
            sessionStorage.setItem(`eb_vertical_list_refresh_${this.verticalType}`, '1')
          } catch (err) {
            /* ignore */
          }
          this.$message.success('已存入资源库，可在「垂域应用 AI 资源检索」同领域中查看并下载')
        } else {
          this.$message.warning((res && res.message) || '同步到资源库未确认成功')
        }
      } catch (e) {
        const msg = (e && e.message) ? e.message : String(e)
        this.$message.warning('生成成功，但同步到资源库失败：' + msg)
      }
    },

    downloadCode() {
      if (!this.generateResult.generatedCode) return
      const blob = new Blob([this.generateResult.generatedCode], { type: 'text/x-python' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = this.generateResult.codeFilename || 'generated_algorithm.py'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      this.$message.success('代码文件下载成功')
    }
  },
  watch: {
    verticalType: {
      handler(newVal) {
        if (newVal) {
          this.initData()
          this.form.serviceName = undefined
          this.freeNarrative = ''
          this.programInfo = { industry: undefined, scenario: undefined, technology: undefined }
          this.programFiles = []
          this.uploadFiles = []
          this.generateLoading = false
          this.generateProgress = {
            show: false,
            status: 'process',
            description: '',
            expanded: true,
            agentSteps: []
          }
          this.generateResult = {
            show: false,
            generatedCode: '',
            codeFilename: '',
            testResults: [],
            references: []
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 0;
}
.label-optional {
  color: #8c8c8c;
  font-weight: normal;
  font-size: 12px;
}
.label-required-tip {
  color: #cf1322;
  font-weight: normal;
  font-size: 12px;
}
.narrative-block {
  width: 100%;
}
.narrative-title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 12px;
}
.narrative-hint {
  margin-bottom: 12px;
}
.example-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: rgba(0, 0, 0, 0.65);
}
.example-text {
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
}
.narrative-textarea {
  width: 100%;
  max-width: 960px;
}

// 代码预览
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px 4px 0 0;

  .code-filename {
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }
}
.code-preview {
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 0 0 4px 4px;
  font-size: 13px;
  line-height: 1.6;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;

  code {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }
}

// 进度步骤
.publish-steps {
  .step-item {
    position: relative;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fafafa;
    transition: all 0.3s;

    &.active {
      border-color: #1890ff;
      background: #e6f7ff;
    }

    &.completed {
      border-color: #52c41a;
      background: #f6ffed;
    }

    &.error {
      border-color: #f5222d;
      background: #fff1f0;
    }

    .step-header {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;

      &:hover {
        opacity: 0.8;
      }

      .step-indicator {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #d9d9d9;
        flex-shrink: 0;

        .icon-completed {
          font-size: 20px;
          color: #52c41a;
        }

        .icon-loading {
          font-size: 20px;
          color: #1890ff;
        }

        .icon-error {
          font-size: 20px;
          color: #f5222d;
        }
      }

      .step-content {
        flex: 1;
        min-width: 0;

        .step-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .step-description {
          font-size: 14px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .expand-icon {
        font-size: 16px;
        color: #999;
        margin-left: 8px;
        transition: transform 0.3s;
      }
    }

    .agent-steps {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e8e8e8;
      max-height: 400px;
      overflow-y: auto;

      .agent-step-item {
        padding: 10px 12px;
        margin-bottom: 8px;
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
        }

        .agent-step-header {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;

          .agent-step-number {
            font-weight: 600;
            color: #1890ff;
            margin-right: 8px;
            white-space: nowrap;
          }

          .agent-step-summary {
            flex: 1;
            font-size: 14px;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .expand-icon-small {
            font-size: 14px;
            color: #999;
            margin-left: 8px;
          }
        }

        .agent-step-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;

          .detail-section {
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .detail-label {
              font-weight: 600;
              font-size: 13px;
              margin-bottom: 6px;
              color: #333;
            }

            .detail-content {
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              word-break: break-all;
              max-height: 200px;
              overflow-y: auto;
            }

            &.thought .detail-content {
              background: #f0f7ff;
              border-left: 3px solid #1890ff;
            }

            &.action .detail-content {
              background: #fff5e6;
              border-left: 3px solid #fa8c16;
            }

            &.observation .detail-content {
              background: #f0fff0;
              border-left: 3px solid #52c41a;
            }
          }
        }
      }
    }
  }
}
</style>
