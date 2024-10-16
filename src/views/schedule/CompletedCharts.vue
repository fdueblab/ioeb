<template>
  <div id="main">
    <div>
      <button @click="changeChart">切换</button>
    </div>
    <div id="chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'CompletedCharts',
  data() {
    return {
      kind: this.$route.query.kind,
      nodes: [],
      links: [],
      title: '所提交系统类关系图'
    }
  },
  methods: {
    viewChart(kind) {
      this.$http.get('http://localhost:8080/chartInfo/' + kind)
        .then(res => {
          const nodes = res.nodes
          const edges = res.edges
          console.log(edges[0].properties.weight)
          for (let i = 0; i < nodes.length; i++) {
            const node = {
              name: nodes[i].properties.classname,
              id: nodes[i].id,
              symbolSize: 50
            }
            this.nodes.push(node)
          }
          for (let i = 0; i < edges.length; i++) {
            const link = {
              source: edges[i].startNode.toString(),
              target: edges[i].endNode.toString(),
              value: edges[i].properties.weight.toString(),
              name: edges[i].type
            }
            this.links.push(link)
          }
          this.links.push({
            source: '211',
            target: '201'
          })
          console.log('数据已获取')
          // promise
          console.log('开始绘图')
          var myChart = echarts.init(document.getElementById('chart'))
          var categories = []
          for (var i = 0; i < 5; i++) {
            categories[i] = {
              name: '类目' + i
            }
          }
          var option = {
            // 图的标题
            title: {
              text: this.title
            },
            // 提示框的配置
            tooltip: {
              formatter: function (x) {
                return x.data.des
              }
            },
            // 工具箱
            toolbox: {
              // 显示工具箱
              show: true,
              feature: {
                mark: {
                  show: true
                },
                // 还原
                restore: {
                  show: true
                },
                // 保存为图片
                saveAsImage: {
                  show: true
                }
              }
            },
            legend: [{
              // selectedMode: 'single',
              data: categories.map(function (a) {
                return a.name
              })
            }],
            series: [{
              type: 'graph', // 类型:关系图
              layout: 'force', // 图的布局，类型为力导图
              symbolSize: 40, // 调整节点的大小
              roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [2, 10],
              edgeLabel: {
                normal: {
                  textStyle: {
                    fontSize: 20
                  }
                }
              },
              force: {
                repulsion: 2500,
                edgeLength: [10, 50]
              },
              draggable: true,
              lineStyle: {
                normal: {
                  width: 2,
                  color: '#4b565b'
                }
              },
              label: {
                normal: {
                  show: true,
                  textStyle: {}
                }
              },

              // 数据
              data: this.nodes,
              links: this.links,
              categories: categories
            }]
          }
          myChart.setOption(option)
        })
    },
    changeChart() {
      if (this.kind === this.$route.query.kind) {
        this.nodes = []
        this.links = []
        this.kind = this.kind + '_classification'
        this.title = '划分结果图'
        this.viewChart(this.kind)
      } else {
        this.nodes = []
        this.links = []
        this.kind = this.$route.query.kind
        this.title = '所提交系统类关系图'
        this.viewChart(this.kind)
      }
    }
  },
  created() {
  },
  mounted() {
    this.viewChart(this.kind)
  }
}
</script>

<style scoped>
#main {
  width: 1600px;
  height: 800px;
}
#chart {
  width: 100%;
  height: 100%;
}
</style>
