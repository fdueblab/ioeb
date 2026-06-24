<template>
  <div class="meta-app-build-shell">
    <div class="wb-workbench-frame">
      <div class="wb-shell">
        <macro-bar :active-index="macroIndex" />

        <div class="wb-main-stack">
          <prepublish-view
            v-show="phase === 'prepublish'"
            :app-name="flowAppName"
            :pre-des="flowPreDes"
            :pre-input-name="flowPreInputName"
            :pre-output-name="flowPreOutputName"
            :input-type="flowInputType"
            :output-type="flowOutputType"
            :vertical-type="verticalType"
            :service-ids="serviceIds"
            @back="backToEdit"
            @published="onPublished"
          />

          <div v-show="phase !== 'prepublish'" class="wb-workbench">
            <aside class="wb-panel-left" :style="workbenchColumnStyle">
              <div class="wb-left-titlebar">
                <div class="wb-agent-mark"><a-icon type="robot" /></div>
                <span>{{ leftBarTitle }}</span>
              </div>

              <div v-show="phase === 'input'" class="wb-chat-host">
                <smart-chat
                  ref="smartChat"
                  workbench-layout
                  :vertical-type="verticalType"
                  @start-loading="$emit('start-loading')"
                  @stop-loading="$emit('stop-loading')"
                  @update-services="onUpdateServices"
                  @update-flow="onUpdateFlow"
                  @scenario-intake="onScenarioIntake"
                />
              </div>

              <simulation-build-left-panel v-show="phase === 'build'" class="wb-build-host">
                <simulation-builder
                  v-if="buildUiMounted"
                  v-show="phase === 'build'"
                  ref="simulationBuilder"
                  embedded
                  :service-nodes="serviceNodes"
                  :app-name="flowAppName"
                  :app-id="flowAppId"
                  :domain="verticalType"
                  :scenario-description="flowScenarioText"
                  :scenario-parsed="flowScenarioParsed"
                  @success="onBuildSuccess"
                  @prePublish="goPrepublish"
                  @canvas-visual="onCanvasVisual"
                  @scenario-parsed-update="onScenarioParsedUpdate"
                  @cancel-build="onBuildCancelled"
                  @back-to-edit="onBackToEdit"
                />
              </simulation-build-left-panel>
            </aside>

            <section ref="workbenchRight" class="wb-panel-right" :style="workbenchColumnStyle">
              <flow-panel
                ref="flowPanel"
                workbench-mode
                :workbench-phase="phase"
                :workbench-stage-height="workbenchStageHeight"
                :build-entry-ready="canStartBuild"
                :initial-flow="initialFlow"
                :initial-services="initialServices"
                :loading-services="loadingServices"
                :loading-flow="loadingFlow"
                :vertical-type="verticalType"
                :show-toolbar="false"
                :show-sidebar="false"
                @import-request="$emit('import-request', $event)"
                @start-build="startBuild"
                @flow-synced="onFlowSynced"
              />
            </section>
          </div>
        </div>
      </div>
    </div>

    <workbench-detail-dock :minimized.sync="detailDockMinimized">
      <simulation-detail-sidebar
        :mode="detailSidebarMode"
        :parsed="parsedDetail"
        :services="parsedServices"
        :build="buildDetailView"
        :product="productDetail"
      />
    </workbench-detail-dock>
  </div>
</template>

<script>
import MacroBar from './MacroBar.vue'
import SimulationBuildLeftPanel from './SimulationBuildLeftPanel.vue'
import SimulationBuilder from '@/components/ef/simulation_builder'
import SimulationDetailSidebar from './SimulationDetailSidebar.vue'
import WorkbenchDetailDock from './WorkbenchDetailDock.vue'
import PrepublishView from './PrepublishView.vue'
import SmartChat from '@/components/ef/smart_chat'
import FlowPanel from '@/components/ef/panel_enhanced'

export default {
  name: 'MetaAppBuildShell',
  components: {
    MacroBar,
    SimulationBuildLeftPanel,
    SimulationBuilder,
    SimulationDetailSidebar,
    WorkbenchDetailDock,
    PrepublishView,
    SmartChat,
    FlowPanel
  },
  props: {
    verticalType: { type: String, required: true },
    initialFlow: { type: Object, default: () => ({}) },
    initialServices: { type: Array, default: () => [] },
    loadingServices: { type: Boolean, default: false },
    loadingFlow: { type: Boolean, default: false }
  },
  data() {
    return {
      phase: 'input',
      detailMinimized: true,
      prepublishDetailMinimized: true,
      detailRefreshKey: 0,
      detailRefreshTimer: null,
      /** 画布数据快照；避免 Vue2 $refs 不触发 computed 重算导致侧栏/构建读不到节点 */
      canvasFlow: null,
      /** 进入预发布前缓存产物详情（builder 卸载后仍可读） */
      cachedProductDetail: null,
      /** 构建面板已挂载：预发布返回时不销毁 builder，避免空白 */
      buildUiMounted: false,
      /** 左右栏统一高度（视口 - macro - detail dock） */
      workbenchStageHeight: 0
    }
  },
  computed: {
    workbenchColumnStyle() {
      return {
        height: '90vh',
        maxHeight: '90vh'
      }
    },
    macroIndex() {
      if (this.phase === 'prepublish') return 2
      if (this.phase === 'build') return 1
      return 0
    },
    canStartBuild() {
      return (
        this.phase === 'input' &&
        this.hasStructuredScenarioParse() &&
        this.getServiceNodes().length > 0
      )
    },
    panel() {
      return this.$refs.flowPanel
    },
    flowData() {
      if (this.canvasFlow) return this.canvasFlow
      const panel = this.$refs.flowPanel
      return (panel && panel.data) || {}
    },
    flowAppName() {
      return this.flowData.preName || '新元应用'
    },
    flowAppId() {
      return this.flowData.name || 'meta-app-draft'
    },
    flowScenarioText() {
      return this.flowData.scenarioSummary || this.flowData.preDes || ''
    },
    flowScenarioParsed() {
      return this.flowData.scenarioParsed || {}
    },
    flowPreDes() {
      return this.flowData.preDes || ''
    },
    flowPreInputName() {
      return this.flowData.preInputName || '输入内容'
    },
    flowPreOutputName() {
      return this.flowData.preOutputName || '输出内容'
    },
    flowInputType() {
      const t = this.flowData.inputType
      return t != null ? Number(t) : 1
    },
    flowOutputType() {
      const t = this.flowData.outputType
      return t != null ? Number(t) : 1
    },
    serviceNodes() {
      return this.flowData.nodeList || []
    },
    serviceIds() {
      return this.serviceNodes
        .filter((n) => n.name !== 'metaAppAgent')
        .map((n) => n.id)
    },
    leftBarTitle() {
      return this.phase === 'build' ? '想定式构建' : '想定式需求分析'
    },
    detailDockMinimized: {
      get() {
        return this.phase === 'prepublish' ? this.prepublishDetailMinimized : this.detailMinimized
      },
      set(val) {
        if (this.phase === 'prepublish') this.prepublishDetailMinimized = val
        else this.detailMinimized = val
      }
    },
    detailSidebarMode() {
      if (this.phase === 'prepublish') return 'prepublish'
      if (this.phase === 'build') return 'build'
      if (this.hasStructuredScenarioParse()) return 'parsed'
      return 'input'
    },
    parsedServices() {
      return this.serviceNodes
        .filter((n) => n.name !== 'metaAppAgent')
        .map((n) => ({ id: n.id, name: (n.meta && n.meta.name) || n.name }))
    },
    parsedDetail() {
      const sp = this.flowScenarioParsed || {}
      return {
        goal: sp.goal || '',
        description: sp.description || '',
        constraints: Array.isArray(sp.constraints) ? sp.constraints : [],
        acceptanceCriteria: Array.isArray(sp.acceptanceCriteria) ? sp.acceptanceCriteria : []
      }
    },
    buildDetailView() {
      // detailRefreshKey 驱动构建中侧栏轮询刷新
      void this.detailRefreshKey
      const b = this.$refs.simulationBuilder
      if (!b || !b.getDetailViewModel) return {}
      return b.getDetailViewModel()
    },
    productDetail() {
      if (this.phase === 'prepublish' && this.cachedProductDetail) {
        return this.cachedProductDetail
      }
      const b = this.$refs.simulationBuilder
      if (b && b.getProductViewModel) return b.getProductViewModel()
      return {
        artifact: null,
        summaryRows: [],
        intent: this.flowPreDes,
        services: this.parsedServices.map((s) => s.name).join('、'),
        tags: []
      }
    }
  },
  watch: {
    phase(val, oldVal) {
      if (this.detailRefreshTimer) {
        clearInterval(this.detailRefreshTimer)
        this.detailRefreshTimer = null
      }
      if (val === 'build') {
        this.detailRefreshTimer = setInterval(() => {
          this.detailRefreshKey += 1
        }, 1000)
      }
      this.$nextTick(() => this.syncWorkbenchStageHeight())
    },
    detailDockMinimized() {
      this.$nextTick(() => this.syncWorkbenchStageHeight())
    },
    loadingFlow(loading) {
      if (!loading) {
        this.$nextTick(() => {
          this.syncFlowFromPanel()
          this.syncWorkbenchStageHeight()
        })
      }
    }
  },
  mounted() {
    this.syncWorkbenchStageHeight()
    this.$nextTick(() => this.syncWorkbenchStageHeight())
    this.bindWorkbenchLayoutMetrics()
  },
  beforeDestroy() {
    if (this.detailRefreshTimer) clearInterval(this.detailRefreshTimer)
    this.unbindWorkbenchLayoutMetrics()
  },
  methods: {
    computeWorkbenchStageHeight() {
      return Math.floor(window.innerHeight * 0.9)
    },
    syncWorkbenchStageHeight() {
      if (this.phase === 'prepublish') return
      this.workbenchStageHeight = this.computeWorkbenchStageHeight()
    },
    bindWorkbenchLayoutMetrics() {
      this.unbindWorkbenchLayoutMetrics()
      this._onWorkbenchLayoutResize = () => this.syncWorkbenchStageHeight()
      window.addEventListener('resize', this._onWorkbenchLayoutResize)
      const shell = this.$el
      const dock = shell && shell.querySelector('.wb-detail-dock')
      if (dock && typeof ResizeObserver !== 'undefined') {
        this._dockResizeObs = new ResizeObserver(() => this.syncWorkbenchStageHeight())
        this._dockResizeObs.observe(dock)
      }
    },
    unbindWorkbenchLayoutMetrics() {
      if (this._dockResizeObs) {
        this._dockResizeObs.disconnect()
        this._dockResizeObs = null
      }
      if (this._onWorkbenchLayoutResize) {
        window.removeEventListener('resize', this._onWorkbenchLayoutResize)
        this._onWorkbenchLayoutResize = null
      }
    },
    initChat() {
      if (this.$refs.smartChat) this.$refs.smartChat.init()
    },
    clearFlow() {
      if (this.panel) this.panel.dataReloadClear()
      this.canvasFlow = null
      this.phase = 'input'
      this.detailMinimized = true
      this.buildUiMounted = false
      this.cachedProductDetail = null
    },
    cloneFlowSnapshot(flow) {
      if (!flow || typeof flow !== 'object') return null
      return {
        ...flow,
        nodeList: Array.isArray(flow.nodeList) ? flow.nodeList.map((n) => ({ ...n })) : [],
        scenarioParsed: flow.scenarioParsed ? { ...flow.scenarioParsed } : flow.scenarioParsed
      }
    },
    onFlowSynced(payload) {
      const snap = this.cloneFlowSnapshot(payload)
      if (snap) this.canvasFlow = snap
      this.$nextTick(() => {
        this.syncWorkbenchStageHeight()
      })
    },
    syncFlowFromPanel() {
      const panel = this.$refs.flowPanel
      if (!panel || !panel.data) return
      this.onFlowSynced(panel.data)
    },
    getServiceNodes() {
      const panel = this.$refs.flowPanel
      const list =
        (this.canvasFlow && this.canvasFlow.nodeList) ||
        (panel && panel.data && panel.data.nodeList) ||
        []
      return list.filter((n) => n.name !== 'metaAppAgent')
    },
    hasStructuredScenarioParse() {
      const sp = this.flowScenarioParsed || {}
      if (sp.goal || sp.description) return true
      if (Array.isArray(sp.constraints) && sp.constraints.length) return true
      if (Array.isArray(sp.acceptanceCriteria) && sp.acceptanceCriteria.length) return true
      const summary = (this.canvasFlow && this.canvasFlow.scenarioSummary) || this.flowData.scenarioSummary
      return Boolean(summary && String(summary).trim())
    },
    onUpdateServices(services) {
      this.$emit('update-services', services)
    },
    onUpdateFlow(flow) {
      const snap = this.cloneFlowSnapshot(flow)
      if (snap) this.canvasFlow = snap
      this.$emit('update-flow', flow)
    },
    onScenarioIntake(payload) {
      if (this.panel && this.panel.applyScenarioIntake) {
        this.panel.applyScenarioIntake(payload)
      }
      if (payload) {
        this.canvasFlow = {
          ...(this.canvasFlow || {}),
          ...(payload.scenarioParsed ? { scenarioParsed: payload.scenarioParsed } : {}),
          ...(payload.scenarioSummary ? { scenarioSummary: payload.scenarioSummary } : {}),
          ...(payload.userRemark ? { preDes: payload.userRemark } : {})
        }
      }
    },
    startBuild() {
      this.syncFlowFromPanel()
      if (!this.canStartBuild) {
        if (!this.getServiceNodes().length) {
          this.$message.error('请先智能生成应用或添加服务！')
        } else if (!this.hasStructuredScenarioParse()) {
          this.$message.error('请先完成想定场景解析')
        }
        return
      }
      const allNodes =
        (this.canvasFlow && this.canvasFlow.nodeList) ||
        (this.$refs.flowPanel && this.$refs.flowPanel.data && this.$refs.flowPanel.data.nodeList) ||
        []
      this.buildUiMounted = true
      this.phase = 'build'
      this.$nextTick(() => {
        this.$nextTick(() => {
          const b = this.$refs.simulationBuilder
          if (!b) {
            this.phase = 'input'
            this.$message.error('仿真构建面板未就绪，请重试')
            return
          }
          b.init(allNodes)
          b.confirmStartBuild()
        })
      })
    },
    onBuildCancelled() {
      this.returnToParsedInput()
    },
    onBackToEdit() {
      this.returnToParsedInput()
    },
    returnToParsedInput() {
      const b = this.$refs.simulationBuilder
      if (b) {
        if (b.isActiveBuild && b.isActiveBuild()) {
          b.cancelBuildForLeave()
        } else if (b.teardownStream) {
          b.teardownStream()
        }
      }
      this.phase = 'input'
      this.buildUiMounted = false
      this.cachedProductDetail = null
      const panel = this.$refs.flowPanel
      if (panel) {
        panel.simulationPassed = false
        if (panel.onSimulationCanvasVisual) {
          panel.onSimulationCanvasVisual({ type: 'build', active: false })
          panel.onSimulationCanvasVisual({ type: 'clear' })
        }
      }
      this.syncFlowFromPanel()
      this.$nextTick(() => {
        if (panel && panel.scheduleCanvasReflow) {
          panel.scheduleCanvasReflow()
        }
      })
    },
    goPrepublish() {
      const b = this.$refs.simulationBuilder
      if (b && b.getProductViewModel) {
        this.cachedProductDetail = b.getProductViewModel()
      }
      this.phase = 'prepublish'
      this.prepublishDetailMinimized = true
    },
    backToEdit() {
      this.returnToParsedInput()
    },
    onBuildSuccess() {
      if (this.panel) this.panel.simulationPassed = true
    },
    onPublished() {},
    onCanvasVisual(payload) {
      if (this.panel && this.panel.onSimulationCanvasVisual) {
        this.panel.onSimulationCanvasVisual(payload)
      }
    },
    onScenarioParsedUpdate(scenarioParsed) {
      if (this.panel && this.panel.onScenarioParsedUpdate) {
        this.panel.onScenarioParsedUpdate(scenarioParsed)
      }
    },
    isActiveBuild() {
      const b = this.$refs.simulationBuilder
      return b && b.isActiveBuild && b.isActiveBuild()
    },
    cancelBuildForLeave() {
      const b = this.$refs.simulationBuilder
      if (b && b.cancelBuildForLeave) b.cancelBuildForLeave()
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.meta-app-build-shell {
  width: 100%;
  min-height: calc(100vh - 72px);
  height: auto;
  display: flex;
  flex-direction: column;
}

.wb-workbench-frame {
  flex: 0 0 auto;
  min-height: 0;
  overflow: visible;
}

.wb-panel-right {
  :deep(.ef-workbench-root) {
    height: 100%;
    border: 0;
    box-shadow: none;
    overflow: hidden;
  }

  :deep(.wb-stage-header) {
    overflow: visible;
    z-index: 5;
  }
}

// smart_chat 默认 width:30vw，须限制在左栏宽度内
.wb-chat-host {
  :deep(.chat-container--workbench) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  :deep(.chat-output) {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: none !important;
  }

  :deep(.chat-input) {
    flex: 0 0 auto;
    flex-shrink: 0;
  }

  :deep(.chat-message) {
    width: auto;
    max-width: 70%;
  }

  :deep(.user-message),
  :deep(.bot-message) {
    width: auto;
    max-width: 70%;
  }

  :deep(.agent-message-wrapper) {
    width: 70% !important;
    max-width: 70% !important;
    min-width: 0;
    align-self: flex-start;
  }

  :deep(.agent-message-container) {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
