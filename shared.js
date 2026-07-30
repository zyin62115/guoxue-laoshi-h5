(function initializeGuoxueState(global) {
  const HISTORY_KEY = "guoxueChatHistoryV1";
  const QUOTA_KEY = "guoxueDailyQuotaV1";
  const CHAT_STARTED_AT_KEY = "guoxueChatStartedAtV1";
  const DAILY_LIMIT = 10;
  const HISTORY_LIMIT = 40;
  const memoryFallback = Object.create(null);

  function readStorage(key) {
    try {
      return global.sessionStorage.getItem(key);
    } catch {
      return memoryFallback[key] || null;
    }
  }

  function writeStorage(key, value) {
    try {
      global.sessionStorage.setItem(key, value);
    } catch {
      memoryFallback[key] = value;
    }
  }

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveQuota(quota) {
    writeStorage(QUOTA_KEY, JSON.stringify(quota));
    return quota;
  }

  function getQuota() {
    const today = localDateKey();
    const stored = safeParse(readStorage(QUOTA_KEY), null);

    if (
      !stored ||
      stored.date !== today ||
      !Number.isInteger(stored.remaining)
    ) {
      return saveQuota({ date: today, remaining: DAILY_LIMIT });
    }

    stored.remaining = Math.max(0, Math.min(DAILY_LIMIT, stored.remaining));
    return stored;
  }

  function consumeQuota() {
    const quota = getQuota();
    if (quota.remaining <= 0) return null;
    return saveQuota({ ...quota, remaining: quota.remaining - 1 });
  }

  function getHistory() {
    const history = safeParse(readStorage(HISTORY_KEY), []);
    if (!Array.isArray(history)) return [];

    return history
      .filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      )
      .slice(-HISTORY_LIMIT);
  }

  function saveHistory(history) {
    const limited = history.slice(-HISTORY_LIMIT);
    writeStorage(HISTORY_KEY, JSON.stringify(limited));
    return limited;
  }

  function createMessage(role, content) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
  }

  function appendMessage(role, content) {
    const message = createMessage(role, content);
    saveHistory([...getHistory(), message]);
    return message;
  }

  function getChatStartedAt() {
    const stored = readStorage(CHAT_STARTED_AT_KEY);
    if (!stored) return null;

    const date = new Date(stored);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function ensureChatStartedAt(fallback) {
    const existing = getChatStartedAt();
    if (existing) return existing;

    const fallbackDate = fallback ? new Date(fallback) : new Date();
    const startedAt = Number.isNaN(fallbackDate.getTime())
      ? new Date().toISOString()
      : fallbackDate.toISOString();
    writeStorage(CHAT_STARTED_AT_KEY, startedAt);
    return startedAt;
  }

  function renderQuota(element, quota = getQuota(), compact = false) {
    if (!element) return;

    if (quota.remaining <= 0) {
      element.textContent = "今日免费对话次数已用完";
      element.setAttribute("aria-label", "今日免费对话次数已用完");
      return;
    }

    const prefix = compact ? "今日还可对话" : "今日还可免费对话";
    element.innerHTML = `<span>${prefix}</span><strong>${quota.remaining}</strong><span>次</span>`;
    element.setAttribute(
      "aria-label",
      `${prefix}${quota.remaining}次`,
    );
  }

  global.GuoxueApp = Object.freeze({
    DAILY_LIMIT,
    HISTORY_LIMIT,
    appendMessage,
    consumeQuota,
    ensureChatStartedAt,
    getChatStartedAt,
    getHistory,
    getQuota,
    localDateKey,
    renderQuota,
    saveHistory,
  });
})(window);
