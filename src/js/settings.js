const preferencesState = window.GuoxuePreferences;
if (!window.GuoxueApp.isLoggedIn()) {
  window.location.replace("./login.html?return=./settings.html");
}
const profileForm = document.querySelector("#settings-profile-form");
const nicknameInput = document.querySelector("#settings-nickname");
const nicknameAvatar = document.querySelector("#settings-nickname-avatar");
const settingsError = document.querySelector("#settings-error");
const fontOptions = document.querySelector("#settings-font-options");
const settingsToast = document.querySelector("#settings-toast");
const accountSection = document.querySelector("#settings-account");
const accountPhone = document.querySelector("#settings-account-phone");
const logoutButton = document.querySelector("#settings-logout");
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
  const user = window.GuoxueApp.getCurrentUser();
  accountSection.hidden = !user;
  if (user) accountPhone.textContent = `${user.phone.slice(0, 3)}****${user.phone.slice(-4)}`;
}

logoutButton.addEventListener("click", () => {
  window.GuoxueApp.logout();
  window.location.replace("./index.html");
});

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
