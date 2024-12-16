<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <a-form :form="form" layout="inline">
        <standard-form-row title="类型" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select @change="handleTagChange('type', $event)">
              <tag-select-option v-for="(item, index) in typeArr" :key="index" :value="index">{{ item
                }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="领域" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select @change="handleTagChange('domain', $event)">
              <tag-select-option v-for="(item, index) in domainArr" :key="index" :value="index">{{ item
                }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="行业" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('industry', $event)">
              <tag-select-option v-for="(item, index) in industryArr" :key="index" :value="index">{{ item
                }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="场景" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('scenario', $event)">
              <tag-select-option v-for="(item, index) in scenarioArr" :key="index" :value="index">{{ item
                }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="技术" grid>
          <a-form-item>
            <tag-select @change="handleTagChange('technology', $event)">
              <tag-select-option v-for="(item, index) in technologyArr" :key="index" :value="index">{{ item
                }}</tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="智能检索" grid last>
          <a-row>
            <a-col :span="16">
              <a-form-item :wrapper-col="{ xs: 18, sm: 18, md: 18 }">
                <a-input-search style="width: 100%" v-model="agentSearchText" placeholder="请输入您想要的微服务名称、功能等"
                  @search="handleAgentSearch" :loading="agentSearchLoading" />
              </a-form-item>
            </a-col>
          </a-row>
        </standard-form-row>
      </a-form>
    </a-card>
    <a-card :bordered="false" :title="agentSearchData.length > 0 ? 'AI智能检索为您推荐以下微服务' : false">
      <a-table ref="table" :columns="columns" :dataSource="filteredDataSource">
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="norm" slot-scope="text">
          <a-popover v-for="(item, index) in text" :key="index" title="可信云技术服务溯源">
            <template slot="content">
              <p>{{ item.key | normFilter }}</p>
              <el-rate v-model=item.score disabled show-score text-color="#ff9900">
              </el-rate>
            </template>
            <a-tag color="#87d068">
              <a-icon type="check" /> {{ item.key | normFilter }}
            </a-tag>
          </a-popover>
        </span>
        <span slot="source" slot-scope="text">
          <a-tag color="blue" @click="handleSource(text)">知识产权</a-tag>
            <a-tag color="cyan" @click="handleSource(text)">应用案例</a-tag>
            <a-tag color="orange" @click="handleSource(text)">舆情信息</a-tag>
            <a-popover title="可信云技术服务溯源">
            <template slot="content">
              <h1>公司信息</h1>
              <p><strong>公司名称：</strong>复旦大学</p>
              <p><strong>地址：</strong>上海市杨浦区邯郸路220号</p>
              <p><strong>联系方式：</strong>021-65642222</p>
              <p><strong>简介：</strong>复旦大学校名取自《尚书大传》之“日月光华，旦复旦兮”，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部“长江学者”特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1</p>
              <p>综合可信度：</p>
              <el-rate v-model=kvalue disabled show-score text-color="#ff9900" score-template="5.0"></el-rate>
              <h1>微服务信息</h1>
              <p><strong>微服务描述:</strong> 针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。 </p>
              <p>综合可信度：
                <el-rate v-model=kvalue disabled show-score text-color="#ff9900" score-template="5.0"></el-rate>
              </p>
            </template>
            <a-tag color="green" @change="handleSource(text)">链上存证</a-tag>
          </a-popover>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleUse(record)">使用</a>
          </template>
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'

const TagSelectOption = TagSelect.Option
const statusMap = {
  0: {
    status: 'default',
    text: '关闭'
  },
  1: {
    status: 'processing',
    text: '运行中'
  },
  2: {
    status: 'success',
    text: '容器已分配'
  },
  3: {
    status: 'error',
    text: '异常'
  }
}
const normMap = {
  0: {
    text: '安全性'
  },
  1: {
    text: '鲁棒性'
  },
  2: {
    text: '隐私性'
  },
  3: {
    text: '可信性'
  }
}
const data = []
data.push({
  name: '安全计算微服务',
  type: 0,
  domain: 0,
  industry: 0,
  scenario: 1,
  technology: 1,
  status: 0,
  norm: [
    {
      key: 0,
      score: 5
    },
    {
      key: 2,
      score: 5
    }
  ],
  number: '2342',
  source: {
    popoverTitle: '可信云技术服务溯源',
    companyName: '复旦大学',
    companyAddress: '上海市杨浦区邯郸路220号',
    companyContact: '021-65642222',
    companyIntroduce: '复旦大学校名取自《尚书大传》之“日月光华，旦复旦兮”，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部“长江学者”特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，“中国大学智库论坛”秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
    msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
    companyScore: 5,
    msScore: 5
  }
})
data.push({
  name: '技术评测微服务',
  type: 0,
  domain: 0,
  industry: 1,
  scenario: 2,
  technology: 2,
  status: 3,
  norm: [
    {
      key: 1,
      score: 5
    },
    {
      key: 2,
      score: 5
    }
  ],
  number: '2342',
  source: {
    popoverTitle: '可信云技术服务溯源',
    companyName: '复旦大学',
    companyAddress: '上海市杨浦区邯郸路220号',
    companyContact: '021-65642222',
    companyIntroduce: '复旦大学校名取自《尚书大传》之“日月光华，旦复旦兮”，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部“长江学者”特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，“中国大学智库论坛”秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
    msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
    companyScore: 5,
    msScore: 5
  }
})
data.push({
  name: '信用评估微服务',
  type: 0,
  domain: 0,
  industry: 3,
  scenario: 4,
  technology: 4,
  status: 1,
  norm: [
    {
      key: 1,
      score: 5
    },
    {
      key: 2,
      score: 5
    },
    {
      key: 3,
      score: 5
    }
  ],
  number: '2342',
  source: {
    popoverTitle: '可信云技术服务溯源',
    companyName: '复旦大学',
    companyAddress: '上海市杨浦区邯郸路220号',
    companyContact: '021-65642222',
    companyIntroduce: '复旦大学校名取自《尚书大传》之“日月光华，旦复旦兮”，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部“长江学者”特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，“中国大学智库论坛”秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
    msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
    companyScore: 5,
    msScore: 5
  }
})
data.push({
  name: '报告生成微服务',
  type: 0,
  domain: 0,
  industry: 2,
  scenario: 3,
  technology: 3,
  status: 2,
  norm: [
    {
      key: 0,
      score: 5
    },
    {
      key: 1,
      score: 5
    },
    {
      key: 3,
      score: 5
    }
  ],
  number: '2342',
  source: {
    popoverTitle: '可信云技术服务溯源',
    companyName: '复旦大学',
    companyAddress: '上海市杨浦区邯郸路220号',
    companyContact: '021-65642222',
    companyIntroduce: '复旦大学校名取自《尚书大传》之“日月光华，旦复旦兮”，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部“长江学者”特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，“中国大学智库论坛”秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
    msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
    companyScore: 5,
    msScore: 5
  }
})
if (sessionStorage.getItem('upload_exception_service') === '1') {
  data.push({
    name: '异常识别微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 0,
    technology: 0,
    status: 1,
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    number: '2342',
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '复旦大学校名取自《尚书大传》之“日月光华，旦复旦兮”，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部“长江学者”特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，“中国大学智库论坛”秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    }
  })
}

export default {
  name: 'TableList',
  components: {
    Ellipsis,
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    TagSelectOption
  },
  data() {
    return {
      // create model
      kvalue: 5,
      form: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
      mdl: null,
      agentSearchText: '',
      agentSearchLoading: false,
      agentSearchData: [],
      // 查询参数
      queryParam: {
        type: [],
        domain: [],
        industry: [],
        scenario: [],
        technology: []
      },
      // 加载数据方法 必须为 Promise 对象
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name'
        },
        {
          title: '服务类型',
          dataIndex: 'type',
          width: '100px',
          customRender: (text) => this.typeArr[text]
        },
        {
          title: '技术类型',
          dataIndex: 'technology',
          width: '100px',
          customRender: (text) => this.technologyArr[text]
        },
        {
          title: '服务状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '技术指标',
          dataIndex: 'norm',
          scopedSlots: { customRender: 'norm' }
        },
        {
          title: '调用次数',
          dataIndex: 'number',
          customRender: (text) => text + ' 次'
        },
        {
          title: '服务溯源',
          dataIndex: 'source',
          scopedSlots: { customRender: 'source' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '80px',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataSource: data,
      filteredDataSource: data,
      selectedRowKeys: [],
      selectedRows: [],
      typeArr: ['原子微服务', '元应用服务'],
      domainArr: ['跨境支付AI监测服务'],
      industryArr: ['金融风控', '自贸监管', '跨境贸易', '跨境电商'],
      scenarioArr: ['反洗钱', '合规监测', '税务稽查', '业务统计', '信用评估'],
      technologyArr: ['异常识别', '安全计算', '技术评测', '报告生成', '配套技术', '关联技术']
    }
  },
  filters: {
    statusFilter(type) {
      return statusMap[type].text
    },
    statusTypeFilter(type) {
      return statusMap[type].status
    },
    normFilter(type) {
      // console.log(type)
      return normMap[type].text
    }
  },
  created() {
    this.filteredDataSource = this.dataSource
  },
  computed: {
  },
  methods: {
    handleTagChange(field, e) {
      const selectedTagVal = e.value
      const index = this.queryParam[field].indexOf(selectedTagVal)
      if (index > -1) {
        this.queryParam[field].splice(index, 1)
      } else {
        this.queryParam[field].push(selectedTagVal)
      }
      this.filterDataSource()
    },
    filterDataSource() {
      this.filteredDataSource = this.dataSource.filter(item => {
        return (this.queryParam.type.length > 0 ? this.queryParam.type.includes(item.type) : true) &&
          (this.queryParam.domain.length > 0 ? this.queryParam.domain.includes(item.domain) : true) &&
          (this.queryParam.industry.length > 0 ? this.queryParam.industry.includes(item.industry) : true) &&
          (this.queryParam.scenario.length > 0 ? this.queryParam.scenario.includes(item.scenario) : true) &&
          (this.queryParam.technology.length > 0 ? this.queryParam.technology.includes(item.technology) : true)
      })
    },
    handleSearch() {
      this.filterDataSource()
    },
    handleReset() {
      this.queryParam = {}
      this.filteredDataSource = this.dataSource
    },
    handleToAdd() {
      this.$refs.tempSelectModal.open()
    },
    handleAdd() {
      this.$emit('onGoAdd')
    },
    handleEdit(record) {
      // console.log(record)
    },
    handleSource(record) {
      // console.log(record)
    },
    handleUse(record) {
      if (record.status === 0) {
        this.$message.warning('服务关闭中，请启动后使用！')
      } else if (record.status === 3) {
        this.$message.error('服务异常，暂无法使用！')
      } else {
        this.$emit('onGoUse')
      }
    },
    delConfirm() {
      this.$message.success('删除成功！')
    },
    handleOk() {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          // console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel() {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleSub(record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    handleChange(value) {
      // console.log(`selected ${value}`)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    resetSearchForm() {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    handleAgentSearch() {
      // console.log(this.agentSearchText)
      if (this.agentSearchText && this.agentSearchText !== '') {
        this.agentSearchLoading = true
        new Promise((resolve, reject) => {
          setTimeout(() => {
            this.agentSearchData = this.dataSource.filter((item, index) => (index % 2 === 0))
            resolve()
          }, 1000)
        }).then(res => {
          this.filteredDataSource = this.agentSearchData
        }).finally(() => {
          this.agentSearchLoading = false
        })
      } else {
        this.$message.error('请先输入您的需求！')
      }
    }
  }
}
</script>
<style lang="less" scoped>
.ant-pro-components-tag-select {
  :deep(.ant-pro-tag-select .ant-tag) {
    margin-right: 24px;
    padding: 0 8px;
    font-size: 14px;
  }
}

.list-articles-trigger {
  margin-left: 12px;
}

/* 聊天机器人容器的样式 */
.dify-chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 400px;
  height: 500px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 按钮的样式 */
.dify-chatbot-bubble-button {
  width: 60px;
  border-radius: 25%;
  /* 圆形按钮 */
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dify-chatbot-bubble-button:hover {
  background: #40a9f0;
  transform: scale(1.1);
  /* 悬停时放大 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.dify-chatbot-bubble-button:active {
  transform: scale(0.95);
  /* 点击时缩小 */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
</style>
