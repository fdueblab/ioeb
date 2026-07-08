# 前端 E2E 自动化测试建设说明

本文档用于汇报 IOEB 前端 E2E 自动化测试的建设背景、技术选型、当前集成情况，以及后续新增和维护测试用例的方式。

## 一、什么是 E2E 测试

E2E 是 End-to-End 的缩写，即端到端测试。它从真实用户视角出发，驱动浏览器完成一条完整业务链路，并验证页面结果是否符合预期。

以当前已接入的登录测试为例，E2E 测试不会只验证某个函数、组件或接口是否可用，而是会实际打开开发测试环境页面，输入测试账号，点击登录按钮，并确认页面跳转到工作台且展示当前用户信息。

它关注的是“整条链路能不能跑通”，覆盖范围通常包括：

- 前端路由、页面渲染和交互。
- 登录态、权限、页面跳转等前端状态逻辑。
- 前端和后端接口的真实联动。
- 部署后的环境配置、网关、接口地址和静态资源加载。

因此，E2E 测试不是单元测试的替代品，而是位于更高层级的质量保障手段。

| 测试类型 | 主要验证对象 | 特点 |
| --- | --- | --- |
| 单元测试 | 函数、组件、工具方法 | 速度快，定位问题精确，但不覆盖真实链路 |
| 集成测试 | 模块之间的协作 | 能验证局部联动，但通常仍有 mock 或测试替身 |
| E2E 测试 | 用户视角下的完整业务流程 | 最接近真实使用场景，但成本更高、运行更慢 |

## 二、为什么需要 E2E

IOEB 平台已经完成开发测试环境和生产环境隔离，默认分支合并后会自动部署到开发测试环境。随着功能持续迭代，只依赖人工回归会带来几个问题：

1. **核心链路容易漏测**

   登录、工作台、资源列表、服务发布、应用构建等流程涉及多个页面和接口，人工测试容易因为时间紧、改动多而遗漏。

2. **部署后的问题很难提前发现**

   单元测试和本地构建不能完全覆盖部署环境问题，例如环境变量配置、接口代理、静态资源路径、登录态存储、跨域和网关转发。

3. **回归成本会随功能增长持续上升**

   如果每次合并后都靠人工验证，测试成本会线性增长。E2E 可以把稳定的冒烟用例自动化，让人工精力集中在新功能和复杂场景。

4. **发布前需要可审计的验证记录**

   GitHub Actions 中的 E2E 结果、日志、截图和 Playwright 报告可以作为每次合并后的验证记录，便于问题追踪和发布评估。

当前阶段的目标不是一次性覆盖所有业务，而是先把最关键的冒烟链路接入自动化流程，形成可扩展的测试基座。

## 三、技术选型情况

当前前端 E2E 选型为 **Playwright + GitHub Actions + 开发测试环境**。

### 3.1 选择 Playwright 的原因

Playwright 是面向现代 Web 应用的端到端测试框架，适合当前 Vue 单页应用的自动化测试场景。它的主要优势包括：

- 支持真实浏览器自动化，当前项目先接入 Chromium。
- 提供 `getByRole`、`getByPlaceholder`、`getByLabel` 等面向用户语义的选择器，减少对样式 class 的依赖。
- 提供自动等待和 web-first assertion，能降低页面异步渲染导致的 flaky 测试。
- 支持失败截图、trace、HTML report，便于 CI 失败后定位问题。
- GitHub Actions 集成成熟，适合作为合并后的自动化验证流程。

### 3.2 与其他方案的比较

| 方案 | 优点 | 局限 | 结论 |
| --- | --- | --- | --- |
| Playwright | 现代浏览器支持好，自动等待能力强，CI 报告和 trace 完整 | 初期需要维护测试账号、测试数据和环境稳定性 | 当前采用 |
| Cypress | 开发体验好，生态成熟 | 对多浏览器和跨域场景的处理方式与真实浏览器仍有差异 | 可选，但不作为当前首选 |
| Selenium | 历史悠久，语言生态广 | 配置和维护成本较高，测试稳定性依赖较多工程约束 | 不适合作为当前最小路径 |
| 纯接口测试 | 快、稳定、定位明确 | 无法覆盖真实页面交互、路由、登录态和部署后前端问题 | 后续可补充，但不能替代 E2E |

### 3.3 当前不引入 mock 的原因

当前第一阶段目标是跑通真实开发测试环境中的登录链路。既然已有稳定的开发测试环境和专用测试账号，登录冒烟用例优先使用真实环境，不额外引入 mock。

后续当测试场景覆盖到复杂业务流程时，可以按需引入 mock 或测试夹具，例如：

- 外部服务不稳定或调用成本高。
- 需要构造边界数据、异常返回或权限组合。
- 不希望测试修改共享环境中的真实业务数据。

## 四、当前集成情况

本轮已在 `fdueblab/ioeb` 前端仓库完成 E2E 基座接入，并通过 PR 合并到 `master`。

### 4.1 代码结构

相关文件如下：

```text
playwright.config.js
tests/e2e/README.md
tests/e2e/login.spec.js
.github/workflows/master.yml
package.json
yarn.lock
```

### 4.2 npm 脚本

`package.json` 中新增了三个脚本：

```bash
yarn test:e2e
yarn test:e2e:ui
yarn test:e2e:report
```

含义分别是：

| 命令 | 用途 |
| --- | --- |
| `yarn test:e2e` | 执行全部 E2E 测试 |
| `yarn test:e2e:ui` | 打开 Playwright 交互式测试 UI，适合本地调试 |
| `yarn test:e2e:report` | 查看 Playwright HTML 测试报告 |

### 4.3 Playwright 配置

`playwright.config.js` 当前配置要点：

- 测试目录：`tests/e2e`
- 浏览器项目：`chromium`
- 基础地址：读取 `E2E_BASE_URL`
- CI 中禁止提交 `test.only`
- CI 中失败自动重试 1 次
- CI 中使用单 worker，降低共享开发测试环境下的并发干扰
- 失败时保存截图
- 首次重试时保存 trace
- CI 中生成 HTML report

### 4.4 当前已有用例

当前已接入的用例是登录冒烟测试：

```text
tests/e2e/login.spec.js
```

覆盖流程：

1. 打开登录页 `/user/login`。
2. 输入 E2E 测试账号。
3. 点击登录按钮。
4. 校验页面跳转到工作台。
5. 校验工作台中展示当前登录用户。

这条用例的价值在于验证最基础的可用性：开发测试环境可访问、前端资源加载正常、登录接口可用、路由跳转正常、登录态生效。

### 4.5 CI 集成方式

当前 E2E 只在 `master` push 后执行，不在 PR 分支上自动执行真实环境 E2E。

原因是 PR 分支代码还没有部署到共享开发测试环境。如果在 PR 阶段跑真实环境 E2E，测试到的可能不是当前 PR 的代码，结果会产生误导。

当前 CI 流程为：

```text
push master
  -> Build & Push Frontend Image
  -> Deploy Staging
  -> Wait for development test environment
  -> Login E2E
  -> Upload Playwright report
```

`Login E2E` 依赖 `Deploy Staging`，并在运行测试前访问：

```text
${E2E_BASE_URL}/api/health
```

健康检查通过后再执行 Playwright 测试。

### 4.6 CI Secret 配置

GitHub Actions 中需要配置以下 secrets：

```text
E2E_BASE_URL
E2E_USERNAME
E2E_PASSWORD
```

测试用例会在缺少任一变量时直接失败，避免配置缺失时产生假阳性结果。

### 4.7 查看测试结果

合并到 `master` 后，可以在 GitHub Actions 中查看：

```text
fdueblab/ioeb -> Actions -> CI -> Login E2E
```

重点查看步骤：

- `Wait for development test environment`
- `Run login E2E`
- `Upload Playwright report`

如果测试失败，可以下载 Actions 页面底部的 `playwright-report` artifact，查看失败截图、错误上下文和 trace。

## 五、后续如何新增或修改测试用例

### 5.1 新增用例的推荐流程

1. **先定义测试场景**

   优先选择高价值、稳定、适合自动化的链路，例如登录、进入核心页面、查询资源列表、打开详情页、提交表单后出现明确结果。

2. **确认测试数据**

   判断该用例是否可以复用 E2E 测试账号，是否会创建、修改或删除共享环境数据。对会污染环境的场景，需要提前设计清理方式或使用专门测试数据。

3. **新增 `*.spec.js` 文件**

   测试文件放在：

   ```text
   tests/e2e/
   ```

   示例：

   ```text
   tests/e2e/workplace.spec.js
   tests/e2e/service-list.spec.js
   tests/e2e/app-builder.spec.js
   ```

4. **本地运行验证**

   在仓库根目录执行：

   ```bash
   E2E_BASE_URL='http://dev.fdueblab.cn/' \
   E2E_USERNAME='<test-username>' \
   E2E_PASSWORD='<test-password>' \
   yarn test:e2e
   ```

5. **提交 PR**

   PR 阶段不会自动跑真实开发测试环境 E2E。合并到 `master` 后，CI 会先部署开发测试环境，再自动执行 E2E。

6. **合并后查看 Actions**

   合并后确认 `Login E2E` 或后续新增的 E2E job 是否通过。

### 5.2 修改已有用例

修改已有用例时建议遵循以下顺序：

1. 本地先复现当前用例是否通过。
2. 修改选择器、操作步骤或断言。
3. 只跑目标文件验证。
4. 再跑全部 E2E，避免影响其他用例。

只跑单个文件：

```bash
E2E_BASE_URL='http://dev.fdueblab.cn/' \
E2E_USERNAME='<test-username>' \
E2E_PASSWORD='<test-password>' \
yarn test:e2e tests/e2e/login.spec.js
```

使用交互式 UI 调试：

```bash
E2E_BASE_URL='http://dev.fdueblab.cn/' \
E2E_USERNAME='<test-username>' \
E2E_PASSWORD='<test-password>' \
yarn test:e2e:ui
```

### 5.3 用例编写规范

推荐写法：

- 优先使用 `getByRole`、`getByPlaceholder`、`getByLabel` 等用户语义选择器。
- 使用 `await expect(locator).toBeVisible()`、`toHaveText()`、`toHaveURL()` 等断言，让 Playwright 自动等待页面进入预期状态。
- 测试名称说明业务行为，例如 `test user can sign in through the login page`。
- 每个测试尽量只覆盖一条清晰业务链路。
- 避免依赖当前时间、随机排序、动画状态和不稳定的第三方服务。
- 不提交 `test.only`，CI 中已开启 `forbidOnly` 防止误提交。
- 对共享开发测试环境中的写操作保持克制，必要时增加清理逻辑。

不推荐写法：

- 使用固定 `sleep` 等待页面。
- 大量依赖 CSS class 或 DOM 层级。
- 一个用例覆盖过多业务步骤，导致失败后难以定位。
- 依赖人工临时创建的数据。
- 在测试代码中写明账号密码。

### 5.4 示例模板

```js
const { test, expect } = require('@playwright/test')

test('test user can open workplace page', async ({ page }) => {
  await page.goto('/user/login')

  await page.getByPlaceholder('请输入账户名').fill(process.env.E2E_USERNAME)
  await page.getByPlaceholder('请输入密码').fill(process.env.E2E_PASSWORD)
  await page.getByRole('button', { name: /登\s*录/ }).click()

  await expect(page).toHaveURL(/#\/account\/workplace/)
  await expect(page.getByRole('heading', { name: /e2e_test/ })).toBeVisible()
})
```

如果多个用例都需要登录，后续可以抽取公共登录 helper，例如：

```text
tests/e2e/helpers/auth.js
```

这样可以减少重复代码，并统一维护登录流程。

## 六、后续演进建议

当前阶段已经完成从 0 到 1 的最小可用 E2E 流程。后续建议按以下顺序演进：

1. **补充 smoke 用例**

   优先覆盖登录、工作台、资源列表、服务详情、核心导航等低成本高价值链路。目标是每次合并后快速确认平台基础可用。

2. **抽取公共测试能力**

   当用例超过 3 到 5 条后，抽取登录 helper、环境变量读取工具、常用断言和测试数据构造方法。

3. **区分 smoke 和 regression**

   后续用例数量增加后，可以用标签或目录拆分：

   ```bash
   playwright test --grep @smoke
   playwright test --grep @regression
   ```

   合并后默认跑 smoke，回归或发布前再跑更完整的 regression。

4. **增加版本校验**

   当前 CI 通过 `/api/health` 判断开发测试环境可访问，但不能证明环境已经部署到本次 commit 对应镜像。后续建议让开发测试环境暴露 commit sha 或 image tag，E2E 在版本匹配后再开始执行。

5. **完善测试数据隔离**

   对会创建或修改数据的流程，建议使用专门的 E2E 测试数据命名规则和清理机制，避免污染人工测试数据。

6. **必要时引入 mock**

   对第三方服务、耗时任务、异常分支和边界状态，可以逐步引入 mock 或测试夹具。但核心冒烟链路仍建议保持真实环境验证。

7. **增加结果通知**

   当 E2E 覆盖核心链路后，可以把失败结果通知到团队沟通渠道，缩短发现和处理问题的时间。

## 七、当前结论

本轮 E2E 建设已经完成基础闭环：

- 技术选型确定为 Playwright。
- 已接入真实开发测试环境。
- 已建立 GitHub Actions 自动执行流程。
- 已实现登录冒烟用例。
- 已支持失败截图、trace 和 HTML report。
- 已明确后续新增测试用例的目录、命令和规范。

当前方案适合作为 IOEB 前端自动化测试的起点。后续重点不是一次性追求覆盖率，而是持续把高价值、稳定、人工重复成本高的测试场景沉淀为 E2E 用例，逐步形成可复用、可审计、可扩展的质量保障体系。

## 参考资料

- Playwright Test configuration: https://github.com/microsoft/playwright/blob/main/docs/src/test-configuration-js.md
- Playwright CI integration: https://github.com/microsoft/playwright/blob/main/docs/src/ci.md
- Playwright best practices and reports: https://github.com/microsoft/playwright/blob/main/docs/src/best-practices-js.md
