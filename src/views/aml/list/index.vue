<template>
  <div class="aml-list-container">
    <div class="header">
      <h1>跨境支付事中监管系统</h1>
      <div class="user-info">
        <span>金融机构：银联电子</span>
        <span>用户：管理员</span>
        <a-avatar icon="user" />
      </div>
    </div>

    <div class="content-container">
      <a-card title="商户风险查询" :bordered="false">
        <!-- 导航菜单 -->
        <div class="navigation-menu">
          <a-menu mode="horizontal" :selectedKeys="['list']">
            <a-menu-item key="monitor">
              <router-link to="/aml/monitor"> <a-icon type="dashboard" />实时监控 </router-link>
            </a-menu-item>
            <a-menu-item key="list">
              <router-link to="/aml/list"> <a-icon type="table" />商户风险查询 </router-link>
            </a-menu-item>
          </a-menu>
        </div>

        <!-- 查询表单 -->
        <a-form layout="inline" :form="form" @submit="handleSearch" class="search-form">
          <a-row :gutter="16" style="width: 100%">
            <a-col :md="8" :sm="12">
              <a-form-item label="统计日期区间" class="date-range-item">
                <a-range-picker
                  v-decorator="[
                    'dateRange',
                    {
                      rules: [{ required: true, message: '请选择统计日期区间' }],
                      initialValue: [moment().subtract(30, 'days'), moment()]
                    }
                  ]"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item label="商户工商注册名">
                <a-input v-decorator="['merchantName']" placeholder="请输入商户工商注册名" allowClear />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item label="商户状态">
                <a-select v-decorator="['merchantStatus']" placeholder="请选择商户状态" style="width: 100%" allowClear>
                  <a-select-option value="active">正常</a-select-option>
                  <a-select-option value="suspended">暂停服务</a-select-option>
                  <a-select-option value="terminated">已终止</a-select-option>
                  <a-select-option value="review">审核中</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item label="高风险案例个数大于">
                <a-input-number v-decorator="['minHighRiskCases']" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="12" style="display: flex; align-items: flex-end">
              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="loading">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetForm">清空</a-button>
                <a-button style="margin-left: 8px" @click="exportData" :disabled="!tableData.length" icon="download">
                  导出
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <!-- 数据表格 -->
        <a-table
          :columns="columns"
          :dataSource="tableData"
          :rowKey="(record) => record.id"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
          class="merchant-table"
        >
          <template slot="merchantName" slot-scope="text, record">
            <a @click="viewDetails(record.id)">{{ text }}</a>
          </template>
          <template slot="merchantStatus" slot-scope="text">
            <a-tag :color="getStatusColor(text)">{{ getStatusText(text) }}</a-tag>
          </template>
          <template slot="riskCases" slot-scope="text, record">
            <a-tag color="green">{{ record.lowRiskCases }}</a-tag>
            <a-tag color="orange">{{ record.mediumRiskCases }}</a-tag>
            <a-tag color="red">{{ record.highRiskCases }}</a-tag>
          </template>
          <template slot="lastRiskDate" slot-scope="text">
            {{ text ? text : '-' }}
          </template>
          <template slot="action" slot-scope="text, record">
            <a-button type="link" @click="viewDetails(record.id)">详情</a-button>
          </template>
        </a-table>
      </a-card>
    </div>

    <div class="footer">
      <p>跨境支付事中监管系统 &copy; 2023 版权所有</p>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AmlList',
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      // 表格列定义
      columns: [
        {
          title: '商户工商注册名',
          dataIndex: 'merchantName',
          key: 'merchantName',
          scopedSlots: { customRender: 'merchantName' },
          width: '20%'
        },
        {
          title: '商户状态',
          dataIndex: 'merchantStatus',
          key: 'merchantStatus',
          scopedSlots: { customRender: 'merchantStatus' },
          width: '10%'
        },
        {
          title: '统计日期区间',
          dataIndex: 'dateRange',
          key: 'dateRange',
          width: '15%'
        },
        {
          title: '低/中/高风险案例个数',
          key: 'riskCases',
          scopedSlots: { customRender: 'riskCases' },
          width: '15%'
        },
        {
          title: '最后触发风险时间',
          dataIndex: 'lastRiskDate',
          key: 'lastRiskDate',
          scopedSlots: { customRender: 'lastRiskDate' },
          width: '15%'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '10%',
          align: 'center'
        }
      ],
      // 表格数据
      tableData: [],
      // 分页设置
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条记录`
      },
      // 商户状态映射
      statusMap: {
        active: { text: '正常', color: 'green' },
        suspended: { text: '暂停服务', color: 'orange' },
        terminated: { text: '已终止', color: 'red' },
        review: { text: '审核中', color: 'blue' }
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    moment,
    // 加载表格数据
    loadData() {
      this.loading = true

      // 模拟API请求延迟
      setTimeout(() => {
        // 生成模拟数据
        const mockData = this.generateMockData()
        this.tableData = mockData.items
        this.pagination.total = mockData.total

        this.loading = false
      }, 800)
    },

    // 生成模拟数据
    generateMockData() {
      const mockItems = []
      const total = 35

      const merchantNames = [
        '上海诚信贸易有限公司',
        '北京国际电子商务有限公司',
        '广州全球购贸易有限公司',
        '深圳科技进出口有限公司',
        '杭州电商云购有限公司',
        '南京跨境电商有限公司',
        '青岛海外购物有限公司',
        '西安丝路贸易有限公司',
        '成都国际贸易有限公司',
        '武汉电子商务有限公司',
        '天津港贸易有限公司',
        '重庆渝新贸易有限公司'
      ]

      const statuses = ['active', 'suspended', 'terminated', 'review']

      // 创建列表数据
      for (let i = 1; i <= total; i++) {
        const merchantName = merchantNames[i % merchantNames.length]
        const merchantStatus = statuses[Math.floor(Math.random() * statuses.length)]

        // 随机生成风险案例数量
        const lowRiskCases = Math.floor(Math.random() * 20)
        const mediumRiskCases = Math.floor(Math.random() * 10)
        const highRiskCases = Math.floor(Math.random() * 5)

        // 生成最后触发风险的日期
        const lastRiskDate = this.getRandomDate()

        // 计算起始日期和结束日期
        const endDate = moment().format('YYYY-MM-DD')
        const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')

        mockItems.push({
          id: i,
          merchantName: merchantName,
          merchantStatus: merchantStatus,
          dateRange: `${startDate} 至 ${endDate}`,
          lowRiskCases: lowRiskCases,
          mediumRiskCases: mediumRiskCases,
          highRiskCases: highRiskCases,
          lastRiskDate: lastRiskDate,
          totalRiskCases: lowRiskCases + mediumRiskCases + highRiskCases
        })
      }

      return {
        items: mockItems,
        total: total
      }
    },

    // 生成随机日期
    getRandomDate() {
      const now = new Date()
      const pastDate = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      return moment(pastDate).format('YYYY-MM-DD HH:mm:ss')
    },

    // 获取状态颜色
    getStatusColor(status) {
      return this.statusMap[status]?.color || 'default'
    },

    // 获取状态文本
    getStatusText(status) {
      return this.statusMap[status]?.text || status
    },

    // 处理表单查询
    handleSearch(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.pagination.current = 1
          console.log('查询条件:', values)

          // 在实际应用中，这里会将查询条件发送到后端
          // 这里模拟查询过程
          this.loading = true

          setTimeout(() => {
            // 模拟筛选
            let filteredData = this.generateMockData().items

            // 根据表单值过滤数据
            if (values.merchantName) {
              filteredData = filteredData.filter((item) => item.merchantName.includes(values.merchantName))
            }

            if (values.merchantStatus) {
              filteredData = filteredData.filter((item) => item.merchantStatus === values.merchantStatus)
            }

            if (values.minHighRiskCases !== undefined && values.minHighRiskCases !== null) {
              filteredData = filteredData.filter((item) => item.highRiskCases > values.minHighRiskCases)
            }

            // 根据日期范围筛选
            if (values.dateRange && values.dateRange.length === 2) {
              const startDate = values.dateRange[0].format('YYYY-MM-DD')
              const endDate = values.dateRange[1].format('YYYY-MM-DD')

              // 在实际应用中，日期筛选通常由后端完成
              // 这里仅更新显示的日期范围
              filteredData.forEach((item) => {
                item.dateRange = `${startDate} 至 ${endDate}`
              })
            }

            this.tableData = filteredData
            this.pagination.total = filteredData.length
            this.loading = false
          }, 800)
        }
      })
    },

    // 重置表单
    resetForm() {
      this.form.resetFields()
    },

    // 导出数据
    exportData() {
      this.$message.success('数据导出成功！（模拟）')
    },

    // 查看详情
    viewDetails(id) {
      this.$router.push(`/aml/detail/${id}`)
    },

    // 处理表格变化（分页、排序等）
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.loadData()
    }
  }
}
</script>

<style lang="less" scoped>
.aml-list-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;

  .header {
    background-color: #1e3799;
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

    h1 {
      margin: 0;
      font-size: 22px;
      color: white;
    }

    .user-info {
      display: flex;
      align-items: center;

      span {
        margin-right: 15px;
        color: white;
      }
    }
  }

  .content-container {
    flex: 1;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .footer {
    text-align: center;
    padding: 15px;
    color: #777;
    font-size: 12px;
    margin-top: 20px;
    border-top: 1px solid #eee;
    background-color: white;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .date-range-item {
    width: 100%;
  }

  .merchant-table {
    margin-top: 16px;
  }

  .navigation-menu {
    margin-bottom: 20px;

    /deep/ .ant-menu-horizontal {
      line-height: 46px;
      border-bottom: 1px solid #e8e8e8;
      background-color: white;

      .ant-menu-item {
        font-size: 14px;

        a {
          color: #595959;
        }

        i {
          margin-right: 5px;
        }
      }

      .ant-menu-item-selected {
        a {
          color: #1890ff;
        }
      }
    }
  }
}
</style>
