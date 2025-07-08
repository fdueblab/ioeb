<template>
  <div
    :id="node.id"
    ref="node"
    :class="nodeContainerClass"
    :style="{ zIndex: nodeContainerZIndex }"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <!-- 智能体节点特殊效果 -->
    <div v-if="isMetaAgent" class="agent-glow"></div>

    <!-- 节点主体 -->
    <div class="ef-node-main">
      <!-- 节点图标 -->
      <div class="node-icon">
        <i v-if="isMetaAgent" class="el-icon-cpu"></i>
        <i v-else class="el-icon-help"></i>
      </div>

      <!-- 节点信息 -->
      <div class="ef-node-content">
        <!-- 节点名称 -->
        <div class="ef-node-title" :title="nodeDisplayName">
          {{ nodeDisplayName }}
        </div>

        <!-- 节点类型标签 -->
        <div class="ef-node-type-tag" :class="nodeTypeTagClass">
          {{ nodeTypeLabel }}
        </div>

        <!-- 节点状态 -->
        <div style="height: 14px;">
          <a-badge :status="node.stateStyle" /><span :class="nodeStatusTextClass">{{ node.state }}</span>
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

    <!-- Tooltip -->
    <div v-if="tooltipVisible" class="node-tooltip" :class="[tooltipClass, tooltipPositionClass]">
      <div class="tooltip-title">{{ nodeDisplayName }}</div>
      <div v-if="isMetaAgent" class="tooltip-agent-desc">{{ node.des }}</div>
      <div v-else class="tooltip-service">{{ node.des }}</div>
      <div class="tooltip-status">状态: {{ node.state }}</div>

      <!-- 工具列表 -->
      <div v-if="!isMetaAgent && node.tools && node.tools.length > 0" class="tooltip-tools">
        <div class="tools-title">包含工具:</div>
        <div class="tools-list">
          <div v-for="tool in node.tools" :key="tool.name" class="tool-item">
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-desc">{{ tool.des }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    node: {
      type: Object,
      default: undefined
    },
    appName: {
      type: String,
      default: '新元应用'
    }
  },
  data() {
    return {
      tooltipVisible: false
    }
  },
  computed: {
    // 是否是智能体节点
    isMetaAgent() {
      return this.node.name === 'metaAppAgent'
    },
    nodeContainerClass() {
      return {
        'ef-node-enhanced': true,
        'ef-node-agent': this.isMetaAgent,
        'ef-node-tool': !this.isMetaAgent,
        'ef-node-tooltip-visible': this.tooltipVisible
      }
    },
    // 动态控制节点容器的z-index
    nodeContainerZIndex() {
      // 当tooltip显示时，提升节点层级到最高
      return this.tooltipVisible ? 999 : 'inherit'
    },
    nodeStatusTextClass() {
      return {
        'status-text-agent': this.isMetaAgent,
        'status-text-tool': !this.isMetaAgent
      }
    },
    tooltipClass() {
      return {
        'tooltip-agent': this.isMetaAgent,
        'tooltip-tool': !this.isMetaAgent
      }
    },
    nodeTypeLabel() {
      if (this.isMetaAgent) return '元应用智能体'
      return 'MCP Server'
    },
    nodeTypeTagClass() {
      return {
        'type-tag-agent': this.isMetaAgent,
        'type-tag-tool': !this.isMetaAgent
      }
    },

    nodeDisplayName() {
      if (this.isMetaAgent) return this.appName + '智能体'
      return this.node.name
    },

    tooltipPositionClass() {
      // 获取节点的位置信息
      if (!this.node.left || !this.node.top) {
        return 'tooltip-position-top' // 默认显示在上方
      }

      // 解析节点位置（去掉px单位）
      // const nodeLeft = parseInt(this.node.left.replace('px', ''))
      const nodeTop = parseInt(this.node.top.replace('px', ''))

      // 获取父容器（画布）信息
      let containerHeight = 600 // 默认高度
      // let containerWidth = 800 // 默认宽度

      // 尝试获取真实的画布尺寸
      try {
        const container = this.$el?.parentElement?.parentElement
        if (container) {
          containerHeight = container.clientHeight || 600
          // containerWidth = container.clientWidth || 800
        }
      } catch (e) {
        // 如果获取失败，使用默认值
      }

      // 计算节点相对于画布中心的位置
      const nodeHeight = 60 // 节点高度
      const tooltipHeight = 150 // 估算tooltip高度
      const margin = 20 // 边距

      // 判断节点是否在画布上半部分
      const isInUpperHalf = nodeTop < (containerHeight / 2)

      // 判断是否接近上边界
      const isNearTopBorder = nodeTop < tooltipHeight + margin

      // 判断是否接近下边界
      const isNearBottomBorder = (nodeTop + nodeHeight + tooltipHeight + margin) > containerHeight

      // 智能选择tooltip位置
      if (isNearTopBorder) {
        // 接近上边界，强制显示在下方
        return 'tooltip-position-bottom'
      } else if (isNearBottomBorder) {
        // 接近下边界，强制显示在上方
        return 'tooltip-position-top'
      } else if (isInUpperHalf) {
        // 在上半部分，优先显示在下方
        return 'tooltip-position-bottom'
      } else {
        // 在下半部分，优先显示在上方
        return 'tooltip-position-top'
      }
    }
  },
  methods: {
    deleteNode() {
      this.$emit('deleteNode', this.node.id)
    },
    showTooltip() {
      this.tooltipVisible = true
    },
    hideTooltip() {
      this.tooltipVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.ef-node-enhanced {
  width: 165px;
  min-height: 60px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: visible;
  z-index: 5; // 默认层级
  position: relative; // 确保z-index生效

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);

    .ef-node-delete-btn {
      opacity: 1;
      visibility: visible;
    }
  }

  // 当tooltip显示时，确保节点在最高层级
  &.ef-node-tooltip-visible {
    z-index: 999 !important;
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
  background: linear-gradient(135deg, #f6f8fc 0%, #e8f4f8 100%);
  border: 1px solid #d1e9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);

  &:hover {
    border-color: #40a9ff;
    background: linear-gradient(135deg, #f0f7ff 0%, #e1f0ff 100%);
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
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
  display: block;
  padding: 12px;
  position: relative;
}

// 节点内容
.ef-node-content {
  margin-left: 40px;
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
    background: rgba(24, 144, 255, 0.1);
    color: #1890ff;
    font-weight: 500;
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
  left: -8px;
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
}

// Tooltip样式
.node-tooltip {
  position: absolute;
  left: 50%;
  background: #ffffff;
  color: #262626;
  border: 1px solid #e8e8e8;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  max-width: 320px;
  min-width: 220px;

  // 默认位置（上方显示）
  &.tooltip-position-top {
    top: -10px;
    transform: translateX(-50%) translateY(-100%);
    animation: tooltipFadeInTop 0.3s ease forwards;

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 8px solid transparent;
      border-top-color: #ffffff;
    }

    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 9px solid transparent;
      border-top-color: #e8e8e8;
      z-index: -1;
    }
  }

  // 下方显示
  &.tooltip-position-bottom {
    bottom: -10px;
    transform: translateX(-50%) translateY(100%);
    animation: tooltipFadeInBottom 0.3s ease forwards;

    &::after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 8px solid transparent;
      border-bottom-color: #ffffff;
    }

    &::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 9px solid transparent;
      border-bottom-color: #e8e8e8;
      z-index: -1;
    }
  }

  .tooltip-title {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
    color: #1f1f1f;
  }

  .tooltip-service {
    font-size: 12px;
    margin-bottom: 6px;
    color: #8c8c8c;
    background: #f6f6f6;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
  }

  .tooltip-status {
    font-size: 12px;
    margin-bottom: 12px;
    color: #595959;
  }

  .tooltip-agent-desc {
    font-size: 12px;
    margin-bottom: 8px;
    color: #595959;
    font-style: italic;
    text-align: center;
    padding: 8px 12px;
    background: #f6f6f6;
    border-radius: 6px;
    border-left: 3px solid #1890ff;
  }

  .tooltip-tools {
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
    margin-top: 8px;

    .tools-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #262626;
      display: flex;
      align-items: center;

      &::before {
        content: '🔧';
        margin-right: 6px;
        font-size: 14px;
      }
    }

    .tools-list {
      .tool-item {
        display: flex;
        flex-direction: column;
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #fafafa;
        border-radius: 8px;
        border-left: 3px solid #52c41a;

        &:last-child {
          margin-bottom: 0;
        }

        .tool-name {
          font-size: 12px;
          font-weight: 500;
          color: #262626;
          font-family: 'Consolas', 'Monaco', monospace;
          margin-bottom: 2px;
        }

        .tool-desc {
          font-size: 11px;
          color: #8c8c8c;
          line-height: 1.4;
        }
      }
    }
  }
}

// 智能体tooltip样式
.tooltip-agent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &.tooltip-position-top {
    &::after {
      border-top-color: #667eea;
    }

    &::before {
      border-top-color: rgba(255, 255, 255, 0.2);
    }
  }

  &.tooltip-position-bottom {
    &::after {
      border-bottom-color: #667eea;
    }

    &::before {
      border-bottom-color: rgba(255, 255, 255, 0.2);
    }
  }

  .tooltip-title {
    color: white;
  }

  .tooltip-service {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .tooltip-status {
    color: rgba(255, 255, 255, 0.8);
  }

  .tooltip-agent-desc {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    border-left-color: rgba(255, 255, 255, 0.6);
  }

  .tooltip-tools {
    border-top-color: rgba(255, 255, 255, 0.2);

    .tools-title {
      color: white;
    }

    .tools-list .tool-item {
      background: rgba(255, 255, 255, 0.1);
      border-left-color: rgba(255, 255, 255, 0.6);

      .tool-name {
        color: white;
      }

      .tool-desc {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

// 工具tooltip样式
.tooltip-tool {
  // 使用默认的白色主题
}

// 动画定义
@keyframes tooltipFadeInTop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%) scale(1);
  }
}

@keyframes tooltipFadeInBottom {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(100%) scale(1);
  }
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%) scale(1);
  }
}

/* 节点图标 */
.node-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
}

/* 智能体图标样式 */
.ef-node-agent .node-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.ef-node-agent .node-icon i {
  color: white;
}

/* MCP Server图标样式 */
.ef-node-tool .node-icon {
  background: linear-gradient(135deg, #87cefa 0%, #87CEEB 100%);
  border: 1px solid #91d5ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
}

.ef-node-tool .node-icon i {
  color: white;
  font-weight: bold;
}
</style>
