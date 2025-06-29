<template>
  <el-dialog
    title="元应用智能体及服务详情"
    :visible.sync="dialogVisible"
    width="70%"
  >
    <!--一个高亮显示的插件-->
    <codemirror
      :value="flowJsonData"
      :options="options"
      class="code"
    ></codemirror>
  </el-dialog>
</template>
<!--需要修改成json树的样式-->
<script>
  import 'codemirror/lib/codemirror.css'
  import { codemirror } from 'vue-codemirror'

  require('codemirror/mode/javascript/javascript.js')

  export default {
    data() {
      return {
        dialogVisible: false,
        flowJsonData: {},
        options: {
          mode: { name: 'javascript', json: true },
          lineNumbers: true
        }
      }
    },
    components: {
      codemirror
    },
    methods: {
      init(data) {
        this.dialogVisible = true
        this.flowJsonData = JSON.stringify(data, null, 4).toString()
      }
    }
  }
</script>
