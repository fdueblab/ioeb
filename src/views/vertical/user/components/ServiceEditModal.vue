<template>
  <a-modal
    title="编辑服务信息"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirmLoading="confirmLoading"
    width="800px"
  >
    <a-form :form="form" layout="vertical">
      <a-tabs defaultActiveKey="1">
        <a-tab-pane key="1" tab="基本信息">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="服务名称">
                <a-input
                  v-decorator="[
                    'name',
                    {
                      rules: [{ required: true, message: '请输入服务名称' }],
                      initialValue: record.name,
                    },
                  ]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="服务状态">
                <a-select
                  v-decorator="[
                    'status',
                    {
                      rules: [{ required: true, message: '请选择服务状态' }],
                      initialValue: record.status,
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
              <a-form-item label="服务类型">
                <a-select
                  v-decorator="[
                    'type',
                    {
                      rules: [{ required: true, message: '请选择服务类型' }],
                      initialValue: record.type,
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
                      initialValue: record.technology,
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
                      initialValue: record.industry,
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
                      initialValue: record.scenario,
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
          <a-form-item label="属性标签">
            <a-checkbox-group
              v-decorator="[
                'attribute',
                {
                  initialValue: record.attribute || [],
                },
              ]"
            >
              <a-checkbox v-for="item in attributeArr" :key="item.code" :value="item.code">
                {{ item.text }}
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="调用次数">
            <a-input-number
              v-decorator="[
                'number',
                {
                  initialValue: record.number || 0,
                },
              ]"
              :min="0"
              style="width: 100%"
            />
          </a-form-item>
        </a-tab-pane>

        <a-tab-pane key="2" tab="技术指标">
          <a-form-item v-for="item in normDict" :key="item.code" :label="item.text">
            <a-row type="flex" align="middle">
              <a-col :span="18">
                <el-rate
                  v-model="normValues[item.code]"
                  show-score
                  text-color="#ff9900"
                  :max="10"
                />
              </a-col>
              <a-col :span="6">
                <a-checkbox
                  :checked="hasNorm(item.code)"
                  @change="e => handleNormChange(item.code, e.target.checked)"
                >
                  启用该指标
                </a-checkbox>
              </a-col>
            </a-row>
          </a-form-item>
        </a-tab-pane>

        <a-tab-pane key="3" tab="服务溯源">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="公司名称">
                <a-input
                  v-decorator="[
                    'source.companyName',
                    {
                      rules: [{ required: true, message: '请输入公司名称' }],
                      initialValue: record.source?.companyName || '',
                    },
                  ]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="公司评分">
                <el-rate
                  v-decorator="[
                    'source.companyScore',
                    {
                      initialValue: record.source?.companyScore || 0,
                    },
                  ]"
                  show-score
                  text-color="#ff9900"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="公司地址">
            <a-input
              v-decorator="[
                'source.companyAddress',
                {
                  initialValue: record.source?.companyAddress || '',
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="联系方式">
            <a-input
              v-decorator="[
                'source.companyContact',
                {
                  initialValue: record.source?.companyContact || '',
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="公司简介">
            <a-textarea
              v-decorator="[
                'source.companyIntroduce',
                {
                  initialValue: record.source?.companyIntroduce || '',
                },
              ]"
              :rows="3"
            />
          </a-form-item>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="微服务评分">
                <el-rate
                  v-decorator="[
                    'source.msScore',
                    {
                      initialValue: record.source?.msScore || 0,
                    },
                  ]"
                  show-score
                  text-color="#ff9900"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="微服务描述">
            <a-textarea
              v-decorator="[
                'source.msIntroduce',
                {
                  initialValue: record.source?.msIntroduce || '',
                },
              ]"
              :rows="4"
            />
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: 'ServiceEditModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    confirmLoading: {
      type: Boolean,
      default: false
    },
    record: {
      type: Object,
      default: () => ({
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
      })
    },
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
      form: this.$form.createForm(this),
      normValues: {},
      activeNorms: []
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initNormValues()
      }
    },
    record: {
      handler() {
        this.initNormValues()
      },
      deep: true
    }
  },
  created() {
    this.initNormValues()
  },
  methods: {
    initNormValues() {
      // 初始化技术指标值
      this.normValues = {}
      this.activeNorms = []

      if (this.record && this.record.norm && this.record.norm.length > 0) {
        this.record.norm.forEach(norm => {
          this.normValues[norm.key] = norm.score || 5
          this.activeNorms.push(norm.key)
        })
      }
    },

    hasNorm(normKey) {
      return this.activeNorms.includes(normKey)
    },

    handleNormChange(normKey, checked) {
      if (checked) {
        if (!this.activeNorms.includes(normKey)) {
          this.activeNorms.push(normKey)
          if (!this.normValues[normKey]) {
            this.normValues[normKey] = 5 // 默认值
          }
        }
      } else {
        const index = this.activeNorms.indexOf(normKey)
        if (index > -1) {
          this.activeNorms.splice(index, 1)
        }
      }
    },

    handleOk() {
      this.form.validateFields((errors, values) => {
        if (errors) {
          return
        }

        // 处理技术指标
        const norm = this.activeNorms.map(key => ({
          key,
          score: this.normValues[key] || 5
        }))

        // 确保source对象完整
        const source = {
          popoverTitle: '可信云技术服务溯源',
          ...(this.record.source || {}),
          ...(values.source || {})
        }

        // 合并所有数据
        const updatedRecord = {
          ...this.record,
          ...values,
          norm,
          source
        }

        this.$emit('ok', updatedRecord)
      })
    },

    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>
