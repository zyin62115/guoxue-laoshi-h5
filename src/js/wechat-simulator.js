const backLink = document.querySelector("#wechat-simulator-back");
const returnTarget = new URLSearchParams(window.location.search).get("return");

if (returnTarget?.startsWith("./interpretation.html")) {
  backLink.href = returnTarget;
}
