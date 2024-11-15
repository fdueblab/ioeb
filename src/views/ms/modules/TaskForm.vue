<template>
  <a-form @submit="handleSubmit" :form="form">
    <a-form-item
      label="模板名称"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <a-input v-decorator="['title', {rules:[{required: true, message: '请输入任务名称'}]}]" />
    </a-form-item>
    <a-form-item
      label="模板分类"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <a-select v-decorator="['classId', {rules:[{required: true, message: '请选择模板分类'}]}]">
        <a-select-option :value="0">前沿装备</a-select-option>
        <a-select-option :value="1">反洗钱服务</a-select-option>
        <a-select-option :value="2">数据隐私保护</a-select-option>
        <a-select-option :value="3">智能运维管理</a-select-option>
        <a-select-option :value="4">数据分析与决策</a-select-option>
        <a-select-option :value="5">网络安全防护</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item
      label="模板描述"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <a-textarea v-decorator="['description']"></a-textarea>
    </a-form-item>
  </a-form>
</template>

<script>
import pick from 'lodash.pick'

const fields = ['title', 'classId', 'startAt', 'owner', 'description']

export default {
  name: 'TaskForm',
  props: {
    record: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      form: this.$form.createForm(this)
    }
  },
  mounted () {
    this.record && this.form.setFieldsValue(pick(this.record, fields))
  },
  methods: {
    onOk () {
      this.$message.success('修改成功！')
      return new Promise(resolve => {
        resolve(true)
      })
    },
    onCancel () {
      console.log('监听了 modal cancel 事件')
      return new Promise(resolve => {
        resolve(true)
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      this.visible = true
      validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
        }
      })
    }
  }
}
</script>
