<template>
  <div>
    <a-table
      ref="table"
      size="small"
      :columns="columns"
      :dataSource="dataSource"
      :loading="loading"
      :pagination="pagination"
      :rowKey="record => record.id || record.name"
      @change="handleTableChange"
    >
      <span slot="serial" slot-scope="text, record, index">
        {{ index + 1 }}
      </span>
      <template slot="statusTitle">
        资源状态
        <a-popover title="资源状态说明">
          <a-icon type="question-circle-o" style="margin-left: 8px; cursor: pointer" />
          <template slot="content">
            <status-popover-content :statusDict="statusDict" :statusStyleDict="statusStyleDict" />
          </template>
        </a-popover>
      </template>
      <template slot="name" slot-scope="text, record">
        <a-button type="link" size="large" @click="$emit('edit', record)">{{ text }}</a-button>
      </template>
      <template slot="status" slot-scope="text">
        <a-popover title="当前部署进度">
          <template slot="content">
            <status-popover-content :statusDict="statusDict" :statusStyleDict="statusStyleDict" :current-status-text="statusFilter(text)" :current-status-style="statusStyleFilter(text)" />
          </template>
          <a-badge :status="statusStyleFilter(text)" :text="statusFilter(text)" />
        </a-popover>
      </template>
      <span slot="norm" slot-scope="text">
        <template v-if="text && text.length">
          <a-popover v-for="(item, index) in text" :key="index" title="技术评测结果">
            <template slot="content">
              <p>{{ normFilter(item.key) }}</p>
              <p><el-rate :value="item.score" disabled show-score text-color="#ff9900" /></p>
              <p v-if="item.platformChecked === 1"><a-icon theme="twoTone" twoToneColor="#52c41a" type="check-circle" /> 平台已测评</p>
              <p v-else><a-icon theme="twoTone" twoToneColor="orange" type="info-circle" /> 平台未测评</p>
            </template>
            <a-tag :color="item.platformChecked === 1 ? 'green' : 'orange'" style="margin-bottom: 5px;">
              <a-icon type="check-circle" /> {{ normFilter(item.key) }}
            </a-tag>
          </a-popover>
        </template>
        <template v-else>
          <a-popover title="技术评测结果">
            <template slot="content">
              <span><a-icon theme="twoTone" twoToneColor="red" type="info-circle" /> 未进行任何测评</span>
            </template>
            <a-tag color="red"><a-icon type="info-circle" /> 未测评</a-tag>
          </a-popover>
        </template>
      </span>
      <span slot="source" slot-scope="text">
        <template v-if="text">
          <a-popover :title="text.popoverTitle || '资源溯源'">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
              <p>综合可信度：</p>
              <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
              <h1>资源信息</h1>
              <p><strong>资源描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
              <p>综合可信度：
                <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
              </p>
            </template>
            <a-tag color="blue" style="margin-bottom: 5px;">知识产权</a-tag>
          </a-popover>
          <a-popover :title="text.popoverTitle || '资源溯源'">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
              <p>综合可信度：</p>
              <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
              <h1>资源信息</h1>
              <p><strong>资源描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
              <p>综合可信度：
                <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
              </p>
            </template>
            <a-tag color="cyan" style="margin-bottom: 5px;">应用案例</a-tag>
          </a-popover>
          <a-popover :title="text.popoverTitle || '资源溯源'">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
              <p>综合可信度：</p>
              <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
              <h1>资源信息</h1>
              <p><strong>资源描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
              <p>综合可信度：
                <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
              </p>
            </template>
            <a-tag color="purple" style="margin-bottom: 5px;">舆情信息</a-tag>
          </a-popover>
          <a-popover :title="text.popoverTitle || '资源溯源'">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
              <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
              <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
              <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
              <p>综合可信度：</p>
              <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
              <h1>资源信息</h1>
              <p><strong>资源描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
              <p>综合可信度：
                <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
              </p>
            </template>
            <a-tag color="pink" style="margin-bottom: 5px;">链上存证</a-tag>
          </a-popover>
        </template>
        <template v-else>
          <a-tag>无溯源数据</a-tag>
        </template>
      </span>
      <span v-if="!mode || mode === 'default'" slot="saleInfo" slot-scope="text, record">
        <div style="text-align: center; padding-left: 20px;">
          <template v-if="record.isForSale === true || record.isForSale === 'true' || record.isForSale === 1 || record.isForSale === '1'">
            <div>
              <a-tag color="green">可售</a-tag>
            </div>
            <div style="margin-top: 4px;">
              <span style="color: #f5222d; font-weight: 600;">¥{{ (record.salePrice || 0).toFixed(2) }}</span>
            </div>
            <div v-if="record.saleDescription" style="margin-top: 4px;">
              <a-popover title="销售说明" trigger="hover">
                <template slot="content">
                  <p>{{ record.saleDescription }}</p>
                </template>
                <a-tag color="blue" style="margin-left: 10px;">销售说明</a-tag>
              </a-popover>
            </div>
          </template>
          <template v-else>
            <a-tag>不可售</a-tag>
          </template>
        </div>
      </span>
      <span v-if="mode === 'achievement'" slot="upgradeAdvice" slot-scope="text, record">
        <template v-if="upgradeAdviceLoadingId === record.id">
          <a-spin size="small" />
        </template>
        <template v-else-if="record.upgradeAdvice">
          <a-button type="link" size="small" @click="$emit('upgrade-advice', record, 'view')">查看建议</a-button>
          <a-button type="link" size="small" @click="$emit('upgrade-advice', record, 'refresh')">刷新</a-button>
        </template>
        <template v-else>
          <a-button type="link" size="small" @click="$emit('upgrade-advice', record, 'generate')">生成建议</a-button>
        </template>
      </span>
      <span v-if="mode === 'achievement'" slot="updateStrategy" slot-scope="text, record">
        <template v-if="record.updateStrategy">
          <div>
            <a-icon type="sync" :spin="record.updateStrategy.autoTestEnabled" style="color: #1890ff" />
            <span style="margin-left: 4px;">
              {{ record.updateStrategy.autoTestEnabled ? `自动测试 ${record.updateStrategy.autoTestPeriod}天` : '自动测试：关闭' }}
            </span>
          </div>
          <div style="margin-top: 4px;">
            <a-icon type="edit" style="color: #52c41a" />
            <span style="margin-left: 4px;">
              {{ record.updateStrategy.updateStrategyType === 'manual' ? '手动更新' :
                 record.updateStrategy.updateStrategyType === 'auto' ? '自动更新' :
                 record.updateStrategy.updateStrategyType === 'scheduled' ? '定时更新' : '手动更新' }}
            </span>
          </div>
        </template>
        <template v-else>
          <span>未配置</span>
        </template>
        <a-button type="link" size="small" @click="$emit('update-strategy', record)" style="margin-left: 8px">
          配置
        </a-button>
      </span>
      <span v-if="mode === 'purchased'" slot="purchaseInfo">
        <div>
          <a-icon type="shopping-cart" style="color: #52c41a" />
          <span style="margin-left: 4px;">已购买</span>
        </div>
      </span>
      <span v-if="mode === 'interested'" slot="interestInfo">
        <div>
          <a-icon type="heart" style="color: #f5222d" />
          <span style="margin-left: 4px;">已关注</span>
        </div>
      </span>
      <span v-if="mode === 'achievement'" slot="saleStatus" slot-scope="text, record">
        <template v-if="record.isForSale">
          <a-tag color="green" style="margin-left: 8px;">已发布</a-tag>
          <div style="margin-top: 4px;">
            <span style="color: #f5222d;">¥{{ (record.salePrice || 0).toFixed(2) }}</span>
          </div>
          <a-button type="link" size="small" @click="$emit('publish-sale', record)">修改</a-button>
        </template>
        <template v-else>
          <a-button type="link" size="small" @click="$emit('publish-sale', record)">发布销售</a-button>
        </template>
      </span>
      <span slot="action" slot-scope="text, record">
        <template v-if="mode === 'achievement'">
          <a-button type="link" @click="$emit('edit', record)">编辑</a-button>
          <a-button v-if="record.type === 'meta'" type="link" @click="$emit('use', record)">试用</a-button>
          <a-button v-else-if="record.type === 'generated_algorithm'" type="link" @click="$emit('use', record)">下载</a-button>
          <a-button v-else type="link" @click="$emit('use', record)">测试</a-button>
        </template>
        <template v-else-if="mode === 'purchased'">
          <a-button type="link" @click="$emit('use-service', record)">使用服务</a-button>
        </template>
        <template v-else-if="mode === 'interested'">
          <a-button type="link" @click="$emit('contact-purchase', record)">联系购买</a-button>
        </template>
        <template v-else>
          <a-button type="link" @click="$emit('edit', record)">查看</a-button>
          <a-button type="link" @click="$emit('add-interested', record)">感兴趣</a-button>
          <a-button v-if="record.isForSale" type="link" @click="$emit('purchase', record)">购买</a-button>
        </template>
      </span>
    </a-table>
  </div>
</template>

<script>
import StatusPopoverContent from './StatusPopoverContent.vue'

export default {
  name: 'ServiceTable',
  components: {
    StatusPopoverContent
  },
  props: {
    dataSource: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    statusDict: {
      type: Array,
      default: () => []
    },
    statusStyleDict: {
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
    mode: {
      type: String,
      default: 'resource'
    },
    upgradeAdviceLoadingId: {
      type: String,
      default: ''
    },
    pagination: {
      type: [Object, Boolean],
      default: false
    }
  },
  computed: {
    columns() {
      const baseColumns = [
        {
          title: '#',
          width: '80px',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '资源名称',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
          customHeaderCell: () => ({ style: { paddingLeft: '25px' } })
        },
        {
          title: '资源类型',
          dataIndex: 'type',
          width: '120px',
          customRender: (text) => {
            const typeItem = this.typeArr.find(item => item.code === text)
            return typeItem ? typeItem.text : '未知类型'
          }
        },
        {
          title: '技术类型',
          dataIndex: 'technology',
          customRender: (text) => {
            const techItem = this.technologyArr.find(item => item.code === text)
            return techItem ? techItem.text : '未知技术'
          }
        },
        {
          slots: { title: 'statusTitle' },
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center'
        },
        {
          title: '技术指标',
          dataIndex: 'norm',
          width: '90px',
          scopedSlots: { customRender: 'norm' }
        },
        {
          title: '调用次数',
          dataIndex: 'number',
          customRender: (text) => (text || 0) + ' 次'
        },
        {
          title: '服务溯源',
          dataIndex: 'source',
          width: '90px',
          scopedSlots: { customRender: 'source' }
        }
      ]

      // 垮域算法模型组件列表添加销售信息列
      if (!this.mode || this.mode === 'default') {
        baseColumns.push({
          title: '销售信息',
          dataIndex: 'saleInfo',
          width: '150px',
          align: 'center',
          scopedSlots: { customRender: 'saleInfo' }
        })
      }

      if (this.mode === 'achievement') {
        baseColumns.push({
          title: '升级建议',
          dataIndex: 'upgradeAdvice',
          width: '120px',
          scopedSlots: { customRender: 'upgradeAdvice' }
        })
        baseColumns.push({
          title: '更新策略',
          dataIndex: 'updateStrategy',
          width: '150px',
          scopedSlots: { customRender: 'updateStrategy' }
        })
        baseColumns.push({
          title: '对外销售',
          dataIndex: 'saleStatus',
          width: '120px',
          align: 'center',
          scopedSlots: { customRender: 'saleStatus' }
        })
      }

      if (this.mode === 'purchased') {
        baseColumns.push({
          title: '购买信息',
          dataIndex: 'purchaseInfo',
          width: '120px',
          scopedSlots: { customRender: 'purchaseInfo' }
        })
      }

      if (this.mode === 'interested') {
        baseColumns.push({
          title: '关注信息',
          dataIndex: 'interestInfo',
          width: '120px',
          scopedSlots: { customRender: 'interestInfo' }
        })
      }

      baseColumns.push({
        title: '操作',
        dataIndex: 'action',
        width: this.mode === 'achievement' ? '150px' : '120px',
        align: 'center',
        scopedSlots: { customRender: 'action' }
      })

      return baseColumns
    }
  },
  methods: {
    handleTableChange(pagination) {
      this.$emit('table-change', pagination)
    },
    statusFilter(type) {
      if (type === undefined) {
        return '未知状态'
      }
      if (!this.statusDict || !Array.isArray(this.statusDict)) {
        return '未知状态'
      }
      const statusItem = this.statusDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : '未知状态'
    },
    statusStyleFilter(type) {
      if (type === undefined) {
        return 'default'
      }
      if (!this.statusStyleDict || !Array.isArray(this.statusStyleDict)) {
        return 'default'
      }
      const statusItem = this.statusStyleDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : 'default'
    },
    normFilter(type) {
      if (type === undefined) {
        return '未知指标'
      }
      if (!this.normDict || !Array.isArray(this.normDict)) {
        return '未知指标'
      }
      const normItem = this.normDict.find(item => item && item.code === type)
      return normItem ? normItem.text : '未知指标'
    }
  }
}
</script>
