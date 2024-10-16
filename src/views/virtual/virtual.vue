<template>
  <div>
    <a-card title="微服务技术资源虚拟化建模">
      <div class="control-section">
        <ejs-diagram
          id="diagram"
          ref="diagramObj"
          :width="width"
          :height="height"
          :nodes="nodes"
          :connectors="connectors"
          :getNodeDefaults="getNodeDefaults"
          :getConnectorDefaults="getConnectorDefaults"
          :setNodeTemplate="setNodeTemplate"
        ></ejs-diagram>
      </div>
    </a-card>

    <a-card title="微服务技术资源虚拟化定义">
      <a-table :columns="columns" :data-source="data" bordered>
        <template slot="attributes_slot" slot-scope="attributes">
          <ul id="example-2">
            <li v-for="item in attributes" :key="item">{{ item }}</li>
          </ul>
        </template>
        <template slot="interface_slot" slot-scope="interfaces">
          <ul id="example-2">
            <li v-for="item in interfaces" :key="item">{{ item }}</li>
          </ul>
          <!-- <diagram :model="model"></diagram> -->
        </template>
      </a-table>
      <!-- <diagram :model="model"></diagram> -->
    </a-card>
  </div>
</template>
<script>
import {
  DiagramPlugin,
  Diagram,
  ShapeAnnotationModel,
  NodeModel,
  ConnectorModel,
  UmlClassifierShapeModel,
} from '@syncfusion/ej2-vue-diagrams'
//Create a connector.
function createConnector(id, sourceID, targetID) {
  let connector = {}
  connector.id = id
  connector.sourceID = sourceID
  connector.targetID = targetID

  return connector
}
//Create class Diagram shapes.
function createNode(id, offsetX, offsetY, className) {
  let node = {}
  node.id = id
  node.offsetX = offsetX
  node.offsetY = offsetY
  node.shape = {
    type: 'UmlClassifier',
    classShape: {
      name: className,
    },
    classifier: 'Class',
  }
  return node
}
//create class Property
function createProperty(name, type) {
  return { name: name, type: type }
}
//create class Methods
function createMethods(name, type) {
  return { name: name, type: type }
}
//create 依赖关系
function createDependencyConnector(id, sourceID, targetID) {
  let connector = {}
  connector.id = id
  connector.sourceID = sourceID
  connector.targetID = targetID
  connector.type = 'Straight'
  connector.shape = {
    type: 'UmlClassifier',
    //Set an relationship for connector
    relationship: 'Dependency',
  }
  return connector
}
//create 继承关系Inheritance
function createInheritanceConnector(id, sourceID, targetID) {
  let connector = {}
  connector.id = id
  connector.sourceID = sourceID
  connector.targetID = targetID
  connector.type = 'Straight'
  connector.shape = {
    type: 'UmlClassifier',
    //Set an relationship for connector
    relationship: 'Inheritance',
  }
  return connector
}

let nodes = [
  {
    id: 'Equipment',
    offsetX: -100,
    offsetY: -100,
    shape: {
      type: 'UmlClassifier',
      classShape: {
        name: '技术资源',
        attributes: [
          createProperty('种类', 'Kind'),
          createProperty('来源', 'Source'),
          createProperty('价格', 'double'),
          createProperty('数量', 'int64'),
        ],
        methods: [
          createMethods('操作', 'StatusCode'),
          createMethods('监控', 'Stream'),
          createMethods('数据传输', 'void'),
        ],
      },
      classifier: 'Class',
    },
  },
  {
    id: 'MicroServices',
    offsetX: -100,
    offsetY: 150,
    shape: {
      type: 'UmlClassifier',
      classShape: {
        name: '微服务',
        attributes: [
          createProperty('开发者', 'Developer'),
          createProperty('功能描述', 'String'),
          createProperty('种类', 'Kind'),
          createProperty('面向对象', 'Object'),
        ],
      },
      classifier: 'Class',
    },
  },
  {
    id: 'Handler',
    offsetX: -450,
    offsetY: 250,
    shape: {
      type: 'UmlClassifier',
      classShape: {
        name: '接口微服务',
        attributes: [createProperty('接口配额', 'int64')],
        methods: [
          createMethods('协议转换', 'bool'),
          createMethods('负载均衡', 'bool'),
          createMethods('配额', 'int64'),
          createMethods('调用下游', 'string'),
        ],
      },
      classifier: 'Class',
    },
  },
  {
    id: 'DDDService',
    offsetX: 375,
    offsetY: 250,
    shape: {
      type: 'UmlClassifier',
      classShape: {
        name: '业务层微服务',
        attributes: [createProperty('影响范围', 'Enum')],
        methods: [
          createMethods('被调用', 'bool'),
          createMethods('功能接口', 'Object'),
          createMethods('领域操作', 'Object'),
        ],
      },
      classifier: 'Class',
    },
  },
  {
    id: 'DB',
    offsetX: -100,
    offsetY: 500,
    shape: {
      type: 'UmlClassifier',
      classShape: {
        name: '持久化层',
        attributes: [
          createProperty('开发者', 'Developer'),
          createProperty('功能描述', 'String'),
          createProperty('持久化类型', 'DBType'),
          createProperty('领域类型', 'ModelName'),
        ],
        methods: [
          createMethods('领域模型', 'Object'),
          createMethods('数据写', 'bool'),
          createMethods('数据读', 'bool'),
        ],
      },
      classifier: 'Class',
    },
  },
]
let connectors = [
  createDependencyConnector('connector2', 'Equipment', 'MicroServices'),
  createInheritanceConnector('connector3', 'Handler', 'MicroServices'),
  createInheritanceConnector('connector4', 'DDDService', 'MicroServices'),
  createDependencyConnector('connector5', 'DDDService', 'DDDService'),
  createConnector('connector6', 'Handler', 'DB'),
  createConnector('connector7', 'DDDService', 'DB'),
]

export default {
  components: [DiagramPlugin, Diagram, ShapeAnnotationModel, NodeModel, ConnectorModel, UmlClassifierShapeModel],
  data() {
    const columns = [
      {
        dataIndex: 'type',
        key: 'type',
        title: '类型',
      },
      {
        title: '调用方',
        key: 'caller',
        dataIndex: 'caller',
      },
      {
        title: '属性',
        key: 'attributes',
        dataIndex: 'attributes',
        scopedSlots: {
          customRender: 'attributes_slot',
        },
      },
      {
        title: '接口',
        key: 'interfaces',
        dataIndex: 'interfaces',
        scopedSlots: {
          customRender: 'interface_slot',
        },
      },
    ]

    const data = [
      {
        key: 1,
        type: '智能装备',
        caller: '接口层微服务/业务层微服务',
        attributes: ['种类', '来源', '价格', '数量'],
        interfaces: ['操作接口', '数据传输接口', '数据采集接口'],
        // 种类，来源，价格，数量
        // 接口层：操作接口，数据传输接口，数据采集接口，
      },
      {
        key: 2,
        type: '接口层微服务',
        caller: '智能装备',
        attributes: ['功能描述', '种类', '服务对象', '接口配额'],
        interfaces: ['协议转换接口', '负载均衡接口', '配额接口', '调用下游接口'],
        // 开发者 功能描述 种类 服务对象 接口配额
        // 接口层：协议转换接口 负载均衡接口 配额接口 调用下游接口
      },
      {
        key: 3,
        type: '业务层微服务',
        caller: '接口层微服务/业务层微服务',
        attributes: ['功能描述', '种类', '服务对象', '影响范围'],
        interfaces: ['被调用接口', '业务逻辑接口', '领域操作'],
        // 开发者 功能描述 种类 服务对象 影响范围
        // 接口层：被调用接口 业务逻辑接口
      },
      {
        key: 4,
        type: '持久化层',
        caller: '业务层微服务',
        attributes: ['开发者', '功能描述', '种类', '持久化类型'],
        interfaces: ['领域模型接口', '数据写接口', '数据读接口'],
        // 开发者 功能描述 种类 持久化类型
        // 领域模型接口 数据写接口 数据读接口
      },
    ]

    return {
      columns: columns,
      data: data,
      // diagram
      width: '100%',
      height: '750px',
      nodes: nodes,
      connectors: connectors,
      //Sets the default values of a node
      getNodeDefaults: (obj) => {
        obj.style = { fill: '#26A0DA', strokeColor: 'white' }
        return obj
      },
      //Sets the default values of a connector
      getConnectorDefaults: (connector) => {
        return connector
      },
      //set an label style for nodes
      setNodeTemplate: (node) => {
        if (node.annotations && node.annotations.length > 0) {
          for (let i = 0; i < node.annotations.length; i++) {
            let annotation = node.annotations[i]
            if (annotation && annotation.style) {
              annotation.style.color = 'white'
            }
          }
        }
      },
    }
  },
  mounted() {
    let diagram = this.$refs.diagramObj.ej2Instances
    diagram.fitToPage()
  },
}
</script>