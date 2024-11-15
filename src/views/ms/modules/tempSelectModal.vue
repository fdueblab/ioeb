<template>
  <a-modal
    title="选择发布模板"
    width="80%"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-card
        title="模板列表">
        <div slot="extra">
          <a-input-search style="margin-left: 16px; width: 272px;" />
        </div>
        <a-list size="large" :pagination="{showSizeChanger: true, showQuickJumper: true, pageSize: 5, total: 50}">
          <a-list-item :key="index" v-for="(item, index) in data">
            <a-list-item-meta :description="item.description">
              <a-avatar slot="avatar" size="large" shape="square" :src="item.avatar"/>
              <a slot="title">{{ item.title }}</a>
            </a-list-item-meta>
            <div slot="actions">
              <a @click="handleConfirm()">点击选择</a>
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
    </a-spin>
    <template slot="footer">
      <a-button key="cancel" @click="handleCancel">取消</a-button>
    </template>
  </a-modal>
</template>

<script>
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
  name: 'StepByStepModal',
  data () {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      data,
      visible: false,
      confirmLoading: false,
      currentStep: 0,
      mdl: {},

      form: this.$form.createForm(this)
    }
  },
  methods: {
    open () {
      this.visible = true
    },
    handleConfirm () {
      this.confirmLoading = true
      setTimeout(() => {
        this.visible = false
        this.$emit('confirm')
      }, 1500)
    },
    handleCancel () {
      this.visible = false
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
