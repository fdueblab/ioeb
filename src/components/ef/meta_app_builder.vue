<template>
  <a-modal
    :width="1000"
    :dialogStyle="{ top: '30px' }"
    :visible="visible"
    title="构建元应用"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="预发布"
    cancel-text="取消"
  >
    <div style="display: flex; justify-content: space-around">
      <!-- 应用预览区域 -->
      <div style="width: 35%">
        <span class="title">元应用界面预览</span>
        <div class="app-preview">
          <span class="app-title">{{ form.getFieldValue('name') || preName }}</span>
          <div class="input-output-container">
            <!-- 输入区域 -->
            <div>
              <span class="section-title">{{ form.getFieldValue('inputName') || preInputName }}</span>
              <a-textarea
                v-show="inputType === 1 || inputType === 3"
                placeholder="欢迎使用AI中台为您构建的元应用!"
                :auto-size="{ minRows: 4, maxRows: 6 }"
                class="input-box"
              />
              <div style="width: 100%; display: flex; justify-content: center; margin-top: 10px">
                <a-button v-show="inputType === 2 || inputType === 3"> <a-icon type="upload" /> 选择数据文件 </a-button>
              </div>
              <div style="width: 100%">
                <a-button class="submit-button" type="primary" @click="handleSubmit">
                  {{ form.getFieldValue('submitButtonText') || '获取结果' }}
                </a-button>
              </div>
            </div>
            <!-- 输出区域 -->
            <div>
              <span class="section-title">{{ form.getFieldValue('outputName') || preOutputName }}</span>
              <div v-show="outputType === 1 || outputType === 3" class="output-box">
                预发布后即可验证此元应用
              </div>
              <div style="width: 100%; display: flex; justify-content: center; margin-top: 10px">
                <a-button v-show="outputType === 2 || outputType === 3"> <a-icon type="download" /> 下载结果文件 </a-button>
              </div>
              <div v-show="form.getFieldValue('visualization')" class="image-box">
                {{ form.getFieldValue('outputName') || preOutputName }}可视化区域
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 元应用信息区域 -->
      <div style="width: 50%">
        <span class="title">元应用属性</span>
        <a-form :form="form" layout="vertical">
          <a-divider>视觉配置</a-divider>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="名称">
                <a-input v-decorator="['name', { rules: [{ required: true, message: '请填写元应用名称!' }], initialValue: preName }]" placeholder="请输入元应用名称" />
              </a-form-item>
            </a-col>
            <a-col :span="18">
              <a-form-item label="输入类型" required>
                <a-radio-group v-model="inputType">
                  <a-radio :value="0">无</a-radio>
                  <a-radio :value="1">文本</a-radio>
                  <a-radio :value="2">文件</a-radio>
                  <a-radio :value="3">文本 + 文件</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col v-if="inputType !== 0" :span="12">
              <a-form-item label="输入数据名称">
                <a-input v-decorator="['inputName', { rules: [{ required: true, message: '请填写输入数据名称!' }], initialValue: preInputName }]"/>
              </a-form-item>
            </a-col>
            <a-col :span="18">
              <a-form-item label="输出类型" required>
                <a-radio-group v-model="outputType">
                  <a-radio :value="0">无</a-radio>
                  <a-radio :value="1">文本</a-radio>
                  <a-radio :value="2">文件</a-radio>
                  <a-radio :value="3">文本 + 文件</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col v-if="outputType !== 0" :span="12">
              <a-form-item label="输出数据名称">
                <a-input v-decorator="['outputName', { rules: [{ required: true, message: '请填写输出数据名称!' }], initialValue: preOutputName }]"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="获取结果按钮文本">
                <a-input v-decorator="['submitButtonText', { rules: [{ required: true, message: '请填写获取结果按钮文本!' }], initialValue: '获取结果' }]"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="结果可视化">
                <div style="height:32px; display: flex; justify-content: space-between; align-items: center">
                  <a-checkbox v-decorator="['visualization']">
                    结果可视化展示
                  </a-checkbox>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <a-divider>应用信息</a-divider>
          <a-row>
            <a-col :span="24">
              <a-form-item label="通用描述">
                <a-textarea v-decorator="['des', { initialValue: preDes }]" placeholder="请输入描述"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="属性">
                <a-select v-decorator="['attribute']" placeholder="请选择属性" allow-clear>
                  <a-select-option v-for="(item, index) in attributeOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="行业">
                <a-select v-decorator="['industry']" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="场景">
                <a-select v-decorator="['scenario']" placeholder="请选择元应用场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="技术">
                <a-select v-decorator="['technology']" placeholder="请选择元应用技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <!--          <a-row :gutter="16">-->
          <!--            <a-col :span="24">-->
          <!--              <a-form-item label="条件（environment）">-->
          <!--                <a-input v-decorator="['environment']" placeholder="请输入Environment"/>-->
          <!--              </a-form-item>-->
          <!--            </a-col>-->
          <!--          </a-row>-->
          <!--          <a-row :gutter="16">-->
          <!--            <a-col :span="24">-->
          <!--              <a-form-item label="处理（process）">-->
          <!--                <a-input v-decorator="['process']" placeholder="请输入Process"/>-->
          <!--              </a-form-item>-->
          <!--            </a-col>-->
          <!--          </a-row>-->
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { createService } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'
import store from '@/store'

export default {
  props: {
    verticalType: {
      type: String,
      required: true
    },
    preName: {
      type: String,
      default: '元应用名称'
    },
    preDes: {
      type: String,
      default: '以支持独立运行和柔性集成的大模型智能体为软件载体的最小粒度应用'
    },
    preInputName: {
      type: String,
      default: '输入内容'
    },
    preOutputName: {
      type: String,
      default: '输出内容'
    }
  },
  data() {
    return {
      visible: false,
      inputType: 1,
      outputType: 1,
      attributeOptions: [],
      industryOptions: [],
      scenarioOptions: [],
      technologyOptions: [],
      form: this.$form.createForm(this)
    }
  },
  methods: {
    async init() {
      this.visible = true
      this.attributeOptions = await dictionaryCache.loadDict('attribute') || []
      this.industryOptions = await dictionaryCache.loadDict(`${this.verticalType}_industry`) || []
      this.scenarioOptions = await dictionaryCache.loadDict(`${this.verticalType}_scenario`) || []
      this.technologyOptions = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
    },
    handleSubmit() {
      // 这里可以处理提交预览逻辑
    },
    handleOk() {
      const { form: { validateFields } } = this
      this.visible = true
      validateFields(async (errors, values) => {
          if (!errors) {
            const { name, des, inputName, outputName, outputVisualization, submitButtonText } = values
            let url = 'https://myMcpServer.com/metaApp/agent_ak7jq'
            let method = 'post'
            let response = {
              code: 200,
              message: '微服务正在部署！',
              data: {
                deployingStatus: 'pending'
              }
            }
            if (name.includes('课题一')) {
              url = '/api/pj1_report_app'
              method = 'post'
              response = {
                code: 200,
                message: '获取成功!',
                data: {
                  result: '基于图神经网络的跨境贸易支付监测模型的推理结果已经产生。模型在数据集上的表现如下：\n\n在100个节点中，有93个节点被判定为类别0，7个节点被判定为类别2。具体结果如下：\n\n- 类别0：节点1，节点2，节点3，节点4，节点9，节点10，节点11，节点12，节点13，节点14，节点15，节点16，节点17，节点\n18，节点19，节点20，节点21，节点22，节点23，节点24，节点25，节点26，节点27，节点28，节点29，节点30，节点31，节点\n32，节点33，节点34，节点35，节点36，节点37，节点38，节点39，节点40，节点41，节点42，节点43，节点44，节点45，节点\n46，节点47，节点48，节点49，节点50，节点51，节点52，节点53，节点54，节点55，节点56，节点57，节点58，节点59，节点\n60，节点61，节点62，节点63，节点65，节点66，节点67，节点68，节点69，节点70，节点71，节点72，节点73，节点74，节点\n75，节点76，节点77，节点78，节点79，节点80，节点81，节点82，节点83，节点84，节点85，节点86，节点87，节点88，节点\n89，节点90，节点91，节点92，节点93，节点94，节点95，节点96。\n\n- 类别2：节点0，节点5，节点6，节点7，节点8，节点64，节点97，节点98，节点99。\n\n总结，大多数节点（93%）被分类为类别0，而较小的部分（7%）被分类为类别2。这可能反映了在训练集中类别0的样本数量更多\n，模型在识别类别0的能力上表现得更好。同时，模型对于类别2的识别也有一定的能力。'
                }
              }
            }
            const serviceData = {
              ...values,
              domain: this.verticalType,
              type: 'meta',
              status: 'deploying',
              netWork: 'ioeb_app-network',
              port: '0.0.0.0:1021/TCP → 0.0.0.0:10021',
              volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/metaApp',
              source: {
                popoverTitle: '可信云技术服务溯源',
                companyName: '复旦大学课题组',
                companyAddress: '上海市杨浦区邯郸路220号',
                companyContact: '021-65642222',
                companyIntroduce: '课题五',
                msIntroduce: `${store.getters.nickname}构建的元应用。${des ? '应用描述：' + des : ''}`,
                companyScore: 5,
                msScore: 5
              },
              apiList: [
                {
                  name,
                  des,
                  inputName,
                  outputName,
                  outputVisualization,
                  submitButtonText,
                  isFake: true,
                  url,
                  method,
                  parameterType: this.inputType,
                  responseType: this.outputType,
                  response
                }
              ],
              number: 0
            }
            try {
              const response = await createService(serviceData)
              if (response && response.status === 'success') {
                this.$message.success('预发布成功！部署完成后可进行业务验证')
                this.visible = false
                this.$emit('close')
              } else {
                this.$message.error(response?.message || '预发布失败')
              }
            } catch (error) {
              console.error('预发布失败:', error)
              this.$message.error('预发布异常，请稍后重试！')
            } finally {
              this.uploadServiceLoading = false
            }
          } else {
              console.log('errors', errors)
            }
          }
        )
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/* 区域标题 */
.title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
  display: block;
}

/* 应用预览区域 */
.app-preview {
  width: 100%;
  aspect-ratio: 9 / 19; /* 设置宽高比 */
  overflow-y: auto; /* 使高度限制生效 */
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 16px;
  font-weight: bold;
  background-color: #1890ff;
  color: #fff;
  text-align: center;
  display: block;
  line-height: 35px;
  border-radius: 6px 6px 0 0;
}

/* 输入输出容器 */
.input-output-container {
  margin: 16px;
}

/* 输入输出标题 */
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 8px;
  line-height: 30px;
}

/* 输入框 */
.input-box {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.submit-button {
  width: 50%;
  margin: 10px 0;
  left: 25%;
}

/* 输出框 */
.output-box {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

/* 图片框 */
.image-box {
  width: 100%;
  min-height: 150px;
  margin-top: 16px;
  padding: 16px;
  background-color: #e8e8e8;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-style: italic;
}
</style>
