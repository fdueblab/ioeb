<template>
  <div>
    {{ message }}
    <table class="table_default1" >
      <tr>
        <th>序号</th>
        <th v-for="th in tableTh" >
          {{ th.title }}
        </th>
      </tr>
      <tr v-for="(tr,index) in dataList">
        <td>{{ index+1 }}</td>
        <td v-for="td in tr" >
          {{ td }}
        </td>
      </tr>
    </table>
  </div>

</template>

<script>
export default {
  data() {
    return {
      message: '公司信息!',
      orderBy: ['c1', 'c2'], // 可以控制字段的先后顺序，想调整列的先后顺序，改这个数组就行，可以做个性化设置
      tableTh: {// 表头的描述信息
        c1: {
          title: '公司名称', // 还可以增加其他描述，比如width等
          align: 'left'
        },
        c2: {
          title: '电话',
          align: 'right'
        }
      },
      dataList: [
        {
          // 数据包，字段名作为关键字，便于列的调整先后顺序
          c1: '度娘2',
          c2: '123123123'
        },
        {
          c1: '企鹅2',
          c2: '7897899787'
        },
        {
          c1: '阿里爸爸2',
          c2: '456456456'
        }
      ]
    }
  }
}

</script>

<style scoped>

</style>
