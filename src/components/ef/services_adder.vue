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
      <el-tree
        ref="serviceTree"
        v-loading="loading"
        :data="filterData"
        show-checkbox
        node-key="id"
        :default-expand-all="false"
        :props="defaultProps"
        :default-checked-keys="defaultCheckedKeys"
        :check-strictly="true"
        @check="handleCheck"
        class="service-tree"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <!-- 如果是工具节点，隐藏复选框 -->
          <span v-if="data.isTool" class="tool-node">
            <span class="node-label">{{ node.label }}</span>
            <el-tooltip :content="data.des">
              <i class="el-icon-question tooltip-icon"></i>
            </el-tooltip>
          </span>
          <!-- 如果是服务节点，正常显示 -->
          <span v-else class="service-node" :class="{ 'initial-selected': data._isInitialSelected }">
            <i class="el-icon-help service-icon"></i>
            <span class="node-label">{{ node.label }}</span>
            <el-tooltip :content="data.des">
              <i class="el-icon-question tooltip-icon"></i>
            </el-tooltip>
          </span>
        </span>
      </el-tree>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose" class="cancel-button">取消</el-button>
      <el-button type="primary" @click="onConfirm" class="confirm-button" :disabled="!hasNewlySelectedServices">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import cloneDeep from 'lodash.clonedeep'
import { filterServices } from '@/api/service'

export default {
  props: {
    initialSelectedItems: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '全部微服务'
    },
    verticalType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      services: [],
      filterData: [],
      selectedServices: [],
      dialogVisible: false,
      loading: false,
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name',
        disabled: 'disabled'
      },
      defaultCheckedKeys: []
    }
  },
  computed: {
    // 检查是否有新选择的服务（非初始选中的）
    hasNewlySelectedServices() {
      return this.selectedServices.some(service => !service._isInitialSelected)
    }
  },
  methods: {
    init() {
      this.dialogVisible = true
      this.loading = true
      this.filterText = ''
      this.selectedServices = []
      this.fetchServices()
    },
    async fetchServices() {
      try {
        filterServices({ domain: this.verticalType, type: 'atomic_mcp' }).then(res => {
          console.log('获取到的MCP服务:', res.services)
          this.services = this.processServicesData(res.services || [])
          this.filterData = this.services
          this.initSelectedItems()
        })
      } catch (error) {
        console.error('获取服务失败:', error)
        this.services = []
        this.filterData = []
      } finally {
        this.loading = false
      }
    },

        processServicesData(rawServices) {
      return rawServices.map(service => {
        const apiInfo = service.apiList && service.apiList[0] ? service.apiList[0] : {}
        const tools = apiInfo.tools || []

        return {
          id: service.id,
          name: service.name,
          des: apiInfo.des,
          // 服务级别的原始数据，用于后续传递
          _serviceData: {
            status: service.status,
            apiName: apiInfo.name,
            apiUrl: apiInfo.url,
            tools: tools
          },
          children: tools.map((tool, index) => ({
            id: `${service.name}_tool_${index}`,
            name: tool.name,
            des: tool.des || '',
            isTool: true
          }))
        }
      })
    },

    initSelectedItems() {
      this.defaultCheckedKeys = []
      // 如果有初始选中的项目，标记为已选中并禁用
      console.log('初始选中的项目------', this.initialSelectedItems)
      this.initialSelectedItems.forEach(item => {
        if (item.id) {
          // 找到对应的服务并标记为选中（基于id匹配）
          const service = this.services.find(s => s.id === item.id)
          if (service) {
            this.defaultCheckedKeys.push(service.id)
            // 标记为禁用状态，防止取消选中
            service.disabled = true
            service._isInitialSelected = true
            // 注意：不要添加到selectedServices，因为这些是已经存在的服务
          }
        }
      })
      console.log('默认选中的keys:', this.defaultCheckedKeys)
      console.log('初始选中的服务（不包含在selectedServices中）')
    },
        handleCheck(data, checked) {
      console.log('节点选择变化:', data, checked)

      // 只处理服务级别的选择，忽略工具级别的选择
      if (data.isTool) {
        console.log('忽略工具节点选择:', data.name)
        return
      }

      // 检查是否试图取消选中初始选中的项目
      if (data._isInitialSelected && !checked.checkedKeys.includes(data.id)) {
        console.log('阻止取消选中初始选中的服务:', data.name)
        // 强制恢复选中状态
        this.$nextTick(() => {
          this.$refs.serviceTree && this.$refs.serviceTree.setChecked(data.id, true)
        })
        return
      }

      // 重新构建选中服务列表，包含初始选中和新选中的服务
      this.selectedServices = []

      // 首先添加所有初始选中的服务
      this.services.forEach(service => {
        if (service._isInitialSelected) {
          this.selectedServices.push(service)
        }
      })

      // 然后添加新选中的服务（排除初始选中的）
      checked.checkedKeys.forEach(key => {
        const service = this.findServiceById(key)
        if (service && !service.isTool && !service._isInitialSelected) {
          this.selectedServices.push(service)
        }
      })

      console.log('当前选中的服务总数:', this.selectedServices.length)
      console.log('其中初始选中:', this.selectedServices.filter(s => s._isInitialSelected).length)
      console.log('其中新选中:', this.selectedServices.filter(s => !s._isInitialSelected).length)
    },

    findServiceById(id) {
      // 在所有服务中查找指定ID的节点
      for (const service of this.services) {
        if (service.id === id) {
          return service
        }
        if (service.children) {
          for (const child of service.children) {
            if (child.id === id) {
              return child
            }
          }
        }
      }
      return null
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
      return cloneDeep(nodes).filter(node => {
        const serviceMatch = node.name.toLowerCase().includes(keyword)

        // 过滤工具节点
        if (node.children) {
          node.children = node.children.filter(tool =>
            tool.name.toLowerCase().includes(keyword) ||
            (tool.des && tool.des.toLowerCase().includes(keyword))
          )
        }

        // 如果服务名匹配或有匹配的工具，则显示该服务
        return serviceMatch || (node.children && node.children.length > 0)
      })
    },

    onConfirm() {
      // 只传递新选择的服务（排除初始选中的服务）
      const newlySelectedServices = this.selectedServices.filter(service =>
        !service._isInitialSelected
      )

      const selectedData = newlySelectedServices.map(service => ({
        id: service.id,
        name: service.name,
        des: service.des,
        apiName: service._serviceData.apiName,
        url: service._serviceData.apiUrl,
        tools: service._serviceData.tools,
        status: service._serviceData.status
      }))

      console.log('所有选中的服务:', this.selectedServices.length)
      console.log('新选择的服务:', selectedData.length)
      console.log('确认传递的新服务:', selectedData)

      this.$emit('confirm', selectedData)
      this.onClose()
    },
    onClose() {
      this.selectedServices = []
      this.dialogVisible = false
      this.$emit('close')
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

/* 树节点标签样式 */
.node-label {
  font-size: 14px;
  color: #333;
}

/* 工具描述样式 */
.tool-description {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
  font-style: italic;
}

/* 自定义树节点容器 */
.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

/* 服务节点样式 */
.service-node {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.service-icon {
  margin-right: 8px;
  color: #1890ff;
  font-size: 16px;
}

.tooltip-icon {
  margin-left: 8px;
  color: #1890ff;
  font-size: 14px;
}

/* 初始选中（禁用）的服务节点样式 */
.service-node.initial-selected {
  background-color: #f0f9ff;
  border-radius: 4px;
  padding: 2px 6px;
  opacity: 0.8;
}

.service-node.initial-selected .node-label {
  color: #666;
  font-style: italic;
}

.service-node.initial-selected .service-icon {
  color: #999;
}

/* 初始选中节点的复选框样式 */
::v-deep .el-tree-node__content:has(.initial-selected) .el-checkbox .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #d9d9d9 !important;
  border-color: #d9d9d9 !important;
}

::v-deep .el-tree-node__content:has(.initial-selected) .el-checkbox .el-checkbox__input.is-checked .el-checkbox__inner::after {
  border-color: #666 !important;
}

/* 工具节点样式 */
.tool-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: 24px; /* 缩进显示层级关系 */
}

.tool-icon {
  margin-right: 6px;
  color: #52c41a;
  font-size: 14px;
}

/* 隐藏子级工具节点的复选框 */
::v-deep .el-tree-node .el-tree-node .el-tree-node__content .el-checkbox {
  display: none !important;
}

/* 确保顶级服务节点的复选框显示 */
::v-deep .el-tree > .el-tree-node > .el-tree-node__content .el-checkbox {
  display: inline-block !important;
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
