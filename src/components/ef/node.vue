<template>
  <div
    ref="node"
    :style="nodeContainerStyle"
    @click="clickNode"
    @mouseup="changeNodeSite"
    :class="nodeContainerClass"
  >
    <!-- 最左侧的那条竖线 -->
    <div class="ef-node-left"></div>
    <!-- 节点类型的图标 -->
    <div class="ef-node-left-ico flow-node-drag">
      <i :class="nodeIcoClass"></i>
    </div>
    <!-- 节点名称 -->
    <div class="ef-node-text" :show-overflow-tooltip="true">
      {{ node.name }}
    </div>
    <!-- 节点状态图标 -->
    <div class="ef-node-right-ico">
      <i class="el-icon-circle-check el-node-state-success" v-show="node.state === 'success'"></i>
      <i class="el-icon-circle-close el-node-state-error" v-show="node.state === 'error'"></i>
      <i class="el-icon-warning-outline el-node-state-warning" v-show="node.state === 'warning'"></i>
      <i class="el-icon-loading el-node-state-running" v-show="node.state === 'running'"></i>
    </div>

    <div class="ef-node-divider"></div>
    <!-- 参数信息 -->
    <div class="ef-node-parameters">
        <!-- <p><strong>Input:</strong> {{ node.input }}</p>
        <p><strong>Output:</strong> {{ node.output }}</p>
        <p><strong>Version:</strong> {{ node.version }}</p> -->
        <label><strong>Input:</strong></label>
        <input type="text" value="input" readonly>
        <label><strong>Output:</strong></label>
        <input type="text" value="output" readonly>
        <label><strong>Version:</strong></label>
        <input type="text" value="v1.0" readonly>
    </div>
  </div>
</template>

<script>
    export default {
        props: {
            node: Object,
            activeElement: Object
        },
        data () {
            return {
            }
        },
        computed: {
            nodeContainerClass () {
                return {
                    'ef-node-container': true,
                    'ef-node-active': this.activeElement.type === 'node' ? this.activeElement.nodeId === this.node.id : false
                }
            },
            // 节点容器样式
            nodeContainerStyle () {
                return {
                    top: this.node.top,
                    left: this.node.left
                }
            },
            nodeIcoClass () {
                var nodeIcoClass = {}
                nodeIcoClass[this.node.ico] = true
                // 添加该class可以推拽连线出来
                nodeIcoClass['flow-node-drag'] = true
                return nodeIcoClass
            }
        },
        methods: {
            // 点击节点
            clickNode () {
                this.$emit('clickNode', this.node.id)
            },
            // 鼠标移动后抬起
            changeNodeSite () {
                // 避免抖动
                if (this.node.left === this.$refs.node.style.left && this.node.top === this.$refs.node.style.top) {
                    return
                }
                this.$emit('changeNodeSite', {
                    nodeId: this.node.id,
                    left: this.$refs.node.style.left,
                    top: this.$refs.node.style.top
                })
            }
        }
    }
</script>
