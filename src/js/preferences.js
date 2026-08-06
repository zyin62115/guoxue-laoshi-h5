(function initializeGuoxuePreferences(global) {
  const STORAGE_KEY = "guoxueUserPreferencesV1";
  const NICKNAME_LIMIT = 12;
  const FONT_SIZES = Object.freeze(["small", "standard", "large"]);
  const DEFAULTS = Object.freeze({
    nickname: "访客",
    fontSize: "standard",
  });
  let memoryFallback = null;

  function normalize(value) {
    const source = value && typeof value === "object" ? value : {};
    const nickname = typeof source.nickname === "string" ? source.nickname.trim() : "";
    return {
      nickname:
        nickname && nickname.length <= NICKNAME_LIMIT ? nickname : DEFAULTS.nickname,
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

  const preferences = getPreferences();
  applyFontSize(preferences.fontSize);

  global.GuoxuePreferences = Object.freeze({
    DEFAULTS,
    FONT_SIZES,
    NICKNAME_LIMIT,
    STORAGE_KEY,
    applyFontSize,
    getPreferences,
    updatePreferences,
  });
})(window);
