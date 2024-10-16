<template>
  <div>
    <a-card>
      <!--    <a-form :form="form">
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="Name"
        >
          <a-input
            v-decorator="[
          'username',
          { rules: [{ required: true, message: 'Please input your name' }] },
        ]"
            placeholder="Please input your name"
          />
        </a-form-item>
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="Nickname"
        >
          <a-input
            v-decorator="[
          'nickname',
          { rules: [{ required: checkNick, message: 'Please input your nickname' }] },
        ]"
            placeholder="Please input your nickname"
          />
        </a-form-item>
        <a-form-item :label-col="formTailLayout.labelCol" :wrapper-col="formTailLayout.wrapperCol">
          <a-checkbox :checked="checkNick" @change="handleChange">
            Nickname is required
          </a-checkbox>
        </a-form-item>
        <a-form-item :label-col="formTailLayout.labelCol" :wrapper-col="formTailLayout.wrapperCol">
          <a-button type="primary" @click="check">
            Check
          </a-button>
        </a-form-item>
      </a-form>-->

      <a-form v-bind="formItemLayout" :form="form">
        <a-form-item
          label="手动刷新:"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-button type="primary">
            刷新
          </a-button>
        </a-form-item>
        <a-form-item
          label="Radio.Group"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-radio-group v-decorator="['radio-group']">
            <a-radio value="a">
              item 1
            </a-radio>
            <a-radio value="b">
              item 2
            </a-radio>
            <a-radio value="c">
              item 3
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-card>
    <a-textarea v-model="logValue" :rows="12" style="margin-top: 30px">

    </a-textarea>

    <a-descriptions>
      <a-descriptions-item>
        {{ logValue }}
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script>
  const formItemLayout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 8 }
  }
  const formTailLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8, offset: 4 }
  }
  export default {
    name: 'Logs',
    data() {
      return {
        formItemLayout,
        formTailLayout,
        form: this.$form.createForm(this, { name: 'dynamic_rule' }),
        queryName: this.$route.query.kee,
        logValue: 'z这是是是是是是是是是是'
      }
    },
    methods: {
      testRouter() {
        console.log(this.queryName)
        console.log(this.$route.fullPath)
        console.log(this.$route.query)
      }
    }
  }
</script>

<style scoped>

</style>
