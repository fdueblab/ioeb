<template>
  <page-header-wrapper>
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <a-form :form="form" layout="inline">
        <standard-form-row title="领域" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">无人机技术服务</tag-select-option>
              <tag-select-option value="Category2">反洗钱技术服务</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="行业" grid>
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">城市治理</tag-select-option>
              <tag-select-option value="Category2">文旅农林</tag-select-option>
              <tag-select-option value="Category3">教育培训</tag-select-option>
              <tag-select-option value="Category4">自贸服务</tag-select-option>
              <tag-select-option value="Category5">银行风控</tag-select-option>
              <tag-select-option value="Category6">跨境电商</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>
        <standard-form-row title="场景" grid>
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">应急救援</tag-select-option>
              <tag-select-option value="Category2">交通巡逻</tag-select-option>
              <tag-select-option value="Category3">低空物流</tag-select-option>
              <tag-select-option value="Category4">低空测绘</tag-select-option>
              <tag-select-option value="Category5">目标识别</tag-select-option>
              <tag-select-option value="Category6">欺诈监测</tag-select-option>
              <tag-select-option value="Category7">合规监测</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>
        <standard-form-row title="技术" grid>
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">线路设计</tag-select-option>
              <tag-select-option value="Category2">虚拟仿真</tag-select-option>
              <tag-select-option value="Category3">智能感知</tag-select-option>
              <tag-select-option value="Category4">远程控制</tag-select-option>
              <tag-select-option value="Category5">视频分析</tag-select-option>
              <tag-select-option value="Category6">技术评价</tag-select-option>
              <tag-select-option value="Category7">图分析</tag-select-option>
              <tag-select-option value="Category8">联邦学习</tag-select-option>
              <tag-select-option value="Category9">业务解释</tag-select-option>
              <tag-select-option value="Category10">技术评估</tag-select-option>
              <tag-select-option value="Category11">报告生成</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>
        <standard-form-row title="算法" grid>
          <a-form-item>
            <tag-select>
              <tag-select-option value="Category1">数据资源</tag-select-option>
              <tag-select-option value="Category2">数据处理</tag-select-option>
              <tag-select-option value="Category3">基础算法</tag-select-option>
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
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleToAdd">发布</a-button>
      </div>

      <a-table
        ref="table"
        :columns="columns"
        :dataSource="dataSource"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="50" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a>查看</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="你确定删除么？" @confirm="delConfirm">
              <template #icon><question-circle-outlined style="color: red" /></template>
              <a href="#">删除</a>
            </a-popconfirm>
          </template>
        </span>
      </a-table>
    </a-card>
    <temp-select-modal ref="tempSelectModal" @confirm="handleAdd"></temp-select-modal>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'
import IconText from '../components/IconText'
import tempSelectModal from '../modules/tempSelectModal.vue'

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
    text: '已上线'
  },
  3: {
    status: 'error',
    text: '异常'
  }
}
const data = []
data.push({
  title: '无人机状态采集微服务',
  class: '无人机技术服务',
  description: '远程采集无人机飞行姿态等数据',
  owner: 'publisher',
  updatedAt: '2024-07-26'
})
data.push({
  title: '无人机远程控制微服务',
  class: '无人机技术服务',
  description: '远程发送指令控制无人机',
  owner: 'publisher',
  updatedAt: '2024-07-26'
})
data.push({
  title: '无人机视频采集微服务',
  class: '无人机技术服务',
  description: '自动采集无人机拍摄视频',
  owner: 'publisher',
  updatedAt: '2024-07-26'
})
data.push({
  title: '无人机视频通信微服务',
  class: '无人机技术服务',
  description: '无人机视频通信服务',
  owner: 'publisher',
  updatedAt: '2024-07-26'
})
data.push({
  title: '无人机视频分析微服务',
  class: '无人机技术服务',
  description: '无人机视频分析',
  owner: 'publisher',
  updatedAt: '2024-07-26'
})

export default {
  name: 'TableList',
  components: {
    Ellipsis,
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    IconText,
    tempSelectModal,
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
          dataIndex: 'title'
        },
        {
          title: '描述',
          dataIndex: 'description',
          scopedSlots: { customRender: 'description' }
        },
        {
          title: '分类',
          dataIndex: 'class'
        },
        {
          title: '发布人',
          dataIndex: 'owner'
        },
        {
          title: '发布时间',
          dataIndex: 'updatedAt',
          sorter: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '150px',
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
