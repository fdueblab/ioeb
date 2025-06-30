<template>
  <div class="schedule-with-input">
    <smart-chat
      ref="smartChat"
      style="height: calc(100vh - 100px)"
      @start-loading="startLoading"
      @stop-loading="stopLoading"
      @update-services="updateServices"
      @update-flow="updateFlow"
      @clear-flow="clearFlow"
      :vertical-type="verticalType"
    />
    <flow-panel
      ref="flowPanel"
      style="height: calc(100vh - 100px); width: 100%"
      :initial-flow="initFlow"
      :initial-services="initServices"
      :loading-services="loadingServices"
      :loading-flow="loadingFlow"
      :vertical-type="verticalType"
      @import-request="handleImportRequest"
    />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_enhanced'
import SmartChat from '@/components/ef/smart_chat'
import {
  SERVICE_TEXT_MAP,
  parseImportData,
  buildImportedFlowData,
  createServiceIdDecoder,
  validateExportData,
  checkCompatibility, generateServiceNodes
} from '@/components/ef/utils'
import { batchGetServices } from '@/api/service'

export default {
  name: 'GenericSchedule',
  components: {
    FlowPanel,
    SmartChat
  },
  props: {
    // 垂直领域类型，从路由解析
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
  watch: {
    // 监听垂直领域类型变化，重新加载数据
    verticalType: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          console.log('垂直领域类型变化:', oldVal, '->', newVal)
          this.init()
        }
      },
      immediate: false
    }
  },
  methods: {
    init() {
      this.$refs.smartChat.init()
      this.clearFlow()
    },

    // 开始loading状态（连接智能体和思考过程中）
    startLoading() {
      this.loadingServices = true
      this.loadingFlow = true
    },

    // 停止loading状态（出现错误时）
    stopLoading() {
      this.loadingServices = false
      this.loadingFlow = false
    },

    updateServices(newServices) {
      // 如果还没有loading，则设置loading（防止重复设置）
      if (!this.loadingServices) {
        this.loadingServices = true
      }
      setTimeout(() => {
        this.initServices = newServices
        this.loadingServices = false
      }, 800)
    },

    updateFlow(newFlow) {
      // 如果还没有loading，则设置loading（防止重复设置）
      if (!this.loadingFlow) {
        this.loadingFlow = true
      }
      setTimeout(() => {
        this.$refs.flowPanel.updateInitialFlow(newFlow)
        this.loadingFlow = false
      }, 1600)
    },

    clearFlow() {
      this.$refs.flowPanel.dataReloadClear()
      // 只有在没有服务数据时才设置空的服务列表
      if (!this.initServices || this.initServices.length === 0) {
      this.$refs.flowPanel.setServices([
        {
          id: 'rootNode',
          name: this.service_text_map[this.verticalType],
          open: true,
          children: []
        }
      ])
      }
    },
    // 处理导入请求
    async handleImportRequest(importData) {
      try {
        // 解析导入数据
        const decoder = createServiceIdDecoder()
        const parsedData = parseImportData(importData, decoder)
        if (parsedData.metadata.failedServices.length > 0) {
          this.$message.warning(`以下服务无法解析: ${parsedData.metadata.failedServices.join(', ')}`)
        }
        if (parsedData.serviceIds.length === 0) {
          this.$message.error('导入的服务列表为空或格式错误')
          return
        }
        // 提取服务ID列表
        const serviceIds = parsedData.serviceIds.map(s => s.id)
        // 通过API查询完整的服务信息
        const fullServices = await this.fetchServicesByIds(serviceIds)
        if (!fullServices || fullServices.length === 0) {
          this.$message.error('获取服务信息失败，请检查文件内数据是否正确')
          return
        }
        // 构建完整的流程数据
        const flowData = buildImportedFlowData(importData, fullServices)
        const { serviceNodes } = generateServiceNodes(flowData, this.verticalType)
        // 更新流程数据（updateFlow内部会处理loading状态）
        this.updateServices(serviceNodes)
        this.updateFlow(flowData)
        // 显示导入统计信息
        const successCount = fullServices.length
        const totalCount = importData.services.length
        const message = totalCount === successCount
          ? `成功导入元应用"${importData.metaApp.preName}"，包含${successCount}个服务`
          : `导入元应用"${importData.metaApp.preName}"，成功${successCount}/${totalCount}个服务`
        // 和updateFlow同步
        setTimeout(() => {
          this.$message.success(message)
        }, 1600)
      } catch (error) {
        console.error('处理导入数据失败:', error)
        this.$message.error('导入异常，请检查文件内数据是否正确！')
      }
    },

    // 验证导入数据格式
    validateImportData(data) {
      // 使用工具函数进行基础验证
      if (!validateExportData(data)) {
        return false
      }
      // 检查兼容性
      const compatibility = checkCompatibility(data, this.verticalType)
      if (!compatibility.isCompatible) {
        console.warn('兼容性问题:', compatibility.issues)
        // 显示对应警告
        if (compatibility.warnings.length > 0) {
          this.$message.warning(`检测到兼容性问题: ${compatibility.warnings.join(', ')}`)
        }
        return false
      }
      return true
    },

    // 通过服务ID列表查询完整服务信息
    async fetchServicesByIds(serviceIds) {
      try {
        // 调用批量获取服务API
        const response = await batchGetServices(serviceIds)

        if (response && response.status === 'success') {
          // 处理成功的响应
          const services = response.services || []
          const notFoundIds = response.notFound || []
          // 如果有未找到的服务，显示警告信息
          if (notFoundIds.length > 0) {
            console.warn('以下服务在数据库中不存在:', notFoundIds)
          }
          // 显示获取结果统计
          if (response.message) {
            console.info('批量获取服务结果:', response.message)
          }
          return services
        } else {
          throw new Error(response?.message || '查询服务信息失败')
        }
      } catch (error) {
        console.warn('API调用失败', error.message)
        return []
      }
    }
  }
}
</script>

<style scoped>
.schedule-with-input {
  display: flex;
  height: calc(100vh + 100px);
}
</style>
