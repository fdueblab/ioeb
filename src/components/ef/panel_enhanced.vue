<template>
  <div v-if="easyFlowVisible" :style="containerStyle">
    <!-- 工具栏 - 可选显示 -->
    <el-row v-if="showToolbar">
      <el-col :span="24">
        <div class="ef-tooltar-enhanced">
          <div class="toolbar-left">
            <h4 class="toolbar-title">
              <a-icon type="appstore" style="color: #1890ff; margin-right: 8px;" />
              {{ data.preName || '新元应用' }}
            </h4>
          </div>
          <div class="toolbar-center">
            <a-button type="primary" shape="round" icon="build" @click="buildMetaApp" :loading="buildingMetaApp">
              构建为元应用
            </a-button>
          </div>
          <div class="toolbar-right">
            <a-space>
              <a-tooltip title="下载元应用配置">
                <a-button shape="circle" icon="download" @click="exportMetaApp" :disabled="loadingFlow" />
              </a-tooltip>
              <a-tooltip title="导入元应用配置">
                <a-button shape="circle" icon="import" @click="importMetaApp" :disabled="loadingFlow" :loading="importLoading" />
              </a-tooltip>
              <a-tooltip title="元应用详情">
                <a-button shape="circle" :disabled="loadingFlow" icon="file-text" @click="showDataInfo" />
              </a-tooltip>
              <a-tooltip title="重置元应用">
                <a-button shape="circle" :disabled="loadingFlow" icon="reload" @click="dataReloadClear" />
              </a-tooltip>
              <a-tooltip title="添加服务">
                <a-button type="primary" :disabled="loadingFlow" shape="circle" icon="plus" @click="addServices" />
              </a-tooltip>
            </a-space>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="ef-main-container" :style="mainContainerStyle">
      <!-- 左侧工具栏 - 可选显示 -->
      <div v-if="showSidebar" class="ef-sidebar">
        <div v-if="loadingServices" class="loading-overlay">
          <a-spin size="large" tip="正在选择服务"/>
        </div>
        <node-menu @addNode="addNode" ref="nodeMenu" :menu-list="services" />
      </div>

      <!-- 主画布区域 -->
      <div id="efContainer" ref="efContainer" class="ef-canvas">
        <div v-if="loadingFlow" class="loading-overlay">
          <a-spin size="large" tip="正在生成元应用">
            <div style="height: 200px;"></div>
          </a-spin>
        </div>

        <!-- 画布背景网格 -->
        <div class="canvas-grid"></div>

        <!-- 连线悬停标签 -->
        <div v-if="connectionLabel.visible"
             class="connection-hover-label"
             :class="`label-${connectionLabel.type}`"
             :style="{
               left: connectionLabel.x + 'px',
               top: connectionLabel.y + 'px'
             }">
          {{ connectionLabel.text }}
        </div>

        <!-- 节点渲染 -->
        <template v-for="node in data.nodeList">
          <flow-node-enhanced
            :key="node.id"
            :node="node"
            :app-name="data.preName"
            @nodeRightMenu="nodeRightMenu"
            @deleteNode="deleteNode"
            :style="{
              position: 'absolute',
              left: node.left,
              top: node.top,
              opacity: nodePositionsCalculated ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }"
          />
        </template>
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
    <meta-app-builder
      v-if="metaAppBuilderVisible"
      ref="metaAppBuilder"
      :vertical-type="verticalType"
      :pre-name="data.preName"
      :pre-des="data.preDes"
      :pre-input-name="data.preInputName"
      :pre-output-name="data.preOutputName"
      @close="metaAppBuilderVisible = false"
    />
  </div>
</template>

<script>
/* eslint-disable */

import draggable from 'vuedraggable'
import { easyFlowMixin } from '@/components/ef/mixins'
import flowNodeEnhanced from '@/components/ef/node_enhanced'
import nodeMenu from '@/components/ef/node_menu_enhanced'
import InfoDisplayEnhanced from '@/components/ef/info_display_enhanced'
import ServicesAdder from '@/components/ef/services_adder'
import MetaAppBuilder from '@/components/ef/meta_app_builder'
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
    }
  },
  computed: {
    containerStyle() {
      return {
        height: this.showToolbar ? 'calc(100vh)' : '100%'
      }
    },
    mainContainerStyle() {
      return {
        height: this.showToolbar ? 'calc(100% - 65px)' : '100%'
      }
    },
    // 从当前画布节点中提取服务信息，用于标记已选中的服务
    currentCanvasServices() {
      return extractCanvasServices(
        this.data.nodeList,
        (status) => statusFilter(status, this.statusDict),
        (status) => statusStyleFilter(status, this.statusStyleDict)
      )
    }
  },
  data() {
    return {
      jsPlumb: null,
      easyFlowVisible: true,
      flowInfoVisible: false,
      servicesAdderVisible: false,
      metaAppBuilderVisible: false,
      buildingMetaApp: false,
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
      isTesting: false,
      intervalId: null,
      jsplumbSetting: {
        Connector: ["Bezier", { curviness: 60 }],
        Anchors: ["TopCenter", "RightMiddle", "BottomCenter", "LeftMiddle"],
        PaintStyle: {
          strokeWidth: 3,
          stroke: "#1890ff",
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
    draggable,
    flowNodeEnhanced,
    nodeMenu,
    InfoDisplayEnhanced,
    ServicesAdder,
    MetaAppBuilder
  },
  mounted() {
    this.loadDictionaryData()
    this.jsPlumb = jsPlumb.getInstance()
    this.setServices(this.initialServices)
    this.parseInitialFlowText()
  },
  watch: {
    initialServices: {
      handler(newVal) {
        this.setServices(newVal)
      },
      deep: true
    },
  },
  methods: {
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
    calculateNodePositions() {
      console.log('=== calculateNodePositions 开始 ===')
      console.log('当前 data.nodeList:', JSON.stringify(this.data.nodeList, null, 2))
      // 确保容器存在并有正确尺寸
      if (!this.$refs.efContainer) {
        console.warn('画布容器未准备好，延迟执行布局')
        this.$nextTick(() => {
          this.calculateNodePositions()
        })
        return
      }
      const containerWidth = this.$refs.efContainer?.clientWidth || 800
      const containerHeight = this.$refs.efContainer?.clientHeight || 600
      // 如果容器尺寸为0，说明还没渲染完成
      if (containerWidth <= 0 || containerHeight <= 0) {
        console.warn('画布容器尺寸未准备好，延迟执行布局', containerWidth, containerHeight)
        setTimeout(() => {
          this.calculateNodePositions()
        }, 100)
        return
      }

      console.log('画布尺寸:', containerWidth, containerHeight)
      console.log('节点列表:', this.data.nodeList)

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

      console.log('智能体节点:', agentNodes)
      console.log('服务节点:', toolNodes)

      // 智能体节点放在中心 - 如果有多个智能体，围绕中心分布
      if (agentNodes.length === 1) {
        // 单个智能体放在中心
        const node = agentNodes[0]
        const newLeft = (centerX - nodeWidth / 2) + 'px'
        const newTop = (centerY - nodeHeight / 2) + 'px'

        this.$set(node, 'left', newLeft)
        this.$set(node, 'top', newTop)
        console.log(`智能体节点 ${node.name} 位置:`, node.left, node.top)
      } else if (agentNodes.length > 1) {
        // 多个智能体水平排列在中心
        const totalWidth = agentNodes.length * nodeWidth + (agentNodes.length - 1) * 20
        const startX = centerX - totalWidth / 2

        agentNodes.forEach((node, index) => {
          const newLeft = (startX + index * (nodeWidth + 20)) + 'px'
          const newTop = (centerY - nodeHeight / 2) + 'px'

          this.$set(node, 'left', newLeft)
          this.$set(node, 'top', newTop)
          console.log(`智能体节点 ${node.name} 位置:`, node.left, node.top)
        })
      }

      // 服务节点围绕智能体分布
      if (toolNodes.length > 0) {
        // 使用更大的基础半径，让节点分布更远
        const baseRadius = Math.max(220, Math.min(containerWidth, containerHeight) / 3)

        console.log('画布尺寸:', containerWidth, containerHeight)
        console.log('中心点:', centerX, centerY)
        console.log('基础半径:', baseRadius)

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
      console.log('开始加载流程，节点数量:', this.data.nodeList.length)

      // 先确保DOM已渲染，再计算节点位置
      this.$nextTick(() => {
        this.calculateNodePositions()

        // 等待位置更新后再设置jsPlumb
        this.$nextTick(() => {
          // 设置节点为连接源和目标
          for (let i = 0; i < this.data.nodeList.length; i++) {
            const node = this.data.nodeList[i];
            this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions);
            this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions);
          }

          // 暂时设置标志防止connection事件被触发
          this.loadEasyFlowFinish = false;

          // 自动创建智能体与服务节点之间的双向连线
          this.createAutoConnections();

          this.$nextTick(() => {
            this.loadEasyFlowFinish = true;
            console.log('流程加载完成')
          });
        })
      })
    },

    // 自动创建连线：智能体与每个服务节点之间建立双向连线
    createAutoConnections() {
      // 找到智能体节点
      const agentNodes = this.data.nodeList.filter(node =>
        node.name === 'metaAppAgent'
      )

      // 找到服务节点
      const toolNodes = this.data.nodeList.filter(node =>
        node.name !== 'metaAppAgent'
      )

      console.log('创建自动连线 - 智能体节点:', agentNodes.length, '服务节点:', toolNodes.length)

      // 为每个智能体节点与每个节点建立双向连线
      agentNodes.forEach(agentNode => {
        toolNodes.forEach(toolNode => {
          // 智能体 -> 服务（调用）
          this.createAutoConnection(agentNode.id, toolNode.id, 'call')
          // 服务 -> 智能体（返回）
          this.createAutoConnection(toolNode.id, agentNode.id, 'return')
        })
      })

      console.log('自动连线创建完成，总连线数:', this.data.lineList.length)
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
          // 智能体 -> 服务（调用）
          paintStyle = {
            strokeWidth: 3,
            stroke: "#1890ff",
            outlineStroke: "transparent",
            outlineWidth: 6,
            dashstyle: "0"
          };
          label = '调用MCP Server';
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
          paintStyle: paintStyle,
          overlays: [
            ["Arrow", {
              location: 1,
              width: 12,
              length: 12,
              foldback: 0.8
            }]
          ]
        });

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
              // 创建双向连线
              this.createAutoConnection(agentNode.id, node.id, 'call')  // 智能体 -> 服务
              this.createAutoConnection(node.id, agentNode.id, 'return') // 服务 -> 智能体
              // 再次等待连线创建完成后重绘
              this.$nextTick(() => {
                this.jsPlumb.repaintEverything()
              })
            })
          }
        })
      })
      this.$message.success(`添加${node.name}成功`)
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
      }).catch(() => {
      })
      return true
    },

    nodeRightMenu(nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything() {
      this.jsPlumb.repaint()
    },
    showDataInfo() {
      if (this.data.nodeList.length > 1) {
        this.flowInfoVisible = true
        this.$nextTick(function () {
          const filteredInfo = transformNodesForDisplay(this.data.nodeList, this.data.preName, this.data.preDes)
          this.$refs.flowInfo.init(filteredInfo)
        })
      } else {
        this.$message.error('请先智能生成应用或添加服务！')
      }
    },
    dataReload(data) {
      this.easyFlowVisible = false
      this.nodePositionsCalculated = false  // 重置节点位置计算状态
      this.data = createDefaultFlowData()
      this.$nextTick(() => {
        const preparedData = prepareDataForReload(data)
        this.easyFlowVisible = true
        this.data = preparedData
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    updateInitialFlow(newFlow) {
      console.log('updateInitialFlow 被调用，newFlow:', newFlow)
      const parsedFlow = parseInitialFlow(newFlow, this.statusDict, this.statusStyleDict)
      if (parsedFlow) {
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

      // 创建默认数据，包含智能体节点
      const defaultData = createDefaultFlowData()
      this.dataReload(defaultData)
    },
    downloadData() {
      this.$confirm('确定要下载流程数据吗？', '下载确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        closeOnClickModal: false
      }).then(() => {
        let datastr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, '\t'))
        let downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', datastr)
        downloadAnchorNode.setAttribute('download', `${this.data.name || 'flow'}.json`)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        this.$message.success('文件下载中...')
      }).catch(() => {
      })
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
                // 创建双向连线
                this.createAutoConnection(agentNode.id, nodeId, 'call')   // 智能体 -> 服务
                this.createAutoConnection(nodeId, agentNode.id, 'return') // 服务 -> 智能体
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
    buildMetaApp() {
      if (this.data.nodeList.length > 1) {
        this.buildingMetaApp = true
        this.$message.info('正在构建元应用...')
        // 提取服务ID列表（排除智能体节点）
        const serviceIds = this.data.nodeList
          .filter(node => node.name !== 'metaAppAgent')
          .map(node => node.id)
        setTimeout(() => {
          this.buildingMetaApp = false
          this.metaAppBuilderVisible = true
          this.$message.success('构建完成！')
          this.$nextTick(() => {
            this.$refs.metaAppBuilder.init(serviceIds)
          })
        }, 2000)
      } else {
        this.$message.error('请先智能生成应用或添加服务！')
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
        reader.onerror = e => reject(e)
        reader.readAsText(file)
      })
    },
    // 处理导入数据
    processImportData(importData) {
      // 将导入请求发送给父组件处理
      this.$emit('import-request', importData)
      // 重置按钮loading状态（父组件会处理具体的loading状态）
      this.importLoading = false
    }
  }
}
</script>

<style lang="less" scoped>
/* 全局连线样式增强 */
/deep/ .jtk-connector {
  z-index: 4;
  transition: all 0.3s ease;
}

/deep/ .jtk-connector:hover {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
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

.connection-hover-label.label-return {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
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
  overflow: hidden;  // 防止滚动
  min-width: 0;
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
</style>