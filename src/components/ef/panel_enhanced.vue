<template>
  <div v-if="easyFlowVisible" :style="containerStyle" :class="{ 'ef-workbench-root': workbenchMode }">
    <!-- 工具栏 - 可选显示（workbench 模式用 stage-header） -->
    <el-row v-if="showToolbar && !workbenchMode">
      <el-col :span="24">
        <div class="ef-tooltar-enhanced">
          <div class="toolbar-left">
            <h4 class="toolbar-title">
              <a-icon type="appstore" style="color: #1890ff; margin-right: 8px;" />
              {{ data.preName || '新元应用' }}
            </h4>
          </div>
          <div class="toolbar-center">
            <a-space>
              <div class="simulation-btn-wrapper">
                <a-button
                  type="primary"
                  shape="round"
                  icon="play-circle"
                  :disabled="simulationChromeLocked"
                  @click="simulationBuild"
                >
                  开始仿真构建
                </a-button>
                <transition name="tips-float">
                  <div v-if="hasServiceNodes && !simulationPassed && !simulationEntryTipDismissed" class="simulation-tips-float">
                    <span>看起来还行？进入仿真构建环节</span>
                    <div class="tips-arrow"></div>
                  </div>
                </transition>
              </div>
              <!-- 预发布按钮已整合到仿真构建弹窗内 -->
              <!-- <a-tooltip :title="simulationPassed ? '' : '请先完成仿真构建'">
                <a-button
                  shape="round"
                  icon="rocket"
                  :disabled="!simulationPassed"
                  :class="{ 'success-button': simulationPassed }"
                  @click="previewAndPublish"
                >
                  元应用预览与发布
                </a-button>
              </a-tooltip> -->
            </a-space>
          </div>
          <div class="toolbar-right">
            <a-space>
              <a-tooltip title="下载元应用配置">
                <a-button shape="circle" icon="download" @click="exportMetaApp" :disabled="toolbarDisabled" />
              </a-tooltip>
              <a-tooltip title="导入元应用配置">
                <a-button shape="circle" icon="import" @click="importMetaApp" :disabled="toolbarDisabled" :loading="importLoading" />
              </a-tooltip>
              <a-tooltip title="元应用详情">
                <a-button shape="circle" :disabled="toolbarDisabled" icon="file-text" @click="showDataInfo" />
              </a-tooltip>
              <a-tooltip title="清空服务">
                <a-button
                  type="danger"
                  shape="circle"
                  icon="delete"
                  :disabled="toolbarDisabled || !hasServiceNodes"
                  @click="confirmClearCanvasServices"
                />
              </a-tooltip>
              <a-tooltip title="添加服务">
                <a-button type="primary" :disabled="toolbarDisabled" shape="circle" icon="plus" @click="addServices" />
              </a-tooltip>
            </a-space>
          </div>
        </div>
      </el-col>
    </el-row>

    <div
      class="ef-main-container"
      :class="{
        'ef-main--simulation': simulationBuilderVisible && !workbenchMode,
        'ef-main--workbench': workbenchMode
      }"
      :style="mainContainerStyle"
    >
      <!-- 仿真构建：非 workbench 时左栏 -->
      <div v-if="!workbenchMode && simulationBuilderVisible" class="ef-simulation-pane">
        <simulation-builder
          ref="simulationBuilder"
          :service-nodes="data.nodeList"
          :app-name="metaAppDisplayNameForSimulation"
          :app-id="data.name || 'meta-app-draft'"
          :domain="verticalType"
          :scenario-description="simulationScenarioText"
          :scenario-parsed="data.scenarioParsed || {}"
          @success="handleSimulationSuccess"
          @prePublish="previewAndPublish"
          @canvas-visual="onSimulationCanvasVisual"
          @scenario-parsed-update="onScenarioParsedUpdate"
          @close="simulationBuilderVisible = false"
        />
      </div>

      <!-- 左侧服务菜单 -->
      <div v-if="showSidebar && !workbenchMode && !simulationBuilderVisible" class="ef-sidebar">
        <div v-if="loadingServices" class="loading-overlay">
          <a-spin size="large" tip="正在选择服务"/>
        </div>
        <node-menu @addNode="addNode" ref="nodeMenu" :menu-list="services" />
      </div>

      <!-- workbench 右栏：stage-header + 画布 + 详情侧栏 -->
      <div v-if="workbenchMode" class="wb-panel-right-inner">
        <div class="wb-stage-header">
          <div class="wb-stage-title">
            <div class="wb-mark"><span></span><span></span><span></span><span></span></div>
            <span class="wb-stage-name">{{ data.preName || '新元应用' }}</span>
            <a-tooltip
              v-if="data.preDes"
              :title="data.preDes"
              placement="bottomLeft"
              overlay-class-name="wb-des-tooltip"
            >
              <a-icon type="info-circle" class="wb-des-hint" />
            </a-tooltip>
          </div>
          <div class="wb-entry-wrap">
            <button
              type="button"
              class="wb-top-entry-btn"
              :disabled="!workbenchShowBuildEntry"
              :class="{ 'wb-top-entry-btn--hidden': !workbenchShowBuildEntry }"
              @click="$emit('start-build')"
            >
              <a-icon type="play-circle" /> 开始仿真构建
            </button>
          </div>
          <div class="wb-toolbar">
            <a-space :size="6">
              <a-tooltip title="下载元应用配置">
                <span class="wb-toolbar-btn-wrap">
                  <a-button
                    shape="circle"
                    icon="download"
                    :disabled="workbenchDownloadDisabled"
                    @click="exportMetaApp"
                  />
                </span>
              </a-tooltip>
              <a-tooltip title="导入元应用配置">
                <span class="wb-toolbar-btn-wrap">
                  <a-button
                    shape="circle"
                    icon="import"
                    :disabled="workbenchImportDisabled"
                    :loading="importLoading"
                    @click="importMetaApp"
                  />
                </span>
              </a-tooltip>
              <a-tooltip title="元应用详情">
                <span class="wb-toolbar-btn-wrap">
                  <a-button
                    shape="circle"
                    icon="file-text"
                    :disabled="workbenchDataInfoDisabled"
                    @click="showDataInfo"
                  />
                </span>
              </a-tooltip>
              <a-tooltip title="清空服务">
                <span class="wb-toolbar-btn-wrap">
                  <a-button
                    type="danger"
                    shape="circle"
                    icon="delete"
                    :disabled="workbenchClearDisabled"
                    @click="confirmClearCanvasServices"
                  />
                </span>
              </a-tooltip>
              <a-tooltip title="添加服务">
                <span class="wb-toolbar-btn-wrap">
                  <a-button
                    type="primary"
                    shape="circle"
                    icon="plus"
                    :disabled="workbenchAddServiceDisabled"
                    @click="addServices"
                  />
                </span>
              </a-tooltip>
            </a-space>
          </div>
        </div>

        <div class="wb-stage-body">
          <div class="wb-canvas-zone">
            <div v-if="showWorkbenchLockOverlay" class="wb-canvas-overlay">
              <div class="wb-overlay-card">
                <div class="wb-overlay-big"><a-icon type="star" /></div>
                <strong>请先在左侧输入元应用的需求，或通过右上方按钮导入已有的元应用</strong>
              </div>
            </div>
            <div
              id="efContainer"
              ref="efContainer"
              class="ef-canvas"
              :class="simulationCanvasClasses"
              :style="workbenchCanvasStyle"
            >
              <div v-if="loadingFlow" class="loading-overlay">
                <div class="meta-app-loading">
                  <a-spin size="large" />
                  <span class="meta-app-loading-text">正在生成元应用</span>
                </div>
              </div>
              <div v-if="connectionLabel.visible"
                   class="connection-hover-label"
                   :class="`label-${connectionLabel.type}`"
                   :style="{
                     left: connectionLabel.x + 'px',
                     top: connectionLabel.y + 'px'
                   }">
                {{ connectionLabel.text }}
              </div>
              <flow-node-enhanced
                v-for="node in workbenchCanvasNodes"
                :key="node.id"
                :node="node"
                :app-name="metaAppDisplayNameForSimulation"
                :sim-visual="simulationVisualForNode(node)"
                :chrome-locked="workbenchChromeLocked"
                @nodeRightMenu="nodeRightMenu"
                @deleteNode="deleteNode"
                :style="canvasNodeStyle(node)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 非 workbench：原有画布（只读展示时套 wb-canvas-zone，与仿真构建页同源） -->
      <div
        v-else
        :class="standaloneWorkbenchCanvas ? 'wb-canvas-zone' : 'ef-legacy-canvas-host'"
      >
        <div
          id="efContainer"
          ref="efContainer"
          class="ef-canvas"
          :class="simulationCanvasClasses"
        >
          <div v-if="loadingFlow" class="loading-overlay">
            <div class="meta-app-loading">
              <a-spin size="large" />
              <span class="meta-app-loading-text">正在加载元应用</span>
            </div>
          </div>
          <div class="canvas-grid"></div>
          <div v-if="connectionLabel.visible"
               class="connection-hover-label"
               :class="`label-${connectionLabel.type}`"
               :style="{
                 left: connectionLabel.x + 'px',
                 top: connectionLabel.y + 'px'
               }">
            {{ connectionLabel.text }}
          </div>
          <flow-node-enhanced
            v-for="node in data.nodeList"
            :key="node.id"
            :node="node"
            :app-name="metaAppDisplayNameForSimulation"
            :sim-visual="simulationVisualForNode(node)"
            :chrome-locked="simulationChromeLocked"
            @nodeRightMenu="nodeRightMenu"
            @deleteNode="deleteNode"
            :style="canvasNodeStyle(node)"
          />
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />

    <!-- 弹窗部分 -->
    <info-display-enhanced
      v-if="flowInfoVisible"
      ref="flowInfo"
      @app-data-updated="handleAppDataUpdate"
    />
    <services-adder
      v-if="servicesAdderVisible"
      ref="servicesAdder"
      :title="service_text_map[verticalType]"
      :vertical-type="verticalType"
      :initialSelectedItems="currentCanvasServices"
      @confirm="handleServiceConfirm"
      @close="handleServiceClose"
    />
  </div>
</template>

<script>
/* eslint-disable */

import { easyFlowMixin } from '@/components/ef/mixins'
import flowNodeEnhanced from '@/components/ef/node_enhanced'
import nodeMenu from '@/components/ef/node_menu_enhanced'
import InfoDisplayEnhanced from '@/components/ef/info_display_enhanced'
import ServicesAdder from '@/components/ef/services_adder'
import SimulationBuilder from '@/components/ef/simulation_builder'
import {
  SERVICE_TEXT_MAP,
  hasLine,
  hashOppositeLine,
  statusFilter,
  statusStyleFilter,
  parseInitialFlow,
  syncNodesToServices,
  createDefaultFlowData,
  prepareDataForReload,
  transformNodesForDisplay,
  removeServiceById,
  transformServicesToNodes,
  transformServicesToServiceItems,
  extractCanvasServices,
  getBaseServiceNodes,
  buildMetaAppExportData,
  createServiceIdEncoder,
  sanitizeExportData,
  checkCompatibility
} from './utils'
import dictionaryCache from '@/utils/dictionaryCache'

/** 真实构建 SSE start/end 常同帧到达；至少展示时长对齐 mock 间隔 */
const SERVICE_CALL_VIS_MIN_MS = 720

export default {
  props: {
    initialFlow: {
      type: Object,
      default: () => ({}),
    },
    initialServices: {
      type: Array,
      default: () => []
    },
    loadingServices: {
      type: Boolean,
      default: false
    },
    loadingFlow: {
      type: Boolean,
      default: false
    },
    verticalType: {
      type: String,
      required: true
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    showSidebar: {
      type: Boolean,
      default: true
    },
    workbenchMode: {
      type: Boolean,
      default: false
    },
    workbenchPhase: {
      type: String,
      default: 'input'
    },
    buildEntryReady: {
      type: Boolean,
      default: false
    },
    workbenchStageHeight: {
      type: Number,
      default: 0
    }
  },
  computed: {
    containerStyle() {
      return {
        height: this.workbenchMode ? '100%' : (this.showToolbar ? 'calc(100vh)' : '100%')
      }
    },
    mainContainerStyle() {
      if (this.workbenchMode) {
        return { height: '100%', minHeight: 0, width: '100%' }
      }
      return {
        height: this.showToolbar ? 'calc(100% - 65px)' : '100%'
      }
    },
    workbenchCanvasStyle() {
      if (!this.workbenchMode) return {}
      const headerH = 52
      const canvasH = this.workbenchStageHeight > headerH
        ? this.workbenchStageHeight - headerH
        : 420
      return {
        minHeight: `${canvasH}px`,
        height: `${canvasH}px`
      }
    },
    workbenchToolbarDisabled() {
      return this.loadingFlow || this.workbenchPhase === 'build'
    },
    workbenchImportDisabled() {
      return this.loadingFlow || this.loadingServices || this.workbenchPhase === 'build'
    },
    workbenchDownloadDisabled() {
      return this.workbenchToolbarDisabled || !this.hasServiceNodes
    },
    workbenchDataInfoDisabled() {
      return (
        this.loadingFlow ||
        this.loadingServices ||
        this.workbenchPhase === 'build' ||
        !this.hasServiceNodes
      )
    },
    workbenchClearDisabled() {
      return (
        this.workbenchToolbarDisabled ||
        this.workbenchPhase === 'build' ||
        !this.hasServiceNodes
      )
    },
    workbenchAddServiceDisabled() {
      return this.workbenchToolbarDisabled || this.workbenchPhase === 'build'
    },
    workbenchShowBuildEntry() {
      return this.buildEntryReady && this.workbenchPhase === 'input'
    },
    workbenchChromeLocked() {
      return this.workbenchPhase === 'build'
    },
    canvasPhaseTitle() {
      if (this.workbenchPhase === 'build') return '智能体调度视图'
      if (this.buildEntryReady) return '场景与服务能力视图'
      return '元应用智能体视图'
    },
    canvasPhaseDesc() {
      if (this.workbenchPhase === 'input' && !this.buildEntryReady) {
        return '当前尚未完成想定场景解析，请在左侧完成想定输入。'
      }
      if (this.buildEntryReady && this.workbenchPhase === 'input') {
        return '中间为大画布，右侧为当前场景栏；顶部中间为仿真构建入口。'
      }
      return '画布展示服务调度关系，下方详细信息展示轮次、轨迹与证据。'
    },
    /** 无服务节点时显示引导遮罩（与 phase 无关）；有服务后展示智能体与服务 */
    showWorkbenchLockOverlay() {
      if (!this.workbenchMode) return false
      if (this.loadingFlow || this.loadingServices) return false
      return !this.hasServiceNodes
    },
    /** workbench 无服务时不渲染节点（遮罩态），避免 jsPlumb 绑定到 display:none 元素 */
    workbenchCanvasNodes() {
      if (!this.workbenchMode) return this.data.nodeList
      if (!this.hasServiceNodes) return []
      return this.data.nodeList
    },
    // 从当前画布节点中提取服务信息，用于标记已选中的服务
    currentCanvasServices() {
      return extractCanvasServices(
        this.data.nodeList,
        (status) => statusFilter(status, this.statusDict),
        (status) => statusStyleFilter(status, this.statusStyleDict)
      )
    },
    // 检查画布上是否有服务节点（排除智能体节点）
    hasServiceNodes() {
      return this.data.nodeList.filter(node => node.name !== 'metaAppAgent').length > 0
    },
    /** 仿真构建进行时画布的步骤 / 阶段 class，用于连线与背景动效 */
    simulationCanvasClasses() {
      const sc = this.simulationCanvas
      if (!sc.active) return {}
      const o = {
        'sim-build-active': true
      }
      if (sc.step != null && sc.step !== '') o[`sim-build-step-${sc.step}`] = true
      const p = sc.simulatePhase
      if (p && p.phase && p.status) o[`sim-phase-${p.phase}-${p.status}`] = true
      return o
    },
    simulationChromeLocked() {
      return this.simulationBuilderVisible
    },
    toolbarDisabled() {
      return this.loadingFlow || this.simulationChromeLocked
    },
    /**
     * 仿真构建用：当前展示名称（`data.preName`；演示分流见 `meta_apps_data`）。
     */
    metaAppDisplayNameForSimulation() {
      return this.data.preName || ''
    },
    /** 仿真用完整想定摘要；preDes 仅作用户可改备注 */
    simulationScenarioText() {
      return this.data.scenarioSummary || this.data.preDes || ''
    },
    /** 只读展示（如元应用运行页）：复用 workbench 的 wb-canvas-zone 画布样式 */
    standaloneWorkbenchCanvas() {
      return !this.workbenchMode && !this.showToolbar && !this.showSidebar
    }
  },
  data() {
    return {
      jsPlumb: null,
      easyFlowVisible: true,
      flowInfoVisible: false,
      servicesAdderVisible: false,
      simulationBuilderVisible: false,
      simulationBuilding: false,
      simulationPassed: false,
      /** 点击「开始仿真构建」并成功打开面板后，不再显示「试试仿真构建」类浮层提示 */
      simulationEntryTipDismissed: false,
      loadEasyFlowFinish: false,
      importLoading: false,
      fileSelectionInProgress: false,
      nodePositionsCalculated: false,
      services: [],
      statusDict: [],
      statusStyleDict: [],
      service_text_map: SERVICE_TEXT_MAP,
      data: {
        name: '新元应用',
        preName: '元应用名称',
        preDes: '以支持独立运行和柔性集成的大模型智能体为软件载体的最小粒度应用',
        scenarioSummary: '',
        scenarioParsed: null,
        preInputName: '输入内容',
        preOutputName: '输出内容',
        inputType: 0,
        outputType: 0,
        nodeList: [],
        lineList: []
      },
      connectionLabel: {
        visible: false,
        text: '',
        x: 0,
        y: 0,
        type: ''
      },
      /** 仿真构建与画布联动（由 simulation_builder 的 canvas-visual 驱动） */
      simulationCanvas: {
        active: false,
        step: null,
        nodes: {},
        simulatePhase: null
      },
      isTesting: false,
      intervalId: null,
      jsplumbSetting: {
        Connector: ["Bezier", { curviness: 60 }],
        Anchors: ["TopCenter", "RightMiddle", "BottomCenter", "LeftMiddle"],
        Overlays: [],
        PaintStyle: {
          strokeWidth: 2.4,
          stroke: "#2a7de8",
          outlineStroke: "transparent",
          outlineWidth: 6,
          dashstyle: "0"
        },
        HoverPaintStyle: {
          strokeWidth: 5,
          stroke: "#722ed1",
          dashstyle: "0"
        },
        EndpointStyle: {
          fill: "#1890ff",
          outlineStroke: "transparent",
          outlineWidth: 3,
          radius: 6
        },
        EndpointHoverStyle: {
          fill: "#722ed1",
          radius: 8
        },
        MaxConnections: -1,
        ConnectionsDetachable: true,
        Container: null,
        DragOptions: {
          cursor: "pointer",
          zIndex: 2000
        }
      }
    }
  },
  mixins: [easyFlowMixin],
  components: {
    flowNodeEnhanced,
    nodeMenu,
    InfoDisplayEnhanced,
    ServicesAdder,
    SimulationBuilder
  },
  mounted() {
    this.loadDictionaryData()
    this.jsPlumb = jsPlumb.getInstance()
    this.setServices(this.initialServices)
    this.parseInitialFlowText()
    if (this.workbenchMode) {
      this.$nextTick(() => this.bindCanvasResizeObserver())
    }
  },
  beforeDestroy() {
    this._clearServiceCallVisualHold()
    this.unbindCanvasResizeObserver()
  },
  watch: {
    initialServices: {
      handler(newVal) {
        this.setServices(newVal)
      },
      deep: true
    },
    simulationBuilderVisible(val) {
      this.$emit('simulation-ui', { open: !!val })
      this.$nextTick(() => {
        if (this.jsPlumb) {
          this.jsPlumb.importDefaults({
            ...this.jsplumbSetting,
            ConnectionsDetachable: !val
          })
          this.jsPlumb.repaintEverything()
        }
      })
    },
    workbenchMode(val) {
      if (val) this.$nextTick(() => this.bindCanvasResizeObserver())
      else this.unbindCanvasResizeObserver()
    },
    hasServiceNodes(val, oldVal) {
      if (!this.workbenchMode || val === oldVal) return
      if (!val || !this.jsPlumb || !this.easyFlowVisible) return
      this.$nextTick(() => {
        this.calculateNodePositions()
        this.$nextTick(() => {
          this.loadEasyFlow()
        })
      })
    }
  },
  methods: {
    parseNodeCoord(value) {
      return Number.parseFloat(String(value || '0')) || 0
    },
    canvasNodeVisualTop(node) {
      const top = this.parseNodeCoord(node && node.top)
      if (!this.workbenchMode) return top
      return Math.max(8, top - 48)
    },
    canvasNodeStyle(node) {
      return {
        position: 'absolute',
        left: node.left,
        top: `${this.canvasNodeVisualTop(node)}px`,
        opacity: this.nodePositionsCalculated ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }
    },
    // 解析初始流程数据
    parseInitialFlowText() {
      const parsedFlow = parseInitialFlow(this.initialFlow, this.statusDict, this.statusStyleDict)
      if (parsedFlow) {
        // 同步初始节点到左侧服务列表
        const initNodes = parsedFlow.nodeList.filter(node => node.name !== 'metaAppAgent')
        this.syncInitialNodesToServices(initNodes)
        this.dataReload(parsedFlow)
      } else {
        this.dataReloadClear()
      }
    },
    setServices(serviceList) {
      this.services = serviceList
    },
    // 同步初始节点到左侧服务列表
    syncInitialNodesToServices(initialNodes) {
      const servicesList = syncNodesToServices(initialNodes, this.verticalType)
      if (servicesList.length > 0) {
        this.setServices(servicesList)
      }
    },
    // 彻底清理节点的 jsPlumb 连线和端点
    cleanupNodeConnections(nodeId) {
      try {
        console.log('开始清理节点连线:', nodeId)

        // 获取所有与该节点相关的连线
        const connections = this.jsPlumb.getConnections({
          source: nodeId
        }).concat(this.jsPlumb.getConnections({
          target: nodeId
        }))

        // 逐一删除连线
        connections.forEach(conn => {
          console.log('删除连线:', conn.sourceId, '->', conn.targetId)
          this.jsPlumb.deleteConnection(conn)
        })

        // 移除节点上的所有端点
        this.jsPlumb.removeAllEndpoints(nodeId)
        // 强制清理可能残留的DOM元素
        this.jsPlumb.remove(nodeId)

        console.log('节点连线清理完成:', nodeId)
      } catch (error) {
        console.error('清理节点连线时出错:', error)
      }
    },
    // 从服务列表中移除指定ID的服务
    removeFromServiceListById(serviceId) {
      const updatedServices = removeServiceById(this.services, serviceId)
      this.setServices(updatedServices)
    },

    // 自动布局算法
    calculateNodePositions(retryCount = 0) {
      const MAX_RETRY = 20
      if (!this.$refs.efContainer) {
        if (retryCount >= MAX_RETRY) return
        this.$nextTick(() => {
          this.calculateNodePositions(retryCount + 1)
        })
        return
      }
      const containerWidth = this.$refs.efContainer.clientWidth
      const containerHeight = this.$refs.efContainer.clientHeight
      if (containerWidth <= 0 || containerHeight <= 0) {
        if (retryCount >= MAX_RETRY) return
        setTimeout(() => {
          this.calculateNodePositions(retryCount + 1)
        }, 100)
        return
      }

      // 画布中心点 - 稍微上移一些以获得更好的视觉平衡
      const centerX = containerWidth / 2
      const centerY = containerHeight / 2 - 20  // 上移20px

      // 节点尺寸
      const nodeWidth = 160
      const nodeHeight = 60
      const spacing = 50 // 节点间距

      // 分离智能体和服务节点
      const agentNodes = this.data.nodeList.filter(node =>
        node.name === 'metaAppAgent'
      )
      const toolNodes = this.data.nodeList.filter(node =>
        node.name !== 'metaAppAgent'
      )

      // 智能体节点放在中心 - 如果有多个智能体，围绕中心分布
      if (agentNodes.length === 1) {
        // 单个智能体放在中心
        const node = agentNodes[0]
        const newLeft = (centerX - nodeWidth / 2) + 'px'
        const newTop = (centerY - nodeHeight / 2) + 'px'

        this.$set(node, 'left', newLeft)
        this.$set(node, 'top', newTop)
      } else if (agentNodes.length > 1) {
        // 多个智能体水平排列在中心
        const totalWidth = agentNodes.length * nodeWidth + (agentNodes.length - 1) * 20
        const startX = centerX - totalWidth / 2

        agentNodes.forEach((node, index) => {
          const newLeft = (startX + index * (nodeWidth + 20)) + 'px'
          const newTop = (centerY - nodeHeight / 2) + 'px'

          this.$set(node, 'left', newLeft)
          this.$set(node, 'top', newTop)
        })
      }

      // 服务节点围绕智能体分布
      if (toolNodes.length > 0) {
        // 使用更大的基础半径，让节点分布更远
        const baseRadius = Math.max(220, Math.min(containerWidth, containerHeight) / 3)

        // 根据节点数量定义特定的角度分布
        let angles = []

        switch (toolNodes.length) {
          case 1:
            // 1个节点：放在下方
            angles = [Math.PI/2]
            break
          case 2:
            // 2个节点：上下分布
            angles = [-Math.PI/2, Math.PI/2]
            break
          case 3:
            // 3个节点：优化的三角形分布，上方两个角更接近左右边缘
            angles = [Math.PI/2, 7*Math.PI/6, 11*Math.PI/6]  // 90°, 210°, 330°
            break
          case 4:
            // 4个节点：左上、右上、左下、右下（四角分布）
            angles = [-3*Math.PI/4, -Math.PI/4, 3*Math.PI/4, Math.PI/4]
            break
          case 5:
            // 5个节点：五边形分布
            angles = [-Math.PI/2, -Math.PI/2 + 2*Math.PI/5, -Math.PI/2 + 4*Math.PI/5,
                     -Math.PI/2 + 6*Math.PI/5, -Math.PI/2 + 8*Math.PI/5]
            break
          case 6:
            // 6个节点：六边形分布
            angles = [0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3]
            break
          default:
            // 多于6个节点：均匀圆形分布
            const angleStep = (2 * Math.PI) / toolNodes.length
            angles = Array.from({length: toolNodes.length}, (_, i) => i * angleStep - Math.PI/2)
            break
        }

        toolNodes.forEach((node, index) => {
          const angle = angles[index]
          const x = centerX + baseRadius * Math.cos(angle) - nodeWidth / 2
          const y = centerY + baseRadius * Math.sin(angle) - nodeHeight / 2

          // 智能边界检查：根据角度位置调整边距
          let leftMargin = 5, rightMargin = 5, topMargin = 5, bottomMargin = 5

          // 对于接近垂直边界的节点（正上、正下），使用更大的边距
          const absAngle = Math.abs(angle % (2 * Math.PI))
          const isNearVertical = Math.abs(Math.sin(angle)) > 0.8  // 接近垂直方向
          const isNearHorizontal = Math.abs(Math.cos(angle)) > 0.8  // 接近水平方向
          // 调整角落检测：包括四角和三角形的上方角落
          const isCorner = (Math.abs(Math.sin(angle)) > 0.5 && Math.abs(Math.cos(angle)) >= 0.5) ||  // 标准四角
                          (Math.abs(Math.sin(angle)) > 0.7 && Math.abs(Math.cos(angle)) > 0.3)   // 三角形的上方角落
          // 专门检测三角形的上方角落（主要受左右边距影响）
          const isUpperCorner = Math.sin(angle) < -0.7 && Math.abs(Math.cos(angle)) > 0.3  // 上方角落

          if (isNearVertical) {
            topMargin = bottomMargin = 15  // 垂直方向需要更多边距
          } else if (isNearHorizontal) {
            leftMargin = rightMargin = 5  // 水平方向适中边距
          } else if (isUpperCorner) {
            // 三角形上方角落：左右边距最小，上下边距适中
            leftMargin = rightMargin = 2
            topMargin = bottomMargin = 8
          } else if (isCorner) {
            // 其他四角节点使用最小边距
            leftMargin = rightMargin = topMargin = bottomMargin = 3
          }

          const newLeft = Math.max(leftMargin, Math.min(x, containerWidth - nodeWidth - rightMargin)) + 'px'
          const newTop = Math.max(topMargin, Math.min(y, containerHeight - nodeHeight - bottomMargin)) + 'px'

          // 使用Vue.set确保响应式更新
          this.$set(node, 'left', newLeft)
          this.$set(node, 'top', newTop)

          console.log(`服务节点 ${node.name} 角度:${(angle * 180 / Math.PI).toFixed(1)}° 位置:`, node.left, node.top)
        })
      }

      // 强制Vue响应式更新
      this.$forceUpdate()

      // 确保DOM更新后重绘连线
      this.$nextTick(() => {
        console.log('位置更新完成')
        this.nodePositionsCalculated = true  // 位置计算完成，显示节点
        if (this.jsPlumb && this.loadEasyFlowFinish) {
          this.jsPlumb.repaintEverything()
        }
      })
    },

    jsPlumbInit() {
      this.jsPlumb.ready(() => {
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        this.jsPlumb.setSuspendDrawing(false, true)

        // 延迟执行以确保DOM已渲染
        this.$nextTick(() => {
          // 等待更长时间确保DOM完全渲染
          setTimeout(() => {
            this.loadEasyFlow()
          }, 200)
        })
        // 连线创建事件 - 只在用户手动创建连线时触发
        this.jsPlumb.bind('connection', (evt) => {
          const from = evt.source.id
          const to = evt.target.id
          // 只有在流程加载完成且不存在该连线时才添加
          if (this.loadEasyFlowFinish && !hasLine(this.data, from, to)) {
            this.data.lineList.push({ from: from, to: to })
          }
        })

        this.jsPlumb.bind('connectionDetached', (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })

        this.jsPlumb.bind('connectionMoved', (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })

        // 连线验证
        this.jsPlumb.bind('beforeDrop', (evt) => {
          if (this.simulationBuilderVisible) {
            return false
          }
          const from = evt.sourceId
          const to = evt.targetId
          if (from === to) {
            this.$message.error('节点不能连接到自己')
            return false
          }
          if (hasLine(this.data, from, to)) {
            this.$message.error('该连接已存在')
            return false
          }
          if (hashOppositeLine(this.data, from, to)) {
            this.$message.warning('检测到反向连接，请确认流程逻辑')
            return true
          }
          return true
        })

        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },

    // 加载流程
    loadEasyFlow() {
      const wireNodes = this.workbenchMode ? this.workbenchCanvasNodes : this.data.nodeList

      this.$nextTick(() => {
        if (wireNodes.length) {
          this.calculateNodePositions()
        }

        this.$nextTick(() => {
          if (!wireNodes.length) {
            this.loadEasyFlowFinish = true
            this.nodePositionsCalculated = true
            return
          }

          for (let i = 0; i < wireNodes.length; i++) {
            const node = wireNodes[i]
            if (!document.getElementById(node.id)) continue
            this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions)
            this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
          }

          this.loadEasyFlowFinish = false
          this.createAutoConnections()

          this.$nextTick(() => {
            this.loadEasyFlowFinish = true
            if (this.jsPlumb) this.jsPlumb.repaintEverything()
          })
        })
      })
    },

    // 自动创建连线：智能体与每个服务节点之间建立单向连线（agent → service）
    createAutoConnections() {
      this._purgeReturnConnectionData()

      const agentNodes = this.data.nodeList.filter(node =>
        node.name === 'metaAppAgent'
      )

      const toolNodes = this.data.nodeList.filter(node =>
        node.name !== 'metaAppAgent'
      )

      console.log('创建自动连线 - 智能体节点:', agentNodes.length, '服务节点:', toolNodes.length)

      agentNodes.forEach(agentNode => {
        toolNodes.forEach(toolNode => {
          this.createAutoConnection(agentNode.id, toolNode.id, 'call')
        })
      })

      console.log('自动连线创建完成，总连线数:', this.data.lineList.length)
      this._normalizeBoundLinks()
    },

    _removeConnectionArrows(conn) {
      if (!conn || typeof conn.getOverlays !== 'function') return
      const overlays = conn.getOverlays() || {}
      Object.keys(overlays).forEach((id) => {
        const overlay = overlays[id]
        if (overlay && String(overlay.type).toLowerCase() === 'arrow') {
          conn.removeOverlay(id)
        }
      })
    },

    _normalizeBoundLinks() {
      if (!this.jsPlumb) return
      const conns = this.jsPlumb.getConnections() || []
      conns.forEach((conn) => {
        if (!this._isAgentToServiceConnection(conn)) return
        this._removeConnectionArrows(conn)
        conn.setPaintStyle({
          strokeWidth: 2.4,
          stroke: '#2a7de8',
          outlineStroke: 'transparent',
          outlineWidth: 6,
          dashstyle: '0'
        })
      })
    },

    _isReturnLine(line) {
      if (!line) return false
      if (line.type === 'return') return true
      const fromNode = this.data.nodeList.find(n => n.id === line.from)
      const toNode = this.data.nodeList.find(n => n.id === line.to)
      return fromNode?.name !== 'metaAppAgent' && toNode?.name === 'metaAppAgent'
    },

    _purgeReturnConnectionData() {
      const lines = this.data.lineList || []
      lines.filter(line => this._isReturnLine(line)).forEach(line => {
        if (!this.jsPlumb) return
        const conns = this.jsPlumb.getConnections({ source: line.from, target: line.to }) || []
        conns.forEach(conn => this.jsPlumb.deleteConnection(conn))
      })
      this.data.lineList = lines.filter(line => !this._isReturnLine(line))
    },

    // 创建自动连线（不触发事件）
    createAutoConnection(from, to, type = 'call') {
      try {
        // 检查是否已存在相同类型的连线
        const existingLine = this.data.lineList.find(line =>
          line.from === from && line.to === to && line.type === type
        );
        if (existingLine) {
          console.log(`连线已存在: ${type} ${from} -> ${to}`)
          return;
        }

        const sourceNode = this.data.nodeList.find(n => n.id === from);
        const targetNode = this.data.nodeList.find(n => n.id === to);
        const isFromAgent = sourceNode?.name === 'metaAppAgent';
        const isToAgent = targetNode?.name === 'metaAppAgent';

        let paintStyle;
        let label = '';

        if (isFromAgent && !isToAgent) {
          paintStyle = {
            strokeWidth: 2.4,
            stroke: '#2a7de8',
            outlineStroke: 'transparent',
            outlineWidth: 6,
            dashstyle: '0'
          }
          label = '已绑定可调度'
        } else if (!isFromAgent && isToAgent) {
          // 服务 -> 智能体（返回）
          paintStyle = {
            strokeWidth: 3,
            stroke: "#52c41a",
            outlineStroke: "transparent",
            outlineWidth: 6,
            dashstyle: "0"
          };
          label = '获取服务调用结果';
        } else {
          // 默认样式
          paintStyle = this.jsplumbSetting.PaintStyle;
        }

        const conn = this.jsPlumb.connect({
          source: from,
          target: to,
          paintStyle,
          overlays: []
        })

        if (conn && isFromAgent && !isToAgent) {
          this._removeConnectionArrows(conn)
        }

        // 为连线添加悬停事件
        if (conn) {
          // 存储标签信息到连线上
          conn.labelText = label;
          conn.connectionType = type;

          // 添加鼠标事件
          conn.canvas.addEventListener('mouseenter', (e) => {
            this.showConnectionLabel(conn, e);
          });

          conn.canvas.addEventListener('mouseleave', () => {
            this.hideConnectionLabel();
          });
        }

        // 添加到连线列表
        this.data.lineList.push({
          from,
          to,
          type: type,
          label: label
        });

        console.log(`创建${type}连线: ${sourceNode?.name} -> ${targetNode?.name}`)

        return conn;
      } catch (error) {
        console.error('创建自动连线失败:', from, '->', to, error);
        return null;
      }
    },

    // 设置连线标签
    setLineLabel(from, to, label) {
      let conn = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]
      if (!label || label === '') {
        conn.removeClass('flowLabel')
        conn.addClass('emptyFlowLabel')
      } else {
        conn.addClass('flowLabel')
      }
      conn.setLabel({
        label: label
      })
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label
        }
      })
    },

    deleteLine(from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false
        }
        return true
      })
    },
    changeLine(oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },
    addNode(evt, nodeMenu) {
      const nodeId = nodeMenu.id
      let node = {
        id: nodeMenu.id,
        name: nodeMenu.name,
        left: '0px',  // 初始位置，后续会自动计算
        top: '0px'
      }
      this.data.nodeList.push(node)
      // 重新计算所有节点位置
      this.$nextTick(() => {
        this.calculateNodePositions()
        this.$nextTick(() => {
          this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
          this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)

          // 自动连接到智能体
          const agentNode = this.data.nodeList.find(n => n.name === 'metaAppAgent')
          if (agentNode && agentNode.id !== nodeId) {
            // 等待 DOM 更新后再创建连线
            this.$nextTick(() => {
              this.createAutoConnection(agentNode.id, node.id, 'call')
              // 再次等待连线创建完成后重绘
              this.$nextTick(() => {
                this.jsPlumb.repaintEverything()
              })
            })
          }
        })
      })
      this.$message.success(`添加${node.name}成功`)
      this.$nextTick(() => this.emitFlowSynced())
    },

    deleteNode(nodeId) {
      const node = this.data.nodeList.find(n => n.id === nodeId)
      this.$confirm(`确定要删除节点"${node?.name}"吗?`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        // 先彻底清理 jsPlumb 相关的连线和端点
        this.cleanupNodeConnections(nodeId)

        // 从画布节点列表中删除
        this.data.nodeList = this.data.nodeList.filter(n => n.id !== nodeId)

        // 删除相关连线数据
        this.data.lineList = this.data.lineList.filter(line =>
          line.from !== nodeId && line.to !== nodeId
        )

        // 同步更新左侧服务列表（排除智能体节点）
        if (node && node.name !== 'metaAppAgent') {
          console.log('删除服务节点，ID:', node.id, '名称:', node.name, '节点信息:', node)
          this.removeFromServiceListById(node.id)
        }

        this.$nextTick(() => {
          // 重新计算剩余节点位置
          this.calculateNodePositions()
          this.$nextTick(() => {
            // 强制重绘所有连线
            this.jsPlumb.repaintEverything()
          })
        })
        this.$message.success('节点删除成功')
        this.$nextTick(() => this.emitFlowSynced())
      }).catch(() => {
      })
      return true
    },

    nodeRightMenu(nodeId, evt) {
      if (this.simulationBuilderVisible) return
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything() {
      this.jsPlumb.repaint()
    },
    showDataInfo() {
      const nodes = this.data.nodeList || []
      const canShow = nodes.length > 1 || (this.workbenchMode && nodes.length > 0 && this.data.preName)
      if (canShow) {
        this.flowInfoVisible = true
        this.$nextTick(() => {
          const filteredInfo = transformNodesForDisplay(this.data.nodeList, this.data.preName, this.data.preDes)
          if (this.$refs.flowInfo) this.$refs.flowInfo.init(filteredInfo)
        })
      } else {
        this.$message.error('请先智能生成应用或添加服务！')
      }
    },
    emitFlowSynced() {
      if (!this.workbenchMode) return
      this.$emit('flow-synced', prepareDataForReload(this.data))
    },
    dataReload(data) {
      this.easyFlowVisible = false
      this.nodePositionsCalculated = false  // 重置节点位置计算状态
      this.data = createDefaultFlowData()
      this.$nextTick(() => {
        const preparedData = prepareDataForReload(data)
        this.easyFlowVisible = true
        this.data = preparedData
        this.emitFlowSynced()
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
            if (this.workbenchMode) {
              this.$nextTick(() => this.bindCanvasResizeObserver())
            }
          })
        })
      })
    },
    onScenarioParsedUpdate(scenarioParsed) {
      if (!scenarioParsed || typeof scenarioParsed !== 'object') return
      this.data.scenarioParsed = scenarioParsed
    },
    applyScenarioIntake(payload) {
      if (!payload) return
      if (payload.scenarioSummary) {
        this.data.scenarioSummary = payload.scenarioSummary
      }
      if (payload.scenarioParsed) {
        this.data.scenarioParsed = payload.scenarioParsed
      }
      if (payload.userRemark) {
        this.data.preDes = payload.userRemark
      }
      this.emitFlowSynced()
    },
    updateInitialFlow(newFlow) {
      console.log('updateInitialFlow 被调用，newFlow:', newFlow)
      // 导入新流程后需要重新进行仿真验证
      this.simulationPassed = false
      const parsedFlow = parseInitialFlow(newFlow, this.statusDict, this.statusStyleDict)
      if (parsedFlow) {
        if (newFlow.scenarioSummary) {
          parsedFlow.scenarioSummary = newFlow.scenarioSummary
        }
        if (newFlow.scenarioParsed) {
          parsedFlow.scenarioParsed = newFlow.scenarioParsed
        }
        // 同步初始节点到左侧服务列表
        const initNodes = parsedFlow.nodeList.filter(node => node.name !== 'metaAppAgent')
        this.syncInitialNodesToServices(initNodes)
        this.dataReload(parsedFlow)
      } else {
        console.log('解析流程失败，使用默认数据')
        this.dataReloadClear()
      }
    },
    dataReloadClear() {
      // 重置服务列表为基础状态，根据verticalType决定根节点名称
      this.setServices(getBaseServiceNodes(this.verticalType))
      // 重置仿真状态
      this.simulationPassed = false

      // 创建默认数据，包含智能体节点
      const defaultData = createDefaultFlowData()
      this.dataReload(defaultData)
    },

    confirmClearCanvasServices() {
      if (this.toolbarDisabled) return
      this.$confirm(
        '将移除当前所有服务节点，左侧对话记录会保留。',
        '清空画布服务？',
        {
          confirmButtonText: '清空',
          cancelButtonText: '取消',
          confirmButtonClass: 'el-button--danger',
          type: 'warning',
          closeOnClickModal: false
        }
      ).then(() => {
        this.dataReloadClear()
      }).catch(() => {})
    },
    async loadDictionaryData() {
      try {
        // 加载字典缓存
        this.statusDict = await dictionaryCache.loadDict('status') || []
        this.statusStyleDict = await dictionaryCache.loadDict('status_style') || []
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载数据字典失败，请刷新重试')
        // 确保所有数组初始化，防止undefined错误
        this.statusDict = this.statusDict || []
        this.statusStyleDict = this.statusStyleDict || []
      }
    },

    handleServiceConfirm(selectedServices) {
      // 添加节点
      const addedNodes = transformServicesToNodes(selectedServices, this.statusDict, this.statusStyleDict)
      const addedNodeIds = []

      addedNodes.forEach(node => {
        this.data.nodeList.push(node)
        addedNodeIds.push(node.id)
        console.log('添加MCP服务节点:', node)
      })

      // 更新服务列表 - 将新服务添加到现有菜单类别的children中
      const newServiceItems = transformServicesToServiceItems(selectedServices, this.statusDict, this.statusStyleDict)

      // 确保有默认的菜单结构
      if (this.services.length === 0) {
        this.setServices([{
          id: 'rootNode',
          name: this.service_text_map[this.verticalType],
          children: newServiceItems
        }])
      } else {
        // 添加到第一个菜单类别的children中
        const updatedServices = [...this.services]
        if (updatedServices[0]) {
          updatedServices[0] = {
            ...updatedServices[0],
            children: [...(updatedServices[0].children || []), ...newServiceItems]
          }
        }
        this.setServices(updatedServices)
      }

      // 重新布局并创建连线
      this.$nextTick(() => {
        this.calculateNodePositions()

        this.$nextTick(() => {
          // 为新节点设置jsPlumb
          addedNodeIds.forEach(nodeId => {
            this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
            this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
          })

          // 为新节点创建连线到智能体
          const agentNode = this.data.nodeList.find(n => n.name === 'metaAppAgent')
          if (agentNode) {
            // 等待 DOM 更新后再创建连线
            this.$nextTick(() => {
              addedNodeIds.forEach(nodeId => {
                this.createAutoConnection(agentNode.id, nodeId, 'call')
              })

              // 再次等待连线创建完成后重绘
              this.$nextTick(() => {
                this.jsPlumb.repaintEverything()
              })
            })
          } else {
            this.$nextTick(() => {
              this.jsPlumb.repaintEverything()
            })
          }
        })
      })

      this.$message.success(`成功添加${selectedServices.length}个MCP服务`)
    },
    handleServiceClose() {
      this.servicesAdderVisible = false
    },
    addServices() {
      this.servicesAdderVisible = true
      this.$nextTick(() => {
        this.$refs.servicesAdder.init()
      })
    },
    // 仿真构建
    simulationBuild() {
      if (this.data.nodeList.length > 1) {
        this.simulationEntryTipDismissed = true
        this.simulationBuilderVisible = true
        this.$nextTick(() => {
          this.$refs.simulationBuilder.init(this.data.nodeList)
        })
      } else {
        this.$message.error('请先智能生成应用或添加服务！')
      }
    },
    // 仿真构建成功回调
    handleSimulationSuccess(result) {
      console.log('仿真构建成功:', result)
      this.simulationPassed = true
    },
    // 元应用预览与发布
    previewAndPublish() {
      this.$emit('pre-publish')
    },
    scheduleCanvasReflow() {
      this.$nextTick(() => {
        window.setTimeout(() => {
          if (!this.$refs.efContainer) return
          this.calculateNodePositions()
          this.$nextTick(() => {
            if (this.jsPlumb) this.jsPlumb.repaintEverything()
          })
        }, 340)
      })
    },
    bindCanvasResizeObserver() {
      if (!this.workbenchMode) return
      this.unbindCanvasResizeObserver()
      const el = this.$refs.efContainer
      if (!el || typeof ResizeObserver === 'undefined') return
      this._lastCanvasW = 0
      this._lastCanvasH = 0
      this._canvasResizeObs = new ResizeObserver(() => {
        if (!this.nodePositionsCalculated || this._canvasLayoutBusy) return
        const w = el.clientWidth
        const h = el.clientHeight
        if (!w || !h) return
        if (w === this._lastCanvasW && h === this._lastCanvasH) return
        this._lastCanvasW = w
        this._lastCanvasH = h
        if (this._canvasResizeRaf) cancelAnimationFrame(this._canvasResizeRaf)
        this._canvasResizeRaf = requestAnimationFrame(() => {
          this._canvasLayoutBusy = true
          try {
            this.calculateNodePositions()
            if (this.jsPlumb) this.jsPlumb.repaintEverything()
          } finally {
            this._canvasLayoutBusy = false
          }
        })
      })
      this._canvasResizeObs.observe(el)
    },
    unbindCanvasResizeObserver() {
      if (this._canvasResizeRaf) {
        cancelAnimationFrame(this._canvasResizeRaf)
        this._canvasResizeRaf = null
      }
      if (this._canvasResizeObs) {
        this._canvasResizeObs.disconnect()
        this._canvasResizeObs = null
      }
    },
    showConnectionLabel(conn, event) {
      const rect = this.$refs.efContainer.getBoundingClientRect();
      this.connectionLabel = {
        visible: true,
        text: conn.labelText,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 30, // 上移30px
        type: conn.connectionType
      };
    },
    hideConnectionLabel() {
      this.connectionLabel.visible = false;
    },
    // 处理元应用数据更新
    handleAppDataUpdate(newData) {
      // 更新画布数据
      this.data.preName = newData.name
      this.data.preDes = newData.des
      // 强制更新Vue响应式数据
      this.$forceUpdate()
      this.$message.success('元应用信息已更新')
    },
    // 导出元应用数据
    exportMetaApp() {
      if (this.data.nodeList.length <= 1) {
        this.$message.error('请先智能生成应用或添加服务！')
        return
      }

      this.$confirm('下载的配置可用于在本系统中导入相同配置的元应用。是否确认下载？', '下载确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        try {
          // 构建导出数据结构
          const exportData = this.buildExportData()
          // 生成文件名
          const fileName = `${this.data.preName || '元应用'}_${new Date().toISOString().split('T')[0]}.json`
          // 下载文件
          this.downloadJsonFile(exportData, fileName)

          this.$message.success('元应用配置下载成功！')
        } catch (error) {
          console.error('导出失败:', error)
          this.$message.error('下载失败，请重试')
        }
      }).catch(() => {})
    },

    // 构建导出数据结构
    buildExportData() {
      const encoder = createServiceIdEncoder()
      const exportData = buildMetaAppExportData(this.data, this.verticalType, encoder)

      // 应用安全处理，移除敏感信息
      return sanitizeExportData(exportData)
    },

    // 下载JSON文件
    downloadJsonFile(data, fileName) {
      const jsonStr = JSON.stringify(data, null, 2)
      const dataUrl = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr)

      const downloadLink = document.createElement('a')
      downloadLink.setAttribute('href', dataUrl)
      downloadLink.setAttribute('download', fileName)
      downloadLink.click()
      downloadLink.remove()
    },

    // 导入元应用数据
    importMetaApp() {
      this.importLoading = true
      this.$confirm('导入将会替换当前的元应用，确定要继续吗？', '导入确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 设置文件选择取消检测
        this.setupFileSelectionCancelDetection()
        // 触发文件选择
        this.$refs.fileInput.click()
      }).catch(() => {
        this.importLoading = false
      })
    },

    // 设置文件选择取消检测
    setupFileSelectionCancelDetection() {
      // 设置一个标志位表示文件选择正在进行
      this.fileSelectionInProgress = true

      // 监听窗口焦点事件，当用户从文件选择器返回时触发
      const handleWindowFocus = () => {
        // 延迟检查，确保change事件有机会触发
        setTimeout(() => {
          if (this.fileSelectionInProgress) {
            // 如果文件选择仍在进行中，说明用户取消了选择
            this.importLoading = false
            this.fileSelectionInProgress = false
            console.log('文件选择被取消，重置loading状态')
          }
        }, 100)
        // 移除事件监听器
        window.removeEventListener('focus', handleWindowFocus)
      }
      // 添加窗口焦点事件监听器
      window.addEventListener('focus', handleWindowFocus)
    },

    // 处理文件导入
    handleFileImport(event) {
      // 标记文件选择完成
      this.fileSelectionInProgress = false

      const file = event.target.files[0]

      // 如果没有选择文件（用户点击取消），重置loading状态
      if (!file) {
        this.importLoading = false
        event.target.value = ''
        return
      }

      // 验证文件类型
      if (!file.name.endsWith('.json')) {
        this.$message.error('请选择JSON格式的文件')
        this.importLoading = false
        event.target.value = ''
        return
      }

      try {
        this.readFileContent(file).then((fileContent) => {
          const importData = JSON.parse(fileContent)
          // 数据完整性和兼容性检查
          const compatibility = checkCompatibility(importData, this.verticalType)
          if (compatibility.errors.length > 0) {
            this.$notification.error({
              message: '数据存在问题，导入失败',
              description: `${compatibility.errors.join('\n')}`,
              // 支持换行
              style: {
                whiteSpace: 'pre-wrap'
              }
            })
            this.importLoading = false
            return
          }
          if (compatibility.warnings.length > 0) {
            this.$notification.warning({
              message: '数据存在问题，将尝试继续导入',
              description: `${compatibility.warnings.join('\n')}`,
              // 支持换行
              style: {
                whiteSpace: 'pre-wrap',
              }
            })
          }
          this.$message.info('开始导入元应用数据...')
          // 处理导入数据
          this.processImportData(importData)
        }).catch((error) => {
          console.error('文件读取失败:', error)
          this.$message.error('文件读取失败，请重试')
          this.importLoading = false
        })
      } catch (error) {
        console.error('导入失败:', error)
        this.$message.error('文件解析失败，请检查文件格式')
        this.importLoading = false
      } finally {
        // 清空文件输入
        event.target.value = ''
      }
    },
    // 读取文件内容
    readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.onerror = () => reject(new Error(reader.error && reader.error.message ? reader.error.message : '文件读取失败'))
        reader.readAsText(file)
      })
    },
    // 处理导入数据
    processImportData(importData) {
      // 将导入请求发送给父组件处理
      this.$emit('import-request', importData)
      // 重置按钮loading状态（父组件会处理具体的loading状态）
      this.importLoading = false
    },
    onSimulationCanvasVisual(payload) {
      if (!payload || typeof payload !== 'object') return
      const { type } = payload
      if (type === 'clear') {
        this._clearServiceCallVisualHold()
        this.simulationCanvas = {
          active: false,
          step: null,
          nodes: {},
          simulatePhase: null
        }
        this._resetSimulationLinkVisual()
        return
      }
      if (type === 'build') {
        this.simulationCanvas.active = !!payload.active
        if (!payload.active) {
          this._clearServiceCallVisualHold()
          this.simulationCanvas.nodes = {}
          this.simulationCanvas.simulatePhase = null
          this.simulationCanvas.step = null
          this._resetSimulationLinkVisual()
        }
        return
      }
      if (type === 'step') {
        this.simulationCanvas.step = payload.step
        if (payload.step === 2 && this.simulationCanvas.active) {
          const nodes = this.data.nodeList || []
          nodes.forEach((n) => {
            if (n.name === 'metaAppAgent') return
            this.$set(this.simulationCanvas.nodes, String(n.id), 'dimmed')
          })
          this._applyServiceCallLinksIdle()
        }
        return
      }
      if (type === 'node') {
        this.$set(this.simulationCanvas.nodes, String(payload.id), payload.status)
        return
      }
      if (type === 'simulatePhase') {
        this.simulationCanvas.simulatePhase = {
          phase: payload.phase,
          status: payload.status
        }
        return
      }
      if (type === 'serviceCall') {
        this._enqueueServiceCallEvent(payload)
      }
    },
    _ensureServiceCallVisual() {
      if (!this._serviceCallVisual) {
        this._serviceCallVisual = {
          events: [],
          playing: false,
          playTimer: null,
          activeNodeId: null
        }
      }
      return this._serviceCallVisual
    },
    _clearServiceCallVisualHold() {
      const hold = this._serviceCallVisual
      if (!hold) return
      if (hold.playTimer) {
        clearTimeout(hold.playTimer)
        hold.playTimer = null
      }
      hold.events = []
      hold.playing = false
      hold.activeNodeId = null
    },
    _enqueueServiceCallEvent(payload) {
      if (!payload || !payload.serviceId) return
      const hold = this._ensureServiceCallVisual()
      hold.events.push({
        serviceId: String(payload.serviceId),
        status: payload.status
      })
      this._drainServiceCallQueue()
    },
    _drainServiceCallQueue() {
      const hold = this._ensureServiceCallVisual()
      if (hold.playing) return

      while (hold.events.length && hold.events[0].status === 'end') {
        hold.events.shift()
      }
      if (!hold.events.length) return

      const startEv = hold.events.shift()
      if (!startEv || startEv.status !== 'start') return

      const nodeId = startEv.serviceId
      if (
        hold.events.length &&
        hold.events[0].status === 'end' &&
        hold.events[0].serviceId === nodeId
      ) {
        hold.events.shift()
      }

      hold.playing = true
      hold.activeNodeId = nodeId
      this._showServiceCallStart(nodeId)

      hold.playTimer = setTimeout(() => {
        hold.playTimer = null
        hold.playing = false
        hold.activeNodeId = null
        this._showServiceCallEnd(nodeId)
        this._drainServiceCallQueue()
      }, SERVICE_CALL_VIS_MIN_MS)
    },
    _showServiceCallStart(nodeId) {
      const nodes = this.data.nodeList || []
      nodes.forEach((n) => {
        if (n.name === 'metaAppAgent') return
        const nid = String(n.id)
        this.$set(this.simulationCanvas.nodes, nid, nid === nodeId ? 'calling' : 'dimmed')
      })
      this._applyServiceCallLinkFocus(nodeId)
      this.$nextTick(() => {
        if (this.jsPlumb) this.jsPlumb.repaintEverything()
      })
    },
    _showServiceCallEnd(nodeId) {
      this.$set(this.simulationCanvas.nodes, String(nodeId), 'dimmed')
      this._applyServiceCallLinksIdle()
      this.$nextTick(() => {
        if (this.jsPlumb) this.jsPlumb.repaintEverything()
      })
    },
    _isAgentToServiceConnection(conn) {
      const src = (this.data.nodeList || []).find((n) => n.id === conn.sourceId)
      const tgt = (this.data.nodeList || []).find((n) => n.id === conn.targetId)
      return src && tgt && src.name === 'metaAppAgent' && tgt.name !== 'metaAppAgent'
    },
    _stripSimulationLinkClasses(conn) {
      conn.removeClass('sim-link-calling')
      conn.removeClass('sim-link-dimmed')
    },
    _applyServiceCallLinkFocus(callingNodeId) {
      if (!this.jsPlumb) return
      const targetId = String(callingNodeId)
      const conns = this.jsPlumb.getConnections() || []
      conns.forEach((conn) => {
        this._stripSimulationLinkClasses(conn)
        if (!this._isAgentToServiceConnection(conn)) return
        if (String(conn.targetId) === targetId) {
          conn.addClass('sim-link-calling')
        } else {
          conn.addClass('sim-link-dimmed')
        }
      })
    },
    _applyServiceCallLinksIdle() {
      if (!this.jsPlumb) return
      const sc = this.simulationCanvas
      const inDispatch = sc.active && sc.step != null && sc.step >= 2
      const conns = this.jsPlumb.getConnections() || []
      conns.forEach((conn) => {
        this._stripSimulationLinkClasses(conn)
        if (inDispatch && this._isAgentToServiceConnection(conn)) {
          conn.addClass('sim-link-dimmed')
        }
      })
    },
    _resetSimulationLinkVisual() {
      if (!this.jsPlumb) return
      const conns = this.jsPlumb.getConnections() || []
      conns.forEach((conn) => {
        this._stripSimulationLinkClasses(conn)
      })
    },
    simulationVisualForNode(node) {
      const sc = this.simulationCanvas
      if (!sc.active) return { active: false }
      const id = String(node.id)
      const isAgent = node.name === 'metaAppAgent'
      const sp = sc.simulatePhase || {}
      let status = sc.nodes[id]
      if (!isAgent && status == null && sc.step != null && sc.step < 2) {
        status = 'checking'
      } else if (!isAgent && status == null && sc.step != null && sc.step >= 2) {
        status = 'dimmed'
      }
      return {
        active: true,
        step: sc.step,
        status: isAgent ? null : status,
        phase: isAgent ? sp.phase : null,
        phaseStatus: isAgent ? sp.status : null
      }
    }
  }
}
</script>

<style lang="less" scoped>
/* 全局连线样式增强 */
/deep/ .jtk-connector {
  z-index: 4;
  transition: all 0.32s ease;
}

/deep/ .jtk-connector:hover {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}

/* 绑定连线：无箭头 */
/deep/ .jtk-connector .jtk-overlay.jtk-arrow,
/deep/ .jtk-connector .jtk-overlay-arrow {
  display: none !important;
}

/* 仿真构建：正在调用的连线为蓝色虚线流动，其余置灰 */
/deep/ .jtk-connector.sim-link-calling path,
/deep/ svg.jtk-connector.sim-link-calling path {
  stroke: #1677ff !important;
  stroke-width: 3.4 !important;
  opacity: 1 !important;
  stroke-dasharray: 10 9;
  animation: sim-link-flow 1.25s linear infinite;
  filter: drop-shadow(0 0 6px rgba(22, 119, 255, 0.28));
}
/deep/ .jtk-connector.sim-link-dimmed path,
/deep/ svg.jtk-connector.sim-link-dimmed path {
  stroke-width: 2.2 !important;
  opacity: 0.38 !important;
  stroke: #d8e0ea !important;
  stroke-dasharray: none !important;
  animation: none !important;
  filter: none !important;
}
@keyframes sim-link-flow {
  to { stroke-dashoffset: -38; }
}

/deep/ .jtk-endpoint {
  transition: all 0.3s ease;
}

/deep/ .jtk-endpoint:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* 连线标签样式增强 */
/deep/ .jtk-overlay.flowLabel:not(.aLabel) {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  position: relative;
}

/* 连线悬停标签样式 */
.connection-hover-label {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  pointer-events: none;
  white-space: nowrap;
  transform: translateX(-50%);
  animation: labelFadeIn 0.2s ease forwards;
}

.connection-hover-label.label-call {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes labelFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

// 工具栏样式
.ef-tooltar-enhanced {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%);
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.toolbar-left {
  flex: 1;
}

.toolbar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
}

.toolbar-center {
  flex: 2;
  display: flex;
  justify-content: center;

  // 仿真构建按钮包装器
  .simulation-btn-wrapper {
    position: relative;
    display: inline-block;
  }

  // 浮动提示样式
  .simulation-tips-float {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #389e0d;
    padding: 8px 14px;
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
    border: 1px solid #b7eb8f;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(82, 196, 26, 0.15);
    white-space: nowrap;
    z-index: 100;

    // 指向按钮的箭头
    .tips-arrow {
      position: absolute;
      bottom: -6px;
      left: 50%;
      width: 10px;
      height: 10px;
      background: #d9f7be;
      border-right: 1px solid #b7eb8f;
      border-bottom: 1px solid #b7eb8f;
      transform: translateX(-50%) rotate(45deg);
    }
  }

  // 浮动提示动画
  .tips-float-enter-active,
  .tips-float-leave-active {
    transition: all 0.3s ease;
  }

  .tips-float-enter,
  .tips-float-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }

  // 成功按钮样式（仿真通过后的预发布按钮）
  .success-button {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%) !important;
    border-color: #52c41a !important;
    color: #fff !important;

    &:hover {
      background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%) !important;
      border-color: #73d13d !important;
    }

    &:active {
      background: linear-gradient(135deg, #389e0d 0%, #237804 100%) !important;
      border-color: #389e0d !important;
    }
  }
}

.toolbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

// 主容器
.ef-main-container {
  display: flex;
  height: calc(100% - 65px);
  position: relative;
}

/* 仿真构建与画布左右并排（构建在左） */
.ef-main-container.ef-main--simulation {
  align-items: stretch;
  min-height: 0;
}

.ef-simulation-pane {
  /* 不用 CSS min()，避免 less 把 min 当内置函数解析 */
  flex: 0 0 40vw;
  min-width: 360px;
  max-width: 640px;
  border-right: 1px solid #e8e8e8;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

// 左侧边栏
.ef-sidebar {
  width: 260px;
  background: #fafafa;
  border-right: 1px solid #e8e8e8;
  position: relative;
  overflow-y: auto;
  flex-shrink: 0;
}

// 画布区域
.ef-canvas {
  flex: 1;
  position: relative;
  background: #f8f9fa;
  overflow: hidden !important;  // 防止滚动
  min-width: 0;
}

.ef-legacy-canvas-host {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 仿真构建进行时：背景网格轻微呼吸，突出「流水线」感 */
.ef-canvas.sim-build-active .canvas-grid {
  animation: sim-canvas-grid-pulse 3.5s ease-in-out infinite;
}

@keyframes sim-canvas-grid-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.72;
  }
}

/* 阶段二（智能体调度仿真）：连线动画由 service_calling 事件单独控制（sim-link-calling/dimmed） */

/* 阶段零/一：连线略提亮，无强流动 */
.ef-canvas.sim-build-active.sim-build-step-0 /deep/ svg.jtk-connector path,
.ef-canvas.sim-build-active.sim-build-step-1 /deep/ svg.jtk-connector path {
  filter: drop-shadow(0 0 2px rgba(24, 144, 255, 0.45));
}

// 网格背景
.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}

// 加载遮罩
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
}

.meta-app-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 180px;
  padding: 14px 18px;
  color: #1f2f46;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(31, 47, 70, 0.12);

  /deep/ .ant-spin {
    line-height: 1;
  }

  /deep/ .ant-spin-dot {
    margin: 0;
  }
}

.meta-app-loading-text {
  display: inline-block;
  white-space: nowrap;
}

// 响应式设计
@media (max-width: 1200px) {
  .ef-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .ef-tooltar-enhanced {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    flex: none;
    width: 100%;
    justify-content: center;
  }

  .ef-sidebar {
    width: 200px;
  }
}

@import './meta_app_build/simulation-workbench.less';

.ef-workbench-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.ef-main--workbench {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wb-panel-right-inner {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.wb-toolbar-btn-wrap {
  display: inline-flex;
  line-height: 0;
}

</style>

<style lang="less">
.wb-des-tooltip .ant-tooltip-inner {
  max-width: 420px;
  white-space: pre-wrap;
  text-align: left;
  line-height: 1.55;
}
</style>
