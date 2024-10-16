<template>
  <div class="updata-body" @dragenter="dragenter($event)">
    <div @drop="enentDrop($event)" @dragleave="dragleave($event)" @dragover="dragover($event)">
      <div class="drag-box">{{drapText}}</div>

      <button type="primary"  @click="button2()">生成镜像</button><br></br>
      <input type="text" v-model="conname" >
      <button type="primary"  @click="button1()">生成容器</button><br></br>


    </div>
    <ul>
      <li v-for="(item, index) in fileData" :key="index">{{"name:"+item.name}}</li>
      <li v-for="(item, index) in fileData" :key="index">{{"size:"+item.size}}</li>
    </ul>
  </div>
</template>

<script>
  import Vue from 'vue';
  import { createContainer,createimage } from '@/api/docker'
  export default {
    name: 'NewContainer',
    data() {
      return {
        drapText: '将文件拖拽到此处进行上传',
        fileData: [],
        conname:"",
      }
    },
    mounted() {

    },
    methods: {
      enentDrop: function(e) {
        console.log(e.dataTransfer.files)
        e.stopPropagation();
        e.preventDefault();
        this.updataFun(e.dataTransfer.files)
      },
      dragleave(e) {
        e.stopPropagation();
        e.preventDefault();
      },
      dragenter(e) {
        e.stopPropagation();
        e.preventDefault();
        this.drapText = '松开鼠标完成上传';
      },
      dragover(e) {
        e.stopPropagation();
        e.preventDefault();
      },
      updataFun(data) {
        let that = this;
        for (let i = 0; i < data.length; i++) {
          this.fileData.push(data[i])
        }
        this.drapText = '上传成功';
        setTimeout(() => {
          that.drapText = '将文件拖拽到此处进行上传';
        }, 500);
      },

      button1(){
        const k ={}
        k.ids = []
        k.ids.push(this.conname)
        console.log(this.conname)
        createContainer(k).then(res => {
          console.log('res', res)

        })

      },

      button2(){
        createimage().then(res => {
          console.log('res', res)

        })

      },

     }
  }
</script>

<style>
  .updata-body {
    margin: 50px auto;
    width: 500px;
  }
  .drag-box {
    width: 500px;
    height: 200px;
    line-height: 200px;
    text-align: center;
    border: 1px dashed #eee;
  }
</style>
