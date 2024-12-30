<template>
  <a-modal
    :visible="visible"
    title="构建元应用"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="预发布"
    cancel-text="取消"
  >
    <a-form :form="form" layout="vertical">
      <a-form-item label="名称">
        <a-input v-decorator="['name', { rules: [{ required: true, message: '请填写元应用名称!' }] }]" placeholder="请输入元应用名称" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="领域">
            <a-select v-decorator="['domain', { rules: [{ required: true, message: '请选择元应用领域!' }], initialValue: 0 }]" placeholder="请选择元应用领域">
              <a-select-option :key="0" :value="0">
                {{ serviceType === 'aml' ? '跨境支付AI监测服务' : '低空飞行AI监控服务' }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="行业">
            <a-select v-decorator="['industry']" placeholder="请选择行业" allow-clear>
              <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="index">
                {{ item }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="场景">
            <a-select v-decorator="['scenario']" placeholder="请选择元应用场景" allow-clear>
              <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="index">
                {{ item }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="技术">
            <a-select v-decorator="['technology']" placeholder="请选择元应用技术" allow-clear>
              <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="index">
                {{ item }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="条件（environment）">
            <a-input v-decorator="['environment']" placeholder="请输入Environment"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="处理（process）">
            <a-input v-decorator="['process']" placeholder="请输入Process"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
import { getIndustryMap, getScenarioMap, getTechnologyMap } from '@/mock/data/map_data'

export default {
  props: {
    serviceType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      industryOptions: getIndustryMap('aml'),
      scenarioOptions: getScenarioMap('aml'),
      technologyOptions: getTechnologyMap('aml'),
      form: this.$form.createForm(this)
    }
  },
  methods: {
    init() {
      this.visible = true
    },
    handleOk() {
      const { form: { validateFields } } = this
      this.visible = true
      validateFields((errors, values) => {
        if (!errors) {
          const serviceData = {
            ...values,
            type: 1,
            status: 1,
            netWork: 'bridge',
            port: '0.0.0.0:1021/TCP → 0.0.0.0:10021',
            volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/metaApp',
            source: {
              popoverTitle: '可信云技术服务溯源',
              companyName: '复旦大学',
              companyAddress: '上海市杨浦区邯郸路220号',
              companyContact: '021-65642222',
              companyIntroduce: '复旦大学校名取自《尚书大传》之“日月光华，旦复旦兮”，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部“长江学者”特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，“中国大学智库论坛”秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
              msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
              companyScore: 5,
              msScore: 5
            },
            number: '0'
          }
          sessionStorage.setItem('metaAppInfo', JSON.stringify(serviceData))
          this.visible = false
          this.$emit('close')
          window.location.href = `#/evaluation/${this.serviceType}/emulation`
        } else {
          console.log('errors', errors)
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>
