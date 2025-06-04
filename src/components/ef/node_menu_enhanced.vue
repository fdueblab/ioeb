<template>
  <div class="flow-menu" ref="tool">
    <div v-for="menu in menuList" :key="menu.id">
      <span class="ef-node-pmenu" @click="menu.open = !menu.open">
        <i :class="{'el-icon-caret-bottom': menu.open,'el-icon-caret-right': !menu.open}"></i>
        {{ menu.name }}
      </span>
      <ul v-show="menu.open" class="flow-menu">
        <div v-for="(service, index) in menu.children" :key="index">
          <!-- 微服务层级 -->
          <span class="ef-node-service" @click="service.open = !service.open">
            <i :class="{'el-icon-caret-bottom': service.open,'el-icon-caret-right': !service.open}"></i>
            <!-- todo: 根据状态改颜色-->
            <i class="el-icon-help service-icon"></i>
            {{ service.name }}
          </span>
          <!-- 工具列表（默认折叠） -->
          <!-- todo: 根据父节点状态改颜色-->
          <ul v-show="service.open" class="f-node-tool-ul">
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

  var mousePosition = {
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
        nodeMenu: {}
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
      // 根据类型获取左侧菜单对象
      getMenuByType (type) {
        for (let i = 0; i < this.menuList.length; i++) {
          const children = this.menuList[i].children
          for (let j = 0; j < children.length; j++) {
            const sub = children[j].children
            for (let k = 0; k < sub.length; k++) {
              if (sub[k].type === type) {
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
        var type = evt.item.attributes.type.nodeValue
        this.nodeMenu = this.getMenuByType(type)
      },
      // 拖拽结束时触发
      end (evt, e) {
        this.$emit('addNode', evt, this.nodeMenu, mousePosition)
      },
      // 是否是火狐浏览器
      isFirefox () {
        var userAgent = navigator.userAgent
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
  color: #52c41a;
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
