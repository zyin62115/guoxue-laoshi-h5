# 本地数据 API

项目没有后端 API。`src/js/shared.js` 通过 `window.GuoxueApp` 暴露共享状态和本地存储能力，页面脚本必须先加载 `shared.js`，再加载对应业务脚本。

问答回复由 `src/js/app.js` 中的本地关键词规则模拟，不代表已接入真实 AI 服务。八字档案和历史会话仅保存在当前浏览器中。

## 对话额度

当前所有页面均允许不限次数对话。为兼容现有页面脚本，`getQuota()`、`consumeQuota()` 和 `renderQuota()` 接口继续保留：前两者始终返回无限额度状态，`renderQuota()` 固定显示“对话不限次”。

## 国心解读报告

报告与模拟订单分别保存在 `guoxueInterpretationReportsV1` 和 `guoxueInterpretationOrdersV1`。报告绑定档案快照指纹；同一快照复用已有报告，档案信息变化后生成新版本。报告上限为 30 份，模拟订单最多保留 100 条。

价格以分为单位：`FULL_REPORT_PRICE` 为 8800，`REPORT_SECTION_PRICE` 为 1680。补全价格由完整价格减去已购单章金额计算；剩余金额低于单章价格时，状态层拒绝继续单章购买。

`window.GuoxueApp` 新增以下接口：

- `getReports()` / `getReport(id)`：读取报告列表或单份报告。
- `getOrCreateReport(profileId, payload)`：按档案快照复用或创建报告。
- `getReportUpgradePrice(reportOrId)`：返回补全完整报告所需金额。
- `purchaseReport(reportId, purchase)`：模拟购买单章或完整报告，并写入已支付订单。
- `getReportOrders()`：读取模拟订单。
- `createReportConversation(reportId, sectionId)`：创建或恢复当天对应章节的报告会话。

会话结构增加可选的 `context` 字段，包含 `reportId`、`sectionId` 和 `sectionTitle`。没有上下文的旧会话继续按原有结构读取。

首次免费领取卡片状态保存在 `guoxueFirstReportClaimPromptV1`。用户首次生成报告并看到付费页面 5 秒后才检查和展示卡片，直接打开历史报告不会触发。`shouldShowFirstReportClaim()` 判断是否应展示；`dismissFirstReportClaim(action)` 记录用户选择，`action` 为 `wechat` 或 `closed`；`getFirstReportClaim()` 可读取处理结果。当前微信按钮跳转至本地 `wechat-simulator.html`，只有完成模拟添加并返回时才授予免费权益。

微信模拟页完成添加并返回时调用 `claimFreeReport(reportId)`，将对应报告的八章完整解锁，并写入一条金额为 0、状态为 `claimed` 的领取订单。找不到原报告时不授予权益，并提示用户返回重新生成。

专业排盘页使用 `wechat-simulator.html?context=chart&return=...` 进入同一微信模拟页。`context=chart` 只切换为排盘咨询文案，并校验 `return` 为站内排盘列表或排盘信息页；此场景不调用 `claimFreeReport()`，也不会写入领取订单。
