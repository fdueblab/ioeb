<template>
  <div class="schedule-with-input">
    <smart-chat
      ref="smartChat"
      style="height: calc(100vh - 100px)"
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
    />
  </div>
</template>

<script>
import FlowPanel from '@/components/ef/panel_enhanced'
import SmartChat from '@/components/ef/smart_chat'
import { SERVICE_TEXT_MAP } from '@/components/ef/utils'

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
