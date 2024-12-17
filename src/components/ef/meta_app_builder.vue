<template>
  <a-modal
    :visible="visible"
    title="构建元应用"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="构建"
    cancel-text="取消"
  >
    <a-form :form="form" layout="vertical">
      <a-form-item v-show="false" label="类型">
        <a-input v-decorator="['type', { initialValue: 1 }]" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-decorator="['name', { rules: [{ required: true, message: '请填写元应用名称!' }] }]" placeholder="请输入元应用名称" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="领域">
            <a-select v-decorator="['domain', { rules: [{ required: true, message: '请选择元应用领域!' }], initialValue: 0 }]" placeholder="请选择元应用领域">
              <a-select-option key="0" :value="0">
                {{ serviceType === 'aml' ? '跨境支付AI监测服务' : '低空飞行AI监控服务' }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="行业">
            <a-select v-model="form.industry" placeholder="请选择行业">
              <a-select-option v-for="item in industryOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="场景">
            <a-select v-model="form.scenario" placeholder="请选择场景">
              <a-select-option v-for="item in scenarioOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="技术">
            <a-select v-model="form.technology" placeholder="请选择技术">
              <a-select-option v-for="item in technologyOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
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
      typeOptions: [],
      domainOptions: [],
      industryOptions: [],
      scenarioOptions: [],
      technologyOptions: [],
      form: this.$form.createForm(this)
    }
  },
  methods: {
    init() {
      this.visible = true
      // TODO: =======检索页Map
      this.domainOptions = []
    },
    handleOk() {
      // TODO: =======必填项
      const { form: { validateFields } } = this
      this.visible = true
      validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          sessionStorage.setItem('metaAppInfo', JSON.stringify(values))
          window.location.href = `#/evaluation/${this.serviceType}/emulation`
          this.visible = false
          this.$emit('close')
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
