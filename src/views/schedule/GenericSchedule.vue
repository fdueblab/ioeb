<template>
  <meta-app-build-shell
    ref="buildShell"
    :vertical-type="verticalType"
    @import-request="handleImportRequest"
  />
</template>

<script>
import MetaAppBuildShell from '@/components/ef/meta_app_build/MetaAppBuildShell.vue'
import {
  parseImportData,
  buildCanvasFlow,
  createServiceIdDecoder
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
      const shell = this.$refs.buildShell
      const panel = shell && shell.$refs.flowPanel
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
      this.$refs.buildShell.clearFlow()
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
        const flowData = buildCanvasFlow(importData.metaApp || {}, fullServices, serviceIds)
        const shell = this.$refs.buildShell
        if (shell) {
          await shell.applyFlowPatch(flowData)
        }
        const successCount = fullServices.length
        const totalCount = importData.services.length
        const message = totalCount === successCount
          ? `成功导入元应用"${importData.metaApp.preName}"，包含${successCount}个服务`
          : `导入元应用"${importData.metaApp.preName}"，成功${successCount}/${totalCount}个服务`
        this.$message.success(message)
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
