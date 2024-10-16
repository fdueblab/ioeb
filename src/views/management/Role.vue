<template>
  <a-card :bordered="false">
    <s-table :data="loadData" size="default" :columns="columns" ref="table">
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical"/>
        <a-dropdown>
          <a class="ant-dropdown-link">
            更多 <a-icon type="down"/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;">详情</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">禁用</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
      <span slot="status" slot-scope="tt">
        {{ tt| statusFilter }}
      </span>
      <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <a-row :gutter="24" :style="{marginBottom: '12px'}">
          <a-col :span="12" v-for="(role,index) in record.permissions" :key="index" :style="{marginBottom: '12px'}">
            <a-col :span="4">
              <span>{{ role.permissionName }}:</span>
            </a-col>
            <a-col :span="20" v-if="role.actionEntitySet.length>0">
              <a-tag color="cyan" v-for="(action,k) in role.actionEntitySet" :key="k">{{ action.describe }}</a-tag>
            </a-col>
            <a-col :span="20" v-else>---</a-col>
          </a-col>
        </a-row>
      </div>
    </s-table>

    <a-modal
      title="操作"
      :width="800"
      v-model="visible"
      @ok="handleOk"
    >
      <a-form :autoFormCreate="(form)=>{this.form = form}">

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="唯一识别码"
          hasFeedback
          validateStatus="success"
        >
          <a-input placeholder="唯一识别码" v-model="mdl.id" id="no" disabled="disabled"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="权限名称"
          hasFeedback
          validateStatus="success"
        >
          <a-input placeholder="起一个名字" v-model="mdl.name" id="permission_name"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="状态"
          hasFeedback
          validateStatus="warning"
        >
          <a-select v-model="mdl.status">
            <a-select-option value="1">正常</a-select-option>
            <a-select-option value="2">禁用</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="描述"
          hasFeedback
        >
          <a-textarea :rows="5" v-model="mdl.describe" placeholder="..." id="describe"/>
        </a-form-item>

        <a-divider/>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="赋予权限"
          hasFeedback
        >
          <a-select
            style="width: 100%"
            mode="multiple"
            v-model="mdl.actions"
            :allowClear="true"
          >
            <a-select-option v-for="(action, index) in permissionList" :key="index" :value="action.value">{{
              action.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

      </a-form>
    </a-modal>

  </a-card>
</template>

<script>
  import { STable } from '@/components'

  export default {
    name: 'Role',
    components: {
      STable
    },
    data() {
      return {
        description: '对角色的管理以及查看',
        // modal是否显示
        visible: false,

        form: null,
        mdl: {},

        // 高级搜索 展开/关闭
        advanced: false,

        // 查询参数
        queryParam: {},
        // 表头
        columns: [
          {
            title: '唯一识别码',
            dataIndex: 'id',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '角色名称',
            dataIndex: 'name'
          },
          {
            title: '状态',
            dataIndex: 'status',
            scopedSlots: { customRender: 'status' }
          },
          {
            title: '创建时间',
            dataIndex: 'createTime',
            sorter: true
          }, {
            title: '操作',
            width: '150px',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' }
          }
        ],
        // data里居然可以调用函数
        loadData: parameter => {
          return this.$http.get('/role', {
            params: Object.assign(parameter, this.queryParam)
          }).then(res => {
            console.log(res)
            return res.result
          })
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        }
      }
    },
    methods: {
      show() {
        console.log(loadData)
      },
      handleOk() {
        this.$refs.table.refresh()
      }
    },
    filters: {
      statusFilter(status) {
        const StatusMap = {
          1: '正常',
          2: '禁用'
        }
        return StatusMap[status]
      }
    }
  }
</script>

<style scoped>

</style>
