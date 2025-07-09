<template>
  <a-modal
    title="编辑资源信息"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirmLoading="confirmLoading"
    width="800px"
  >
    <a-form :form="form" layout="vertical">
      <a-tabs type="card">
        <a-tab-pane key="tab1" tab="基本信息">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="资源名称">
                <a-input
                  v-decorator="[
                    'name',
                    {
                      rules: [{ required: true, message: '请输入资源名称' }],
                      initialValue: currentRecord.name,
                    },
                  ]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="资源状态">
                <a-select
                  :disabled="true"
                  v-decorator="[
                    'status',
                    {
                      rules: [{ required: true, message: '请选择资源状态' }],
                      initialValue: currentRecord.status,
                    },
                  ]"
                >
                  <a-select-option v-for="item in statusDict" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="资源类型">
                <a-select
                  v-decorator="[
                    'type',
                    {
                      rules: [{ required: true, message: '请选择资源类型' }],
                      initialValue: currentRecord.type,
                    },
                  ]"
                >
                  <a-select-option v-for="item in typeArr" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="技术类型">
                <a-select
                  v-decorator="[
                    'technology',
                    {
                      rules: [{ required: true, message: '请选择技术类型' }],
                      initialValue: currentRecord.technology,
                    },
                  ]"
                >
                  <a-select-option v-for="item in technologyArr" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="行业">
                <a-select
                  v-decorator="[
                    'industry',
                    {
                      initialValue: currentRecord.industry,
                    },
                  ]"
                  allowClear
                >
                  <a-select-option v-for="item in industryArr" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="场景">
                <a-select
                  v-decorator="[
                    'scenario',
                    {
                      initialValue: currentRecord.scenario,
                    },
                  ]"
                  allowClear
                >
                  <a-select-option v-for="item in scenarioArr" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="属性">
                <a-select
                  v-decorator="[
                    'attribute',
                    {
                      initialValue: currentRecord.attribute,
                    },
                  ]"
                  allowClear
                >
                  <a-select-option v-for="item in attributeArr" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="调用次数" :disabled="!isAdmin">
                <a-input-number
                  v-decorator="[
                    'number',
                    {
                      initialValue: currentRecord.number || 0,
                    },
                  ]"
                  :min="0"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane v-if="currentRecord.norm && currentRecord.norm.length > 0" key="tab2" :tab="currentRecord.type === 'meta' ? '业务验证' : '技术评测'">
          <a-row :gutter="16">
            <a-col :span="8" v-for="(item, index) in currentRecord.norm" :key="index">
              <a-form-item :label="getNormText(item.key)">
                <el-rate
                  :disabled="!isAdmin"
                  v-model="item.score"
                  show-score
                  text-color="#ff9900"
                />
                <a-checkbox :disabled="!isAdmin" :checked="item.platformChecked === 1">平台已测评</a-checkbox>
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane key="tab3" tab="服务溯源">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="公司名称">
                <a-input
                  v-decorator="[
                    'source.companyName',
                    {
                      rules: [{ required: true, message: '请输入公司名称' }],
                      initialValue: currentRecord.source?.companyName || '',
                    },
                  ]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="公司综合可信度">
                <el-rate
                  v-model="source.companyScore"
                  show-score
                  text-color="#ff9900"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="地址">
                <a-input
                  v-decorator="[
                    'source.companyAddress',
                    {
                      initialValue: currentRecord.source?.companyAddress || '',
                    },
                  ]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="联系方式">
                <a-input
                  v-decorator="[
                    'source.companyContact',
                    {
                      initialValue: currentRecord.source?.companyContact || '',
                    },
                  ]"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="公司简介">
            <a-textarea
              v-decorator="[
                'source.companyIntroduce',
                {
                  initialValue: currentRecord.source?.companyIntroduce || '',
                },
              ]"
              :rows="3"
            />
          </a-form-item>
          <a-form-item label="资源描述">
            <a-textarea
              v-decorator="[
                'source.msIntroduce',
                {
                  initialValue: currentRecord.source?.msIntroduce || '',
                },
              ]"
              :rows="4"
            />
          </a-form-item>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="资源综合可信度">
                <el-rate
                  v-model="source.msScore"
                  show-score
                  text-color="#ff9900"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </a-modal>
</template>

<script>
import store from '@/store'

export default {
  name: 'ServiceEditModal',
  props: {
    statusDict: {
      type: Array,
      default: () => []
    },
    normDict: {
      type: Array,
      default: () => []
    },
    typeArr: {
      type: Array,
      default: () => []
    },
    technologyArr: {
      type: Array,
      default: () => []
    },
    industryArr: {
      type: Array,
      default: () => []
    },
    scenarioArr: {
      type: Array,
      default: () => []
    },
    attributeArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: null,
      isAdmin: store.getters.roles?.permissionList?.includes('admin') || false,
      activeTab: 'tab1',
      currentRecord: {
        name: '',
        type: undefined,
        technology: undefined,
        status: undefined,
        industry: undefined,
        scenario: undefined,
        attribute: [],
        number: 0,
        norm: [],
        source: {
          companyName: '',
          companyAddress: '',
          companyContact: '',
          companyIntroduce: '',
          msIntroduce: '',
          companyScore: 0,
          msScore: 0
        }
      },
      source: {
        companyName: '',
        companyAddress: '',
        companyContact: '',
        companyIntroduce: '',
        msIntroduce: '',
        companyScore: 0,
        msScore: 0
      }
    }
  },
  methods: {
    // 初始化方法，由父组件调用
    init(record) {
      // 每次打开模态框时创建新的表单实例
      this.form = this.$form.createForm(this)
      this.visible = true
      this.confirmLoading = false
      this.activeTab = 'tab1'

      // 复制记录数据
      this.currentRecord = { ...record }

      // 初始化source数据
      if (record?.source) {
        this.source = { ...record.source }
      } else {
        this.source = {
          companyName: '',
          companyAddress: '',
          companyContact: '',
          companyIntroduce: '',
          msIntroduce: '',
          companyScore: 0,
          msScore: 0
        }
      }
    },
    getNormText(code) {
      return this.normDict.find(item => item.code === code).text
    },
    handleOk() {
      this.form.validateFields((errors, values) => {
        if (errors) {
          return
        }
        // 合并source数据
        const source = {
          ...this.source,
          companyName: values.source?.companyName || '',
          companyAddress: values.source?.companyAddress || '',
          companyContact: values.source?.companyContact || '',
          companyIntroduce: values.source?.companyIntroduce || '',
          msIntroduce: values.source?.msIntroduce || '',
          popoverTitle: '可信云技术资源溯源'
        }
        // 合并所有数据
        const updatedRecord = {
          ...this.currentRecord,
          ...values,
          source
        }
        this.confirmLoading = true
        this.$emit('ok', updatedRecord)
      })
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>
