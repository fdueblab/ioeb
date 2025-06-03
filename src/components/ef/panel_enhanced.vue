<template>
  <div v-if="easyFlowVisible" style="height: calc(100vh);">
    <el-row>
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
              <a-tooltip title="添加工具">
                <a-button type="primary" ghost shape="circle" icon="plus" @click="addServices" />
              </a-tooltip>
            </a-space>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="ef-main-container">
      <!-- 左侧工具栏 -->
      <div class="ef-sidebar">
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

        <!-- 节点渲染 -->
        <template v-for="node in data.nodeList">
          <flow-node-enhanced
            :key="node.id"
            :node="node"
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
            @deleteNode="deleteNode"
            :style="{
              position: 'absolute',
              left: node.left,
              top: node.top,
              zIndex: 5,
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
      :title="services[0]?.name"
      :initialSelectedItems="services[0]?.children"
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
import nodeMenu from '@/components/ef/node_menu_with_input'
import FlowInfo from '@/components/ef/info'
import ServicesAdder from '@/components/ef/services_adder'
import MetaAppBuilder from '@/components/ef/meta_app_builder'
import lodash from 'lodash'
import { getDataNew } from './data_new'

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
          strokeWidth: 4,
          stroke: "#722ed1",
          dashstyle: "4 2"
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
      if (!this.initialFlow || !this.initialFlow.nodeList || !this.initialFlow.lineList) {
        this.dataReloadClear()
        return
      }

      try {
        const parsedData = this.initialFlow
        this.dataReload(parsedData);
      } catch (error) {
        console.error('Failed to get initial flow', error)
        this.dataReloadClear()
      }
    },
    setServices(serviceList) {
      this.services = serviceList
    },

    // 自动布局算法
    calculateNodePositions() {
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

      // 分离智能体和工具节点
      const agentNodes = this.data.nodeList.filter(node =>
        node.name === 'metaAppAgent' || node.type === 'start'
      )
      const toolNodes = this.data.nodeList.filter(node =>
        node.name !== 'metaAppAgent' && node.type !== 'start'
      )

      console.log('智能体节点:', agentNodes)
      console.log('工具节点:', toolNodes)

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

      // 工具节点围绕智能体分布
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

          console.log(`工具节点 ${node.name} 角度:${(angle * 180 / Math.PI).toFixed(1)}° 位置:`, node.left, node.top)
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
            this.$message.success('连接创建成功')
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
      console.log('连线数量:', this.data.lineList.length)

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

          // 初始化连线
          for (let i = 0; i < this.data.lineList.length; i++) {
            const line = this.data.lineList[i];
            console.log('创建连线:', line.from, '->', line.to)

            // 检查是否是智能体连接
            const sourceNode = this.data.nodeList.find(n => n.id === line.from);
            const targetNode = this.data.nodeList.find(n => n.id === line.to);
            const isAgentConnection = sourceNode?.name === 'metaAppAgent' || targetNode?.name === 'metaAppAgent';

            let connParam = {
              source: line.from,
              target: line.to,
              label: line.label ? line.label : '',
              connector: ["Bezier", { curviness: 60 }],
              anchors: line.anchors ? line.anchors : undefined,
              paintStyle: isAgentConnection ? {
                strokeWidth: 4,
                stroke: "#722ed1",
                outlineStroke: "transparent",
                outlineWidth: 8,
                dashstyle: "0"
              } : this.jsplumbSetting.PaintStyle,
            };

            try {
              const conn = this.jsPlumb.connect(connParam, this.jsplumbConnectOptions);
              // 为智能体连接添加特效
              if (isAgentConnection) {
                conn.addClass('agent-connection');
              }
              console.log('连线创建成功:', line.from, '->', line.to)
            } catch (error) {
              console.error('连线创建失败:', line, error)
            }
          }

          this.$nextTick(() => {
            this.loadEasyFlowFinish = true;
            console.log('流程加载完成')
          });
        })
      })
    },

    // 创建连线的辅助方法，不触发事件
    createConnection(from, to, skipEvent = false) {
      const sourceNode = this.data.nodeList.find(n => n.id === from);
      const isAgentConnection = sourceNode?.name === 'metaAppAgent' || sourceNode?.type === 'start';

      try {
        const conn = this.jsPlumb.connect({
          source: from,
          target: to,
          paintStyle: isAgentConnection ? {
            strokeWidth: 4,
            stroke: "#722ed1",
            outlineStroke: "transparent",
            outlineWidth: 8,
            dashstyle: "0"
          } : this.jsplumbSetting.PaintStyle
        });

        if (isAgentConnection) {
          conn.addClass('agent-connection');
        }

        // 如果不跳过事件，则添加到lineList
        if (!skipEvent && !this.hasLine(from, to)) {
          this.data.lineList.push({ from, to });
        }

        return conn;
      } catch (error) {
        console.error('创建连线失败:', from, '->', to, error);
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

    addNode(evt, nodeMenu, mousePosition) {
      let nodeId = this.getUUID()
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
        type: nodeMenu.type || 'process',
        left: '0px',  // 初始位置，后续会自动计算
        top: '0px',
        state: 'success'
      }

      this.data.nodeList.push(node)

      // 重新计算所有节点位置
      this.$nextTick(() => {
        this.calculateNodePositions()
        this.$nextTick(() => {
          this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
          this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)

          // 自动连接到智能体
          const agentNode = this.data.nodeList.find(n => n.name === 'metaAppAgent' || n.type === 'start')
          if (agentNode && agentNode.id !== nodeId) {
            this.$nextTick(() => {
              this.createConnection(agentNode.id, nodeId, false)
              this.jsPlumb.repaintEverything()
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
        this.data.nodeList = this.data.nodeList.filter(function (node) {
          return node.id !== nodeId
        })

        // 删除相关连线
        this.data.lineList = this.data.lineList.filter(line =>
          line.from !== nodeId && line.to !== nodeId
        )

        this.$nextTick(() => {
          this.jsPlumb.removeAllEndpoints(nodeId)
          // 重新计算剩余节点位置
          this.calculateNodePositions()
          this.$nextTick(() => {
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
      this.dataReload(newFlow)
    },
    dataReloadClear() {
      this.dataReload(getDataNew())
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
    handleServiceConfirm(selectedItems) {
      // 修复添加工具功能 - 访问正确的children层级
      console.log('选中的服务项:', selectedItems)

      // 检查是否需要访问children.children
      let actualItems = selectedItems
      if (selectedItems.length > 0 && selectedItems[0].children) {
        // 如果第一级有children，展开所有children
        actualItems = []
        selectedItems.forEach(category => {
          if (category.children && Array.isArray(category.children)) {
            actualItems.push(...category.children)
          } else {
            actualItems.push(category)
          }
        })
      }

      console.log('实际要添加的工具:', actualItems)

      // 添加节点
      const addedNodeIds = []
      actualItems.forEach(item => {
        const nodeId = this.getUUID()
        const node = {
          id: nodeId,
          name: item.name || item.text || item.title || `工具${this.data.nodeList.length + 1}`,
          type: 'process',
          state: 'success'
        }
        this.data.nodeList.push(node)
        addedNodeIds.push(nodeId)
        console.log('添加节点:', node)
      })

      // 更新服务列表
      const childrenServices = [...(this.services[0]?.children || []), ...actualItems]
      this.setServices([{
        ...this.services[0],
        children: childrenServices
      }])

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
          const agentNode = this.data.nodeList.find(n => n.name === 'metaAppAgent' || n.type === 'start')
          if (agentNode) {
            addedNodeIds.forEach(nodeId => {
              if (!this.hasLine(agentNode.id, nodeId)) {
                this.createConnection(agentNode.id, nodeId, false)
              }
            })
          }

          this.$nextTick(() => {
            this.jsPlumb.repaintEverything()
          })
        })
      })

      this.$message.success(`成功添加${actualItems.length}个工具`)
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
    addExternalNode(node) {
      const nodeId = this.getUUID()
      const newNode = {
        id: nodeId,
        name: node.name,
        type: node.type,
        state: 'success'
      }

      this.data.nodeList.push(newNode)
      this.$nextTick(() => {
        this.calculateNodePositions()
        this.$nextTick(() => {
          this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
          this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
          this.$nextTick(() => {
            this.jsPlumb.repaintEverything()
          })
        })
      })
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
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/deep/ .jtk-endpoint {
  transition: all 0.3s ease;
}

/deep/ .jtk-endpoint:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* 智能体连接特效 */
/deep/ .agent-connection {
  stroke-dasharray: 8 4;
  animation: flow-animation 2s linear infinite;
  filter: drop-shadow(0 2px 6px rgba(114, 46, 209, 0.3));
}

@keyframes flow-animation {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 12;
  }
}

/* 连线标签样式增强 */
/deep/ .jtk-overlay.flowLabel:not(.aLabel) {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(114, 46, 209, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  position: relative;
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