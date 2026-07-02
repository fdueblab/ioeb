<template>
  <meta-app-build-shell
    ref="buildShell"
    :vertical-type="verticalType"
    :initial-flow="initFlow"
    :initial-services="initServices"
    :loading-services="loadingServices"
    :loading-flow="loadingFlow"
    @start-loading="startLoading"
    @stop-loading="stopLoading"
    @update-services="updateServices"
    @update-flow="updateFlow"
    @import-request="handleImportRequest"
  />
</template>

<script>
import MetaAppBuildShell from '@/components/ef/meta_app_build/MetaAppBuildShell.vue'
import {
  SERVICE_TEXT_MAP,
  parseImportData,
  buildImportedFlowData,
  createServiceIdDecoder,
  generateServiceNodes
} from '@/components/ef/utils'
import { batchGetServices } from '@/api/service'

export default {
  name: 'GenericSchedule',
  components: {
    MetaAppBuildShell
  },
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      service_text_map: SERVICE_TEXT_MAP,
      initFlow: {},
      initServices: [],
      loadingServices: false,
      loadingFlow: false
    }
  },
  mounted() {
    this.init()
  },
  beforeRouteLeave(to, from, next) {
    const shell = this.$refs.buildShell
    if (!shell || !shell.isActiveBuild()) {
      next()
      return
    }
    this.$confirm(
      '离开本页后，当前仿真构建将中止且进度不会保留。',
      '切换页面将停止构建',
      {
        confirmButtonText: '离开并停止',
        cancelButtonText: '继续构建',
        confirmButtonClass: 'el-button--danger',
        type: 'warning',
        closeOnClickModal: false
      }
    )
      .then(() => {
        shell.cancelBuildForLeave()
        next()
      })
      .catch(() => {
        next(false)
      })
  },
  activated() {
    this.$nextTick(() => {
      const panel = this.$refs.flowPanel
      this.simulationChromeOpen = !!(panel && panel.simulationBuilderVisible)
      if (panel && panel.jsPlumb && panel.jsPlumb.repaintEverything) {
        panel.jsPlumb.repaintEverything()
      }
    })
  },
  watch: {
    verticalType: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      },
      immediate: false
    }
  },
  methods: {
    init() {
      this.$refs.buildShell.initChat()
      this.clearFlow()
    },
    startLoading() {
      this.loadingServices = true
      this.loadingFlow = true
    },
    stopLoading() {
      this.loadingServices = false
      this.loadingFlow = false
    },
    updateServices(newServices) {
      if (!this.loadingServices) this.loadingServices = true
      setTimeout(() => {
        this.initServices = newServices
        this.loadingServices = false
      }, 800)
    },
    updateFlow(newFlow) {
      if (!this.loadingFlow) this.loadingFlow = true
      setTimeout(() => {
        const panel = this.$refs.buildShell && this.$refs.buildShell.$refs.flowPanel
        if (panel) panel.updateInitialFlow(newFlow)
        this.loadingFlow = false
      }, 1600)
    },
    clearFlow() {
      const shell = this.$refs.buildShell
      if (shell) shell.clearFlow()
      const panel = shell && shell.$refs.flowPanel
      if (panel && (!this.initServices || !this.initServices.length)) {
        panel.setServices([
          {
            id: 'rootNode',
            name: this.service_text_map[this.verticalType],
            open: true,
            children: []
          }
        ])
      }
    },
    async handleImportRequest(importData) {
      try {
        const decoder = createServiceIdDecoder()
        const parsedData = parseImportData(importData, decoder)
        if (parsedData.metadata.failedServices.length > 0) {
          this.$message.warning(`以下服务无法解析: ${parsedData.metadata.failedServices.join(', ')}`)
        }
        if (parsedData.serviceIds.length === 0) {
          this.$message.error('导入的服务列表为空或格式错误')
          return
        }
        const serviceIds = parsedData.serviceIds.map((s) => s.id)
        const fullServices = await this.fetchServicesByIds(serviceIds)
        if (!fullServices || fullServices.length === 0) {
          this.$message.error('获取服务信息失败，请检查文件内数据是否正确')
          return
        }
        const flowData = buildImportedFlowData(importData, fullServices)
        const { serviceNodes } = generateServiceNodes(flowData, this.verticalType)
        this.updateServices(serviceNodes)
        this.updateFlow(flowData)
        const successCount = fullServices.length
        const totalCount = importData.services.length
        const message = totalCount === successCount
          ? `成功导入元应用"${importData.metaApp.preName}"，包含${successCount}个服务`
          : `导入元应用"${importData.metaApp.preName}"，成功${successCount}/${totalCount}个服务`
        setTimeout(() => {
          this.$message.success(message)
        }, 1600)
      } catch (error) {
        console.error('处理导入数据失败:', error)
        this.$message.error('导入异常，请检查文件内数据是否正确！')
      }
    },
    async fetchServicesByIds(serviceIds) {
      try {
        const response = await batchGetServices(serviceIds)
        if (response && response.status === 'success') {
          return response.services || []
        }
        throw new Error(response?.message || '查询服务信息失败')
      } catch (error) {
        console.warn('API调用失败', error.message)
        return []
      }
    }
  }
}
</script>
