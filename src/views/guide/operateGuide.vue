<template>
  <div class="user-guide">
    <h1>平台操作指南</h1>

    <div>
      <h2>使用流程</h2>
      <div class="feature-section">
        <!-- ECharts 流程图 -->
        <div ref="flowchart" class="flowchart" />
        <h3>
          原子微服务发布流程
        </h3>
        <ol>
          <li>
            在<b>“垂域原子微服务发布”</b>模块中预发布新的原子微服务。
          </li>
          <li>
            等待该服务分配容器并在平台上部署运行。此时该服务未通过平台评测，以预发布状态运行。
            <a-tooltip title="平台最终的实现效果为智能部署、柔性集成。在实现全自动部署之前，暂时以人工介入手动部署作为临时处理方案">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </li>
          <li>
            在<b>“技术测评与业务验证”</b>下的<b>“原子微服务技术评测”</b>中评测发布的微服务。通过评测后该服务即为正式发布状态。
          </li>
          <li>
            在<b>“垂域应用AI资源检索”</b>中可以检索到发布的微服务并进行调用。
          </li>
        </ol>
        <a-divider />
        <h3>
          发布元应用并进行测试的流程包括：
        </h3>
        <ol>
          <li>
            在<b>“垂域应用AI资源检索”</b>中检索已有的原子微服务与元应用，构思自己的元应用需求。
          </li>
          <li>
            在<b>“垂域元应用仿真构建”</b>中，组合编排原子微服务中的接口来构建元应用，或者先让AI智能选取并建议组合编排，之后自行修改元应用。
          </li>
          <li>
            构建完成后点击页面中的<b>“构建为元应用”</b>按钮，定制、填写相关信息之后进行应用的预发布。此时该应用未通过平台验证，以预发布状态运行。
          </li>
          <li>
            在<b>“技术测评与业务验证”</b>下的<b>“元应用业务数据验证”</b>中检验元应用。通过验证后该应用为正式发布状态。
          </li>
          <li>
            在<b>“垂域应用AI资源检索”</b>中可以检索并使用发布的元应用。
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Guide',
  mounted() {
    this.initFlowchart()
  },
  methods: {
    initFlowchart() {
      const chartDom = this.$refs.flowchart
      const myChart = echarts.init(chartDom)
      const option = {
        title: {
          text: '流程图：原子微服务发布与元应用构建',
          left: 'center'
        },
        tooltip: {
          formatter: (params) => {
            if (params.dataType === 'node') {
              // 节点提示内容
              const nodeId = params.data.id
              const nodeDescriptions = {
                'node-1': '在<b>“垂域原子微服务发布”</b>模块中预发布新的原子微服务。',
                'node-2': '在<b>“技术测评与业务验证”</b>下的<b>“原子微服务技术评测”</b>中评测发布的微服务。',
                'node-3': '在<b>“垂域应用AI资源检索”</b>下可以检索到发布的服务并进行调用',
                'node-4': '在<b>“垂域应用AI资源检索”</b>中检索已有的原子微服务与元应用，构思自己的元应用需求。',
                'node-5': '在<b>“垂域元应用仿真构建”</b>中，结合智能体来组合编排元应用。<br></br>编排完成后点击<b>“构建为元应用”</b>按钮，定制并填写信息后预发布构建好的元应用。',
                'node-6': '在<b>“技术测评与业务验证”</b>下的<b>“元应用业务数据验证”</b>中检验元应用',
                'node-7': '在<b>“垂域应用AI资源检索”</b>中可以检索并使用发布的元应用'
              }
              return nodeDescriptions[nodeId] || '暂无说明'
            } else if (params.dataType === 'edge') {
              // 边提示内容
              const edgeId = params.data.id
              const edgeDescriptions = {
                'edge-1': '测评微服务',
                'edge-2': '使用微服务',
                'edge-3': '开始构建',
                'edge-4': '验证元应用',
                'edge-5': '使用元应用'
              }
              return edgeDescriptions[edgeId] || '暂无说明'
            }
          }
        },
        series: [
          {
            type: 'graph',
            layout: 'none',
            symbolSize: 80,
            roam: true,
            label: {
              show: true,
              position: 'inside',
              fontSize: 14
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: 10,
            lineStyle: {
              width: 2,
              curveness: 0,
              color: '#555'
            },
            data: [
              { id: 'node-1', name: '垂域原子\n微服务发布', x: 200, y: 100 },
              { id: 'node-2', name: '原子微服务\n技术评测', x: 400, y: 100 },
              { id: 'node-3', name: '微服务与\n元应用检索', x: 600, y: 100 },
              { id: 'node-4', name: '微服务与\n元应用检索', x: 100, y: 200 },
              { id: 'node-5', name: '垂域元应用\n仿真构建', x: 300, y: 200 },
              { id: 'node-6', name: '元应用业务\n数据验证', x: 500, y: 200 },
              { id: 'node-7', name: '微服务与\n元应用检索', x: 700, y: 200 }
            ],
            links: [
              { id: 'edge-1', source: 'node-1', target: 'node-2' },
              { id: 'edge-2', source: 'node-2', target: 'node-3' },
              { id: 'edge-3', source: 'node-4', target: 'node-5' },
              { id: 'edge-4', source: 'node-5', target: 'node-6' },
              { id: 'edge-5', source: 'node-6', target: 'node-7' }
            ]
          }
        ]
      }

      // 渲染图表
      myChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.user-guide {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

h2 {
  font-size: 1.8em;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #4a90e2;
  border-bottom: 2px solid #4a90e2;
  padding-bottom: 5px;
}

h3 {
  font-size: 1.4em;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
  font-weight: bold;
}

p {
  font-size: 1.1em;
  line-height: 1.6;
  color: #555;
}

.feature-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.flowchart {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
}

ol {
  list-style-type: decimal;
  margin-left: 20px;
}

ol li {
  margin-bottom: 10px;
}
</style>
