const reportState = window.GuoxueApp;
const reportsPageList = document.querySelector("#reports-page-list");

function formatReportDate(value) {
  return new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderReports() {
  const reports = reportState.getReports();
  if (!reports.length) {
    const empty = document.createElement("a");
    empty.className = "collection-empty pressable";
    empty.href = "./interpretation.html";
    empty.innerHTML = "<span>报</span><strong>还没有报告</strong><small>选择一份档案，生成第一份国心解读</small>";
    reportsPageList.replaceChildren(empty);
    return;
  }

  reportsPageList.replaceChildren(
    ...reports.map((report) => {
      const link = document.createElement("a");
      link.className = "report-page-card pressable";
      link.href = `./interpretation.html?report=${encodeURIComponent(report.id)}`;
      const unlocked = report.fullUnlocked ? 8 : report.unlockedSectionIds.length;
      link.innerHTML = `
        <span class="report-page-mark" aria-hidden="true">解</span>
        <span class="report-page-copy"><strong></strong><small></small><time></time></span>
        <i aria-hidden="true"></i>`;
      link.querySelector("strong").textContent = `${report.profileSnapshot?.name || "我的"}的国心解读`;
      link.querySelector("small").textContent = report.fullUnlocked
        ? "查看完整报告 · 已永久解锁"
        : `继续试读 · 已解锁 ${unlocked}/8`;
      link.querySelector("time").textContent = formatReportDate(report.updatedAt);
      return link;
    }),
  );
}

window.addEventListener("pageshow", renderReports);
renderReports();
