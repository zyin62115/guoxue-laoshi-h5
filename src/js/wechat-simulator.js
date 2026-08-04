const backLink = document.querySelector("#wechat-simulator-back");
const title = document.querySelector("#wechat-simulator-title");
const copy = document.querySelector("#wechat-simulator-copy");
const status = document.querySelector("#wechat-simulator-status");
const description = document.querySelector("#wechat-simulator-description");
const searchParams = new URLSearchParams(window.location.search);
const returnTarget = searchParams.get("return");
const context = searchParams.get("context");
let reportId = null;

if (returnTarget?.startsWith("./interpretation.html")) {
  backLink.href = returnTarget;
  reportId = new URL(returnTarget, window.location.href).searchParams.get("report");
}

if (context === "chart") {
  title.textContent = "已进入排盘顾问添加流程";
  copy.textContent = "正式接入后，这里将打开企业微信客服，为你提供排盘使用与结果说明。";
  status.textContent = "模拟添加已完成";
  description.textContent = "本次不会真实添加微信，也不会上传你填写的排盘信息。";
  backLink.textContent = "完成添加，返回专业排盘";
  if (returnTarget?.startsWith("./chart-prototypes.html") || returnTarget?.startsWith("./chart-entry.html")) {
    backLink.href = returnTarget;
  } else {
    backLink.href = "./chart-prototypes.html";
  }
}

backLink.addEventListener("click", (event) => {
  if (context === "chart") return;
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
