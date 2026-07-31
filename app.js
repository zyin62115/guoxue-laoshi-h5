const appState = window.GuoxueApp;
const pressables = document.querySelectorAll("[data-action]");
const questionInput = document.querySelector("#home-question");
const actionButton = document.querySelector("#home-action");
const quotaDisplay = document.querySelector("#home-quota");
const voiceDock = document.querySelector(".voice-dock");
const micButton = document.querySelector('[data-action="voice-mode"]');
const membershipGuide = document.querySelector("#home-membership-guide");
const inlineChat = document.querySelector("#inline-chat");
const chatStartTime = document.querySelector("#chat-start-time");
const messageList = document.querySelector("#inline-message-list");
const scrollTopButton = document.querySelector("#scroll-top-button");
const menuButton = document.querySelector('[data-action="menu"]');
const drawerLayer = document.querySelector("#drawer-layer");
const drawer = document.querySelector("#personal-drawer");
const drawerScrim = document.querySelector(".drawer-scrim");
const profileList = document.querySelector("#profile-list");
const conversationList = document.querySelector("#conversation-list");
const appToast = document.querySelector("#app-toast");

let isComposing = false;
let isReplying = false;
let replyTimer = null;
let scrollTicking = false;
let isDrawerOpen = false;
let toastTimer = null;
let drawerGesture = null;
let suppressClickUntil = 0;

const MOCK_RULES = [
  {
    keywords: ["生病", "疾病", "症状", "药物", "治疗", "医院", "法律", "律师", "诉讼", "合同"],
    reply:
      "这件事涉及专业判断，国学的修身之道可以帮助你安定心绪，却不能替代医生、律师或其他专业人士的意见。\n\n先保存相关信息并尽快咨询合适的专业人员；在等待期间，照顾好自己的作息与情绪，不要独自承担风险。",
  },
  {
    keywords: ["学习", "考试", "读书", "成绩", "复习", "功课"],
    reply:
      "学贵有恒，不在一时之速。先把最重要的一门功课定下来，每日专注一段固定时间，温故而知新。\n\n心静则思清，步稳则路远。今日先完成一个可以落实的小目标，积累自然会显现。",
  },
  {
    keywords: ["工作", "事业", "选择", "机会", "职业", "辞职", "创业"],
    reply:
      "事缓则圆，谋定而后动。先分清哪些是你能掌握的，哪些需要等待时机，再从最重要的一步开始。\n\n不必急于求成，也不要因犹豫停滞。把眼前可做之事做好，局面会在行动中逐渐明朗。",
  },
  {
    keywords: ["焦虑", "烦恼", "难过", "压力", "迷茫", "情绪", "害怕"],
    reply:
      "心有所扰时，先不急着作决定。停一停，缓缓呼吸，把纷杂的念头写下来，只处理眼前最要紧的一件事。\n\n静能生定，定能生慧。允许自己慢一点，情绪安稳之后，再看问题往往会多一条路。",
  },
  {
    keywords: ["家庭", "朋友", "感情", "相处", "沟通", "父母", "伴侣"],
    reply:
      "和而不同，是相处之道。先听清彼此真正关切的是什么，再用平和而具体的话表达自己的感受与边界。\n\n诚恳不等于勉强，体谅也不是一味退让。留一分余地，关系才有转圜和生长的空间。",
  },
];

const FALLBACK_REPLY =
  "你所问之事，不妨先从正心开始：看清自己的真实愿望，也看清眼前的条件与限制。\n\n把大问题拆成今天能够完成的一小步，做完再观其变化。顺势而为，并非等待，而是在合适的方向上稳稳前行。";

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
  const matchedRule = MOCK_RULES.find((rule) =>
    rule.keywords.some((keyword) => question.includes(keyword)),
  );
  return matchedRule ? matchedRule.reply : FALLBACK_REPLY;
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
  avatar.src = "./assets/teacher-avatar-centered.png";
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

  appState.renderQuota(quotaDisplay, quota, false);
  voiceDock.classList.toggle("is-exhausted", exhausted);
  questionInput.disabled = exhausted || isReplying;
  micButton.disabled = exhausted || isReplying;
  actionButton.disabled = exhausted || isReplying;
  membershipGuide.hidden = !exhausted;
  questionInput.placeholder = exhausted
    ? "今日次数已用完"
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

function formatProfileBirth(profile) {
  const { year, month, day } = profile.birthDate;
  const calendar = profile.calendar === "lunar" ? "农历" : "公历";
  const leap = profile.calendar === "lunar" && profile.isLeapMonth ? "闰" : "";
  return `${calendar} ${year}年${leap}${month}月${day}日 ${profile.birthTime}`;
}

function renderProfiles() {
  const profiles = appState.getProfiles();
  const activeId = appState.getActiveProfileId();
  const fragment = document.createDocumentFragment();

  if (!profiles.length) {
    const empty = document.createElement("a");
    empty.className = "profile-empty pressable";
    empty.href = "./profile.html";

    const mark = document.createElement("span");
    mark.className = "profile-empty-mark";
    mark.textContent = "+";

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = "添加第一份八字档案";
    const description = document.createElement("small");
    description.textContent = "保存出生信息，方便后续问答";
    copy.append(title, description);
    empty.append(mark, copy);
    fragment.append(empty);
    profileList.replaceChildren(fragment);
    return;
  }

  profiles.forEach((profile) => {
    const card = document.createElement("article");
    card.className = "archive-card";
    card.classList.toggle("is-active", profile.id === activeId);

    const select = document.createElement("button");
    select.className = "archive-select pressable";
    select.type = "button";
    select.dataset.profileId = profile.id;
    select.setAttribute(
      "aria-label",
      `${profile.id === activeId ? "当前档案，" : ""}选择${profile.name}的八字档案`,
    );

    const avatar = document.createElement("span");
    avatar.className = "archive-avatar";
    avatar.textContent = profile.name.slice(0, 1);

    const copy = document.createElement("span");
    copy.className = "archive-copy";
    const name = document.createElement("strong");
    name.textContent = profile.name;
    const detail = document.createElement("small");
    detail.textContent = formatProfileBirth(profile);
    copy.append(name, detail);

    const check = document.createElement("span");
    check.className = "archive-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";
    select.append(avatar, copy, check);

    const edit = document.createElement("a");
    edit.className = "archive-edit pressable";
    edit.href = `./profile.html?id=${encodeURIComponent(profile.id)}`;
    edit.textContent = "编辑";
    edit.setAttribute("aria-label", `编辑${profile.name}的八字档案`);
    card.append(select, edit);
    fragment.append(card);
  });

  profileList.replaceChildren(fragment);
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
    .filter((conversation) => conversation.messages.some((message) => message.role === "user"));
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
  renderProfiles();
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
drawerLayer.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "close-drawer") closeDrawer();
  if (action === "account-placeholder") showToast("个人资料功能开发中");
  if (action === "membership-placeholder") showToast("会员服务功能开发中");
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

profileList.addEventListener("click", (event) => {
  const select = event.target.closest("[data-profile-id]");
  if (!select) return;
  appState.setActiveProfile(select.dataset.profileId);
  renderProfiles();
  showToast("已切换八字档案");
});

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
window.addEventListener("pageshow", () => {
  syncQuotaState();
  syncScrollTopButton();
  renderDrawerContent();
});
window.addEventListener("focus", syncQuotaState);
window.addEventListener("beforeunload", () => {
  if (replyTimer) window.clearTimeout(replyTimer);
  if (toastTimer) window.clearTimeout(toastTimer);
});

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
