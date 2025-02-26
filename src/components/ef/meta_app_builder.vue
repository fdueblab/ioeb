<template>
  <a-modal
    :width="1000"
    :dialogStyle="{ top: '30px' }"
    :visible="visible"
    title="构建元应用"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="预发布"
    cancel-text="取消"
  >
    <div style="display: flex; justify-content: space-around">
      <!-- 应用预览区域 -->
      <div style="width: 35%">
        <span class="title">元应用预览</span>
        <div class="app-preview">
          <span class="app-title">{{ form.getFieldValue('name') || preName }}</span>
          <div class="input-output-container">
            <!-- 输入区域 -->
            <div>
              <span class="section-title">{{ form.getFieldValue('inputName') || preInputName }}</span>
              <a-textarea
                v-show="inputType === 1 || inputType === 3"
                placeholder="欢迎使用AI中台为您构建的元应用!"
                :auto-size="{ minRows: 4, maxRows: 6 }"
                class="input-box"
              />
              <div style="width: 100%; display: flex; justify-content: center">
                <a-button v-show="inputType === 2"> <a-icon type="upload" /> 选择数据文件 </a-button>
              </div>
              <div style="width: 100%">
                <a-button class="submit-button" type="primary" @click="handleSubmit">
                  {{ form.getFieldValue('submitButtonText') || '获取结果' }}
                </a-button>
              </div>
            </div>
            <!-- 输出区域 -->
            <div>
              <span class="section-title">{{ form.getFieldValue('outputName') || preOutputName }}</span>
              <div class="output-box">
                预发布后即可试用此元应用
              </div>
              <div v-show="form.getFieldValue('visualization')" class="image-box">
                {{ form.getFieldValue('outputName') || preOutputName }}可视化区域
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 元应用信息区域 -->
      <div style="width: 50%">
        <span class="title">元应用属性</span>
        <a-form :form="form" layout="vertical">
          <a-divider>视觉配置</a-divider>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="名称">
                <a-input v-decorator="['name', { rules: [{ required: true, message: '请填写元应用名称!' }], initialValue: preName }]" placeholder="请输入元应用名称" />
              </a-form-item>
            </a-col>
            <!--            <a-col :span="18">-->
            <!--              <a-form-item label="输入类型" required>-->
            <!--                <a-radio-group v-model="parameterType">-->
            <!--                  <a-radio v-for="(item, index) in ioTypeOptions" :key="index" :value="index">{{ item }}</a-radio>-->
            <!--                </a-radio-group>-->
            <!--              </a-form-item>-->
            <!--            </a-col>-->
            <a-col v-if="inputType !== 0" :span="12">
              <a-form-item label="输入数据名称">
                <a-input v-decorator="['inputName', { rules: [{ required: true, message: '请填写输入数据名称!' }], initialValue: preInputName }]"/>
              </a-form-item>
            </a-col>
            <a-col v-if="outputType !== 0" :span="12">
              <a-form-item label="输出数据名称">
                <a-input v-decorator="['outputName', { rules: [{ required: true, message: '请填写输出数据名称!' }], initialValue: preOutputName }]"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="获取结果按钮文本">
                <a-input v-decorator="['submitButtonText', { rules: [{ required: true, message: '请填写获取结果按钮文本!' }], initialValue: '获取结果' }]"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="结果可视化">
                <div style="height:32px; display: flex; justify-content: space-between; align-items: center">
                  <a-checkbox v-decorator="['visualization']">
                    结果可视化展示
                  </a-checkbox>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <a-divider>应用信息</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="领域">
                <a-select v-decorator="['domain', { rules: [{ required: true, message: '请选择元应用领域!' }], initialValue: 0 }]" placeholder="请选择元应用领域">
                  <a-select-option :key="0" :value="0">
                    {{ serviceType === 'aml' ? '跨境支付AI监测服务' : '低空飞行AI监控服务' }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="行业">
                <a-select v-decorator="['industry']" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="index">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="场景">
                <a-select v-decorator="['scenario']" placeholder="请选择元应用场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="index">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="技术">
                <a-select v-decorator="['technology']" placeholder="请选择元应用技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="index">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="条件（environment）">
                <a-input v-decorator="['environment']" placeholder="请输入Environment"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="处理（process）">
                <a-input v-decorator="['process']" placeholder="请输入Process"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { getIndustryMap, getScenarioMap, getTechnologyMap } from '@/mock/data/map_data'

export default {
  props: {
    serviceType: {
      type: String,
      default: 'aml'
    },
    inputType: {
      type: Number,
      default: 0
    },
    outputType: {
      type: Number,
      default: 0
    },
    preName: {
      type: String,
      default: '元应用名称'
    },
    preInputName: {
      type: String,
      default: '输入内容'
    },
    preOutputName: {
      type: String,
      default: '输出内容'
    }
  },
  data() {
    return {
      visible: false,
      industryOptions: [],
      scenarioOptions: [],
      technologyOptions: [],
      form: this.$form.createForm(this)
    }
  },
  methods: {
    init() {
      this.visible = true
      this.industryOptions = getIndustryMap(this.serviceType)
      this.scenarioOptions = getScenarioMap(this.serviceType)
      this.technologyOptions = getTechnologyMap(this.serviceType)
    },
    handleSubmit() {
      // 这里可以处理提交逻辑
    },
    handleOk() {
      const { form: { validateFields } } = this
      this.visible = true
      validateFields((errors, values) => {
        if (!errors) {
          const serviceData = {
            ...values,
            type: 1,
            status: 1,
            netWork: 'bridge',
            port: '0.0.0.0:1021/TCP → 0.0.0.0:10021',
            volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/metaApp',
            source: {
              popoverTitle: '可信云技术服务溯源',
              companyName: '复旦大学课题组',
              companyAddress: '暂无内容',
              companyContact: '暂无内容',
              companyIntroduce: '课题五',
              msIntroduce: values.process || 'publisher构建的元应用',
              companyScore: 5,
              msScore: 5
            },
            apiList: [
              {
                name: values.name,
                inputName: values.inputName,
                outputName: values.outputName,
                outputVisualization: values.outputVisualization,
                submitButtonText: values.submitButtonText,
                isFake: true,
                url: 'http://myApiServer.com/metaApp',
                method: 'POST',
                parameterType: values.inputType,
                responseType: values.outputType,
                response: {
                  code: 200,
                  message: '调用成功！'
                }
              }
            ],
            number: '0'
          }
          if (serviceData.name.includes('课题一')) {
            console.log(serviceData.name)
            serviceData.apiList = [
              {
                name: values.name,
                inputName: values.inputName,
                outputName: values.outputName,
                inputType: values.inputType,
                outputType: values.outputType,
                outputVisualization: values.outputVisualization,
                submitButtonText: values.submitButtonText,
                url: 'http://43.130.11.13:5000/api/pj1_report_app',
                method: 'POST',
                parameterType: values.inputType,
                responseType: values.outputType
              }
            ]
          }
          sessionStorage.setItem('metaAppInfo', JSON.stringify(serviceData))
          this.visible = false
          this.$message.success('预发布成功！可进行评测与验证')
          this.$emit('close')
          window.location.href = `#/evaluation/${this.serviceType}/emulation`
        } else {
          console.log('errors', errors)
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/* 区域标题 */
.title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
  display: block;
}

/* 应用预览区域 */
.app-preview {
  width: 100%;
  aspect-ratio: 9 / 19; /* 设置宽高比 */
  overflow-y: auto; /* 使高度限制生效 */
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 16px;
  font-weight: bold;
  background-color: #1890ff;
  color: #fff;
  text-align: center;
  display: block;
  line-height: 35px;
  border-radius: 6px 6px 0 0;
}

/* 输入输出容器 */
.input-output-container {
  margin: 16px;
}

/* 输入输出标题 */
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 8px;
  line-height: 30px;
}

/* 输入框 */
.input-box {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.submit-button {
  width: 50%;
  margin: 8px 0;
  left: 25%;
}

/* 输出框 */
.output-box {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

/* 图片框 */
.image-box {
  width: 100%;
  min-height: 150px;
  margin-top: 16px;
  padding: 16px;
  background-color: #e8e8e8;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-style: italic;
}
</style>
