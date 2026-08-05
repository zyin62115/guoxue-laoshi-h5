const appState = window.GuoxueApp;
const pressables = document.querySelectorAll("[data-action]");
const questionInput = document.querySelector("#home-question");
const actionButton = document.querySelector("#home-action");
const voiceDock = document.querySelector(".voice-dock");
const micButton = document.querySelector('[data-action="voice-mode"]');
const quotaGuide = document.querySelector("#home-quota-guide");
const inlineChat = document.querySelector("#inline-chat");
const chatStartTime = document.querySelector("#chat-start-time");
const messageList = document.querySelector("#inline-message-list");
const scrollTopButton = document.querySelector("#scroll-top-button");
const menuButton = document.querySelector('[data-action="menu"]');
const drawerLayer = document.querySelector("#drawer-layer");
const drawer = document.querySelector("#personal-drawer");
const drawerScrim = document.querySelector(".drawer-scrim");
const conversationList = document.querySelector("#conversation-list");
const appToast = document.querySelector("#app-toast");
const interpretationButton = document.querySelector('[data-action="interpretation"]');
const interpretationDescription = interpretationButton.querySelector(".feature-desc");
const professionalChartButton = document.querySelector('[data-action="professional-chart"]');
const guideDate = document.querySelector("#guide-date");
const guideDateText = document.querySelector("#guide-date-text");
const guideLineOne = document.querySelector("#guide-line-one");
const guideLineTwo = document.querySelector("#guide-line-two");
const guideGood = document.querySelector("#guide-good");
const guideAvoid = document.querySelector("#guide-avoid");

function renderInterpretationEntry() {
  const profile = appState.getActiveProfile();
  if (!profile) {
    interpretationDescription.textContent = appState.getReports().length
      ? "查看历史报告，或创建新档案"
      : "建立档案，获得专属解读";
    return;
  }

  const currentReport = appState.getCurrentProfileReport(profile.id);
  const latestReport = appState.getLatestProfileReport(profile.id);
  if (currentReport) {
    interpretationDescription.textContent = currentReport.fullUnlocked
      ? `${profile.name}已有完整报告，可继续查看`
      : `${profile.name}已有报告，可继续查看`;
  } else if (latestReport) {
    interpretationDescription.textContent = `${profile.name}档案已更新，可生成新版`;
  } else {
    interpretationDescription.textContent = `${profile.name}尚未生成报告`;
  }
}

let isComposing = false;
let isReplying = false;
let replyTimer = null;
let scrollTicking = false;
let isDrawerOpen = false;
let toastTimer = null;
let drawerGesture = null;
let suppressClickUntil = 0;
let dailyGuideTimer = null;

const DAILY_GUIDES = [
  {
    lines: ["顺势而为，稳中求进，保持平和心态，", "善用耐心，方能见长远之效。"],
    good: "静心学习",
    avoid: "急躁冲动",
  },
  {
    lines: ["心定则事明，步稳则路远，", "从容安排，今日自有所得。"],
    good: "整理计划",
    avoid: "仓促决定",
  },
  {
    lines: ["守正而行，专注眼前可为之事，", "日积小功，终能汇成长进。"],
    good: "专注行动",
    avoid: "贪多求快",
  },
  {
    lines: ["言缓则贵，心静则安，", "多听一分，更能看清彼此所需。"],
    good: "坦诚沟通",
    avoid: "意气争辩",
  },
  {
    lines: ["张弛有度，劳逸相宜，", "养足精神，方可从容应对。"],
    good: "规律作息",
    avoid: "过度劳累",
  },
  {
    lines: ["旧事宜清，新机渐显，", "舍去纷扰，才能轻装前行。"],
    good: "清理积压",
    avoid: "反复拖延",
  },
  {
    lines: ["见微知著，先察后行，", "留心细节，可避无谓周折。"],
    good: "核对细节",
    avoid: "粗心大意",
  },
  {
    lines: ["和气能聚，真诚可通，", "以善意相待，自有温暖回应。"],
    good: "关怀他人",
    avoid: "冷言相向",
  },
  {
    lines: ["知止而后定，量力而后行，", "守好边界，心中自会安稳。"],
    good: "量力而行",
    avoid: "勉强逞强",
  },
  {
    lines: ["晨光宜启新章，今日宜立小愿，", "方向既明，行动便有力量。"],
    good: "开启新事",
    avoid: "犹豫不前",
  },
  {
    lines: ["温故可以知新，回望亦为前行，", "总结得失，下一步会更清晰。"],
    good: "复盘总结",
    avoid: "重蹈旧误",
  },
  {
    lines: ["静中有思，独处亦能生慧，", "给心留白，答案自会浮现。"],
    good: "安静独处",
    avoid: "随波逐流",
  },
];

function lunarDayName(day) {
  const days = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
  ];
  return days[Number(day) - 1] || day;
}

function formatGuideDate(date) {
  try {
    const formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    );
    if (parts.month && parts.day) {
      return `${parts.month}${lunarDayName(parts.day)}`;
    }
  } catch (error) {
    // 不支持农历日历的浏览器回退到本地公历日期。
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getDailyGuideIndex(date) {
  const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localDay / 86400000) % DAILY_GUIDES.length;
}

function renderDailyGuide() {
  const now = new Date();
  const guide = DAILY_GUIDES[getDailyGuideIndex(now)];
  guideDate.dateTime = appState.localDateKey(now);
  guideDateText.textContent = formatGuideDate(now);
  guideLineOne.textContent = guide.lines[0];
  guideLineTwo.textContent = guide.lines[1];
  guideGood.textContent = guide.good;
  guideAvoid.textContent = guide.avoid;

  if (dailyGuideTimer) window.clearTimeout(dailyGuideTimer);
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  dailyGuideTimer = window.setTimeout(renderDailyGuide, nextDay.getTime() - now.getTime() + 1000);
}

function clearPressedState(element) {
  element.classList.remove("is-pressed");
}

pressables.forEach((element) => {
  element.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    element.classList.add("is-pressed");
  });

  element.addEventListener("pointerup", () => clearPressedState(element));
  element.addEventListener("pointercancel", () => clearPressedState(element));
  element.addEventListener("pointerleave", () => clearPressedState(element));
  element.addEventListener("blur", () => clearPressedState(element));
});

function getMockReply(question) {
  return window.GuoxueChatReplies.getReply(question);
}

function formatStartedAt(value) {
  const date = new Date(value);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return sameDay
    ? `今天 ${hours}:${minutes}`
    : `${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
}

function createTeacherAvatar() {
  const avatar = document.createElement("img");
  avatar.className = "inline-teacher-avatar";
    avatar.src = "../../public/images/teacher-avatar-centered.png";
  avatar.alt = "";
  return avatar;
}

function createMessageRow(message) {
  const row = document.createElement("article");
  row.className = `inline-message-row ${message.role}`;
  row.dataset.messageId = message.id;

  const body = document.createElement("div");
  body.className = "inline-message-body";

  if (message.role === "assistant") {
    const name = document.createElement("span");
    name.className = "inline-speaker-name";
    name.textContent = "国学老师";
    body.append(name);
    row.append(createTeacherAvatar());
  }

  const bubble = document.createElement("div");
  bubble.className = "inline-message-bubble";
  bubble.textContent = message.content;
  body.append(bubble);
  row.append(body);
  return row;
}

function ensureConversationTime(history) {
  const oldestUser = history.find((message) => message.role === "user");
  const startedAt = appState.ensureChatStartedAt(oldestUser?.createdAt);
  chatStartTime.dateTime = startedAt;
  chatStartTime.textContent = formatStartedAt(startedAt);
}

function renderHistory() {
  const history = appState.getHistory();
  const hasConversation = history.some((message) => message.role === "user");
  inlineChat.hidden = !hasConversation;
  document.body.classList.toggle("has-inline-chat", hasConversation);

  if (!hasConversation) {
    messageList.replaceChildren();
    return history;
  }

  ensureConversationTime(history);
  const fragment = document.createDocumentFragment();
  history.forEach((message) => fragment.append(createMessageRow(message)));
  messageList.replaceChildren(fragment);
  return history;
}

function scrollToLatest(behavior = "smooth") {
  const target = messageList.lastElementChild || chatStartTime;
  if (!target) return;

  requestAnimationFrame(() => {
    const dockTop = voiceDock.getBoundingClientRect().top;
    const targetBottom = target.getBoundingClientRect().bottom;
    const overlap = targetBottom - dockTop + 22;

    if (overlap > 0) {
      window.scrollBy({ top: overlap, behavior });
    }
  });
}

function syncActionState() {
  const hasQuestion = questionInput.value.trim().length > 0;
  const exhausted = appState.getQuota().remaining <= 0;
  const canSend = hasQuestion && !exhausted && !isReplying;

  actionButton.classList.toggle("is-send", canSend);
  actionButton.dataset.action = canSend ? "submit-question" : "more";
  actionButton.setAttribute("aria-label", canSend ? "发送问题" : "更多功能");
}

function syncQuotaState() {
  const quota = appState.getQuota();
  const exhausted = quota.remaining <= 0;

  voiceDock.classList.toggle("is-exhausted", exhausted);
  questionInput.disabled = exhausted || isReplying;
  micButton.disabled = exhausted || isReplying;
  actionButton.disabled = exhausted || isReplying;
  quotaGuide.hidden = !exhausted;
  questionInput.placeholder = exhausted
    ? "限时免费体验已结束"
    : isReplying
      ? "老师正在思考…"
      : "请输入问题";
  syncActionState();
}

function addThinkingRow() {
  const row = document.createElement("article");
  row.className = "inline-message-row assistant inline-thinking";
  row.id = "inline-thinking-row";

  const body = document.createElement("div");
  body.className = "inline-message-body";

  const name = document.createElement("span");
  name.className = "inline-speaker-name";
  name.textContent = "国学老师";

  const bubble = document.createElement("div");
  bubble.className = "inline-message-bubble";
  bubble.append(document.createTextNode("老师正在思考"));

  const dots = document.createElement("span");
  dots.className = "inline-thinking-dots";
  dots.setAttribute("aria-hidden", "true");
  dots.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));

  bubble.append(dots);
  body.append(name, bubble);
  row.append(createTeacherAvatar(), body);
  messageList.append(row);
}

function finishReply(question) {
  document.querySelector("#inline-thinking-row")?.remove();
  const message = appState.appendMessage("assistant", getMockReply(question));
  messageList.append(createMessageRow(message));
  isReplying = false;
  replyTimer = null;
  syncQuotaState();
  renderDrawerContent();
  scrollToLatest();

  if (!questionInput.disabled) questionInput.focus({ preventScroll: true });
}

function scheduleReply(question) {
  if (isReplying) return;

  isReplying = true;
  syncQuotaState();
  addThinkingRow();
  scrollToLatest();
  replyTimer = window.setTimeout(() => finishReply(question), 700);
}

function submitQuestion() {
  if (isReplying || isComposing) return;

  const content = questionInput.value.trim();
  if (!content) {
    syncActionState();
    return;
  }

  const quota = appState.consumeQuota();
  if (!quota) {
    syncQuotaState();
    return;
  }

  const previousConversationId = appState.getActiveConversation()?.id;
  const message = appState.appendMessage("user", content);
  const currentConversationId = appState.getActiveConversation()?.id;
  const history = appState.getHistory();
  ensureConversationTime(history);
  inlineChat.hidden = false;
  document.body.classList.add("has-inline-chat");
  if (previousConversationId && previousConversationId !== currentConversationId) {
    renderHistory();
  } else {
    messageList.append(createMessageRow(message));
  }
  questionInput.value = "";
  syncQuotaState();
  renderDrawerContent();
  scrollToLatest();
  scheduleReply(content);
}

function syncScrollTopButton() {
  const visible = window.scrollY >= window.innerHeight;
  scrollTopButton.classList.toggle("is-visible", visible);
  scrollTopButton.setAttribute("aria-hidden", String(!visible));
  scrollTopButton.tabIndex = visible ? 0 : -1;
}

function queueScrollStateUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    syncScrollTopButton();
    scrollTicking = false;
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  appToast.textContent = message;
  appToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    appToast.classList.remove("is-visible");
  }, 1800);
}

function dateGroupLabel(dateKey) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateKey === appState.localDateKey(today)) return "今天";
  if (dateKey === appState.localDateKey(yesterday)) return "昨天";
  return "更早";
}

function formatConversationDate(conversation) {
  const updated = new Date(conversation.updatedAt);
  if (conversation.dateKey === appState.localDateKey()) {
    return updated.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (conversation.dateKey === appState.localDateKey(yesterday)) {
    return updated.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return `${updated.getMonth() + 1}月${updated.getDate()}日`;
}

function renderConversations() {
  const conversations = appState
    .getConversations()
    .filter(
      (conversation) =>
        !conversation.context &&
        conversation.messages.some((message) => message.role === "user"),
    );
  const activeId = appState.getActiveConversation()?.id;
  const fragment = document.createDocumentFragment();

  if (!conversations.length) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    const symbol = document.createElement("span");
    symbol.textContent = "聊";
    const title = document.createElement("strong");
    title.textContent = "还没有对话记录";
    const description = document.createElement("small");
    description.textContent = "在首页提问后，会自动保存在这里";
    empty.append(symbol, title, description);
    fragment.append(empty);
    conversationList.replaceChildren(fragment);
    return;
  }

  const groups = new Map();
  conversations.forEach((conversation) => {
    const label = dateGroupLabel(conversation.dateKey);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(conversation);
  });

  ["今天", "昨天", "更早"].forEach((label) => {
    const entries = groups.get(label);
    if (!entries?.length) return;

    const group = document.createElement("section");
    group.className = "conversation-group";
    const heading = document.createElement("h3");
    heading.textContent = label;
    group.append(heading);

    entries.forEach((conversation) => {
      const button = document.createElement("button");
      button.className = "conversation-item pressable";
      button.classList.toggle("is-active", conversation.id === activeId);
      button.type = "button";
      button.dataset.conversationId = conversation.id;

      const copy = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = conversation.title;
      const preview = document.createElement("small");
      const lastMessage = conversation.messages.at(-1);
      preview.textContent = lastMessage?.content || "";
      copy.append(title, preview);

      const time = document.createElement("time");
      time.dateTime = conversation.updatedAt;
      time.textContent = formatConversationDate(conversation);
      button.append(copy, time);
      group.append(button);
    });
    fragment.append(group);
  });

  conversationList.replaceChildren(fragment);
}

function renderDrawerContent() {
  renderConversations();
}

function drawerFocusableElements() {
  return [...drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')];
}

function openDrawer(options = {}) {
  if (isDrawerOpen) return;
  isDrawerOpen = true;
  renderDrawerContent();
  drawerLayer.classList.add("is-visible");
  drawerLayer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  menuButton.setAttribute("aria-expanded", "true");
  drawerScrim.tabIndex = 0;
  drawer.style.removeProperty("transform");
  drawerScrim.style.removeProperty("opacity");
  requestAnimationFrame(() => drawerLayer.classList.add("is-open"));
  if (options.focus !== false) {
    window.setTimeout(() => drawer.focus({ preventScroll: true }), 220);
  }
}

function closeDrawer(options = {}) {
  if (!isDrawerOpen && !drawerLayer.classList.contains("is-visible")) return;
  isDrawerOpen = false;
  drawerLayer.classList.remove("is-open", "is-dragging");
  drawerLayer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  menuButton.setAttribute("aria-expanded", "false");
  drawerScrim.tabIndex = -1;
  drawer.style.removeProperty("transform");
  drawerScrim.style.removeProperty("opacity");
  if (globalThis.location.hash === "#menu") {
    window.history.replaceState(null, "", `${location.pathname}${location.search}`);
  }
  window.setTimeout(() => {
    if (!isDrawerOpen) drawerLayer.classList.remove("is-visible");
  }, 320);
  if (options.restoreFocus !== false) menuButton.focus({ preventScroll: true });
}

function setDrawerGestureProgress(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  drawerLayer.classList.add("is-visible", "is-dragging");
  drawer.style.transform = `translate3d(${(clamped - 1) * 100}%, 0, 0)`;
  drawerScrim.style.opacity = String(clamped);
  document.body.classList.add("drawer-open");
  return clamped;
}

function beginDrawerGesture(event, mode) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  drawerGesture = {
    mode,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    lastAt: performance.now(),
    velocity: 0,
    axis: null,
    progress: mode === "open" ? 0 : 1,
  };
}

function updateDrawerGesture(event) {
  if (!drawerGesture || event.pointerId !== drawerGesture.pointerId) return;
  const dx = event.clientX - drawerGesture.startX;
  const dy = event.clientY - drawerGesture.startY;
  const distance = Math.hypot(dx, dy);

  if (!drawerGesture.axis && distance >= 8) {
    drawerGesture.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";
    if (drawerGesture.axis === "y") {
      drawerGesture = null;
      return;
    }
  }
  if (drawerGesture.axis !== "x") return;

  event.preventDefault();
  const now = performance.now();
  const elapsed = Math.max(1, now - drawerGesture.lastAt);
  drawerGesture.velocity = (event.clientX - drawerGesture.lastX) / elapsed;
  drawerGesture.lastX = event.clientX;
  drawerGesture.lastAt = now;

  const width = Math.max(1, drawer.getBoundingClientRect().width);
  const progress =
    drawerGesture.mode === "open"
      ? Math.max(0, dx) / width
      : 1 + Math.min(0, dx) / width;
  drawerGesture.progress = setDrawerGestureProgress(progress);
}

function finishDrawerGesture(event) {
  if (!drawerGesture || event.pointerId !== drawerGesture.pointerId) return;
  const gesture = drawerGesture;
  drawerGesture = null;
  if (gesture.axis !== "x") {
    if (gesture.mode === "open") {
      drawerLayer.classList.remove("is-visible", "is-dragging");
      document.body.classList.remove("drawer-open");
    }
    return;
  }

  suppressClickUntil = performance.now() + 350;
  drawerLayer.classList.remove("is-dragging");
  drawer.style.removeProperty("transform");
  drawerScrim.style.removeProperty("opacity");
  const shouldOpen =
    gesture.mode === "open"
      ? gesture.progress >= 0.28 || gesture.velocity > 0.55
      : !(gesture.progress <= 0.72 || gesture.velocity < -0.55);

  if (shouldOpen) {
    isDrawerOpen = false;
    openDrawer({ focus: true });
  } else if (gesture.mode === "close") {
    closeDrawer();
  } else {
    document.body.classList.remove("drawer-open");
    drawerLayer.classList.remove("is-visible");
  }
}

menuButton.addEventListener("click", () => openDrawer());
professionalChartButton.addEventListener("click", () => {
  window.location.href = "./chart-prototypes.html";
});
interpretationButton.addEventListener("click", () => {
  window.location.href = "./interpretation.html";
});
drawerLayer.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "close-drawer") closeDrawer();
  if (action === "account-placeholder") showToast("个人资料功能开发中");
});

drawer.addEventListener(
  "click",
  (event) => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true,
);

conversationList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-conversation-id]");
  if (!item) return;
  if (!appState.setActiveConversation(item.dataset.conversationId)) return;
  renderHistory();
  renderConversations();
  closeDrawer({ restoreFocus: false });
  window.scrollTo({ top: 0, behavior: "auto" });
});

document.addEventListener("keydown", (event) => {
  if (!isDrawerOpen) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeDrawer();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = drawerFocusableElements();
  if (!focusable.length) {
    event.preventDefault();
    drawer.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable.at(-1);
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === drawer)
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === drawer)
  ) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!isDrawerOpen && event.clientX <= 24) beginDrawerGesture(event, "open");
});
drawer.addEventListener("pointerdown", (event) => {
  if (isDrawerOpen) beginDrawerGesture(event, "close");
});
document.addEventListener("pointermove", updateDrawerGesture, { passive: false });
document.addEventListener("pointerup", finishDrawerGesture);
document.addEventListener("pointercancel", finishDrawerGesture);

questionInput.addEventListener("input", syncActionState);
questionInput.addEventListener("compositionstart", () => {
  isComposing = true;
});
questionInput.addEventListener("compositionend", () => {
  isComposing = false;
  syncActionState();
});
questionInput.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.isComposing &&
    !isComposing
  ) {
    event.preventDefault();
    submitQuestion();
  }
});

actionButton.addEventListener("click", () => {
  if (actionButton.classList.contains("is-send")) submitQuestion();
});

scrollTopButton.addEventListener("click", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});

window.addEventListener("scroll", queueScrollStateUpdate, { passive: true });
window.addEventListener("resize", queueScrollStateUpdate);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    appState.activateHomeConversation();
    renderHistory();
  }
  renderDailyGuide();
  renderInterpretationEntry();
  syncQuotaState();
  syncScrollTopButton();
  renderDrawerContent();
});
window.addEventListener("focus", () => {
  renderDailyGuide();
  syncQuotaState();
});
window.addEventListener("beforeunload", () => {
  if (replyTimer) window.clearTimeout(replyTimer);
  if (toastTimer) window.clearTimeout(toastTimer);
  if (dailyGuideTimer) window.clearTimeout(dailyGuideTimer);
});
renderDailyGuide();
renderInterpretationEntry();
appState.activateHomeConversation();
const history = renderHistory();
syncQuotaState();
syncScrollTopButton();
renderDrawerContent();

if (window.location.hash === "#menu") {
  openDrawer();
}

const lastMessage = history.at(-1);
if (lastMessage?.role === "user") {
  scheduleReply(lastMessage.content);
}
