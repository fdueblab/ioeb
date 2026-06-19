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

              <!-- 研究模式 UI 已移除；mode/strategy 字段仍随 start payload 发送，供 Micro-Agent orchestrator 使用（见 build-design4llm.md §4） -->
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
                智能构建 · 第 {{ currentIteration }} 轮
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
                    <span class="phase-label">调度执行</span>
                    <span class="phase-hint">规划 Agent · 工具调用</span>
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
                    <span class="phase-label">目标验收</span>
                    <span class="phase-hint">验证 Agent · 场景目标</span>
                  </div>
                </div>

                <!-- 当前状态 -->
                <div class="current-action">{{ currentActionText }}</div>
              </div>

              <!-- 简洁历史 -->
              <div class="iteration-history" v-if="iterationHistory.length > 0">
                <div class="history-title">历史</div>
                <div class="history-list">
                  <div
                    v-for="item in iterationHistory"
                    :key="item.iteration"
                    class="history-item"
                    :class="{ current: !item.completed }"
                  >
                    <a-icon
                      v-if="item.completed && item.success"
                      type="check-circle"
                      theme="filled"
                      class="icon-success"
                    />
                    <a-icon
                      v-else-if="item.completed && !item.success"
                      type="info-circle"
                      theme="filled"
                      class="icon-warning"
                    />
                    <a-icon v-else type="loading" class="icon-loading" />
                    <span class="history-label">第{{ item.iteration }}轮</span>
                    <span class="history-summary">{{ item.summary }}</span>
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
              <div class="step-desc">正在生成元应用方案...</div>
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
            </div>
          </template>
        </div>

        <!-- 技术详情（构建开始后才显示） -->
        <div class="tech-toggle" v-if="hasStarted && !embedded">
          <a-button type="link" size="small" @click="showTechDetails = !showTechDetails">
            <a-icon :type="showTechDetails ? 'up' : 'down'" />
            {{ showTechDetails ? '收起详情' : '查看详情' }}
          </a-button>
        </div>

        <transition name="slide-fade">
          <div class="tech-details" v-if="hasStarted && showTechDetails && !embedded">
            <template v-if="isCompleted">
              <div class="detail-section detail-section-card">
                <div class="detail-title">轨迹</div>

                <div v-if="callChainSteps.length" class="detail-subsection">
                  <div class="detail-subtitle">调用链</div>
                  <div class="path-nodes path-nodes-block">
                    <span v-for="(node, index) in callChainSteps" :key="'path-' + index" class="path-node">
                      {{ node }}
                      <a-icon v-if="index < callChainSteps.length - 1" type="arrow-right" class="path-arrow" />
                    </span>
                  </div>
                </div>

                <div v-if="detailTrace.skipped" class="detail-muted detail-subsection">进程内演示无落盘轨迹</div>
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
                <div v-if="detailEvidence.skipped" class="detail-muted">进程内演示无证据分析</div>
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
                    <p v-if="detailEvidence.data.summary" class="detail-summary-line detail-summary-line--tight">
                      共 {{ detailEvidence.data.summary.total_checks }} 项检查 ·
                      通过 {{ detailEvidence.data.summary.passed }}
                      <template v-if="detailEvidence.data.summary.failed">
                        · 失败 {{ detailEvidence.data.summary.failed }}
                      </template>
                      <template v-if="detailEvidence.data.summary.warnings">
                        · 警告 {{ detailEvidence.data.summary.warnings }}
                      </template>
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

            <!-- ArtifactSpec v0 产物 -->
            <div class="detail-section detail-section-card" v-if="isCompleted && !detailArtifact.skipped">
              <div class="detail-title">固化产物 (ArtifactSpec v0)</div>
              <div v-if="detailArtifact.loading" class="detail-muted detail-subsection">
                <a-icon type="loading" /> 产物编译中…
              </div>
              <div v-else-if="detailArtifact.error" class="detail-error detail-subsection">
                {{ detailArtifact.error }}
              </div>
              <template v-else-if="detailArtifact.data">
                <!-- 场景解析 -->
                <div class="detail-subsection detail-subsection--first">
                  <div class="detail-subtitle">场景解析</div>
                  <template v-if="scenarioParsedView.hasContent">
                    <p v-if="scenarioParsedView.goal" class="parsed-intent-goal">{{ scenarioParsedView.goal }}</p>
                    <p v-if="scenarioParsedView.description" class="detail-summary-line parsed-intent-situation">
                      {{ scenarioParsedView.description }}
                    </p>
                    <div v-if="scenarioParsedView.constraints.length" class="parsed-intent-block">
                      <span class="parsed-intent-label">约束</span>
                      <a-tag
                        v-for="(item, idx) in scenarioParsedView.constraints"
                        :key="'c-' + idx"
                        class="parsed-intent-tag"
                      >{{ item }}</a-tag>
                    </div>
                    <div v-if="scenarioParsedView.acceptanceCriteria.length" class="parsed-intent-block">
                      <span class="parsed-intent-label">验收标准</span>
                      <ul class="parsed-intent-list">
                        <li v-for="(item, idx) in scenarioParsedView.acceptanceCriteria" :key="'a-' + idx">{{ item }}</li>
                      </ul>
                    </div>
                    <p
                      v-if="scenarioParsedView.parserModel || scenarioParsedView.parsedAt"
                      class="detail-summary-line detail-summary-line--tight parsed-intent-meta"
                    >
                      <template v-if="scenarioParsedView.parserModel">解析模型 {{ scenarioParsedView.parserModel }}</template>
                      <template v-if="scenarioParsedView.parsedAt"> · {{ scenarioParsedView.parsedAt }}</template>
                    </p>
                  </template>
                  <p v-else class="detail-muted detail-subsection-flush">未生成结构化场景（可能无场景描述，或 LLM 解析未执行）</p>
                </div>

                <!-- 服务契约 -->
                <div class="detail-subsection">
                  <div class="detail-subtitle">服务契约</div>
                  <div v-if="serviceContractRows.length" class="contract-list">
                    <div
                      v-for="row in serviceContractRows"
                      :key="row.serviceId || row.serviceName"
                      class="contract-card"
                    >
                      <div class="contract-head">
                        <span class="contract-name">{{ row.serviceName }}</span>
                        <a-tag size="small">{{ row.channelLabel }}</a-tag>
                      </div>
                      <p class="detail-summary-line detail-summary-line--tight">
                        <template v-if="row.uncalled">本次未调用</template>
                        <template v-else>调用 {{ row.totalCalls }} 次 · 成功率 {{ row.successRate }}</template>
                      </p>
                      <p v-if="row.declaredToolNames.length" class="detail-summary-line">
                        <span class="contract-field-label">声明工具</span>
                        {{ row.declaredToolNames.join('、') }}
                      </p>
                      <p v-if="row.observedSummaries.length" class="detail-summary-line">
                        <span class="contract-field-label">实测调用</span>
                        {{ row.observedSummaries.join('；') }}
                      </p>
                    </div>
                  </div>
                  <p v-else class="detail-muted detail-subsection-flush">无服务契约数据</p>
                </div>

                <!-- 固化结论 -->
                <div class="detail-subsection">
                  <div class="detail-subtitle">固化门禁</div>
                  <div class="evidence-head">
                    <a-tag :color="artifactView.solidifiable ? 'green' : 'red'">
                      {{ artifactView.solidifiable ? '可固化' : '不可固化' }}
                    </a-tag>
                    <a-tag
                      v-if="artifactView.goldenPathExtractable != null"
                      :color="artifactView.goldenPathExtractable ? 'blue' : 'default'"
                      style="margin-left: 8px"
                    >
                      {{ artifactView.goldenPathExtractable ? '黄金路径' : '无黄金路径' }}
                    </a-tag>
                    <span class="evidence-id">{{ artifactView.artifactId }}</span>
                  </div>
                </div>
                <!-- 六道 gate -->
                <div class="detail-subsection" v-if="detailArtifact.data.solidificationReport && detailArtifact.data.solidificationReport.gates">
                  <div class="detail-subtitle">质量检查</div>
                  <div class="gate-list">
                    <div
                      v-for="gate in detailArtifact.data.solidificationReport.gates"
                      :key="gate.gate"
                      class="gate-row"
                    >
                      <a-tag :color="gate.passed ? 'green' : 'red'" size="small">
                        {{ gate.passed ? '通过' : '未通过' }}
                      </a-tag>
                      <span class="gate-name">{{ gate.gate }}</span>
                      <span class="gate-detail">{{ gate.detail }}</span>
                    </div>
                  </div>
                </div>
                <!-- 黄金路径 / 构建摘要 -->
                <div class="detail-subsection" v-if="artifactView.buildSummary || goldenPathSteps.length">
                  <div class="detail-subtitle">可复用路径</div>
                  <p v-if="artifactView.buildSummary" class="detail-summary-line">
                    共 {{ artifactView.buildSummary.totalIterations }} 轮迭代 ·
                    状态 {{ artifactView.buildSummary.finalStatus }}
                    <template v-if="artifactView.buildSummary.elapsedMs">
                      · {{ (artifactView.buildSummary.elapsedMs / 1000).toFixed(1) }}s
                    </template>
                  </p>
                  <p v-if="artifactView.goldenPathReason" class="detail-summary-line detail-summary-line--tight">
                    {{ artifactView.goldenPathReason }}
                  </p>
                  <ul v-if="goldenPathSteps.length" class="parsed-intent-list">
                    <li v-for="step in goldenPathSteps" :key="step.stepId">
                      {{ step.stepId }} · {{ step.toolName }}
                    </li>
                  </ul>
                  <ul v-else-if="artifactView.remediation.length" class="parsed-intent-list">
                    <li v-for="(item, idx) in artifactView.remediation" :key="'rem-' + idx">{{ item }}</li>
                  </ul>
                </div>
                <!-- 溯源 -->
                <div class="detail-subsection" v-if="artifactView.sourceSessionId || artifactView.artifactHash">
                  <div class="detail-subtitle">溯源信息</div>
                  <p class="detail-summary-line">
                    会话 {{ artifactView.sourceSessionId || '—' }} ·
                    Hash {{ artifactView.artifactHash ? artifactView.artifactHash.slice(0, 16) : '—' }}
                  </p>
                </div>
                <!-- 展开完整 JSON -->
                <div class="detail-subsection">
                  <a-collapse :bordered="false">
                    <a-collapse-panel key="artifact-json" header="完整 ArtifactSpec JSON">
                      <pre class="trace-raw-json">{{ artifactJsonPreview }}</pre>
                    </a-collapse-panel>
                  </a-collapse>
                </div>
              </template>
            </div>

            <div class="detail-section detail-section-card" v-if="iterationDetails.length > 0">
              <div class="detail-title">轮次详情</div>
              <div class="iteration-details">
                <div v-for="iter in iterationDetails" :key="iter.iteration" class="iter-detail-item">
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
                      目标验收
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
                  <div class="iter-verifier" v-if="iter.verifierResult && iter.verifierResult.status">
                    <span class="verifier-label">验证：</span>
                    <a-tag size="small" :color="iter.verifierResult.status === 'PASSED' ? 'green' : 'red'">
                      {{ iter.verifierResult.status }}
                    </a-tag>
                    {{ iter.verifierResult.reason || iter.verifierResult.summary || '' }}
                  </div>
                  <div class="iter-issue" v-if="iter.issue">
                    <span class="issue-label">问题：</span>{{ iter.issue }}
                  </div>
                  <div class="iter-fix" v-if="iter.fix">
                    <span class="fix-label">修复：</span>{{ iter.fix }}
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
          <button v-if="embedded" type="button" class="wb-primary-btn" @click="handlePrePublish">元应用预览与发布</button>
          <a-button v-else type="primary" icon="rocket" @click="handlePrePublish">
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
  fetchSimulationArtifact
} from '@/api/simulation_builder'
import {
  SIMULATION_BUILD_ENV_TASKS,
  SIMULATION_BUILD_GEN_TASKS,
  SIMULATION_BUILD_DEFAULT_STRATEGY
} from '@/mock/data/simulation_builder_data'
import { getKnowledge } from '@/domain'
import {
  resolveScheduleDemoKind,
  SCHEDULE_DEMO_KIND,
  useMemorySimulation
} from '@/mock/data/meta_apps_data'

function mapSetupItems(tasks) {
  return tasks.map((text) => ({ text, done: false, active: false }))
}

/** 开发：fdueblab mcp-proxy → 本机同端口（需 .env 中 VUE_APP_LOCAL_MCP_REWRITE=true） */
function rewriteMcpUrlForLocalDev(url) {
  if (process.env.VUE_APP_LOCAL_MCP_REWRITE !== 'true' || !url) return url
  const m = String(url).match(/^https?:\/\/fdueblab\.cn\/mcp-proxy\/(\d+)(\/.*)?$/i)
  if (!m) return url
  return `http://127.0.0.1:${m[1]}${m[2] || '/sse'}`
}

export default {
  name: 'SimulationBuilder',
  props: {
    serviceNodes: {
      type: Array,
      default: () => []
    },
    /**
     * 元应用当前展示名称（画布 `data.preName`，含用户在元应用详情中的修改）。
     * 演示分流见 `meta_apps_data`（课题→inmemory，【本地MCP】(n)→9017）。
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

      internalMode: 'production',
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
      strategy: { ...SIMULATION_BUILD_DEFAULT_STRATEGY },

      sessionId: null,
      unsubscribeStream: null,
      /** 用户主动返回编辑 / 取消，或已确认离开页面 */
      intentionalClose: false,

      finalMetrics: {},
      finalResult: null,

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
      dispatchStatus: '智能体调度执行中',
      currentActionText: '初始化中...',

      iterationHistory: [],
      iterationDetails: [],

      failureMessage: '',

      detailTrace: { loading: false, skipped: false, error: null, view: null, rawJson: '' },
      detailEvidence: { loading: false, skipped: false, error: null, data: null },
      detailArtifact: { loading: false, skipped: false, error: null, data: null },
      failureSuggestion: '',

      serviceStatuses: [],

      logs: [],

      elapsedTime: 0,
      timerInterval: null
    }
  },
  computed: {
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
      const path = this.finalResult && this.finalResult.executionPath
      if (Array.isArray(path) && path.length) return path
      const fromTrace = this.detailTrace.view && this.detailTrace.view.callChain
      if (Array.isArray(fromTrace) && fromTrace.length) return fromTrace
      return []
    },
    artifactJsonPreview() {
      const data = this.detailArtifact && this.detailArtifact.data
      if (!data) return ''
      try {
        const raw = JSON.stringify(data, null, 2)
        return raw.length > 8000 ? raw.slice(0, 8000) + '\n…' : raw
      } catch (e) {
        return ''
      }
    },
    scenarioParsedView() {
      const data = this.detailArtifact && this.detailArtifact.data
      const sc = data && (data.parsedIntent || data.scenario)
      if (!sc || typeof sc !== 'object') {
        return { hasContent: false }
      }
      const goal = sc.goal ? String(sc.goal).trim() : ''
      const description = sc.description ? String(sc.description).trim() : ''
      const constraints = Array.isArray(sc.constraints) ? sc.constraints.filter(Boolean) : []
      const acceptanceCriteria = Array.isArray(sc.acceptanceCriteria) ? sc.acceptanceCriteria.filter(Boolean) : []
      const source = sc.sourceRef || sc.source || {}
      return {
        hasContent: Boolean(goal || description || constraints.length || acceptanceCriteria.length),
        goal,
        description,
        constraints,
        acceptanceCriteria,
        parserModel: source.parserModel ? String(source.parserModel) : '',
        parsedAt: source.parsedAt ? String(source.parsedAt) : ''
      }
    },
    artifactView() {
      const art = this.detailArtifact && this.detailArtifact.data
      if (!art) return {}
      const meta = art.artifactMeta || {}
      const report = art.solidificationReport || {}
      return {
        artifactId: art.artifactId || meta.artifactId || '',
        schemaVersion: art.schemaVersion || '',
        solidifiable: report.solidifiable != null ? report.solidifiable : art.solidifiable,
        goldenPathExtractable: report.goldenPathExtractable,
        goldenPathReason: report.goldenPathReason || '',
        remediation: Array.isArray(report.remediation) ? report.remediation : [],
        buildSummary: meta.buildSummary || null,
        artifactHash: meta.artifactHash || (art.provenance && art.provenance.artifactHash) || '',
        sourceSessionId: meta.sourceSessionId || (art.provenance && art.provenance.sourceSessionId) || ''
      }
    },
    goldenPathSteps() {
      const art = this.detailArtifact && this.detailArtifact.data
      const gp = art && art.goldenPath
      if (!gp || !Array.isArray(gp.steps)) return []
      return gp.steps
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
    serviceContractRows() {
      const data = this.detailArtifact && this.detailArtifact.data
      const contracts = data && Array.isArray(data.serviceContracts) ? data.serviceContracts : []
      return contracts.map((c) => {
        const declared = Array.isArray(c.declaredTools) ? c.declaredTools : []
        const observed = Array.isArray(c.observedTools) ? c.observedTools : []
        const channelParts = [c.channel, c.transport].filter(Boolean)
        const totalCalls = typeof c.totalCalls === 'number' ? c.totalCalls : 0
        const successRate = c.overallSuccessRate != null
          ? `${Math.round(c.overallSuccessRate * 100)}%`
          : '—'
        return {
          serviceId: c.serviceId || '',
          serviceName: c.serviceName || '未命名服务',
          channelLabel: channelParts.length ? channelParts.join(' · ') : '—',
          totalCalls,
          successRate,
          declaredToolNames: declared.map((t) => t.name).filter(Boolean),
          observedSummaries: observed.map((o) => {
            const parts = [`${o.toolName || '?'}×${o.callCount || 0}`]
            if (o.avgLatencyMs != null) parts.push(`${Math.round(o.avgLatencyMs)}ms`)
            if (o.successRate != null && o.successRate < 1) {
              parts.push(`${Math.round(o.successRate * 100)}%`)
            }
            return parts.join(' · ')
          }),
          uncalled: totalCalls === 0
        }
      })
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
          hint: '沙箱/返回保真度',
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
    showPreStart() {
      return !this.embedded && !this.hasStarted && !this.isCompleted
    },
    domainHint() {
      const d = this.domain || 'generic'
      if (d === 'generic') return ''
      const dk = getKnowledge(d)
      return dk && dk.summary ? `已识别领域：${dk.summary}` : ''
    },
    resultEnhancements() {
      if (!this.finalResult || !Array.isArray(this.finalResult.enhancements)) return []
      return this.finalResult.enhancements
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
    enhancementStageLabel(stage) {
      const m = { scenarioParsing: '想定解析', planning: '调度规划', verification: '仿真验证' }
      return m[stage] || stage
    },
    strategyLabel(key, value) {
      const labels = {
        sandbox: { cow: 'CoW', none: '无沙箱', full_mock: '全模拟' },
        planning: { llm_autonomous: 'LLM规划', preset_workflow: '预设流' },
        verification: { multi_agent: '多Agent', single_agent: '单Agent', rule_based: '规则' },
        repair: { llm_repair: 'LLM修复', rule_repair: '规则修复', none: '无修复' },
        solidify: { golden_trace: '经验固化', replan: '重规划', static: '静态' }
      }
      const group = labels[key] || {}
      return `${key}: ${group[value] || value}`
    },
    formatPct(v) {
      if (v == null || Number.isNaN(Number(v))) return '—'
      return `${(Number(v) * 100).toFixed(1)}%`
    },

    init(nodes) {
      this.visible = true
      this.intentionalClose = false
      // 研究模式 UI 已移除；固定 production，strategy 默认值仍写入 payload
      this.internalMode = 'production'
      this.scenarioDraft = this.scenarioDescription || ''
      this.initScenarioParsedDraftFromProp()
      this.strategy = { ...SIMULATION_BUILD_DEFAULT_STRATEGY }
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
      this.dispatchStatus = '智能体调度执行中'
      this.currentActionText = '初始化中...'
      this.iterationHistory = []
      this.iterationDetails = []
      this.failureMessage = ''
      this.detailTrace = { loading: false, skipped: false, error: null, view: null, rawJson: '' }
      this.detailEvidence = { loading: false, skipped: false, error: null, data: null }
      this.detailArtifact = { loading: false, skipped: false, error: null, data: null }
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
          mcpCommand: node.mcpCommand || '',
          mcpArgs: node.mcpArgs || [],
          status: 'pending',
          statusText: '等待中',
          latency: null
        }))
    },

    buildSimulationStrategy() {
      // strategy 随 start payload 发送，供 Micro-Agent orchestrator 使用
      const base = { ...this.strategy }
      if (resolveScheduleDemoKind(this.appName) === SCHEDULE_DEMO_KIND.LOCAL_MCP) {
        return { ...base, stabilityPasses: 2 }
      }
      return base
    },

    buildStartPayload() {
      const domain = this.domain || 'generic'
      const domainKnowledge = getKnowledge(domain, {
        appId: this.appId || 'meta-app-draft',
        appName: this.appName,
        scenarioDescription: this.scenarioDraft,
        serviceNames: this.serviceStatuses.map((s) => s.name),
        mode: this.internalMode
      })
      return {
        appId: this.appId || 'meta-app-draft',
        appName: this.appName,
        domain,
        domainKnowledge,
        serviceIds: this.serviceStatuses.map((s) => String(s.id)),
        servicesMeta: this.serviceStatuses.map((s) => ({
          id: String(s.id),
          name: s.name,
          mcpUrl: rewriteMcpUrlForLocalDev(s.mcpUrl || ''),
          tools: s.tools || [],
          isFake: !!s.isFake,
          mcpMethod: s.mcpMethod || 'sse',
          mcpCommand: s.mcpCommand || '',
          mcpArgs: s.mcpArgs || []
        })),
        maxIterations: this.maxIterations,
        scenarioDescription: this.scenarioDraft,
        scenarioSummary: this.scenarioDraft,
        scenarioParsed: this.hasScenarioParsedDraft ? this.getScenarioParsedForStart() : undefined,
        mode: this.internalMode,
        strategy: this.buildSimulationStrategy()
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
      let mcpCallCount = 0
      events.forEach((ev) => {
        if (!ev || !ev.data) return
        const t = ev.type
        const d = ev.data
        if (t === 'tool_call_record') {
          if (d.channel === 'real_mcp') mcpCallCount += 1
          const resultPreview = d.result
            ? String(d.result).replace(/\s+/g, ' ').slice(0, 60)
            : ''
          toolCalls.push({
            toolName: d.tool_name || '—',
            serviceId: d.service_id || '—',
            serviceName: d.service_name || '',
            channel: d.channel || 'unknown',
            latencyMs: d.latency_ms != null ? d.latency_ms : '—',
            resultPreview
          })
        } else if (t === 'planner_decision') {
          plannerDecisions.push({
            iteration: d.iteration,
            selectedTools: d.selected_tools || [],
            executionPath: d.executionPath || [],
            reason: d.reason || ''
          })
        } else if (t === 'verifier_result') {
          verifierResults.push({
            iteration: d.iteration,
            status: d.status || 'UNKNOWN',
            summary: d.summary || '',
            reason: d.reason || '',
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
        verifierResults
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
      if (status === 404) return '轨迹尚未落盘，正在等待服务端写入…'
      const detail = err.response && err.response.data
      if (typeof detail === 'string') return detail
      if (detail && detail.detail) return String(detail.detail)
      if (detail && detail.message) return String(detail.message)
      if (err.message) return err.message
      return fallback
    },

    isRetryableArtifactError(err) {
      const status = err && err.response && err.response.status
      return !status || status === 404 || status === 503 || status >= 500
    },

    async fetchTraceWithRetry(sessionId, attempts = 24, delayMs = 500) {
      let lastErr = null
      // complete 事件先于 SSE finally 落盘，先等一拍再轮询
      await new Promise((resolve) => setTimeout(resolve, 400))
      for (let i = 0; i < attempts; i += 1) {
        try {
          return await fetchSimulationTrace(sessionId)
        } catch (e) {
          lastErr = e
          if (!this.isRetryableArtifactError(e)) throw e
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
      throw lastErr || new Error('轨迹加载超时，请稍后刷新重试')
    },

    async loadDetailArtifacts() {
      if (!this.sessionId) return
      if (useMemorySimulation(this.appName)) {
        this.detailTrace = { loading: true, skipped: false, error: null, view: null, rawJson: '' }
        this.detailEvidence = { loading: true, skipped: false, error: null, data: null }
        this.detailArtifact = { loading: true, skipped: false, error: null, data: null }
        try {
          const { buildTopicDemoArtifacts } = await import('@/mock/data/topic_simulation_artifacts')
          const packs = buildTopicDemoArtifacts({
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
        } catch (e) {
          const msg = this.formatArtifactError(e, '课题演示产物加载失败')
          this.detailTrace = { loading: false, skipped: true, error: msg, view: null, rawJson: '' }
          this.detailEvidence = { loading: false, skipped: true, error: null, data: null }
          this.detailArtifact = { loading: false, skipped: true, error: null, data: null }
        }
        return
      }
      this.detailTrace = { loading: true, skipped: false, error: null, view: null, rawJson: '' }
      this.detailEvidence = { loading: false, skipped: false, error: null, data: null }
      try {
        const trace = await this.fetchTraceWithRetry(this.sessionId)
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
        // 加载 ArtifactSpec
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

    onStreamServiceCalling({ serviceId, serviceName, toolName, status }) {
      if (this.aborted || !this.isRunning) return
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
      if (text) item.text = text
      if (active) item.active = true
      if (done) {
        item.active = false
        item.done = true
      }
    },

    onStreamPhase({ phase, status }) {
      if (!['data', 'logic', 'check'].includes(phase)) return
      this.syncCanvasVisual({ type: 'simulatePhase', phase, status })

      const d = this.currentDetail()
      if (phase === 'data' || phase === 'logic') {
        if (status === 'running') {
          this.phases.exec = 'running'
          this.currentActionText =
            phase === 'data'
              ? '正在进行：规划 Agent 调度服务…'
              : '正在进行：核对工具调用与返回…'
          this.dispatchStatus = '智能体调度执行中'
          if (d) d.execPhase = 'running'
        } else if (status === 'done' && phase === 'logic') {
          this.phases.exec = 'done'
          this.syncCanvasVisual({ type: 'activeCall', targetNodeId: null })
          if (d) d.execPhase = 'done'
        }
        return
      }

      if (phase === 'check') {
        if (status === 'running') {
          this.phases.check = 'running'
          this.currentActionText = '正在进行：验证 Agent 审查目标达成…'
          this.dispatchStatus = '目标验收中'
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
      this.dispatchStatus = phase === 'planning' ? '规划失败，准备重试' : '自动修复中'
      this.currentActionText = `发现: ${message}，正在修复...`
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
        this.phases = { exec: 'pending', check: 'pending' }
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

      const { success, cancelled, metrics, result } = payload

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

      this.hasFailed = !success

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
      this.showTechDetails = true
      this.syncCanvasVisual({ type: 'activeCall', targetNodeId: null })
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      this.loadDetailArtifacts()
    },

    onStreamError(err) {
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      this.stopTimer()
      this.isRunning = false
      this.teardownStream()
      this.isCompleted = true
      this.hasFailed = true
      this.failureMessage = (err && err.message) || '流式连接异常'
      this.failureSuggestion = '请稍后重试或检查网络'
      this.addLog(this.failureMessage, 'ERROR', 'error')
    },

    subscribeToStream(sessionId, streamUrl) {
      this.sessionId = sessionId
      this.unsubscribeStream = subscribeSimulationStream(sessionId, streamUrl, {
        step: this.onStreamStep,
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
      this.$emit('success', {
        appName: this.appName,
        appId: this.appId,
        servicesCount: this.connectedServicesCount,
        iterations: this.totalIterations,
        executionTime: this.elapsedTime,
        metrics: { ...this.finalMetrics },
        result: this.finalResult,
        artifactRef: this.detailArtifact.data ? {
          artifactId: this.artifactView.artifactId,
          solidifiable: this.artifactView.solidifiable,
          goldenPathExtractable: this.artifactView.goldenPathExtractable,
          artifactHash: this.artifactView.artifactHash
            ? this.artifactView.artifactHash.slice(0, 16)
            : null
        } : null
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
      if (iter.execPhase === 'done' && iter.checkPhase !== 'done') return '验收中'
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

    getDetailViewModel() {
      const evidence = this.detailEvidence.data
      return {
        currentPhaseLabel: this.isRunning ? '智能构建中' : (this.isCompleted ? '构建完成' : '准备中'),
        currentActionText: this.currentActionText,
        dispatchStatus: this.dispatchStatus,
        iterations: (this.iterationDetails || []).map((i) => {
          const vr = i.verifierResult
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
            verifierStatus: vr && vr.status ? vr.status : '',
            verifierSummary: (vr && (vr.reason || vr.summary)) || '',
            issue: i.issue || '',
            fix: i.fix || '',
            summary: (vr && (vr.reason || vr.summary)) || ''
          }
        }),
        services: this.serviceStatuses,
        stats: {
          serviceCount: this.serviceStatuses.length,
          completedCalls: this.serviceStatuses.filter((s) => s.status === 'online').length,
          pendingIssues: (this.iterationDetails || []).filter((i) => i.issue).length
        },
        showTechDetails: this.hasStarted,
        traceLoading: this.detailTrace.loading,
        traceSkipped: this.detailTrace.skipped,
        traceError: this.detailTrace.error,
        callChain: this.callChainSteps,
        evidenceStatus: evidence && evidence.overallStatus,
        evidenceSummary: evidence && evidence.summary
          ? `共 ${evidence.summary.total_checks} 项检查 · 通过 ${evidence.summary.passed || 0}`
          : '',
        solidifiable: this.artifactView.solidifiable,
        goldenPathExtractable: this.artifactView.goldenPathExtractable,
        artifactId: this.artifactView.artifactId,
        artifactRows: this.isCompleted ? this.buildProductArtifactRows() : []
      }
    },

    pushProductRow(rows, key, label, value, size = 'sm') {
      if (value == null || value === '') return
      rows.push({ key, label, value: String(value), size })
    },

    productGateSize(gateName) {
      const compactGates = ['noInfrastructureErrors', 'realMcpCallsPresent']
      return compactGates.includes(gateName) ? 'sm' : 'sm'
    },

    buildBuildSummaryRows() {
      const rows = []
      const art = this.detailArtifact.data
      const evidence = this.detailEvidence.data

      if (this.detailTrace.loading) {
        this.pushProductRow(rows, 'trace', '轨迹', '加载中…', 'xl')
      } else if (this.detailTrace.skipped) {
        this.pushProductRow(rows, 'trace', '轨迹', '进程内演示无落盘轨迹', 'lg')
      } else if (this.detailTrace.error) {
        this.pushProductRow(rows, 'trace', '轨迹', this.detailTrace.error, 'xl')
      } else if (this.callChainSteps.length) {
        this.pushProductRow(rows, 'trace', '轨迹', this.callChainSteps.join(' → '), 'xl')
      }

      if (evidence) {
        const statusText = evidence.overallStatus || '—'
        let summaryText = statusText
        if (evidence.summary) {
          const s = evidence.summary
          summaryText = `${statusText} · 共 ${s.total_checks} 项检查 · 通过 ${s.passed || 0}${s.failed ? ` · 失败 ${s.failed}` : ''}${s.warnings ? ` · 警告 ${s.warnings}` : ''}`
        }
        this.pushProductRow(rows, 'evidence-status', '证据结论', summaryText, 'lg')
      }

      if (art) {
        const av = this.artifactView
        this.pushProductRow(rows, 'artifact-id', '产物 ID', av.artifactId, 'sm')
        this.pushProductRow(rows, 'solidifiable', '可固化', av.solidifiable ? '是' : '否', 'xs')
        if (av.goldenPathExtractable != null) {
          this.pushProductRow(rows, 'golden-path', '黄金路径', av.goldenPathExtractable ? '可抽取' : '不可抽取', 'xs')
        }
        if (av.sourceSessionId) {
          this.pushProductRow(rows, 'session', '来源会话', av.sourceSessionId, 'xs')
        }
      }

      this.pushProductRow(rows, 'elapsed', '构建耗时', this.formattedElapsedTime, 'xs')
      return rows
    },

    buildProductArtifactRows() {
      const rows = []
      const art = this.detailArtifact.data

      this.pushProductRow(rows, 'app-name', '应用名称', this.appName)
      this.pushProductRow(rows, 'domain', '应用领域', this.domain || 'generic')
      if (art && art.artifactMeta) {
        this.pushProductRow(rows, 'mode', '构建模式', art.artifactMeta.mode)
        this.pushProductRow(rows, 'app-id', '应用 ID', art.artifactMeta.appId)
      } else if (art && art.metaApp) {
        this.pushProductRow(rows, 'mode', '构建模式', art.metaApp.mode)
        this.pushProductRow(rows, 'app-id', '应用 ID', art.metaApp.appId)
      }

      const sp = this.scenarioParsedView
      if (sp.hasContent) {
        this.pushProductRow(rows, 'goal', '场景目标', sp.goal)
        this.pushProductRow(rows, 'scenario-desc', '场景描述', sp.description, 'lg')
        if (sp.constraints.length) {
          this.pushProductRow(rows, 'constraints', '约束', sp.constraints.join('；'), 'lg')
        }
        if (sp.acceptanceCriteria.length) {
          this.pushProductRow(rows, 'acceptance', '验收标准', sp.acceptanceCriteria.join('；'), 'lg')
        }
        this.pushProductRow(rows, 'parser-model', '解析模型', sp.parserModel)
        this.pushProductRow(rows, 'parsed-at', '解析时间', sp.parsedAt)
      } else {
        const d = this.scenarioParsedDraft || {}
        this.pushProductRow(rows, 'goal', '场景目标', d.goal)
        this.pushProductRow(rows, 'scenario-desc', '场景描述', d.description, 'lg')
        if (d.constraints && d.constraints.length) {
          this.pushProductRow(rows, 'constraints', '约束', d.constraints.join('；'), 'lg')
        }
        const acc = d.acceptanceCriteria
        if (acc && acc.length) {
          this.pushProductRow(rows, 'acceptance', '验收标准', acc.join('；'), 'lg')
        }
      }

      if (art) {
        const av = this.artifactView
        this.pushProductRow(rows, 'artifact-id', '产物 ID', av.artifactId, 'sm')
        this.pushProductRow(rows, 'schema', 'Schema 版本', av.schemaVersion || art.schemaVersion, 'xs')
        this.pushProductRow(rows, 'solidifiable', '可固化', av.solidifiable ? '是' : '否', 'xs')
        if (av.goldenPathExtractable != null) {
          this.pushProductRow(rows, 'golden-path', '黄金路径', av.goldenPathExtractable ? '可抽取' : `不可抽取：${av.goldenPathReason || '—'}`, 'lg')
        }
        const gates = art.solidificationReport && art.solidificationReport.gates
        if (gates && gates.length) {
          gates.forEach((g, idx) => {
            this.pushProductRow(
              rows,
              `gate-${idx}`,
              g.gate,
              g.passed ? '通过' : `未通过：${g.detail || '—'}`,
              this.productGateSize(g.gate)
            )
          })
        }
        if (av.artifactHash) {
          this.pushProductRow(rows, 'hash', '产物 Hash', av.artifactHash, 'sm')
        }
      }

      this.serviceContractRows.forEach((c, idx) => {
        const detail = c.uncalled
          ? `未调用 · ${c.channelLabel}`
          : `调用 ${c.totalCalls} 次 · 成功率 ${c.successRate} · ${c.channelLabel}`
        const tools = c.declaredToolNames.length ? `声明工具：${c.declaredToolNames.join('、')}` : ''
        const observed = c.observedSummaries.length ? `实测：${c.observedSummaries.join('；')}` : ''
        const value = [detail, tools, observed].filter(Boolean).join(' · ')
        this.pushProductRow(rows, `contract-${idx}`, c.serviceName, value, 'xl')
      })

      this.pushProductRow(
        rows,
        'services',
        '服务绑定',
        this.serviceStatuses.map((s) => s.name).join('、'),
        'xl'
      )

      return rows
    },

    getProductViewModel() {
      const art = this.detailArtifact.data
      const tags = []
      if (art) {
        tags.push({ label: '场景与意图', tone: 'green' })
        tags.push({ label: '服务与契约', tone: 'green' })
        if (art.solidificationReport && art.solidificationReport.goldenPathExtractable) {
          tags.push({ label: '黄金路径', tone: 'green' })
        } else if (art.solidificationReport && art.solidificationReport.solidifiable) {
          tags.push({ label: '固化候选', tone: 'blue' })
        }
        tags.push({ label: '预览信息', tone: 'blue' })
      }
      return {
        artifactRows: this.buildProductArtifactRows(),
        summaryRows: this.buildBuildSummaryRows(),
        intent: (this.scenarioParsedDraft && this.scenarioParsedDraft.goal) || this.appName,
        services: this.serviceStatuses.map((s) => s.name).join('、'),
        tags
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

// ArtifactSpec 门禁列表
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
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .simulation-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border: 0;
    box-shadow: none;
  }

  .main-steps {
    padding: 12px 10px;
  }

  .main-steps-five .step-label {
    font-size: 10px;
    max-width: 64px;
  }

  .simulation-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .footer-buttons--embedded {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 12px 0 4px;
    border-top: 1px solid #e8edf4;
    margin-top: 8px;
  }
}
</style>
