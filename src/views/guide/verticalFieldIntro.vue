<template>
  <div class="container">
    <h1>{{ data.title }}</h1>
    <p class="intro">{{ data.intro }}</p>

    <section v-for="(section, index) in data.sections" :key="index">
      <h2>{{ section.title }}</h2>
      <div v-for="(content, i) in section.content" :key="i">
        <h3 v-if="content.subtitle">{{ content.subtitle }}</h3>
        <p v-if="content.description">{{ content.description }}</p>
        <ul v-if="content.items">
          <li v-for="(item, j) in content.items" :key="j">{{ item }}</li>
        </ul>
        <table v-if="content.table">
          <thead>
            <tr>
              <th v-for="(header, k) in content.table.headers" :key="k">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, l) in content.table.rows" :key="l">
              <td v-for="(cell, m) in row" :key="m">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import { getFieldData } from '@/views/guide/verticalFieldData'

export default {
  props: {
    verticalField: {
      type: String,
      default: 'aml'
    }
  },
  data() {
    return {
      data: {
        title: '正在加载...',
        intro: '',
        sections: []
      }
    }
  },
  mounted () {
    this.data = getFieldData(this.verticalField)
  },
  watch: {
    'verticalField' (val) {
      this.data = getFieldData(val)
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: bolder;
}

.intro {
  color: #34495e;
  font-style: italic;
}

h2 {
  color: #2980b9;
  margin-top: 30px;
  margin-bottom: 15px;
}

h3 {
  color: #16a085;
  margin-top: 20px;
  margin-bottom: 10px;
}

p {
  color: #34495e;
  margin-bottom: 10px;
}

ul {
  list-style-type: disc;
  margin-left: 20px;
  margin-bottom: 15px;
}

li {
  color: #34495e;
  margin-bottom: 5px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  color: #2c3e50;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
