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
      <div style="width: 30%">
        <!-- 动态标题 -->
        <span class="title">元应用预览</span>
        <div class="app-preview">
          <span class="app-title">{{ form.getFieldValue('name') || '元应用名称' }}</span>
          <div class="input-output-container">
            <!-- 输入区域 -->
            <div>
              <span class="section-title">{{ inputName }}</span>
              <a-textarea
                v-model="inputText"
                placeholder="欢迎使用AI中台为您构建的元应用!"
                :auto-size="{ minRows: 4, maxRows: 6 }"
                class="input-box"
              />
              <!-- 提交按钮 -->
              <a-button class="submit-button" type="primary" @click="handleSubmit">
                提交
              </a-button>
            </div>
            <!-- 输出区域 -->
            <div>
              <span class="section-title">{{ outputName }}</span>
              <div class="output-box">
                {{ outputText }}
              </div>
              <!-- 图片框 -->
              <div class="image-box">
                {{ outputName }}可视化区域
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 元应用信息区域 -->
      <div style="width: 50%">
        <span class="title">元应用信息</span>
        <a-form :form="form" layout="vertical">
          <a-form-item label="名称">
            <a-input v-decorator="['name', { rules: [{ required: true, message: '请填写元应用名称!' }] }]" placeholder="请输入元应用名称" />
          </a-form-item>
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
      default: ''
    },
    inputName: {
      type: String,
      default: '输入内容'
    },
    outputName: {
      type: String,
      default: '输出内容'
    }
  },
  data() {
    return {
      visible: false,
      industryOptions: getIndustryMap('aml'),
      scenarioOptions: getScenarioMap('aml'),
      technologyOptions: getTechnologyMap('aml'),
      form: this.$form.createForm(this),
      inputText: '',
      outputText: '预发布后即可试用此元应用'
    }
  },
  methods: {
    init() {
      this.visible = true
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
              companyName: '暂无内容',
              companyAddress: '暂无内容',
              companyContact: '暂无内容',
              companyIntroduce: '暂无内容',
              msIntroduce: 'publisher构建的元应用',
              companyScore: 5,
              msScore: 5
            },
            number: '0'
          }
          if (serviceData.name.includes('课题一')) {
            console.log(serviceData.name)
            serviceData.apiList = [
              {
                name: 'report',
                url: 'http://43.130.11.13:5000/api/pj1_report_app',
                method: 'POST',
                parameterType: 2
              }
            ]
          }
          sessionStorage.setItem('metaAppInfo', JSON.stringify(serviceData))
          this.visible = false
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
