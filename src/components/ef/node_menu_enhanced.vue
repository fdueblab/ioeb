<template>
  <div class="flow-menu" ref="tool">
    <div v-for="menu in menuList" :key="menu.id">
      <span class="ef-node-pmenu" @click="toggleMenu(menu.id)">
        <i :class="{'el-icon-caret-bottom': isMenuOpen(menu.id),'el-icon-caret-right': !isMenuOpen(menu.id)}"></i>
        {{ menu.name }}
      </span>
      <ul v-show="isMenuOpen(menu.id)" class="flow-menu">
        <div v-for="(service, index) in menu.children" :key="index">
          <!-- 微服务层级 -->
          <span class="ef-node-service" @click="toggleService(service.id || service.name)">
            <i :class="{'el-icon-caret-bottom': isServiceOpen(service.id || service.name),'el-icon-caret-right': !isServiceOpen(service.id || service.name)}"></i>
            <i class="el-icon-help service-icon"></i>
            {{ service.name }}
          </span>
          <!-- 工具列表（默认折叠） -->
          <ul v-show="isServiceOpen(service.id || service.name)" class="f-node-tool-ul">
            <li v-for="tool in service.children"
                :key="tool.id"
                class="ef-node-tool-li">
              <div class="tool-info">
                <div class="tool-header">
                  <span class="tool-name">{{ tool.name }}</span>
                </div>
                <div class="tool-description">{{ tool.description }}</div>
              </div>
            </li>
          </ul>
        </div>
      </ul>
    </div>
  </div>
</template>
<script>
  import draggable from 'vuedraggable'
  // import { getServiceList } from '@/api/schedule'

  const mousePosition = {
    left: -1,
    top: -1
  }

  export default {
    props: {
      menuList: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        activeNames: '1',
        // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
        draggableOptions: {
          preventOnFilter: false,
          sort: false,
          disabled: false,
          ghostClass: 'tt',
          // 不使用H5原生的配置
          forceFallback: true
          // 拖拽的时候样式
          // fallbackClass: 'flow-node-draggable'
        },
        // 默认打开的左侧菜单的id
        defaultOpeneds: ['1', '2'],
        nodeMenu: {},
        // 菜单和服务的展开状态管理
        openMenus: new Set(['9']), // 默认展开根菜单
        openServices: new Set() // 默认所有服务都折叠
      }
    },
    components: {
      draggable
    },
    created () {
      /**
       * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
       * @param event
       */
      if (this.isFirefox()) {
        document.body.ondrop = function (event) {
          // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
          mousePosition.left = event.layerX
          mousePosition.top = event.clientY - 50
          event.preventDefault()
          event.stopPropagation()
        }
      }
    },
    mounted () {},
    methods: {
      // 切换菜单展开状态
      toggleMenu(menuId) {
        if (this.openMenus.has(menuId)) {
          this.openMenus.delete(menuId)
        } else {
          this.openMenus.add(menuId)
        }
      },
      // 检查菜单是否展开
      isMenuOpen(menuId) {
        return this.openMenus.has(menuId)
      },
      // 切换服务展开状态
      toggleService(serviceId) {
        if (this.openServices.has(serviceId)) {
          this.openServices.delete(serviceId)
        } else {
          this.openServices.add(serviceId)
        }
      },
      // 检查服务是否展开
      isServiceOpen(serviceId) {
        return this.openServices.has(serviceId)
      },
      // 根据名称获取左侧菜单对象
      getMenuByName (name) {
        for (let i = 0; i < this.menuList.length; i++) {
          const children = this.menuList[i].children
          for (let j = 0; j < children.length; j++) {
            const sub = children[j].children
            for (let k = 0; k < sub.length; k++) {
              if (sub[k].name === name) {
                return sub[k]
              }
            }
          }
        }
      },
      // 根据id获取左侧菜单对象
      getMenuById (id) {
        for (let i = 0; i < this.menuList.length; i++) {
          const children = this.menuList[i].children
          for (let j = 0; j < children.length; j++) {
            const sub = children[j].children
            for (let k = 0; k < sub.length; k++) {
              if (sub[k].id === id) {
                return sub[k]
              }
            }
          }
        }
      },
      // 拖拽开始时触发
      move (evt, a, b, c) {
        const name = evt.item.textContent.trim()
        this.nodeMenu = this.getMenuByName(name)
      },
      // 拖拽结束时触发
      end (evt, e) {
        this.$emit('addNode', evt, this.nodeMenu, mousePosition)
      },
      // 是否是火狐浏览器
      isFirefox () {
        const userAgent = navigator.userAgent
        if (userAgent.indexOf('Firefox') > -1) {
          return true
        }
        return false
      }
    }
  }
</script>

<style>
.flow-menu {
  background-color: #f9f9f9;
  border-radius: 8px;
}

.ef-node-pmenu {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  color: #333;
  font-weight: 600;
  transition: background-color 0.3s;
  border-bottom: 1px solid #e8e8e8;
}

.ef-node-pmenu:hover {
  background-color: #e6f7ff;
}

.el-icon-caret-bottom,
.el-icon-caret-right {
  margin-right: 8px;
  color: #666;
}

.flow-menu ul {
  margin: 0;
  padding-left: 0;
}

.ef-node-service {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  color: #333;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.ef-node-service:hover {
  background-color: #e6f7ff;
}

.service-icon {
  margin-right: 8px;
  font-size: 16px;
}

.f-node-tool-ul {
  margin: 0;
  padding: 0;
  background-color: #fafafa;
  border-left: 3px solid #52c41a;
  margin-left: 16px;
}

.ef-node-tool-li {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
  cursor: default;
}

.ef-node-tool-li:hover {
  background-color: #f5f5f5;
}

.ef-node-tool-li:last-child {
  border-bottom: none;
}

.tool-info {
  width: 100%;
}

.tool-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.tool-name {
  font-weight: 500;
  color: #333;
  font-size: 12px;
  font-family: 'Consolas', monospace;
}

.tool-description {
  color: #999;
  font-size: 11px;
  line-height: 1.4;
}

.tt {
  background-color: rgba(0, 123, 255, 0.2);
}
</style>
