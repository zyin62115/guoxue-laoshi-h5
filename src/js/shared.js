(function initializeGuoxueState(global) {
  const STORAGE_VERSION = 2;
  const DAILY_LIMIT = 10;
  const HISTORY_LIMIT = 40;
  const CONVERSATION_LIMIT = 90;
  const PROFILE_LIMIT = 20;

  const KEYS = Object.freeze({
    profiles: "guoxueProfilesV2",
    activeProfile: "guoxueActiveProfileV2",
    conversations: "guoxueConversationsV2",
    activeConversation: "guoxueActiveConversationV2",
    quota: "guoxueDailyQuotaV2",
    migration: "guoxueStorageMigrationV2",
  });

  const LEGACY_KEYS = Object.freeze({
    history: "guoxueChatHistoryV1",
    quota: "guoxueDailyQuotaV1",
    startedAt: "guoxueChatStartedAtV1",
  });

  const memoryFallback = Object.create(null);

  function readFrom(storage, key) {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return memoryFallback[key] || null;
    }
  }

  function writeTo(storage, key, value) {
    try {
      storage?.setItem(key, value);
    } catch {
      memoryFallback[key] = value;
    }
  }

  function removeFrom(storage, key) {
    try {
      storage?.removeItem(key);
    } catch {
      delete memoryFallback[key];
    }
  }

  function readLocal(key) {
    return readFrom(global.localStorage, key);
  }

  function writeLocal(key, value) {
    writeTo(global.localStorage, key, value);
  }

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function createId(prefix) {
    if (global.crypto?.randomUUID) return `${prefix}-${global.crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function localDateKey(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    const valid = Number.isNaN(value.getTime()) ? new Date() : value;
    const year = valid.getFullYear();
    const month = String(valid.getMonth() + 1).padStart(2, "0");
    const day = String(valid.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function validMessage(message) {
    return (
      message &&
      typeof message.id === "string" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string"
    );
  }

  function normalizeMessage(message) {
    return {
      id: message.id || createId("message"),
      role: message.role,
      content: String(message.content || "").trim(),
      createdAt:
        typeof message.createdAt === "string"
          ? message.createdAt
          : new Date().toISOString(),
    };
  }

  function deriveTitle(messages) {
    const firstQuestion = messages.find(
      (message) => message.role === "user" && message.content.trim(),
    );
    if (!firstQuestion) return "新的对话";
    const compact = firstQuestion.content.replace(/\s+/g, " ").trim();
    return compact.length > 24 ? `${compact.slice(0, 24)}…` : compact;
  }

  function normalizeConversation(conversation) {
    if (!conversation || typeof conversation !== "object") return null;
    const messages = Array.isArray(conversation.messages)
      ? conversation.messages.filter(validMessage).map(normalizeMessage).slice(-HISTORY_LIMIT)
      : [];
    const createdAt =
      typeof conversation.createdAt === "string"
        ? conversation.createdAt
        : messages[0]?.createdAt || new Date().toISOString();
    const updatedAt =
      typeof conversation.updatedAt === "string"
        ? conversation.updatedAt
        : messages.at(-1)?.createdAt || createdAt;
    return {
      id: typeof conversation.id === "string" ? conversation.id : createId("conversation"),
      dateKey:
        typeof conversation.dateKey === "string"
          ? conversation.dateKey
          : localDateKey(createdAt),
      title:
        typeof conversation.title === "string" && conversation.title.trim()
          ? conversation.title.trim()
          : deriveTitle(messages),
      messages,
      createdAt,
      updatedAt,
    };
  }

  function getConversations() {
    const stored = safeParse(readLocal(KEYS.conversations), []);
    if (!Array.isArray(stored)) return [];
    return stored
      .map(normalizeConversation)
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, CONVERSATION_LIMIT);
  }

  function saveConversations(conversations) {
    const normalized = conversations
      .map(normalizeConversation)
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, CONVERSATION_LIMIT);
    writeLocal(KEYS.conversations, JSON.stringify(normalized));
    return normalized;
  }

  function getActiveConversationId() {
    return readLocal(KEYS.activeConversation);
  }

  function setActiveConversation(id) {
    const conversation = getConversations().find((item) => item.id === id);
    if (!conversation) return null;
    writeLocal(KEYS.activeConversation, id);
    return conversation;
  }

  function getActiveConversation() {
    const conversations = getConversations();
    const selected = conversations.find(
      (conversation) => conversation.id === getActiveConversationId(),
    );
    if (selected) return selected;

    const today = conversations.find(
      (conversation) => conversation.dateKey === localDateKey(),
    );
    const fallback = today || conversations[0] || null;
    if (fallback) writeLocal(KEYS.activeConversation, fallback.id);
    return fallback;
  }

  function getOrCreateTodayConversation() {
    const conversations = getConversations();
    const todayKey = localDateKey();
    let conversation = conversations.find((item) => item.dateKey === todayKey);

    if (!conversation) {
      const now = new Date().toISOString();
      conversation = {
        id: createId("conversation"),
        dateKey: todayKey,
        title: "新的对话",
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      conversations.unshift(conversation);
      saveConversations(conversations);
    }

    writeLocal(KEYS.activeConversation, conversation.id);
    return conversation;
  }

  function createMessage(role, content) {
    return {
      id: createId("message"),
      role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
  }

  function appendMessage(role, content) {
    const conversation = getOrCreateTodayConversation();
    const message = createMessage(role, content);
    const conversations = getConversations();
    const index = conversations.findIndex((item) => item.id === conversation.id);
    const updated = {
      ...conversation,
      messages: [...conversation.messages, message].slice(-HISTORY_LIMIT),
      updatedAt: message.createdAt,
    };
    updated.title = deriveTitle(updated.messages);

    if (index >= 0) conversations[index] = updated;
    else conversations.unshift(updated);
    saveConversations(conversations);
    writeLocal(KEYS.activeConversation, updated.id);
    return message;
  }

  function getHistory() {
    return getActiveConversation()?.messages || [];
  }

  function saveHistory(history) {
    const conversation = getOrCreateTodayConversation();
    const conversations = getConversations();
    const index = conversations.findIndex((item) => item.id === conversation.id);
    const messages = Array.isArray(history)
      ? history.filter(validMessage).map(normalizeMessage).slice(-HISTORY_LIMIT)
      : [];
    const updated = {
      ...conversation,
      messages,
      title: deriveTitle(messages),
      updatedAt: messages.at(-1)?.createdAt || conversation.updatedAt,
    };
    if (index >= 0) conversations[index] = updated;
    else conversations.unshift(updated);
    saveConversations(conversations);
    return messages;
  }

  function getChatStartedAt() {
    return getActiveConversation()?.createdAt || null;
  }

  function ensureChatStartedAt(fallback) {
    const active = getActiveConversation();
    if (active) return active.createdAt;
    const conversation = getOrCreateTodayConversation();
    if (!fallback) return conversation.createdAt;

    const fallbackDate = new Date(fallback);
    if (Number.isNaN(fallbackDate.getTime())) return conversation.createdAt;
    const conversations = getConversations();
    const index = conversations.findIndex((item) => item.id === conversation.id);
    conversations[index] = {
      ...conversation,
      createdAt: fallbackDate.toISOString(),
    };
    saveConversations(conversations);
    return fallbackDate.toISOString();
  }

  function saveQuota(quota) {
    writeLocal(KEYS.quota, JSON.stringify(quota));
    return quota;
  }

  function getQuota() {
    const today = localDateKey();
    const stored = safeParse(readLocal(KEYS.quota), null);
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

  function renderQuota(element, quota = getQuota(), compact = false) {
    if (!element) return;
    if (quota.remaining <= 0) {
      element.textContent = "今日免费对话次数已用完";
      element.setAttribute("aria-label", "今日免费对话次数已用完");
      return;
    }
    const prefix = compact ? "今日还可对话" : "今日还可免费对话";
    element.innerHTML = `<span>${prefix}</span><strong>${quota.remaining}</strong><span>次</span>`;
    element.setAttribute("aria-label", `${prefix}${quota.remaining}次`);
  }

  function normalizeProfile(profile) {
    if (!profile || typeof profile !== "object") return null;
    const now = new Date().toISOString();
    return {
      id: typeof profile.id === "string" ? profile.id : createId("profile"),
      name: String(profile.name || "").trim(),
      gender: profile.gender === "female" ? "female" : "male",
      calendar: profile.calendar === "lunar" ? "lunar" : "solar",
      birthDate: {
        year: Number(profile.birthDate?.year) || 0,
        month: Number(profile.birthDate?.month) || 0,
        day: Number(profile.birthDate?.day) || 0,
      },
      birthTime: String(profile.birthTime || ""),
      isLeapMonth: Boolean(profile.isLeapMonth),
      birthplace: String(profile.birthplace || "").trim(),
      createdAt: typeof profile.createdAt === "string" ? profile.createdAt : now,
      updatedAt: typeof profile.updatedAt === "string" ? profile.updatedAt : now,
    };
  }

  function getProfiles() {
    const stored = safeParse(readLocal(KEYS.profiles), []);
    if (!Array.isArray(stored)) return [];
    return stored.map(normalizeProfile).filter(Boolean).slice(0, PROFILE_LIMIT);
  }

  function saveProfiles(profiles) {
    const normalized = profiles.map(normalizeProfile).filter(Boolean).slice(0, PROFILE_LIMIT);
    writeLocal(KEYS.profiles, JSON.stringify(normalized));
    return normalized;
  }

  function getActiveProfileId() {
    return readLocal(KEYS.activeProfile);
  }

  function setActiveProfile(id) {
    const profile = getProfiles().find((item) => item.id === id);
    if (!profile) return null;
    writeLocal(KEYS.activeProfile, id);
    return profile;
  }

  function getActiveProfile() {
    const profiles = getProfiles();
    const selected = profiles.find((profile) => profile.id === getActiveProfileId());
    const fallback = selected || profiles[0] || null;
    if (fallback && fallback.id !== getActiveProfileId()) {
      writeLocal(KEYS.activeProfile, fallback.id);
    }
    return fallback;
  }

  function getProfile(id) {
    return getProfiles().find((profile) => profile.id === id) || null;
  }

  function upsertProfile(profile) {
    const profiles = getProfiles();
    const existingIndex = profiles.findIndex((item) => item.id === profile.id);
    const existing = existingIndex >= 0 ? profiles[existingIndex] : null;
    const now = new Date().toISOString();
    const normalized = normalizeProfile({
      ...existing,
      ...profile,
      id: existing?.id || profile.id || createId("profile"),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existingIndex >= 0) profiles[existingIndex] = normalized;
    else profiles.push(normalized);
    saveProfiles(profiles);
    writeLocal(KEYS.activeProfile, normalized.id);
    return normalized;
  }

  function deleteProfile(id) {
    const profiles = getProfiles().filter((profile) => profile.id !== id);
    saveProfiles(profiles);
    if (getActiveProfileId() === id) {
      if (profiles[0]) writeLocal(KEYS.activeProfile, profiles[0].id);
      else removeFrom(global.localStorage, KEYS.activeProfile);
    }
    return profiles;
  }

  function migrateLegacyStorage() {
    if (readLocal(KEYS.migration)) return;

    const legacyHistory = safeParse(
      readFrom(global.sessionStorage, LEGACY_KEYS.history),
      [],
    );
    if (
      getConversations().length === 0 &&
      Array.isArray(legacyHistory) &&
      legacyHistory.some(validMessage)
    ) {
      const messages = legacyHistory
        .filter(validMessage)
        .map(normalizeMessage)
        .slice(-HISTORY_LIMIT);
      const legacyStartedAt =
        readFrom(global.sessionStorage, LEGACY_KEYS.startedAt) ||
        messages[0]?.createdAt ||
        new Date().toISOString();
      const updatedAt = messages.at(-1)?.createdAt || legacyStartedAt;
      const conversation = normalizeConversation({
        id: createId("conversation"),
        dateKey: localDateKey(legacyStartedAt),
        title: deriveTitle(messages),
        messages,
        createdAt: legacyStartedAt,
        updatedAt,
      });
      saveConversations([conversation]);
      writeLocal(KEYS.activeConversation, conversation.id);
    }

    if (!readLocal(KEYS.quota)) {
      const legacyQuota = safeParse(
        readFrom(global.sessionStorage, LEGACY_KEYS.quota),
        null,
      );
      if (
        legacyQuota &&
        legacyQuota.date === localDateKey() &&
        Number.isInteger(legacyQuota.remaining)
      ) {
        saveQuota({
          date: legacyQuota.date,
          remaining: Math.max(0, Math.min(DAILY_LIMIT, legacyQuota.remaining)),
        });
      }
    }

    writeLocal(
      KEYS.migration,
      JSON.stringify({ version: STORAGE_VERSION, migratedAt: new Date().toISOString() }),
    );
  }

  migrateLegacyStorage();

  global.GuoxueApp = Object.freeze({
    CONVERSATION_LIMIT,
    DAILY_LIMIT,
    HISTORY_LIMIT,
    PROFILE_LIMIT,
    STORAGE_VERSION,
    appendMessage,
    consumeQuota,
    deleteProfile,
    ensureChatStartedAt,
    getActiveConversation,
    getActiveProfile,
    getActiveProfileId,
    getChatStartedAt,
    getConversations,
    getHistory,
    getProfile,
    getProfiles,
    getQuota,
    localDateKey,
    renderQuota,
    saveHistory,
    setActiveConversation,
    setActiveProfile,
    upsertProfile,
  });
})(window);
