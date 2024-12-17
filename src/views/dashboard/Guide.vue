<template>
  <div class="user-guide">
    <h1>技术验证一体化服务平台</h1>

    <div>
      <h2>用户指南</h2>
      <div class="feature-section">
        <!-- ECharts 流程图 -->
        <div ref="flowchart" class="flowchart"></div>
        <p>
          发布原子微服务、构建元应用并进行测试的流程如下：
        </p>
        <ol>
          <li>
            在<b>“垂域原子微服务发布”</b>模块中发布新的原子微服务。
          </li>
          <li>
            管理员在<b>“技术测评与业务验证”</b>下的<b>“原子微服务技术评测”</b>中评测发布的微服务。
          </li>
          <li>
            测评通过后，管理员在<b>“服务及应用运维管理”</b>下的<b>“微服务容器化管理”</b>中为服务分配容器并部署运行。
          </li>
          <li>
            用户在<b>“微服务与元应用检索”</b>中搜索到该服务并使用它构建自己的元应用。
          </li>
          <li>
            在<b>“垂域元应用仿真构建”</b>中，用户可以组合编排原子微服务来构建元应用，或者让AI智能选取并建议组合编排，修改工作流后构建元应用。
          </li>
          <li>
            在<b>“技术测评与业务验证”</b>下的<b>“元应用业务数据验证”</b>中检验元应用。
          </li>
        </ol>
      </div>
    </div>

    <div>
      <h2>系统简介</h2>
      <div class="feature-section">
        <h3>AI技术微服务定义与发布</h3>
        <p>
          提交AI算法模型，基于技术服务接口规范定义技术微服务，结合算法模型微服务可视化支撑工具，选择、测试并发布AI技术微服务。
        </p>
      </div>
      <div class="feature-section">
        <h3>AI技术元应用仿真与构建</h3>
        <p>
          基于RAG增强大模型智能体以及可视化服务编排，实现人智协同的AI技术高效组合仿真，并且基于元应用模板自动形成元应用智能体原型，在此基础上进行定制与完善。
        </p>
      </div>
      <div class="feature-section">
        <h3>AI技术服务与元应用检索</h3>
        <p>
          在区块链的AI技术与应用存证溯源服务基础上，根据业务场景、应用需求、技术性质，以及AI技术服务与元应用全周期状态，进行高效检索与精准匹配。
        </p>
      </div>
      <div class="feature-section">
        <h3>基于智能体的检索与集成</h3>
        <p>
          通过基于RAG增强的大模型智能体，实现AI技术元应用智能体的自动检索、评估与集成，达到智能高效的监测系统的动态构建与技术集成的智能化。
        </p>
      </div>
      <div class="feature-section">
        <h3>AI技术测试与元应用评估</h3>
        <p>
          执行面向真实应用场景的单个技术测评与元应用智能体应用验证，实现单个算法技术评测与应用验证相结合的综合评估，达到AI技术选择的深度匹配。
        </p>
      </div>
      <p style="font-weight: bolder">
        * 目前本平台还在开发中，其中的内容作为原型测试内容，目前仅作概念演示。
      </p>
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
          text: '流程图：从原子微服务发布到元应用构建与测试',
          left: 'center'
        },
        tooltip: {
          formatter: (params) => {
            if (params.dataType === 'node') {
              // 节点提示内容
              const nodeId = params.data.id
              const nodeDescriptions = {
                'node-1': '在<b>“垂域原子微服务发布”</b>模块中发布新的原子微服务。',
                'node-2': '管理员在<b>“技术测评与业务验证”</b>下的<b>“原子微服务技术评测”</b>中评测发布的微服务。',
                'node-3': '测评通过后，管理员在<b>“服务及应用运维管理”</b>下的<b>“微服务容器化管理”</b>中为服务分配容器并部署运行。',
                'node-4': '用户在<b>“微服务与元应用检索”</b>中搜索到该服务并使用它构建自己的元应用。',
                'node-5': '在<b>“垂域元应用仿真构建”</b>中，用户可以组合编排原子微服务来构建元应用，或者让AI智能选取并建议组合编排，修改工作流后构建元应用。',
                'node-6': '在<b>“技术测评与业务验证”</b>下的<b>“元应用业务数据验证”</b>中检验元应用。'
              }
              return nodeDescriptions[nodeId] || '暂无说明'
            } else if (params.dataType === 'edge') {
              // 边提示内容
              const edgeId = params.data.id
              const edgeDescriptions = {
                'edge-1': '等待管理员审核',
                'edge-2': '审核通过',
                'edge-3': '允许用户使用',
                'edge-4': '构建元应用',
                'edge-5': '验证元应用'
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
              { id: 'node-1', name: '垂域原子\n微服务发布', x: 100, y: 100 },
              { id: 'node-2', name: '原子微服务\n技术评测', x: 300, y: 100 },
              { id: 'node-3', name: '微服务\n容器化管理', x: 500, y: 100 },
              { id: 'node-4', name: '微服务与\n元应用检索', x: 700, y: 100 },
              { id: 'node-5', name: '垂域元应用\n仿真构建', x: 300, y: 300 },
              { id: 'node-6', name: '元应用业务\n数据验证', x: 500, y: 300 }
            ],
            links: [
              { id: 'edge-1', source: 'node-1', target: 'node-2' },
              { id: 'edge-2', source: 'node-2', target: 'node-3' },
              { id: 'edge-3', source: 'node-3', target: 'node-4' },
              { id: 'edge-4', source: 'node-4', target: 'node-5' },
              { id: 'edge-5', source: 'node-5', target: 'node-6' }
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
