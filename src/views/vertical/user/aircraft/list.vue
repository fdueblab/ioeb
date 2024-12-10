<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <a-form :form="form" layout="inline">
        <standard-form-row title="类型" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select @change="handleTagChange('type', $event)">
              <tag-select-option v-for="(item, index) in typeArr" :key="index" :value="index">{{ item }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="领域" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select @change="handleTagChange('domain', $event)">
              <tag-select-option v-for="(item, index) in domainArr" :key="index" :value="index">{{ item }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="行业" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('industry', $event)">
              <tag-select-option v-for="(item, index) in industryArr" :key="index" :value="index">{{ item }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="场景" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('scenario', $event)">
              <tag-select-option v-for="(item, index) in scenarioArr" :key="index" :value="index">{{ item }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="技术" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('technology', $event)">
              <tag-select-option v-for="(item, index) in technologyArr" :key="index" :value="index">{{ item }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="智能检索" grid last>
          <a-form-item>
            <a-button class="dify-chatbot-bubble-button" @click="toggleChatBot">
              <a-icon type="robot" v-if="!showChatBot"/>
              <a-icon type="close" v-else/>
            </a-button>
          </a-form-item>
        </standard-form-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
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
    <!-- 聊天机器人容器 -->
    <div v-if="showChatBot" class="dify-chatbot-container">
      <iframe
        src="https://yufanwenshu.cn/chatbot/RcN7gYC9B3UnlUWc"
        style="width: 100%; height: 100%; min-height: 700px"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>
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
  name: '无人机虚拟仿真微服务',
  type: 0,
  domain: 0,
  industry: 0,
  scenario: 0,
  technology: 1,
  status: 1,
  norm: [0, 1, 2],
  number: '2342'
})
data.push({
  name: '无人机低空测绘微服务',
  type: 0,
  domain: 0,
  industry: 1,
  scenario: 3,
  technology: 2,
  status: 0,
  norm: [0, 2],
  number: '2342'
})
data.push({
  name: '无人机目标识别微服务',
  type: 0,
  domain: 0,
  industry: 2,
  scenario: 4,
  technology: 2,
  status: 3,
  norm: [1, 2],
  number: '2342'
})
data.push({
  name: '无人机远程控制微服务',
  type: 0,
  domain: 0,
  industry: 0,
  scenario: 1,
  technology: 3,
  status: 2,
  norm: [0, 1, 3],
  number: '2342'
})
data.push({
  name: '无人机视频分析微服务',
  type: 0,
  domain: 0,
  industry: 1,
  scenario: 2,
  technology: 4,
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
      showChatBot: false, // 控制聊天机器人是否显示
      // 查询参数
      queryParam: {
        type: [],
        domain: [],
        industry: [],
        scenario: [],
        technology: [],
        name: ''
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
      dataSource: data,
      filteredDataSource: data,
      selectedRowKeys: [],
      selectedRows: [],
      typeArr: ['原子微服务', '元应用服务'],
      domainArr: ['无人机技术服务'],
      industryArr: ['城市治理', '文旅农林', '教育培训'],
      scenarioArr: ['应急救援', '交通巡逻', '低空物流', '低空测绘', '目标识别'],
      technologyArr: ['线路设计', '虚拟仿真', '智能感知', '远程控制', '视频分析', '技术评价']
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
    this.filteredDataSource = this.dataSource
  },
  computed: {
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
      this.queryParam = {}
      this.filteredDataSource = this.dataSource
    },
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
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    toggleChatBot() {
      this.showChatBot = !this.showChatBot // 切换聊天机器人的显示状态
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

.dify-chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 400px;
  height: 500px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 按钮的样式 */
.dify-chatbot-bubble-button {
  width: 60px;
  border-radius: 25%; /* 圆形按钮 */
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dify-chatbot-bubble-button:hover {
  background: #40a9f0;
  transform: scale(1.1); /* 悬停时放大 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.dify-chatbot-bubble-button:active {
  transform: scale(0.95); /* 点击时缩小 */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
</style>
