<template>
  <div class="flow-menu" ref="tool">
    <div v-for="menu in menuList" :key="menu.id">
      <span class="ef-node-pmenu" @click="menu.open = !menu.open"><i
        :class="{'el-icon-caret-bottom': menu.open,'el-icon-caret-right': !menu.open}"></i>&nbsp;{{ menu.name }}</span>
      <ul v-show="menu.open" class="flow-menu">
        <div v-for="(m, index) in menu.children" :key="index">
          <span class="ef-node-psubmenu" @click="m.open = !m.open"><i
            :class="{'el-icon-caret-bottom': m.open,'el-icon-caret-right': !m.open}"></i>&nbsp;{{ m.name }}</span>
          <ul v-show="m.open" class="f-node-menu-ul">
            <draggable @end="end" @start="move" v-model="m.children" :options="draggableOptions">
              <li v-for="subMenu in m.children" class="ef-node-menu-li" :key="subMenu.id" :type="subMenu.type">
                <i :class="subMenu.ico"></i> {{ subMenu.name }}
              </li>
            </draggable>
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
        // TODO 修改menulist
        menuList: [
          {
            id: '3',
            type: 'group',
            name: '低空飞行器操控服务',
            open: true,
            children: [
              {
                id: '100',
                type: 'group',
                name: '无人机目标识别服务',
                open: true,
                children: [{
                  id: '1001',
                  type: 'getTargetLocation', // TODO: 使用type指定不同的item
                  name: 'getTargetLocation',
                  ico: 'el-icon-location',
                  style: {}
                }, {
                  id: '1002',
                  type: 'getTargetInfo',
                  name: 'getTargetInfo',
                  ico: 'el-icon-user',
                  style: {}
                }]
              },
              {
                id: '101',
                type: 'group',
                name: '无人机远程控制服务',
                open: true,
                children: [{
                  id: '1101',
                  type: 'setTargetLocation',
                  name: 'setTargetLocation',
                  ico: 'el-icon-location',
                  style: {}
                }, {
                  id: '1102',
                  type: 'setMotionMode',
                  name: 'setMotionMode',
                  ico: 'el-icon-rank',
                  style: {}
                }]
              }
            ]
          }
        ],
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
    mounted () {
      // TODO: 获取微服务列表
      // getServiceList().then(response => {
      //   this.menuList = response.result
      //   console.dir(response.result)
      // })
    },
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

<!-- <style>
.flow-menu {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ef-node-pmenu {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  color: #333;
  transition: background-color 0.3s;
}

.ef-node-pmenu:hover {
  background-color: #e6f7ff;
  border-radius: 4px;
}

.el-icon-caret-bottom,
.el-icon-caret-right {
  margin-right: 8px;
}

.flow-menu ul {
  margin: 0;
  padding-left: 20px;
}

.ef-node-psubmenu {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  color: #555;
  transition: background-color 0.3s;
}

.ef-node-psubmenu:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.f-node-menu-ul {
  margin: 0;
  padding-left: 20px;
}

.ef-node-menu-li {
  display: flex;
  align-items: center;
  padding: 6px;
  color: #666;
  transition: background-color 0.3s;
}

.ef-node-menu-li:hover {
  background-color: #e8e8e8;
  border-radius: 4px;
}

.tt {
  background-color: rgba(0, 123, 255, 0.2);
}

</style> -->
