<template>
  <div v-if="easyFlowVisible" style="height: calc(100vh);">
    <el-row>
      <el-col :span="24">
        <div class="ef-tooltar">
          <el-link type="primary" :underline="false">{{ data.name }}</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" icon="el-icon-delete" size="large" @click="deleteElement"
                     :disabled="!this.activeElement.type"></el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" icon="el-icon-download" size="large" @click="downloadData"></el-button>
          <div style="float: right;margin-right: 5px">
            <el-button plain round icon="el-icon-document" @click="dataInfo" size="mini">流程信息</el-button>
            <el-button plain round @click="dataReloadA" icon="el-icon-refresh" size="mini">切换样例服务编排A</el-button>
            <el-button plain round @click="dataReloadE" icon="el-icon-refresh" size="mini">自定义样式</el-button>
            <el-button plain round @click="dataReloadClear" icon="el-icon-refresh" size="mini">清空画布</el-button>
            <el-button plain round @click="test" icon="el-icon-refresh" size="mini">测试连接</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
    <div style="display: flex;height: calc(100% - 47px);">
      <div style="width: 15vw;border-right: 1px solid #dce3e8;background-color: #FBFBFB">
        <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
      </div>
      <div id="efContainer" ref="efContainer" class="container" v-flowDrag style="background-color: #f0f2f7">
        <template v-for="node in data.nodeList">
          <flow-node :id="node.id" :key="node.id" :node="node" :activeElement="activeElement"
                     @changeNodeSite="changeNodeSite" @nodeRightMenu="nodeRightMenu" @clickNode="clickNode">
          </flow-node>
        </template>

      </div>

      <div style="width: 300px;border-left: 1px solid #dce3e8;background-color: #FBFBFB">
        <flow-node-form ref="nodeForm" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything"
                        :flow-data="data" :data-reload-clear="dataReloadClear"></flow-node-form>
      </div>
    </div>

    <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>
  </div>

</template>

<script>
/* eslint-disable */

import draggable from 'vuedraggable'
// import { jsPlumb } from 'jsplumb'
// 使用修改后的jsplumb
// import './jsplumb'
import { easyFlowMixin } from '@/components/ef/mixins'
import flowNode from '@/components/ef/node'
import nodeMenu from '@/components/ef/node_menu'
import FlowInfo from '@/components/ef/info'
// 右侧选项，TODO:添加服务编排相关信息
import FlowNodeForm from './node_form'
import lodash from 'lodash'
import { getDataA } from './data_A'
import { getDataB } from './data_B'
import { getDataC } from './data_C'
import { getDataD } from './data_D'
import { getDataE } from './data_E'
import { getDataNew } from './data_new'

export default {
  data() {
    return {
      jsPlumb: null,
      easyFlowVisible: true,
      flowInfoVisible: false,
      loadEasyFlowFinish: false,
      data: {},
      activeElement: {
        type: undefined,
        // 节点ID
        nodeId: undefined,
        sourceId: undefined,
        targetId: undefined
      },
      zoom: 0.5,
      isTesting: false,
      intervalId: null,
      jsplumbSetting: {
        Connector: ["Bezier", { curviness: 50 }], // 使用贝塞尔曲线连接
        Anchors: ["TopCenter", "RightMiddle", "BottomCenter", "LeftMiddle"], // 锚点位置
        PaintStyle: {
          strokeWidth: 2,
          stroke: "#5c96bc", // 连接线颜色
          outlineStroke: "transparent",
          outlineWidth: 4
        },
        HoverPaintStyle: {
          strokeWidth: 2,
          stroke: "#ffcc00"
        },
        EndpointStyle: {
          fill: "#5c96bc", // 端点填充颜色
          outlineStroke: "transparent", 
          outlineWidth: 2
        },
        EndpointHoverStyle: {
          fill: "#ffcc00" // 悬停时端点填充颜色
        },
        MaxConnections: -1, // 不限制连接数量
        ConnectionsDetachable: true, // 允许拆卸连接
        Container: null, // 默认为null，可以指定容器
        DragOptions: {
          cursor: "pointer",
          zIndex: 2000
        }
      },
      
    }
  },
  mixins: [easyFlowMixin],
  components: {
    draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm
  },
  directives: {
    'flowDrag': {
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button === 2) {
            return
          }
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.dataReloadClear()
  },
  methods: {
    getUUID() {
      return Math.random().toString(36).substr(3, 10)
    },
    jsPlumbInit() {
      this.jsPlumb.ready(() => {
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        this.jsPlumb.setSuspendDrawing(false, true)
        this.loadEasyFlow()
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel()
          })
        })
        this.jsPlumb.bind('connection', (evt) => {
          const from = evt.source.id
          const to = evt.target.id
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({ from: from, to: to })
          }
        })

        this.jsPlumb.bind('connectionDetached', (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })

        this.jsPlumb.bind('connectionMoved', (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })

        this.jsPlumb.bind('contextmenu', (evt) => {
          console.log('contextmenu', evt)
        })

        this.jsPlumb.bind('beforeDrop', (evt) => {
          const from = evt.sourceId
          const to = evt.targetId
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环')
            return false
          }
          console.log(evt)
          console.log(to)

          this.$message.success('连接成功')
          return true
        })

        this.jsPlumb.bind('beforeDetach', (evt) => {
          console.log('beforeDetach', evt)
        })
        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },
    loadEasyFlow() {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i];
        this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions);
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions);
        this.jsPlumb.draggable(node.id, {
          containment: 'parent',
        });
      }

      // 初始化连线
      for (var i = 0; i < this.data.lineList.length; i++) {
        const line = this.data.lineList[i];
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          connector: ["Bezier"], // 使用 Bezier 曲线
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        };
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions);
      }

      this.$nextTick(() => {
        this.loadEasyFlowFinish = true;
      });
    },
    setLineLabel(from, to, label) {
      var conn = this.jsPlumb.getConnections({
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
    deleteElement() {
      if (this.activeElement.type === 'node') {
        this.deleteNode(this.activeElement.nodeId)
      } else if (this.activeElement.type === 'line') {
        this.$confirm('确定删除所点击的线吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var conn = this.jsPlumb.getConnections({
            source: this.activeElement.sourceId,
            target: this.activeElement.targetId
          })[0]
          this.jsPlumb.deleteConnection(conn)
        }).catch(() => {
        })
      }
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
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
        if (node.id === data.nodeId) {
          node.left = data.left
          node.top = data.top
        }
      }
    },

    addNode(evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX; var screenY = evt.originalEvent.clientY
      const efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX; var top = screenY
      if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
        this.$message.error('请把节点拖入到画布中')
        return
      }
      left = left - containerRect.x + efContainer.scrollLeft
      top = top - containerRect.y + efContainer.scrollTop
      left -= 85
      top -= 16
      var nodeId = this.getUUID()
      var origName = nodeMenu.name
      var nodeName = origName
      var index = 1
      while (index < 10000) {
        var repeat = false
        for (var i = 0; i < this.data.nodeList.length; i++) {
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
      var node = {
        id: nodeId,
        name: nodeName,
        type: nodeMenu.type,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        state: 'success'
      }

      this.data.nodeList.push(node)
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent'
        })
      })
    },

    deleteNode(nodeId) {
      this.$confirm('确定要删除节点' + nodeId + '?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {

        this.data.nodeList = this.data.nodeList.filter(function (node) {
          if (node.id === nodeId) {

            return false
          }
          return true
        })
        this.$nextTick(function () {
          this.jsPlumb.removeAllEndpoints(nodeId)
        })
      }).catch(() => {
      })
      return true
    },
    clickNode(nodeId) {
      this.activeElement.type = 'node'
      this.activeElement.nodeId = nodeId
      this.$refs.nodeForm.nodeInit(this.data, nodeId)
    },
    hasLine(from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
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
      console.log('重绘')
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
      this.data.nodeList = []
      this.data.lineList = []
      this.$nextTick(() => {
        data = lodash.cloneDeep(data)
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
    dataReloadA() {
      this.dataReload(getDataA())
    },
    dataReloadB() {
      this.dataReload(getDataB())
    },
    dataReloadC() {
      this.dataReload(getDataC())
    },
    dataReloadD() {
      this.dataReload(getDataD())
    },
    dataReloadE() {
      this.dataReload(getDataE())
    },
    dataReloadClear() {
      this.dataReload(getDataNew())
    },
    zoomAdd() {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub() {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    downloadData() {
      this.$confirm('确定要下载该流程数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        var datastr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, '\t'))
        var downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', datastr)
        downloadAnchorNode.setAttribute('download', 'data.json')
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        this.$message.success('正在下载中,请稍后...')
      }).catch(() => {
      })
    },


    test() {
      this.isTesting = !this.isTesting; // 切换测试状态
      const connections = this.jsPlumb.getAllConnections();

      if (this.isTesting) {
        // 启动虚线滚动效果
        let dashOffset = 0;
        this.intervalId = setInterval(() => {
          dashOffset += 2; // 控制滚动速度
          connections.forEach(conn => {
            conn.setPaintStyle({ 
              stroke: 'green', 
              strokeWidth: 2, 
              dashstyle: `4 ${dashOffset}`  // 滚动虚线
            });
          });
        }, 100); // 每100毫秒更新一次
      } else {
        // 停止滚动效果，恢复为原样式
        clearInterval(this.intervalId); // 清除定时器
        connections.forEach(conn => {
          conn.setPaintStyle({ stroke: 'blue', strokeWidth: 2, dashstyle: "0" });
        });
      }
    }

  }
}
</script>
