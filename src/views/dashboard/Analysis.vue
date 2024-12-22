<template>
  <div>
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="原子微服务数量(个)" total="1,260">
          <a-tooltip title="当前系统总发布原子微服务资源数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="up" style="margin-right: 16px;">
              <span slot="term">{{ $t('dashboard.analysis.week') }}</span>
              2%
            </trend>
            <trend flag="down">
              <span slot="term">{{ $t('dashboard.analysis.day') }}</span>
              1%
            </trend>
          </div>
          <template slot="footer">
            <a :disabled="username !== 'publisher'" href="./#/ms/manage" target="_parent" style="margin-right: 12px">查看所有</a>
          </template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="元应用构建数量" :total="846 | NumberFormat">
          <a-tooltip title="当前系统构建的元应用总数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="up" style="margin-right: 16px;">
              <span slot="term">{{ $t('dashboard.analysis.week') }}</span>
              12%
            </trend>
            <trend flag="down">
              <span slot="term">{{ $t('dashboard.analysis.day') }}</span>
              11%
            </trend>
          </div>
          <template slot="footer">
            <a :disabled="username !== 'publisher'" href="./#/ms/manage" target="_parent" style="margin-right: 12px">查看所有</a>
          </template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="元应用验证数量" :total="6560 | NumberFormat">
          <a-tooltip :title="$t('dashboard.analysis.introduce')" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-bar />
          </div>
          <template slot="footer">日均访问 <span>656</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="元应用验证通过率" total="78%">
          <a-tooltip :title="$t('dashboard.analysis.introduce')" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-progress color="rgb(19, 194, 194)" :target="80" :percentage="78" height="8px" />
          </div>
          <template slot="footer">
            <span slot="term">测试通过数量 1,080个</span>
          </template>
        </chart-card>
      </a-col>
    </a-row>

    <a-card :loading="loading" :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
          <div class="extra-wrapper" slot="tabBarExtraContent">
            <div class="extra-item">
              <a-button type="link" @click="handleDateChange('day')">{{ $t('dashboard.analysis.all-day') }}</a-button>
              <a-button type="link" @click="handleDateChange('week')">{{ $t('dashboard.analysis.all-week') }}</a-button>
              <a-button type="link" @click="handleDateChange('month')">{{ $t('dashboard.analysis.all-month') }}</a-button>
              <a-button type="link" @click="handleDateChange('year')">{{ $t('dashboard.analysis.all-year') }}</a-button>
            </div>
            <a-range-picker :style="{width: '256px'}" :value="dateRange" @change="handleRangePickerChange" />
          </div>
          <a-tab-pane loading="true" tab="微服务发布趋势" key="1">
            <a-row>
              <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar :data="barData" title="微服务发布趋势" />
              </a-col>
              <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="微服务发布排行" :list="serviceRank"/>
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane tab="元应用构建趋势" key="2">
            <a-row>
              <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar :data="barData2" title="元应用构建趋势" />
              </a-col>
              <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="元应用排行" :list="metaAppRank"/>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>

    <div class="antd-pro-pages-dashboard-analysis-twoColLayout" :class="!isMobile && 'desktop'">
      <a-row :gutter="24" type="flex" :style="{ marginTop: '24px' }">
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card :loading="loading" :bordered="false" title="微服务使用排名" :style="{ height: '100%' }">
            <a-dropdown :trigger="['click']" placement="bottomLeft" slot="extra">
              <a class="ant-dropdown-link" href="#">
                <a-icon type="ellipsis" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a href="javascript:;">{{ $t('dashboard.analysis.dropdown-option-one') }}</a>
                </a-menu-item>
                <a-menu-item>
                  <a href="javascript:;">{{ $t('dashboard.analysis.dropdown-option-two') }}</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
            <a-row :gutter="68">
              <a-col :xs="24" :sm="12" :style="{ marginBottom: ' 24px'}">
                <number-info :total="12321" :sub-total="17.1">
                  <span slot="subtitle">
                    <span>微服务日平均用户数</span>
                    <a-tooltip :title="$t('dashboard.analysis.introduce')" slot="action">
                      <a-icon type="info-circle-o" :style="{ marginLeft: '8px' }" />
                    </a-tooltip>
                  </span>
                </number-info>
                <!-- miniChart -->
                <div>
                  <mini-smooth-area :style="{ height: '45px' }" :dataSource="searchUserData" :scale="searchUserScale" />
                </div>
              </a-col>
              <a-col :xs="24" :sm="12" :style="{ marginBottom: ' 24px'}">
                <number-info :total="2.7" :sub-total="26.2" status="down">
                  <span slot="subtitle">
                    <span>元应用用户数</span>
                    <a-tooltip :title="$t('dashboard.analysis.introduce')" slot="action">
                      <a-icon type="info-circle-o" :style="{ marginLeft: '8px' }" />
                    </a-tooltip>
                  </span>
                </number-info>
                <!-- miniChart -->
                <div>
                  <mini-smooth-area :style="{ height: '45px' }" :dataSource="searchUserData" :scale="searchUserScale" />
                </div>
              </a-col>
            </a-row>
            <div class="ant-table-wrapper">
              <a-table
                row-key="index"
                size="small"
                :columns="searchTableColumns"
                :dataSource="searchData"
                :pagination="{ pageSize: 5 }"
              >
                <span slot="range" slot-scope="text, record">
                  <trend :flag="record.status === 0 ? 'up' : 'down'">
                    {{ text }}%
                  </trend>
                </span>
              </a-table>
            </div>
          </a-card>
        </a-col>
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card class="antd-pro-pages-dashboard-analysis-salesCard" :loading="loading" :bordered="false" title="微服务分类占比" :style="{ height: '100%' }">
            <div slot="extra" style="height: inherit;">
              <!-- style="bottom: 12px;display: inline-block;" -->
              <span class="dashboard-analysis-iconGroup">
                <a-dropdown :trigger="['click']" placement="bottomLeft">
                  <a-icon type="ellipsis" class="ant-dropdown-link" />
                  <a-menu slot="overlay">
                    <a-menu-item>
                      <a href="javascript:;">{{ $t('dashboard.analysis.dropdown-option-one') }}</a>
                    </a-menu-item>
                    <a-menu-item>
                      <a href="javascript:;">{{ $t('dashboard.analysis.dropdown-option-two') }}</a>
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </span>
            </div>
            <h4></h4>
            <div>
              <!-- style="width: calc(100% - 240px);" -->
              <div>
                <v-chart :force-fit="true" :height="405" :data="pieData" :scale="pieScale">
                  <v-tooltip :showTitle="false" dataKey="item*percent" />
                  <v-axis />
                  <!-- position="right" :offsetX="-140" -->
                  <v-legend dataKey="item"/>
                  <v-pie position="percent" color="item" :vStyle="pieStyle" />
                  <v-coord type="theta" :radius="0.75" :innerRadius="0.6" />
                </v-chart>
              </div>

            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import {
  ChartCard,
  MiniArea,
  MiniBar,
  MiniProgress,
  RankList,
  Bar,
  Trend,
  NumberInfo,
  MiniSmoothArea
} from '@/components'
import { baseMixin } from '@/store/app-mixin'
import {
  getBarData,
  getMetaAppRank, getPieData,
  getSearchData,
  getSearchUserData,
  getSearchUserScale,
  getServiceRank, getSourceData
} from '@/mock/data/analysis_data'

export default {
  name: 'Analysis',
  mixins: [baseMixin],
  components: {
    ChartCard,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar,
    Trend,
    NumberInfo,
    MiniSmoothArea
  },
  data () {
    return {
      loading: true,
      username: '',
      serviceRank: getServiceRank(),
      metaAppRank: getMetaAppRank(),
      dateRange: [],
      // 搜索用户数
      searchUserData: getSearchUserData(),
      searchUserScale: getSearchUserScale(),
      searchData: getSearchData(),
      barData: getBarData(),
      barData2: getBarData(),
      //
      pieScale: [{
        dataKey: 'percent',
        min: 0,
        formatter: '.0%'
      }],
      pieData: getPieData(),
      sourceData: getSourceData(),
      pieStyle: {
        stroke: '#fff',
        lineWidth: 1
      }
    }
  },
  computed: {
    searchTableColumns () {
      return [
        {
          dataIndex: 'index',
          title: this.$t('dashboard.analysis.table.rank'),
          width: 90
        },
        {
          dataIndex: 'keyword',
          title: '服务名称'
        },
        {
          dataIndex: 'count',
          title: this.$t('dashboard.analysis.table.users')
        },
        {
          dataIndex: 'range',
          title: this.$t('dashboard.analysis.table.weekly-range'),
          align: 'right',
          sorter: (a, b) => a.range - b.range,
          scopedSlots: { customRender: 'range' }
        }
      ]
    }
  },
  created () {
    this.username = localStorage.getItem('username')
    console.log(this.username)
    setTimeout(() => {
      this.loading = !this.loading
    }, 1000)
  },
  methods: {
    handleDateChange(type) {
      let start, end

      switch (type) {
        case 'day':
          start = moment().startOf('day')
          end = moment().endOf('day')
          break
        case 'week':
          start = moment().startOf('week')
          end = moment().endOf('week')
          break
        case 'month':
          start = moment().startOf('month')
          end = moment().endOf('month')
          break
        case 'year':
          start = moment().startOf('year')
          end = moment().endOf('year')
          break
        default:
          start = moment().startOf('day')
          end = moment().endOf('day')
      }
      this.dateRange = [start, end]
    },
    handleRangePickerChange(dates) {
      this.dateRange = dates
    }
  }
}
</script>

<style lang="less" scoped>
  .extra-wrapper {
    line-height: 55px;
    padding-right: 24px;

    .extra-item {
      display: inline-block;
      margin-right: 24px;

      a {
        margin-left: 24px;
      }
    }
  }

  .antd-pro-pages-dashboard-analysis-twoColLayout {
    position: relative;
    flex-flow: row wrap;
  }

  .antd-pro-pages-dashboard-analysis-salesCard {
    height: calc(100% - 24px);
    :deep(.ant-card-head) {
      position: relative;
    }
  }

  .dashboard-analysis-iconGroup {
    i {
      margin-left: 16px;
      color: rgba(0,0,0,.45);
      cursor: pointer;
      transition: color .32s;
      color: black;
    }
  }
  .analysis-salesTypeRadio {
    position: absolute;
    right: 54px;
    bottom: 12px;
  }
</style>
