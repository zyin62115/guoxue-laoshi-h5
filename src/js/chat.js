const chatState = window.GuoxueApp;
const questionInput = document.querySelector("#chat-question");
const actionButton = document.querySelector("#chat-action");
const voiceDock = document.querySelector(".chat-dock");
const micButton = document.querySelector("#chat-mic");
const quotaGuide = document.querySelector("#chat-quota-guide");
const promotionBadge = document.querySelector("#chat-promotion-badge");
const chatStartTime = document.querySelector("#chat-start-time");
const messageList = document.querySelector("#inline-message-list");
const reportContext = document.querySelector("#report-chat-context");
const reportContextTitle = document.querySelector("#report-chat-context-title");
const reportContextLink = document.querySelector("#report-chat-context-link");
const toast = document.querySelector("#chat-toast");

let isComposing = false;
let isReplying = false;
let replyTimer = null;
let toastTimer = null;

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

function getMockReply(question) {
  const matchedRule = MOCK_RULES.find((rule) =>
    rule.keywords.some((keyword) => question.includes(keyword)),
  );
  const reply = matchedRule ? matchedRule.reply : FALLBACK_REPLY;
  const context = chatState.getActiveConversation()?.context;
  return context
    ? `结合你在《${context.sectionTitle}》报告中的特点来看，${reply}`
    : reply;
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

function renderReportContext() {
  const context = chatState.getActiveConversation()?.context;
  reportContext.hidden = !context;
  if (!context) return;
  reportContextTitle.textContent = `正在结合《${context.sectionTitle}》为你解读`;
  reportContextLink.href = `./interpretation.html?report=${encodeURIComponent(context.reportId)}#report-section-${encodeURIComponent(context.sectionId)}`;
}

function renderHistory() {
  const history = chatState.getHistory();
  const oldestUser = history.find((message) => message.role === "user");
  const startedAt = chatState.ensureChatStartedAt(oldestUser?.createdAt);
  chatStartTime.dateTime = startedAt;
  chatStartTime.textContent = formatStartedAt(startedAt);

  const fragment = document.createDocumentFragment();
  history.forEach((message) => fragment.append(createMessageRow(message)));
  messageList.replaceChildren(fragment);
  renderReportContext();
  return history;
}

function scrollToLatest(behavior = "smooth") {
  requestAnimationFrame(() => {
    const target = messageList.lastElementChild || chatStartTime;
    if (!target) return;
    const dockTop = voiceDock.getBoundingClientRect().top;
    const targetBottom = target.getBoundingClientRect().bottom;
    const overlap = targetBottom - dockTop + 22;
    if (overlap > 0) window.scrollBy({ top: overlap, behavior });
  });
}

function syncActionState() {
  const hasQuestion = questionInput.value.trim().length > 0;
  const exhausted = chatState.getQuota().remaining <= 0;
  const canSend = hasQuestion && !exhausted && !isReplying;
  actionButton.classList.toggle("is-send", canSend);
  actionButton.setAttribute("aria-label", canSend ? "发送问题" : "更多功能");
}

function syncQuotaState() {
  const quota = chatState.getQuota();
  const exhausted = quota.remaining <= 0;
  voiceDock.classList.toggle("is-exhausted", exhausted);
  questionInput.disabled = exhausted || isReplying;
  micButton.disabled = exhausted || isReplying;
  actionButton.disabled = exhausted || isReplying;
  quotaGuide.hidden = !exhausted;
  questionInput.placeholder = exhausted
    ? "今日免费对话次数已用完"
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
  const message = chatState.appendMessage("assistant", getMockReply(question));
  messageList.append(createMessageRow(message));
  isReplying = false;
  replyTimer = null;
  syncQuotaState();
  scrollToLatest();
  if (!questionInput.disabled) questionInput.focus({ preventScroll: true });
}

function scheduleReply(question) {
  if (isReplying) return;
  isReplying = true;
  syncQuotaState();
  addThinkingRow();
  scrollToLatest("auto");
  replyTimer = window.setTimeout(() => finishReply(question), 700);
}

function submitQuestion() {
  if (isReplying || isComposing) return;
  const content = questionInput.value.trim();
  if (!content) {
    syncActionState();
    return;
  }
  if (!chatState.consumeQuota()) {
    syncQuotaState();
    return;
  }
  const previousConversationId = chatState.getActiveConversation()?.id;
  const message = chatState.appendMessage("user", content);
  const currentConversationId = chatState.getActiveConversation()?.id;
  if (previousConversationId && previousConversationId !== currentConversationId) {
    renderHistory();
  } else {
    messageList.append(createMessageRow(message));
  }
  questionInput.value = "";
  syncQuotaState();
  scrollToLatest();
  scheduleReply(content);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

questionInput.addEventListener("input", syncActionState);
questionInput.addEventListener("compositionstart", () => {
  isComposing = true;
});
questionInput.addEventListener("compositionend", () => {
  isComposing = false;
  syncActionState();
});
questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing && !isComposing) {
    event.preventDefault();
    submitQuestion();
  }
});
actionButton.addEventListener("click", () => {
  if (actionButton.classList.contains("is-send")) submitQuestion();
  else showToast("请输入问题后发送");
});
micButton.addEventListener("click", () => showToast("语音输入功能开发中"));
window.addEventListener("pageshow", syncQuotaState);
window.addEventListener("beforeunload", () => {
  if (replyTimer) window.clearTimeout(replyTimer);
  if (toastTimer) window.clearTimeout(toastTimer);
});

const history = renderHistory();
chatState.renderPromotionBadge(promotionBadge);
syncQuotaState();
scrollToLatest("auto");
const lastMessage = history.at(-1);
if (lastMessage?.role === "user") scheduleReply(lastMessage.content);
