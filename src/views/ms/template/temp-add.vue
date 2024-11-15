<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-spin :spinning="confirmLoading">
        <a-steps :current="currentStep" :style="{ marginBottom: '28px' }" size="small">
          <a-step title="基本信息" />
          <a-step title="使用说明" />
          <a-step title="标准规范" />
          <a-step title="发布表单" />
        </a-steps>
        <a-form-model :model="form">
          <!-- step1 -->
          <div v-show="currentStep === 0">
            <a-form-model-item
              label="模板名称"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input v-model="form.name" />
            </a-form-model-item>
            <a-form-model-item
              label="模板分类"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select v-model="form.classId">
                <a-select-option :value="0">前沿装备</a-select-option>
                <a-select-option :value="1">反洗钱服务</a-select-option>
                <a-select-option :value="2">数据隐私保护</a-select-option>
                <a-select-option :value="3">智能运维管理</a-select-option>
                <a-select-option :value="4">数据分析与决策</a-select-option>
                <a-select-option :value="5">网络安全防护</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              label="应用领域"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select v-model="form.field">
                <a-select-option v-if="form.classId === 0" :value="0">无人机技术服务</a-select-option>
                <a-select-option v-if="form.classId === 1" :value="1">反洗钱技术服务</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              label="应用行业"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select v-model="form.trade">
                <a-select-option v-if="form.field === 0" :value="0">城市治理</a-select-option>
                <a-select-option v-if="form.field === 0" :value="1">文旅农林</a-select-option>
                <a-select-option v-if="form.field === 0" :value="2">教育培训</a-select-option>
                <a-select-option v-if="form.field === 1" :value="3">自贸服务</a-select-option>
                <a-select-option v-if="form.field === 1" :value="4">银行风控</a-select-option>
                <a-select-option v-if="form.field === 1" :value="5">跨境电商</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              label="应用场景"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select v-model="form.case">
                <a-select-option v-if="form.field === 0" :value="0">应急救援</a-select-option>
                <a-select-option v-if="form.field === 0" :value="1">交通巡逻</a-select-option>
                <a-select-option v-if="form.field === 0" :value="2">低空物流</a-select-option>
                <a-select-option v-if="form.field === 0" :value="3">低空测绘</a-select-option>
                <a-select-option v-if="form.field === 1" :value="4">目标识别</a-select-option>
                <a-select-option v-if="form.field === 1" :value="5">欺诈监测</a-select-option>
                <a-select-option v-if="form.field === 1" :value="6">合规监测</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              label="应用技术"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select v-model="form.technology">
                <a-select-option v-if="form.field === 0" :value="0">线路设计</a-select-option>
                <a-select-option v-if="form.field === 0" :value="1">虚拟仿真</a-select-option>
                <a-select-option v-if="form.field === 0" :value="2">智能感知</a-select-option>
                <a-select-option v-if="form.field === 0" :value="3">远程控制</a-select-option>
                <a-select-option v-if="form.field === 0" :value="4">视频分析</a-select-option>
                <a-select-option v-if="form.field === 0" :value="5">技术评价</a-select-option>
                <a-select-option v-if="form.field === 1" :value="6">图分析</a-select-option>
                <a-select-option v-if="form.field === 1" :value="7">联邦学习</a-select-option>
                <a-select-option v-if="form.field === 1" :value="8">业务解成</a-select-option>
                <a-select-option v-if="form.field === 1" :value="9">技术评估成</a-select-option>
                <a-select-option v-if="form.field === 1" :value="11">报告生成</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              label="算法"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              v-if="form.classId === 1"
            >
              <a-select v-model="form.algorithm">
                <a-select-option :value="0">数据资源</a-select-option>
                <a-select-option :value="1">数据处理</a-select-option>
                <a-select-option :value="1">基础算法</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              label="模板描述"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-textarea v-model="form.desc" :rows="4"></a-textarea>
            </a-form-model-item>
          </div>

          <div v-show="currentStep === 1">
            <quill-editor
              :content="instructions"
              :options="editorOption"
              @change="onEditorChange($event)"
            />
          </div>

          <div v-show="currentStep === 2">
            <quill-editor
              :content="standard"
              :options="editorOption"
              @change="onEditorChange($event)"
            />
          </div>

          <div v-show="currentStep === 3">
            <form-generator ref="formGenerator"></form-generator>
          </div>
          <!-- step1 end -->
        </a-form-model>
      </a-spin>
      <div style="text-align: center; margin-top: 10px">
        <a-button key="back" @click="backward" v-if="currentStep > 0">上一步</a-button>
        <a-button style="margin-left: 10px" key="cancel" @click="handleCancel">取消</a-button>
        <a-button style="margin-left: 10px" key="forward" :loading="confirmLoading" type="primary" @click="handleNext(currentStep)">{{ currentStep === 3 && '提交' || '下一步' }}</a-button>
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import pick from 'lodash.pick'
import formGenerator from '../components/form-generator/index.vue'

export default {
  name: 'StepByStepModal',
  components: {
    formGenerator
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
      visible: false,
      confirmLoading: false,
      currentStep: 0,
      instructions: '<h2>请填写使用说明</h2>',
      standard: '<h2>请填写标准规范</h2>',
      editorOption: {
        // Some Quill options...
      },
      form: {
        name: ''
      }
    }
  },
  methods: {
    open () {
      this.visible = true
    },
    close () {
      this.visible = false
    },
    edit (record) {
      this.visible = true
      const { form: { setFieldsValue } } = this
      this.$nextTick(() => {
        setFieldsValue(pick(record, []))
      })
    },
    handleNext (step) {
      const currentStep = step + 1
      if (currentStep <= 3) {
        // stepForms
        this.currentStep = currentStep
        return
      }
      // last step
      this.confirmLoading = true
      setTimeout(() => {
        this.confirmLoading = false
        this.$message.success('添加成功！')
        this.$emit('onGoBack')
      }, 1500)
    },
    backward () {
      this.currentStep--
    },
    handleCancel () {
      this.$emit('onGoBack')
      this.currentStep = 0
    },
    onEditorChange({ quill, html, text }) {
      console.log('editor change!', quill, html, text)
      this.content = html
    }
  },
  mounted() {
    console.log('form', this.form)
  }
}
</script>
<style scoped lang="less">
/deep/ .ql-editor {
  min-height: 200px !important;
}
</style>
