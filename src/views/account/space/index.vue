<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="page-heading">
        <h2>我的成果</h2>
        <p>展示你在平台中创建并登记的各类组件，可按需生成升级建议。</p>
      </div>

      <a-tabs v-model="activeTab" @change="handleTabChange">
        <a-tab-pane key="developed" tab="已开发成果">
          <div class="table-toolbar">
            <a-form layout="inline">
              <a-form-item label="资源类型">
                <a-select
                  v-model="typeFilter"
                  allow-clear
                  placeholder="全部类型"
                  style="width: 200px"
                  @change="applyFilter"
                >
                  <a-select-option v-for="item in typeArr" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-button @click="loadDevelopedData">刷新列表</a-button>
              </a-form-item>
            </a-form>
          </div>

          <service-table
            mode="achievement"
            :data-source="filteredDataSource"
            :loading="dataLoading"
            :status-dict="statusDict"
            :status-style-dict="statusStyleDict"
            :norm-dict="normDict"
            :type-arr="typeArr"
            :technology-arr="technologyArr"
            :upgrade-advice-loading-id="upgradeAdviceLoadingId"
            @edit="handleEdit"
            @use="handleUse"
            @upgrade-advice="handleUpgradeAdvice"
            @update-strategy="handleUpdateStrategy"
            @publish-sale="handlePublishSale"
          />

          <a-empty
            v-if="!dataLoading && filteredDataSource.length === 0"
            description="暂无成果，请先在垂域模块创建并登记组件"
            style="margin-top: 24px"
          />
        </a-tab-pane>

        <a-tab-pane key="purchased" tab="已购买成果">
          <div class="table-toolbar">
            <a-button @click="loadPurchasedData">刷新列表</a-button>
          </div>

          <service-table
            mode="purchased"
            :data-source="purchasedDataSource"
            :loading="purchasedLoading"
            :status-dict="statusDict"
            :status-style-dict="statusStyleDict"
            :norm-dict="normDict"
            :type-arr="typeArr"
            :technology-arr="technologyArr"
            @use-service="handleUseService"
          />

          <a-empty
            v-if="!purchasedLoading && purchasedDataSource.length === 0"
            description="暂无已购买的成果"
            style="margin-top: 24px"
          />
        </a-tab-pane>

        <a-tab-pane key="interested" tab="感兴趣成果">
          <div class="table-toolbar">
            <a-button @click="loadInterestedData">刷新列表</a-button>
          </div>

          <service-table
            mode="interested"
            :data-source="interestedDataSource"
            :loading="interestedLoading"
            :status-dict="statusDict"
            :status-style-dict="statusStyleDict"
            :norm-dict="normDict"
            :type-arr="typeArr"
            :technology-arr="technologyArr"
            @contact-purchase="handleContactPurchase"
          />

          <a-empty
            v-if="!interestedLoading && interestedDataSource.length === 0"
            description="暂无感兴趣的成果"
            style="margin-top: 24px"
          />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <upgrade-advice-modal ref="upgradeAdviceModal" />
    <update-strategy-modal ref="updateStrategyModal" @saved="handleUpdateStrategySaved" />
    <sale-publish-modal ref="salePublishModal" @published="handleSalePublished" />
    <message-modal ref="messageModal" />
  </page-header-wrapper>
</template>

<script>
import { getMyServices, saveUpgradeAdvice, downloadScenarioGeneratedAlgorithm, getPurchasedServices, getInterestedServices } from '@/api/service'
import { streamGenerateUpgradeAdvice } from '@/api/achievement'
import { standardizeServiceData, parseUpgradeAdviceResult } from '@/utils/serviceData'
import dictionaryCache from '@/utils/dictionaryCache'
import ServiceTable from '@/views/vertical/user/components/ServiceTable'
import UpgradeAdviceModal from '@/views/account/components/UpgradeAdviceModal'
import UpdateStrategyModal from '@/views/account/components/UpdateStrategyModal'
import SalePublishModal from '@/views/account/components/SalePublishModal'
import MessageModal from '@/views/account/components/MessageModal'

export default {
  name: 'AccountAchievements',
  components: {
    ServiceTable,
    UpgradeAdviceModal,
    UpdateStrategyModal,
    SalePublishModal,
    MessageModal
  },
  data() {
    return {
      activeTab: 'developed',
      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      typeFilter: undefined,
      upgradeAdviceLoadingId: '',
      statusDict: [],
      statusStyleDict: [],
      normDict: [],
      typeArr: [],
      technologyArr: [],
      purchasedLoading: false,
      purchasedDataSource: [],
      interestedLoading: false,
      interestedDataSource: []
    }
  },
  created() {
    this.loadDictionaryData()
    this.loadDevelopedData()
  },
  activated() {
    this.loadDevelopedData()
  },
  methods: {
    async loadDictionaryData() {
      try {
        this.statusDict = await dictionaryCache.loadDict('status') || []
        this.statusStyleDict = await dictionaryCache.loadDict('status_style') || []
        this.normDict = [
          ...(await dictionaryCache.loadDict('norm') || []),
          ...(await dictionaryCache.loadDict('performance_metric') || [])
        ]
        this.typeArr = await dictionaryCache.loadDict('service_type') || []
        this.technologyArr = await dictionaryCache.loadDict('aml_technology') || []
        const genAlgo = { code: 'generated_algorithm', text: '想定式生成算法' }
        if (!this.typeArr.some(item => item.code === genAlgo.code)) {
          this.typeArr = [...this.typeArr, genAlgo]
        }
      } catch (error) {
        console.error('加载字典失败:', error)
      }
    },
    handleTabChange(key) {
      if (key === 'developed' && this.dataSource.length === 0) {
        this.loadDevelopedData()
      } else if (key === 'purchased' && this.purchasedDataSource.length === 0) {
        this.loadPurchasedData()
      } else if (key === 'interested' && this.interestedDataSource.length === 0) {
        this.loadInterestedData()
      }
    },
    async loadDevelopedData() {
      this.dataLoading = true
      try {
        const res = await getMyServices()
        console.log('=== loadDevelopedData API响应 ===', res)
        if (res && res.status === 'success') {
          this.dataSource = standardizeServiceData(res.services || [])
          console.log('=== dataSource标准化后 ===', this.dataSource)

          // 检查有销售信息的成果
          const forSaleServices = this.dataSource.filter(s => s.isForSale)
          console.log('=== 有销售信息的成果数量 ===', forSaleServices.length)
          if (forSaleServices.length > 0) {
            console.log('=== 销售信息详情 ===', forSaleServices)
          }

          this.applyFilter()
        } else {
          this.$message.error((res && res.message) || '获取我的成果失败')
        }
      } catch (e) {
        this.$message.error('获取我的成果失败：' + ((e && e.message) || e))
      } finally {
        this.dataLoading = false
      }
    },
    async loadPurchasedData() {
      this.purchasedLoading = true
      try {
        const res = await getPurchasedServices()
        if (res && res.status === 'success') {
          this.purchasedDataSource = standardizeServiceData(res.services || [])
        } else {
          this.$message.error((res && res.message) || '获取已购买成果失败')
        }
      } catch (e) {
        this.$message.error('获取已购买成果失败：' + ((e && e.message) || e))
      } finally {
        this.purchasedLoading = false
      }
    },
    async loadInterestedData() {
      this.interestedLoading = true
      try {
        const res = await getInterestedServices()
        if (res && res.status === 'success') {
          this.interestedDataSource = standardizeServiceData(res.services || [])
        } else {
          this.$message.error((res && res.message) || '获取感兴趣成果失败')
        }
      } catch (e) {
        this.$message.error('获取感兴趣成果失败：' + ((e && e.message) || e))
      } finally {
        this.interestedLoading = false
      }
    },
    applyFilter() {
      if (!this.typeFilter) {
        this.filteredDataSource = [...this.dataSource]
        return
      }
      this.filteredDataSource = this.dataSource.filter(item => item.type === this.typeFilter)
    },
    handleEdit(record) {
      this.$message.info(`成果「${record.name}」可在垂域算法模型组件列表中编辑`)
      if (record.domain) {
        this.$router.push(`/vertical-user/${record.domain}`)
      }
    },
    async handleUse(record) {
      if (record.type === 'generated_algorithm') {
        try {
          const blob = await downloadScenarioGeneratedAlgorithm(record.id)
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = (record.apiList && record.apiList[0] && record.apiList[0].responseFileName) || `${record.name || 'algorithm'}.py`
          link.click()
          window.URL.revokeObjectURL(url)
        } catch (e) {
          this.$message.error('下载失败：' + ((e && e.message) || e))
        }
        return
      }
      const statusType = this.statusStyleDict.find(item => item.code === record.status)
      const badge = statusType ? statusType.text : 'default'
      if (badge === 'default' || badge === 'error') {
        this.$message.info('服务异常或未部署，暂时无法使用')
        return
      }
      if (badge === 'processing') {
        this.$message.info('该服务正在部署，暂时无法使用')
        return
      }
      if (record.domain) {
        this.$router.push(`/vertical-user/${record.domain}`)
      }
    },
    handleUpgradeAdvice(record, action) {
      if (action === 'view') {
        this.$refs.upgradeAdviceModal.openView(record)
        return
      }
      this.generateUpgradeAdvice(record, action === 'refresh')
    },
    generateUpgradeAdvice(record, isRefresh) {
      if (this.upgradeAdviceLoadingId) {
        this.$message.info('正在生成其他成果的升级建议，请稍候')
        return
      }
      this.upgradeAdviceLoadingId = record.id
      this.$refs.upgradeAdviceModal.openGenerating(record)

      streamGenerateUpgradeAdvice(record, {
        typeArr: this.typeArr,
        technologyArr: this.technologyArr
      }, {
        onFinalResult: async (results) => {
          const parsed = parseUpgradeAdviceResult(results)
          if (!parsed) {
            this.$message.error('未能解析升级建议结果')
            this.upgradeAdviceLoadingId = ''
            this.$refs.upgradeAdviceModal.setGenerating(false)
            return
          }
          try {
            const payload = {
              leadingAnalysis: parsed.leadingAnalysis || '',
              autoUpgradeSuggestion: parsed.autoUpgradeSuggestion || '',
              manualUpdateSuggestion: parsed.manualUpdateSuggestion || ''
            }
            const res = await saveUpgradeAdvice(record.id, payload)
            if (res && res.status === 'success') {
              const advice = res.service && res.service.upgradeAdvice
              this.updateRecordAdvice(record.id, advice || payload)
              this.$refs.upgradeAdviceModal.setAdvice(advice || payload)
              this.$message.success(isRefresh ? '升级建议已刷新' : '升级建议生成成功')
            } else {
              this.$message.error((res && res.message) || '保存升级建议失败')
              this.$refs.upgradeAdviceModal.handleClose()
            }
          } catch (e) {
            this.$message.error('保存升级建议失败：' + ((e && e.message) || e))
            this.$refs.upgradeAdviceModal.handleClose()
          } finally {
            this.upgradeAdviceLoadingId = ''
          }
        },
        onError: (error) => {
          this.upgradeAdviceLoadingId = ''
          this.$refs.upgradeAdviceModal.handleClose()
          this.$message.error('生成升级建议失败：' + error)
        },
        onWarning: (warning) => {
          this.upgradeAdviceLoadingId = ''
          this.$refs.upgradeAdviceModal.handleClose()
          this.$message.warning('生成升级建议返回警告：' + warning)
        }
      })
    },
    updateRecordAdvice(serviceId, advice) {
      const patch = item => {
        if (item.id === serviceId) {
          item.upgradeAdvice = advice
        }
        return item
      }
      this.dataSource = this.dataSource.map(patch)
      this.applyFilter()
    },
    handleUpdateStrategy(record) {
      this.$refs.updateStrategyModal.open(record)
    },
    handleUpdateStrategySaved(strategy) {
      // 更新表格中的策略数据
      if (strategy && strategy.serviceId) {
        this.dataSource = this.dataSource.map(item => {
          if (item.id === strategy.serviceId) {
            item.updateStrategy = strategy
          }
          return item
        })
        this.applyFilter()
      }
    },
    handlePublishSale(record) {
      this.$refs.salePublishModal.open(record)
    },
    handleSalePublished(serviceId, action) {
      if (action === 'unpublish') {
        this.$message.success('成果已暂停发售')
      } else if (action === 'publish') {
        this.$message.success('成果已发布销售')
      }
      this.loadDevelopedData()
    },
    handleUseService(record) {
      this.$refs.messageModal.open(record, {
        messageType: 'use_service'
      })
    },
    handleContactPurchase(record) {
      this.$refs.messageModal.open(record, {
        messageType: 'contact_purchase'
      })
    }
  }
}
</script>

<style lang="less" scoped>
.page-heading {
  margin-bottom: 16px;

  h2 {
    margin-bottom: 4px;
    font-size: 22px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #6b7280;
  }
}

.table-toolbar {
  margin-bottom: 16px;
}
</style>
