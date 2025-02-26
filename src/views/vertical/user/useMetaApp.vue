<template>
  <page-header-wrapper :title="false">
    <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
      <div style="display: flex; justify-content: space-between">
        <div style="width: 30%">
          <div class="app-preview" v-if="apiList[0]">
            <span class="app-title">{{ apiList[0].name }}</span>
            <div class="input-output-container">
              <!-- 输入区域 -->
              <div>
                <span v-show="apiList[0].parameterType !== 0" class="section-title">{{ apiList[0].inputName }}</span>
                <div style="width: 100%; display: flex; justify-content: center">
                  <a-upload
                    v-show="apiList[0].parameterType === 2"
                    :file-list="fileList"
                    :remove="removeFile"
                    :customRequest="customFileChose"
                    :multiple="false">
                    <a-button> <a-icon type="upload" /> 选择数据文件 </a-button>
                  </a-upload>
                </div>
                <a-textarea v-show="apiList[0].parameterType === 1 || apiList[0].parameterType === 3" v-model="code" class="input-box" placeholder="" :rows="4" />
                <div style="width: 100%">
                  <a-button class="submit-button" type="primary" @click="onRequestSend">
                    {{ apiList[0].submitButtonText }}
                  </a-button>
                </div>
              </div>
              <!-- 输出区域 -->
              <div>
                <span class="section-title">{{ apiList[0].outputName }}</span>
                <div v-if="apiList[0].responseType === 2">
                  <a-button :disabled="!fileUrl" icon="download" @click="downloadFile">下载结果文件</a-button>
                </div>
                <codemirror v-else v-model="response" @ready="onCmReady" :style="codemirrorStyle" :options="cmOptions" />
                <div v-show="apiList[0].outputVisualization" class="image-box">
                  {{ apiList[0].outputName }}可视化区域
                </div>
              </div>
            </div>
          </div>
          <div class="image-box" v-else>
            数据缺失
          </div>
        </div>
        <div style="width: 65%">
          <div style="display: flex;height: calc(100% - 47px);">
            <div id="efContainer" ref="efContainer" class="container" v-flowDrag style="flex: 1; position: relative; background-color: #f0f2f7">
              <div v-if="loadingFlow" class="loading-overlay">
                <i class="el-icon-loading" />
              </div>
              <template v-for="node in data.nodeList">
                <flow-node :id="node.id" :key="node.id" :node="node" :activeElement="activeElement"
                           @changeNodeSite="changeNodeSite" @nodeRightMenu="nodeRightMenu" @clickNode="clickNode">
                </flow-node>
              </template>
              <div style="position: fixed; bottom: 0; border-left: 1px solid #dce3e8; border-top: 1px solid #dce3e8; background-color: #FBFBFB; z-index: 999">
                <flow-node-form ref="nodeForm" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything"
                                :flow-data="data" :data-reload-clear="dataReloadClear"></flow-node-form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="width: 100%; text-align: center; margin-top: 20px">
        <a-button type="primary" @click="handleGoBack">返回</a-button>
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import request from '@/utils/request'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/lint/javascript-lint'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/addon/fold/xml-fold'
import 'codemirror/addon/fold/indent-fold'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/hint/xml-hint'
import 'codemirror/addon/hint/sql-hint'
import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/vue/vue.js'
/* eslint-disable */
import draggable from 'vuedraggable'
import { easyFlowMixin } from '@/components/ef/mixins'
import flowNode from '@/components/ef/node'
import nodeMenu from '@/components/ef/node_menu_with_input'
import FlowInfo from '@/components/ef/info'
import FlowNodeForm from '@/components/ef/node_form_bottom'
import lodash from 'lodash'
import { getAircraftFlow, getPj1Flow, getTecTempFlow } from '@/mock/data/flow_data'

export default {
  name: 'UseMetaApp',
  components: {
    codemirror, draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm
  },
  props: {
    apiList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      fileList: [], // 文件列表
      uploadFiles: [], // 上传的文件对象列表
      sending: false,
      code: '',
      response: '',
      fileUrl: '',
      cmOptions: {
        mode: 'application/json',
        gutters: [],
        lineNumbers: false,
        line: true,
        lint: true,
        lineWrapping: true,
        autofocus: true,
        autoCloseBrackets: true,
        foldGutter: true, // 块槽
        hintOptions: { completeSingle: true },
        matchTags: { bothTags: true },
        matchBrackets: true,
        showCursorWhenSelecting: true,
        styleSelectedText: true,
        styleActiveLine: true,
        autoRefresh: true,
        readOnly: true,
        highlightSelectionMatches: {
          minChars: 2,
          trim: true,
          style: 'matchhighlight',
          showToken: false
        }
      },
      codemirrorStyle: {
        width: '100%',
        border: '1px solid #d9d9d9',
        fontSize: '14px',
        lineHeight: '120%'
      },
      // 工作流部分
      loadingFlow: false,
      jsPlumb: null,
      easyFlowVisible: true,
      flowInfoVisible: false,
      servicesAdderVisible: false,
      metaAppBuilderVisible: false,
      loadEasyFlowFinish: false,
      services: [],
      data: {
        name: '新工作流',
        preName: '元应用名称',
        preInputName: '输入内容',
        preOutputName: '输出内容',
        nodeList: [],
        lineList: []
      },
      activeElement: {
        type: undefined,
        nodeId: undefined,
        sourceId: undefined,
        targetId: undefined
      },
      zoom: 0.5,
      jsplumbSetting: {
        Connector: ['Bezier', { curviness: 50 }],
        Anchors: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
        PaintStyle: {
          strokeWidth: 2,
          stroke: '#5c96bc',
          outlineStroke: 'transparent',
          outlineWidth: 4
        },
        HoverPaintStyle: {
          strokeWidth: 2,
          stroke: '#ffcc00'
        },
        EndpointStyle: {
          fill: '#5c96bc',
          outlineStroke: 'transparent',
          outlineWidth: 2
        },
        EndpointHoverStyle: {
          fill: '#ffcc00'
        },
        MaxConnections: -1,
        ConnectionsDetachable: true,
        Container: null,
        DragOptions: {
          cursor: 'pointer',
          zIndex: 2000
        }
      }
    }
  },
  mixins: [easyFlowMixin],
  directives: {
    'flowDrag': {
      bind(el, binding) {
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
    this.loadingFlow = true
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      this.jsPlumbInit()
    })
    setTimeout(() => {
      switch (this.apiList[0].name) {
        case '技术评测元应用':
          this.dataReload(getTecTempFlow())
          break
        case '无人机智能投递':
          this.dataReload(getAircraftFlow())
          break
        default:
          this.dataReload(getPj1Flow())
      }
      this.loadingFlow = false
    }, 1200)

  },
  methods: {
    onCmReady(cm) {
      cm.on('inputRead', (cm, obj) => {
        if (obj.text && obj.text.length > 0) {
          const c = obj.text[0].charAt(obj.text[0].length - 1)
          if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
            cm.showHint({ completeSingle: false }) // 自动填充关闭了它
          }
        }
      })
    },
    handleGoBack() {
      this.$emit('onGoBack')
    },
    async customFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      this.uploadFiles = [file]
      const url = URL.createObjectURL(file)
      this.fileList = [{
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }]
    },
    removeFile () {
      this.fileList = []
      this.uploadFiles = []
    },
    // 发送请求
    async onRequestSend() {
      const api = this.apiList[0]
      const isFakeApi = api && api.isFake
      // 假结果部分
      if (isFakeApi) {
        this.sending = true
        setTimeout(() => {
          this.response = JSON.stringify(api.response, null, 2)
          this.sending = false
        }, 1000)
        return
      }
      try {
        this.sending = true
        let requestData = null
        const headers = {}
        // 根据参数类型构建请求数据和请求头
        switch (this.parameterType) {
          case 2: // 文件上传
            const formData = new FormData()
            this.uploadFiles.forEach(file => {
              formData.append('file', file)
            })
            requestData = formData
            headers['Content-Type'] = 'multipart/form-data'
            break
          case 3: // JSON 格式
            try {
              requestData = JSON.parse(this.code)
            } catch (error) {
              this.$message.error('JSON 格式错误，请检查输入')
              return
            }
            headers['Content-Type'] = 'application/json;charset=UTF-8'
            break
          default: // 其他情况（无参数或 path variable）
            requestData = {}
            break
        }
        // 文件类型
        if (this.responseType === 2) {
          const response = await request({
            url: this.serviceUrl,
            method: api.method,
            data: requestData,
            headers: headers,
            responseType: 'blob'
          })
          this.fileUrl = window.URL.createObjectURL(response)
        } else {
          const response = await request({
            url: this.serviceUrl,
            method: api.method,
            data: requestData,
            headers: headers
          })
          this.response = JSON.stringify(response, null, 2)
        }
        this.$message.success('请求成功！')
      } catch (error) {
        this.response = error
        this.$message.error('请求失败，请检查网络或参数')
      } finally {
        this.sending = false
      }
    },
    downloadFile () {
      const link = document.createElement('a')
      const fileName = this.apiList[this.selectedApi].responseFileName
      link.href = this.fileUrl
      if (fileName) {
        link.setAttribute('download', fileName)
      }
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    // 工作流区域
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
      for (let i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
        this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(node.id, {
          containment: 'parent'
        })
      }

      // 初始化连线
      for (let j = 0; j < this.data.lineList.length; j++) {
        const line = this.data.lineList[j]
        let connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          connector: ['Bezier'],
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }

      this.$nextTick(() => {
        this.loadEasyFlowFinish = true
      })
    },
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
        if (line.from === from && line.to === to) {
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
          let conn = this.jsPlumb.getConnections({
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
        return !(line.from === from && line.to === to);

      })
    },
    changeLine(oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },
    changeNodeSite(data) {
      for (let i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
        if (node.id === data.nodeId) {
          node.left = data.left
          node.top = data.top
        }
      }
    },
    clickNode(nodeId) {
      this.activeElement.type = 'node'
      this.activeElement.nodeId = nodeId
      // this.$refs.nodeForm.nodeInit(this.data, nodeId)
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
    updateInitialFlow(newFlow) {
      this.dataReload(newFlow)
    },
    dataReloadClear() {
      this.dataReload(this.data)
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
    }
  }
}
</script>
<style scoped lang="less">
.CodeMirror-hints {
  z-index: 30000 !important;
}
/deep/ .CodeMirror{
  height: 120px;
}

.app-preview {
  width: 100%;
  aspect-ratio: 9 / 19; /* 设置宽高比 */
  overflow-y: auto; /* 使高度限制生效 */
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 16px;
  font-weight: bold;
  background-color: #1890ff;
  color: #fff;
  text-align: center;
  display: block;
  line-height: 35px;
  border-radius: 6px 6px 0 0;
}

/* 输入输出容器 */
.input-output-container {
  margin: 16px;
}

/* 输入输出标题 */
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 8px;
  line-height: 30px;
}

.submit-button {
  width: 50%;
  margin: 8px 0;
  left: 25%;
}

.input-box {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

/* 图片框 */
.image-box {
  width: 100%;
  min-height: 150px;
  margin-top: 16px;
  padding: 16px;
  background-color: #e8e8e8;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  i {
    font-size: 30px;
  }
}
</style>
