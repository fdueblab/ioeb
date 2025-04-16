<template>
  <div class="schedule-with-input">
    <fake-chat
      ref="fakeChat"
      style="height: calc(100vh - 100px)"
      @update-services="updateServices"
      @update-flow="updateFlow"
      @clear-flow="clearFlow"
      :service-type="verticalType"
    />
    <flow-panel
      ref="flowPanel"
      style="height: calc(100vh - 100px); width: 100%"
      :initial-flow="initFlow"
      :initial-services="initServices"
      :loading-services="loadingServices"
      :loading-flow="loadingFlow"
      :service-type="verticalType"
    />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_with_input'
import FakeChat from '@/components/ef/fake_chat'
import dictionaryCache from '@/utils/dictionaryCache'

export default {
  name: 'GenericSchedule',
  components: {
    FlowPanel,
    FakeChat
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
      serviceName: '通用智能服务',
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
    // 从字典获取服务名称
    async loadServiceNameFromDict() {
      try {
        if (!this.verticalType) return
        // 从字典缓存中获取服务名称
        const domains = await dictionaryCache.loadDict(`domain`)
        this.serviceName = domains.find(item => item.code === this.verticalType)?.text + '服务' || '通用智能服务'
      } catch (error) {
        console.error('加载服务名称失败:', error)
      }
    },

    init() {
      this.$refs.fakeChat.init()
      this.loadServiceNameFromDict().then(() => {
        this.clearFlow()
      })
    },

    updateServices(newServices) {
      this.loadingServices = true
      setTimeout(() => {
        this.initServices = newServices
        this.loadingServices = false
      }, 800)
    },

    updateFlow(newFlow) {
      this.loadingFlow = true
      setTimeout(() => {
        this.$refs.flowPanel.updateInitialFlow(newFlow)
        this.loadingFlow = false
      }, 1600)
    },

    clearFlow() {
      this.$refs.flowPanel.dataReloadClear()
      this.$refs.flowPanel.setServices([
        {
          id: '9',
          type: 'group',
          name: this.serviceName,
          open: true,
          children: []
        }
      ])
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
