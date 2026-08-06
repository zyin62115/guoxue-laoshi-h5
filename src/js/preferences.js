(function initializeGuoxuePreferences(global) {
  const STORAGE_KEY = "guoxueUserPreferencesV1";
  const NICKNAME_LIMIT = 12;
  const AVATARS = Object.freeze({
    mountain: Object.freeze({ label: "远山", glyph: "山" }),
    water: Object.freeze({ label: "流水", glyph: "水" }),
    bamboo: Object.freeze({ label: "青竹", glyph: "竹" }),
    moon: Object.freeze({ label: "明月", glyph: "月" }),
  });
  const FONT_SIZES = Object.freeze(["small", "standard", "large"]);
  const DEFAULTS = Object.freeze({
    nickname: "访客",
    avatarId: "mountain",
    fontSize: "standard",
  });
  let memoryFallback = null;

  function normalize(value) {
    const source = value && typeof value === "object" ? value : {};
    const nickname = typeof source.nickname === "string" ? source.nickname.trim() : "";
    return {
      nickname:
        nickname && nickname.length <= NICKNAME_LIMIT ? nickname : DEFAULTS.nickname,
      avatarId: Object.hasOwn(AVATARS, source.avatarId)
        ? source.avatarId
        : DEFAULTS.avatarId,
      fontSize: FONT_SIZES.includes(source.fontSize) ? source.fontSize : DEFAULTS.fontSize,
    };
  }

  function readStored() {
    try {
      const raw = global.localStorage?.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : memoryFallback;
    } catch {
      return memoryFallback;
    }
  }

  function getPreferences() {
    return normalize(readStored());
  }

  function applyFontSize(fontSize) {
    const normalized = FONT_SIZES.includes(fontSize) ? fontSize : DEFAULTS.fontSize;
    document.documentElement.dataset.fontSize = normalized;
    return normalized;
  }

  function updatePreferences(patch) {
    const preferences = normalize({ ...getPreferences(), ...patch });
    memoryFallback = preferences;
    try {
      global.localStorage?.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Keep the current-page fallback when browser storage is unavailable.
    }
    applyFontSize(preferences.fontSize);
    return { ...preferences };
  }

  function getAvatar(id) {
    const avatarId = Object.hasOwn(AVATARS, id) ? id : DEFAULTS.avatarId;
    return { id: avatarId, ...AVATARS[avatarId] };
  }

  const preferences = getPreferences();
  applyFontSize(preferences.fontSize);

  global.GuoxuePreferences = Object.freeze({
    AVATARS,
    DEFAULTS,
    FONT_SIZES,
    NICKNAME_LIMIT,
    STORAGE_KEY,
    applyFontSize,
    getAvatar,
    getPreferences,
    updatePreferences,
  });
})(window);
