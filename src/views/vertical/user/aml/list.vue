<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <a-form layout="inline">
        <standard-form-row title="智能检索" block style="padding-bottom: 11px;">
          <a-row>
            <a-col :span="12">
              <a-form-item :wrapper-col="{ xs: 22, sm: 22, md: 22 }">
                <a-input-search style="width: 100%" v-model="agentSearchText" placeholder="请输入您想要的微服务名称、功能等"
                                @search="handleAgentSearch" :loading="agentSearchLoading" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="领域知识增强检索">
                <a-button ref="ragButton" class="rag-input-bubble-button" @click="toggleRAGInput">
                  <a-icon type="dot-chart" v-if="!showRAGInput"/>
                  <a-icon type="close" v-else/>
                </a-button>
              </a-form-item>
            </a-col>
            <!--            <a-col :span="6">-->
            <!--              <a-form-item>-->
            <!--                <a-button type="primary" icon="sync" @click="handleReset">重置检索条件</a-button>-->
            <!--              </a-form-item>-->
            <!--            </a-col>-->
          </a-row>
        </standard-form-row>

        <standard-form-row title="类型" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select @change="handleTagChange('type', $event)">
              <tag-select-option v-for="(item, index) in typeArr" :key="index" :value="index">{{ item
              }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="领域" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select @change="handleTagChange('domain', $event)">
              <tag-select-option v-for="(item, index) in domainArr" :key="index" :value="index">{{ item
              }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="行业" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('industry', $event)">
              <tag-select-option v-for="(item, index) in industryArr" :key="index" :value="index">{{ item
              }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="场景" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('scenario', $event)">
              <tag-select-option v-for="(item, index) in scenarioArr" :key="index" :value="index">{{ item
              }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="技术" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('technology', $event)">
              <tag-select-option v-for="(item, index) in technologyArr" :key="index" :value="index">{{ item
              }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>
      </a-form>
    </a-card>
    <a-card :bordered="false" :title="agentSearchData.length > 0 ? 'AI智能检索为您推荐以下微服务' : false">
      <a-table
        ref="table"
        :columns="columns"
        :dataSource="filteredDataSource"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="norm" slot-scope="text">
          <a-popover v-for="(item, index) in text" :key="index" title="可信云技术服务溯源">
            <template slot="content">
              <p>{{ item.key | normFilter }}</p>
              <el-rate v-model="item.score" disabled show-score text-color="#ff9900" />
            </template>
            <a-tag color="#87d068">
              <a-icon type="check" /> {{ item.key | normFilter }}
            </a-tag>
          </a-popover>
        </span>
        <span slot="source" slot-scope="text">
          <a-popover :title="text.popoverTitle">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce }}</p>
              <p>综合可信度：</p>
              <el-rate v-model="text.companyScore" disabled show-score text-color="#ff9900" :score-template="text.companyScore.toString()"></el-rate>
              <h1>微服务信息</h1>
              <p><strong>微服务描述:</strong> {{ text.msIntroduce }}</p>
              <p>综合可信度：
                <el-rate v-model="text.msScore" disabled show-score text-color="#ff9900" :score-template="text.msScore.toString()"></el-rate>
              </p>
            </template>
            <a-tag color="blue" @change="handleSource(text)">知识产权</a-tag>
          </a-popover>
          <a-popover :title="text.popoverTitle">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce }}</p>
              <p>综合可信度：</p>
              <el-rate v-model="text.companyScore" disabled show-score text-color="#ff9900" :score-template="text.companyScore.toString()"></el-rate>
              <h1>微服务信息</h1>
              <p><strong>微服务描述:</strong> {{ text.msIntroduce }}</p>
              <p>综合可信度：
                <el-rate v-model="text.msScore" disabled show-score text-color="#ff9900" :score-template="text.msScore.toString()"></el-rate>
              </p>
            </template>
            <a-tag color="cyan" @change="handleSource(text)">应用案例</a-tag>
          </a-popover>
          <a-popover :title="text.popoverTitle">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce }}</p>
              <p>综合可信度：</p>
              <el-rate v-model="text.companyScore" disabled show-score text-color="#ff9900" :score-template="text.companyScore.toString()"></el-rate>
              <h1>微服务信息</h1>
              <p><strong>微服务描述:</strong> {{ text.msIntroduce }}</p>
              <p>综合可信度：
                <el-rate v-model="text.msScore" disabled show-score text-color="#ff9900" :score-template="text.msScore.toString()"></el-rate>
              </p>
            </template>
            <a-tag color="orange" @change="handleSource(text)">舆情信息</a-tag>
          </a-popover>
          <a-popover :title="text.popoverTitle">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce }}</p>
              <p>综合可信度：</p>
              <el-rate v-model="text.companyScore" disabled show-score text-color="#ff9900" :score-template="text.companyScore.toString()"></el-rate>
              <h1>微服务信息</h1>
              <p><strong>微服务描述:</strong> {{ text.msIntroduce }}</p>
              <p>综合可信度：
                <el-rate v-model="text.msScore" disabled show-score text-color="#ff9900" :score-template="text.msScore.toString()"></el-rate>
              </p>
            </template>
            <a-tag color="green" @change="handleSource(text)">链上存证</a-tag>
          </a-popover>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" @click="handleUse(record)">使用</a-button>
          </template>
        </span>
      </a-table>
    </a-card>
    <!-- 编辑模态框 -->
    <a-modal
      title="编辑记录"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
      :confirmLoading="confirmLoading"
    >
      <a-form :form="editForm" layout="vertical">
        <a-form-item label="服务名称">
          <a-input
            v-decorator="[
              'name',
              {
                rules: [{ required: true, message: '请输入服务名称' }],
                initialValue: mdl.name,
              },
            ]"
          />
        </a-form-item>
        <a-form-item label="服务类型">
          <a-select
            v-decorator="[
              'type',
              {
                rules: [{ required: true, message: '请选择服务类型' }],
                initialValue: mdl.type,
              },
            ]"
          >
            <a-select-option v-for="(item, index) in typeArr" :key="index" :value="index">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="技术类型">
          <a-select
            v-decorator="[
              'technology',
              {
                rules: [{ required: true, message: '请选择技术类型' }],
                initialValue: mdl.technology,
              },
            ]"
          >
            <a-select-option v-for="(item, index) in technologyArr" :key="index" :value="index">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="技术指标">
          <a-row v-for="(item, index) in normMap" :key="index">
            <div v-if="mdl.norm.some(n => n.key === index)" style="display: flex; height: 30px">
              {{ item.text }}
              <el-rate
                v-model="mdl.norm.find(n => n.key === index).score"
                style="margin-left: 10px;"
                show-score
                text-color="#ff9900"
              />
            </div>
          </a-row>
        </a-form-item>
        <a-form-item label="服务溯源">
          <a-form-item label="公司名称">
            <a-input
              v-decorator="[
                'source.companyName',
                {
                  rules: [{ required: true, message: '请输入公司名称' }],
                  initialValue: mdl.source.companyName,
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="公司地址">
            <a-input
              v-decorator="[
                'source.companyAddress',
                {
                  rules: [{ required: true, message: '请输入公司地址' }],
                  initialValue: mdl.source.companyAddress,
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="联系方式">
            <a-input
              v-decorator="[
                'source.companyContact',
                {
                  rules: [{ required: true, message: '请输入联系方式' }],
                  initialValue: mdl.source.companyContact,
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="微服务描述">
            <a-textarea
              v-decorator="[
                'source.msIntroduce',
                {
                  rules: [{ required: true, message: '请输入微服务描述' }],
                  initialValue: mdl.source.msIntroduce,
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="公司评分">
            <el-rate
              v-decorator="[
                'source.companyScore',
                {
                  rules: [{ required: true, message: '请输入公司评分' }],
                  initialValue: mdl.source.companyScore,
                },
              ]"
              show-score
              text-color="#ff9900"
            />
          </a-form-item>
          <a-form-item label="微服务评分">
            <el-rate
              v-decorator="[
                'source.msScore',
                {
                  rules: [{ required: true, message: '请输入微服务评分' }],
                  initialValue: mdl.source.msScore,
                },
              ]"
              show-score
              text-color="#ff9900"
            />
          </a-form-item>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 知识增强容器 -->
    <div
      v-if="showRAGInput"
      ref="ragContainer"
      class="rag-input-container"
      :style="containerStyle"
    >
      <a-form :form="ragForm" layout="vertical">
        <a-form-item label="微服务/元应用名称">
          <a-input v-model="ragForm.name" placeholder="请输入微服务/元应用名称" />
        </a-form-item>
        <a-form-item label="通用描述">
          <a-input v-model="ragForm.description" placeholder="请输入通用描述" />
        </a-form-item>
        <a-form-item label="作用">
          <a-input v-model="ragForm.purpose" placeholder="请输入作用" />
        </a-form-item>
        <a-form-item label="功能">
          <a-input v-model="ragForm.feature" placeholder="请输入功能" />
        </a-form-item>
        <a-form-item label="技术要求">
          <a-input v-model="ragForm.technology" placeholder="请输入技术要求" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="上传知识库文档">
              <a-upload
                :file-list="ragFiles"
                :remove="removeRagFile"
                :customRequest="customRagFileChose"
                :multiple="true">
                <a-button> <a-icon type="upload" /> 选择文件 </a-button>
              </a-upload>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item tooltip="value*category">
              <span slot="label">上载知识库
                <a-tooltip title="上载后可以使用该知识库进行领域知识增强检索">
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-button type="primary" @click="handleRagUpload" icon="cloud-upload" :loading="ragUploadLoading">
                提交
              </a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'
import { getAmlMetaApps, getAmlServices } from '@/mock/data/services_data'
import { getIndustryMap, getScenarioMap, getTechnologyMap, getNormMap, getServiceStatusMap, getServiceTypeMap } from '@/mock/data/map_data'

const TagSelectOption = TagSelect.Option

export default {
  name: 'TableList',
  components: {
    Ellipsis,
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    TagSelectOption
  },
  data () {
    return {
      editForm: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
      mdl: {
        name: '',
        norm: [],
        source: {}
      },
      // 知识增强
      showRAGInput: false,
      ragForm: {
        name: '',
        description: '',
        purpose: '',
        feature: '',
        technology: ''
      },
      ragFiles: [],
      ragUploadLoading: false,
      agentSearchText: '',
      agentSearchLoading: false,
      agentSearchData: [],
      statusMap: getServiceStatusMap(),
      normMap: getNormMap(),
      // 查询参数
      queryParam: {
        type: [],
        domain: [],
        industry: [],
        scenario: [],
        technology: []
      },
      // 加载数据方法 必须为 Promise 对象
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name'
        },
        {
          title: '服务类型',
          dataIndex: 'type',
          width: '100px',
          customRender: (text) => this.typeArr[text]
        },
        {
          title: '技术类型',
          dataIndex: 'technology',
          width: '100px',
          customRender: (text) => this.technologyArr[text]
        },
        {
          title: '服务状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '技术指标',
          dataIndex: 'norm',
          scopedSlots: { customRender: 'norm' }
        },
        {
          title: '调用次数',
          dataIndex: 'number',
          customRender: (text) => text + ' 次'
        },
        {
          title: '服务溯源',
          dataIndex: 'source',
          scopedSlots: { customRender: 'source' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '80px',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataSource: [],
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      typeArr: getServiceTypeMap(),
      domainArr: ['跨境支付AI监测服务'],
      industryArr: getIndustryMap('aml'),
      scenarioArr: getScenarioMap('aml'),
      technologyArr: getTechnologyMap('aml'),
      containerStyle: {
        top: '0',
        left: '0'
      }
    }
  },
  filters: {
    statusFilter (type) {
      const statusMap = getServiceStatusMap()
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      const statusMap = getServiceStatusMap()
      return statusMap[type].status
    },
    normFilter (type) {
      const normMap = getNormMap()
      return normMap[type].text
    }
  },
  created () {
    this.initData()
  },
  mounted() {
    // 监听窗口大小变化，动态调整容器位置
    window.addEventListener('resize', this.updateContainerPosition)
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.updateContainerPosition)
  },
  methods: {
    handleTagChange(field, e) {
      const selectedTagVal = e.value
      const index = this.queryParam[field].indexOf(selectedTagVal)
      if (index > -1) {
        this.queryParam[field].splice(index, 1)
      } else {
        this.queryParam[field].push(selectedTagVal)
      }
      this.filterDataSource()
    },
    filterDataSource() {
      this.filteredDataSource = this.dataSource.filter(item => {
        return (this.queryParam.type.length > 0 ? this.queryParam.type.includes(item.type) : true) &&
          (this.queryParam.domain.length > 0 ? this.queryParam.domain.includes(item.domain) : true) &&
          (this.queryParam.industry.length > 0 ? this.queryParam.industry.includes(item.industry) : true) &&
          (this.queryParam.scenario.length > 0 ? this.queryParam.scenario.includes(item.scenario) : true) &&
          (this.queryParam.technology.length > 0 ? this.queryParam.technology.includes(item.technology) : true)
      })
    },
    handleSearch() {
      this.filterDataSource()
    },
    handleReset() {
      // TODO: 要在TagSelect中添加清除方法
      this.queryParam = {
        type: [],
        domain: [],
        industry: [],
        scenario: [],
        technology: [],
        name: ''
      }
      this.initData()
    },
    handleEdit(record) {
      this.visible = true // 显示模态框
      this.mdl = { ...record } // 将选中的记录数据复制到 mdl 中
      this.$nextTick(() => {
        // 填充表单数据
        this.editForm.setFieldsValue({
          name: record.name,
          type: record.type,
          technology: record.technology,
          norm: record.norm.map(item => item.key),
          'source.companyName': record.source.companyName,
          'source.companyAddress': record.source.companyAddress,
          'source.companyContact': record.source.companyContact,
          'source.msIntroduce': record.source.msIntroduce,
          'source.companyScore': record.source.companyScore,
          'source.msScore': record.source.msScore
        })
      })
    },
    handleOk() {
      this.editForm.validateFields((errors, values) => {
        if (!errors) {
          this.confirmLoading = true
          const norm = values.norm.map(key => {
            const existingNorm = this.mdl.norm.find(n => n.key === key)
            return {
              key,
              score: existingNorm ? existingNorm.score : 5
            }
          })

          // 更新 source 数据
          const source = {
            popoverTitle: '可信云技术服务溯源',
            companyName: values['source.companyName'],
            companyAddress: values['source.companyAddress'],
            companyContact: values['source.companyContact'],
            msIntroduce: values['source.msIntroduce'],
            companyScore: values['source.companyScore'],
            msScore: values['source.msScore']
          }

          // 更新 mdl 数据
          this.mdl = {
            ...this.mdl,
            ...values,
            norm,
            source
          }

          // 模拟异步操作
          setTimeout(() => {
            // 更新数据
            const index = this.dataSource.findIndex(item => item.id === this.mdl.id)
            if (index > -1) {
              this.dataSource.splice(index, 1, this.mdl)
            }
            this.visible = false
            this.confirmLoading = false
            this.$message.success('编辑成功')
          }, 1000)
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.editForm.resetFields()
      this.mdl = {
        name: '',
        norm: [],
        source: {}
      }
    },
    handleSource(record) {
      // console.log(record)
    },
    handleUse(record) {
      switch (record.status) {
        case 0:
          this.$message.error('服务部署失败，请重新部署后使用！')
          break
        case 2:
          this.$message.warning('服务未运行，请启动后使用！')
          break
        case 3:
          this.$message.error('服务异常，暂无法使用！')
          break
        case 5:
          this.$message.warning('服务部署中，暂无法使用！')
          break
        default:
          this.$emit('onGoUse', record.apiList || [])
          break
      }
    },
    delConfirm() {
      this.$message.success('删除成功！')
    },
    handleSub(record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    handleChange(value) {
      // console.log(`selected ${value}`)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    resetSearchForm() {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    handleAgentSearch() {
      if (this.agentSearchText && this.agentSearchText !== '') {
        this.agentSearchLoading = true
        console.log(this.agentSearchText)
        // 知识增强
        for (const ragFormItem in this.ragForm) {
          if (this.ragForm[ragFormItem]) {
            this.$message.success('启用知识增强检索...')
            console.log(this.ragForm)
          }
        }
        new Promise((resolve, reject) => {
          setTimeout(() => {
            this.agentSearchData = this.dataSource.filter((item, index) => (index % 2 === 0))
            resolve()
          }, 1000)
        }).then(res => {
          this.filteredDataSource = this.agentSearchData
        }).finally(() => {
          this.agentSearchLoading = false
        })
      } else {
        this.$message.error('请先输入您的需求！')
      }
    },
    initData () {
      this.agentSearchText = ''
      this.agentSearchData = []
      this.dataSource = [...getAmlServices(), ...getAmlMetaApps()]
      this.filteredDataSource = this.dataSource
    },
    toggleRAGInput() {
      this.showRAGInput = !this.showRAGInput
      if (this.showRAGInput) {
        this.$nextTick(() => {
          this.updateContainerPosition()
        })
      }
    },
    updateContainerPosition() {
      const button = this.$refs.ragButton.$el
      const container = this.$refs.ragContainer

      if (button && container) {
        const buttonRect = button.getBoundingClientRect()

        // 设置容器的位置在按钮的右侧
        this.containerStyle = {
          top: `${buttonRect.top - 75}px`,
          left: `${buttonRect.right + 10}px`
        }
      }
    },
    // 知识增强文件
    async customRagFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.ragFiles = {
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }
    },
    removeRagFile () {
      this.ragFiles = []
    },
    handleRagUpload() {
      this.ragUploadLoading = true
      console.log(this.ragForm)
      console.log(this.ragFiles)
      // 模拟上传文件
      setTimeout(() => {
        this.ragUploadLoading = false
        this.$message.success('知识库上传成功！')
        this.showRAGInput = false
        this.ragForm = {
          environment: '',
          process: ''
        }
        this.ragFiles = []
      }, 1000)
    }
  }
}
</script>
<style lang="less" scoped>
.ant-pro-components-tag-select {
  :deep(.ant-pro-tag-select .ant-tag) {
    margin-right: 24px;
    padding: 0 8px;
    font-size: 14px;
  }
}

.list-articles-trigger {
  margin-left: 12px;
}

.rag-input-container {
  position: fixed;
  z-index: 1000;
  width: 400px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

/* 按钮的样式 */
.rag-input-bubble-button {
  width: 40px;
  border-radius: 25%;
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rag-input-bubble-button:hover {
  background: #40a9f0;
  transform: scale(1.1); /* 悬停时放大 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.rag-input-bubble-button:active {
  transform: scale(0.95); /* 点击时缩小 */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
</style>
