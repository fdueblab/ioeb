<template>
  <a-dropdown v-if="currentUser && currentUser.name" placement="bottomRight">
    <span class="ant-pro-account-avatar ant-pro-account-avatar--with-progress">
      <div class="avatar-row">
        <a-avatar size="small" :src="currentUser.avatar || '/avatar2.png'" class="antd-pro-global-header-index-avatar" />
        <span class="avatar-name">{{ currentUser.name }}</span>
      </div>
      <a-tooltip :title="$t('account.settings.profile.completion') + '：' + (currentUser.completion || 0) + '%'">
        <a-progress
          class="avatar-progress"
          :percent="currentUser.completion || 0"
          :show-info="false"
          size="small"
          @click.native.stop="handleToProfile"
        />
      </a-tooltip>
    </span>
    <template v-slot:overlay>
      <a-menu class="ant-pro-drop-down menu" :selected-keys="[]">
        <!-- <a-menu-item v-if="menu" key="center" @click="handleToCenter">
          <a-icon type="user" />
          {{ $t('menu.account.center') }}
        </a-menu-item> -->
        <a-menu-item v-if="menu" key="settings" @click="handleToSettings">
          <a-icon type="setting" />
          {{ $t('menu.account.settings') }}
        </a-menu-item>
        <a-menu-divider v-if="menu" />
        <a-menu-item key="logout" @click="handleLogout">
          <a-icon type="logout" />
          {{ $t('menu.account.logout') }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <span v-else>
    <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
  </span>
</template>

<script>
import { Modal } from 'ant-design-vue'

export default {
  name: 'AvatarDropdown',
  props: {
    currentUser: {
      type: Object,
      default: () => null
    },
    menu: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleToCenter () {
      this.$router.push({ path: '/account/center' })
    },
    handleToSettings () {
      this.$router.push({ path: '/account/settings' })
    },
    handleToProfile () {
      this.$router.push({ path: '/account/settings/profile' }).catch(() => {})
    },
    handleLogout (e) {
      Modal.confirm({
        title: this.$t('layouts.usermenu.dialog.title'),
        content: this.$t('layouts.usermenu.dialog.content'),
        onOk: () => {
          // return new Promise((resolve, reject) => {
          //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1500)
          // }).catch(() => console.log('Oops errors!'))
          return this.$store.dispatch('Logout').then(() => {
            this.$router.push({ name: 'login' })
          })
        },
        onCancel () {}
      })
    }
  }
}
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  :deep(.action) {
    margin-right: 8px;
  }
  :deep(.ant-dropdown-menu-item) {
    min-width: 160px;
  }
}

.ant-pro-account-avatar--with-progress {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.2;
  vertical-align: middle;

  .avatar-row {
    display: flex;
    align-items: center;

    .avatar-name {
      margin-left: 8px;
    }
  }

  .avatar-progress {
    width: 100%;
    min-width: 90px;
    margin-top: 2px;
    cursor: pointer;

    :deep(.ant-progress-inner) {
      vertical-align: top;
    }
  }
}
</style>
