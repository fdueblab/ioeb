<template>
  <div>
    <a-card :bordered="true">
      <div>
        <a-button-group id="components-button-group">
          <a-button
            class="button-green"
            icon="caret-right"
            @click="launchContainers()"
            :disabled="allDisabled || startButtonDisabled">启动
          </a-button>
          <a-button type="danger" icon="stop" :disabled="allDisabled || stopButtonDisabled" @click="stopContainers">停止
          </a-button>
          <a-button type="danger" icon="delete" :disabled="allDisabled || startButtonDisabled" @click="deleteContainers">删除</a-button>
          <a-button icon="sync" class="button-blue" :disabled="allDisabled" @click="restartContainers">重启</a-button>
          <a-button class="button-blue" icon="pause" :disabled="allDisabled || !resumeButtonDisabled ">暂停</a-button>
          <a-button class="button-blue" icon="step-forward" :disabled="allDisabled || resumeButtonDisabled">恢复
          </a-button>
        </a-button-group>
        <a-button class="button-blue" style="margin-left:20px" icon="plus" @click="gotonewcon">新建容器</a-button>
      </div>
      <a-divider/>

      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="名称">
                <a-input placeholder="搜索"/>
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="search()">查询</a-button>
                <a-button style="margin-left: 8px">重置</a-button>
              </span>
            </a-col>
          </a-row>

        </a-form>
      </div>
      <!-- 使用s-table完成数据展示-->
      <a-table
        :columns="columns"
        ref="table"
        rowKey="key"
        :data-source="dataSource"
        :alert="{ show: true, clear: true }"
        :rowSelection="{ selectedRowKeys: this.selectedRowKeys, onChange: this.onSelectChange }"
        showPagination="auto">
        <!-- slot 作为过滤器-->
        <span slot="Names" slot-scope="text" style="font-size:18px;font-weight: bold">
          {{ text|nameFilter }}
        </span>
        <div slot="Action" slot-scope="text" style="width:60px">
          <a-button @click="handleLog(text)" icon="copy" size="small"></a-button>
          <a-button @click="handleDetail(text)" icon="info-circle" size="small"></a-button>
        </div>
        <div slot="Status" slot-scope="text">
          <a-tag color="#87d068" v-if="statusFilter(text)===0">Running</a-tag>
          <a-tag color="#f50" v-else-if="statusFilter(text) === 1">Stopped</a-tag>
          <a-tag color="#f0ad4e" v-else>Paused</a-tag>
        </div>
        <div slot="Image" slot-scope="text" style="width:200px">
          {{ text }}
        </div>
      </a-table>
    </a-card>
  </div>
</template>

<script>

import { STable } from '@/components'
import { startContainer, stopContainer, restartContainer, deleteContainer } from '@/api/docker'

export default {
  name: 'Container',
  components: {
    STable
  },
  data () {
    return {
      startButtonDisabled: false,
      resumeButtonDisabled: false,
      stopButtonDisabled: false,
      allDisabled: true, // 用户没有选择的时候，所有按钮均不可用
      // 查询参数
      queryParam: {},
      test1: 'hello',
      kind: 'petclinic',
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '容器名称',
          dataIndex: 'Names',
          // customRender: (text) => {
          //   return text[0].substring(1, text[0].length)
          // },
          scopedSlots: { customRender: 'Names' }
        },
        {
          title: '操作',
          dataIndex: 'Action',
          scopedSlots: {
            customRender: 'Action'
          }
        },
        {
          title: '状态',
          dataIndex: 'Status',
          scopedSlots: {
            customRender: 'Status'
          }
        },
        {
          title: '镜像',
          dataIndex: 'Image',
          scopedSlots: {
            customRender: 'Image'
          }
        },
        {
          title: '创建时间',
          dataIndex: 'Created',
          customRender: (text) => {
            const date = new Date(text * 1000)
            const YY = date.getFullYear() + '-'
            const MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
            const DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
            const hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
            const mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
            const ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
            return YY + MM + DD + ' ' + hh + mm + ss
          }
        },
        {
          title: '所属网络',
          dataIndex: 'HostConfig',
          customRender: (text) => {
            return text.NetworkMode
          }
        },
        {
          title: '端口映射',
          dataIndex: 'Ports',
          customRender: (text) => {
            let s = ''
            for (let i = 0; i < text.length; i++) {
              s += text[i].PublicPort
              s += ':'
              s += text[i].PrivatePort
              if (i !== text.length - 1) {
                s += ','
              }
            }
            return s
          }
        }
      ]
    }
  },
  filters: {
    timeFilter (time) {
      const statusMap = {
        1: '正常',
        2: '禁用'
      }
      if (time === '1') {
        return statusMap[0]
      } else {
        return statusMap[1]
      }
    },
    nameFilter (name) {
      console.log(name)
      return name[0].substring(1)
    }
  },
  methods: {
    testRefresh () {
      this.selectedRows.splice(0)
      this.selectedRowKeys.splice(0)
    },
    // 容器日志页
    handleLog (record) {
      this.$router.push({
        path: '/microservices/container/logs',
        query: {
          key: record.Names[0]
        }
      })
    },
    // 容器json格式化页=docker inspect
    handleDetail (record) {
      this.$router.push({
        path: '/microservices/container/json',
        query: {
          name: record.Names,
          id: record.Id
        }
      })
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows

      this.startButtonDisabled = false
      this.stopButtonDisabled = false
      this.resumeButtonDisabled = false
      this.allDisabled = this.selectedRows.length === 0

      for (let i = 0; i < this.selectedRows.length; i++) {
        if (this.selectedRows[i].Status.indexOf('Up') !== -1) {
          this.startButtonDisabled = true
          if (this.selectedRows[i].Status.indexOf('Paused') !== -1) {
            this.resumeButtonDisabled = true
          }
        } else if (this.selectedRows[i].Status.indexOf('Exited') !== -1) {
          this.stopButtonDisabled = true
        }
      }
    },
    // status filter
    statusFilter (text) {
      if (text.indexOf('Up') !== -1) {
        return 0
      } else if (text.indexOf('Paused') !== -1) {
        return 2
      } else {
        return 1
      }
    },
    getIds () {
      const g = []
      for (const row in this.selectedRows) {
        if (this.selectedRows[row].Status.indexOf('Up') === -1) {
          g.push(this.selectedRows[row].Id)
        }
      }
      return g
    },
    gotonewcon () {
      this.$router.push({
        path: '/microservices/newcontainer'
      })
    },
    // 启动容器，如果有容器已经是启动状态，不启动
    launchContainers () {
      const k = {}
      k.ids = []
      // console.log(this.selectedRows)
      for (const row in this.selectedRows) {
        if (this.selectedRows[row].Status.indexOf('Up') === -1) {
          k.ids.push(this.selectedRows[row].Id)
        }
      }
      // testPost(k).then(res => {
      //   if (res.code === 200) {
      //     console.log('一次重启!')
      //     this.$refs.table.refresh()
      //   }
      // })
      startContainer(k).then(res => {
        if (res.code === 200) {
          this.$refs.table.refresh(true)
          this.selectedRows.splice(0)
          this.selectedRowKeys.splice(0)
          this.allDisabled = true
        }
      })
    },
    deleteContainers () {
      const k = {}
      k.ids = []
      for (const row in this.selectedRows) {
        k.ids.push(this.selectedRows[row].Id)
      }
      console.dir(k)
      deleteContainer(k).then(res => {
        console.log('res', res)
        if (res.code === 200) {
          this.$refs.table.refresh()
          this.selectedRows.splice(0)
          this.selectedRowKeys.splice(0)
          this.allDisabled = true
        }
      })
    },
    stopContainers () {
      const k = {}
      k.ids = []
      // console.log(this.selectedRows)
      for (const row in this.selectedRows) {
        if (this.selectedRows[row].Status.indexOf('Exited') === -1) {
          k.ids.push(this.selectedRows[row].Id)
        }
      }
      // 显示对象的所有属性和方法
      console.dir(k)
      stopContainer(k).then(res => {
        console.log('res', res)
        if (res.code === 200) {
          setTimeout(function () {
            console.log('hello')
          }, 3000)
          this.$refs.table.refresh(true)
          this.selectedRows.splice(0)
          this.selectedRowKeys.splice(0)
          this.allDisabled = true
        }
      })
    },
    restartContainers () {
      const k = {}
      k.ids = []
      // console.log(this.selectedRows)
      for (const row in this.selectedRows) {
        k.ids.push(this.selectedRows[row].Id)
      }
      restartContainer(k).then(res => {
        console.log(res)
        if (res.code === 200) {
          this.$refs.table.refresh()
          this.selectedRows.splice(0)
          this.selectedRowKeys.splice(0)
          this.allDisabled = true
        }
      })
    }
  }
}
</script>

<style scoped>
#components-button-demo-button-group > h4 {
  margin: 16px 0;
  font-size: 14px;
  line-height: 1;
  font-weight: normal;
}

#components-button-demo-button-group > h4:first-child {
  margin-top: 0;
}

/*  #components-button-demo-button-group .ant-btn-group {
    margin-right: 8px;
  }  */
#components-button-demo-button-group > a-button-group {
  margin-right: 8px;
}

.button-green[disabled] {
  color: rgba(0, 0, 0, 0.25);
  background-color: #f5f5f5;
  border-color: #d9d9d9;
}

.button-green {
  color: #fff;
  background-color: #5cb85c;
  border-color: #4cae4c;
}

.button-blue[disabled] {
  color: rgba(0, 0, 0, 0.25);
  background-color: #f5f5f5;
  border-color: #d9d9d9;
}

.button-blue {
  color: #fff;
  background-color: #337ab7;
  border-color: #2e6da4;
}
</style>
