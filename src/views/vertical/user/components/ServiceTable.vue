<template>
  <div>
    <a-table
      ref="table"
      size="small"
      :columns="columns"
      :dataSource="dataSource"
      :loading="loading"
      :rowKey="record => record.id || record.name"
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
          <a-popover v-for="(item, index) in text" :key="index" title="可信云技术资源溯源">
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
          <a-tag color="red"><a-icon type="info-circle" /> 未测评</a-tag>
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
      <span slot="action" slot-scope="text, record">
        <a-button type="link" @click="$emit('edit', record)">编辑</a-button>
        <a-button type="link" @click="$emit('use', record)">测试</a-button>
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
    }
  },
  data() {
    return {
      columns: [
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
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '80px',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },
  methods: {
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
