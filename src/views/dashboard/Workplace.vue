<template>
  <div class="workbench-page">
    <section class="workbench-hero">
      <div class="workbench-hero__main">
        <div class="workbench-kicker">
          <span class="workbench-kicker__dot"></span>
          个人工作台
        </div>
        <h1>{{ greeting }}，{{ displayName }}</h1>
        <p>
          当前垂域：{{ currentDomainText }} · {{ roleLabel }} · 画像完成度 {{ profileCompletion }}%
        </p>
      </div>
      <div class="workbench-hero__actions">
        <a-button type="primary" icon="search" @click="go(resourceEntryPath)">开始资源检索</a-button>
        <a-button icon="setting" @click="go('/account/settings/profile')">完善个人画像</a-button>
      </div>
    </section>

    <a-row :gutter="16">
      <a-col :xl="16" :lg="24" :md="24" :sm="24" :xs="24">
        <section class="workbench-panel workbench-panel--lead">
          <div class="section-heading">
            <div>
              <h2>下一步</h2>
              <p>按当前角色显示可用入口</p>
            </div>
          </div>

          <div class="action-grid">
            <button
              v-for="action in availableActions"
              :key="action.key"
              type="button"
              class="action-tile"
              :class="{ 'action-tile--primary': action.primary }"
              @click="go(action.path)"
            >
              <span class="action-tile__icon">
                <a-icon :type="action.icon" />
              </span>
              <span class="action-tile__body">
                <strong>{{ action.title }}</strong>
                <span>{{ action.description }}</span>
              </span>
              <a-icon class="action-tile__arrow" type="right" />
            </button>
          </div>
        </section>

        <section class="workbench-panel">
          <div class="section-heading">
            <div>
              <h2>最近访问</h2>
              <p>继续上次的工作</p>
            </div>
            <a-button size="small" icon="reload" @click="loadRecentRoutes">刷新</a-button>
          </div>

          <a-list v-if="recentRoutes.length" class="recent-list" :data-source="recentRoutes" item-layout="horizontal">
            <a-list-item slot="renderItem" slot-scope="item">
              <a-list-item-meta>
                <a-avatar slot="avatar" class="recent-list__avatar" icon="clock-circle" />
                <a slot="title" @click="go(item.path)">{{ routeTitle(item.title) }}</a>
                <span slot="description">{{ item.path }} · {{ formatTimeAgo(item.visitedAt) }}</span>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
          <div v-else class="empty-block">
            <a-empty description="暂无最近访问">
              <a-button type="primary" icon="search" @click="go(resourceEntryPath)">开始资源检索</a-button>
            </a-empty>
          </div>
        </section>
      </a-col>

      <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">
        <section class="workbench-panel">
          <div class="section-heading">
            <div>
              <h2>个人状态</h2>
              <p>当前账号上下文</p>
            </div>
          </div>

          <div class="profile-meter">
            <a-progress
              type="circle"
              :width="92"
              :percent="profileCompletion"
              :stroke-color="progressColor"
            />
            <div>
              <strong>{{ profileStatus }}</strong>
              <span>{{ profileHint }}</span>
            </div>
          </div>

          <dl class="context-list">
            <div>
              <dt>垂域</dt>
              <dd>{{ currentDomainText }}</dd>
            </div>
            <div>
              <dt>账号角色</dt>
              <dd>{{ roleLabel }}</dd>
            </div>
            <div>
              <dt>用户名</dt>
              <dd>{{ username }}</dd>
            </div>
          </dl>
        </section>

        <section class="workbench-panel">
          <div class="section-heading">
            <div>
              <h2>常用路径</h2>
              <p>从这里切到完整模块</p>
            </div>
          </div>

          <div class="path-stack">
            <button
              v-for="path in availablePaths"
              :key="path.key"
              type="button"
              class="path-row"
              @click="go(path.path)"
            >
              <a-icon :type="path.icon" />
              <span>{{ path.title }}</span>
              <a-icon type="right" />
            </button>
            <button type="button" class="path-row" @click="openDocs">
              <a-icon type="book" />
              <span>使用指南</span>
              <a-icon type="export" />
            </button>
          </div>
        </section>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { timeFix } from '@/utils/util'
import {
  DEFAULT_DOMAIN,
  getDomainModuleEntryPath
} from '@/utils/domainContext'
import { getRecentRoutes } from '@/utils/recentRoutes'

export default {
  name: 'Workplace',
  data () {
    return {
      greeting: timeFix(),
      recentRoutes: []
    }
  },
  computed: {
    ...mapGetters(['currentDomain', 'currentDomainCode', 'roles', 'userInfo', 'profileCompletion']),
    permissionList () {
      return (this.roles && this.roles.permissionList) || []
    },
    displayName () {
      return this.userInfo.name || this.userInfo.username || this.username || '用户'
    },
    username () {
      return localStorage.getItem('username') || this.userInfo.username || '未识别'
    },
    currentDomainText () {
      return (this.currentDomain && this.currentDomain.text) || DEFAULT_DOMAIN.text
    },
    activeDomainCode () {
      return this.currentDomainCode || DEFAULT_DOMAIN.code
    },
    roleLabel () {
      if (this.hasPermission(['admin'])) return '平台管理员'
      if (this.hasPermission(['publisher'])) return '资源发布者'
      if (this.hasPermission(['user'])) return '应用用户'
      return '平台用户'
    },
    progressColor () {
      if (this.profileCompletion >= 80) return '#1f8a70'
      if (this.profileCompletion >= 40) return '#c47a21'
      return '#315c9b'
    },
    profileStatus () {
      if (this.profileCompletion >= 100) return '画像完整'
      if (this.profileCompletion >= 60) return '画像已建立'
      if (this.profileCompletion > 0) return '画像待完善'
      return '画像未填写'
    },
    profileHint () {
      if (this.profileCompletion >= 100) return '推荐和垂域默认项已可按画像匹配。'
      if (this.profileCompletion > 0) return '补充技术需求后，入口推荐会更准确。'
      return '完善画像后，系统会记住你的垂域和技术偏好。'
    },
    resourceEntryPath () {
      return getDomainModuleEntryPath('/vertical-user', this.activeDomainCode, this.permissionList)
    },
    availableActions () {
      const actions = [
        {
          key: 'resource-search',
          title: 'AI 资源检索',
          description: `进入 ${this.currentDomainText} 的资源检索页。`,
          icon: 'search',
          path: this.resourceEntryPath,
          permission: ['admin', 'publisher', 'user'],
          primary: true
        },
        {
          key: 'scenario-dev',
          title: '想定式开发',
          description: '将业务场景拆解为可调用的算法模型方案。',
          icon: 'code',
          path: getDomainModuleEntryPath('/vertical-scenario-dev', this.activeDomainCode, this.permissionList),
          permission: ['publisher']
        },
        {
          key: 'service-publish',
          title: '发布原子微服务',
          description: '维护当前垂域可被复用的算法服务。',
          icon: 'upload',
          path: getDomainModuleEntryPath('/vertical-ms', this.activeDomainCode, this.permissionList),
          permission: ['publisher']
        },
        {
          key: 'meta-app',
          title: '元应用仿真构建',
          description: '把检索到的资源组合为可运行的应用流程。',
          icon: 'form',
          path: getDomainModuleEntryPath('/vertical-meta-app', this.activeDomainCode, this.permissionList),
          permission: ['user']
        },
        {
          key: 'evaluation',
          title: '技术评测与验证',
          description: '查看模型服务评测或业务数据验证入口。',
          icon: 'radar-chart',
          path: getDomainModuleEntryPath('/evaluation', this.activeDomainCode, this.permissionList),
          permission: ['admin', 'publisher', 'user']
        },
        {
          key: 'operation',
          title: '运维管理',
          description: '查看服务状态并处理容器化管理任务。',
          icon: 'control',
          path: getDomainModuleEntryPath('/operation', this.activeDomainCode, this.permissionList),
          permission: ['admin', 'publisher']
        }
      ]
      return actions.filter(action => this.hasPermission(action.permission))
    },
    availablePaths () {
      return this.availableActions
        .filter(action => !action.primary)
        .slice(0, 4)
        .map(action => ({
          key: action.key,
          title: action.title,
          icon: action.icon,
          path: action.path
        }))
    }
  },
  created () {
    this.loadRecentRoutes()
  },
  activated () {
    this.loadRecentRoutes()
  },
  methods: {
    hasPermission (permissions) {
      return permissions.some(permission => this.permissionList.includes(permission))
    },
    loadRecentRoutes () {
      this.recentRoutes = getRecentRoutes()
        .filter(item => item.path !== this.$route.path)
        .slice(0, 5)
    },
    routeTitle (title) {
      if (!title) return '未命名页面'
      const translated = this.$t(title)
      return translated === title && title.indexOf('menu.') === 0 ? '页面' : translated
    },
    formatTimeAgo (time) {
      const timestamp = Number(time)
      if (!timestamp) return '刚刚'
      const diff = Date.now() - timestamp
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour
      if (diff < minute) return '刚刚'
      if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
      if (diff < day) return `${Math.floor(diff / hour)} 小时前`
      return `${Math.floor(diff / day)} 天前`
    },
    go (path) {
      if (!path) return
      this.$router.push({ path }).catch(() => {})
    },
    openDocs () {
      window.open('https://fdueblab.cn/docs', '_blank')
    }
  }
}
</script>

<style lang="less" scoped>
.workbench-page {
  min-height: 100%;
  padding: 20px;
  background:
    linear-gradient(180deg, rgba(49, 92, 155, 0.08), rgba(255, 255, 255, 0) 260px),
    #f4f6f8;
  color: #1e2a36;
  letter-spacing: 0;
}

.workbench-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #d9e1ea;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(31, 61, 91, 0.08);
}

.workbench-hero__main {
  min-width: 0;

  h1 {
    margin: 8px 0;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.25;
    color: #17212b;
  }

  p {
    max-width: 720px;
    margin: 0;
    color: #607080;
    font-size: 14px;
    line-height: 1.7;
  }
}

.workbench-kicker {
  display: inline-flex;
  align-items: center;
  color: #315c9b;
  font-size: 13px;
  font-weight: 600;
}

.workbench-kicker__dot {
  width: 8px;
  height: 8px;
  margin-right: 8px;
  background: #1f8a70;
  border-radius: 50%;
}

.workbench-hero__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  margin-left: 20px;
}

.workbench-panel {
  margin-bottom: 16px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #d9e1ea;
  border-radius: 8px;
}

.workbench-panel--lead {
  border-top: 4px solid #315c9b;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    color: #17212b;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.35;
  }

  p {
    margin: 4px 0 0;
    color: #7a8794;
    font-size: 13px;
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.action-tile {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 112px;
  padding: 16px 40px 16px 16px;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #dfe6ee;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover,
  &:focus {
    border-color: #315c9b;
    box-shadow: 0 10px 24px rgba(49, 92, 155, 0.14);
    outline: none;
    transform: translateY(-1px);
  }
}

.action-tile--primary {
  background: #eef5f4;
  border-color: #9cc8bd;

  .action-tile__icon {
    color: #ffffff;
    background: #1f8a70;
  }
}

.action-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  margin-right: 12px;
  color: #315c9b;
  background: #e9eef6;
  border-radius: 8px;
  font-size: 18px;
}

.action-tile__body {
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong {
    margin-bottom: 6px;
    color: #17212b;
    font-size: 15px;
    line-height: 1.4;
  }

  span {
    color: #607080;
    font-size: 13px;
    line-height: 1.55;
  }
}

.action-tile__arrow {
  position: absolute;
  top: 18px;
  right: 16px;
  color: #8a98a8;
}

.recent-list__avatar {
  color: #315c9b;
  background: #e9eef6;
}

.empty-block {
  padding: 16px 0 8px;
}

.profile-meter {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 0 18px;
  border-bottom: 1px solid #edf1f5;

  strong {
    display: block;
    margin-bottom: 6px;
    color: #17212b;
    font-size: 16px;
  }

  span {
    display: block;
    color: #607080;
    font-size: 13px;
    line-height: 1.6;
  }
}

.context-list {
  margin: 16px 0 0;

  div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #edf1f5;
  }

  div:last-child {
    border-bottom: 0;
  }

  dt {
    color: #7a8794;
    font-size: 13px;
  }

  dd {
    max-width: 180px;
    margin: 0;
    color: #1e2a36;
    font-size: 13px;
    text-align: right;
    word-break: break-word;
  }
}

.path-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 18px;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  color: #1e2a36;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #dfe6ee;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover,
  &:focus {
    background: #eef5f4;
    border-color: #9cc8bd;
    outline: none;
  }

  span {
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 992px) {
  .workbench-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .workbench-hero__actions {
    flex-wrap: wrap;
    margin: 16px 0 0;
  }
}

@media (max-width: 768px) {
  .workbench-page {
    padding: 12px;
  }

  .workbench-hero {
    padding: 18px;
  }

  .workbench-hero__main h1 {
    font-size: 22px;
  }

  .workbench-hero__actions {
    width: 100%;

    .ant-btn {
      flex: 1 1 100%;
    }
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .profile-meter {
    align-items: flex-start;
  }
}
</style>
