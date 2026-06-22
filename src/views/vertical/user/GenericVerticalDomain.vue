<template>
  <div>
    <component
      @onGoBack="handleGoBack"
      @onGoUse="handleGoUse"
      :is="currentComponent"
      :apiList="apiList"
      :verticalType="verticalType"
      :key="verticalType"
    >
    </component>
  </div>
</template>

<script>
import GenericVerticalList from './GenericVerticalList'
import UseService from './useService'
import UseMetaApp from './useMetaApp'
import UseMCP from './useMCP'
import request from '@/utils/request'
import { API_BASE_URL } from '@/utils/baseUrl'

export default {
  name: 'GenericVerticalDomain',
  components: {
    GenericVerticalList,
    UseService,
    UseMetaApp,
    UseMCP
  },
  props: {
    // 垂直领域类型
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentComponent: 'GenericVerticalList',
      apiList: []
    }
  },
  methods: {
    handleGoBack() {
      this.currentComponent = 'GenericVerticalList'
    },
    handleGoUse(record) {
      console.log('record', record)
      console.log('record.apiList', record.apiList)

      // 根据服务类型处理数据
      switch (record.type) {
        case 'meta':
          // 元应用类型，期望有 apiList
          if (!record.apiList || record.apiList.length === 0) {
            this.$message.error('数据缺失！')
            return
          }
          this.apiList = record.apiList
          this.currentComponent = 'UseMetaApp'
          break
        case 'atomic_mcp':
          // MCP 类型服务，需要将 record 本身包装成数组
          // MCP 服务的数据结构包含 url, tools, des 等字段
          if (!record.url) {
            this.$message.error('MCP 服务地址缺失！')
            return
          }
          this.apiList = [record]
          this.currentComponent = 'UseMCP'
          break
        case 'atomic':
          // 原子服务类型，期望有 apiList
          if (!record.apiList || record.apiList.length === 0) {
            this.$message.error('数据缺失！')
            return
          }
          this.apiList = record.apiList
          this.currentComponent = 'UseService'
          break
        case 'generated_algorithm':
          // 想定式生成算法：无在线调用，直接下载平台保存的源码
          this.downloadScenarioGeneratedAlgorithm(record)
          break
        default:
          this.$message.error('服务类型异常！')
      }
    },
    async downloadScenarioGeneratedAlgorithm(record) {
      const id = record && record.id
      if (!id) {
        this.$message.error('服务 ID 缺失')
        return
      }
      try {
        const blob = await request({
          url: `${API_BASE_URL}/services/${id}/scenario-generated-code`,
          method: 'get',
          responseType: 'blob'
        })
        const fn = (record.apiList && record.apiList[0] && record.apiList[0].responseFileName) ||
          `${record.name || 'algorithm'}.py`
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fn)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$message.success('已开始下载算法源码')
      } catch (e) {
        const msg = (e && e.message) ? e.message : String(e)
        this.$message.error('下载失败：' + msg)
      }
    }
  },
  watch: {
    // 监听垂直领域类型变化，重置组件状态
    verticalType(newVal, oldVal) {
      if (newVal !== oldVal) {
        console.log('GenericVerticalDomain垂直领域类型变化:', oldVal, '->', newVal)
        // 重置为列表组件
        this.currentComponent = 'GenericVerticalList'
        this.apiList = []
      }
    }
  }
}
</script>
