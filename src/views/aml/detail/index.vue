<template>
  <div class="aml-detail-container">
    <div class="header">
      <h1>跨境贸易支付监管系统</h1>
      <div class="user-info">
        <a-button style="margin-right: 15px" ghost type="dashed" icon="form" @click="handleGoCustomize">继续定制</a-button>
        <span>金融机构：银联电子</span>
        <span>用户：管理员</span>
        <a-avatar icon="user" />
      </div>
    </div>

    <div class="content-container">
      <div class="page-header">
        <a-page-header title="商户风险详情" :backIcon="true" @back="goBack" />
      </div>

      <!-- 导航菜单 -->
      <div class="navigation-menu">
        <a-menu mode="horizontal" :selectedKeys="[]">
          <a-menu-item key="monitor">
            <router-link to="/aml/monitor"> <a-icon type="dashboard" />实时监控 </router-link>
          </a-menu-item>
          <a-menu-item key="list">
            <router-link to="/aml/list"> <a-icon type="table" />商户风险查询 </router-link>
          </a-menu-item>
        </a-menu>
      </div>

      <!-- 商户基本信息卡片 -->
      <a-card title="商户基本信息" :bordered="false" class="detail-card">
        <div class="merchant-basic-info">
          <div class="info-section">
            <div class="info-item">
              <span class="label">商户工商注册名：</span>
              <span class="value">{{ merchantInfo.merchantName }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户编码：</span>
              <span
                class="value sensitive-data"
                :class="{ masked: !showMerchantCode }"
                @dblclick="toggleVisibility('merchantCode')"
              >
                {{ showMerchantCode ? merchantInfo.merchantCode : maskData(merchantInfo.merchantCode) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">营业地区：</span>
              <span class="value">{{ merchantInfo.region }}</span>
            </div>
          </div>

          <div class="info-section">
            <div class="info-item">
              <span class="label">业务联系人：</span>
              <span class="value">{{ merchantInfo.contactName }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value sensitive-data" :class="{ masked: !showPhone }" @dblclick="toggleVisibility('phone')">
                {{ showPhone ? merchantInfo.contactPhone : maskData(merchantInfo.contactPhone) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">归属客户经理：</span>
              <span class="value">{{ merchantInfo.accountManager }}</span>
            </div>
          </div>
        </div>
        <div class="hint-text"><a-icon type="info-circle" /> 提示：敏感数据已脱敏展示，双击可查看明文</div>
      </a-card>

      <!-- 风险案例订单明细卡片 -->
      <a-card title="风险案例订单明细" :bordered="false" class="detail-card" :extra="extraContent">
        <a-table
          :columns="columns"
          :dataSource="riskCaseData"
          :rowKey="(record) => record.orderId"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
        >
          <template slot="merchantCode" slot-scope="text">
            {{ text }}
          </template>
          <template slot="orderAmount" slot-scope="text">
            <span style="color: #1890ff; font-weight: 500">{{ text }}</span>
          </template>
          <template slot="orderStatus" slot-scope="text">
            <a-tag :color="getStatusColor(text)">{{ text }}</a-tag>
          </template>
          <template slot="riskLevel" slot-scope="text">
            <a-tag :color="getRiskLevelColor(text)">{{ text }}</a-tag>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 导出风险案例明细弹窗 -->
    <a-modal
      v-model="exportModalVisible"
      title="导出风险案例明细"
      @ok="handleExport"
      okText="确定导出"
      cancelText="取消"
    >
      <a-form :form="form" layout="vertical">
        <a-form-item label="风险等级">
          <a-select
            v-decorator="['riskLevel', { rules: [{ required: true, message: '请选择风险等级' }] }]"
            placeholder="请选择风险等级"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="高风险">高风险</a-select-option>
            <a-select-option value="中风险">中风险</a-select-option>
            <a-select-option value="低风险">低风险</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="触发时间日期范围">
          <a-range-picker
            v-decorator="[
              'dateRange',
              {
                rules: [{ required: true, message: '请选择日期范围' }],
                initialValue: [moment().subtract(30, 'days'), moment()]
              }
            ]"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <div class="footer">
      <p>跨境贸易支付监管系统 &copy; 2023 版权所有</p>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AmlDetail',
  data() {
    return {
      // 商户基本信息
      merchantInfo: {
        merchantName: '',
        merchantCode: '',
        region: '',
        contactName: '',
        contactPhone: '',
        accountManager: ''
      },
      // 风险案例订单数据
      riskCaseData: [],
      // 脱敏控制
      showMerchantCode: false,
      showPhone: false,
      // 表格加载状态
      loading: false,
      // 表格分页设置
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条记录`
      },
      // 导出模态框
      exportModalVisible: false,
      form: this.$form.createForm(this),
      // 订单详情表格列定义
      columns: [
        {
          title: '商户号',
          dataIndex: 'merchantCode',
          key: 'merchantCode',
          scopedSlots: { customRender: 'merchantCode' },
          width: '12%'
        },
        {
          title: '控台显示名',
          dataIndex: 'merchantDisplayName',
          key: 'merchantDisplayName',
          width: '15%'
        },
        {
          title: '订单号',
          dataIndex: 'orderId',
          key: 'orderId',
          width: '15%'
        },
        {
          title: '交易时间',
          dataIndex: 'transactionTime',
          key: 'transactionTime',
          width: '15%'
        },
        {
          title: '交易金额',
          dataIndex: 'orderAmount',
          key: 'orderAmount',
          scopedSlots: { customRender: 'orderAmount' },
          width: '10%'
        },
        {
          title: '交易状态',
          dataIndex: 'orderStatus',
          key: 'orderStatus',
          scopedSlots: { customRender: 'orderStatus' },
          width: '8%'
        },
        {
          title: '交易IP所属区域',
          dataIndex: 'ipRegion',
          key: 'ipRegion',
          width: '12%'
        },
        {
          title: '风险等级',
          dataIndex: 'riskLevel',
          key: 'riskLevel',
          scopedSlots: { customRender: 'riskLevel' },
          width: '8%'
        },
        {
          title: '触发风险类型',
          dataIndex: 'riskType',
          key: 'riskType',
          width: '15%'
        }
      ]
    }
  },
  computed: {
    // 额外操作按钮
    extraContent() {
      return (
        <a-button type="primary" onClick={this.showExportModal} icon="download">
          导出案例明细
        </a-button>
      )
    }
  },
  mounted() {
    // 获取路由参数中的商户ID
    const merchantId = this.$route.params.id

    // 加载商户基本信息
    this.loadMerchantInfo(merchantId)

    // 加载风险案例订单数据
    this.loadRiskCaseData(merchantId)
  },
  methods: {
    moment,
    // 返回列表页
    goBack() {
      this.$router.push('/aml/list')
    },

    // 加载商户基本信息（模拟数据）
    loadMerchantInfo(merchantId) {
      // 模拟数据加载
      setTimeout(() => {
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

        const regions = [
          '上海市',
          '北京市',
          '广州市',
          '深圳市',
          '杭州市',
          '南京市',
          '青岛市',
          '西安市',
          '成都市',
          '武汉市',
          '天津市',
          '重庆市'
        ]

        // 使用商户ID模拟数据
        const index = (merchantId - 1) % merchantNames.length

        this.merchantInfo = {
          merchantName: merchantNames[index],
          merchantCode: `MERCH${100000 + parseInt(merchantId)}`,
          region: regions[index],
          contactName: `联系人${index + 1}`,
          contactPhone: `1391234${('0000' + (5678 + parseInt(merchantId))).slice(-4)}`,
          accountManager: `客户经理${(parseInt(merchantId) % 5) + 1}`
        }
      }, 300)
    },

    // 加载风险案例订单数据（模拟数据）
    loadRiskCaseData(merchantId) {
      this.loading = true

      // 模拟API请求延迟
      setTimeout(() => {
        const mockData = this.generateMockRiskCaseData(merchantId)
        this.riskCaseData = mockData.items
        this.pagination.total = mockData.total

        this.loading = false
      }, 800)
    },

    // 生成模拟风险案例订单数据
    generateMockRiskCaseData(merchantId) {
      const mockItems = []
      // 随机生成15-30条记录
      const total = 15 + Math.floor(Math.random() * 15)

      const riskTypes = [
        '多笔大额交易',
        '短时间内频繁交易',
        '可疑跨境流水',
        '高风险地区交易',
        '异常终端设备',
        '可疑IP访问',
        '资金频繁进出',
        '交易模式异常',
        '可疑商户行为',
        '交易信息不完整'
      ]

      const orderStatuses = ['成功', '失败', '处理中', '已退款']
      const ipRegions = ['中国大陆', '香港', '美国', '欧洲', '东南亚', '日韩', '其他地区']
      // eslint-disable-next-line no-unused-vars
      const riskLevels = ['高风险', '中风险', '低风险']

      const displayNames = ['官方商城', '国际贸易', '全球购', '跨境电商', '支付通道', '在线商店', '海外购', '易购商户']

      // 确保商户号与ID一致
      const merchantCode = `MERCH${100000 + parseInt(merchantId)}`

      // 创建列表数据，按触发时间倒序排序
      for (let i = 1; i <= total; i++) {
        // 生成近期随机日期，确保倒序排列
        const daysAgo = i % 30
        const transactionTime = moment()
          .subtract(daysAgo, 'days')
          .subtract(Math.floor(Math.random() * 24), 'hours')
          .subtract(Math.floor(Math.random() * 60), 'minutes')
          .format('YYYY-MM-DD HH:mm:ss')

        // 随机选择风险等级，使高风险较少，低风险较多
        let riskLevel
        const rand = Math.random()
        if (rand < 0.15) {
          riskLevel = '高风险'
        } else if (rand < 0.45) {
          riskLevel = '中风险'
        } else {
          riskLevel = '低风险'
        }

        mockItems.push({
          merchantCode: merchantCode,
          merchantDisplayName: `${displayNames[i % displayNames.length]}${i}`,
          orderId: `ORD${moment().format('YYYYMMDD')}${100000 + i}`,
          transactionTime: transactionTime,
          orderAmount: `$${(1000 + Math.floor(Math.random() * 9000)).toLocaleString()}.00`,
          orderStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          ipRegion: ipRegions[Math.floor(Math.random() * ipRegions.length)],
          riskLevel: riskLevel,
          riskType: riskTypes[Math.floor(Math.random() * riskTypes.length)]
        })
      }

      // 按交易时间倒序排序
      mockItems.sort((a, b) => {
        return moment(b.transactionTime).valueOf() - moment(a.transactionTime).valueOf()
      })

      return {
        items: mockItems,
        total: total
      }
    },

    // 处理表格分页、排序等变化
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize

      // 实际应用中，这里需要重新加载数据
      // 模拟示例中我们只更新分页参数
    },

    // 切换敏感数据显示状态
    toggleVisibility(field) {
      if (field === 'merchantCode') {
        this.showMerchantCode = !this.showMerchantCode
      } else if (field === 'phone') {
        this.showPhone = !this.showPhone
      }
    },

    // 对敏感数据进行脱敏处理
    maskData(data) {
      if (!data) return ''

      // 对不同类型的数据进行不同的脱敏处理
      if (data.startsWith('MERCH')) {
        // 商户编码脱敏：显示前两位和后两位
        return data.substring(0, 2) + '****' + data.substring(data.length - 2)
      } else if (data.startsWith('1')) {
        // 手机号脱敏：显示前三位和后四位
        return data.substring(0, 3) + '*****' + data.substring(data.length - 4)
      }

      // 默认脱敏方式
      if (data.length <= 4) {
        return '****'
      } else {
        return data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2)
      }
    },

    // 获取交易状态颜色
    getStatusColor(status) {
      const statusColors = {
        成功: 'green',
        失败: 'red',
        处理中: 'blue',
        已退款: 'orange'
      }
      return statusColors[status] || 'default'
    },

    // 获取风险等级颜色
    getRiskLevelColor(level) {
      const levelColors = {
        高风险: 'red',
        中风险: 'orange',
        低风险: 'green'
      }
      return levelColors[level] || 'default'
    },

    // 显示导出对话框
    showExportModal() {
      this.exportModalVisible = true
      this.form.resetFields()
      // 设置默认值
      this.form.setFieldsValue({
        riskLevel: 'all',
        dateRange: [moment().subtract(30, 'days'), moment()]
      })
    },

    // 处理导出请求
    handleExport() {
      this.form.validateFields((err, values) => {
        if (!err) {
          // 在实际应用中，这里应该调用导出API
          // 这里只是模拟导出成功的消息

          const riskLevel = values.riskLevel === 'all' ? '全部' : values.riskLevel
          const startDate = values.dateRange[0].format('YYYY-MM-DD')
          const endDate = values.dateRange[1].format('YYYY-MM-DD')

          this.$message.success(`导出成功！已导出${riskLevel}风险案例，日期范围: ${startDate} 至 ${endDate}`)

          this.exportModalVisible = false
        }
      })
    },

    handleGoCustomize() {
      this.$router.push('/application/aml')
    }
  }
}
</script>

<style lang="less" scoped>
.aml-detail-container {
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

  .page-header {
    margin-bottom: 16px;
  }

  .detail-card {
    margin-bottom: 16px;
  }

  .merchant-basic-info {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 16px;

    .info-section {
      flex: 1;
      min-width: 300px;
      margin-bottom: 8px;
    }

    .info-item {
      margin-bottom: 16px;
      display: flex;

      .label {
        color: #666;
        width: 120px;
        text-align: right;
        margin-right: 8px;
      }

      .value {
        flex: 1;
        font-weight: 500;
      }

      .sensitive-data {
        cursor: pointer;
        transition: all 0.3s;

        &.masked {
          color: #1890ff;

          &:hover {
            background-color: rgba(24, 144, 255, 0.1);
          }
        }
      }
    }
  }

  .hint-text {
    color: #999;
    font-size: 12px;
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

  .navigation-menu {
    margin-bottom: 16px;

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
