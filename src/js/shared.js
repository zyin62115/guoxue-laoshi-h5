(function initializeGuoxueState(global) {
  const STORAGE_VERSION = 2;
  const DAILY_LIMIT = Number.POSITIVE_INFINITY;
  const HISTORY_LIMIT = 40;
  const CONVERSATION_LIMIT = 90;
  const PROFILE_LIMIT = 20;
  const REPORT_LIMIT = 30;
  const FULL_REPORT_PRICE = 8800;
  const REPORT_SECTION_PRICE = 1680;
  const PROMOTION_BADGE = Object.freeze({
    text: "限时免费",
    ariaLabel: "限时免费",
  });

  const KEYS = Object.freeze({
    profiles: "guoxueProfilesV2",
    activeProfile: "guoxueActiveProfileV2",
    conversations: "guoxueConversationsV2",
    activeConversation: "guoxueActiveConversationV2",
    quota: "guoxueDailyQuotaV2",
    migration: "guoxueStorageMigrationV2",
    reports: "guoxueInterpretationReportsV1",
    reportOrders: "guoxueInterpretationOrdersV1",
    firstReportClaim: "guoxueFirstReportClaimPromptV1",
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
    const context =
      conversation.context &&
      typeof conversation.context.reportId === "string" &&
      typeof conversation.context.sectionId === "string"
        ? {
            type: "report",
            reportId: conversation.context.reportId,
            sectionId: conversation.context.sectionId,
            sectionTitle: String(conversation.context.sectionTitle || "报告解读"),
          }
        : null;
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
      context,
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
    const activeId = getActiveConversationId();
    let conversation = conversations.find(
      (item) => item.id === activeId && item.dateKey === todayKey,
    );
    if (!conversation) {
      conversation = conversations.find(
        (item) => item.dateKey === todayKey && !item.context,
      );
    }

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
    return {
      date: localDateKey(),
      remaining: DAILY_LIMIT,
      unlimited: true,
    };
  }

  function consumeQuota() {
    return getQuota();
  }

  function getPromotionBadge() {
    return PROMOTION_BADGE;
  }

  function renderPromotionBadge(element) {
    if (!element) return;
    const badge = getPromotionBadge();
    const textElement = element.querySelector("[data-promotion-badge-text]") || element;
    textElement.textContent = badge.text;
    element.setAttribute("aria-label", badge.ariaLabel);
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

  function profileSnapshot(profile) {
    return {
      profileId: profile.id,
      name: profile.name,
      gender: profile.gender,
      calendar: profile.calendar,
      birthDate: { ...profile.birthDate },
      birthTime: profile.birthTime,
      isLeapMonth: profile.isLeapMonth,
      birthplace: profile.birthplace,
    };
  }

  function snapshotFingerprint(snapshot) {
    const source = JSON.stringify(snapshot);
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `snapshot-${(hash >>> 0).toString(36)}`;
  }

  function normalizeReportSection(section) {
    if (!section || typeof section.id !== "string") return null;
    const content = section.content && typeof section.content === "object" ? section.content : {};
    return {
      id: section.id,
      title: String(section.title || "报告章节"),
      keywords: Array.isArray(section.keywords)
        ? section.keywords.map(String).slice(0, 3)
        : [],
      teaser: String(section.teaser || ""),
      lockedItems: Array.isArray(section.lockedItems)
        ? section.lockedItems.map(String).slice(0, 5)
        : [],
      content: {
        conclusion: String(content.conclusion || ""),
        strengths: String(content.strengths || ""),
        blindSpots: String(content.blindSpots || ""),
        actions: String(content.actions || ""),
      },
      disclaimer: String(section.disclaimer || ""),
    };
  }

  function normalizeReport(report) {
    if (!report || typeof report !== "object") return null;
    const sections = Array.isArray(report.sections)
      ? report.sections.map(normalizeReportSection).filter(Boolean).slice(0, 8)
      : [];
    const validIds = new Set(sections.map((section) => section.id));
    const unlockedSectionIds = Array.isArray(report.unlockedSectionIds)
      ? [...new Set(report.unlockedSectionIds.filter((id) => validIds.has(id)))]
      : [];
    const now = new Date().toISOString();
    return {
      id: typeof report.id === "string" ? report.id : createId("report"),
      profileId: String(report.profileId || report.profileSnapshot?.profileId || ""),
      profileSnapshot: report.profileSnapshot || null,
      fingerprint: String(report.fingerprint || ""),
      overview: String(report.overview || ""),
      sections,
      unlockedSectionIds,
      fullUnlocked: Boolean(report.fullUnlocked),
      createdAt: typeof report.createdAt === "string" ? report.createdAt : now,
      updatedAt: typeof report.updatedAt === "string" ? report.updatedAt : now,
    };
  }

  function getReports() {
    const stored = safeParse(readLocal(KEYS.reports), []);
    if (!Array.isArray(stored)) return [];
    return stored
      .map(normalizeReport)
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, REPORT_LIMIT);
  }

  function saveReports(reports) {
    const normalized = reports
      .map(normalizeReport)
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, REPORT_LIMIT);
    writeLocal(KEYS.reports, JSON.stringify(normalized));
    return normalized;
  }

  function getReport(id) {
    return getReports().find((report) => report.id === id) || null;
  }

  function getOrCreateReport(profileId, payload) {
    const profile = getProfile(profileId);
    if (!profile) return null;
    const snapshot = profileSnapshot(profile);
    const fingerprint = snapshotFingerprint(snapshot);
    const reports = getReports();
    const existing = reports.find((report) => report.fingerprint === fingerprint);
    if (existing) return existing;

    const now = new Date().toISOString();
    const report = normalizeReport({
      id: createId("report"),
      profileId: profile.id,
      profileSnapshot: snapshot,
      fingerprint,
      overview: payload?.overview,
      sections: payload?.sections,
      unlockedSectionIds: [],
      fullUnlocked: false,
      createdAt: now,
      updatedAt: now,
    });
    saveReports([report, ...reports]);
    return report;
  }

  function getReportUpgradePrice(reportOrId) {
    const report = typeof reportOrId === "string" ? getReport(reportOrId) : reportOrId;
    if (!report || report.fullUnlocked) return 0;
    return Math.max(
      0,
      FULL_REPORT_PRICE - report.unlockedSectionIds.length * REPORT_SECTION_PRICE,
    );
  }

  function getReportOrders() {
    const stored = safeParse(readLocal(KEYS.reportOrders), []);
    return Array.isArray(stored) ? stored.slice(0, 100) : [];
  }

  function getFirstReportClaim() {
    const stored = safeParse(readLocal(KEYS.firstReportClaim), null);
    return stored && typeof stored === "object" ? stored : null;
  }

  function shouldShowFirstReportClaim() {
    return !getFirstReportClaim();
  }

  function dismissFirstReportClaim(action = "closed") {
    const existing = getFirstReportClaim();
    if (existing) return existing;
    const record = {
      action: action === "wechat" ? "wechat" : "closed",
      handledAt: new Date().toISOString(),
    };
    writeLocal(KEYS.firstReportClaim, JSON.stringify(record));
    return record;
  }

  function purchaseReport(reportId, purchase) {
    const reports = getReports();
    const index = reports.findIndex((report) => report.id === reportId);
    if (index < 0) return { ok: false, reason: "not-found" };
    const report = reports[index];
    if (report.fullUnlocked) return { ok: true, report, amount: 0 };

    const type = purchase?.type === "section" ? "section" : "full";
    let amount = getReportUpgradePrice(report);
    let sectionId = null;
    if (type === "section") {
      sectionId = String(purchase?.sectionId || "");
      if (!report.sections.some((section) => section.id === sectionId)) {
        return { ok: false, reason: "invalid-section" };
      }
      if (report.unlockedSectionIds.includes(sectionId)) {
        return { ok: true, report, amount: 0 };
      }
      if (amount < REPORT_SECTION_PRICE) {
        return { ok: false, reason: "upgrade-cheaper" };
      }
      amount = REPORT_SECTION_PRICE;
    }

    const now = new Date().toISOString();
    const updated = {
      ...report,
      unlockedSectionIds:
        type === "section"
          ? [...report.unlockedSectionIds, sectionId]
          : report.sections.map((section) => section.id),
      fullUnlocked: type === "full",
      updatedAt: now,
    };
    reports[index] = updated;
    saveReports(reports);

    const order = {
      id: createId("order"),
      reportId,
      type,
      sectionId,
      amount,
      status: "paid",
      paidAt: now,
    };
    writeLocal(KEYS.reportOrders, JSON.stringify([order, ...getReportOrders()].slice(0, 100)));
    return { ok: true, report: normalizeReport(updated), amount, order };
  }

  function claimFreeReport(reportId) {
    const reports = getReports();
    const index = reports.findIndex((report) => report.id === reportId);
    if (index < 0) return { ok: false, reason: "not-found" };
    const report = reports[index];
    if (report.fullUnlocked) return { ok: true, report, amount: 0 };

    const now = new Date().toISOString();
    const updated = {
      ...report,
      unlockedSectionIds: report.sections.map((section) => section.id),
      fullUnlocked: true,
      updatedAt: now,
    };
    reports[index] = updated;
    saveReports(reports);

    const order = {
      id: createId("order"),
      reportId,
      type: "claim",
      sectionId: null,
      amount: 0,
      status: "claimed",
      claimedAt: now,
    };
    writeLocal(KEYS.reportOrders, JSON.stringify([order, ...getReportOrders()].slice(0, 100)));
    return { ok: true, report: normalizeReport(updated), amount: 0, order };
  }

  function createReportConversation(reportId, sectionId) {
    const report = getReport(reportId);
    const section = report?.sections.find((item) => item.id === sectionId);
    if (!report || !section) return null;
    const conversations = getConversations();
    const todayKey = localDateKey();
    let conversation = conversations.find(
      (item) =>
        item.dateKey === todayKey &&
        item.context?.reportId === reportId &&
        item.context?.sectionId === sectionId,
    );
    if (!conversation) {
      const now = new Date().toISOString();
      conversation = normalizeConversation({
        id: createId("conversation"),
        dateKey: todayKey,
        title: `${section.title}解读`,
        messages: [],
        context: {
          type: "report",
          reportId,
          sectionId,
          sectionTitle: section.title,
        },
        createdAt: now,
        updatedAt: now,
      });
      saveConversations([conversation, ...conversations]);
    }
    writeLocal(KEYS.activeConversation, conversation.id);
    return conversation;
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
    FULL_REPORT_PRICE,
    HISTORY_LIMIT,
    PROFILE_LIMIT,
    REPORT_LIMIT,
    REPORT_SECTION_PRICE,
    STORAGE_VERSION,
    appendMessage,
    claimFreeReport,
    consumeQuota,
    createReportConversation,
    deleteProfile,
    dismissFirstReportClaim,
    ensureChatStartedAt,
    getActiveConversation,
    getActiveProfile,
    getActiveProfileId,
    getChatStartedAt,
    getConversations,
    getFirstReportClaim,
    getHistory,
    getProfile,
    getProfiles,
    getPromotionBadge,
    getQuota,
    getOrCreateReport,
    getReport,
    getReportOrders,
    getReportUpgradePrice,
    getReports,
    localDateKey,
    purchaseReport,
    renderPromotionBadge,
    saveHistory,
    setActiveConversation,
    setActiveProfile,
    shouldShowFirstReportClaim,
    upsertProfile,
  });
})(window);
