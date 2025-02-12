<template>
  <a-modal
    :visible="visible"
    title="构建元应用"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="预发布"
    cancel-text="取消"
  >
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
  </a-modal>
</template>

<script>
import { getIndustryMap, getScenarioMap, getTechnologyMap } from '@/mock/data/map_data'

export default {
  props: {
    serviceType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      industryOptions: getIndustryMap('aml'),
      scenarioOptions: getScenarioMap('aml'),
      technologyOptions: getTechnologyMap('aml'),
      form: this.$form.createForm(this)
    }
  },
  methods: {
    init() {
      this.visible = true
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
