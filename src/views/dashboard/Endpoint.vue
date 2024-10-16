<template>
  <div>
    <a-card :title="title" :bordered="false" style="background-color:#f6f6f6">
      <!--      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="名称">
                <a-input placeholder="以name,group,URL等进行搜索"/>
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="search()">查询</a-button>
              <a-button style="margin-left: 8px">重置</a-button>
            </span>
            </a-col>
          </a-row>

        </a-form>
      </div>-->
    </a-card>
  </div>
</template>

<script>
  export default {
    name: 'Endpoint',
    data() {
      return {
        title: '终端状态'

      }
    }
  }
</script>

<style scoped>

</style>
