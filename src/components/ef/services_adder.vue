<template>
  <el-dialog
    :title="title"
    width="40%"
    :visible.sync="dialogVisible"
    @close="onClose"
    class="service-dialog"
  >
    <div class="dialog-content">
      <el-input
        v-model="filterText"
        style="width: 80%"
        placeholder="搜索微服务"
        @change="handleSearch"
        clearable
      />
      <!-- todo: 数据库获取，重写节点勾选逻辑和添加方法 -->
      <el-tree
        :data="filterData"
        empty-text="服务数据正在迁移重构，暂不支持从此处添加工具"
        show-checkbox
        v-loading="loading"
        node-key="id"
        :default-expand-all="true"
        :props="defaultProps"
        :default-checked-keys="defaultCheckedKeys"
        @check-change="handleCheckChange"
        class="service-tree"
      >
        <!-- <span slot-scope="{ node, data }" class="custom-tree-node">-->
        <span slot-scope="{ node }" class="custom-tree-node">
          <!-- <i v-if="data.ico" :class="data.ico" class="node-icon" />-->
          <span class="node-label">{{ node.label }}</span>
        </span>
      </el-tree>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose" class="cancel-button">取消</el-button>
      <el-button type="primary" @click="onConfirm" class="confirm-button" disabled>确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
// import { getAllAmlServiceNodes } from '@/mock/data/service_nodes'
import cloneDeep from 'lodash.clonedeep'

export default {
  props: {
    initialSelectedItems: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '全部微服务'
    }
  },
  data() {
    return {
      services: [],
      filterData: [],
      selectedNodes: [],
      dialogVisible: false,
      loading: false,
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name',
        disabled: 'disabled'
      },
      defaultCheckedKeys: [],
      disabledNodes: []
    }
  },
  methods: {
    init() {
      this.dialogVisible = true
      this.loading = true
      setTimeout(() => {
        this.filterText = ''
        this.fetchServices()
        this.initSelectedItems()
        this.loading = false
      }, 500)
    },
    fetchServices() {
      // todo: 从数据库获取
      // this.services = getAllAmlServiceNodes()
      this.filterData = this.services
    },
    initSelectedItems() {
      this.defaultCheckedKeys = []
      this.disabledNodes = []
      this.initialSelectedItems.forEach(item => {
        if (item.children) {
          item.children.forEach(child => {
            this.defaultCheckedKeys.push(child.id)
            this.disabledNodes.push(child)
          })
        }
      })
      this.disableNodes(this.services)
    },
    // todo: 下面都要重写
    disableNodes(nodes) {
      nodes.forEach(node => {
        if (node.children) {
          // 检查子节点是否全部被选中
          const allChildrenSelected = node.children.every(child =>
            this.disabledNodes.some(disabled => disabled.id === child.id)
          )
          if (allChildrenSelected) {
            node.disabled = true // 如果所有子节点都被选中，服务本身置灰
          }
          this.disableNodes(node.children) // 递归处理子节点
        } else {
          // 如果是接口节点，检查是否需要置灰
          if (this.disabledNodes.some(disabled => disabled.id === node.id)) {
            node.disabled = true
          }
        }
      })
    },
    handleCheckChange(data, checked) {
      if (checked) {
        const parentService = this.findParentService(data)
        if (parentService) {
          if (!parentService.selectedChildren) {
            this.$set(parentService, 'selectedChildren', [])
          }
          parentService.selectedChildren.push(data)
        }
      } else {
        const parentService = this.findParentService(data)
        if (parentService && parentService.selectedChildren) {
          parentService.selectedChildren = parentService.selectedChildren.filter(
            (node) => node.id !== data.id
          )
        }
      }
    },
    handleSearch() {
      const keyword = this.filterText.trim().toLowerCase()
      if (keyword) {
        this.filterData = this.filterServices(this.services, keyword)
      } else {
        this.filterData = this.services
      }
    },
    filterServices(nodes, keyword) {
      return cloneDeep(nodes).map(node => {
        const match = node.name.toLowerCase().includes(keyword)
        if (node.children) {
          node.children = this.filterServices(node.children, keyword)
        } else {
          node.children = []
        }
        if (match || node.children.length > 0) {
          return node
        } else {
          return null
        }
      }).filter(node => node !== null)
    },
    onConfirm() {
      const selectedServices = this.services
        .map((service) => {
          // 去掉initialSelectedItems里的服务节点
          if (this.initialSelectedItems.some(item => item.id === service.id)) {
            return null
          } else if (service.selectedChildren && service.selectedChildren.length > 0) {
            return {
              ...service,
              children: service.selectedChildren
            }
          }
          return null
        })
        .filter((service) => service !== null)

      this.$emit('confirm', selectedServices)
      this.onClose()
    },
    onClose() {
      this.selectedNodes = []
      this.$emit('close')
    },
    findParentService(node) {
      const findParent = (services) => {
        for (const service of services) {
          if (service.children) {
            if (service.children.some((child) => child.id === node.id)) {
              return service
            }
            const parent = findParent(service.children)
            if (parent) {
              return parent
            }
          }
        }
        return null
      }
      return findParent(this.services)
    }
  }
}
</script>
<style scoped>
/* 对话框整体样式 */
.service-dialog {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 对话框内容区域 */
.dialog-content {
  padding: 20px;
  max-height: 350px;
  overflow-y: auto;
}

/* 树形组件样式 */
.service-tree {
  font-size: 18px;
}

/* 自定义树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

/* 树节点图标样式 */
.node-icon {
  margin-right: 8px;
  color: #409EFF;
}

/* 树节点标签样式 */
.node-label {
  font-size: 14px;
  color: #333;
}

/* 对话框底部按钮区域 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 20px 0 20px;
  border-top: 1px solid #e4e7ed;
}

/* 取消按钮样式 */
.cancel-button {
  background-color: #f5f5f5;
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #e6e6e6;
}

/* 确定按钮样式 */
.confirm-button {
  background-color: #409EFF;
  border: 1px solid #409EFF;
  color: #fff;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.confirm-button:hover {
  background-color: #66b1ff;
}
</style>
