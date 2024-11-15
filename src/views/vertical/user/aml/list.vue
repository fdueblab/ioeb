<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <a-form :form="form" layout="inline">
        <standard-form-row title="领域" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">跨境支付异常监测服务</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="行业" grid>
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">金融风控</tag-select-option>
              <tag-select-option value="Category2">自贸监管</tag-select-option>
              <tag-select-option value="Category3">跨境贸易</tag-select-option>
              <tag-select-option value="Category4">跨境电商</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>
        <standard-form-row title="场景" grid>
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">反洗钱</tag-select-option>
              <tag-select-option value="Category2">合规监测</tag-select-option>
              <tag-select-option value="Category3">税务稽查</tag-select-option>
              <tag-select-option value="Category4">业务统计</tag-select-option>
              <tag-select-option value="Category5">信用评估</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>
        <standard-form-row title="技术" grid>
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">异常识别</tag-select-option>
              <tag-select-option value="Category2">安全计算</tag-select-option>
              <tag-select-option value="Category3">技术评测</tag-select-option>
              <tag-select-option value="Category4">报告生成</tag-select-option>
              <tag-select-option value="Category5">配套技术</tag-select-option>
              <tag-select-option value="Category6">关联技术</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>
        <standard-form-row title="其他" grid last>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="服务名称" :wrapper-col="{ xs: 18, sm: 18, md: 18 }">
                <a-input style="width: 100%" v-model="queryParam.name" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="发布日期" :wrapper-col="{ xs: 18, sm: 18, md: 18 }">
                <a-date-picker v-model="queryParam.pushDate" style="width: 100%" placeholder="请输入更新日期"/>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </standard-form-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <a-table
        ref="table"
        :columns="columns"
        :dataSource="dataSource"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="norm" slot-scope="text">
          <a-tag color="#87d068" v-for="(item, index) in text" :key="index"><a-icon type="check" /> {{ item | normFilter }}</a-tag>
        </span>
        <span slot="source" slot-scope="text">
          <a-tag color="blue" @change="handleSource(text)">知识产权</a-tag>
          <a-tag color="cyan" @change="handleSource(text)">应用案例</a-tag>
          <a-tag color="orange" @change="handleSource(text)">舆情信息</a-tag>
          <a-tag color="green" @change="handleSource(text)">链上存证</a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleUse(record)">使用</a>
          </template>
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'

const TagSelectOption = TagSelect.Option
const statusMap = {
  0: {
    status: 'default',
    text: '关闭'
  },
  1: {
    status: 'processing',
    text: '运行中'
  },
  2: {
    status: 'success',
    text: '容器已分配'
  },
  3: {
    status: 'error',
    text: '异常'
  }
}
const normMap = {
  0: {
    text: '安全性'
  },
  1: {
    text: '鲁棒性'
  },
  2: {
    text: '隐私性'
  },
  3: {
    text: '可信性'
  }
}
const data = []
data.push({
  name: '异常识别微服务',
  type: '异常识别',
  status: 1,
  norm: [0, 1, 2],
  number: '2342'
})
data.push({
  name: '安全计算微服务',
  type: '安全计算',
  status: 0,
  norm: [0, 2],
  number: '2342'
})
data.push({
  name: '技术评测微服务',
  type: '技术评测',
  status: 3,
  norm: [1, 2],
  number: '2342'
})
data.push({
  name: '报告生成微服务',
  type: '报告生成',
  status: 2,
  norm: [0, 1, 3],
  number: '2342'
})
data.push({
  name: '信用评估微服务',
  type: '信用评估',
  status: 1,
  norm: [1, 2, 3],
  number: '2342'
})

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
      // create model
      form: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
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
          dataIndex: 'type'
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
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    },
    normFilter (type) {
      return normMap[type].text
    }
  },
  created () {
    this.dataSource = data
  },
  computed: {
  },
  methods: {
    handleToAdd () {
      this.$refs.tempSelectModal.open()
    },
    handleAdd () {
      this.$emit('onGoAdd')
    },
    handleEdit (record) {
      console.log(record)
    },
    handleSource (record) {
      console.log(record)
    },
    handleUse (record) {
      if (record.status === 0) {
        this.$message.warning('服务关闭中，请启动后使用！')
      } else if (record.status === 3) {
        this.$message.error('服务异常，暂无法使用！')
      } else {
        this.$emit('onGoUse')
      }
    },
    delConfirm() {
      this.$message.success('删除成功！')
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleSub (record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    handleChange (value) {
      console.log(`selected ${value}`)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
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
</style>
