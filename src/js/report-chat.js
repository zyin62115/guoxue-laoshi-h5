const reportChatState = window.GuoxueApp;
const params = new URLSearchParams(window.location.search);
const reportId = params.get("report");
const sectionId = params.get("section");
const report = reportId ? reportChatState.getReport(reportId) : null;
const section = report?.sections.find((item) => item.id === sectionId) || null;
const backLink = document.querySelector("#report-chat-back");
const profileLabel = document.querySelector("#report-chat-profile");
const pageTitle = document.querySelector("#report-chat-title");
const description = document.querySelector("#report-chat-description");
const quotaDisplay = document.querySelector("#report-chat-quota");
const messageList = document.querySelector("#report-chat-message-list");
const startTime = document.querySelector("#report-chat-start-time");
const dock = document.querySelector("#report-chat-dock");
const questionInput = document.querySelector("#report-chat-question");
const sendButton = document.querySelector("#report-chat-send");
const toast = document.querySelector("#report-chat-toast");
let conversation = null;
let replyTimer = null;
let toastTimer = null;
let isReplying = false;
let isComposing = false;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function formatStartedAt(value) {
  const date = new Date(value);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return sameDay ? `今天 ${time}` : `${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
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

function createThinkingRow() {
  const row = document.createElement("article");
  row.className = "inline-message-row assistant inline-thinking";
  row.dataset.thinking = "true";
  const body = document.createElement("div");
  body.className = "inline-message-body";
  const bubble = document.createElement("div");
  bubble.className = "inline-message-bubble";
  bubble.innerHTML = '老师正在思考<span class="inline-thinking-dots"><i></i><i></i><i></i></span>';
  body.append(bubble);
  row.append(createTeacherAvatar(), body);
  return row;
}

function activateConversation() {
  conversation = reportChatState.createReportConversation(report.id, section.id);
  if (conversation) reportChatState.setActiveConversation(conversation.id);
  return conversation;
}

function renderMessages() {
  if (!activateConversation()) return;
  const history = reportChatState.getHistory();
  startTime.dateTime = conversation.createdAt;
  startTime.textContent = formatStartedAt(conversation.createdAt);
  messageList.replaceChildren(...history.map(createMessageRow));
}

function syncQuota() {
  const quota = reportChatState.getQuota();
  reportChatState.renderPromotionBadge(quotaDisplay);
  const exhausted = quota.remaining <= 0;
  dock.classList.toggle("is-exhausted", exhausted);
  questionInput.disabled = exhausted;
  sendButton.disabled = exhausted;
}

function syncSendButton() {
  sendButton.classList.toggle(
    "is-send",
    Boolean(questionInput.value.trim()) && !isReplying && !questionInput.disabled,
  );
}

function scrollToLatest(behavior = "smooth") {
  requestAnimationFrame(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
  });
}

function finishReply(question) {
  if (!activateConversation()) return;
  reportChatState.appendMessage(
    "assistant",
    window.GuoxueChatReplies.getReply(question, conversation.context),
  );
  isReplying = false;
  renderMessages();
  syncSendButton();
  scrollToLatest();
}

function submitQuestion() {
  if (isReplying || isComposing) return;
  const question = questionInput.value.trim();
  if (!question) return;
  if (!reportChatState.consumeQuota()) {
    syncQuota();
    showToast("今日免费对话次数已用完");
    return;
  }
  if (!activateConversation()) return;
  reportChatState.appendMessage("user", question);
  questionInput.value = "";
  isReplying = true;
  renderMessages();
  messageList.append(createThinkingRow());
  syncQuota();
  syncSendButton();
  scrollToLatest();
  replyTimer = window.setTimeout(() => finishReply(question), 700);
}

if (!report || !section) {
  pageTitle.textContent = "未找到报告章节";
  description.textContent = "请返回国心解读，重新选择需要追问的章节。";
  backLink.href = report ? `./interpretation.html?report=${encodeURIComponent(report.id)}` : "./interpretation.html";
  questionInput.disabled = true;
  sendButton.disabled = true;
  dock.classList.add("is-exhausted");
} else {
  const returnTarget = `./interpretation.html?report=${encodeURIComponent(report.id)}#report-section-${encodeURIComponent(section.id)}`;
  backLink.href = returnTarget;
  profileLabel.textContent = `${report.profileSnapshot?.name || "我的"} · 国心解读`;
  pageTitle.textContent = section.title;
  description.textContent = `我会结合《${section.title}》的报告内容继续为你解读。`;
  document.title = `${section.title} · 报告对话`;
  activateConversation();
  if (!reportChatState.getHistory().length) {
    reportChatState.appendMessage(
      "assistant",
      `关于《${section.title}》，你还想进一步了解什么？可以把具体困惑告诉我。`,
    );
  }
  renderMessages();
  syncQuota();
}

questionInput.addEventListener("input", syncSendButton);
questionInput.addEventListener("compositionstart", () => {
  isComposing = true;
});
questionInput.addEventListener("compositionend", () => {
  isComposing = false;
  syncSendButton();
});
questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !isComposing) {
    event.preventDefault();
    submitQuestion();
  }
});
sendButton.addEventListener("click", submitQuestion);
backLink.addEventListener("click", (event) => {
  event.preventDefault();
  window.GuoxueNavigation.back(backLink.href);
});
window.addEventListener("pageshow", () => {
  if (!report || !section) return;
  renderMessages();
  syncQuota();
});
window.addEventListener("beforeunload", () => {
  window.clearTimeout(replyTimer);
  window.clearTimeout(toastTimer);
});
