const amlServices = [
  {
    name: '安全计算微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 1,
    netWork: 'bridge',
    port: '0.0.0.0:8000/TCP → 0.0.0.0:80000',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 4,
    number: '512',
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
    apiList: [
      {
        name: 'train',
        url: 'http://myApiServer.com/safe-calculation/train',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '训练完成!',
          data: {
            modelId: '1',
            modelName: 'model1',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/model/model1.pkl'
          }
        }
      },
      {
        name: 'predict',
        url: 'http://myApiServer.com/safe-calculation/predict',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '预测成功！',
          data: {
            predictResult: 'predict result list'
          }
        }
      }
    ]
  },
  {
    name: '技术评测微服务',
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8001/TCP → 0.0.0.0:80001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 1,
    number: '8192',
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
    apiList: [
      {
        name: 'train',
        url: 'http://myApiServer.com/technical-assessment/train',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '训练完成!',
          data: {
            modelId: '2',
            modelName: 'model2',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/model/model2.pkl'
          }
        }
      },
      {
        name: 'predict',
        url: 'http://myApiServer.com/technical-assessment/predict',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '预测成功！',
          data: {
            predictResult: 'predict result list'
          }
        }
      }
    ]
  },
  {
    name: '报告生成微服务',
    type: 0,
    domain: 0,
    industry: 2,
    scenario: 3,
    technology: 3,
    netWork: 'bridge',
    port: '0.0.0.0:8002/TCP → 0.0.0.0:80002',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 1,
    number: '2330',
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
    apiList: [
      {
        name: 'getReport',
        url: 'http://myApiServer.com/{reportId}}/get',
        method: 'GET',
        parameterType: 1,
        response: {
          code: 200,
          message: '获取成功!',
          data: {
            reportRow: '报告数据'
          }
        }
      },
      {
        name: 'sendReport',
        url: 'http://myApiServer.com/{reportId}}/send',
        method: 'GET',
        parameterType: 1,
        response: {
          code: 200,
          message: '发送成功！',
          data: {
            reportId: '1'
          }
        }
      },
      {
        name: 'generateReport',
        url: 'http://myApiServer.com/report-generation/generate',
        method: 'POST',
        parameterType: 3,
        response: {
          code: 200,
          message: '生成成功！',
          data: {
            reportPath: '/appdata/aml/report/report1.pdf'
          }
        }
      }
    ]
  },
  {
    name: '信用评估微服务',
    type: 0,
    domain: 0,
    industry: 3,
    scenario: 4,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8003/TCP → 0.0.0.0:80003',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 2,
    number: '2342',
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
    apiList: [
      {
        name: 'train',
        url: 'http://myApiServer.com/credit-assessment/train',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '训练完成!',
          data: {
            modelId: '4',
            modelName: 'model4',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/model/model3.pkl'
          }
        }
      },
      {
        name: 'predict',
        url: 'http://myApiServer.com/credit-assessment/predict',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '预测成功！',
          data: {
            predictResult: 'predict result list'
          }
        }
      }
    ]
  },
  {
    name: '异常识别微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 0,
    technology: 0,
    netWork: 'bridge',
    port: '0.0.0.0:8004/TCP → 0.0.0.0:80004',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 0,
    number: '0',
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
        key: 2,
        score: 5
      }
    ],
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
    apiList: [
      {
        name: 'train',
        url: 'http://myApiServer.com/anomaly-detection/train',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '训练完成!',
          data: {
            modelId: '4',
            modelName: 'model4',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/model/model4.pkl'
          }
        }
      },
      {
        name: 'predict',
        url: 'http://myApiServer.com/anomaly-detection/predict',
        method: 'POST',
        parameterType: 2,
        response: {
          code: 200,
          message: '预测成功！',
          data: {
            predictResult: 'predict result list'
          }
        }
      }
    ]
  }
]

const airCraftServices = [
  {
    name: '无人机虚拟仿真微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 0,
    technology: 1,
    netWork: 'bridge',
    port: '0.0.0.0:8080/TCP → 0.0.0.0:80080',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 4,
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
        key: 2,
        score: 5
      }
    ],
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
    number: '2342'
  },
  {
    name: '无人机低空测绘微服务',
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 3,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8081/TCP → 0.0.0.0:80081',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
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
    number: '2342'
  },
  {
    name: '无人机目标识别微服务',
    type: 0,
    domain: 0,
    industry: 2,
    scenario: 4,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8082/TCP → 0.0.0.0:80082',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
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
    number: '2342'
  },
  {
    name: '无人机远程控制微服务',
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 3,
    netWork: 'bridge',
    port: '0.0.0.0:8083/TCP → 0.0.0.0:80083',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
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
    number: '2342'
  },
  {
    name: '无人机视频分析微服务',
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8084/TCP → 0.0.0.0:80084',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
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
    number: '2342'
  }
]

const amlMetaApps = [
  {
    name: '跨境支付评估报告生成',
    type: 1,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:1020/TCP → 0.0.0.0:10020',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/metaApp',
    status: 4,
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
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    number: '2342'
  }
]

const airCraftMetaApps = [
  {
    name: '无人机智能投递',
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8084/TCP → 0.0.0.0:80084',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 4,
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
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    number: '2342'
  }
]

export function getAmlServices() {
  if (sessionStorage.getItem('upload_exception_service')) {
    amlServices.find(item => item.name === '异常识别微服务').status = Number(sessionStorage.getItem('upload_exception_service'))
    return amlServices
  } else {
    return amlServices.filter(item => item.name !== '异常识别微服务')
  }
}

export function getRunningAmlServices() {
  return getAmlServices().filter(item => item.status === 1 || item.status === 4)
}

export function getAirCraftServices() {
  return airCraftServices
}

export function getRunningAirCraftServices() {
  return airCraftServices.filter(item => item.status === 1 || item.status === 4)
}

export function getAmlMetaApps() {
  if (sessionStorage.getItem('metaAppInfo')) {
    const metaAppInfo = JSON.parse(sessionStorage.getItem('metaAppInfo'))
    return [...amlMetaApps, metaAppInfo]
  } else {
    return amlMetaApps
  }
}

export function getRunningAmlMetaApps() {
  return getAmlMetaApps().filter(item => item.status === 1 || item.status === 4)
}

export function getAirCraftMetaApps() {
  return airCraftMetaApps
}

export function getRunningAirCraftMetaApps() {
  return airCraftMetaApps.filter(item => item.status === 1 || item.status === 4)
}
