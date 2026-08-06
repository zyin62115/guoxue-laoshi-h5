const preferencesState = window.GuoxuePreferences;
const profileForm = document.querySelector("#settings-profile-form");
const nicknameInput = document.querySelector("#settings-nickname");
const nicknameAvatar = document.querySelector("#settings-nickname-avatar");
const settingsError = document.querySelector("#settings-error");
const fontOptions = document.querySelector("#settings-font-options");
const settingsToast = document.querySelector("#settings-toast");
let toastTimer = null;

function showToast(message) {
  window.clearTimeout(toastTimer);
  settingsToast.textContent = message;
  settingsToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => settingsToast.classList.remove("is-visible"), 1800);
}

function selectOption(name, value) {
  const input = document.querySelector(`[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function renderPreferences() {
  const preferences = preferencesState.getPreferences();
  nicknameInput.value = preferences.nickname;
  nicknameAvatar.textContent = Array.from(preferences.nickname)[0];
  selectOption("fontSize", preferences.fontSize);
}

nicknameInput.addEventListener("input", () => {
  const nickname = nicknameInput.value.trim();
  nicknameAvatar.textContent = nickname ? Array.from(nickname)[0] : "访";
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    settingsError.textContent = "请输入昵称。";
    nicknameInput.focus();
    return;
  }
  if (nickname.length > preferencesState.NICKNAME_LIMIT) {
    settingsError.textContent = `昵称不能超过 ${preferencesState.NICKNAME_LIMIT} 个字符。`;
    nicknameInput.focus();
    return;
  }

  preferencesState.updatePreferences({ nickname });
  nicknameInput.value = nickname;
  settingsError.textContent = "";
  showToast("个人资料已保存");
});

fontOptions.addEventListener("change", (event) => {
  if (event.target.name !== "fontSize") return;
  preferencesState.updatePreferences({ fontSize: event.target.value });
  showToast("字体大小已调整");
});

window.addEventListener("pageshow", renderPreferences);
renderPreferences();
