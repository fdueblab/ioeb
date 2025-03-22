<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="24">
      <a-col :span="10">
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :span="18">
                  <a-form-item label="服务名称">
                    <a-input v-model="queryParam.id" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <div style="text-align: center;">
                    <a-button type="primary">查询</a-button>
                  </div>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <a-table
            ref="table"
            :columns="columns"
            :dataSource="dataSource"
            :row-selection="rowSelection"
            :loading="dataLoading"
            size="middle"
          >
            <span slot="serial" slot-scope="text, record, index">
              {{ index + 1 }}
            </span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="14">
        <a-card :bordered="false">
          <a-form>
            <a-row :gutter="20">
              <a-col :span="8">
                <a-form-item label="评测指标">
                  <a-select placeholder="请选择" :default-value="-1">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option v-for="(item, index) in normOptions" :key="index" :value="index">
                      {{ item.text }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="数据集">
                  <a-select v-model="dataSetType" placeholder="请选择" default-value="0">
                    <a-select-option value="0">平台数据集</a-select-option>
                    <a-select-option value="1">上载数据集</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '0'" :span="6">
                <a-form-item label="选择数据集">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option value="0">无人机轨迹</a-select-option>
                    <a-select-option value="1">目标识别</a-select-option>
                    <a-select-option value="2">课题组</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '1'" :span="8">
                <a-form-item label="上载数据集">
                  <a-upload
                    accept=".csv,.txt,.xls,.xlsx"
                    :file-list="dataSetFiles"
                    :remove="removeDataSetFile"
                    :customRequest="customDataSetFileChose"
                    :multiple="true">
                    <a-button> <a-icon type="upload" /> 选择数据集 </a-button>
                  </a-upload>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <a-form>
            <a-form-item label="测评结果">
              <a-textarea v-model="response" placeholder="" :rows="7" />
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center">
              <a-button type="primary" @click="onTest">开始测评</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </page-header-wrapper>
</template>

<script>
import { ArticleListContent, StandardFormRow, TagSelect } from '@/components'
import { getNormMap, getServiceStatusMap } from '@/mock/data/map_data'
import { getServiceData } from '@/mock/data/services_data'

export default {
  name: 'TableList',
  components: {
    TagSelect,
    StandardFormRow,
    ArticleListContent
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
        }
      ],
      normOptions: getNormMap(),
      dataSetType: '0',
      dataSetFiles: [],
      dataLoading: false,
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      response: ''
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
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    async initData() {
      this.dataLoading = true
      this.dataSource = await getServiceData('agriculture', true)
      this.dataLoading = false
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
    handleCancel () {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleChange (value) {
      console.log(`selected ${value}`)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    async customDataSetFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.dataSetFiles = [{
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }]
    },
    removeDataSetFile () {
      this.dataSetFiles = []
    },
    onTest () {
      const obj = {
        code: 200,
        message: '测试通过！'
      }
      this.response = JSON.stringify(obj, null, 4)
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
