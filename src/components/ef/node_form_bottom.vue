<template>
  <div v-show="node.name">
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label" style="width: 50%">编辑节点</span>
        <div class="ef-node-form-body">
          <el-form :model="node" ref="dataForm" label-width="80px" v-show="type === 'node'">
            <el-row>
              <el-col :span="12">
                <el-form-item label="调用地址">
                  <el-input v-model="node.url" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="名称">
                  <el-input v-model="node.name" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="left坐标">
                  <el-input v-model="node.left"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="top坐标">
                  <el-input v-model="node.top"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="ico图标">
                  <el-input v-model="node.ico"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="输入">
                  <el-input v-model="node.input" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="输出">
                  <el-input v-model="node.output" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="版本">
                  <el-input v-model="node.version" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <el-button type="danger" icon="el-icon-delete" @click="deleteElement">删除</el-button>
                  <el-button type="primary" icon="el-icon-check" @click="save">保存</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <el-form :model="line" ref="dataForm" label-width="80px" v-show="type === 'line'">
            <el-row>
              <el-col :span="24">
                <el-form-item label="条件">
                  <el-input v-model="line.label"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <el-button icon="el-icon-delete" @click="deleteElement">删除</el-button>
                  <el-button type="primary" icon="el-icon-check" @click="saveLine">保存</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
import { cloneDeep } from 'lodash'
// eslint-disable-next-line no-unused-vars
import { addFlowService } from '@/api/schedule'

export default {
  data () {
    return {
      visible: true,
      // node 或 line
      type: 'node',
      node: {},
      line: {},
      data: {},
      // 自定义的服务配置，包括服务api，因此先发ajax请求确认
      services: {}
      // 父组件传过来的流程数据
      // flowData: {}
    }
  },
  props: ['flowData', 'dataReloadClear'],
  methods: {
    /**
     * 表单修改，这里可以根据传入的ID进行业务信息获取
     * @param data
     * @param id
     */
    nodeInit (data, id) {
      this.type = 'node'
      this.data = data
      data.nodeList.filter((node) => {
        if (node.id === id) {
          this.node = cloneDeep(node)
        }
      })
    },
    lineInit (line) {
      this.type = 'line'
      this.line = line
    },
    // 修改连线
    saveLine () {
      this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
    },
    save () {
      this.data.nodeList.filter((node) => {
        if (node.id === this.node.id) {
          node.name = this.node.name
          node.left = this.node.left
          node.top = this.node.top
          node.ico = this.node.ico
          node.input = this.node.input
          node.output = this.node.output
          node.version = this.node.version
          this.$emit('repaintEverything')
        }
      })
    },
    deleteElement () {
      this.$emit('delete-element')
    },
    // 向服务器提交编排的service信息
    addScheduledService () {
      const k = this.services
      k.nodeList = this.flowData.nodeList
      k.lineList = this.flowData.lineList
      setTimeout(() => {
        this.$message.info('镜像正在打包上传，请稍等...')
      }, 1000)
      // 还未联调
      // addFlowService(k).then(result => {
      //   console.dir(result)
      //   this.$message.info('服务添加成功，请前往组合服务页查看')
      //   this.dataReloadClear()
      // }, () => {
      //   this.$message.warning('服务添加失败，请另起服务名称！')
      // })
    }
  }
}
</script>

<style>
.el-node-form-tag {
  position: absolute;
  top: 50%;
  margin-left: -15px;
  height: 40px;
  width: 15px;
  background-color: #fbfbfb;
  border: 1px solid rgb(220, 227, 232);
  border-right: none;
  z-index: 0;
}
</style>
