<template>
  <div class="simulation-inline-root" :class="{ 'simulation-embedded': embedded }">
    <div class="simulation-container">
      <!-- 顶部：整体流程步骤条（workbench 嵌入时由 shell macrobar 承担） -->
      <div class="main-steps main-steps-five">
        <div
          v-for="(step, index) in mainSteps"
          :key="step.key"
          class="main-step"
          :class="{
            done: index < stepBarIndex,
            active: index === stepBarIndex,
            pending: index > stepBarIndex
          }"
        >
          <div class="step-dot">
            <a-icon v-if="index < stepBarIndex" type="check" />
            <a-icon
              v-else-if="index === stepBarIndex && isRunning && index > 0"
              type="loading"
            />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.title }}</span>
        </div>
      </div>

      <div class="simulation-scroll">
        <!-- 内容区域 -->
        <div class="content-area">
          <!-- 准备：说明 + 生产/研究 + 策略（模块化插拔，仅研究展示） -->
          <template v-if="showPreStart && !embedded">
            <div class="pre-start-panel">
              <div class="pre-start-title">准备就绪</div>
              <p class="pre-start-lead">
                系统将在安全仿真环境中，自动完成以下四步：
              </p>
              <ul class="pre-start-list">
                <li><strong>服务匹配</strong> — 确认各项服务可用</li>
                <li><strong>环境准备</strong> — 搭建安全的仿真环境</li>
                <li><strong>智能构建</strong> — 自动编排、验证并优化服务调度方案</li>
                <li><strong>方案生成</strong> — 输出可直接预览和发布的应用配置</li>
              </ul>

              <div class="pre-start-services" v-if="serviceStatuses.length">
                <span class="path-label">将参与检测的服务（{{ serviceStatuses.length }}）</span>
                <div class="pre-service-chips">
                  <a-tag v-for="s in serviceStatuses" :key="s.id">{{ s.name }}</a-tag>
                </div>
              </div>
              <div v-else class="pre-start-warn">
                <a-icon type="warning" /> 请先在画布上添加至少一个服务节点。
              </div>

              <div v-if="domainHint" class="pre-start-domain-hint">
                <a-icon type="bulb" /> {{ domainHint }}
              </div>

              <div v-if="hasScenarioParsedDraft" class="pre-start-parsed-intent">
                <div class="pre-start-parsed-title">
                  结构化想定
                  <span class="pre-start-parsed-hint">经追问收敛；可在此或左侧对话继续补充，开始构建后锁定</span>
                </div>
                <div class="parsed-intent-form">
                  <div class="parsed-intent-field">
                    <span class="parsed-intent-field-label">目标</span>
                    <a-input
                      v-model="scenarioParsedDraft.goal"
                      size="small"
                      placeholder="核心业务目标"
                      @change="emitScenarioParsedUpdate"
                    />
                  </div>
                  <div class="parsed-intent-field">
                    <span class="parsed-intent-field-label">场景描述</span>
                    <a-textarea
                      v-model="scenarioParsedDraft.description"
                      :auto-size="{ minRows: 2, maxRows: 4 }"
                      placeholder="完整场景描述"
                      @change="emitScenarioParsedUpdate"
                    />
                  </div>
                  <div class="parsed-intent-field">
                    <span class="parsed-intent-field-label">约束</span>
                    <a-textarea
                      v-model="scenarioParsedListDraft.constraints"
                      :auto-size="{ minRows: 2, maxRows: 5 }"
                      placeholder="每行一条"
                      @change="onScenarioParsedListChange('constraints')"
                    />
                  </div>
                  <div class="parsed-intent-field">
                    <span class="parsed-intent-field-label">验收标准</span>
                    <a-textarea
                      v-model="scenarioParsedListDraft.acceptanceCriteria"
                      :auto-size="{ minRows: 2, maxRows: 5 }"
                      placeholder="每行一条（可检查，非最终成败判定）"
                      @change="onScenarioParsedListChange('acceptanceCriteria')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 运行中：步骤1-服务匹配 -->
          <template v-else-if="hasStarted && currentMainStep === 0 && isRunning">
            <div class="step-content">
              <div class="step-title">服务匹配</div>
              <div class="step-desc">正在检查服务状态...</div>
              <div class="service-check-list">
                <div
                  v-for="service in serviceStatuses"
                  :key="service.id"
                  class="service-check-item"
                  :class="'status-' + service.status"
                >
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-status">
                    <a-icon v-if="service.status === 'checking'" type="loading" spin />
                    <a-icon v-else-if="service.status === 'online'" type="check-circle" theme="filled" />
                    <a-icon v-else-if="service.status === 'error'" type="close-circle" theme="filled" />
                    <a-icon v-else type="minus-circle" />
                    {{ service.statusText }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- 运行中：步骤2-环境准备 -->
          <template v-else-if="hasStarted && currentMainStep === 1 && isRunning">
            <div class="step-content">
              <div class="step-title">环境准备</div>
              <div class="step-desc">正在准备仿真环境...</div>
              <div class="env-setup-list">
                <div
                  v-for="(item, index) in envSetupItems"
                  :key="index"
                  class="env-setup-item"
                  :class="{ done: item.done, active: item.active }"
                >
                  <a-icon v-if="item.done" type="check-circle" theme="filled" />
                  <a-icon v-else-if="item.active" type="loading" spin />
                  <a-icon v-else type="minus-circle" />
                  <span>{{ item.text }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 运行中：步骤3-智能构建（核心循环） -->
          <template v-else-if="hasStarted && currentMainStep === 2 && isRunning">
            <div class="step-content simulation-phase">
              <div class="step-title">
                正在仿真构建 · 当前第 {{ currentIteration }} 轮迭代
                <span class="iteration-hint" v-if="currentIteration > 1">持续优化中</span>
              </div>

              <!-- 调度执行框 -->
              <div class="dispatch-box">
                <div class="dispatch-header">
                  <a-icon type="robot" />
                  <span>{{ dispatchStatus }}</span>
                </div>

                <!-- 执行 → 验收（数据/逻辑合并为调度执行） -->
                <div class="phase-progress phase-progress-dual">
                  <div
                    class="phase-item"
                    :class="{ done: phases.exec === 'done', active: phases.exec === 'running' }"
                  >
                    <div class="phase-icon">
                      <a-icon v-if="phases.exec === 'done'" type="check" />
                      <a-icon v-else-if="phases.exec === 'running'" type="loading" />
                      <span v-else>1</span>
                    </div>
                    <span class="phase-label">调度智能体</span>
                    <span class="phase-hint">编排服务流程</span>
                  </div>
                  <div class="phase-connector"></div>
                  <div
                    class="phase-item"
                    :class="{ done: phases.check === 'done', active: phases.check === 'running' }"
                  >
                    <div class="phase-icon">
                      <a-icon v-if="phases.check === 'done'" type="check" />
                      <a-icon v-else-if="phases.check === 'running'" type="loading" />
                      <span v-else>2</span>
                    </div>
                    <span class="phase-label">验证智能体</span>
                    <span class="phase-hint">检查结果质量</span>
                  </div>
                </div>

                <!-- 当前状态 -->
                <div class="current-action">
                  <a-icon v-if="isRunning" type="loading" />
                  <span>{{ currentActionText }}</span>
                </div>

                <div class="process-snapshot" v-if="!embedded && processSnapshotCards.length">
                  <div
                    v-for="card in processSnapshotCards"
                    :key="card.key"
                    class="process-snapshot-card"
                    :class="'process-snapshot-card--' + card.tone"
                  >
                    <span class="process-snapshot-label">{{ card.label }}</span>
                    <strong>{{ card.value }}</strong>
                    <span class="process-snapshot-hint">{{ card.hint }}</span>
                  </div>
                </div>
              </div>

              <!-- 提示 -->
              <div class="auto-fix-hint">
                <a-icon type="bulb" theme="filled" />
                发现偏差时系统会自动修复并重试
              </div>
            </div>
          </template>

          <!-- 运行中：步骤4-方案生成 -->
          <template v-else-if="hasStarted && currentMainStep === 3 && isRunning">
            <div class="step-content">
              <div class="step-title">方案生成</div>
              <div class="step-desc">正在整理可发布的元应用...</div>
              <div class="generation-list">
                <div
                  v-for="(item, index) in generationItems"
                  :key="index"
                  class="generation-item"
                  :class="{ done: item.done, active: item.active }"
                >
                  <a-icon v-if="item.done" type="check-circle" theme="filled" />
                  <a-icon v-else-if="item.active" type="loading" spin />
                  <a-icon v-else type="minus-circle" />
                  <span>{{ item.text }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 完成状态：成功 -->
          <template v-else-if="isCompleted && !hasFailed">
            <div class="result-content success">
              <div class="result-icon">
                <a-icon type="check-circle" theme="filled" />
              </div>
              <div class="result-title">仿真构建成功</div>
              <div class="result-subtitle">经过 {{ totalIterations }} 轮优化，已生成稳定的执行方案</div>

              <div class="stats-row">
                <div class="stat-item">
                  <div class="stat-value">{{ connectedServicesCount }}</div>
                  <div class="stat-label">服务已连接</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ totalIterations }}</div>
                  <div class="stat-label">优化轮次</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formattedElapsedTime }}</div>
                  <div class="stat-label">构建耗时</div>
                </div>
              </div>

              <div v-if="buildDimensionCards.length" class="dimension-cards">
                <div
                  v-for="card in buildDimensionCards"
                  :key="card.key"
                  class="dimension-card"
                  :class="'dimension-card--' + card.tone"
                >
                  <div class="dimension-card-label">{{ card.label }}</div>
                  <div class="dimension-card-value">{{ card.value }}</div>
                  <div class="dimension-card-hint">{{ card.hint }}</div>
                </div>
              </div>

              <div class="result-actions" v-if="!embedded && !showTechDetails">
                <a-button icon="profile" @click="openBuildDetails">查看完整构建详情</a-button>
              </div>

            </div>
          </template>

          <!-- 完成状态：失败 -->
          <template v-else-if="isCompleted && hasFailed">
            <div class="result-content failed">
              <div class="result-icon">
                <a-icon type="close-circle" theme="filled" />
              </div>
              <div class="result-title">构建失败</div>
              <div class="result-subtitle">经过 {{ totalIterations }} 轮尝试，仍存在以下问题</div>

              <div class="error-box">
                <div class="error-icon">
                  <a-icon type="warning" theme="filled" />
                </div>
                <div class="error-content">
                  <div class="error-message">{{ failureMessage }}</div>
                  <div class="error-suggestion" v-if="failureSuggestion">
                    {{ failureSuggestion }}
                  </div>
                </div>
              </div>

              <div class="result-actions" v-if="!embedded && !showTechDetails">
                <a-button icon="profile" @click="openBuildDetails">查看完整构建详情</a-button>
              </div>
            </div>
          </template>
        </div>

        <!-- 技术详情（构建开始后才显示） -->
        <div class="tech-toggle" v-if="hasStarted && !embedded">
          <a-button type="link" size="small" @click="showTechDetails = !showTechDetails">
            <a-icon :type="showTechDetails ? 'up' : 'down'" />
            {{ showTechDetails ? '收起完整详情' : '查看完整构建详情' }}
          </a-button>
        </div>

        <transition name="slide-fade">
          <div class="tech-details" v-if="hasStarted && showTechDetails && !embedded">
            <template v-if="isCompleted">
              <div class="detail-section detail-section-card">
                <div class="detail-title">轨迹</div>

                <div v-if="callChainSteps.length" class="detail-subsection">
                  <div class="detail-subtitle">{{ callChainTitle }}</div>
                  <div class="path-nodes path-nodes-block">
                    <span v-for="(node, index) in callChainSteps" :key="'path-' + index" class="path-node">
                      {{ node }}
                      <a-icon v-if="index < callChainSteps.length - 1" type="arrow-right" class="path-arrow" />
                    </span>
                  </div>
                </div>

                <div v-if="detailTrace.skipped" class="detail-muted detail-subsection">构建轨迹暂未生成</div>
                <div v-else-if="detailTrace.loading" class="detail-muted detail-subsection">
                  <a-icon type="loading" /> 轨迹加载中…
                </div>
                <div v-else-if="detailTrace.error" class="detail-error detail-subsection">{{ detailTrace.error }}</div>
                <template v-else-if="detailTrace.view">
                  <div class="detail-subsection">
                    <div class="detail-subtitle">轨迹概况</div>
                    <p class="detail-summary-line">
                      版本 {{ detailTrace.view.traceVersion || '—' }} ·
                      共 {{ detailTrace.view.toolCallCount }} 次工具调用
                      <template v-if="detailTrace.view.mcpCallCount != null">
                        （真实 MCP {{ detailTrace.view.mcpCallCount }} 次）
                      </template>
                    </p>
                  </div>

                  <div v-if="detailTrace.view.toolCalls.length" class="detail-subsection">
                    <div class="detail-subtitle">工具调用清单</div>
                    <div class="trace-mini-table">
                      <div
                        v-for="(row, idx) in detailTrace.view.toolCalls"
                        :key="idx"
                        class="trace-mini-row"
                      >
                        <span class="trace-col-tool">{{ row.toolName }}</span>
                        <span class="trace-col-svc">{{ row.serviceName || row.serviceId }}</span>
                        <a-tag size="small" :color="row.channel === 'real_mcp' ? 'green' : 'default'">
                          {{ row.channel }}
                        </a-tag>
                        <span class="trace-col-ms">{{ row.latencyMs }}ms</span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="detailTrace.view.plannerDecisions.length"
                    class="detail-subsection"
                  >
                    <div class="detail-subtitle">规划决策</div>
                    <div
                      v-for="(p, i) in detailTrace.view.plannerDecisions"
                      :key="'p' + i"
                      class="trace-text-block"
                    >
                      第{{ p.iteration }}轮 · 选中 {{ (p.selectedTools || []).join(', ') || '—' }}
                      <div v-if="p.executionPath && p.executionPath.length" class="trace-sub">
                        路径：{{ p.executionPath.join(' → ') }}
                      </div>
                      <div v-if="p.reason" class="trace-sub">{{ p.reason }}</div>
                    </div>
                  </div>

                  <div
                    v-if="detailTrace.view.verifierResults.length"
                    class="detail-subsection"
                  >
                    <div class="detail-subtitle">验证结果</div>
                    <div
                      v-for="(v, i) in detailTrace.view.verifierResults"
                      :key="'v' + i"
                      class="trace-text-block"
                    >
                      <a-tag size="small" :color="v.status === 'PASSED' ? 'green' : 'red'">
                        {{ v.status }}
                      </a-tag>
                      {{ v.summary || v.reason || '—' }}
                      <div
                        v-if="v.plannerDecision && v.plannerDecision.executionPath && v.plannerDecision.executionPath.length"
                        class="trace-sub"
                      >
                        基于规划：{{ v.plannerDecision.executionPath.join(' → ') }}
                      </div>
                    </div>
                  </div>

                  <div v-if="detailTrace.rawJson" class="detail-subsection">
                    <div class="detail-subtitle">原始轨迹数据</div>
                    <a-collapse :bordered="false" class="detail-collapse">
                      <a-collapse-panel key="raw" header="展开 JSON">
                        <pre class="trace-raw-json">{{ detailTrace.rawJson }}</pre>
                      </a-collapse-panel>
                    </a-collapse>
                  </div>
                </template>
              </div>

              <div class="detail-section detail-section-card">
                <div class="detail-title">证据</div>
                <div v-if="detailEvidence.skipped" class="detail-muted">证据分析暂未生成</div>
                <div v-else-if="detailEvidence.loading" class="detail-muted"><a-icon type="loading" /> 分析中…</div>
                <div v-else-if="detailEvidence.error" class="detail-error">{{ detailEvidence.error }}</div>
                <template v-else-if="detailEvidence.data">
                  <div class="detail-subsection">
                    <div class="detail-subtitle">总体结论</div>
                    <div class="evidence-head">
                      <a-tag :color="evidenceStatusColor(detailEvidence.data.overallStatus)">
                        {{ detailEvidence.data.overallStatus }}
                      </a-tag>
                      <span class="evidence-id">{{ detailEvidence.data.evidenceId }}</span>
                    </div>
                    <p v-if="evidenceSummaryText(detailEvidence.data)" class="detail-summary-line detail-summary-line--tight">
                      {{ evidenceSummaryText(detailEvidence.data) }}
                    </p>
                  </div>

                  <div
                    v-for="dim in evidenceDimensionPanels"
                    :key="dim.key"
                    class="detail-subsection evidence-dimension-panel"
                  >
                    <div class="evidence-dimension-head">
                      <div>
                        <div class="detail-subtitle">{{ dim.title }}</div>
                        <p class="detail-summary-line detail-summary-line--tight">{{ dim.subtitle }}</p>
                      </div>
                      <a-tag :color="evidenceStatusColor(dim.status)">{{ dim.status }}</a-tag>
                    </div>
                    <p class="detail-summary-line">{{ dim.summaryLine }}</p>
                    <div v-if="dim.issues.length" class="evidence-fails">
                      <div v-for="(c, i) in dim.issues" :key="dim.key + '-' + i" class="evidence-fail-row">
                        <a-tag size="small" :color="c.status === 'FAIL' ? 'red' : 'orange'">{{ c.status }}</a-tag>
                        {{ c.checkName }}：{{ c.detail }}
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="detailEvidence.data.missingEvidence && detailEvidence.data.missingEvidence.length"
                    class="detail-subsection"
                  >
                    <div class="detail-subtitle">证据缺口</div>
                    <p class="detail-summary-line">{{ detailEvidence.data.missingEvidence.join('、') }}</p>
                  </div>
                </template>
              </div>
            </template>

            <!-- MetaAppArtifact v1 临时 JSON 展示 -->
            <div class="detail-section detail-section-card" v-if="isCompleted && !detailArtifact.skipped">
              <div class="detail-title">元应用产物（最小运行包）</div>
              <div v-if="detailArtifact.loading" class="detail-muted detail-subsection">
                <a-icon type="loading" /> 产物编译中…
              </div>
              <div v-else-if="detailArtifact.error" class="detail-error detail-subsection">
                {{ detailArtifact.error }}
              </div>
              <template v-else-if="detailArtifact.data">
                <p class="detail-summary-line detail-summary-line--artifact">
                  artifact.json 仅保留运行必要的 app、taskContract、runtime 与 goldenPaths；构建轨迹、服务选择与验收记录留在 BuildBundle。
                </p>
                <meta-app-artifact-panel
                  variant="detail"
                  :artifact="detailArtifact.data"
                  show-json-collapse
                />
              </template>
            </div>

            <div class="detail-section detail-section-card" v-if="iterationDetails.length > 0">
              <div class="detail-title">轮次详情</div>
              <div class="iteration-details">
                <div v-for="iter in iterationDetailsForView" :key="iter.iteration" class="iter-detail-item">
                  <div class="iter-header">
                    <span class="iter-num">第{{ iter.iteration }}轮</span>
                    <a-tag v-if="iter.success" color="green">通过</a-tag>
                    <a-tag v-else-if="iter.completed" color="orange">需优化</a-tag>
                    <a-tag v-else color="blue">进行中</a-tag>
                  </div>
                  <div class="iter-phases iter-phases-dual">
                    <div
                      class="iter-phase"
                      :class="{ done: iter.execPhase === 'done', active: iter.execPhase === 'running' }"
                    >
                      <a-icon :type="iter.execPhase === 'done' ? 'check-circle' : (iter.execPhase === 'running' ? 'loading' : 'minus-circle')" />
                      调度执行
                    </div>
                    <div
                      class="iter-phase"
                      :class="{ done: iter.checkPhase === 'done', warning: iter.hasIssue, active: iter.checkPhase === 'running' }"
                    >
                      <a-icon :type="iter.checkPhase === 'done' ? (iter.hasIssue ? 'warning' : 'check-circle') : (iter.checkPhase === 'running' ? 'loading' : 'minus-circle')" />
                      结果验证
                    </div>
                  </div>
                  <div class="iter-plan" v-if="iter.plannerDecision">
                    <span class="plan-label">本轮规划：</span>
                    <span>{{ formatPlannerTools(iter.plannerDecision) }}</span>
                    <div
                      v-if="iter.plannerDecision.executionPath && iter.plannerDecision.executionPath.length"
                      class="iter-exec-path"
                    >
                      {{ iter.plannerDecision.executionPath.join(' → ') }}
                    </div>
                  </div>
                  <div class="iter-verifier" v-if="iter.hasVerification">
                    <div class="iter-verifier-main">
                      <span class="verifier-label">验证</span>
                      <a-tag
                        v-if="iter.verifierStatus"
                        size="small"
                        :color="iter.verifierStatus === 'PASSED' ? 'green' : 'red'"
                      >
                        {{ iter.verifierStatus }}
                      </a-tag>
                      <span v-if="iter.verifierSummary" class="iter-verifier-summary">{{ iter.verifierSummary }}</span>
                    </div>
                    <ul v-if="iter.verifierChecks && iter.verifierChecks.length" class="iter-check-list">
                      <li v-for="(chk, ci) in iter.verifierChecks" :key="'c-' + ci">
                        {{ chk.status || chk.check }}：{{ chk.issue || chk.check }}
                      </li>
                    </ul>
                    <ul v-if="iter.verifierIssues && iter.verifierIssues.length" class="iter-check-list">
                      <li v-for="(iss, ii) in iter.verifierIssues" :key="'iss-' + ii">
                        {{ iss.description }}
                      </li>
                    </ul>
                    <div v-if="iter.fix" class="iter-fix-inline">修复：{{ iter.fix }}</div>
                  </div>
                  <div class="iter-issue" v-if="iter.issue && !iter.hasVerification">
                    <span class="issue-label">问题：</span>{{ iter.issue }}
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section detail-section-card">
              <div class="detail-title">服务状态</div>
              <div class="service-detail-list">
                <div v-for="service in serviceStatuses" :key="service.id" class="service-detail-item">
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-status" :class="'status-' + service.status">
                    <a-icon v-if="service.status === 'online'" type="check-circle" theme="filled" />
                    <a-icon v-else-if="service.status === 'error'" type="close-circle" theme="filled" />
                    <a-icon v-else type="minus-circle" />
                    {{ service.statusText }}
                    <span v-if="service.latency" class="latency">({{ service.latency }}ms)</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section detail-section-card">
              <div class="detail-title">
                运行日志
                <a-button type="link" size="small" @click="clearLogs" class="clear-btn">清空</a-button>
              </div>
              <div class="logs-container" ref="logsContainer">
                <div
                  v-for="(log, index) in logs"
                  :key="index"
                  class="log-line"
                  :class="log.type"
                >
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-level">[{{ log.level }}]</span>
                  <span class="log-msg">{{ log.message }}</span>
                </div>
                <div v-if="logs.length === 0" class="logs-empty">暂无日志</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 底部按钮 -->
      <div class="footer-buttons" :class="{ 'footer-buttons--embedded': embedded }">
        <template v-if="showPreStart && !embedded">
          <a-button @click="handleClose">返回编辑</a-button>
          <a-button
            type="primary"
            icon="play-circle"
            :disabled="!serviceStatuses.length"
            @click="confirmStartBuild"
          >
            开始仿真构建
          </a-button>
        </template>

        <template v-else-if="isRunning">
          <button v-if="embedded" type="button" class="wb-danger-btn" @click="handleCancel">取消构建</button>
          <a-button v-else type="danger" @click="handleCancel">取消构建</a-button>
        </template>

        <template v-else-if="isCompleted && hasFailed">
          <a-button v-if="!embedded" @click="handleClose">返回编辑</a-button>
          <button v-if="embedded" type="button" class="wb-danger-btn" @click="confirmBackToEdit">返回重新编辑</button>
          <a-button type="primary" @click="retrySimulation">重新构建</a-button>
        </template>

        <template v-else-if="isCompleted && !hasFailed">
          <a-button v-if="!embedded" @click="handleClose">返回编辑</a-button>
          <button v-if="embedded" type="button" class="wb-danger-btn" @click="confirmBackToEdit">返回重新编辑</button>
          <button v-if="embedded" type="button" class="wb-primary-btn" :disabled="!canPrepublish" @click="handlePrePublish">元应用预览与发布</button>
          <a-button v-else type="primary" icon="rocket" :disabled="!canPrepublish" @click="handlePrePublish">
            元应用预览与发布
          </a-button>
        </template>
      </div>
    </div>

  </div>
</template>

<script>
import {
  startSimulation,
  cancelSimulation,
  subscribeSimulationStream,
  fetchSimulationTrace,
  fetchSimulationEvidence,
  fetchSimulationArtifact,
  fetchSimulationAcceptedTrajectory
} from '@/api/simulation_builder'
import {
  SIMULATION_BUILD_ENV_TASKS,
  SIMULATION_BUILD_GEN_TASKS
} from '@/mock/data/simulation_builder_data'
import { getKnowledge } from '@/domain'
import {
  useMemorySimulation
} from '@/mock/data/meta_apps_data'
import MetaAppArtifactPanel from './meta_app_build/MetaAppArtifactPanel.vue'

function mapSetupItems(tasks) {
  return tasks.map((text) => ({ text, done: false, active: false }))
}

export default {
  name: 'SimulationBuilder',
  components: { MetaAppArtifactPanel },
  props: {
    serviceNodes: {
      type: Array,
      default: () => []
    },
    /**
     * 元应用当前展示名称（画布 `data.preName`，含用户在元应用详情中的修改）。
     * 演示分流见 `meta_apps_data`（课题→inmemory，其余含 health 真实场景→9017）。
     */
    appName: {
      type: String,
      default: '元应用'
    },
    appId: {
      type: String,
      default: ''
    },
    domain: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'production'
    },
    scenarioDescription: {
      type: String,
      default: ''
    },
    scenarioParsed: {
      type: Object,
      default: () => ({})
    },
    /** workbench 左栏嵌入：隐藏步骤条与准备页，详情迁到右侧栏 */
    embedded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      isRunning: false,
      isCompleted: false,
      hasFailed: false,
      aborted: false,
      showTechDetails: false,
      /** false：准备页可切换生产/研究；true：已点「开始仿真构建」 */
      hasStarted: false,

      scenarioDraft: '',
      scenarioParsedDraft: {
        goal: '',
        description: '',
        constraints: [],
        acceptanceCriteria: [],
        domain: ''
      },
      scenarioParsedListDraft: {
        constraints: '',
        acceptanceCriteria: ''
      },
      sessionId: null,
      unsubscribeStream: null,
      /** 用户主动返回编辑 / 取消，或已确认离开页面 */
      intentionalClose: false,

      finalMetrics: {},
      finalResult: null,
      completedBuild: null,

      mainSteps: [
        { key: 'prep', title: '准备' },
        { key: 'match', title: '服务匹配' },
        { key: 'env', title: '环境准备' },
        { key: 'simulate', title: '智能构建' },
        { key: 'generate', title: '方案生成' }
      ],
      currentMainStep: 0,

      envSetupItems: mapSetupItems(SIMULATION_BUILD_ENV_TASKS),
      generationItems: mapSetupItems(SIMULATION_BUILD_GEN_TASKS),

      currentIteration: 1,
      maxIterations: 5,
      totalIterations: 0,
      phases: {
        exec: 'pending',
        check: 'pending'
      },
      dispatchStatus: '智能体协作中',
      currentActionText: '初始化中...',
      activeServiceCall: null,
      lastServiceCall: null,
      serviceCallStats: { total: 0, perService: {} },

      iterationHistory: [],
      iterationDetails: [],

      failureMessage: '',

      detailTrace: { loading: false, skipped: false, error: null, view: null, rawJson: '' },
      detailEvidence: { loading: false, skipped: false, error: null, data: null },
      detailArtifact: { loading: false, skipped: false, error: null, data: null },
      detailAcceptedTrajectory: { loading: false, skipped: false, error: null, data: null },
      failureSuggestion: '',
      serviceSelectionReport: null,

      serviceStatuses: [],

      logs: [],

      elapsedTime: 0,
      timerInterval: null
    }
  },
  computed: {
    canPrepublish() {
      const build = this.completedBuild || {}
      return Boolean(
        build.buildId &&
        build.artifactId &&
        build.artifactHash &&
        this.detailArtifact &&
        this.detailArtifact.data
      )
    },
    formattedElapsedTime() {
      const minutes = Math.floor(this.elapsedTime / 60)
      const seconds = this.elapsedTime % 60
      if (minutes > 0) {
        return `${minutes}分${seconds}秒`
      }
      return `${seconds}秒`
    },
    connectedServicesCount() {
      return this.serviceStatuses.filter((s) => s.status === 'online').length
    },
    hasModuleMetrics() {
      const m = this.finalMetrics
      return (
        m.sandboxFidelity != null ||
        m.planningAccuracy != null ||
        m.verificationAccuracy != null ||
        m.repairEffectiveness != null
      )
    },
    callChainSteps() {
      const accepted = this.buildCallChainFromAcceptedTrajectory(
        this.detailAcceptedTrajectory && this.detailAcceptedTrajectory.data
      )
      if (accepted.length) return accepted
      const fromTrace = this.detailTrace.view && this.detailTrace.view.callChain
      if (Array.isArray(fromTrace) && fromTrace.length) return fromTrace
      const path = this.finalResult && this.finalResult.executionPath
      if (Array.isArray(path) && path.length) return path
      return []
    },
    callChainSourceLabel() {
      const accepted = this.detailAcceptedTrajectory && this.detailAcceptedTrajectory.data
      if (accepted && accepted.status === 'accepted' && Array.isArray(accepted.actionSequence) && accepted.actionSequence.length) {
        return '轨迹数据'
      }
      if (this.detailTrace.view && Array.isArray(this.detailTrace.view.callChain) && this.detailTrace.view.callChain.length) {
        return '原始轨迹'
      }
      if (this.finalResult && Array.isArray(this.finalResult.executionPath) && this.finalResult.executionPath.length) {
        return '完成事件'
      }
      return ''
    },
    callChainTitle() {
      return this.callChainSourceLabel ? `调用链（${this.callChainSourceLabel}）` : '调用链'
    },
    hasScenarioParsedDraft() {
      const d = this.scenarioParsedDraft || {}
      return Boolean(
        (d.goal && String(d.goal).trim()) ||
        (d.description && String(d.description).trim()) ||
        (d.constraints && d.constraints.length) ||
        (d.acceptanceCriteria && d.acceptanceCriteria.length)
      )
    },
    evidenceDimensionPanels() {
      const data = this.detailEvidence && this.detailEvidence.data
      if (!data) return []
      const failed = Array.isArray(data.failedChecks) ? data.failedChecks : []
      const dims = data.dimensions || {}
      const defs = [
        {
          key: 'data',
          title: '数据保真',
          subtitle: '通道真实性、工具返回完整性、结果可信度'
        },
        {
          key: 'logic',
          title: '逻辑规划',
          subtitle: '服务覆盖、调用顺序、阶段完整性与目标达成'
        }
      ]
      return defs.map((def) => {
        const issues = failed.filter((c) => this.classifyEvidenceDimension(c) === def.key)
        const roll = dims[def.key] || {}
        const status = roll.status || this.dimensionStatusFromIssues(issues)
        let summaryLine = '未发现异常'
        if (roll.total != null) {
          summaryLine = `共 ${roll.total} 项 · 通过 ${roll.passed || 0}`
          if (roll.warnings) summaryLine += ` · 警告 ${roll.warnings}`
          if (roll.failed) summaryLine += ` · 失败 ${roll.failed}`
        } else if (issues.length) {
          summaryLine = `${issues.length} 项需关注`
        }
        return {
          ...def,
          status,
          issues,
          summaryLine
        }
      })
    },
    iterationDetailsForView() {
      return (this.iterationDetails || []).map((i) => ({
        ...i,
        ...this.formatIterationVerification(i)
      }))
    },
    buildDimensionCards() {
      if (!this.isCompleted) return []
      const cards = []
      const m = this.finalMetrics || {}
      const evidence = this.detailEvidence.data
      const dataPanel = this.evidenceDimensionPanels.find((p) => p.key === 'data')
      const logicPanel = this.evidenceDimensionPanels.find((p) => p.key === 'logic')

      if (m.sandboxFidelity != null) {
        cards.push({
          key: 'data',
          label: '数据保真',
          value: this.formatPct(m.sandboxFidelity),
          hint: '返回保真度',
          tone: m.sandboxFidelity >= 0.8 ? 'ok' : 'warn'
        })
      } else if (dataPanel) {
        cards.push({
          key: 'data',
          label: '数据保真',
          value: dataPanel.status,
          hint: dataPanel.issues.length ? `${dataPanel.issues.length} 项待关注` : '证据检查通过',
          tone: dataPanel.status === 'PASS' ? 'ok' : 'warn'
        })
      }

      const logicMetric = m.verificationAccuracy != null ? m.verificationAccuracy : m.planningAccuracy
      if (logicMetric != null) {
        cards.push({
          key: 'logic',
          label: '逻辑规划',
          value: this.formatPct(logicMetric),
          hint: m.verificationAccuracy != null ? '验证准确率' : '规划合理率',
          tone: logicMetric >= 0.8 ? 'ok' : 'warn'
        })
      } else if (logicPanel) {
        cards.push({
          key: 'logic',
          label: '逻辑规划',
          value: logicPanel.status,
          hint: logicPanel.issues.length ? `${logicPanel.issues.length} 项待关注` : '证据检查通过',
          tone: logicPanel.status === 'PASS' ? 'ok' : 'warn'
        })
      } else if (this.hasFailed === false && evidence) {
        cards.push({
          key: 'logic',
          label: '逻辑规划',
          value: evidence.overallStatus || '—',
          hint: '验收结论',
          tone: evidence.overallStatus === 'PASS' ? 'ok' : 'warn'
        })
      }

      return cards
    },
    selectedServiceNames() {
      const selected = this.serviceSelectionReport && Array.isArray(this.serviceSelectionReport.selectedServices)
        ? this.serviceSelectionReport.selectedServices
        : []
      return selected
        .map((s) => s.serviceName || s.serviceId)
        .filter(Boolean)
    },
    activeServiceCallLabel() {
      const call = this.activeServiceCall || this.lastServiceCall
      if (!call) return '等待工具调用'
      const service = call.serviceName || call.serviceId || '服务'
      const tool = call.toolName || ''
      return tool ? `${service} · ${tool}` : service
    },
    currentVerifierState() {
      const detail = this.currentDetail()
      if (!detail) return '待验证'
      const verification = this.formatIterationVerification(detail)
      if (verification.verifierStatus) return verification.verifierStatus
      if (detail.checkPhase === 'running') return '验证中'
      if (detail.execPhase === 'running') return '等待验证'
      return '待验证'
    },
    processSnapshotCards() {
      if (!this.isRunning || this.currentMainStep !== 2) return []
      const selectedCount = this.selectedServiceNames.length || this.serviceStatuses.length
      const selectedHint = this.selectedServiceNames.length
        ? this.selectedServiceNames.slice(0, 3).join('、')
        : '画布服务已进入候选集'
      return [
        {
          key: 'services',
          label: '服务组合',
          value: `${selectedCount} 个服务`,
          hint: selectedHint,
          tone: 'neutral'
        },
        {
          key: 'calls',
          label: '调用进度',
          value: this.activeServiceCall ? '执行中' : (this.lastServiceCall ? '已返回' : '待触发'),
          hint: this.activeServiceCallLabel,
          tone: this.activeServiceCall ? 'active' : 'neutral'
        },
        {
          key: 'verifier',
          label: '结果验证',
          value: this.currentVerifierState,
          hint: `第 ${this.currentIteration} 轮 · 工具调用 ${this.serviceCallStats.total} 次`,
          tone: this.currentVerifierState === 'FAILED' ? 'warn' : (this.currentVerifierState === 'PASSED' ? 'ok' : 'neutral')
        }
      ]
    },
    showPreStart() {
      return !this.embedded && !this.hasStarted && !this.isCompleted
    },
    domainHint() {
      const d = this.domain || 'generic'
      if (d === 'generic') return ''
      const dk = getKnowledge(d)
      return dk && dk.summary ? `已识别领域：${dk.summary}` : ''
    },
    /** 步骤条高亮：0=准备，1–4 对应后端 currentMainStep 0–3；完成时视为全部走完 */
    stepBarIndex() {
      if (this.isCompleted) return 5
      if (!this.hasStarted) return 0
      return 1 + this.currentMainStep
    }
  },
  watch: {
    scenarioParsed: {
      deep: true,
      handler() {
        if (!this.hasStarted) {
          this.initScenarioParsedDraftFromProp()
        }
      }
    }
  },
  methods: {
    formatPct(v) {
      if (v == null || Number.isNaN(Number(v))) return '—'
      return `${(Number(v) * 100).toFixed(1)}%`
    },

    init(nodes) {
      this.visible = true
      this.intentionalClose = false
      this.scenarioDraft = this.scenarioDescription || ''
      this.initScenarioParsedDraftFromProp()
      this.resetState()
      this.initServiceStatuses(nodes || this.serviceNodes)
    },

    linesToList(text) {
      return String(text || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    },

    listToLines(list) {
      return Array.isArray(list) ? list.filter(Boolean).join('\n') : ''
    },

    initScenarioParsedDraftFromProp() {
      const sp = this.scenarioParsed && typeof this.scenarioParsed === 'object' ? this.scenarioParsed : {}
      this.scenarioParsedDraft = {
        goal: sp.goal ? String(sp.goal) : '',
        description: sp.description ? String(sp.description) : '',
        constraints: Array.isArray(sp.constraints) ? [...sp.constraints] : [],
        acceptanceCriteria: Array.isArray(sp.acceptanceCriteria) ? [...sp.acceptanceCriteria] : [],
        domain: sp.domain ? String(sp.domain) : (this.domain || 'generic')
      }
      this.scenarioParsedListDraft = {
        constraints: this.listToLines(this.scenarioParsedDraft.constraints),
        acceptanceCriteria: this.listToLines(this.scenarioParsedDraft.acceptanceCriteria)
      }
    },

    onScenarioParsedListChange(field) {
      this.scenarioParsedDraft[field] = this.linesToList(this.scenarioParsedListDraft[field])
      this.emitScenarioParsedUpdate()
    },

    getScenarioParsedForStart() {
      const draft = {
        goal: String(this.scenarioParsedDraft.goal || '').trim(),
        description: String(this.scenarioParsedDraft.description || '').trim(),
        constraints: [...(this.scenarioParsedDraft.constraints || [])],
        acceptanceCriteria: [...(this.scenarioParsedDraft.acceptanceCriteria || [])],
        domain: String(this.scenarioParsedDraft.domain || this.domain || 'generic').trim() || 'generic'
      }
      const meta = this.scenarioParsed && typeof this.scenarioParsed === 'object' ? this.scenarioParsed : {}
      if (meta.source) draft.source = meta.source
      if (meta.scenarioKey) draft.scenarioKey = meta.scenarioKey
      if (meta.mockRouteHint) draft.mockRouteHint = meta.mockRouteHint
      return draft
    },

    emitScenarioParsedUpdate() {
      if (this.hasStarted) return
      this.$emit('scenario-parsed-update', this.getScenarioParsedForStart())
    },

    confirmStartBuild() {
      if (!this.serviceStatuses.length) {
        this.$message.warning('请先在画布上添加至少一个服务节点')
        return
      }
      this.hasStarted = true
      this.syncCanvasVisual({ type: 'build', active: true })
      this.startSimulation()
    },

    resetProgressLists() {
      this.envSetupItems = mapSetupItems(SIMULATION_BUILD_ENV_TASKS)
      this.generationItems = mapSetupItems(SIMULATION_BUILD_GEN_TASKS)
    },

    syncCanvasVisual(payload) {
      this.$emit('canvas-visual', payload)
    },

    resetState() {
      this.syncCanvasVisual({ type: 'clear' })
      this.teardownStream()
      this.sessionId = null
      this.finalMetrics = {}
      this.finalResult = null
      this.completedBuild = null

      this.hasStarted = false
      this.isRunning = false
      this.isCompleted = false
      this.hasFailed = false
      this.aborted = false
      this.showTechDetails = false
      this.currentMainStep = 0
      this.currentIteration = 1
      this.totalIterations = 0
      this.phases = { exec: 'pending', check: 'pending' }
      this.dispatchStatus = '智能体协作中'
      this.currentActionText = '初始化中...'
      this.activeServiceCall = null
      this.lastServiceCall = null
      this.serviceCallStats = { total: 0, perService: {} }
      this.iterationHistory = []
      this.iterationDetails = []
      this.failureMessage = ''
      this.detailTrace = { loading: false, skipped: false, error: null, view: null, rawJson: '' }
      this.detailEvidence = { loading: false, skipped: false, error: null, data: null }
      this.detailArtifact = { loading: false, skipped: false, error: null, data: null }
      this.detailAcceptedTrajectory = { loading: false, skipped: false, error: null, data: null }
      this.serviceSelectionReport = null
      this.failureSuggestion = ''
      this.logs = []
      this.elapsedTime = 0

      this.resetProgressLists()

      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    teardownStream() {
      if (typeof this.unsubscribeStream === 'function') {
        this.unsubscribeStream()
        this.unsubscribeStream = null
      }
    },

    initServiceStatuses(nodes) {
      this.serviceStatuses = nodes
        .filter((node) => node.name !== 'metaAppAgent')
        .map((node) => ({
          id: node.id,
          name: node.name,
          mcpUrl: node.url || node.mcpUrl || '',
          tools: node.tools || [],
          isFake: !!(node.isFake || node.is_fake),
          mcpMethod: node.mcpMethod || 'sse',
          status: 'pending',
          statusText: '等待中',
          latency: null
        }))
    },

    buildStartPayload() {
      const domain = this.domain || 'generic'
      return {
        appId: this.appId || 'meta-app-draft',
        appName: this.appName,
        domain,
        servicesMeta: this.serviceStatuses.map((s) => ({
          id: String(s.id),
          name: s.name,
          mcpUrl: s.mcpUrl || '',
          tools: s.tools || [],
          isFake: !!s.isFake,
          mcpMethod: s.mcpMethod || 'sse'
        })),
        maxIterations: this.maxIterations,
        scenarioDescription: this.scenarioDraft,
        scenarioParsed: this.hasScenarioParsedDraft ? this.getScenarioParsedForStart() : undefined
      }
    },

    formatPlannerTools(plannerDecision) {
      if (!plannerDecision) return '—'
      const tools = plannerDecision.selected_tools || plannerDecision.selectedTools || []
      return tools.length ? tools.join(' → ') : '—'
    },

    addLog(message, level = 'INFO', type = 'info') {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      this.logs.push({ time, level, message, type })

      this.$nextTick(() => {
        if (this.$refs.logsContainer) {
          this.$refs.logsContainer.scrollTop = this.$refs.logsContainer.scrollHeight
        }
      })
    },

    clearLogs() {
      this.logs = []
    },

    evidenceStatusColor(status) {
      if (status === 'PASS') return 'green'
      if (status === 'WARN') return 'orange'
      return 'red'
    },

    evidenceSummaryText(evidence) {
      const s = evidence && evidence.summary
      if (!s) return ''
      const parts = []
      if (s.total_checks != null) {
        parts.push(`共 ${s.total_checks} 项检查`)
        if (s.passed != null) parts.push(`通过 ${s.passed}`)
        if (s.failed) parts.push(`失败 ${s.failed}`)
        if (s.warnings) parts.push(`警告 ${s.warnings}`)
        return parts.join(' · ')
      }
      if (s.acceptedTrajectory) parts.push(`轨迹数据 ${s.acceptedTrajectory}`)
      if (s.selectedServices != null) parts.push(`选择服务 ${s.selectedServices}`)
      if (s.researchEligible != null) {
        parts.push(s.researchEligible ? '可计入科研' : '不计入科研')
      }
      return parts.join(' · ')
    },

    classifyEvidenceDimension(check) {
      if (!check) return 'logic'
      if (check.category === 'data' || check.category === 'logic') return check.category
      const name = String(check.checkName || '').toLowerCase()
      const dataKeys = [
        'channel',
        'tool_io',
        'confidence',
        'evidence_source',
        'tool_channels',
        'tool_call_details',
        'result_hash',
        'sandbox',
        'fidelity',
        'schema',
        'latency',
        'mcp'
      ]
      if (dataKeys.some((k) => name.includes(k))) return 'data'
      return 'logic'
    },

    dimensionStatusFromIssues(issues) {
      if (!issues || !issues.length) return 'PASS'
      if (issues.some((c) => c.status === 'FAIL')) return 'FAIL'
      return 'WARN'
    },

    buildTraceView(trace) {
      const events = Array.isArray(trace.events) ? trace.events : []
      const meta = trace.metadata || {}
      const toolCalls = []
      const plannerDecisions = []
      const verifierResults = []
      const serviceSelections = []
      let scenarioParsed = null
      let mcpCallCount = 0
      events.forEach((ev) => {
        if (!ev || !ev.data) return
        const t = ev.type
        const d = ev.data
        if (t === 'scenario_parsed') {
          scenarioParsed = d
        } else if (t === 'service_selection') {
          serviceSelections.push(d)
        } else if (t === 'tool_call_record') {
          if (d.channel === 'real_mcp') mcpCallCount += 1
          const resultPreview = d.result
            ? String(d.result).replace(/\s+/g, ' ').slice(0, 60)
            : ''
          toolCalls.push({
            callId: d.call_id || '',
            actionId: d.action_id || '',
            iteration: d.iteration,
            toolName: d.tool_name || '—',
            serviceId: d.service_id || '—',
            serviceName: d.service_name || '',
            channel: d.channel || 'unknown',
            source: d.source || d.channel || 'unknown',
            transport: d.transport || '',
            phase: d.phase || '',
            purpose: d.purpose || '',
            latencyMs: d.latency_ms != null ? d.latency_ms : '—',
            success: d.success !== false,
            arguments: d.arguments || {},
            resultHash: d.result_hash || '',
            resultPreview
          })
        } else if (t === 'planner_decision') {
          plannerDecisions.push({
            iteration: d.iteration,
            selectedTools: d.selected_tools || [],
            executionPath: d.executionPath || [],
            reason: d.reason || '',
            toolCallDetails: d.tool_call_details || d.toolCallDetails || []
          })
        } else if (t === 'verifier_result') {
          verifierResults.push({
            iteration: d.iteration,
            status: d.status || 'UNKNOWN',
            summary: d.summary || '',
            reason: d.reason || '',
            checks: d.checks || [],
            issues: d.issues || [],
            plannerDecision: d.plannerDecision || null
          })
        }
      })
      const ver =
        meta.trace_version ||
        (meta.runtime && meta.runtime.trace_version) ||
        ''
      return {
        traceVersion: ver,
        toolCallCount: meta.tool_call_count != null ? meta.tool_call_count : toolCalls.length,
        mcpCallCount,
        toolCalls,
        callChain: this.buildCallChainFromToolCalls(toolCalls),
        plannerDecisions,
        verifierResults,
        serviceSelection: serviceSelections.length ? serviceSelections[serviceSelections.length - 1] : null,
        scenarioParsed
      }
    },

    buildCallChainFromToolCalls(toolCalls) {
      if (!toolCalls || !toolCalls.length) return []
      const steps = ['用户输入']
      toolCalls.forEach((tc) => {
        const svc = tc.serviceName || tc.serviceId || '—'
        const label =
          tc.toolName && tc.toolName !== svc ? `${svc} · ${tc.toolName}` : svc
        steps.push(label)
      })
      steps.push('输出结果')
      return steps
    },

    buildCallChainFromAcceptedTrajectory(trajectory) {
      const actions = trajectory && Array.isArray(trajectory.actionSequence)
        ? trajectory.actionSequence
        : []
      if (!actions.length) return []
      const steps = ['用户输入']
      actions.forEach((action) => {
        const svc = action.serviceName || action.serviceId || '—'
        const tool = action.toolName || ''
        steps.push(tool && tool !== svc ? `${svc} · ${tool}` : svc)
      })
      steps.push('输出结果')
      return steps
    },

    resolveServiceNodeIdFromTool(toolName) {
      const t = String(toolName || '').toLowerCase()
      for (const s of this.serviceStatuses) {
        const sid = String(s.id)
        const prefix = sid.replace(/-/g, '_').toLowerCase()
        if (t.startsWith(prefix) || t.includes(sid.toLowerCase())) {
          return sid
        }
      }
      return null
    },

    resolveActiveServiceNodeFromLog(message) {
      let m = String(message || '').match(/\[Planner\] 调用工具:\s*(.+)/)
      if (m) return this.resolveServiceNodeIdFromTool(m[1].trim())
      m = String(message || '').match(/逻辑核验 \[([^\]]+)\]/)
      if (m) {
        const name = m[1].trim()
        const s = this.serviceStatuses.find((x) => x.name === name)
        if (s) return String(s.id)
      }
      return null
    },

    formatArtifactError(err, fallback = '加载失败') {
      if (!err) return fallback
      if (typeof err === 'string') return err
      const status = err.response && err.response.status
      if (status === 404) return '构建产物不存在'
      const detail = err.response && err.response.data
      if (typeof detail === 'string') return detail
      if (detail && detail.detail) return String(detail.detail)
      if (detail && detail.message) return String(detail.message)
      if (err.message) return err.message
      return fallback
    },

    async loadDetailArtifacts() {
      if (!this.sessionId) return
      if (useMemorySimulation(this.buildStartPayload())) {
        this.detailTrace = { loading: true, skipped: false, error: null, view: null, rawJson: '' }
        this.detailEvidence = { loading: true, skipped: false, error: null, data: null }
        this.detailArtifact = { loading: true, skipped: false, error: null, data: null }
        this.detailAcceptedTrajectory = { loading: true, skipped: false, error: null, data: null }
        try {
          const { buildTopicDemoArtifacts } = await import('@/mock/data/topic_simulation_artifacts')
          const packs = await buildTopicDemoArtifacts({
            sessionId: this.sessionId,
            appName: this.appName,
            appId: this.appId,
            scenarioParsed: this.hasScenarioParsedDraft ? this.getScenarioParsedForStart() : undefined,
            scenarioDescription: this.scenarioDraft,
            servicesMeta: this.serviceStatuses,
            finalResult: this.finalResult
          })
          const view = this.buildTraceView(packs.trace)
          let rawJson = ''
          try {
            rawJson = JSON.stringify(packs.trace, null, 2)
            if (rawJson.length > 12000) rawJson = `${rawJson.slice(0, 12000)}\n…`
          } catch (e) {
            rawJson = ''
          }
          this.detailTrace = { loading: false, skipped: false, error: null, view, rawJson }
          this.detailEvidence = { loading: false, skipped: false, error: null, data: packs.evidence }
          this.detailArtifact = { loading: false, skipped: false, error: null, data: packs.artifact }
          this.detailAcceptedTrajectory = { loading: false, skipped: false, error: null, data: packs.acceptedTrajectory }
          this.serviceSelectionReport = packs.serviceSelection
          this.completedBuild = {
            buildId: packs.manifest.buildId,
            artifactId: packs.manifest.artifactId,
            artifactHash: packs.manifest.hashes.artifact
          }
        } catch (e) {
          const msg = this.formatArtifactError(e, '课题产物加载失败')
          this.detailTrace = { loading: false, skipped: true, error: msg, view: null, rawJson: '' }
          this.detailEvidence = { loading: false, skipped: true, error: null, data: null }
          this.detailArtifact = { loading: false, skipped: true, error: null, data: null }
          this.detailAcceptedTrajectory = { loading: false, skipped: true, error: null, data: null }
        }
        return
      }
      this.detailTrace = { loading: true, skipped: false, error: null, view: null, rawJson: '' }
      this.detailEvidence = { loading: false, skipped: false, error: null, data: null }
      this.detailAcceptedTrajectory = { loading: false, skipped: false, error: null, data: null }
      try {
        const trace = await fetchSimulationTrace(this.sessionId)
        const view = this.buildTraceView(trace)
        let rawJson = ''
        try {
          rawJson = JSON.stringify(trace, null, 2)
          if (rawJson.length > 12000) {
            rawJson = `${rawJson.slice(0, 12000)}\n…`
          }
        } catch (e) {
          rawJson = ''
        }
        this.detailTrace = { loading: false, skipped: false, error: null, view, rawJson }
        this.detailEvidence = { loading: true, skipped: false, error: null, data: null }
        try {
          const data = await fetchSimulationEvidence(this.sessionId)
          this.detailEvidence = { loading: false, skipped: false, error: null, data }
        } catch (eEvidence) {
          this.detailEvidence = {
            loading: false,
            skipped: false,
            error: this.formatArtifactError(eEvidence, '证据分析加载失败'),
            data: null
          }
        }
        // 加载 MetaAppArtifact v1（真实链路与演示 mock 均按 BuildBundle/v1 结构消费）
        this.detailAcceptedTrajectory = { loading: true, skipped: false, error: null, data: null }
        try {
          const accepted = await fetchSimulationAcceptedTrajectory(this.sessionId)
          this.detailAcceptedTrajectory = { loading: false, skipped: false, error: null, data: accepted }
        } catch (eAccepted) {
          this.detailAcceptedTrajectory = {
            loading: false,
            skipped: false,
            error: this.formatArtifactError(eAccepted, '轨迹数据加载失败'),
            data: null
          }
        }
        this.detailArtifact = { loading: true, skipped: false, error: null, data: null }
        try {
          const artifact = await fetchSimulationArtifact(this.sessionId)
          this.detailArtifact = { loading: false, skipped: false, error: null, data: artifact }
        } catch (e2) {
          this.detailArtifact = {
            loading: false,
            skipped: false,
            error: this.formatArtifactError(e2, 'Artifact 加载失败'),
            data: null
          }
        }
      } catch (e) {
        const msg = this.formatArtifactError(e, '轨迹加载失败')
        this.detailTrace = { loading: false, skipped: false, error: msg, view: null, rawJson: '' }
        this.detailEvidence = { loading: false, skipped: false, error: null, data: null }
        this.detailArtifact = { loading: false, skipped: false, error: null, data: null }
        this.detailAcceptedTrajectory = { loading: false, skipped: false, error: null, data: null }
      }
    },

    startTimer() {
      this.elapsedTime = 0
      this.timerInterval = setInterval(() => {
        this.elapsedTime++
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    logLevelToType(level) {
      const m = { INFO: 'info', SUCCESS: 'success', WARN: 'warning', ERROR: 'error' }
      return m[level] || 'info'
    },

    ensureIterationRows(iteration) {
      if (!this.iterationHistory.find((h) => h.iteration === iteration)) {
        this.iterationHistory.push({
          iteration,
          summary: '验证中...',
          completed: false,
          success: false
        })
      }
      if (!this.iterationDetails.find((d) => d.iteration === iteration)) {
        this.iterationDetails.push({
          iteration,
          execPhase: 'pending',
          checkPhase: 'pending',
          hasIssue: false,
          issue: '',
          fix: '',
          plannerDecision: null,
          verifierResult: null,
          completed: false,
          success: false
        })
      }
    },

    currentDetail() {
      return this.iterationDetails.filter((d) => d.iteration === this.currentIteration).pop()
    },

    onStreamStep({ step }) {
      this.currentMainStep = step
      this.syncCanvasVisual({ type: 'step', step })
      if (step === 0) {
        this.serviceStatuses.forEach((s) => {
          if (s.status === 'pending') {
            s.status = 'checking'
            s.statusText = '检测中'
          }
        })
      }
    },

    onStreamService({ id, status, latency }) {
      this.syncCanvasVisual({ type: 'node', id: String(id), status })
      const s = this.serviceStatuses.find((x) => String(x.id) === String(id))
      if (!s) return
      if (status === 'online') {
        s.status = 'online'
        s.statusText = '正常'
        s.latency = latency != null ? latency : s.latency
      } else if (status === 'error') {
        s.status = 'error'
        s.statusText = '不可用'
      }
    },

    onStreamScenarioParsed(payload) {
      if (!payload || typeof payload !== 'object') return
      this.scenarioParsedDraft = {
        goal: payload.goal ? String(payload.goal) : '',
        description: payload.description ? String(payload.description) : '',
        constraints: Array.isArray(payload.constraints) ? [...payload.constraints] : [],
        acceptanceCriteria: Array.isArray(payload.acceptanceCriteria) ? [...payload.acceptanceCriteria] : [],
        domain: payload.domain ? String(payload.domain) : (this.domain || 'generic')
      }
      this.scenarioParsedListDraft = {
        constraints: this.listToLines(this.scenarioParsedDraft.constraints),
        acceptanceCriteria: this.listToLines(this.scenarioParsedDraft.acceptanceCriteria)
      }
      this.addLog(`场景解析完成: ${this.scenarioParsedDraft.goal || this.appName}`, 'INFO', 'info')
    },

    onStreamServiceSelection(payload) {
      if (!payload || typeof payload !== 'object') return
      this.serviceSelectionReport = payload
      const selected = Array.isArray(payload.selectedServices) ? payload.selectedServices : []
      const names = selected.map((s) => s.serviceName || s.serviceId).filter(Boolean)
      this.addLog(`服务选择完成: ${names.join('、') || '无'}`, 'INFO', 'info')
    },

    onStreamServiceCalling({ serviceId, serviceName, toolName, status }) {
      if (this.aborted || !this.isRunning) return
      const call = {
        serviceId: String(serviceId),
        serviceName,
        toolName
      }
      if (status === 'start') {
        this.activeServiceCall = call
        this.lastServiceCall = call
        this.serviceCallStats.total += 1
        const key = call.serviceId
        this.$set(
          this.serviceCallStats.perService,
          key,
          (this.serviceCallStats.perService[key] || 0) + 1
        )
        this.currentActionText = '正在仿真调度...'
      } else if (
        status === 'end' &&
        this.activeServiceCall &&
        this.activeServiceCall.serviceId === call.serviceId
      ) {
        this.lastServiceCall = { ...this.activeServiceCall }
        this.activeServiceCall = null
        this.currentActionText = '正在整理调度结果...'
      }
      // 驱动画布节点 calling/dimmed 动画
      this.syncCanvasVisual({
        type: 'serviceCall',
        serviceId: String(serviceId),
        serviceName,
        toolName,
        status // 'start' | 'end'
      })
    },

    onStreamProgress({ ctx, index, text, active, done }) {
      const list = ctx === 'env' ? this.envSetupItems : this.generationItems
      const item = list[index]
      if (!item) return
      const displayText = this.progressDisplayText(ctx, index, text)
      if (displayText) item.text = displayText
      if (active) item.active = true
      if (done) {
        item.active = false
        item.done = true
      }
    },

    progressDisplayText(ctx, index, text) {
      if (ctx !== 'env') {
        const friendly = ['汇总数据', '编译产物', '准备发布']
        return friendly[index] || text
      }
      return text
    },

    onStreamPhase({ phase, status }) {
      if (!['data', 'logic', 'check'].includes(phase)) return
      this.syncCanvasVisual({ type: 'simulatePhase', phase, status })

      const d = this.currentDetail()
      if (phase === 'data' || phase === 'logic') {
        if (status === 'running') {
          this.phases.exec = 'running'
          this.currentActionText = phase === 'data' ? '正在数据验证...' : '正在逻辑验证...'
          this.dispatchStatus = '智能体协作中'
          if (d) d.execPhase = 'running'
        } else if (status === 'done' && phase === 'logic') {
          this.phases.exec = 'done'
          this.activeServiceCall = null
          this.syncCanvasVisual({ type: 'activeCall', targetNodeId: null })
          if (d) d.execPhase = 'done'
        }
        return
      }

      if (phase === 'check') {
        if (status === 'running') {
          this.activeServiceCall = null
          this.phases.check = 'running'
          this.currentActionText = '正在逻辑验证...'
          this.dispatchStatus = '智能体协作中'
          if (d) d.checkPhase = 'running'
        } else if (status === 'done') {
          this.phases.check = 'done'
          if (d) d.checkPhase = 'done'
        }
      }
    },

    onStreamIssue(payload) {
      const {
        message,
        fix,
        plannerDecision,
        iteration,
        phase
      } = payload || {}
      if (iteration) {
        this.currentIteration = iteration
        this.ensureIterationRows(iteration)
      }
      const d = iteration
        ? this.iterationDetails.find((x) => x.iteration === iteration)
        : this.currentDetail()
      if (!d) return
      d.hasIssue = true
      d.issue = message
      d.fix = fix || ''
      if (phase) d.phase = phase
      if (plannerDecision) d.plannerDecision = plannerDecision
      this.dispatchStatus = '正在自动优化'
      this.currentActionText = '发现需要调整的地方，正在自动优化...'
    },

    onStreamPlannerDecision(payload) {
      const iteration = payload && payload.iteration
      if (!iteration) return
      this.ensureIterationRows(iteration)
      const d = this.iterationDetails.find((x) => x.iteration === iteration)
      if (d) d.plannerDecision = payload
    },

    onStreamVerifierResult(payload) {
      const iteration = payload && payload.iteration
      if (iteration) {
        this.ensureIterationRows(iteration)
        const d = this.iterationDetails.find((x) => x.iteration === iteration)
        if (d) {
          d.verifierResult = payload
          if (payload.plannerDecision) d.plannerDecision = payload.plannerDecision
          if (payload.status === 'FAILED') d.hasIssue = true
        }
      }
    },

    onStreamIteration({ iteration, status }) {
      this.currentIteration = iteration
      if (status === 'running') {
        this.activeServiceCall = null
        this.lastServiceCall = null
        this.phases = { exec: 'pending', check: 'pending' }
        this.dispatchStatus = '智能体协作中'
        this.currentActionText = `正在准备第 ${iteration} 轮迭代...`
        this.ensureIterationRows(iteration)
      }
      if (status === 'retry') {
        const h = this.iterationHistory.find((x) => x.iteration === iteration)
        if (h) {
          h.completed = true
          h.success = false
          h.summary = '已修复，进入下一轮'
        }
        const d = this.iterationDetails.find((x) => x.iteration === iteration)
        if (d) {
          d.completed = true
          d.success = false
        }
      }
      if (status === 'passed') {
        const h = this.iterationHistory.find((x) => x.iteration === iteration)
        if (h) {
          h.completed = true
          h.success = true
          h.summary = '验证通过'
        }
        const d = this.iterationDetails.find((x) => x.iteration === iteration)
        if (d) {
          d.completed = true
          d.success = true
        }
      }
      if (status === 'failed') {
        const h = this.iterationHistory.find((x) => x.iteration === iteration)
        if (h) {
          h.completed = true
          h.success = false
          h.summary = '智能终止'
        }
      }
    },

    onStreamLog({ level, message }) {
      this.addLog(message, level, this.logLevelToType(level))
      const targetId = this.resolveActiveServiceNodeFromLog(message)
      if (targetId) {
        this.syncCanvasVisual({ type: 'activeCall', targetNodeId: targetId })
      }
    },

    onStreamMetrics({ metric, value }) {
      this.$set(this.finalMetrics, metric, value)
    },

    onStreamComplete(payload) {
      this.stopTimer()
      this.isRunning = false
      this.teardownStream()

      if (this.aborted && !this.visible) {
        this.syncCanvasVisual({ type: 'build', active: false })
        this.syncCanvasVisual({ type: 'clear' })
        return
      }

      const { success, cancelled, publishable, metrics, result, publishError } = payload
      this.completedBuild = {
        buildId: payload.buildId || this.sessionId || '',
        artifactId: payload.artifactId || '',
        artifactHash: payload.artifactHash || ''
      }

      if (cancelled && this.aborted) {
        this.syncCanvasVisual({ type: 'build', active: false })
        this.syncCanvasVisual({ type: 'clear' })
        return
      }

      this.isCompleted = true

      if (cancelled) {
        this.hasFailed = false
        this.syncCanvasVisual({ type: 'build', active: false })
        this.syncCanvasVisual({ type: 'clear' })
        return
      }

      this.hasFailed = !success || publishable === false
      this.activeServiceCall = null
      this.lastServiceCall = null
      this.currentActionText = success && publishable !== false ? '仿真构建完成' : '仿真构建失败'
      this.dispatchStatus = success && publishable !== false ? '检查通过' : '检查未通过'

      if (metrics) {
        Object.keys(metrics).forEach((k) => {
          this.$set(this.finalMetrics, k, metrics[k])
        })
        this.totalIterations = metrics.iterations != null ? metrics.iterations : this.currentIteration
      } else {
        this.totalIterations = this.currentIteration
      }

      if (result) {
        this.finalResult = result
        if (result.error) this.failureMessage = result.error
        if (result.suggestion) this.failureSuggestion = result.suggestion
      }
      if (publishError) {
        this.failureMessage = publishError.error || this.failureMessage
        this.failureSuggestion = publishError.suggestion || this.failureSuggestion
      }
      this.showTechDetails = false
      this.syncCanvasVisual({ type: 'activeCall', targetNodeId: null })
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      this.loadDetailArtifacts()
    },

    openBuildDetails() {
      this.showTechDetails = true
      this.$nextTick(() => {
        const el = this.$el && this.$el.querySelector && this.$el.querySelector('.tech-details')
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
      })
    },

    onStreamError(err) {
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      this.stopTimer()
      this.isRunning = false
      this.teardownStream()
      this.isCompleted = true
      this.hasFailed = true
      this.activeServiceCall = null
      this.lastServiceCall = null
      this.currentActionText = '仿真构建失败'
      this.dispatchStatus = '连接异常'
      this.failureMessage = (err && err.message) || '流式连接异常'
      this.failureSuggestion = '请稍后重试或检查网络'
      this.addLog(this.failureMessage, 'ERROR', 'error')
    },

    subscribeToStream(sessionId, streamUrl) {
      this.sessionId = sessionId
      this.unsubscribeStream = subscribeSimulationStream(sessionId, streamUrl, {
        step: this.onStreamStep,
        scenario_parsed: this.onStreamScenarioParsed,
        service_selection: this.onStreamServiceSelection,
        iteration: this.onStreamIteration,
        phase: this.onStreamPhase,
        issue: this.onStreamIssue,
        planner_decision: this.onStreamPlannerDecision,
        verifier_result: this.onStreamVerifierResult,
        service: this.onStreamService,
        service_calling: this.onStreamServiceCalling,
        log: this.onStreamLog,
        metrics: this.onStreamMetrics,
        progress: this.onStreamProgress,
        complete: this.onStreamComplete,
        error: this.onStreamError
      })
    },

    async startSimulation() {
      if (!this.serviceStatuses.length) {
        this.$message.warning('请先添加至少一个服务节点')
        this.visible = false
        this.$emit('close')
        return
      }

      this.isRunning = true
      this.isCompleted = false
      this.hasFailed = false
      this.aborted = false
      this.startTimer()
      this.addLog(`开始构建元应用: ${this.appName}`, 'INFO', 'info')

      let res
      try {
        res = await startSimulation(this.buildStartPayload())
      } catch (e) {
        this.onStreamError(e)
        return
      }

      if (!res || !res.success || !res.sessionId) {
        this.onStreamError(new Error((res && res.error) || '启动仿真失败'))
        return
      }

      this.subscribeToStream(res.sessionId, res.streamUrl)
    },

    retrySimulation() {
      this.resetState()
      this.resetProgressLists()
      this.initServiceStatuses(this.serviceNodes)
      this.confirmStartBuild()
    },

    handlePrePublish() {
      if (!this.canPrepublish) return
      this.$emit('success', {
        appName: this.appName,
        appId: this.appId,
        servicesCount: this.connectedServicesCount,
        iterations: this.totalIterations,
        executionTime: this.elapsedTime,
        metrics: { ...this.finalMetrics },
        result: this.finalResult
      })
      this.$emit('prePublish')
      if (!this.embedded) {
        this.handleClose()
      }
    },

    iterationStatusLabel(iter) {
      if (!iter) return '—'
      if (!iter.completed && (iter.execPhase === 'running' || iter.checkPhase === 'running')) {
        return '进行中'
      }
      if (iter.success) return '已通过'
      if (iter.completed && !iter.success) return '需优化'
      if (iter.execPhase === 'done' && iter.checkPhase !== 'done') return '验证中'
      if (iter.execPhase === 'running') return '执行中'
      return '—'
    },

    iterationPhaseLabel(phase) {
      if (phase === 'done') return '已完成'
      if (phase === 'running') return '进行中'
      if (phase === 'pending') return '待开始'
      return '—'
    },

    iterationPlannerToolSteps(plannerDecision) {
      if (!plannerDecision) return []
      const tools = plannerDecision.selected_tools || plannerDecision.selectedTools || []
      return Array.isArray(tools) ? tools.filter(Boolean) : []
    },

    iterationExecutionPathSteps(plannerDecision) {
      if (!plannerDecision) return []
      const path = plannerDecision.executionPath || plannerDecision.execution_path
      return Array.isArray(path) && path.length ? path.filter(Boolean) : []
    },

    iterationExecutionPath(plannerDecision) {
      const steps = this.iterationExecutionPathSteps(plannerDecision)
      return steps.length ? steps.join(' → ') : ''
    },

    compactVerifierText(text) {
      return String(text || '').replace(/\s+/g, ' ').trim()
    },

    verifierStatusSame(a, b) {
      const x = String(a || '').toUpperCase()
      const y = String(b || '').toUpperCase()
      if (!x || !y) return false
      if (x === y) return true
      return (x === 'PASS' && y === 'PASSED') || (x === 'PASSED' && y === 'PASS')
    },

    normalizeVerifierIssues(rawIssues, hiddenTexts = []) {
      const hidden = hiddenTexts.map((x) => this.compactVerifierText(x)).filter(Boolean)
      const seen = new Set()
      return (Array.isArray(rawIssues) ? rawIssues : [])
        .map((item) => {
          const description = this.compactVerifierText(
            typeof item === 'string' ? item : (item.description || item.issue || item.detail)
          )
          if (!description || hidden.includes(description) || seen.has(description)) return null
          seen.add(description)
          return typeof item === 'string' ? { description } : { ...item, description }
        })
        .filter(Boolean)
    },

    normalizeVerifierChecks(rawChecks, overallStatus, issues = []) {
      const issueTexts = issues
        .map((x) => this.compactVerifierText(x && x.description))
        .filter(Boolean)
      return (Array.isArray(rawChecks) ? rawChecks : [])
        .map((check) => {
          const checkName = this.compactVerifierText(check.check || check.name || '')
          const issue = this.compactVerifierText(check.issue || check.detail || check.message || '')
          return { ...check, check: checkName || check.check, issue }
        })
        .filter((check) => {
          if (check.check === 'overall_verification') return false
          if (check.issue && issueTexts.includes(check.issue)) return false
          if (!check.issue && this.verifierStatusSame(check.status, overallStatus)) return false
          return Boolean(check.issue || check.check)
        })
    },

    formatIterationVerification(iterDetail) {
      const vr = iterDetail && iterDetail.verifierResult
      const status = vr && vr.status
      const summary = (vr && (vr.summary || vr.reason)) || ''
      const reason = (vr && vr.reason) || ''
      const streamIssue = (iterDetail && iterDetail.issue) || ''
      const rawIssues = (vr && vr.issues) || []
      const fix = (iterDetail && iterDetail.fix) || ''
      const hasVerifier = Boolean(vr && vr.status)
      const distinctIssue = streamIssue && streamIssue !== summary ? streamIssue : ''
      let issues = this.normalizeVerifierIssues(rawIssues, [summary])
      if (!issues.length && reason && this.compactVerifierText(reason) !== this.compactVerifierText(summary)) {
        issues = this.normalizeVerifierIssues([{ description: reason }], [summary])
      }
      if (!issues.length && distinctIssue) {
        issues = this.normalizeVerifierIssues([{ description: distinctIssue }], [summary])
      }
      const checks = this.normalizeVerifierChecks((vr && vr.checks) || [], status, issues)
      return {
        verifierStatus: hasVerifier ? vr.status : (distinctIssue ? 'FAILED' : ''),
        verifierSummary: summary || distinctIssue,
        verifierChecks: checks,
        verifierIssues: issues,
        fix,
        hasVerification: Boolean(hasVerifier || summary || distinctIssue || checks.length || issues.length || fix)
      }
    },

    getDetailViewModel() {
      const evidence = this.detailEvidence.data
      const accepted = this.detailAcceptedTrajectory && this.detailAcceptedTrajectory.data
      const acceptedActions = accepted && Array.isArray(accepted.actionSequence)
        ? accepted.actionSequence
        : []
      const scenario = this.scenarioParsedDraft || {}
      const scenarioInputs = scenario.inputs && typeof scenario.inputs === 'object'
        ? Object.keys(scenario.inputs)
        : []
      const criteria = []
      if (Array.isArray(scenario.acceptanceCriteria)) criteria.push(...scenario.acceptanceCriteria)
      if (Array.isArray(scenario.expectedOutputs)) criteria.push(...scenario.expectedOutputs)
      return {
        currentPhaseLabel: this.isRunning ? '智能构建中' : (this.isCompleted ? '构建完成' : '准备中'),
        currentIteration: this.currentIteration,
        isCompleted: this.isCompleted,
        hasFailed: this.hasFailed,
        currentActionText: this.currentActionText,
        dispatchStatus: this.dispatchStatus,
        iterations: (this.iterationDetails || []).map((i) => {
          const vr = i.verifierResult
          const verification = this.formatIterationVerification(i)
          const executionPathSteps = this.iterationExecutionPathSteps(i.plannerDecision)
          const plannerToolSteps = this.iterationPlannerToolSteps(i.plannerDecision)
          const plannerTools = plannerToolSteps.length ? plannerToolSteps.join(' → ') : ''
          const executionPath = executionPathSteps.length ? executionPathSteps.join(' → ') : ''
          return {
            iteration: i.iteration,
            statusLabel: this.iterationStatusLabel(i),
            execPhaseLabel: this.iterationPhaseLabel(i.execPhase),
            checkPhaseLabel: this.iterationPhaseLabel(i.checkPhase),
            plannerTools,
            plannerToolSteps,
            executionPath,
            executionPathSteps,
            verifierStatus: verification.verifierStatus,
            verifierSummary: verification.verifierSummary,
            verifierChecks: verification.verifierChecks,
            verifierIssues: verification.verifierIssues,
            fix: verification.fix,
            hasVerification: verification.hasVerification,
            issue: '',
            summary: (vr && (vr.reason || vr.summary)) || ''
          }
        }),
        services: this.serviceStatuses,
        stats: {
          serviceCount: this.serviceStatuses.length,
          completedCalls: this.serviceStatuses.filter((s) => s.status === 'online').length,
          pendingIssues: (this.iterationDetails || []).filter((i) => {
            const v = this.formatIterationVerification(i)
            return v.verifierStatus === 'FAILED' || Boolean(v.fix)
          }).length,
          toolCallCount: this.serviceCallStats.total
        },
        activeCallLabel: this.activeServiceCallLabel,
        showTechDetails: this.hasStarted,
        traceLoading: this.detailTrace.loading,
        traceSkipped: this.detailTrace.skipped,
        traceError: this.detailTrace.error,
        callChain: this.callChainSteps,
        evidenceStatus: evidence && evidence.overallStatus,
        evidenceSummary: this.evidenceSummaryText(evidence),
        artifactId: (this.detailArtifact.data && this.detailArtifact.data.artifactId) || '',
        selectedServices: this.selectedServiceNames,
        acceptedIteration: accepted && accepted.acceptedIteration,
        acceptedStatus: accepted && accepted.status,
        acceptedActionCount: acceptedActions.length,
        scenarioGoal: scenario.goal || scenario.task || this.appName,
        scenarioInputSummary: scenarioInputs.length
          ? scenarioInputs.slice(0, 6).join('、')
          : (scenario.description ? '由场景描述提供' : ''),
        scenarioCriteriaSummary: criteria.length
          ? criteria.slice(0, 3).join('；')
          : ''
      }
    },

    runtimeModeLabel(mode) {
      const map = {
        agent_with_optional_golden_path: '智能体执行 + 候选路径',
        agent_only: '智能体执行'
      }
      return map[mode] || mode || '智能体执行'
    },

    pushProductRow(rows, key, label, value, size = 'sm', extra = null) {
      if (value == null || value === '') return
      const row = { key, label, value: String(value), size }
      if (extra && typeof extra === 'object') {
        Object.assign(row, extra)
      }
      rows.push(row)
    },

    buildBuildSummaryRows() {
      const rows = []
      const art = this.detailArtifact.data
      const evidence = this.detailEvidence.data

      if (this.detailTrace.loading) {
        this.pushProductRow(rows, 'trace', '轨迹', '加载中…', 'xl')
      } else if (this.detailTrace.skipped) {
        this.pushProductRow(rows, 'trace', '轨迹', '构建轨迹暂未生成', 'lg')
      } else if (this.detailTrace.error) {
        this.pushProductRow(rows, 'trace', '轨迹', this.detailTrace.error, 'xl')
      } else if (this.callChainSteps.length) {
        this.pushProductRow(rows, 'trace', '轨迹', this.callChainSteps.join(' → '), 'xl')
      }

      if (evidence) {
        const statusText = evidence.overallStatus || '—'
        const summaryText = [statusText, this.evidenceSummaryText(evidence)].filter(Boolean).join(' · ')
        this.pushProductRow(rows, 'evidence-status', '证据结论', summaryText, 'lg')
      }

      if (art) {
        this.pushProductRow(rows, 'artifact-id', '产物 ID', art.artifactId, 'sm')
        this.pushProductRow(rows, 'runtime-mode', '运行方式', this.runtimeModeLabel(art.runtime && art.runtime.mode), 'xs')
      }

      this.pushProductRow(rows, 'elapsed', '构建耗时', this.formattedElapsedTime, 'xs')
      return rows
    },

    collectAcceptedInputSlots(accepted) {
      const actions = accepted && Array.isArray(accepted.actionSequence)
        ? accepted.actionSequence
        : []
      const seen = {}
      const slots = []
      actions.forEach((action) => {
        ;(action.inputSlots || []).forEach((slot) => {
          const name = slot && slot.name
          if (!name || seen[name]) return
          seen[name] = true
          slots.push({
            name,
            type: (slot && slot.type) || 'unknown',
            required: true,
            source: (slot && slot.source) || ''
          })
        })
      })
      return slots
    },

    formatMaterialSlots(slots) {
      return (Array.isArray(slots) ? slots : [])
        .map((slot) => {
          if (typeof slot === 'string') return { name: slot, type: '', detail: '' }
          const type = (slot && slot.type) || ''
          const source = (slot && slot.source) || ''
          return {
            name: (slot && slot.name) || '',
            type,
            detail: [type, source].filter(Boolean).join(' · ')
          }
        })
        .filter((slot) => slot.name)
    },

    buildRequirementMaterial(art, accepted) {
      const traceScenario = this.detailTrace.view && this.detailTrace.view.scenarioParsed
      const scenario = Object.assign(
        {},
        traceScenario || {},
        this.scenarioParsedDraft || {}
      )
      const task = (art && art.taskContract) || {}
      const app = (art && art.app) || {}
      const source = scenario.source || {}
      const inputSlots = Array.isArray(task.inputSlots) && task.inputSlots.length
        ? task.inputSlots
        : this.collectAcceptedInputSlots(accepted)
      const sourceRows = []
      if (source.parserModel) sourceRows.push({ label: '解析模型', value: source.parserModel })
      if (source.parsedAt) sourceRows.push({ label: '解析时间', value: source.parsedAt })
      if (scenario.scenarioKey) sourceRows.push({ label: '想定标识', value: scenario.scenarioKey })
      if (scenario.domain || task.domain || app.domain) {
        sourceRows.push({ label: '领域', value: scenario.domain || task.domain || app.domain })
      }
      return {
        goal: scenario.goal || task.goal || app.name || this.appName,
        description: scenario.description || app.description || this.scenarioDraft || '',
        constraints: Array.isArray(scenario.constraints) && scenario.constraints.length
          ? scenario.constraints
          : (Array.isArray(task.constraints) ? task.constraints : []),
        successCriteria: Array.isArray(scenario.acceptanceCriteria) && scenario.acceptanceCriteria.length
          ? scenario.acceptanceCriteria
          : (Array.isArray(task.successCriteria) ? task.successCriteria : []),
        inputSlots: this.formatMaterialSlots(inputSlots),
        outputSlots: this.formatMaterialSlots(task.outputSlots || []),
        sourceRows
      }
    },

    buildServiceSelectionMaterial(art) {
      const traceSelection = this.detailTrace.view && this.detailTrace.view.serviceSelection
      const report = this.serviceSelectionReport || traceSelection || {}
      const runtime = (art && art.runtime) || {}
      const bindings = Array.isArray(runtime.serviceBindings) ? runtime.serviceBindings : []
      let selected = Array.isArray(report.selectedServices) ? report.selectedServices : []
      if (!selected.length && bindings.length) {
        selected = bindings.map((binding) => ({
          serviceId: binding.serviceId,
          serviceName: binding.serviceName,
          reason: '已写入运行绑定，来自构建阶段服务选择结果。',
          matchedCapabilities: (binding.tools || [])
            .map((tool) => tool && (tool.toolName || tool.name))
            .filter(Boolean)
        }))
      }
      return {
        selectionId: report.selectionId || '',
        strategy: report.strategy || '',
        rationale: report.rationale || '',
        confidence: report.confidence != null ? `${Math.round(Number(report.confidence) * 100)}%` : '',
        model: report.model || '',
        createdAt: report.createdAt || '',
        selectedServices: selected.map((svc) => ({
          serviceId: svc.serviceId || '',
          serviceName: svc.serviceName || svc.serviceId || '未命名服务',
          reason: svc.reason || '',
          matchedCapabilities: Array.isArray(svc.matchedCapabilities)
            ? svc.matchedCapabilities.filter(Boolean)
            : []
        })),
        rejectedServices: Array.isArray(report.rejectedServices) ? report.rejectedServices : [],
        missingCapabilities: Array.isArray(report.missingCapabilities) ? report.missingCapabilities : [],
        bindingCount: bindings.length
      }
    },

    buildExecutionMaterial(art, accepted) {
      const traceView = (this.detailTrace && this.detailTrace.view) || {}
      const actions = accepted && Array.isArray(accepted.actionSequence)
        ? accepted.actionSequence
        : []
      const runtime = (art && art.runtime) || {}
      const toolCalls = Array.isArray(traceView.toolCalls) ? traceView.toolCalls : []
      const plannerDecisions = Array.isArray(traceView.plannerDecisions) ? traceView.plannerDecisions : []
      return {
        runtimeMode: this.runtimeModeLabel(runtime.mode),
        traceVersion: traceView.traceVersion || '',
        iterationCount: this.totalIterations || this.currentIteration,
        toolCallCount: traceView.toolCallCount != null ? traceView.toolCallCount : (this.serviceCallStats.total || toolCalls.length),
        mcpCallCount: traceView.mcpCallCount,
        elapsedText: this.formattedElapsedTime,
        callChain: this.callChainSteps,
        plannerDecisions,
        toolCalls,
        acceptedIteration: accepted && accepted.acceptedIteration,
        acceptedActionCount: actions.length
      }
    },

    buildVerificationMaterial(accepted) {
      const evidence = this.detailEvidence.data || {}
      const traceView = (this.detailTrace && this.detailTrace.view) || {}
      const actions = accepted && Array.isArray(accepted.actionSequence)
        ? accepted.actionSequence
        : []
      const verifierResults = Array.isArray(traceView.verifierResults)
        ? traceView.verifierResults
        : []
      return {
        overallStatus: evidence.overallStatus || (accepted && accepted.verifier && accepted.verifier.status) || '',
        summaryText: evidence.summary ? this.evidenceSummaryText(evidence) : ((accepted && accepted.verifier && accepted.verifier.summary) || ''),
        dimensions: this.evidenceDimensionPanels.map((panel) => ({
          key: panel.key,
          title: panel.title,
          status: panel.status,
          summaryLine: panel.summaryLine
        })),
        checks: Array.isArray(evidence.checks) ? evidence.checks : [],
        failedChecks: Array.isArray(evidence.failedChecks) ? evidence.failedChecks : [],
        missingEvidence: Array.isArray(evidence.missingEvidence) ? evidence.missingEvidence : [],
        verifierResults,
        acceptedTrajectory: {
          trajectoryId: (accepted && accepted.trajectoryId) || '',
          status: (accepted && accepted.status) || '',
          acceptedIteration: accepted && accepted.acceptedIteration,
          actionCount: actions.length,
          bindingGaps: (accepted && Array.isArray(accepted.bindingGaps)) ? accepted.bindingGaps : []
        }
      }
    },

    getProductViewModel() {
      const art = this.detailArtifact.data
      const accepted = this.detailAcceptedTrajectory && this.detailAcceptedTrajectory.data
      const tags = []
      if (art) {
        tags.push({ label: '任务说明', tone: 'green' })
        if (art.runtime && Array.isArray(art.runtime.serviceBindings) && art.runtime.serviceBindings.length) {
          tags.push({ label: '服务绑定', tone: 'green' })
        }
        const hasPath = Array.isArray(art.goldenPaths) && art.goldenPaths.some(
          (p) => p && Array.isArray(p.steps) && p.steps.length
        )
        if (hasPath) {
          tags.push({ label: '可复用路径', tone: 'green' })
        }
        tags.push({ label: this.runtimeModeLabel(art.runtime && art.runtime.mode), tone: 'blue' })
      }
      return {
        build: this.completedBuild || null,
        artifact: art || null,
        summaryRows: this.buildBuildSummaryRows(),
        intent: (this.scenarioParsedDraft && this.scenarioParsedDraft.goal) || this.appName,
        services: this.serviceStatuses.map((s) => s.name).join('、'),
        tags,
        requirement: this.buildRequirementMaterial(art, accepted),
        serviceSelection: this.buildServiceSelectionMaterial(art),
        execution: this.buildExecutionMaterial(art, accepted),
        verification: this.buildVerificationMaterial(accepted)
      }
    },

    isActiveBuild() {
      return this.isRunning && !!this.sessionId && !this.intentionalClose
    },

    /** 用户确认离开调度页后调用 */
    cancelBuildForLeave() {
      this.intentionalClose = true
      this.aborted = true
      if (this.sessionId) {
        cancelSimulation(this.sessionId)
      }
      this.teardownStream()
      this.stopTimer()
      this.isRunning = false
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      this.finishClose()
    },

    confirmBackToEdit() {
      this.$confirm(
        '将回到想定解析完成后的编辑界面。本次仿真构建进度与产物摘要将不再保留，需要重新完成仿真构建后才能再次预发布。确定继续吗？',
        '返回重新编辑？',
        {
          confirmButtonText: '返回重新编辑',
          cancelButtonText: '留在此页',
          confirmButtonClass: 'el-button--danger',
          type: 'warning',
          closeOnClickModal: false
        }
      )
        .then(() => {
          this.intentionalClose = true
          this.aborted = true
          this.teardownStream()
          this.stopTimer()
          this.isRunning = false
          this.syncCanvasVisual({ type: 'build', active: false })
          this.syncCanvasVisual({ type: 'clear' })
          this.resetState()
          this.$emit('back-to-edit')
        })
        .catch(() => {})
    },

    handleCancel() {
      this.$confirm('取消后当前进度将丢失', '确定要取消构建吗？', {
        confirmButtonText: '取消构建',
        cancelButtonText: '继续构建',
        confirmButtonClass: 'el-button--danger',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.intentionalClose = true
        this.aborted = true
        if (this.sessionId) {
          cancelSimulation(this.sessionId)
        }
        this.teardownStream()
        this.stopTimer()
        this.isRunning = false
        this.syncCanvasVisual({ type: 'build', active: false })
        this.syncCanvasVisual({ type: 'clear' })
        this.finishClose()
      }).catch(() => {})
    },

    handleClose() {
      this.intentionalClose = true
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      if (this.isRunning && this.sessionId) {
        cancelSimulation(this.sessionId)
      }
      this.teardownStream()
      this.stopTimer()
      this.isRunning = false
      this.finishClose()
    },

    finishClose() {
      this.visible = false
      if (this.embedded) {
        this.$emit('cancel-build')
      } else {
        this.$emit('close')
      }
    }
  },

  beforeDestroy() {
    this.syncCanvasVisual({ type: 'clear' })
    this.stopTimer()
    this.teardownStream()
  }
}
</script>

<style lang="less" scoped>
/* 与画布并排嵌入父级左栏，无遮罩 */
.simulation-inline-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
}

.simulation-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.simulation-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

// 主步骤条
.main-steps {
  display: flex;
  justify-content: space-between;
  padding: 20px 32px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f5ff 100%);
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.main-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 14px;
    left: 60%;
    right: -40%;
    height: 2px;
    background: #e8e8e8;
  }

  &.done:not(:last-child)::after {
    background: #52c41a;
  }

  &.active:not(:last-child)::after {
    background: linear-gradient(to right, #1890ff 50%, #e8e8e8 50%);
  }
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
  transition: all 0.3s;

  .pending & {
    background: #f5f5f5;
    color: #bfbfbf;
    border: 2px solid #e8e8e8;
  }

  .active & {
    background: #1890ff;
    color: #fff;
    border: 2px solid #1890ff;
  }

  .done & {
    background: #52c41a;
    color: #fff;
    border: 2px solid #52c41a;
  }
}

.step-label {
  font-size: 13px;
  color: #8c8c8c;

  .active & {
    color: #1890ff;
    font-weight: 500;
  }

  .done & {
    color: #52c41a;
  }
}

// 五步条：略缩小标签以免换行错乱
.main-steps-five {
  .step-label {
    font-size: 11px;
    text-align: center;
    line-height: 1.3;
    max-width: 72px;
  }
}

// 准备页
.pre-start-panel {
  text-align: left;
}

.pre-start-title {
  font-size: 17px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.pre-start-lead,
.pre-start-hint {
  font-size: 14px;
  color: #595959;
  line-height: 1.65;
  margin-bottom: 12px;
}

.pre-start-list {
  margin: 0 0 14px 1.1em;
  padding: 0;
  font-size: 13px;
  color: #595959;
  line-height: 1.7;

  li {
    margin-bottom: 6px;
  }
}

.pre-start-domain-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.6;

  .anticon {
    margin-right: 4px;
    color: #faad14;
  }
}

.pre-start-parsed-intent {
  margin-top: 14px;
  padding: 12px 14px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.pre-start-parsed-title {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 10px;
}

.pre-start-parsed-hint {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #8c8c8c;
}

.parsed-intent-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.parsed-intent-field-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.parsed-intent-field--io {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.parsed-intent-situation {
  color: #595959;
  margin-bottom: 8px;
}

.pre-start-services {
  margin-top: 16px;
}

.pre-service-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.pre-start-warn {
  margin-top: 14px;
  padding: 10px 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  font-size: 13px;
  color: #ad6800;

  .anticon {
    margin-right: 6px;
  }
}

// 内容区域
.content-area {
  padding: 24px;
  min-height: 280px;
}

.step-content {
  .step-title {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 8px;

    .iteration-hint {
      font-size: 13px;
      font-weight: 400;
      color: #1890ff;
      margin-left: 8px;
    }
  }

  .step-desc {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 16px;
  }
}

// 服务检查列表
.service-check-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-check-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;

  &.status-online {
    background: #f6ffed;
    .service-status { color: #52c41a; }
  }

  &.status-error {
    background: #fff2f0;
    .service-status { color: #ff4d4f; }
  }

  &.status-checking {
    background: #e6f7ff;
    .service-status { color: #1890ff; }
  }
}

.service-name {
  font-size: 14px;
  color: #262626;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8c8c8c;
}

// 环境准备/方案生成列表
.env-setup-list, .generation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.env-setup-item, .generation-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 14px;
  color: #8c8c8c;

  &.done {
    color: #52c41a;
  }

  &.active {
    background: #e6f7ff;
    color: #1890ff;
  }
}

.simulation-phase {
  .dispatch-box {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .dispatch-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 20px;

    .anticon {
      font-size: 18px;
      color: #1890ff;
    }
  }
}

// 执行 → 验收 两阶段进度
.phase-progress {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;

  &.phase-progress-dual .phase-connector {
    width: 56px;
    margin-top: 16px;
    margin-bottom: 0;
  }
}

.phase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .phase-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #bfbfbf;
    font-size: 12px;
    transition: all 0.3s;
  }

  .phase-label {
    font-size: 12px;
    color: #8c8c8c;
  }

  .phase-hint {
    font-size: 10px;
    color: #bfbfbf;
    max-width: 88px;
    text-align: center;
    line-height: 1.3;
  }

  &.active {
    .phase-hint {
      color: #91d5ff;
    }
    .phase-icon {
      background: #1890ff;
      color: #fff;
    }
    .phase-label {
      color: #1890ff;
      font-weight: 500;
    }
  }

  &.done {
    .phase-icon {
      background: #52c41a;
      color: #fff;
    }
    .phase-label {
      color: #52c41a;
    }
  }
}

.phase-connector {
  width: 40px;
  height: 2px;
  background: #e8e8e8;
  margin-bottom: 20px;
}

.current-action {
  text-align: center;
  font-size: 13px;
  color: #595959;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  word-break: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.process-snapshot {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.process-snapshot-card {
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
  text-align: left;

  &--active {
    border-color: #91d5ff;
    background: #f0f7ff;
  }

  &--ok {
    border-color: #b7eb8f;
    background: #f6ffed;
  }

  &--warn {
    border-color: #ffe58f;
    background: #fffbe6;
  }
}

.process-snapshot-label {
  display: block;
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.process-snapshot-card strong {
  display: block;
  font-size: 14px;
  color: #262626;
  line-height: 1.25;
}

.process-snapshot-hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #8c8c8c;
  line-height: 1.35;
  word-break: break-word;
}

// 迭代历史
.iteration-history {
  margin-bottom: 12px;

  .history-title {
    font-size: 13px;
    font-weight: 500;
    color: #8c8c8c;
    margin-bottom: 8px;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fafafa;
    border-radius: 6px;
    font-size: 13px;

    &.current {
      background: #e6f7ff;
    }

    .icon-success { color: #52c41a; }
    .icon-warning { color: #faad14; }
    .icon-loading { color: #1890ff; }

    .history-label {
      color: #262626;
      font-weight: 500;
      min-width: 50px;
    }

    .history-summary {
      color: #595959;
    }
  }
}

.auto-fix-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
  padding: 8px;

  .anticon {
    color: #faad14;
  }
}

// 结果内容
.result-content {
  text-align: center;

  .result-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }

  .result-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .result-subtitle {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 24px;
  }

  &.success {
    .result-icon { color: #52c41a; }
    .result-title { color: #262626; }
  }

  &.failed {
    .result-icon { color: #ff4d4f; }
    .result-title { color: #262626; }
  }
}

.dimension-cards {
  display: flex;
  gap: 10px;
  margin: 16px 0 4px;
  width: 100%;
}

.dimension-card {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  background: #fafafa;
  text-align: left;

  &--ok {
    border-color: #b7eb8f;
    background: #f6ffed;
  }

  &--warn {
    border-color: #ffe58f;
    background: #fffbe6;
  }
}

.dimension-card-label {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.dimension-card-value {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
}

.dimension-card-hint {
  font-size: 10px;
  color: #bfbfbf;
  margin-top: 4px;
}

.result-actions {
  margin-top: 16px;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #52c41a;
  }

  .stat-label {
    font-size: 12px;
    color: #8c8c8c;
  }
}

.execution-path {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  text-align: left;

  .path-label {
    font-size: 13px;
    font-weight: 500;
    color: #595959;
    margin-bottom: 10px;
  }

  .path-nodes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .path-node {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #262626;
    padding: 4px 10px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #e8e8e8;
  }

  .path-arrow {
    color: #bfbfbf;
  }
}

.error-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  text-align: left;

  .error-icon {
    font-size: 20px;
    color: #ff4d4f;
  }

  .error-message {
    font-size: 14px;
    color: #262626;
    margin-bottom: 6px;
  }

  .error-suggestion {
    font-size: 13px;
    color: #595959;
  }
}

// 技术详情开关
.tech-toggle {
  text-align: center;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
}

// 技术详情面板
.tech-details {
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  padding: 16px;
  max-height: 480px;
  overflow-y: auto;
}

.detail-muted {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-error {
  font-size: 12px;
  color: #cf1322;
}

.detail-kv {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 12px;
  color: #595959;
  margin-bottom: 8px;
}

.trace-mini-table {
  background: #fff;
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 8px;
}

.trace-mini-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.trace-col-tool {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #262626;
}

.trace-col-svc {
  max-width: 88px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8c8c8c;
}

.trace-col-ms {
  flex-shrink: 0;
  color: #8c8c8c;
  font-size: 11px;
}

.detail-collapse {
  background: transparent;
  margin-bottom: 4px;

  /deep/ .ant-collapse-header {
    padding: 4px 0 !important;
    font-size: 12px;
    color: #595959;
  }

  /deep/ .ant-collapse-content-box {
    padding: 4px 0 8px !important;
  }
}

.trace-text-block {
  font-size: 12px;
  color: #262626;
  margin-bottom: 6px;

  .trace-sub {
    color: #8c8c8c;
    margin-top: 2px;
  }
}

.trace-raw-json {
  font-size: 11px;
  max-height: 140px;
  overflow: auto;
  margin: 0;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.evidence-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.evidence-id {
  font-size: 11px;
  color: #8c8c8c;
  font-family: monospace;
}

.evidence-fails {
  margin-top: 6px;
}

.evidence-fail-row {
  font-size: 12px;
  color: #595959;
  margin-bottom: 4px;
  line-height: 1.4;
}

.path-nodes-block {
  padding: 8px 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.detail-summary-line {
  font-size: 12px;
  color: #595959;
  line-height: 1.5;
  margin: 0;

  &--tight {
    margin-top: 6px;
  }

  &--artifact {
    padding: 8px 10px;
    background: #fcfcfc;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
  }
}

.evidence-dimension-panel {
  background: #fcfcfc;
  border-radius: 6px;
  padding: 10px 12px;
  border: 1px solid #f0f0f0;
}

.evidence-dimension-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.detail-section-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-subsection--first {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.detail-subsection-flush {
  margin: 6px 0 0;
}

.parsed-intent-goal {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
  line-height: 1.5;
  margin: 6px 0 0;
}

.parsed-intent-block {
  margin-top: 10px;
}

.parsed-intent-label {
  display: block;
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.parsed-intent-tag {
  margin-bottom: 4px;
}

.parsed-intent-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #595959;
  line-height: 1.5;
}

.parsed-intent-io {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.parsed-intent-io-col {
  flex: 1;
  min-width: 120px;
}

.parsed-intent-meta {
  color: #8c8c8c;
  font-size: 11px;
}

.contract-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.contract-card {
  padding: 10px 12px;
  background: #fcfcfc;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.contract-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.contract-name {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
}

.contract-field-label {
  color: #8c8c8c;
  margin-right: 4px;
}

.detail-subsection {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  &:first-of-type {
    margin-top: 8px;
    padding-top: 0;
    border-top: none;
  }
}

.detail-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #8c8c8c;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.detail-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .detail-title {
    font-size: 13px;
    font-weight: 500;
    color: #595959;
    margin-bottom: 8px;
    display: flex;
    align-items: center;

    .clear-btn {
      margin-left: auto;
      padding: 0;
      height: auto;
    }
  }
}

.iteration-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iter-detail-item {
  background: #fff;
  border-radius: 6px;
  padding: 10px 12px;

  .iter-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .iter-num {
      font-weight: 500;
      color: #262626;
    }
  }

  .iter-phases {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 6px;

    &.iter-phases-dual {
      gap: 24px;
    }

    .iter-phase {
      display: flex;
      align-items: center;
      gap: 4px;

      &.done { color: #52c41a; }
      &.warning { color: #faad14; }
      &.active { color: #1890ff; }
    }
  }

  .iter-plan, .iter-verifier, .iter-issue, .iter-fix {
    font-size: 12px;
    color: #595959;
    margin-top: 4px;

    .plan-label { color: #1890ff; }
    .verifier-label { color: #722ed1; }
    .issue-label { color: #faad14; }
    .fix-label { color: #52c41a; }
  }

  .iter-verifier {
    padding: 8px 10px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
  }

  .iter-verifier-main {
    display: grid;
    grid-template-columns: max-content max-content minmax(0, 1fr);
    align-items: flex-start;
    gap: 8px;
  }

  .iter-verifier-summary {
    min-width: 0;
    line-height: 1.55;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .iter-check-list {
    margin: 8px 0 0 64px;
    padding-left: 16px;
    line-height: 1.55;
    color: #666;
    word-break: break-word;

    li + li {
      margin-top: 4px;
    }
  }

  .iter-fix-inline {
    margin: 8px 0 0 64px;
    color: #ad6800;
    line-height: 1.5;
    word-break: break-word;
  }

  .iter-exec-path {
    margin-top: 2px;
    color: #8c8c8c;
    font-size: 11px;
    word-break: break-all;
  }
}

.service-detail-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;

  .service-name {
    color: #262626;
  }

  .service-status {
    display: flex;
    align-items: center;
    gap: 4px;

    &.status-online { color: #52c41a; }
    &.status-error { color: #ff4d4f; }

    .latency {
      color: #8c8c8c;
    }
  }
}

.logs-container {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 8px 10px;
  max-height: 120px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.6;
}

.log-line {
  display: flex;
  gap: 6px;

  &.info { color: #d4d4d4; }
  &.success { color: #4ec9b0; }
  &.warning { color: #dcdcaa; }
  &.error { color: #f48771; }
}

.log-time { color: #6a9955; flex-shrink: 0; }
.log-level { color: #9cdcfe; flex-shrink: 0; min-width: 45px; }
.log-msg { flex: 1; word-break: break-all; }

.logs-empty {
  text-align: center;
  color: #6a6a6a;
  padding: 16px 0;
}

// 过渡动画
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter, .slide-fade-leave-to { max-height: 0; opacity: 0; padding: 0; }

// 底部按钮
.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.builder-toolbar {
  padding: 12px 24px 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;

  .toolbar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .toolbar-label {
    font-size: 13px;
    color: #595959;
    flex-shrink: 0;
  }

  .scenario-row .ant-input {
    flex: 1;
    max-width: 420px;
  }

  .strategy-collapse {
    margin-bottom: 8px;
    background: transparent;

    /deep/ .ant-collapse-item {
      border: none;
    }

    /deep/ .ant-collapse-header {
      padding: 8px 0 !important;
      font-size: 13px;
    }

    /deep/ .ant-collapse-content-box {
      padding: 0 0 12px !important;
    }
  }

  .strategy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px 16px;
  }

  .strategy-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #8c8c8c;
  }
}

// 旧演示 artifact 的门禁列表；真实 MetaAppArtifact v1 不依赖 gate
.gate-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gate-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.gate-name {
  color: #262626;
  font-weight: 500;
  min-width: 140px;
  word-break: break-all;
}

.gate-detail {
  color: #8c8c8c;
  flex: 1;
}

@import './meta_app_build/simulation-workbench.less';

.simulation-embedded {
  flex: 1 1 0;
  height: 100%;
  min-height: 0;

  .simulation-container {
    flex: 1 1 0;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 0;
    box-shadow: none;
  }

  .main-steps {
    flex-shrink: 0;
    padding: 10px 10px;
  }

  .main-steps-five .step-label {
    font-size: 10px;
    max-width: 64px;
  }

  .simulation-scroll {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .content-area {
    padding: 16px;
    min-height: 0;
  }

  .step-content .step-title {
    font-size: 16px;
    line-height: 1.35;
  }

  .simulation-phase .dispatch-box {
    padding: 16px;
    margin-bottom: 10px;
  }

  .simulation-phase .dispatch-header {
    margin-bottom: 14px;
  }

  .phase-progress {
    margin-bottom: 12px;
  }

  .footer-buttons--embedded {
    flex: 0 0 auto;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 12px 16px;
    border-top: 1px solid #e8edf4;
    margin-top: 0;
    background: #fff;
    z-index: 2;
  }
}
</style>
