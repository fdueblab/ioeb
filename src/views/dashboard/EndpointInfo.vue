<template>
  <div>
    <a-card :title="title" :bordered="false" border-style="font-size:20px">

      <a-card-grid class="card-grid-title">
        终端
      </a-card-grid>
      <a-card-grid class="card-grid-value">
        local
      </a-card-grid>
      <a-card-grid class="card-grid-title">
        URL
      </a-card-grid>
      <a-card-grid class="card-grid-value">
        /vau/run/docker.sock
      </a-card-grid>
      <a-card-grid class="card-grid-title">
        Tags
      </a-card-grid>
      <a-card-grid class="card-grid-value">
        -
      </a-card-grid>
      <a-card-grid style="width:100%">
        <a href="/dashboard/cluster">可视化查看集群信息</a>
      </a-card-grid>
    </a-card>
    <!--    <div class="card-list" ref="content">-->
    <!--      <a-list item-layout="horizontal" rowKey="id"-->
    <!--              :gutter="{gutter: 24, column:2}"-->
    <!--              :dataSource="dataSource">-->
    <!--        <a-list-item slot="renderItem" slot-scope="item">-->
    <!--          <a-card :hoverable="true">-->
    <!--            <a-card-meta>-->
    <!--              <a slot="title" href="/microservices/container" style="font-size: 33px">{{ item.title }}</a>-->
    <!--              <a-avatar class="card-avatar" slot="avatar" :src="item.avatar" size="large"/>-->
    <!--              <div class="meta-content" slot="description">{{ item.content }}</div>-->
    <!--            </a-card-meta>-->
    <!--          </a-card>-->

    <!--        </a-list-item>-->
    <!--      </a-list>-->
    <!--    </div>-->
    <div class="card-list">
      <a-list :grid="{ gutter: 24, column: 3 }" :data-source="data">
        <a-list-item slot="renderItem" slot-scope="item, index">
          <a-card :hoverable="true">
            <a-card-meta>
              <a slot="title" :href="item.href">{{ item.title }}</a>
              <!--              <a-avatar slot="avatar" :src="item.avatar" size="large"/>-->
              <a-avatar slot="avatar" :icon="item.icon" size="large" style="background-color:#337ab7"></a-avatar>
              <!--              <a-icon type="up-circle" slot="avatar" size="large"/>-->
              <div slot="description">{{ item.content }}</div>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script>
  const dataSource = []
  for (let i = 0; i < 6; i++) {
    dataSource.push({
      id: i,
      title: '1个服务模板',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
      content: '在中台产品的研发过程中，会出现不同的设计规范和实现方式，但其中往往存在很多类似的页面和组件，这些类似的组件会被抽离成一套标准规范。',
      icon: 'appstore'
    })
  }

  const data = [
    {
      title: '3个服务模板',
      href: '/microservices/container',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
      content: '服务模板用于快速启动服务',
      icon: 'appstore'

    },
    {
      title: '2个微服务',
      href: '/microservices/service',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
      content: '微服务是一组服务的集合，这些服务共同构成一个功能',
      icon: 'gold'

    },
    {
      title: '10个容器',
      href: '/microservices/container',
      content: '容器是承载服务的工具',
      icon: 'container'

    },
    {
      title: '5个镜像',
      href: '/microservices/image',
      content: '镜像是容器的模板',
      icon: 'profile'
    }, {
      title: '4个文件卷',
      href: '/microservices/volumes',
      content: '文件卷负责持久化容器数据',
      icon: 'file'
    }, {
      title: '4个网络',
      href: '/microservices/network',
      content: '容器的网络环境',
      icon: 'cluster'
    }
  ]
  export default {
    name: 'EndpointInfo',
    data() {
      return {
        title: '终端状态',
        dataSource,
        data
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "~@/components/index.less";

  .card-list {
    margin-top: 30px;

    /deep/ .ant-card-body:hover {
      .ant-card-meta-title > a {
        color: @primary-color;
      }
    }

    /deep/ .ant-card-meta-title {
      margin-bottom: 12px;

      & > a {
        display: inline-block;
        max-width: 100%;
        color: rgba(0, 0, 0, .85);
      }
    }

    /deep/ .meta-content {
      position: relative;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      height: 64px;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;

      margin-bottom: 1em;
    }
  }

  .card-avatar {
    width: 48px;
    height: 48px;
    border-radius: 48px;
  }

  .card-grid-title{
    width:20%;
    text-align:left;
    height:75%;
    font-weight:bold;
    /*padding: 10px;*/
  }

  .card-grid-value{
    width:80%;
    text-align:left;
    height:75%;
    font-weight:bold;
    /*padding: 10px;*/
  }
</style>
