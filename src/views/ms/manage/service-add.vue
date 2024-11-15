<template>
  <page-header-wrapper>
    <a-card :bordered="false" :body-style="{paddingTop: '0', paddingBottom: '15', paddingLeft: '15px', paddingRight: '15px'}">
      <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
        <a-tab-pane loading="true" tab="使用说明" key="1">
          <a-card>
            <b><b>1.文档说明</b></b><br><br>
            <b>1.1文档说明</b><br>
            本文档描述视频直播服务提供直播推流、直播播流、直播安全、直播管理、数据统计等服务，可用于应用和服务集成。
            服务提供者需根据服务规范开发上传服务，并通过服务检测后方可成功上传共享。<br><br>
            <b>1.2阅读对象</b><br>
            《外调内-外部商户接入合作商网关标准文档》是面向具有一定的开发能力，了解JAVA 等开发语言，及具有一定Android/IOS客户端开发能力，了解Android/IOS客户端的开发和管理人员。<br><br>
            <b><b>2.数据格式规范说明</b></b><br><br>
            <a-table :columns="columns3" :data-source="data3">
              <a slot="name" slot-scope="text">{{ text }}</a>
              <span slot="customTitle"><a-icon type="smile-o" /> Name</span>
              <span slot="tags" slot-scope="tags">
                <a-tag
                  v-for="tag in tags"
                  :key="tag"
                  :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"
                >
                  {{ tag.toUpperCase() }}
                </a-tag>
              </span>
              <span slot="action" slot-scope="text, record">
                <a>Invite 一 {{ record.name }}</a>
                <a-divider type="vertical" />
                <a>Delete</a>
                <a-divider type="vertical" />
                <a class="ant-dropdown-link"> More actions <a-icon type="down" /> </a>
              </span>
            </a-table>
            <b><b>3.接入准备（重要）</b></b><br><br>
            <b>3.1合作商</b><br>
            3.1.1网络准备<br>
            1、关联业务方确认网络区域是专线或公网；<br>
            2、合作商提供访问的ip或域名（测试环境、生产环境）；<br>
            3.1.2安全准备<br>
            1、与关联业务系统确认传输报文加解密及加验签算法及规则，可使用本平台提供的默认方式；<br>
            2、与关联业务系统确认秘钥（测试环境、生产环境），按照安全部门秘钥生命周期管理要求：“各密钥有效生命周期必须不大于三年（非对称算法中的根证书及中介根证书除外）”；<br><br>

            <b>3.2项目</b><br>
            3.2.1网络准备<br>
            1、与合作商确认网络区域是专线或公网；<br>
            2、平安付提供合作访问的ip或域名（具体环境请参考第7章）；<br>
            3、平安付内调外服务须对合作商ip或域名进行开墙，业务系统自行提交achain流程；<br>
            4、平安付外调内服务须将合作商ip或域名加入白名单，业务系统自行提交achain流程；<br><br>

            3.2.2安全准备<br>
            1、与合作商确认传输报文加解密及加验签算法及规则，可使用本平台提供的默认方式或双方约定；<br>
            2、若使用本平台算法，需按照合作商维度申请秘钥，并在加密机中托管，业务系统自行提交achain流程；<br>
            3、若使用双方约定算法，需与安全部门评估交互安全性，业务系统自行组织安排与安全部门评估会议并将确认通过邮件抄送本平台；<br>
            按照公司部门秘钥生命周期管理要求：“各密钥有效生命周期必须不大于三年（非对称算法中的根证书及中介根证书除外）”，本平台管理的秘钥索引默认有效期为三年，临近过期会邮件通知各业务相关人员；<br><br>

            <b><b>4.接入接口说明</b></b><br><br>
            <b>4.1 通用接口一 </b><br><br>
            <div><b><b>5.接口使用详细说明</b></b><br><br>
              <b>5.1接口流程和功能说明</b><br>
              商户通过http/https请求合作商接入平台进行交互；<br><br>
              <b>5.2接口调用方向</b><br>
              合作商—>平安付<br><br>
              <b>5.3接口调用协议</b><br>
              (1)双方通过HTTP/HTTPS方式交互数据 ；<br>
              (2)专线支持HTTP协议；<br>
              (3)公网只支持HTTPS协议，并且TLS版本支持1.1和1.2，接入合作商请提前确认访问是否可支持该版本；<br><br>

              <b>5.4应答码说明</b><br>
              Pmgw 系统是平安付对外部合作商接入接出平台，不对业务交互报文再进行包装处理，因此将平台异常信息和内部异常使用自定义HTTP状态码：
              （1）常见的状态码: 如200 (服务器成功返回网页)，503(服务不可用) 等；
              Pmgw自定义状态码：以51开头，具体说明如下;</div>
          </a-card>
        </a-tab-pane>
        <a-tab-pane loading="true" tab="标准规范" key="2">
          <a-card>
            <div style="margin-left: 30px"><b>函数：</b>pusher<br></br>
              <b>描述：</b>基于提供的推流和拉流地址启动一个转推流进程<br></br>
              <b>请求类型：</b> POST<br><br>
              <b>接口方式：</b><br>
              HTTP POST Content_type:  application/x-www-form-urlencoded; charset=UTF-8<br><br>
              <b>加密算法：</b>无<br><br>
              <b>签名算法：</b>无<br><br>
              <b>请求参数</b></div>
            <a-table style="margin-left: 30px" :columns="columns" :data-source="data">
              <a slot="name" slot-scope="text">{{ text }}</a>
            </a-table>

            <div style="margin-left: 30px"><b>返回数据</b></div>
            <a-table style="margin-left: 30px" :columns="columns2" :data-source="data2">
              <a slot="name" slot-scope="text">{{ text }}</a>
              <span slot="customTitle"><a-icon type="smile-o" /> Name</span>
              <span slot="tags" slot-scope="tags">
                <a-tag
                  v-for="tag in tags"
                  :key="tag"
                  :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"
                >
                  {{ tag.toUpperCase() }}
                </a-tag>
              </span>
              <span slot="action" slot-scope="text, record">
                <a>Invite 一 {{ record.name }}</a>
                <a-divider type="vertical" />
                <a>Delete</a>
                <a-divider type="vertical" />
                <a class="ant-dropdown-link"> More actions <a-icon type="down" /> </a>
              </span>
            </a-table>

            <div><b>正常返回示例</b>
            </div>
          </a-card>
        </a-tab-pane>
        <a-tab-pane loading="true" tab="填写表单" key="3">
          <a-spin :spinning="confirmLoading">
            <a-form-model :model="form">
              <a-form-model-item
                label="名称"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-input v-model="form.name" />
              </a-form-model-item>
              <a-form-model-item
                label="服务描述"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-textarea v-model="form.desc" :rows="4"></a-textarea>
              </a-form-model-item>
              <a-form-model-item
                label="服务URI"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-input v-model="form.uri" />
              </a-form-model-item>
              <a-form-model-item
                label="服务端口"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-input v-model="form.port" />
              </a-form-model-item>
              <a-form-model-item
                label="开发者名称"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-input v-model="form.developer" />
              </a-form-model-item>
              <a-form-model-item
                label="联系方式"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-input v-model="form.phone" />
              </a-form-model-item>
              <a-form-model-item
                label="联系地址"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-input v-model="form.address" />
              </a-form-model-item>
              <a-form-model-item
                label="文件上传"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-upload directory>
                  <a-button>
                    <a-icon type="upload"/>
                    选择文件
                  </a-button>
                </a-upload>
              </a-form-model-item>
            </a-form-model>
          </a-spin>
        </a-tab-pane>
      </a-tabs>
      <div style="text-align: center; margin-top: 10px">
        <a-button style="margin-left: 10px" key="cancel" @click="handleCancel">取消</a-button>
        <a-button style="margin-left: 10px" key="forward" :loading="confirmLoading" type="primary" @click="handleSubmit(currentStep)">提交</a-button>
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import pick from 'lodash.pick'
import formGenerator from '../components/form-generator/index.vue'
import { RankList } from '@/components'

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '类型',
    dataIndex: 'age',
    key: 'age',
    width: 150
  },
  {
    title: '是否必选',
    dataIndex: 'addre',
    key: 'address 1',
    ellipsis: true,
    width: 150
  },
  {
    title: '示例值',
    dataIndex: 'addres',
    key: 'address 2',
    ellipsis: true
  },
  {
    title: '描述',
    dataIndex: 'address',
    key: 'address 3'
  }
]

const columns2 = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '类型',
    dataIndex: 'age',
    key: 'age',
    width: 150
  },
  {
    title: '示例值',
    dataIndex: 'addres',
    key: 'address 2',
    ellipsis: true
  },
  {
    title: '描述',
    dataIndex: 'address',
    key: 'address 3'
  }
]

const columns3 = [
  {
    title: '序号',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '类型',
    dataIndex: 'age',
    key: 'age',
    width: 150
  },
  {
    title: '说明',
    dataIndex: 'addre',
    key: 'address 1',
    ellipsis: true,
    width: 150
  },
  {
    title: '分类',
    dataIndex: 'addres',
    key: 'address 2',
    ellipsis: true
  },
  {
    title: '附加类型',
    dataIndex: 'address',
    key: 'address 3'
  }
]
const data = [
  // {
  //   key: '1',
  //   name: 'data',
  //   age: 'String',
  //   addre: '是',
  //   addres: '(id,pushSrcUrl,pushDescUrl)',
  //   address: '推流task实体类，含PushTask的id，推流源地址，推流目的地址',
  // },
  {
    key: '1',
    name: 'id',
    age: 'String',
    addre: '是',
    addres: '23545334',
    address: '推流task实体类，含PushTask的id，推流源地址，推流目的地址'
  },
  {
    key: '2',
    name: 'pushSrcUrl',
    age: 'String',
    addre: '是',
    addres: 'http://1.15.143.80:8090/control/get?room=movie',
    address: '推流源地址'
  },
  {
    key: '3',
    name: 'pushDescUrl',
    age: 'String',
    addre: '是',
    addres: 'http://1.15.143.80:8090/push',
    address: '推流目的地址'
  },
  {
    key: '4',
    name: 'value',
    age: 'String',
    addre: '是',
    addres: '推流id',
    address: 'ApiParam参数'
  },
  {
    key: '5',
    name: 'appBusinessType',
    age: 'String',
    addre: '否',
    addres: '业务类型',
    address: 'APPLICATION-进件'
  },
  {
    key: '6',
    name: 'productCode',
    age: 'String',
    addre: '否',
    addres: '产品编码',
    address: '产品的编码'
  },
  {
    key: '7',
    name: 'fromSystem',
    age: 'String',
    addre: '否',
    addres: '来源系统',
    address: '来源系统来源系统'
  },
  {
    key: '8',
    name: 'channelBatchNo',
    age: 'String',
    addre: '否',
    addres: '批次号',
    address: '用于标识某一批次'
  }
]

const data2 = [
  {
    key: '1',
    name: 'status',
    age: 'ResultVO',
    addres: '(data,0,‘成功’)',
    address: 'ResultUtil类中的成功状态，setCode为0'
  },
  {
    key: '2',
    name: 'respCode',
    age: 'String',
    addres: '000000',
    address: '000000-成功\n' +
      '其它返回码-失败'
  },
  {
    key: '3',
    name: 'respMsg',
    age: 'String',
    addres: '200',
    address: '返回信息'
  },
  {
    key: '4',
    name: 'reqSerialNo',
    age: 'String',
    addres: '36',
    address: '请求入参中的流水号'
  }
]

const data3 = [
  {
    key: '1',
    name: '1',
    age: 'String',
    addre: '字符串类型',
    addres: 'simpleType（简单类型）',
    address: '12345abc'
  },
  {
    key: '2',
    name: '2',
    age: 'data',
    addre: '日期，格式为yyyy-mm-dd',
    addres: 'simpleType（简单类型）',
    address: '2014-09-15'
  },
  {
    key: '3',
    name: '3',
    age: 'datetime',
    addre: '日期和时间，格式为yyyy-mm-dd HH:MM:SS',
    addres: 'simpleType（简单类型）',
    address: '2014-09-15 22:12:56'
  },
  {
    key: '4',
    name: '4',
    age: 'time',
    addre: '时间，格式为HH:MM:SS',
    addres: 'simpleType(简单类型)',
    address: '22:12:56'
  },
  {
    key: '5',
    name: '5',
    age: 'number(P，S)',
    addre: '数字类型， P为精度位，S为小数位',
    addres: 'simpleType（简单类型）',
    address: '1.01'
  },
  {
    key: '6',
    name: '6',
    age: 'json',
    addre: 'json字符串',
    addres: 'complexType (复杂类型)',
    address: '{"bankEnc":"1E13ADED7E411D0804CE99AC6FD08ADCC5CC226DAB3A44CB","cardType":"B"}'
  },
  {
    key: '7',
    name: '7',
    age: 'xml',
    addre: 'xml字符串',
    addres: 'complexType (复杂类型)',
    address: '{"bankEnc":"1E1dsjakdastgjhsdA44CB","cardType":"B"}'
  }
]

export default {
  name: 'StepByStepModal',
  components: {
    RankList,
    formGenerator
  },
  data () {
    return {
      columns,
      columns2,
      columns3,
      data,
      data2,
      data3,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      visible: false,
      confirmLoading: false,
      currentStep: 0,
      instructions: '<h2>使用说明</h2>',
      standard: '<h2>标准规范</h2>',
      editorOption: {
        // Some Quill options...
      },
      form: {
        name: ''
      }
    }
  },
  methods: {
    open () {
      this.visible = true
    },
    close () {
      this.visible = false
    },
    edit (record) {
      this.visible = true
      const { form: { setFieldsValue } } = this
      this.$nextTick(() => {
        setFieldsValue(pick(record, []))
      })
    },
    handleSubmit() {
      this.confirmLoading = true
      setTimeout(() => {
        this.confirmLoading = false
        this.$message.success('添加成功！')
        this.$emit('onGoBack')
      }, 1500)
    },
    backward () {
      this.currentStep--
    },
    handleCancel () {
      this.$emit('onGoBack')
      this.currentStep = 0
    },
    onEditorChange({ quill, html, text }) {
      console.log('editor change!', quill, html, text)
      this.content = html
    }
  },
  mounted() {
    console.log('form', this.form)
  }
}
</script>
<style scoped lang="less">
/deep/ .ql-editor {
  min-height: 200px !important;
}
</style>
