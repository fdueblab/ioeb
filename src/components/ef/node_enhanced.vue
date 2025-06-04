<template>
  <div
    :id="node.id"
    ref="node"
    @click="clickNode"
    :class="nodeContainerClass"
  >
    <!-- 智能体节点特殊效果 -->
    <div v-if="isMetaAgent" class="agent-glow"></div>

    <!-- 节点主体 -->
    <div class="ef-node-main">
      <!-- 节点类型图标 -->
      <div class="ef-node-icon-container">
        <div class="ef-node-icon-bg" :class="nodeIconBgClass">
          <i :class="nodeIcoClass"></i>
        </div>
      </div>

      <!-- 节点信息 -->
      <div class="ef-node-content">
        <!-- 节点名称 -->
        <div class="ef-node-title" :title="node.name">
          {{ node.name }}
        </div>

        <!-- 节点类型标签 -->
        <div class="ef-node-type-tag" :class="nodeTypeTagClass">
          {{ nodeTypeLabel }}
        </div>

        <!-- 节点状态 -->
        <div style="height: 14px;">
          <a-badge :status="nodeStatusType" /><span :class="nodeStatusTextClass">{{ nodeStatusText }}</span>
        </div>
      </div>

      <!-- 删除按钮 -->
      <div v-if="!isMetaAgent" class="ef-node-delete-btn" @click.stop="deleteNode">
        <a-button type="danger" shape="circle" size="small" icon="delete" />
      </div>
    </div>

    <!-- 智能体特殊装饰 -->
    <div v-if="isMetaAgent" class="agent-decoration">
      <div class="agent-badge">AI</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    node: Object,
    activeElement: Object
  },
  data() {
    return {}
  },
  computed: {
    // 是否是智能体节点
    isMetaAgent() {
      return this.node.name === 'metaAppAgent' || this.node.type === 'start'
    },

    nodeContainerClass() {
      return {
        'ef-node-enhanced': true,
        'ef-node-agent': this.isMetaAgent,
        'ef-node-tool': !this.isMetaAgent,
        'ef-node-active': this.activeElement.type === 'node' ? this.activeElement.nodeId === this.node.id : false
      }
    },

    nodeIcoClass() {
      // 统一图标显示
      if (this.isMetaAgent) {
        return 'el-icon-cpu'
      } else {
        return 'el-icon-setting'
      }
    },

    nodeIconBgClass() {
      return {
        'icon-bg-agent': this.isMetaAgent,
        'icon-bg-tool': !this.isMetaAgent,
        [`icon-bg-${this.node.state}`]: true
      }
    },

    nodeTypeLabel() {
      if (this.isMetaAgent) return '元应用智能体'
      return 'MCP工具'
    },

    nodeTypeTagClass() {
      return {
        'type-tag-agent': this.isMetaAgent,
        'type-tag-tool': !this.isMetaAgent
      }
    },

    nodeStatusTextClass() {
      return {
        'status-text-agent': this.isMetaAgent,
        'status-text-tool': !this.isMetaAgent
      }
    },

    nodeStatusType() {
      const statusMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'running': 'processing',
        'toBuild': 'default'
      }
      return statusMap[this.node.state] || 'default'
    },

    nodeStatusText() {
      const textMap = {
        'success': '正常',
        'error': '错误',
        'warning': '警告',
        'running': '运行中',
        'toBuild': '待构建'
      }
      return textMap[this.node.state] || '未知'
    }
  },

  methods: {
    clickNode() {
      this.$emit('clickNode', this.node.id)
    },

    deleteNode() {
      this.$emit('deleteNode', this.node.id)
    }
  }
}
</script>

<style lang="less" scoped>
.ef-node-enhanced {
  width: 160px;
  min-height: 60px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: visible;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);

    .ef-node-delete-btn {
      opacity: 1;
      visibility: visible;
    }
  }

  &.ef-node-active {
    box-shadow: 0 0 0 2px #1890ff;
  }
}

// 智能体节点样式
.ef-node-agent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid #5a67d8;

  .ef-node-content {
    color: white;
  }

  .ef-node-title {
    color: white;
    font-weight: 600;
  }

  &:hover {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
}

// 工具节点样式
.ef-node-tool {
  background: #ffffff;
  border: 1px solid #e8e8e8;

  &:hover {
    border-color: #40a9ff;
  }
}

// 智能体发光效果
.agent-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
  border-radius: 16px;
  opacity: 0.3;
  animation: glow 2s ease-in-out infinite alternate;
  z-index: -1;
}

@keyframes glow {
  from {
    opacity: 0.3;
    transform: scale(1);
  }
  to {
    opacity: 0.6;
    transform: scale(1.02);
  }
}

// 节点主体
.ef-node-main {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  position: relative;
}

// 图标容器
.ef-node-icon-container {
  margin-right: 8px;
}

.ef-node-icon-bg {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  &.icon-bg-agent {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  &.icon-bg-tool {
    background: #f0f0f0;
    color: #666;
  }

  &.icon-bg-success {
    background: #f6ffed;
    color: #52c41a;
  }

  &.icon-bg-error {
    background: #fff2f0;
    color: #f5222d;
  }

  &.icon-bg-warning {
    background: #fffbe6;
    color: #fa8c16;
  }

  &.icon-bg-running {
    background: #e6f7ff;
    color: #1890ff;
  }
}

// 节点内容
.ef-node-content {
  flex: 1;
  min-width: 0;
}

.ef-node-title {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ef-node-type-tag {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 4px;

  &.type-tag-agent {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  &.type-tag-tool {
    background: #f0f0f0;
    color: #666;
  }
}

// 状态文本
.status-text-agent {
  color: #d9d9d9;
  font-size: 10px;
}
.status-text-tool {
  font-size: 10px;
}

// 删除按钮
.ef-node-delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 10;
}

// 状态图标
.ef-node-state-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 14px;
}

// 智能体装饰
.agent-decoration {
  position: absolute;
  top: -8px;
  left: -8px;  // 从右上角改为左上角
}

.agent-badge {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .ef-node-enhanced {
    width: 160px;
    min-height: 60px;
  }

  .ef-node-main {
    padding: 8px;
  }

  .ef-node-icon-bg {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}
</style>
