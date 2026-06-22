<template>
  <div class="wb-publish-form-grid">
    <div class="wb-preview-col">
      <div class="wb-modal-sec-title">元应用界面预览</div>
      <div class="wb-phone">
        <div class="wb-phone-top">
          <span>{{ formName || preName }}</span>
          <small v-if="formSubtitle">{{ formSubtitle }}</small>
        </div>
        <div class="wb-phone-card">
          <div class="wb-phone-label">▎{{ formInputName || preInputName }}</div>
          <textarea
            v-if="localInputType === 1 || localInputType === 3"
            class="wb-phone-input"
            readonly
            placeholder="欢迎使用AI中台为您构建的元应用！"
          ></textarea>
          <button
            v-if="localInputType === 2 || localInputType === 3"
            type="button"
            class="wb-phone-file-btn"
          >
            <a-icon type="upload" /> 选择数据文件
          </button>
          <button type="button" class="wb-phone-btn">{{ formSubmitText || '获取结果' }}</button>
        </div>
        <div class="wb-phone-card">
          <div class="wb-phone-label">▎{{ formOutputName || preOutputName }}</div>
          <div v-if="localOutputType === 1 || localOutputType === 3" class="wb-phone-box">预发布后即可验证此元应用</div>
          <button
            v-if="localOutputType === 2 || localOutputType === 3"
            type="button"
            class="wb-phone-file-btn wb-phone-file-btn--download"
          >
            <a-icon type="download" /> 下载结果文件
          </button>
          <div v-if="formVisualization" class="wb-phone-viz">
            <a-icon type="bar-chart" class="wb-phone-viz-icon" />
            <span>{{ formOutputName || preOutputName }}可视化区域</span>
          </div>
        </div>
      </div>
    </div>
    <div class="wb-form-col">
      <div class="wb-form-title"><h3>元应用属性</h3></div>
      <a-form :form="form" layout="vertical">
        <a-divider>视觉配置</a-divider>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="应用名称">
              <a-input
                v-decorator="['name', { rules: [{ required: true, message: '请填写元应用名称!' }], initialValue: preName }]"
                @change="onPreviewFieldChange('name', $event)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="应用副标题">
              <a-input
                v-decorator="['subtitle']"
                placeholder="请输入副标题（可选）"
                @change="onPreviewFieldChange('subtitle', $event)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="输入类型" required>
              <a-radio-group v-model="localInputType">
                <a-radio :value="0">无</a-radio>
                <a-radio :value="1">文本</a-radio>
                <a-radio :value="2">文件</a-radio>
                <a-radio :value="3">文本 + 文件</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="输入数据名称">
              <a-input
                v-decorator="['inputName', { rules: [{ required: true, message: '请填写输入数据名称!' }], initialValue: preInputName }]"
                @change="onPreviewFieldChange('inputName', $event)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="输出类型" required>
              <a-radio-group v-model="localOutputType">
                <a-radio :value="0">无</a-radio>
                <a-radio :value="1">文本</a-radio>
                <a-radio :value="2">文件</a-radio>
                <a-radio :value="3">文本 + 文件</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="输出数据名称">
              <a-input
                v-decorator="['outputName', { rules: [{ required: true, message: '请填写输出数据名称!' }], initialValue: preOutputName }]"
                @change="onPreviewFieldChange('outputName', $event)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="获取结果按钮文本">
              <a-input
                v-decorator="['submitButtonText', { rules: [{ required: true, message: '请填写获取结果按钮文本!' }], initialValue: '获取结果' }]"
                @change="onPreviewFieldChange('submitButtonText', $event)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结果可视化">
              <a-switch
                v-decorator="['visualization', { valuePropName: 'checked', initialValue: defaultVisualization }]"
                @change="onVisualizationChange"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-divider>应用信息</a-divider>
        <a-row>
          <a-col :span="24">
            <a-form-item label="通用描述">
              <a-textarea
                v-decorator="['des', { initialValue: preDes }]"
                @change="syncPreviewFromForm"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="技术">
              <a-select v-decorator="['technology', { rules: [{ required: true, message: '请选择元应用技术!' }]}]" placeholder="请选择" allow-clear>
                <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">{{ item.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="属性">
              <a-select v-decorator="['attribute']" placeholder="请选择" allow-clear>
                <a-select-option v-for="(item, index) in attributeOptions" :key="index" :value="item.code">{{ item.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div class="wb-publish-actions">
        <button type="button" class="wb-danger-btn" @click="confirmBackToEdit">返回重新编辑</button>
        <a-button type="primary" :loading="submitting" @click="submit">完成预发布</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import { prepublishService } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'
import store from '@/store'
import { resolveTopicPrepublishMock } from '@/mock/data/topic_prepublish_mock'

export default {
  name: 'MetaAppPublishForm',
  props: {
    verticalType: { type: String, required: true },
    preName: { type: String, default: '元应用名称' },
    preDes: { type: String, default: '' },
    preInputName: { type: String, default: '输入内容' },
    preOutputName: { type: String, default: '输出内容' },
    inputType: { type: Number, default: 1 },
    outputType: { type: Number, default: 1 },
    serviceIds: { type: Array, default: () => [] }
  },
  data() {
    return {
      attributeOptions: [],
      technologyOptions: [],
      submitting: false,
      form: this.$form.createForm(this),
      formName: '',
      formSubtitle: '',
      formInputName: '',
      formOutputName: '',
      formSubmitText: '',
      formVisualization: false,
      localInputType: 1,
      localOutputType: 1
    }
  },
  computed: {
    defaultVisualization() {
      return this.verticalType === 'aml'
    }
  },
  watch: {
    preName: { immediate: true, handler(v) { this.formName = v } },
    preInputName: { immediate: true, handler(v) { this.formInputName = v } },
    preOutputName: { immediate: true, handler(v) { this.formOutputName = v } },
    inputType: {
      immediate: true,
      handler(v) {
        this.localInputType = v != null ? Number(v) : 1
      }
    },
    outputType: {
      immediate: true,
      handler(v) {
        this.localOutputType = v != null ? Number(v) : 1
      }
    }
  },
  mounted() {
    this.loadDicts()
    this.form.getFieldDecorator('name', { initialValue: this.preName })
    this.formVisualization = this.defaultVisualization
    this.$nextTick(() => {
      this.syncPreviewFromForm()
    })
  },
  methods: {
    onVisualizationChange(checked) {
      this.formVisualization = !!checked
    },
    onPreviewFieldChange(field, event) {
      const value = event && event.target ? event.target.value : event
      if (field === 'name') this.formName = value || ''
      if (field === 'subtitle') this.formSubtitle = value || ''
      if (field === 'inputName') this.formInputName = value || ''
      if (field === 'outputName') this.formOutputName = value || ''
      if (field === 'submitButtonText') this.formSubmitText = value || ''
      this.$nextTick(() => this.syncPreviewFromForm())
    },
    confirmBackToEdit() {
      this.$confirm(
        '将退出元应用预发布并回到想定解析完成后的编辑界面。当前预发布表单未保存的修改、以及本次构建生成的产物摘要（配置快照、轨迹与证据关联）将不再保留，需要重新完成仿真构建后才能再次预发布。确定继续吗？',
        '返回重新编辑？',
        {
          confirmButtonText: '返回重新编辑',
          cancelButtonText: '留在此页',
          confirmButtonClass: 'el-button--danger',
          type: 'warning',
          closeOnClickModal: false
        }
      )
        .then(() => {
          this.$emit('back')
        })
        .catch(() => {})
    },
    syncPreviewFromForm() {
      const v = this.form.getFieldsValue(['visualization', 'inputName', 'outputName', 'submitButtonText', 'name', 'subtitle'])
      if (Object.prototype.hasOwnProperty.call(v, 'name')) this.formName = v.name || ''
      if (Object.prototype.hasOwnProperty.call(v, 'subtitle')) this.formSubtitle = v.subtitle || ''
      if (Object.prototype.hasOwnProperty.call(v, 'inputName')) this.formInputName = v.inputName || ''
      if (Object.prototype.hasOwnProperty.call(v, 'outputName')) this.formOutputName = v.outputName || ''
      if (Object.prototype.hasOwnProperty.call(v, 'submitButtonText')) this.formSubmitText = v.submitButtonText || ''
      if (v.visualization != null) this.formVisualization = !!v.visualization
    },
    async loadDicts() {
      this.attributeOptions = await dictionaryCache.loadDict('attribute') || []
      this.technologyOptions = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
    },
    submit() {
      const { validateFields } = this.form
      validateFields(async (errors, values) => {
        if (errors) return
        this.submitting = true
        const { name, subtitle, des, inputName, outputName, visualization, submitButtonText } = values
        this.formName = name
        this.formInputName = inputName
        this.formOutputName = outputName
        this.formSubmitText = submitButtonText
        this.formVisualization = visualization
        let url = '/api/agent/meta_app/run'
        let method = 'sse'
        let isFake = false
        let response
        const topicMock = resolveTopicPrepublishMock(name)
        if (topicMock) {
          url = topicMock.url
          method = topicMock.method
          isFake = topicMock.isFake
          response = topicMock.response
        }
        const serviceData = {
          ...values,
          domain: this.verticalType,
          type: 'meta',
          status: 'default',
          netWork: 'ioeb_app-network',
          port: '0.0.0.0:1021/TCP → 0.0.0.0:10021',
          volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/metaApp',
          source: {
            popoverTitle: '可信云技术服务溯源',
            companyName: '复旦大学课题组',
            companyAddress: '上海市杨浦区邯郸路220号',
            companyContact: '021-65642222',
            companyIntroduce: '课题五',
            msIntroduce: `${store.getters.nickname}构建的元应用。${des ? '应用描述：' + des : ''}`,
            companyScore: 5,
            msScore: 5
          },
          apiList: [{
            name,
            subtitle,
            des,
            inputName,
            outputName,
            outputVisualization: visualization,
            submitButtonText,
            isFake,
            url,
            method,
            services: this.serviceIds,
            parameterType: this.localInputType,
            responseType: this.localOutputType,
            response
          }],
          number: 0
        }
        try {
          const res = await prepublishService(serviceData)
          if (res && res.status === 'success') {
            this.$message.success('预发布成功！部署完成后可进行业务验证')
            this.$emit('published')
          } else {
            this.$message.error((res && res.message) || '预发布失败')
          }
        } catch (e) {
          this.$message.error('预发布异常，请稍后重试！')
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.wb-publish-form-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  grid-column: 1 / -1;
  min-width: 0;
}

.wb-modal-sec-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  margin: 4px 0 18px;
}

.wb-phone {
  width: 302px;
  min-height: 480px;
  margin: 0 auto;
  border-radius: 12px;
  background: linear-gradient(180deg, #eaf3ff, #dbe8f6);
  padding: 14px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.wb-phone-top {
  min-height: 56px;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(135deg, #38a2ff, #166ed9);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  margin: -14px -14px 18px;
  padding: 8px 10px;
  text-align: center;

  span,
  small {
    max-width: 100%;
    overflow-wrap: anywhere;
    line-height: 1.25;
  }

  small {
    margin-top: 3px;
    font-size: 11px;
    font-weight: 500;
    opacity: 0.86;
  }
}

.wb-phone-card {
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  margin-bottom: 14px;
}

.wb-phone-label {
  font-size: 12px;
  color: #1e80ff;
  font-weight: 700;
  margin-bottom: 12px;
}

.wb-phone-input {
  width: 100%;
  height: 84px;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  padding: 10px;
  color: #9ca3af;
  font-size: 12px;
  background: #fff;
  resize: none;
}

.wb-phone-btn {
  width: 110px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #3ea4ff, #166ed9);
  color: #fff;
  font-weight: 700;
  display: block;
  margin: 16px auto 0;
  cursor: pointer;
}

.wb-phone-box {
  border: 1px dashed #8cc9ff;
  border-radius: 10px;
  height: 88px;
  display: grid;
  place-items: center;
  color: #2389ff;
  text-align: center;
  font-size: 13px;
  background: #f8fbff;
}

.wb-phone-file-btn {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  background: #fff;
  color: #434343;
  font-size: 12px;
  cursor: default;

  &--download {
    margin-top: 0;
    margin-bottom: 10px;
  }
}

.wb-phone-viz {
  margin-top: 10px;
  min-height: 88px;
  padding: 14px;
  border: 2px dashed #91d5ff;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #40a9ff;
  font-size: 12px;
  text-align: center;
}

.wb-phone-viz-icon {
  font-size: 22px;
  color: #409eff;
}

.wb-form-title h3 {
  margin: 0;
  font-size: 16px;
}

.wb-publish-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}
</style>
