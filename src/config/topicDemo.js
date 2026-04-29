/**
 * 演示流程 · 配置与判定
 *
 * 【入口约定】仿真构建按钮在 panel_enhanced 的工具栏（`showToolbar=true` 时出现）。
 * - 调度页 `GenericSchedule`：带 `smart_chat`，面板默认 `showToolbar=true`，可走仿真。
 * - 使用页 `useMetaApp`：`show-toolbar=false`，不展示工具栏，因而**无仿真入口**（与「无聊天调度则不做画布侧仿真」一致）。
 *
 * 【分流】元应用**当前展示名称**（画布 `data.preName`，用户可在元应用详情中修改）是否含演示关键字，
 * 决定仿真走进程内还是 HTTP 后端；调度侧假推荐由 `smart_chat` 对用户输入做相同关键字判定。
 */
export const TOPIC_DEMO_KEYWORD = '课题'

/** @param {string} [text] 展示名称或用户输入 */
export function matchesTopicDemoKeyword(text) {
  return String(text || '').includes(TOPIC_DEMO_KEYWORD)
}
