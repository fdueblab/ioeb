<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="24">
      <a-col :span="10">
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :span="18">
                  <a-form-item label="元应用名称">
                    <a-input v-model="queryParam.id" placeholder="请输入元应用名称"/>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <div style="text-align: center;">
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                  </div>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <a-table
            ref="table"
            :columns="columns"
            :dataSource="filteredDataSource"
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
                <a-form-item label="验证指标">
                  <a-select placeholder="请选择" :default-value="-1">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option v-for="(item, index) in performanceMetricOptions" :key="index" :value="index">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="数据集">
                  <a-select placeholder="请选择" :default-value="-1">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option v-for="(item, index) in datasetOptions" :key="index" :value="index">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="评估方法">
                  <a-select placeholder="请选择" :default-value="-1">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option v-for="(item, index) in evaluationMethodOptions" :key="index" :value="index">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24" style="text-align: right">
                <a-button type="primary" @click="handleEvaluate" :loading="evaluating">开始评估</a-button>
              </a-col>
            </a-row>
          </a-form>
          <a-divider />
          <div v-if="showResult">
            <h3>评估结果</h3>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="准确率评估" :bordered="false">
                  <a-progress :percent="evaluationResults.accuracy" status="active" />
                  <p>准确率: {{ evaluationResults.accuracy }}%</p>
                  <p>召回率: {{ evaluationResults.recall }}%</p>
                  <p>F1分数: {{ evaluationResults.f1Score }}%</p>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="性能评估" :bordered="false">
                  <a-progress :percent="evaluationResults.performance" status="active" />
                  <p>响应时间: {{ evaluationResults.responseTime }}ms</p>
                  <p>吞吐量: {{ evaluationResults.throughput }}请求/秒</p>
                  <p>资源利用率: {{ evaluationResults.resourceUtilization }}%</p>
                </a-card>
              </a-col>
            </a-row>
            <a-row :gutter="16" style="margin-top: 16px">
              <a-col :span="24">
                <a-card title="详细评估报告" :bordered="false">
                  <a-descriptions bordered>
                    <a-descriptions-item label="模型名称" :span="3">{{ selectedRecord.name }}</a-descriptions-item>
                    <a-descriptions-item label="评估时间" :span="3">{{ evaluationResults.evaluationTime }}</a-descriptions-item>
                    <a-descriptions-item label="数据集大小" :span="3">{{ evaluationResults.datasetSize }}条记录</a-descriptions-item>
                    <a-descriptions-item label="评估结论" :span="3">{{ evaluationResults.conclusion }}</a-descriptions-item>
                  </a-descriptions>
                  <a-divider />
                  <a-button type="primary" @click="handleExportReport">导出报告</a-button>
                </a-card>
              </a-col>
            </a-row>
          </div>
          <div v-else>
            <a-empty description="请选择元应用并开始评估" />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { getMetaAppData } from '@/mock/data/services_data'

export default {
  name: 'AgricultureEmulation',
  data () {
    return {
      queryParam: {},
      columns: [
        {
          title: '序号',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '元应用名称',
          dataIndex: 'name'
        },
        {
          title: '应用类型',
          dataIndex: 'scenario',
          customRender: (text) => {
            const scenarioMap = ['精准播种', '病虫害防治', '智能灌溉', '产量预测', '综合管理']
            return scenarioMap[text] || text
          }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          sorter: true
        }
      ],
      dataSource: [],
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      dataLoading: false,
      evaluating: false,
      showResult: false,
      performanceMetricOptions: [
        '准确率',
        '召回率',
        'F1分数',
        '响应时间',
        '吞吐量',
        '资源利用率'
      ],
      datasetOptions: [
        '农作物图像数据集',
        '病虫害样本数据集',
        '土壤湿度历史数据',
        '气象数据集',
        '产量历史数据'
      ],
      evaluationMethodOptions: [
        '交叉验证',
        'A/B测试',
        '蒙特卡洛模拟',
        '敏感性分析',
        '压力测试'
      ],
      selectedRecord: {},
      evaluationResults: {
        accuracy: 0,
        recall: 0,
        f1Score: 0,
        performance: 0,
        responseTime: 0,
        throughput: 0,
        resourceUtilization: 0,
        evaluationTime: '',
        datasetSize: 0,
        conclusion: ''
      }
    }
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        type: 'radio'
      }
    }
  },
  async mounted () {
    this.dataLoading = true
    try {
      // 使用getMetaAppData获取农业元应用数据
      const metaApps = await getMetaAppData('agriculture')

      // 为每个元应用添加createTime字段（如果没有的话）
      this.dataSource = metaApps.map(app => {
        if (!app.createTime) {
          // 模拟创建时间
          const date = new Date()
          date.setDate(date.getDate() - Math.floor(Math.random() * 10))
          app.createTime = moment(date).format('YYYY-MM-DD HH:mm:ss')
        }
        return app
      })

      this.filteredDataSource = [...this.dataSource]
    } catch (error) {
      console.error('获取元应用数据失败', error)
      this.$message.error('获取元应用数据失败')
    } finally {
      this.dataLoading = false
    }
  },
  methods: {
    handleSearch () {
      this.dataLoading = true
      setTimeout(() => {
        if (this.queryParam.id) {
          this.filteredDataSource = this.dataSource.filter(item =>
            item.name.includes(this.queryParam.id)
          )
        } else {
          this.filteredDataSource = [...this.dataSource]
        }
        this.dataLoading = false
      }, 500)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      if (selectedRows.length > 0) {
        this.selectedRecord = selectedRows[0]
      } else {
        this.selectedRecord = {}
        this.showResult = false
      }
    },
    handleEvaluate () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请先选择一个元应用')
        return
      }

      this.evaluating = true
      this.showResult = false

      // 模拟评估过程
      setTimeout(() => {
        // 获取选中的元应用
        const selectedApp = this.selectedRows[0]

        // 根据元应用生成评估结果
        this.evaluationResults = {
          accuracy: 92,
          recall: 89,
          f1Score: 90,
          performance: 85,
          responseTime: 120,
          throughput: 150,
          resourceUtilization: 65,
          evaluationTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          datasetSize: 5000,
          conclusion: `${selectedApp.name}表现优异，特别是在准确率和响应时间方面。建议在实际生产环境中部署。`
        }

        this.evaluating = false
        this.showResult = true
      }, 2000)
    },
    handleExportReport () {
      this.$message.success('评估报告导出成功')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
