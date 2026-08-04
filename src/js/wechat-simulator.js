const backLink = document.querySelector("#wechat-simulator-back");
const status = document.querySelector("#wechat-simulator-status");
const description = document.querySelector("#wechat-simulator-description");
const returnTarget = new URLSearchParams(window.location.search).get("return");
let reportId = null;

if (returnTarget?.startsWith("./interpretation.html")) {
  backLink.href = returnTarget;
  reportId = new URL(returnTarget, window.location.href).searchParams.get("report");
}

backLink.addEventListener("click", (event) => {
  if (!reportId) return;
  event.preventDefault();
  const result = window.GuoxueApp.claimFreeReport(reportId);
  if (!result.ok) {
    status.textContent = "暂时无法解锁";
    description.textContent = "没有找到原报告，请返回国心解读后重新生成。";
    return;
  }
  backLink.textContent = "报告已解锁，正在返回…";
  backLink.setAttribute("aria-disabled", "true");
  window.setTimeout(() => {
    window.location.href = backLink.href;
  }, 350);
});
