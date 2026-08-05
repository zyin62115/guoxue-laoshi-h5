const reportState = window.GuoxueApp;

const REPORT_SECTIONS = [
  {
    id: "self",
    title: "认识自己",
    keywords: ["自我认知", "优势天赋", "成长课题"],
    teaser:
      "你习惯在行动前反复确认，也因此拥有比多数人更稳健的判断力。真正需要突破的，是对错误的过度担心。",
    lockedItems: ["性格底色", "优势天赋", "潜在盲区", "成长方向"],
    content: {
      conclusion:
        "你重视秩序与确定感，往往先观察、再判断、最后行动。这样的节奏让你不容易被表象带走，也使你在复杂局面中更能守住自己的标准。",
      strengths:
        "洞察细腻、责任感强，擅长把零散信息整理成可执行的步骤。面对需要长期投入的事情，你通常比追求短期速度的人更有耐力。",
      blindSpots:
        "对结果负责的愿望有时会变成对错误的过度担心，让你在机会出现时反复验证。越重要的选择，越需要为自己保留试错空间。",
      actions:
        "练习用“小范围尝试”代替一次做对：先设定可承受的边界，再行动、复盘、调整。每周记录一次主动表达或快速决定，逐步建立对自己的信任。",
    },
  },
  {
    id: "career",
    title: "事业路径",
    keywords: ["职业方向", "发展节奏", "影响力"],
    teaser:
      "你更适合在拥有自主判断空间的环境中发展。相比短期竞争，长期积累专业影响力更容易形成优势。",
    lockedItems: ["职业优势", "适合领域", "发展阶段", "行动重点"],
    content: {
      conclusion:
        "你的事业优势来自专业深度与稳定交付。当角色允许你理解问题、建立方法并持续优化时，你更容易做出不可替代的价值。",
      strengths:
        "适合需要判断、规划、研究、协调或长期经营的工作。你能够发现流程中的缺口，并把经验沉淀成让团队反复使用的方法。",
      blindSpots:
        "过度等待条件成熟，可能让你错过展示能力的窗口。职业选择也不宜只看安全感，需要同时判断成长空间和自主程度。",
      actions:
        "未来三个月选定一个可公开展示的专业成果，固定节奏推进并主动获取反馈。把“被看见”作为专业建设的一部分，而不是额外负担。",
    },
  },
  {
    id: "wealth",
    title: "你的财富",
    keywords: ["积累方式", "消费倾向", "风险边界"],
    teaser:
      "你的财富更适合通过稳定能力和长期复利逐步积累。清晰的目标与边界，比追逐短期机会更能带来安全感。",
    lockedItems: ["财富观念", "积累方式", "消费模式", "风险提示"],
    disclaimer: "本章节仅提供生活规划参考，不构成投资或财务建议。",
    content: {
      conclusion:
        "你对财富的核心需求是可控与安心，适合通过稳定现金流、持续提升能力和长期规划建立基础，而非依赖高波动机会。",
      strengths:
        "对成本和风险较敏感，愿意为真正长期有用的事投入。只要目标清楚，你通常能够保持纪律并逐渐看见积累成果。",
      blindSpots:
        "焦虑时可能过度保守，也可能通过临时消费补偿压力。任何重大财务决定都应回到现实数据、期限与承受能力。",
      actions:
        "把资金分为日常、保障、成长与长期目标四类，先建立稳定规则，再定期复盘。涉及投资和借贷时，请咨询具备资质的专业人士。",
    },
  },
  {
    id: "love",
    title: "爱与关系",
    keywords: ["情感需求", "沟通方式", "关系课题"],
    teaser:
      "你在关系中重视可靠与理解，真正打动你的往往不是热烈表达，而是对方能否在细节里持续回应。",
    lockedItems: ["亲密需求", "相处模式", "沟通课题", "关系建议"],
    content: {
      conclusion:
        "你需要稳定、真诚且能够彼此尊重边界的关系。确定感建立后，你愿意长期投入，也会用实际行动照顾重要的人。",
      strengths:
        "善于观察对方的需要，承诺感强，能够在关系中承担责任。你对细节的敏感也让你更容易发现未被说出的情绪。",
      blindSpots:
        "担心冲突时，你可能把真实需求藏在体谅之后，直到失望累积。关系中的安全感不能只靠猜测，需要通过表达共同建立。",
      actions:
        "用“事实—感受—需要—请求”表达重要议题，避免在情绪最高点下结论。每周安排一次不解决问题、只交换近况的沟通。",
    },
  },
  {
    id: "social",
    title: "家人与社交",
    keywords: ["家庭互动", "人际边界", "支持网络"],
    teaser:
      "你在人际中看重真诚与分寸，朋友圈不一定庞大，却倾向维护少数稳定关系。学会设边界会让连接更轻松。",
    lockedItems: ["家庭角色", "社交特点", "人际边界", "冲突处理"],
    content: {
      conclusion:
        "你倾向在关系里承担协调和照顾的角色，珍惜长期信任。真正适合你的社交不是高频热闹，而是能够坦诚交流的稳定连接。",
      strengths:
        "可靠、有分寸，容易成为别人愿意倾诉和托付事情的对象。你能察觉群体氛围，并在冲突中找到双方都可接受的空间。",
      blindSpots:
        "习惯照顾他人可能让自己的需要被放到最后。若总靠沉默维持和气，关系会逐渐变成单方面消耗。",
      actions:
        "区分“我愿意”与“我应该”，对超出能力的请求及时说明边界。把时间留给能够相互回应、而非只向你索取的关系。",
    },
  },
  {
    id: "energy",
    title: "身体与能量",
    keywords: ["精力节奏", "压力反应", "日常调节"],
    teaser:
      "你的状态容易受到持续压力与作息变化影响。规律恢复、减少长期紧绷，比偶尔一次彻底放松更重要。",
    lockedItems: ["精力节奏", "压力信号", "恢复方式", "生活建议"],
    disclaimer: "本章节不提供疾病判断，不能替代医生诊断或治疗建议。",
    content: {
      conclusion:
        "你的能量更适合稳定分配，而不是长期透支后集中休息。精神持续紧绷时，身体往往会先通过疲惫和注意力下降提醒你。",
      strengths:
        "一旦建立规律，你能够长期维持良好习惯。安静、可预期的恢复活动，比强刺激的放松方式更容易让你真正充电。",
      blindSpots:
        "投入事情后容易忽略疲劳信号，把休息推迟到任务结束。长期如此会降低判断质量，也可能放大情绪波动。",
      actions:
        "固定睡眠和轻度活动时间，为高专注任务预留间歇。若出现持续或明显不适，请及时就医，本报告不能替代专业诊疗。",
    },
  },
  {
    id: "cycle",
    title: "人生周期",
    keywords: ["当前阶段", "转换信号", "成长节奏"],
    teaser:
      "你正逐渐从证明能力转向建立自己的节奏。此阶段真正重要的，是选择值得长期投入的人与方向。",
    lockedItems: ["阶段主题", "当前重点", "转换信号", "未来准备"],
    content: {
      conclusion:
        "你当前的主题是从被动回应外界标准，逐步转向建立自己的优先顺序。减少分散投入，会让积累更快形成可见成果。",
      strengths:
        "过去积累的判断力开始形成稳定方法，你比以前更清楚什么值得坚持，也更能识别不适合自己的节奏。",
      blindSpots:
        "阶段转换时容易一边想要变化，一边留恋熟悉的确定感。若所有可能都保留，真正重要的方向反而得不到资源。",
      actions:
        "为未来一年确定一个主要建设方向和两个辅助目标，每季度检查投入是否一致。把结束不再适合的事项视为成长的一部分。",
    },
  },
  {
    id: "choices",
    title: "重大选择",
    keywords: ["决策方式", "时机判断", "风险控制"],
    teaser:
      "面对重大选择，你需要的不是一次得到完美答案，而是先看清不可妥协的条件，再用小步验证降低风险。",
    lockedItems: ["判断维度", "时机识别", "风险边界", "决策步骤"],
    disclaimer: "本章节仅提供自我梳理框架，重要决定仍需结合现实信息与专业意见。",
    content: {
      conclusion:
        "你适合用结构化方式处理重大选择：先确认核心目标，再排除不可接受的条件，最后比较现实成本，而不是只等待直觉变得确定。",
      strengths:
        "能够看到长期影响，也愿意为决定承担责任。信息充足时，你的判断通常稳健，并能兼顾现实条件和个人价值。",
      blindSpots:
        "追求完美确定会延长犹豫，收集更多信息未必继续提高判断质量。重要决定也不应由命理内容替你作出。",
      actions:
        "写下三个不可妥协条件、三个可调整条件和最坏情况下的应对方案；能试行的先小范围验证，再设明确期限作出决定。",
    },
  },
];

const setup = document.querySelector("#report-setup");
const reader = document.querySelector("#report-reader");
const profileList = document.querySelector("#report-profile-list");
const generateButton = document.querySelector("#generate-report");
const viewPreviousButton = document.querySelector("#view-previous-report");
const setupReportHistory = document.querySelector("#setup-report-history");
const reportActionNote = document.querySelector("#report-action-note");
const historyButton = document.querySelector("#report-history-button");
const sectionList = document.querySelector("#report-section-list");
const overview = document.querySelector("#report-overview");
const profileName = document.querySelector("#report-profile-name");
const reportMeta = document.querySelector("#report-meta");
const reportProgress = document.querySelector("#report-progress");
const stickyPurchase = document.querySelector("#report-sticky-purchase");
const stickyLabel = document.querySelector("#sticky-purchase-label");
const stickyPrice = document.querySelector("#sticky-purchase-price");
const stickyButton = document.querySelector("#sticky-purchase-button");
const paymentLayer = document.querySelector("#report-payment-layer");
const paymentSheet = document.querySelector(".report-payment-sheet");
const paymentFullPrice = document.querySelector("#payment-full-price");
const paymentSectionOption = document.querySelector("#payment-section-option");
const paymentSectionTitle = document.querySelector("#payment-section-title");
const paymentConfirm = document.querySelector("#payment-confirm");
const claimLayer = document.querySelector("#first-report-claim-layer");
const claimCard = document.querySelector(".first-report-claim-card");
const claimWechatButton = document.querySelector("#claim-wechat-button");
const toast = document.querySelector("#report-toast");

let selectedProfileId = reportState.getActiveProfileId();
let activeReport = null;
let purchaseSectionId = null;
let toastTimer = null;
let paymentOpener = null;
let claimOpener = null;
let claimTimer = null;

function formatMoney(cents) {
  const amount = cents / 100;
  return `¥${Number.isInteger(amount) ? amount : amount.toFixed(1)}`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function formatProfile(profile) {
  const { year, month, day } = profile.birthDate;
  const calendar = profile.calendar === "lunar" ? "农历" : "公历";
  const birthplace = profile.birthplace ? ` · ${profile.birthplace}` : "";
  return `${calendar} ${year}年${month}月${day}日 · ${profile.birthTime}${birthplace}`;
}

function getProfileReportState(profileId) {
  const currentReport = reportState.getCurrentProfileReport(profileId);
  const latestReport = reportState.getLatestProfileReport(profileId);
  return {
    currentReport,
    latestReport,
    status: currentReport ? "current" : latestReport ? "stale" : "empty",
  };
}

function syncSelectedProfileActions() {
  const profile = reportState.getProfile(selectedProfileId);
  if (!profile) {
    generateButton.disabled = true;
    viewPreviousButton.hidden = true;
    return;
  }

  const state = getProfileReportState(profile.id);
  generateButton.disabled = false;
  viewPreviousButton.hidden = state.status !== "stale";
  if (state.status === "current") {
    generateButton.textContent = "查看报告";
    reportActionNote.textContent = "这份档案已有报告，打开后可继续阅读，不会重复生成";
  } else if (state.status === "stale") {
    generateButton.textContent = "生成新版报告";
    reportActionNote.textContent = "档案信息已更新，旧版报告仍会保留";
  } else {
    generateButton.textContent = "生成我的报告";
    reportActionNote.textContent = "出生信息仅保存在当前浏览器，生成后可长期查看";
  }
}

function renderProfiles() {
  const profiles = reportState.getProfiles();
  const hasReports = reportState.getReports().length > 0;
  setupReportHistory.hidden = profiles.length > 0 || !hasReports;
  if (!profiles.length) {
    profileList.innerHTML = `
      <a class="report-profile-empty pressable" href="./profile.html">
        <strong>还没有八字档案</strong>
        <span>添加出生信息后即可生成专属报告</span>
      </a>`;
    generateButton.disabled = true;
    viewPreviousButton.hidden = true;
    reportActionNote.textContent = hasReports
      ? "原档案已删除，历史报告仍可继续查看"
      : "新增档案后即可生成专属解读";
    return;
  }

  if (!profiles.some((profile) => profile.id === selectedProfileId)) {
    selectedProfileId = profiles[0].id;
  }
  profileList.replaceChildren(
    ...profiles.map((profile) => {
      const label = document.createElement("label");
      label.className = "report-profile-card pressable";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "report-profile";
      input.value = profile.id;
      input.checked = profile.id === selectedProfileId;
      const avatar = document.createElement("span");
      avatar.className = "report-profile-avatar";
      avatar.textContent = profile.name.slice(0, 1);
      const copy = document.createElement("span");
      copy.className = "report-profile-copy";
      const name = document.createElement("strong");
      name.textContent = profile.name;
      const detail = document.createElement("small");
      detail.textContent = formatProfile(profile);
      const reportStatus = document.createElement("span");
      reportStatus.className = "report-profile-status";
      const state = getProfileReportState(profile.id);
      reportStatus.dataset.status = state.status;
      reportStatus.textContent =
        state.status === "current"
          ? "已有报告"
          : state.status === "stale"
            ? "档案已更新"
            : "未生成";
      copy.append(name, detail, reportStatus);
      const check = document.createElement("i");
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
      label.append(input, avatar, copy, check);
      return label;
    }),
  );
  syncSelectedProfileActions();
}

function reportPayload(profile) {
  return {
    overview: `${profile.name}，从你本次档案呈现出的整体特点来看，你的力量来自细腻观察、稳定判断和长期积累。你不必急着给人生下结论，先看见自己的真实节奏，再把优势用在值得投入的方向上。`,
    sections: REPORT_SECTIONS,
  };
}

function isUnlocked(sectionId) {
  return Boolean(
    activeReport?.fullUnlocked || activeReport?.unlockedSectionIds.includes(sectionId),
  );
}

function createContentBlock(title, text) {
  const block = document.createElement("section");
  block.className = "report-content-block";
  const heading = document.createElement("h4");
  heading.textContent = title;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  block.append(heading, paragraph);
  return block;
}

function createSectionCard(section, index) {
  const unlocked = isUnlocked(section.id);
  const card = document.createElement("article");
  card.className = `interpretation-section-card ${unlocked ? "is-unlocked" : "is-locked"}`;
  card.id = `report-section-${section.id}`;

  const header = document.createElement("header");
  header.innerHTML = `
    <span>${String(index + 1).padStart(2, "0")}</span>
    <div><h3>${section.title}</h3><p>${section.keywords.join(" · ")}</p></div>
    <i>${unlocked ? "已解锁" : "试读"}</i>`;

  const teaser = document.createElement("p");
  teaser.className = "report-section-teaser";
  teaser.textContent = section.teaser;
  card.append(header, teaser);

  if (unlocked) {
    const content = document.createElement("div");
    content.className = "report-section-content";
    content.append(
      createContentBlock("核心结论", section.content.conclusion),
      createContentBlock("优势天赋", section.content.strengths),
      createContentBlock("潜在盲区", section.content.blindSpots),
      createContentBlock("行动建议", section.content.actions),
    );
    if (section.disclaimer) {
      const disclaimer = document.createElement("p");
      disclaimer.className = "report-disclaimer";
      disclaimer.textContent = section.disclaimer;
      content.append(disclaimer);
    }

    const teacherPrompt = document.createElement("div");
    teacherPrompt.className = "section-teacher-prompt";
    teacherPrompt.innerHTML = `
      <img src="../../public/images/teacher-avatar-centered.png" alt="" />
      <div><strong>关于这一章，你还想了解什么？</strong><span>我会结合报告内容继续为你解读。</span></div>`;
    const ask = document.createElement("button");
    ask.className = "section-ask-button pressable";
    ask.type = "button";
    ask.dataset.askSection = section.id;
    ask.textContent = "针对本章继续问";
    card.append(content, teacherPrompt, ask);
  } else {
    const locked = document.createElement("div");
    locked.className = "report-locked-content";
    const label = document.createElement("span");
    label.textContent = "解锁后可查看";
    const list = document.createElement("p");
    list.textContent = section.lockedItems.join("、");
    const button = document.createElement("button");
    button.className = "section-purchase-button pressable";
    button.type = "button";
    button.dataset.purchaseSection = section.id;
    const upgradePrice = reportState.getReportUpgradePrice(activeReport);
    button.textContent =
      upgradePrice < reportState.REPORT_SECTION_PRICE
        ? `${formatMoney(upgradePrice)} 补全完整报告`
        : "解锁本章 ¥16.8";
    locked.append(label, list, button);
    card.append(locked);
  }
  return card;
}

function renderReport() {
  if (!activeReport) return;
  setup.hidden = true;
  reader.hidden = false;
  const unlockedCount = activeReport.fullUnlocked
    ? activeReport.sections.length
    : activeReport.unlockedSectionIds.length;
  overview.textContent = activeReport.overview;
  const sourceProfile = reportState.getProfile(activeReport.profileId);
  const currentReport = sourceProfile
    ? reportState.getCurrentProfileReport(activeReport.profileId)
    : null;
  const versionLabel = !sourceProfile
    ? "历史报告 · 原档案已删除"
    : currentReport?.id === activeReport.id
      ? ""
      : "历史版本";
  profileName.textContent = `${activeReport.profileSnapshot.name}${versionLabel ? ` · ${versionLabel}` : ""}`;
  reportMeta.textContent = `${formatProfile({
    ...activeReport.profileSnapshot,
    id: activeReport.profileId,
  })} · ${new Date(activeReport.createdAt).toLocaleDateString("zh-CN")}`;
  reportProgress.innerHTML = `<strong>已解锁 ${unlockedCount}/8</strong><span>${
    activeReport.fullUnlocked ? "完整报告已解锁" : "每章均可免费试读"
  }</span>`;
  sectionList.replaceChildren(...activeReport.sections.map(createSectionCard));

  stickyPurchase.hidden = activeReport.fullUnlocked;
  document.body.classList.toggle("has-report-purchase", !activeReport.fullUnlocked);
  if (!activeReport.fullUnlocked) {
    const price = reportState.getReportUpgradePrice(activeReport);
    stickyLabel.textContent = unlockedCount ? `已抵扣 ${formatMoney(unlockedCount * 1680)}` : "一次解锁全部八章";
    stickyPrice.textContent = formatMoney(price);
    stickyButton.textContent = unlockedCount ? "补全完整报告" : "解锁完整报告";
  }
}

function openReport(report) {
  activeReport = report;
  const url = new URL(window.location.href);
  url.searchParams.set("report", report.id);
  url.searchParams.delete("mode");
  window.history.replaceState(null, "", url);
  renderReport();
  const hashId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
  const hashTarget = hashId ? document.getElementById(hashId) : null;
  if (hashTarget) {
    requestAnimationFrame(() => hashTarget.scrollIntoView({ behavior: "auto", block: "start" }));
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

function showProfileSelection() {
  activeReport = null;
  selectedProfileId = reportState.getActiveProfileId();
  setup.hidden = false;
  reader.hidden = true;
  stickyPurchase.hidden = true;
  document.body.classList.remove("has-report-purchase");
  renderProfiles();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function openPayment(sectionId = null) {
  if (!activeReport) return;
  purchaseSectionId = sectionId;
  const upgradePrice = reportState.getReportUpgradePrice(activeReport);
  const canBuySection =
    Boolean(sectionId) && upgradePrice >= reportState.REPORT_SECTION_PRICE;
  paymentSectionOption.hidden = !canBuySection;
  paymentSectionTitle.textContent = canBuySection
    ? `单章解锁 · ${activeReport.sections.find((item) => item.id === sectionId)?.title}`
    : "单章解锁";
  paymentFullPrice.textContent = formatMoney(upgradePrice);
  paymentOpener = document.activeElement;
  paymentLayer.querySelector(`[value="${canBuySection ? "section" : "full"}"]`).checked = true;
  syncPaymentButton();
  paymentLayer.classList.add("is-visible");
  paymentLayer.setAttribute("aria-hidden", "false");
  document.body.classList.add("payment-open");
  window.setTimeout(() => paymentSheet.focus({ preventScroll: true }), 80);
}

function closePayment() {
  paymentLayer.classList.remove("is-visible");
  paymentLayer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("payment-open");
  if (paymentOpener instanceof HTMLElement) {
    paymentOpener.focus({ preventScroll: true });
  }
  paymentOpener = null;
}

function syncPaymentButton() {
  const type = paymentLayer.querySelector('[name="payment-option"]:checked')?.value || "full";
  const amount =
    type === "section"
      ? reportState.REPORT_SECTION_PRICE
      : reportState.getReportUpgradePrice(activeReport);
  paymentConfirm.textContent = `确认支付 ${formatMoney(amount)}`;
}

function openFirstReportClaim() {
  if (!reportState.shouldShowFirstReportClaim()) return;
  claimOpener = document.activeElement;
  claimLayer.classList.add("is-visible");
  claimLayer.setAttribute("aria-hidden", "false");
  document.body.classList.add("claim-open");
  window.setTimeout(() => claimCard.focus({ preventScroll: true }), 80);
}

function scheduleFirstReportClaim() {
  if (!reportState.shouldShowFirstReportClaim() || claimTimer) return;
  claimTimer = window.setTimeout(() => {
    claimTimer = null;
    openFirstReportClaim();
  }, 5000);
}

function closeFirstReportClaim(action = "closed") {
  reportState.dismissFirstReportClaim(action);
  claimLayer.classList.remove("is-visible");
  claimLayer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("claim-open");
  if (claimOpener instanceof HTMLElement) {
    claimOpener.focus({ preventScroll: true });
  }
  claimOpener = null;
}

profileList.addEventListener("change", (event) => {
  if (event.target.name !== "report-profile") return;
  selectedProfileId = event.target.value;
  reportState.setActiveProfile(selectedProfileId);
  syncSelectedProfileActions();
});

generateButton.addEventListener("click", () => {
  const profile = reportState.getProfile(selectedProfileId);
  if (!profile) return;
  const currentReport = reportState.getCurrentProfileReport(profile.id);
  if (currentReport) {
    openReport(currentReport);
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "老师正在整理报告…";
  window.setTimeout(() => {
    const existingReport = reportState.getCurrentProfileReport(profile.id);
    const report = existingReport || reportState.getOrCreateReport(profile.id, reportPayload(profile));
    const wasCreated = Boolean(report && !existingReport);
    generateButton.disabled = false;
    if (report) {
      openReport(report);
      if (wasCreated) scheduleFirstReportClaim();
    } else {
      syncSelectedProfileActions();
      showToast("暂时无法生成报告，请稍后重试");
    }
  }, 550);
});

viewPreviousButton.addEventListener("click", () => {
  const report = reportState.getLatestProfileReport(selectedProfileId);
  if (report) openReport(report);
  else showToast("没有找到可查看的旧版报告");
});

historyButton.addEventListener("click", () => {
  window.location.href = "./reports.html";
});

sectionList.addEventListener("click", (event) => {
  const purchase = event.target.closest("[data-purchase-section]");
  if (purchase) {
    const upgradePrice = reportState.getReportUpgradePrice(activeReport);
    openPayment(upgradePrice < reportState.REPORT_SECTION_PRICE ? null : purchase.dataset.purchaseSection);
    return;
  }
  const ask = event.target.closest("[data-ask-section]");
  if (!ask) return;
  if (reportState.getQuota().remaining <= 0) {
    showToast("今日免费对话次数已用完，报告仍可继续阅读");
    return;
  }
  reportState.createReportConversation(activeReport.id, ask.dataset.askSection);
  window.location.href = "./index.html?reportChat=1#chat";
});

stickyButton.addEventListener("click", () => openPayment());
paymentLayer.addEventListener("change", syncPaymentButton);
paymentLayer.addEventListener("click", (event) => {
  if (event.target.closest("[data-payment-close]")) closePayment();
});
paymentConfirm.addEventListener("click", () => {
  const type = paymentLayer.querySelector('[name="payment-option"]:checked')?.value || "full";
  const result = reportState.purchaseReport(activeReport.id, {
    type,
    sectionId: purchaseSectionId,
  });
  if (!result.ok) {
    showToast(result.reason === "upgrade-cheaper" ? "补全完整报告更加优惠" : "暂时无法完成购买");
    return;
  }
  activeReport = result.report;
  closePayment();
  renderReport();
  showToast(type === "full" ? "完整报告已解锁" : "本章已解锁");
  if (type === "section" && purchaseSectionId) {
    document.querySelector(`#report-section-${purchaseSectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
});

claimLayer.addEventListener("click", (event) => {
  if (event.target.closest("[data-claim-close]")) closeFirstReportClaim();
});
claimWechatButton.addEventListener("click", () => {
  closeFirstReportClaim("wechat");
  const returnTarget = `./interpretation.html${window.location.search}${window.location.hash}`;
  window.location.href = `./wechat-simulator.html?return=${encodeURIComponent(returnTarget)}`;
});

document.addEventListener("keydown", (event) => {
  if (claimLayer.classList.contains("is-visible")) {
    if (event.key === "Escape") {
      closeFirstReportClaim();
      return;
    }
    if (event.key !== "Tab") return;
    const claimFocusable = [...claimCard.querySelectorAll("button:not([disabled])")];
    if (!claimFocusable.length) return;
    const first = claimFocusable[0];
    const last = claimFocusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (!paymentLayer.classList.contains("is-visible")) return;
  if (event.key === "Escape") {
    closePayment();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [...paymentSheet.querySelectorAll("button:not([disabled]), input:not([disabled])")];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function initializePage({ notifyInvalidReport = false } = {}) {
  const url = new URL(window.location.href);
  const reportId = url.searchParams.get("report");
  const requestedReport = reportId ? reportState.getReport(reportId) : null;

  if (requestedReport) {
    openReport(requestedReport);
    return;
  }

  if (reportId) {
    url.searchParams.delete("report");
    window.history.replaceState(null, "", url);
  }

  showProfileSelection();

  if (reportId && notifyInvalidReport) showToast("原报告不存在，已为你返回国心解读");
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) initializePage();
});

window.addEventListener("beforeunload", () => {
  if (claimTimer) window.clearTimeout(claimTimer);
});

initializePage({ notifyInvalidReport: true });
