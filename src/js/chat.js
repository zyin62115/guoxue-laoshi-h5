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

// 回复规则统一由 src/js/chat-replies.js 的 window.GuoxueChatReplies.getReply 提供，避免两套规则重复维护。

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
  const message = chatState.appendMessage(
    "assistant",
    window.GuoxueChatReplies.getReply(question, chatState.getActiveConversation()?.context),
  );
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
