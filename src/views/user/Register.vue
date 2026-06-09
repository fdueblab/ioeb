<template>
  <div class="main user-layout-register">
    <h3><span>{{ $t('user.register.register') }}</span></h3>
    <a-form ref="formRegister" :form="form" id="formRegister">
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="请输入用户名"
          v-decorator="['username', {rules: [{ required: true, message: '请输入用户名' }, { min: 3, max: 50, message: '用户名长度需在 3-50 个字符之间' }], validateTrigger: ['change', 'blur']}]"
        >
          <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }"/>
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="请输入姓名（选填，默认与用户名相同）"
          v-decorator="['name', {rules: [], validateTrigger: ['change', 'blur']}]"
        >
          <a-icon slot="prefix" type="idcard" :style="{ color: 'rgba(0,0,0,.25)' }"/>
        </a-input>
      </a-form-item>

      <a-popover
        placement="rightTop"
        :trigger="['focus']"
        :getPopupContainer="(trigger) => trigger.parentElement"
        v-model="state.passwordLevelChecked">
        <template slot="content">
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">{{ $t(passwordLevelName) }}</div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor="passwordLevelColor" />
            <div style="margin-top: 10px;">
              <span>{{ $t('user.register.password.popover-message') }}</span>
            </div>
          </div>
        </template>
        <a-form-item>
          <a-input-password
            size="large"
            @click="handlePasswordInputClick"
            placeholder="请输入密码"
            v-decorator="['password', {rules: [{ required: true, message: '请输入密码' }, { validator: this.handlePasswordLevel }], validateTrigger: ['change', 'blur']}]"
          >
            <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input-password>
        </a-form-item>
      </a-popover>

      <a-form-item>
        <a-input-password
          size="large"
          placeholder="请确认密码"
          v-decorator="['password2', {rules: [{ required: true, message: '请确认密码' }, { validator: this.handlePasswordCheck }], validateTrigger: ['change', 'blur']}]"
        >
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
        </a-input-password>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="register-button"
          :loading="registerBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="registerBtn">{{ $t('user.register.register') }}
        </a-button>
        <router-link class="login" :to="{ name: 'login' }">{{ $t('user.register.sign-in') }}</router-link>
      </a-form-item>

    </a-form>
  </div>
</template>

<script>
import { register } from '@/api/login'
import { deviceMixin } from '@/store/device-mixin'
import { scorePassword } from '@/utils/util'

const levelNames = {
  0: 'user.password.strength.short',
  1: 'user.password.strength.low',
  2: 'user.password.strength.medium',
  3: 'user.password.strength.strong'
}
const levelClass = {
  0: 'error',
  1: 'error',
  2: 'warning',
  3: 'success'
}
const levelColor = {
  0: '#ff0000',
  1: '#ff0000',
  2: '#ff7e05',
  3: '#52c41a'
}
export default {
  name: 'Register',
  mixins: [deviceMixin],
  data () {
    return {
      form: this.$form.createForm(this),
      state: {
        level: 0,
        passwordLevel: 0,
        passwordLevelChecked: false,
        percent: 10
      },
      registerBtn: false
    }
  },
  computed: {
    passwordLevelClass () {
      return levelClass[this.state.passwordLevel]
    },
    passwordLevelName () {
      return levelNames[this.state.passwordLevel]
    },
    passwordLevelColor () {
      return levelColor[this.state.passwordLevel]
    }
  },
  methods: {
    handlePasswordLevel (rule, value, callback) {
      if (!value) {
        return callback()
      }
      if (value.length >= 6) {
        if (scorePassword(value) >= 30) {
          this.state.level = 1
        }
        if (scorePassword(value) >= 60) {
          this.state.level = 2
        }
        if (scorePassword(value) >= 80) {
          this.state.level = 3
        }
      } else {
        this.state.level = 0
        callback(new Error(this.$t('user.password.strength.msg')))
      }
      this.state.passwordLevel = this.state.level
      this.state.percent = this.state.level * 33
      callback()
    },

    handlePasswordCheck (rule, value, callback) {
      const password = this.form.getFieldValue('password')
      if (value === undefined) {
        callback(new Error('请确认密码'))
      }
      if (value && password && value.trim() !== password.trim()) {
        callback(new Error(this.$t('user.password.twice.msg')))
      }
      callback()
    },

    handlePasswordInputClick () {
      if (!this.isMobile) {
        this.state.passwordLevelChecked = true
        return
      }
      this.state.passwordLevelChecked = false
    },

    handleSubmit () {
      const { form: { validateFields } } = this
      this.registerBtn = true
      validateFields(['username', 'name', 'password', 'password2'], { force: true }, (err, values) => {
        if (!err) {
          register({
            username: values.username,
            password: values.password,
            name: values.name || values.username
          }).then(() => {
            this.$notification.success({
              message: '注册成功',
              description: '请使用新账户登录'
            })
            this.$router.push({ name: 'login' })
          }).catch(err => {
            const msg = (err.response && err.response.data && err.response.data.message) || err.message || '注册失败，请稍后再试'
            this.$notification.error({
              message: '注册失败',
              description: msg,
              duration: 4
            })
          }).finally(() => {
            this.registerBtn = false
          })
        } else {
          this.registerBtn = false
        }
      })
    }
  }
}
</script>
<style lang="less">
  .user-register {

    &.error {
      color: #ff0000;
    }

    &.warning {
      color: #ff7e05;
    }

    &.success {
      color: #52c41a;
    }

  }

  .user-layout-register {
    .ant-input-group-addon:first-child {
      background-color: #fff;
    }
  }
</style>
<style lang="less" scoped>
  .user-layout-register {

    & > h3 {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .register-button {
      width: 50%;
    }

    .login {
      float: right;
      line-height: 40px;
    }
  }
</style>
