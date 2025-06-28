<template>
  <div v-if="easyFlowVisible" :style="containerStyle">
    <!-- 工具栏 - 可选显示 -->
    <el-row v-if="showToolbar">
      <el-col :span="24">
        <div class="ef-tooltar-enhanced">
          <div class="toolbar-left">
            <h4 class="toolbar-title">
              <a-icon type="robot" style="color: #1890ff; margin-right: 8px;" />
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
              <a-tooltip title="导出流程数据">
                <a-button shape="circle" icon="download" @click="downloadData" />
              </a-tooltip>
              <a-tooltip title="智能体数据">
                <a-button shape="circle" icon="file-text" @click="dataInfo" />
              </a-tooltip>
              <a-tooltip title="重置元应用">
                <a-button shape="circle" icon="reload" @click="dataReloadClear" />
              </a-tooltip>
              <a-tooltip title="添加服务">
                <a-button type="primary" ghost shape="circle" icon="plus" @click="addServices" />
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
          <a-spin size="large" />
        </div>
        <node-menu @addNode="addNode" ref="nodeMenu" :menu-list="services" />
      </div>

      <!-- 主画布区域 -->
      <div id="efContainer" ref="efContainer" class="ef-canvas">
        <div v-if="loadingFlow" class="loading-overlay">
          <a-spin size="large" tip="正在加载流程...">
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
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
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

    <!-- 对话框和弹窗 -->
    <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data" />
    <services-adder
      v-if="servicesAdderVisible"
      ref="servicesAdder"
      :title="'领域MCP服务'"
      :vertical-type="verticalType"
      :initialSelectedItems="currentCanvasServices"
      @confirm="handleServiceConfirm"
      @close="handleServiceClose"
    />
    <meta-app-builder
      v-if="metaAppBuilderVisible"
      ref="metaAppBuilder"
      :vertical-type="verticalType"
      :input-type="data.inputType"
      :output-type="data.outputType"
      :pre-name="data.preName"
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
import FlowInfo from '@/components/ef/info'
import ServicesAdder from '@/components/ef/services_adder'
import MetaAppBuilder from '@/components/ef/meta_app_builder'
import { getBaseServiceNodes } from '@/mock/data/meta_apps_data'
import lodash from 'lodash'
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
      if (!this.data.nodeList || this.data.nodeList.length === 0) {
        return []
      }
      
      // 过滤出非智能体节点，并构建服务信息
      return this.data.nodeList
        .filter(node => node.name !== 'metaAppAgent')
        .map(node => ({
          id: node.originalId || node.serviceId || node.id, // 优先使用原始服务ID
          name: node.name,
          url: node.url,
          apiName: node.apiName,
          tools: node.tools || []
        }))
        .filter(service => service.id) // 确保有有效的ID
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
      nodePositionsCalculated: false,
      services: [],
      statusDict: [],
      statusStyleDict: [],
      data: {
        name: '新元应用',
        preName: '元应用名称',
        preInputName: '输入内容',
        preOutputName: '输出内容',
        inputType: 0,
        outputType: 0,
        nodeList: [],
        lineList: []
      },
      activeElement: {
        type: undefined,
        nodeId: undefined,
        sourceId: undefined,
        targetId: undefined
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
    FlowInfo,
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
    getUUID() {
      return Math.random().toString(36).substr(3, 10)
    },
    parseInitialFlowText() {
      if (!this.initialFlow || !this.initialFlow.nodeList) {
        this.dataReloadClear()
        return
      }

      try {
        const parsedData = this.initialFlow

        // 自动添加智能体节点
        const agentNode = {
          id: 'metaAppAgent_' + this.getUUID(),
          name: 'metaAppAgent',
          state: '待构建',
          stateStyle: 'default'
        }

        // 处理服务节点，确保它们有正确的服务ID信息
        const processedNodeList = parsedData.nodeList.map(node => {
          // 如果是服务节点且没有originalId，尝试设置服务ID
          if (node.name !== 'metaAppAgent' && !node.originalId) {
            return {
              ...node,
              // 如果节点有serviceId字段，使用它；否则尝试从节点ID提取或使用节点ID
              originalId: node.serviceId || node.id,
              serviceId: node.serviceId || node.id
            }
          }
          return node
        })

        // 清空位置信息和连线，后续自动生成
        const cleanData = {
          ...parsedData,
          nodeList: [agentNode, ...processedNodeList],
          lineList: [] // 清空连线，后续自动生成
        }

        this.dataReload(cleanData);
      } catch (error) {
        console.error('Failed to get initial flow', error)
        this.dataReloadClear()
      }
    },
    setServices(serviceList) {
      this.services = serviceList
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

    // 从服务列表中移除指定名称的服务（保留兼容性）
    removeFromServiceList(nodeName) {
      if (!this.services || this.services.length === 0) return

      // 递归函数来移除服务
      const removeFromChildren = (children) => {
        if (!children || !Array.isArray(children)) return children

        return children.filter(child => {
          if (child.name === nodeName) {
            console.log('从服务列表中移除:', nodeName)
            return false // 移除这个服务
          }

          // 如果有子节点，递归处理
          if (child.children) {
            child.children = removeFromChildren(child.children)
          }

          return true // 保留这个服务
        })
      }

      // 更新服务列表
      const updatedServices = this.services.map(rootService => ({
        ...rootService,
        children: removeFromChildren(rootService.children || [])
      }))

      this.setServices(updatedServices)
      console.log('更新后的服务列表:', updatedServices)
    },

    // 从服务列表中移除指定ID的服务
    removeFromServiceListById(serviceId) {
      if (!this.services || this.services.length === 0) return

      console.log('开始从服务列表中移除服务ID:', serviceId)

      // 递归函数来移除服务
      const removeFromChildren = (children) => {
        if (!children || !Array.isArray(children)) return children

        return children.filter(child => {
          if (child.id === serviceId) {
            console.log('从服务列表中移除服务:', child.name, 'ID:', serviceId)
            return false // 移除这个服务
          }

          // 如果有子节点，递归处理
          if (child.children) {
            child.children = removeFromChildren(child.children)
          }

          return true // 保留这个服务
        })
      }

      // 更新服务列表
      const updatedServices = this.services.map(rootService => ({
        ...rootService,
        children: removeFromChildren(rootService.children || [])
      }))

      this.setServices(updatedServices)
      console.log('更新后的服务列表:', updatedServices)
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

        // 点击连线事件
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
        })

        // 连线创建事件 - 只在用户手动创建连线时触发
        this.jsPlumb.bind('connection', (evt) => {
          const from = evt.source.id
          const to = evt.target.id
          // 只有在流程加载完成且不存在该连线时才添加
          if (this.loadEasyFlowFinish && !this.hasLine(from, to)) {
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
          if (this.hasLine(from, to)) {
            this.$message.error('该连接已存在')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
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
    changeNodeSite(data) {
      // 不再支持手动拖拽改变位置
      return
    },

    addNode(evt, nodeMenu) {
      // 生成唯一ID，避免重复ID导致的问题
      let nodeId = `${nodeMenu.id}_${this.getUUID()}`
      let origName = nodeMenu.name
      let nodeName = origName
      let index = 1

      while (index < 10000) {
        let repeat = false
        for (let i = 0; i < this.data.nodeList.length; i++) {
          const node = this.data.nodeList[i]
          if (node.name === nodeName) {
            nodeName = origName + index
            repeat = true
          }
        }
        if (repeat) {
          index++
          continue
        }
        break
      }

      let node = {
        id: nodeId,
        name: nodeName,
        originalId: nodeMenu.id, // 保留原始服务ID用于删除时匹配
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
              this.createAutoConnection(agentNode.id, nodeId, 'call')  // 智能体 -> 服务
              this.createAutoConnection(nodeId, agentNode.id, 'return') // 服务 -> 智能体

              // 再次等待连线创建完成后重绘
              this.$nextTick(() => {
                this.jsPlumb.repaintEverything()
              })
            })
          }
        })
      })

      this.$message.success(`已添加节点：${nodeName}`)
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
          // 使用服务的原始ID或者节点上存储的服务ID
          const serviceId = node.originalId || node.serviceId || node.id
          console.log('删除服务，使用ID:', serviceId, '节点信息:', node)
          this.removeFromServiceListById(serviceId)
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

    clickNode(nodeId) {
      this.activeElement.type = 'node'
      this.activeElement.nodeId = nodeId
    },
    hasLine(from, to) {
      for (let i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    hashOppositeLine(from, to) {
      return this.hasLine(to, from)
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
    dataInfo() {
      this.flowInfoVisible = true
      this.$nextTick(function () {
        this.$refs.flowInfo.init()
      })
    },
    dataReload(data) {
      this.easyFlowVisible = false
      this.nodePositionsCalculated = false  // 重置节点位置计算状态
      this.data = {
        name: '新元应用',
        preName: '元应用名称',
        preInputName: '输入内容',
        preOutputName: '输出内容',
        nodeList: [],
        lineList: []
      }
      this.$nextTick(() => {
        data = lodash.cloneDeep(data)
        // 清除输入数据中的位置信息
        if (data.nodeList) {
          data.nodeList.forEach(node => {
            delete node.left
            delete node.top
          })
        }
        this.easyFlowVisible = true
        this.data = data
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

      // 检查新流程是否已包含智能体节点
      const hasAgentNode = newFlow?.nodeList?.some(node =>
        node.name === 'metaAppAgent'
      )

      console.log('是否已有智能体节点:', hasAgentNode)

      if (!hasAgentNode && newFlow?.nodeList) {
        // 如果没有智能体节点，添加一个
        const agentNode = {
          id: 'metaAppAgent_' + this.getUUID(),
          name: 'metaAppAgent',
          type: 'start',
          state: '待构建',
          stateStyle: 'default'
        }

        console.log('添加智能体节点:', agentNode)

        const flowWithAgent = {
          ...newFlow,
          nodeList: [agentNode, ...newFlow.nodeList],
          lineList: [] // 清空连线，后续自动生成
        }

        console.log('带智能体的流程数据:', flowWithAgent)
        this.dataReload(flowWithAgent)
      } else {
        console.log('使用原始流程数据')
        this.dataReload(newFlow)
      }
    },
    dataReloadClear() {
      // 重置服务列表为基础状态，根据verticalType决定根节点名称
      this.setServices(getBaseServiceNodes(this.verticalType))

      // 创建默认数据，包含智能体节点
      const defaultData = {
        preName: '新元应用',
        nodeList: [
          {
            id: 'metaAppAgent_' + this.getUUID(),
            name: 'metaAppAgent',
            type: 'start',
            state: '待构建',
            stateStyle: 'default'
          }
        ],
        lineList: []
      }
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
    statusFilter(type) {
      if (type === undefined) {
        return '未知状态'
      }
      if (!this.statusDict || !Array.isArray(this.statusDict)) {
        return '未知状态'
      }
      const statusItem = this.statusDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : '未知状态'
    },
    statusStyleFilter(type) {
      if (type === undefined) {
        return 'default'
      }
      if (!this.statusStyleDict || !Array.isArray(this.statusStyleDict)) {
        return 'default'
      }
      const statusItem = this.statusStyleDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : 'default'
    },
    handleServiceConfirm(selectedServices) {
      // 添加节点
      const addedNodeIds = []
      selectedServices.forEach(service => {
        // 生成唯一ID，避免重复ID导致的问题
        const uniqueNodeId = `${service.id}_${this.getUUID()}`
        const node = {
          id: uniqueNodeId,
          name: service.name,
          originalId: service.id, // 保留原始服务ID用于删除时匹配
          url: service.url,
          apiName: service.apiName,
          tools: service.tools || [],
          state: this.statusFilter(service.status),
          stateStyle: this.statusStyleFilter(service.status)
        }
        this.data.nodeList.push(node)
        addedNodeIds.push(node.id)
        console.log('添加MCP服务节点:', node)
      })

      // 更新服务列表 - 将新服务添加到现有菜单类别的children中
      const newServiceItems = selectedServices.map(service => ({
        id: service.id,
        name: service.name,
        url: service.url,
        apiName: service.apiName,
        tools: service.tools,
        state: this.statusFilter(service.status),
        stateStyle: this.statusStyleFilter(service.status),
        children: service.tools ? service.tools.map(tool => ({
          name: tool.name,
          des: tool.des || tool.description || '',
          ...tool
        })) : []
      }))

      // 确保有默认的菜单结构
      if (this.services.length === 0) {
        this.setServices([{
          id: 'mcp_services',
          name: '领域MCP服务',
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
        this.$message.info('正在构建元应用...', 2)
        setTimeout(() => {
          this.buildingMetaApp = false
          this.metaAppBuilderVisible = true
          this.$message.success('构建完成！')
          this.$nextTick(() => {
            this.$refs.metaAppBuilder.init()
          })
        }, 2000)
      } else {
        this.$message.error('请先创建元应用流程！')
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