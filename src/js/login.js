const loginState = window.GuoxueApp;
const loginForm = document.querySelector("#login-form");
const phoneInput = document.querySelector("#login-phone");
const codeInput = document.querySelector("#login-code");
const sendCodeButton = document.querySelector("#send-login-code");
const loginError = document.querySelector("#login-error");
const loginToast = document.querySelector("#login-toast");

function isValidPhone(value) {
  return /^1[3-9]\d{9}$/.test(value);
}

function returnUrl() {
  const value = new URLSearchParams(window.location.search).get("return");
  if (!value || !/^\.\/[a-z0-9-]+\.html(?:[?#].*)?$/i.test(value)) return "./index.html";
  return value;
}

sendCodeButton.addEventListener("click", () => {
  const phone = phoneInput.value.trim();
  if (!isValidPhone(phone)) {
    loginError.textContent = "请输入正确的 11 位手机号。";
    phoneInput.focus();
    return;
  }
  loginError.textContent = "";
  loginToast.textContent = "演示验证码：123456";
  loginToast.classList.add("is-visible");
  window.setTimeout(() => loginToast.classList.remove("is-visible"), 2400);
  codeInput.focus();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const phone = phoneInput.value.trim();
  if (!isValidPhone(phone)) {
    loginError.textContent = "请输入正确的 11 位手机号。";
    phoneInput.focus();
    return;
  }
  if (codeInput.value.trim() !== "123456") {
    loginError.textContent = "验证码不正确，请输入 123456。";
    codeInput.focus();
    return;
  }
  loginState.login(phone);
  window.location.replace(returnUrl());
});

if (loginState.isLoggedIn()) window.location.replace(returnUrl());
