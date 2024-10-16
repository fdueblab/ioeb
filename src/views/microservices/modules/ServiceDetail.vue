<template>
  <div style="height: auto">
    <a-tabs default-active-key="1" @change="callback" style="height:auto ;width: 100%">
      <a-tab-pane key="1" tab="服务总体描述">
        <b><big>1.文档说明</big></b><br><br>
        <b>1.1文档说明</b><br>
        本文档描述视频直播服务提供直播推流、直播播流、直播安全、直播管理、数据统计等服务，可用于应用和服务集成。
        服务提供者需根据服务规范开发上传服务，并通过服务检测后方可成功上传共享。<br><br>
        <b>1.2阅读对象</b><br>
        《外调内-外部商户接入合作商网关标准文档》是面向具有一定的开发能力，了解JAVA 等开发语言，及具有一定Android/IOS客户端开发能力，了解Android/IOS客户端的开发和管理人员。<br><br>
        <b><big>2.数据格式规范说明</big></b><br><br>
        <div v-html="message">{{ message }}</div>
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
        <b><big>3.接入准备（重要）</big></b><br><br>
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

        <b><big>4.接入接口说明</big></b><br><br>
        <b>4.1 通用接口一 </b><br><br>

        <v-html><b><big>5.接口使用详细说明</big></b><br><br>
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
          Pmgw自定义状态码：以51开头，具体说明如下;</v-html>






      </a-tab-pane>
      <a-tab-pane key="2" tab="服务接口规范" >
<!--        <div style="height:auto;">-->
<!--          <div style="background: rgb(240,242,245);width: 100%;height: 53px; position:absolute;"></div>-->
<!--          11-->
<!--          {{ message }}-->
<!--          <iframe-->
<!--            id="show-swagger"-->
<!--            frameborder="0"-->
<!--            style="background-color:transparent; width: 100%;-->
<!--         height:550px; top: 0;left:0;bottom:0;"-->
<!--            src="http://localhost:8080/swagger-ui.html"/>-->
<!--        </div>-->

<!--        <div v-html="message">{{ message }}</div>-->

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
<!--          <span slot="customTitle"><a-icon type="smile-o" /> Name</span>-->
<!--          <span slot="tags" slot-scope="tags">-->
<!--            <a-tag-->
<!--              v-for="tag in tags"-->
<!--              :key="tag"-->
<!--              :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"-->
<!--            >-->
<!--              {{ tag.toUpperCase() }}-->
<!--            </a-tag>-->
<!--          </span>-->
<!--          <span slot="action" slot-scope="text, record">-->
<!--              <a>Invite 一 {{ record.name }}</a>-->
<!--              <a-divider type="vertical" />-->
<!--              <a>Delete</a>-->
<!--              <a-divider type="vertical" />-->
<!--              <a class="ant-dropdown-link"> More actions <a-icon type="down" /> </a>-->
<!--          </span>-->
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



      </a-tab-pane>

      <a-tab-pane key="3" tab="基于模板检测的服务发布">
        <p style="margin-left: 40%;margin-top: 3%;font-size: larger">服务jar包上传:
        <ServiceDetection style="margin-right: 700px;float: right"></ServiceDetection>
        </p>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>

// const tableTh = [
//   {
//   title: "API", //还可以增加其他描述，比如width等
//     align: "left"
// },
// {
//     title: "描述",
//     align: "right"
// },
// {
//   title: "请求类型",
//   align: "right"
// },
// {
//   title: "请求参数",
//   align: "right"
// },
// {
//   title: "返回类型",
//   align: "right"
// }
// ]
//
// const dataList=[
//   {
//     //数据包，字段名作为关键字，便于列的调整先后顺序
//     c1: "GetLiveUrl",
//     c2: "获取推流地址",
//     c3:"GET",
//     c4: "无",
//     c5: "String"
//   },
//   {
//     c1: "GetPullRTMPLiveUrl",
//     c2: "获取RTMP视频流的拉流地址",
//     c3:"GET",
//     c4: "无",
//     c5: "String"
//   },
//   {
//     c1: "GetPullFLVLiveUrl",
//     c2: "获取FLV视频流的拉流地址",
//     c3:"GET",
//     c4: "无",
//     c5: "String"
//   },
//   {
//     c1: "GetPullHLSLiveUrl",
//     c2: "获取HLS视频流的拉流地址",
//     c3:"GET",
//     c4: "无",
//     c5: "String"
//   },
//   {
//     c1: "pusher",
//     c2: "基于提供的推流和拉流地址启动一个转推流进程",
//     c3: "POST",
//     c4: "PushTask data",
//     c5: "ResultVO<WorkerStatus>"
//   },
//   {
//     c1: "pusherStatus",
//     c2: "基于id查询指定推流进程状态",
//     c3: "GET",
//     c4: "String id ",
//     c5: "ResultVO<WorkerStatus>"
//   },
//   {
//     c1: "stopPusher",
//     c2: "停止指定推流的工作",
//     c3: "DELETE",
//     c4: "String id ",
//     c5: "ResultVO<WorkerStatus>"
//   },
//
// ]


import BigForm from "@/views/other/BigForm";
import ServiceDetection from '@/views/microservices/component/ServiceDetection'
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
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
    ellipsis: true,
  },
  {
    title: '描述',
    dataIndex: 'address',
    key: 'address 3',
  }
]
const columns2 = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
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
    ellipsis: true,
  },
  {
    title: '描述',
    dataIndex: 'address',
    key: 'address 3',
  }
]

const columns3 = [
  {
    title: '序号',
    dataIndex: 'name',
    key: 'name',
    width: 150,
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
    ellipsis: true,
  },
  {
    title: '附加类型',
    dataIndex: 'address',
    key: 'address 3',
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
    address: '推流task实体类，含PushTask的id，推流源地址，推流目的地址',
  },
  {
    key: '2',
    name: 'pushSrcUrl',
    age: 'String',
    addre: '是',
    addres: 'http://1.15.143.80:8090/control/get?room=movie',
    address: '推流源地址',
  },
  {
    key: '3',
    name: 'pushDescUrl',
    age: 'String',
    addre: '是',
    addres: 'http://1.15.143.80:8090/push',
    address: '推流目的地址',
  },
  {
    key: '4',
    name: 'value',
    age: 'String',
    addre: '是',
    addres: '推流id',
    address: 'ApiParam参数',
  },
  {
    key: '5',
    name: 'appBusinessType',
    age: 'String',
    addre: '否',
    addres: '业务类型',
    address: 'APPLICATION-进件',
  },
  {
    key: '6',
    name: 'productCode',
    age: 'String',
    addre: '否',
    addres: '产品编码',
    address: '产品的编码',
  },
  {
    key: '7',
    name: 'fromSystem',
    age: 'String',
    addre: '否',
    addres: '来源系统',
    address: '来源系统来源系统',
  },
  {
    key: '8',
    name: 'channelBatchNo',
    age: 'String',
    addre: '否',
    addres: '批次号',
    address: '用于标识某一批次',
  },

]

const data2 = [
  {
    key: '1',
    name: 'status',
    age: 'ResultVO',
    addres: '(data,0,‘成功’)',
    address: 'ResultUtil类中的成功状态，setCode为0',
  },
  {
    key: '2',
    name: 'respCode',
    age: 'String',
    addres: '000000',
    address: '000000-成功\n' +
      '其它返回码-失败',
  },
  {
    key: '3',
    name: 'respMsg',
    age: 'String',
    addres: '200',
    address: '返回信息',
  },
  {
    key: '4',
    name: 'reqSerialNo',
    age: 'String',
    addres: '36',
    address: '请求入参中的流水号',
  },

]

const data3 = [
  {
    key: '1',
    name: '1',
    age: 'String',
    addre: '字符串类型',
    addres: 'simpleType（简单类型）',
    address: '12345abc',
  },
  {
    key: '2',
    name: '2',
    age: 'data',
    addre: '日期，格式为yyyy-mm-dd',
    addres: 'simpleType（简单类型）',
    address: '2014-09-15',
  },
  {
    key: '3',
    name: '3',
    age: 'datetime',
    addre: '日期和时间，格式为yyyy-mm-dd HH:MM:SS',
    addres: 'simpleType（简单类型）',
    address: '2014-09-15 22:12:56',
  },
  {
    key: '4',
    name: '4',
    age: 'time',
    addre: '时间，格式为HH:MM:SS',
    addres: 'simpleType(简单类型)',
    address: '22:12:56',
  },
  {
    key: '5',
    name: '5',
    age: 'number(P，S)',
    addre: '数字类型， P为精度位，S为小数位',
    addres: 'simpleType（简单类型）',
    address: '1.01',
  },
  {
    key: '6',
    name: '6',
    age: 'json',
    addre: 'json字符串',
    addres: 'complexType (复杂类型)',
    address: '{"bankEnc":"1E13ADED7E411D0804CE99AC6FD08ADCC5CC226DAB3A44CB","cardType":"B"}',
  },
  {
    key: '7',
    name: '7',
    age: 'xml',
    addre: 'xml字符串',
    addres: 'complexType (复杂类型)',
    address: '{"bankEnc":"1E1dsjakdastgjhsdA44CB","cardType":"B"}',
  },



]

export default {
  name: 'ServiceDetail',
  components: { ServiceDetection, BigForm},
  data() {
    return {
      data,
      columns,
      data2,
      columns2,
      data3,
      columns3
    }
  },
  mounted() {
    /**
     * iframe-宽高自适应显示
     */
    const oIframe = document.getElementById('show-eureka')
    const deviceWidth = document.documentElement.clientWidth
    const deviceHeight = document.documentElement.clientHeight
    oIframe.style.height = (Number(deviceHeight) + 100) + 'px' // 数字是页面布局高度差，其中的100可以根据自己的界面进行调整
  }
}
</script>

<style scoped>

</style>