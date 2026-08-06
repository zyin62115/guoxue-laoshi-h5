# 本地数据 API

项目没有后端 API。`src/js/shared.js` 通过 `window.GuoxueApp` 暴露共享状态和本地存储能力，页面脚本必须先加载 `shared.js`，再加载对应业务脚本。

问答回复由 `src/js/app.js` 中的本地关键词规则模拟，不代表已接入真实 AI 服务。八字档案和历史会话仅保存在当前浏览器中。

## 个人偏好

个人昵称和全站字号保存在 `guoxueUserPreferencesV1`，头像由页面根据昵称首字生成。`src/js/preferences.js` 在页面样式加载前初始化 `window.GuoxuePreferences`，所有页面均应先加载该脚本。

- `getPreferences()`：读取并标准化 `{ nickname, fontSize }`；损坏或非法数据回退为访客和标准字号。
- `updatePreferences(patch)`：合并并持久化偏好，同时立即应用字号。
- `applyFontSize(fontSize)`：将小、标准、大三档字号映射到根元素的 `data-font-size`。

客服入口使用 `wechat-simulator.html?context=customer-service&return=./settings.html`。该场景只展示客服添加模拟文案，不调用报告领取接口，也不写入订单。

## 对话额度与运营标签

当前所有页面均允许不限次数对话。额度状态与运营展示彼此独立：

- `getQuota()` / `consumeQuota()` 只负责额度业务状态，始终返回 `{ unlimited: true, remaining: Infinity }`，不会扣减或耗尽，也不提供 UI 文案。
- `getPromotionBadge()` 返回当前运营标签配置；`renderPromotionBadge(element)` 将“限时免费”渲染到指定标签元素，不读取额度状态。

首页和独立对话页只通过 promotion 接口渲染右上角标签；发送许可仍读取 quota 接口。旧 `localStorage` 中即使保存 `remaining: 0`，也不会影响当前无限额度状态。

八字档案的“姓名或称呼”在不同档案间必须唯一，比较时忽略首尾空格、连续空格和英文大小写；编辑档案时可保留自身原值。`isProfileNameTaken(name, excludeProfileId)` 用于提前检查冲突，`upsertProfile(profile)` 遇到重名时返回 `null` 且不写入本地存储。

## 出生地数据

档案表单通过 `fetch("../../public/data/china-regions.json")` 加载省、市、区三级数据，并在运行时追加“海外”选项。选中结果仍以单个 `birthplace` 文本字段写入档案，因此旧档案结构无需迁移。数据加载失败时会保留已有档案的出生地文本并禁用三级选择器；数据来源与 MIT 许可说明见 `public/data/README.md`。

## 国心解读报告

报告与模拟订单分别保存在 `guoxueInterpretationReportsV1` 和 `guoxueInterpretationOrdersV1`。报告绑定档案快照指纹；同一快照复用已有报告，档案信息变化后生成新版本。报告上限为 30 份，模拟订单最多保留 100 条。

价格以分为单位：`FULL_REPORT_PRICE` 为 8800，`REPORT_SECTION_PRICE` 为 1680。补全价格由完整价格减去已购单章金额计算；剩余金额低于单章价格时，状态层拒绝继续单章购买。

`window.GuoxueApp` 新增以下接口：

- `getReports()` / `getReport(id)`：读取报告列表或单份报告。
- `getCurrentProfileReport(profileId)`：按当前档案完整快照查找可直接续读的报告；档案信息变化后返回 `null`。
- `getLatestProfileReport(profileId)`：读取该档案最近生成的任意版本，用于提示和查看旧版报告。
- `getOrCreateReport(profileId, payload)`：按档案快照复用或创建报告。
- `getReportUpgradePrice(reportOrId)`：返回补全完整报告所需金额。
- `purchaseReport(reportId, purchase)`：模拟购买单章或完整报告，并写入已支付订单。
- `getReportOrders()`：读取模拟订单。
- `createReportConversation(reportId, sectionId)`：创建或恢复当天对应章节的报告会话。

会话结构增加可选的 `context` 字段，包含 `reportId`、`sectionId` 和 `sectionTitle`。没有上下文的旧会话继续按原有结构读取。

`activateHomeConversation()` 用于进入首页时切换或创建当天的普通问答会话。报告章节对话通过 `report-chat.html?report=<id>&section=<id>` 独立展示和发送消息，不作为首页问答或首页对话记录的一部分；对话页返回地址固定指向对应报告章节。

首次免费领取卡片状态保存在 `guoxueFirstReportClaimPromptV1`。用户首次生成报告并看到付费页面 5 秒后才检查和展示卡片，直接打开历史报告不会触发。`shouldShowFirstReportClaim()` 判断是否应展示；`dismissFirstReportClaim(action)` 记录用户选择，`action` 为 `wechat` 或 `closed`；`getFirstReportClaim()` 可读取处理结果。当前微信按钮跳转至本地 `wechat-simulator.html`，只有完成模拟添加并返回时才授予免费权益。

微信模拟页完成添加并返回时调用 `claimFreeReport(reportId)`，将对应报告的八章完整解锁，并写入一条金额为 0、状态为 `claimed` 的领取订单。找不到原报告时不授予权益，并提示用户返回重新生成。

国心解读入口不带参数时进入档案选择页，并默认选择上次使用的档案；`mode=select` 同样进入档案选择页，`report=<id>` 精确打开指定历史版本。无效的 `report` 参数会被移除并回退到档案选择页。只有实际创建的新报告会触发首次免费领取检查，查看已有报告不会触发。

专业排盘页使用 `wechat-simulator.html?context=chart&return=...` 进入同一微信模拟页。`context=chart` 只切换为排盘咨询文案，并校验 `return` 为站内排盘列表或排盘信息页；此场景不调用 `claimFreeReport()`，也不会写入领取订单。
