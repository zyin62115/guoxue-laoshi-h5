# 国学老师 H5 · 产品功能与页面跳转文档

> 版本：基于当前代码库实测整理（2026-08-10）
> 形态：移动端 H5 原型，原生 HTML / CSS / JavaScript，无构建步骤、无后端。  
> 所有数据保存在浏览器 `localStorage`；AI 回答、支付、微信跳转均为本地模拟。



---

## 一、产品概述

「国学老师」是一款以国学咨询为主题的移动端 H5 产品原型，围绕三条主线组织：

| 主线         | 核心价值                             | 承载页面             |
| ---------- | -------------------------------- | ---------------- |
| 日常陪伴       | 今日指引、万年历、随时向老师提问                 | 首页、万年历、对话页       |
| 深度解读（付费主线） | 建立八字档案 → 生成八章报告 → 试读 → 解锁 → 逐章追问 | 国心解读、报告章节对话、我的报告 |
| 专业工具       | 十三种排盘法门的信息录入入口及万年历查询              | 专业排盘、排盘信息、万年历   |

商业化设计：完整报告 ¥88，单章 ¥16.8，单章金额可抵扣完整报告；另设「加微信免费领取一次完整报告」的导流通道。当前版本支付与领取均为模拟，不产生真实扣款。

---

## 二、页面清单

共 12 个页面，全部位于 `src/pages/`。

| #  | 页面      | 文件                      | 定位                                | 依赖脚本                                             |
| -- | ------- | ----------------------- | --------------------------------- | ------------------------------------------------ |
| 1  | 首页      | `index.html`            | 全站枢纽：今日指引 + 三大功能入口 + 提问框 + 个人中心抽屉 | `preferences` `shared` `app`                     |
| 2  | 万年历     | `calendar.html`         | 公历/农历月视图查询                        | `preferences` `calendar`                         |
| 3  | 对话页     | `chat.html`             | 与国学老师的通用问答                        | `preferences` `shared` `chat`                    |
| 4  | 国心解读    | `interpretation.html`   | 双态页：档案选择态 + 报告阅读态（含支付弹层、领取弹层）     | `preferences` `shared` `interpretation`          |
| 5  | 报告章节对话  | `report-chat.html`      | 针对某一章报告的独立追问                      | `shared` `chat-replies` `report-chat`            |
| 6  | 我的报告    | `reports.html`          | 已生成报告列表                           | `preferences` `shared` `reports`                 |
| 7  | 我的档案    | `profiles.html`         | 八字档案列表与切换                         | `preferences` `shared` `profiles`                |
| 8  | 档案表单    | `profile.html`          | 新增 / 编辑 / 删除八字档案                  | `preferences` `shared` `profile`                 |
| 9  | 个人资料与设置 | `settings.html`         | 昵称、字号、客服入口                        | `preferences` `settings`                         |
| 10 | 专业排盘    | `chart-prototypes.html` | 十三法门及万年历宫格入口                      | `preferences` `chart-methods` `chart-prototypes` |
| 11 | 排盘信息    | `chart-entry.html`      | 按法门动态生成的信息录入表单                    | `preferences` `chart-methods` `chart-entry`      |
| 12 | 微信模拟页   | `wechat-simulator.html` | 四种导流场景的统一模拟中转页                    | `preferences` `shared` `wechat-simulator`        |

所有页面共用 `src/js/navigation.js`（`data-navigation-back` → 浏览器历史返回，无历史时回落到站内地址）与 `src/js/preferences.js`（字号在样式加载前生效，避免闪回）。

---

## 三、页面功能详解

### 1. 首页 `index.html`

全站唯一的枢纽页，一屏内包含四个功能区。

**今日指引**

- 内置 12 条指引文案（`app.js` 的 `DAILY_GUIDES`），按本地日期序号轮换，含三行寄语 + 「宜 / 忌」两项。
- 日期显示优先使用浏览器农历历法（`zh-CN-u-ca-chinese`），不支持时回落为公历「X月X日」。
- 跨零点自动重算（定时器 + `focus` / `pageshow` 事件）。

**功能入口（三张卡片）**

- 专业排盘 → `chart-prototypes.html`
- 国心解读 → `interpretation.html`；卡片副标题会根据当前档案的报告状态动态变化：
  - 无档案：「建立档案，获得专属解读」/「查看历史报告，或创建新档案」
  - 有报告且档案未改动：「XX已有报告，可继续查看」/「XX已有完整报告，可继续查看」
  - 档案已改动：「XX档案已更新，可生成新版」
  - 从未生成：「XX尚未生成报告」
- 学习资料 → `wechat-simulator.html?context=learning-materials`（导流占位）

**底部提问栏**

- 输入内容后「+」按钮变为发送态；支持 Enter 发送，并对中文输入法组合态做了拦截。
- 提交后先把问题写入当天会话，再跳转 `chat.html`，由对话页负责生成回复。
- 麦克风按钮当前无交互（首页未绑定处理逻辑），属占位。
- 右上角「限时免费」为运营标签，与额度逻辑解耦；额度接口当前恒为无限。

**个人中心抽屉**

- 打开方式：左上角菜单键、屏幕左边缘右滑手势（带速度/位移判定）、URL 带 `#menu`。
- 关闭方式：关闭键、遮罩、Esc、右滑关闭手势；关闭时清理 `#menu` hash。
- 内容：昵称与首字头像（→ 设置页）、我的档案、我的报告、对话记录列表。
- 对话记录按「今天 / 昨天 / 更早」分组，仅展示有用户提问的普通会话；**报告章节会话不会出现在这里**。点击某条记录会将其设为活动会话并跳转 `chat.html`。

### 2. 万年历 `calendar.html`

- 6×7 = 42 格月视图，每格显示公历日 + 农历（初一显示月名）。
- 上/下月按钮、原生 `month` 选择器（1900-01 ~ 2100-12）、「今」快速回到今天。
- 顶部概览区显示星期、日、公历年月、农历完整表述与生肖年。
- 纯查询页，不写入任何数据。

### 3. 对话页 `chat.html`

- 展示当前活动会话的全部消息（单会话上限 40 条），顶部显示会话开始时间。
- 回复由本地关键词规则生成（`chat.js` 内置 5 组规则 + 兜底文案），约 700ms 的「老师正在思考…」动效后给出。
  - 规则组：医疗/法律（明确建议咨询专业人士）、学习考试、工作事业、情绪压力、家庭关系。
- 从首页跳入时，若最后一条是用户消息，会自动触发一次回复。
- 若当前会话带报告上下文，顶部出现上下文卡片，可一键跳回对应报告章节；回复也会加上「结合你在《章节》报告中的特点来看……」前缀。
- 麦克风按钮提示「语音输入功能开发中」。

### 4. 国心解读 `interpretation.html`（核心付费页）

单页双状态，通过 `history.pushState` / `popstate` 在两态间切换，浏览器返回键行为自然。

**A. 档案选择态（`report-setup`）**

- 老师欢迎语 + 档案单选列表，每张档案卡带状态标签：`未生成` / `已有报告` / `档案已更新`。
- 主按钮三态联动：
  | 档案状态    | 按钮文案   | 说明文案          |
  | ------- | ------ | ------------- |
  | 已有当前版报告 | 查看报告   | 打开后继续阅读，不重复生成 |
  | 档案信息已变更 | 生成新版报告 | 旧版报告仍保留       |
  | 从未生成    | 生成我的报告 | 生成后可长期查看      |
- 档案变更时额外出现「查看上一版报告」。
- 无档案时展示引导卡；若无档案但存在历史报告，显示「查看已保留的历史报告」。
- 生成动作有 550ms 模拟延迟（按钮文案变为「老师正在整理报告…」）。

**B. 报告阅读态（`report-reader`）**

- 老师总览寄语 + 档案信息 + 生成日期 + 「已解锁 N/8」进度。
- 8 个固定章节：认识自己、事业路径、你的财富、爱与关系、家人与社交、身体与能量、人生周期、重大选择。
- 每章未解锁时：显示 2–3 行有意义的试读文案 + 解锁后可见条目清单 + 购买按钮（不做模糊遮罩）。
- 每章解锁后：核心结论 / 优势天赋 / 潜在盲区 / 行动建议 四段正文；财富、身体、重大选择三章附免责声明；底部提供「针对本章继续问」。
- 历史版本会在标题标注「历史版本」；原档案被删除时标注「历史报告 · 原档案已删除」。

**C. 支付弹层**

- 完整报告 ¥88 / 单章 ¥16.8，均为模拟支付。
- 抵扣规则：补全价 = 8800 − 已购单章数 × 1680（单位：分）。当补全价低于单章价（即已购 5 章后仅剩 ¥4）时，单章选项隐藏，按钮直接引导补全。
- 支持 Esc 关闭与 Tab 焦点循环。

**D. 免费领取弹层**

- 仅在「首次实际生成新报告」后 2 秒自动弹出一次；直接打开历史报告不触发。
- 关闭弹窗只记 `prompted`，此后顶部「报告」键左侧常驻「免费领取」按钮，可随时再次打开。
- 点击绿色微信按钮 → 记 `claimed` → 跳转微信模拟页；返回时才真正解锁八章。领取过一次后常驻按钮永久消失。

**URL 参数**

| 参数                     | 行为                             |
| ---------------------- | ------------------------------ |
| 无参数                    | 进入档案选择态，默认选中上次使用的档案            |
| `?mode=select`         | 强制进入档案选择态                      |
| `?report=<id>`         | 直接打开指定报告；无效 ID 会被清除并提示「原报告不存在」 |
| `#report-section-<id>` | 打开后自动滚动到指定章节                   |

### 5. 报告章节对话 `report-chat.html`

- 入口：报告已解锁章节的「针对本章继续问」，URL 形如 `?report=<id>&section=<id>`。
- 独立于首页对话体系：单独的会话线程（当天同章节复用），不出现在个人中心的对话记录里。
- 首次进入自动发送一条老师开场白：「关于《章节名》，你还想进一步了解什么？」
- 回复复用 `chat-replies.js` 的同一套关键词规则，并带章节上下文前缀。
- 返回键固定回到原报告的对应章节锚点。
- 参数无效时显示「未找到报告章节」并禁用输入。

### 6. 我的报告 `reports.html`

- 列出全部报告（上限 30 份，按更新时间倒序），显示「XX的国心解读」、解锁进度（`已解锁 N/8` 或 `已永久解锁`）、更新日期。
- 点击任一报告 → `interpretation.html?report=<id>` 直接进入阅读态。
- 右上「新增」→ `interpretation.html?mode=select`；空态卡片 → `interpretation.html`。

### 7. 我的档案 `profiles.html`

- 列出全部档案（上限 20 份），显示姓名首字头像与出生信息（历法 / 闰月 / 日期 / 时间 / 出生地）。
- 点击卡片主体 = 设为当前对话档案（toast 提示，卡片高亮）。
- 每张卡右侧「编辑」→ `profile.html?id=<id>&return=profiles`。
- 右上「新增」与空态卡片 → `profile.html?return=profiles`。

### 8. 档案表单 `profile.html`

- 字段：姓名/称呼（必填，≤24 字）、性别、历法（公历/农历）、出生年月日（1900–2100）、出生时间（必填）、出生地（选填）。
- 选择农历后出现「该月为闰月」勾选项，且日上限收紧为 30。
- 出生地为省/市/区三级联动，数据来自 `public/data/china-regions.json`，运行时追加「海外」；直辖市、「市辖区」「县」等层级会做展示简化；最终只把拼接后的文本存入档案。数据加载失败时保留原有文本并禁用选择器。
- 校验：姓名跨档案唯一（忽略大小写与多余空格）、日期合法性、出生时间必填。
- 保存后自动将该档案设为当前档案，并 `replace` 回退出目标（不留历史记录）。
- 编辑态额外显示「删除这份档案」（二次确认）。
- 退出目标由 `?return=` 决定：`interpretation` → 国心解读；`profiles` → 我的档案；缺省 → `index.html#menu`（首页并自动打开抽屉）。

### 9. 个人资料与设置 `settings.html`

- 昵称（≤12 字）本地保存，头像取昵称首字，实时预览。
- 字体大小三档（小 / 标准 / 大），保存后全站生效，切换即时反馈。
- 「添加客服微信」→ `wechat-simulator.html?context=customer-service&return=./settings.html`。

### 10. 专业排盘 `chart-prototypes.html`

- 四列宫格展示 13 个排盘法门：生平子时、遁甲学、决策学、阴盘决策、梅花学、逻辑学、星像学、姓名学、数字规律、山向决策、玄空飞星、观复字库（标「外部」）、康熙字典；另提供 1 个万年历工具入口。
- 排盘法门配独立国风线性图标，点击 → `chart-entry.html?method=<id>`；万年历点击 → `calendar.html`。
- 顶部「排盘记录」当前仅 toast「暂无排盘记录」（占位）。
- 微信咨询 Banner → `wechat-simulator.html?context=chart&return=./chart-prototypes.html`。

### 11. 排盘信息 `chart-entry.html`

- 根据 `?method=` 动态渲染标题、分类、图标、描述、表单字段与提交按钮文案；`method` 缺失或非法时 `replace` 回排盘列表。
- 字段类型支持 text / number / datetime-local / select / textarea / checkbox，并区分必填与选填。
- 提交仅做前端必填校验，成功后 toast「信息已保存，排盘算法将在下一阶段接入」——**不落库、不跳转、无结果页**。
- 右上「咨询」→ 微信模拟页（`context=chart`，返回当前法门表单）。

### 12. 微信模拟页 `wechat-simulator.html`

一页四态，由 `?context=` 决定文案与返回目标，全部为模拟，不发送任何外部请求。

| context                               | 场景     | 返回目标                 | 副作用                                                          |
| ------------------------------------- | ------ | -------------------- | ------------------------------------------------------------ |
| 缺省（带 `return=./interpretation.html…`） | 报告免费领取 | 原报告页                 | **调用 `claimFreeReport()` 解锁全部八章**，写入 1 条 ¥0、状态 `claimed` 的订单 |
| `chart`                               | 排盘咨询   | 排盘列表 / 排盘表单（校验为站内地址） | 无                                                            |
| `learning-materials`                  | 学习资料领取 | 首页                   | 无                                                            |
| `customer-service`                    | 客服答疑   | 设置页                  | 无                                                            |

---

## 四、页面跳转关系

### 4.1 全局导航图

```text
                         ┌──────────────────────────┐
                         │        index.html        │  首页（枢纽）
                         │  指引 / 入口 / 提问 / 抽屉  │
                         └──┬───┬───┬───┬────────┬───┘
                                 │   │   │        │  提问发送
                                 │   │   │        └──────────────┐
                                 │   │   │                       ▼
                                 │   │   └──► wechat-simulator   chat.html
                                 │   │        ?context=learning  （通用对话）
                                 │   │                             │
              专业排盘           │   │  国心解读                    │ 报告上下文卡片
   ┌────────────────────────────┘   └────────────┐               │
   ▼                                             ▼               ▼
chart-prototypes.html                    interpretation.html ◄────┘
（十三法门 + 万年历）                      （档案选择 ⇄ 报告阅读）
   │  ├─► calendar.html（万年历）              │  ├─► reports.html（顶部「报告」）
   │  ├─► wechat-simulator?context=chart      │  ├─► profile.html?return=interpretation
   ▼                                          │  ├─► report-chat.html?report=&section=
chart-entry.html                              │  └─► wechat-simulator（免费领取 → 解锁）
（排盘表单，终点）                              │
   └─► wechat-simulator?context=chart         │
                                              ▼
抽屉入口 ──► profiles.html ──► profile.html    report-chat.html
        └──► reports.html  ──► interpretation.html?report=
        └──► settings.html ──► wechat-simulator?context=customer-service
```

### 4.2 跳转明细表

| 起点   | 触发元素              | 目标                                                                      | 方式                       |
| ---- | ----------------- | ----------------------------------------------------------------------- | ------------------------ |
| 首页   | 专业排盘卡             | `chart-prototypes.html`                                                 | JS 跳转                    |
| 首页   | 国心解读卡             | `interpretation.html`                                                   | JS 跳转                    |
| 首页   | 学习资料卡             | `wechat-simulator.html?context=learning-materials&return=./index.html`  | JS 跳转                    |
| 首页   | 发送问题              | `chat.html`                                                             | 先写会话再跳转                  |
| 首页   | 抽屉·头像/昵称          | `settings.html`                                                         | 链接                       |
| 首页   | 抽屉·我的档案           | `profiles.html`                                                         | 链接                       |
| 首页   | 抽屉·我的报告           | `reports.html`                                                          | 链接                       |
| 首页   | 抽屉·对话记录项          | `chat.html`                                                             | 设为活动会话后跳转                |
| 首页   | `?reportChat` 旧参数 | `chat.html`                                                             | `location.replace` 兼容重定向 |
| 对话页  | 报告上下文「返回查看报告」     | `interpretation.html?report=…#report-section-…`                         | 链接                       |
| 国心解读 | 顶部「报告」            | `reports.html`                                                          | JS 跳转                    |
| 国心解读 | 「新增」              | `profile.html?return=interpretation`                                    | 链接                       |
| 国心解读 | 生成/查看报告           | 同页切换为阅读态                                                                | `pushState`              |
| 国心解读 | 章节「继续问」           | `report-chat.html?report=&section=`                                     | JS 跳转                    |
| 国心解读 | 领取卡片微信按钮          | `wechat-simulator.html?return=./interpretation.html…`                   | JS 跳转                    |
| 我的报告 | 报告卡 / 新增 / 空态     | `interpretation.html?report=` / `?mode=select` / 无参                     | 链接                       |
| 我的档案 | 编辑 / 新增           | `profile.html?id=&return=profiles` / `?return=profiles`                 | 链接                       |
| 档案表单 | 保存 / 删除           | `?return` 指定的页面                                                         | `location.replace`       |
| 设置页  | 添加客服微信            | `wechat-simulator.html?context=customer-service&return=./settings.html` | 链接                       |
| 专业排盘 | 法门卡 / Banner      | `chart-entry.html?method=` / 微信模拟页                                      | 链接                       |
| 专业排盘 | 万年历卡             | `calendar.html`                                                             | 链接                       |
| 排盘表单 | 咨询 / 非法 method    | 微信模拟页 / `chart-prototypes.html`                                         | 链接 / `replace`           |
| 各子页  | 顶部返回键             | 浏览器上一页（无历史时回落站内地址）                                                      | `history.back()`         |

### 4.3 关键业务流程

**流程 A — MVP 首次咨询**

```
首页 → 未登录时进入手机号模拟登录 → 无档案时填写现有出生信息
→ 返回首页 → 国心解读直接进入新的空白 chat.html
→ 用户自行提问后触发 700ms 模拟回复 → 会话按日期归档
```

**流程 B — 生成并解锁报告（付费主线）**

```
首页「国心解读」→ 无档案 → profile.html?return=interpretation → 保存档案
→ 回到 interpretation → 选择档案 → 生成我的报告（550ms）
→ 阅读态：总览 + 八章试读 → 2 秒后弹出免费领取卡片
   ├─ 关闭 → 顶部常驻「免费领取」按钮 → 继续付费流程
   │      → 吸底购买条 / 单章按钮 → 支付弹层 → 确认支付 → 解锁
   └─ 点微信按钮 → wechat-simulator → 返回 → 八章全解锁（¥0 订单）
→ 已解锁章节「针对本章继续问」→ report-chat.html → 返回原章节锚点
```

**流程 C — 档案变更后的版本管理**

```
编辑档案（改动任一出生信息）→ 快照指纹变化
→ 国心解读档案卡显示「档案已更新」
→ 可「生成新版报告」（旧版及其解锁权益保留）或「查看上一版报告」
→ 所有版本都能在「我的报告」里找到；删除档案不会删除已生成报告
```

**流程 D — 专业排盘（当前为半流程）**

```
首页「专业排盘」→ 十三法门宫格 → 选择法门 → 动态表单
→ 提交 → 仅前端校验 + toast 提示 → 流程终止（无算法、无结果页、无记录）
```

---

## 五、数据与状态模型

全部状态写入 `localStorage`（不可用时退化为当前页面内存），核心能力由 `src/js/shared.js` 的 `window.GuoxueApp` 暴露。

| 存储键                                                    | 内容                                        | 上限                  |
| ------------------------------------------------------ | ----------------------------------------- | ------------------- |
| `guoxueProfilesV2` / `guoxueActiveProfileV2`           | 八字档案与当前档案                                 | 20 份                |
| `guoxueConversationsV2` / `guoxueActiveConversationV2` | 会话与当前会话                                   | 90 个会话 / 每会话 40 条消息 |
| `guoxueInterpretationReportsV1`                        | 国心解读报告                                    | 30 份                |
| `guoxueInterpretationOrdersV1`                         | 模拟订单（支付 / 领取）                             | 100 条               |
| `guoxueFirstReportClaimPromptV1`                       | 免费领取状态 `{ prompted, claimed, claimedAt }` | —                   |
| `guoxueUserPreferencesV1`                              | 昵称、字号                                     | —                   |
| `guoxueDailyQuotaV2` / `guoxueStorageMigrationV2`      | 额度残留值、旧数据迁移标记                             | —                   |

要点：

- **报告绑定档案快照指纹**（对出生信息做哈希）。同一快照复用已有报告；档案一改即形成新版本，旧版权益不受影响。
- **额度与运营标签解耦**：`getQuota()` 恒返回无限；「限时免费」只是 `getPromotionBadge()` 的展示配置。历史数据中的 `remaining: 0` 不再生效。
- **会话上下文**：带 `context: { reportId, sectionId, sectionTitle }` 的会话属于报告章节线程，被首页对话记录过滤掉。
- 首次进入会自动迁移 V1 版聊天记录（`sessionStorage`）到新结构。

---

## 六、当前边界与占位功能

以下为「有 UI、无真实能力」的部分，接入正式服务时需要替换：

| 能力        | 现状                                     |
| --------- | -------------------------------------- |
| AI 回答     | 本地 5 组关键词规则 + 兜底文案，700ms 模拟延迟          |
| 报告内容      | 8 章文案为固定模板，仅总览带入档案姓名，不做真实命理推演          |
| 支付        | 模拟支付，仅改写本地解锁状态并写入订单记录                  |
| 微信 / 企业微信 | 统一走本地 `wechat-simulator.html`，不做任何外部跳转 |
| 排盘算法      | 仅完成「选法门 → 填信息 → 提交校验」，无换算、无盘面、无结果页     |
| 排盘记录      | 固定 toast「暂无排盘记录」                       |
| 学习资料      | 直接跳微信模拟页，无内容页                          |
| 语音输入      | 首页麦克风无响应；对话页提示「开发中」                    |
| 八字换算      | 档案只存用户填写值，不做公历/农历互算                    |
| 账号体系      | 无登录，昵称仅为本地偏好；换设备/清缓存数据即丢失              |

---

## 七、已知问题与修复记录（代码实测）

### 7.1 已修复

| 级别 | 位置                          | 问题                                             | 修复方式                                                                            | 分支                                |
| -- | --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| 高  | `src/js/report-chat.js:100` | 调用 `GuoxueApp.renderQuota()`，`shared.js` 未导出该方法 | `docs/api.md` 明确 quota 业务方法不提供 UI 文案，改为调用既有的 `renderPromotionBadge(quotaDisplay)`。初始化不再抛错，输入/发送/返回监听正常绑定 | `feature/report-chat-send-fix`    |
| 中  | `src/js/profile.js:255`     | 调用 `GuoxueNavigation.goBack()`，实际导出的是 `back()`  | 改为 `window.GuoxueNavigation.back(exitTarget())`，档案表单「取消」按钮恢复可用                    | `feature/chat-profile-fixes`      |
| 中  | `src/js/interpretation.js`  | 报告阅读态用 `replaceState` 未压历史栈，返回键直接跳回入口页          | `openReport` 增加 `push` 选项，页面内进入阅读态时 `pushState`；新增 `popstate` 监听按 URL 还原视图        | `feature/interpretation-back-fix` |
| 低  | `src/js/chat.js:20-60`      | 关键词回复规则与 `chat-replies.js` 完全重复                 | 删除重复规则改为复用 `GuoxueChatReplies.getReply()`，并在 `chat.html` 补加载 `chat-replies.js`   | `feature/chat-profile-fixes`      |

### 7.2 返回键行为约定

`interpretation.html` 是同页双态（选择档案态 ⇄ 报告阅读态），返回键行为按入口区分：

| 入口                                   | 进入方式                              | 历史栈处理        | 点返回后            |
| ------------------------------------ | --------------------------------- | ------------ | --------------- |
| 首页 → 国心解读 → 页面内生成/查看报告               | `openReport(report, {push:true})` | `pushState`  | 回到「选择档案」态，再返回回首页 |
| 报告列表 → 某份报告（`?report=xxx`）           | 整页跳转后 `initializePage` 直接开阅读态     | `replaceState` | 直接回报告列表         |
| 直接刷新 / 外部带 `?report=` 打开             | 同上                                | `replaceState` | 回浏览器上一页         |

新增页面内视图切换时，务必同步 `pushState` 与 `popstate` 两侧，否则会重现「返回直接跳出整页」的问题。

---

## 八、相关文档

- `README.md`：安装、运行、数据限制与手动验收清单
- `docs/design.md`：视觉与交互设计原则
- `docs/api.md`：`window.GuoxueApp` / `window.GuoxuePreferences` 本地数据接口说明
- `AGENTS.md`：协作规范（分支、提交、安全限制）
