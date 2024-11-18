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
              <a-col :span="12">
                <a-form-item label="性能指标">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">可组合</a-select-option>
                    <a-select-option value="2">完备性</a-select-option>
                    <a-select-option value="3">计算效率</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="数据集">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">平台数据集</a-select-option>
                    <a-select-option value="2">上载数据集</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="20">
              <a-col :span="12">
                <ServiceComposition :services="selectedRows"/>
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
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent, ServiceComposition } from '@/components'
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
  name: '无人机虚拟仿真微服务',
  type: '异常识别',
  status: 1,
  norm: [0, 1, 2],
  number: '2342'
})
data.push({
  name: '无人机低空测绘微服务	',
  type: '安全计算',
  status: 0,
  norm: [0, 2],
  number: '2342'
})
data.push({
  name: '无人机目标识别微服务	',
  type: '技术评测',
  status: 3,
  norm: [1, 2],
  number: '2342'
})
data.push({
  name: '无人机远程控制微服务	',
  type: '报告生成',
  status: 2,
  norm: [0, 1, 3],
  number: '2342'
})
data.push({
  name: '无人机视频分析微服务	',
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
    ServiceComposition
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
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      response: ''
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
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
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
    onTest () {
      const obj = {
        code: 200,
        message: '测试通过！'
      }
      const newObj = JSON.stringify(obj, null, 4)
      this.response = newObj
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
