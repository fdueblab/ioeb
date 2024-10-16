<template>
  <div>
    <a-card :bordered="true">
      <div>
        <a-button-group id="components-button-group">
          <a-button icon="sync" class="button-blue">更新</a-button>
          <a-button type="danger" icon="delete">删除</a-button>
        </a-button-group>
        <a-button class="button-blue" style="margin-left:20px" icon="plus">添加服务</a-button>
      </div>
      <a-divider/>

      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="54">
              <a-input placeholder="搜索"/>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="search()">搜索</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <s-table
        :columns="columns"
        :data="loadData"
        ref="table"
        rowKey="Name"
        :alert="{ show: true, clear: true }"
        :rowSelection="{ selectedRowKeys: this.selectedRowKeys, onChange: this.onSelectChange }">

        <a slot="Name" slot-scope="text,record,index" style="font-size:18px;font-weight: bold">
          {{ text }}

        </a>

        <div slot="Mode" slot-scope="text,record,index">
          重复<span class="schedule_mode">{{ text }}</span>
          /<span class="schedule_mode">{{ text }}</span>
          <span class="schedule_button" :hidden="!scaledDisabled[index]">
            <a-button type="link" @click="toggle(index)">
              <a-icon type="arrows-alt"/>扩缩容
            </a-button>
          </span>

          <span :hidden="scaledDisabled[index]">
            <a-input-number v-model="scaleNum[index]" :min="1" :max="10"/>
            <a-button icon="close" type="primary" size="small" @click="toggle(index)"></a-button>
            <a-button icon="check" type="primary" size="small" @click="scaleService(record,index)"></a-button>
          </span>
        </div>

      </s-table>
    </a-card>
  </div>
</template>

<script>

  import { STable } from '@/components'
  import { scaleService } from '@/api/swarm'

  export default {
    name: 'Service',
    components: {
      STable
    },
    data() {
      return {
        testhidden: [true, false, true],

        // 查询参数
        queryParam: {},
        kkk: 1,

        // 表头
        columns: [
          {
            title: '名称',
            dataIndex: 'name',
            scopedSlots: { customRender: 'Name' }
          },
          {
            title: '服务集合',
            dataIndex: 'stack'
          },

          {
            title: '镜像',
            dataIndex: 'image',
            scopedSlots: {
              customRender: 'Image'
            }
          },
          {
            title: '调度',
            dataIndex: 'replicas',
            scopedSlots: {
              customRender: 'Mode'
            }
          },
          {
            title: '端口映射',
            dataIndex: 'ports'
            // customRender: (text) => {
            //   let s = ''
            //   for (let i = 0; i < text.length; i++) {
            //     s += text[i].PublicPort
            //     s += ':'
            //     s += text[i].PrivatePort
            //     if (i !== text.length - 1)
            //       s += ','
            //   }
            //   return s
            // }
          },
          {
            title: '更新时间',
            dataIndex: 'updatedAt'
          }
        ],
        // 表格数据
        loadData: parameter => {
          return this.$http.get('/swarm/service', {
            params: Object.assign(parameter, this.queryParam)
          }).then(res => {
            console.dir(res)
            this.afterwards(res.result)
            return res.result
          })
        },
        // 选择的行
        selectedRowKeys: [],
        selectedRows: [],

        // toggle disabled array[] 每一行是否要显示扩容输入框
        scaledDisabled: [],
        // 要扩容的数目
        scaleNum: []
      }
    },
    filters: {
      timeFilter(time) {
        const statusMap = {
          1: '正常',
          2: '禁用'
        }
        if (time === '1') {
          return statusMap[0]
        } else { return statusMap[1] }
      },
      nameFilter(name) {
        return name[0].substring(1)
      }
    },
    methods: {
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      // status filter
      statusFilter(text) {
        if (text.indexOf('Up') !== -1) { return 0 }
      },
      // 更改scale出现的组件
      toggle(index) {
        this.$set(this.scaledDisabled, index, !this.scaledDisabled[index])
      },
      // scaleService
      scaleService(record, index) {
        let param = {}
        param = {
          id: record.id,
          scaleTo: this.scaleNum[index]
        }
        scaleService(param).then(res => {
          console.log('来自scaleService' + res)
          this.$refs.table.refresh()
          this.$set(this.scaledDisabled, index, true)
        })
      },
      // 在loadData中接收数据以后的处理
      afterwards(res) {
        for (const k of res.data) {
          this.scaledDisabled.push(true)
          this.scaleNum.push(k.replicas)
        }
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

  #components-button-demo-button-group > a-button-group {
    margin-right: 8px;
  }

  .button-green {
    color: #fff;
    background-color: #5cb85c;
    border-color: #4cae4c;
  }

  .button-blue {
    color: #fff;
    background-color: #337ab7;
    border-color: #2e6da4;
  }

  .schedule_mode {
    color: #c7254e;
    background-color: #f9f2f4;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 90%;
  }

  .schedule_button {
    color: #337ab7;
  }
</style>
