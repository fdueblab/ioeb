<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-row>
        <a-col :sm="8" :xs="24">
          <info title="已发布模板" value="36" :bordered="true" />
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="使用中" value="12" :bordered="true" />
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="未使用" value="24" />
        </a-col>
      </a-row>
    </a-card>

    <a-card
      style="margin-top: 24px"
      :bordered="false"
      title="模板列表">

      <div slot="extra">
        <a-radio-group v-model="status">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="processing">使用中</a-radio-button>
          <a-radio-button value="waiting">未使用</a-radio-button>
        </a-radio-group>
        <a-input-search style="margin-left: 16px; width: 272px;" />
      </div>

      <div class="operate">
        <a-button type="dashed" style="width: 100%" icon="plus" @click="toAdd">点击添加模版</a-button>
      </div>

      <a-list size="large" :pagination="{showSizeChanger: true, showQuickJumper: true, pageSize: 5, total: 50}">
        <a-list-item :key="index" v-for="(item, index) in data">
          <a-list-item-meta :description="item.description">
            <a-avatar slot="avatar" size="large" shape="square" :src="item.avatar"/>
            <a slot="title">{{ item.title }}</a>
          </a-list-item-meta>
          <div slot="actions">
            <a>查看</a>
            <a-divider type="vertical" />
            <a @click="edit(item)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="你确定删除么？" @confirm="delConfirm">
              <template #icon><question-circle-outlined style="color: red" /></template>
              <a href="#">删除</a>
            </a-popconfirm>
          </div>
          <div class="list-content">
            <div class="list-content-item">
              <span>分类</span>
              <p><a-tag color="green">{{ item.class }}</a-tag></p>
            </div>
            <div class="list-content-item">
              <span>发布人</span>
              <p>{{ item.owner }}</p>
            </div>
            <div class="list-content-item">
              <span>发布时间</span>
              <p>{{ item.startAt }}</p>
            </div>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import Info from '../components/Info'
import TaskForm from '../modules/TaskForm'

const data = []
data.push({
  title: '设备控制模板',
  avatar: '',
  class: '前沿装备',
  classId: 0,
  description: '用于发布接收指令从而操作设备的微服务',
  owner: 'publisher',
  startAt: '2024-07-26 22:44'
})
data.push({
  title: '设备状态模板',
  avatar: '',
  class: '前沿装备',
  classId: 0,
  description: '用于发布获取设备状态信息的微服务',
  owner: 'publisher',
  startAt: '2024-07-26 22:44'
})
data.push({
  title: '视频直播模板',
  avatar: '',
  class: '前沿装备',
  classId: 0,
  description: '用于发布通过摄像头捕获设备活动时的视频流并实现直播的微服务',
  owner: 'publisher',
  startAt: '2024-07-26 22:44'
})
data.push({
  title: '视频分析模板',
  avatar: '',
  class: '前沿装备',
  classId: 0,
  description: '用于发布通过对操作过程所捕获视频流进行分析给出得分的微服务',
  owner: 'publisher',
  startAt: '2024-07-26 22:44'
})
data.push({
  title: '设备操作模板',
  avatar: '',
  class: '前沿装备',
  classId: 0,
  description: '用于发布实现可编辑、可预设的设备操作的用户端微服务',
  owner: 'publisher',
  startAt: '2024-07-26 22:44'
})
data.push({
  title: '操作评价模板',
  avatar: '',
  class: '前沿装备',
  classId: 0,
  description: '用于发布对用户对设备的操作进行评价打分的微服务',
  owner: 'publisher',
  startAt: '2024-07-26 22:44'
})

export default {
  name: 'StandardList',
  components: {
    Info,
    TaskForm
  },
  data () {
    return {
      data,
      status: 'all'
    }
  },
  methods: {
    toAdd () {
      this.$emit('onGoAdd')
    },
    edit (record) {
      console.log('record', record)
      this.$dialog(TaskForm,
        // component props
        {
          record,
          on: {
            ok () {
              console.log('ok 回调')
            },
            cancel () {
              console.log('cancel 回调')
            },
            close () {
              console.log('modal close 回调')
            }
          }
        },
        // modal props
        {
          title: '操作',
          width: 700,
          centered: true,
          maskClosable: false
        })
    },
    delConfirm() {
      this.$message.success('删除成功！')
    }
  }
}
</script>

<style lang="less" scoped>
.ant-avatar-lg {
    width: 48px;
    height: 48px;
    line-height: 48px;
}

.list-content-item {
    color: rgba(0, 0, 0, .45);
    display: inline-block;
    vertical-align: middle;
    font-size: 14px;
    margin-left: 40px;
    span {
        line-height: 20px;
    }
    p {
        margin-top: 4px;
        margin-bottom: 0;
        line-height: 22px;
    }
}
</style>
