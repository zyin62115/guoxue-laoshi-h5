const methods = [
  { id: "bazi", name: "生平子时", seal: "命", category: "destiny", categoryLabel: "命理排盘", desc: "四柱命局与十年大运", fields: ["姓名（选填）", "性别", "出生日期与时间", "出生地区", "真太阳时（选填）"], hot: true },
  { id: "dunjia", name: "遁甲学", seal: "遁", category: "decision", categoryLabel: "决策排盘", desc: "九宫格局与时空推演", fields: ["起局日期", "起局时间"], hot: true },
  { id: "qimen", name: "决策学", seal: "策", category: "decision", categoryLabel: "决策排盘", desc: "转盘飞盘，多法起局", fields: ["起局时间", "盘式", "置闰方式", "真太阳时（选填）"], hot: true },
  { id: "yinpan", name: "阴盘决策", seal: "阴", category: "decision", categoryLabel: "决策排盘", desc: "时盘刻盘与终身局", fields: ["起局时间", "性别", "所排事项（选填）", "时盘 / 刻盘"], hot: false },
  { id: "meihua", name: "梅花学", seal: "梅", category: "decision", categoryLabel: "易学起盘", desc: "时间、随机、报数起卦", fields: ["起盘方式", "日期与时间", "起盘参数"], hot: true },
  { id: "liuyao", name: "逻辑学", seal: "爻", category: "decision", categoryLabel: "易学起盘", desc: "铜钱、盘名、背数起盘", fields: ["起盘方式", "排盘时间", "占问内容（选填）"], hot: false },
  { id: "ziwei", name: "星像学", seal: "星", category: "destiny", categoryLabel: "命理排盘", desc: "十二宫盘与大限流年", fields: ["姓名", "性别", "出生日期与时间"], hot: true },
  { id: "name", name: "姓名学", seal: "名", category: "destiny", categoryLabel: "姓名测算", desc: "三才五格与六格分析", fields: ["姓", "名", "排盘类型"], hot: false },
  { id: "number", name: "数字规律", seal: "数", category: "destiny", categoryLabel: "命理测算", desc: "先后天数与数组解读", fields: ["姓名", "性别", "出生日期与时间"], hot: false },
  { id: "direction", name: "山向决策", seal: "向", category: "decision", categoryLabel: "堪舆排盘", desc: "山向度数与九宫盘象", fields: ["所排事项（选填）", "山向度数", "排盘年份"], hot: false },
  { id: "flying", name: "玄空飞星", seal: "玄", category: "decision", categoryLabel: "堪舆排盘", desc: "九宫飞星与二十四山", fields: ["排盘时间", "大运", "山向", "盘式", "备注（选填）"], hot: false },
  { id: "library", name: "观复字库", seal: "观", category: "tools", categoryLabel: "文化工具", desc: "古文字形与文化释义", fields: ["输入要查询的汉字"], external: true },
  { id: "kangxi", name: "康熙字典", seal: "康", category: "tools", categoryLabel: "文化工具", desc: "繁体笔画与字义查询", fields: ["姓名（最多 4 字）"], external: false },
];

const versionMeta = {
  a: { label: "典藏宫格｜沉稳、品牌感强", className: "version-a", theme: "#f5efe5" },
  b: { label: "星盘中枢｜沉浸、专业感强", className: "version-b", theme: "#0f2525" },
  c: { label: "清雅工具台｜清晰、查找高效", className: "version-c", theme: "#edf6f2" },
};

const chartApp = document.querySelector("#chart-app");
const quickGrid = document.querySelector("#quick-grid");
const methodGrid = document.querySelector("#method-grid");
const description = document.querySelector("#review-description");
const sheetLayer = document.querySelector("#sheet-layer");
const sheetTitle = document.querySelector("#sheet-title");
const sheetSeal = document.querySelector("#sheet-seal");
const sheetCategory = document.querySelector("#sheet-category");
const sheetSummary = document.querySelector("#sheet-summary");
const fieldPreview = document.querySelector("#field-preview");
const toast = document.querySelector("#prototype-toast");
let activeFilter = "all";
let selectedMethod = null;
let toastTimer = null;

function methodCard(method, compact = false) {
  return `
    <button class="method-card${compact ? " quick-card" : ""}" type="button" data-method="${method.id}">
      <span class="method-icon" aria-hidden="true"><i>${method.seal}</i></span>
      <span class="method-copy"><strong>${method.name}</strong><small>${method.desc}</small></span>
      ${method.external ? '<em>外部</em>' : ""}
      <b aria-hidden="true">›</b>
    </button>`;
}

function renderMethods() {
  const visible = methods.filter((method) => activeFilter === "all" || method.category === activeFilter);
  methodGrid.innerHTML = visible.map((method) => methodCard(method)).join("");
}

function render() {
  quickGrid.innerHTML = methods.filter((method) => method.hot).slice(0, 4).map((method) => methodCard(method, true)).join("");
  renderMethods();
}

function setVersion(version, updateUrl = true) {
  const meta = versionMeta[version] || versionMeta.a;
  chartApp.className = `chart-app ${meta.className}`;
  description.textContent = meta.label;
  document.querySelector('meta[name="theme-color"]').content = meta.theme;
  document.querySelectorAll(".version-tab").forEach((tab) => {
    const active = tab.dataset.version === version;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  if (updateUrl) history.replaceState(null, "", `${location.pathname}?v=${version}`);
}

function openSheet(method) {
  selectedMethod = method;
  sheetSeal.textContent = method.seal;
  sheetTitle.textContent = method.name;
  sheetCategory.textContent = method.categoryLabel;
  sheetSummary.textContent = method.desc;
  fieldPreview.innerHTML = method.fields.map((field, index) => `
    <div class="preview-field">
      <span>${index + 1}</span><label>${field}</label><i>›</i>
    </div>`).join("");
  sheetLayer.classList.add("is-open");
  sheetLayer.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
}

function closeSheet() {
  sheetLayer.classList.remove("is-open");
  sheetLayer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

document.addEventListener("click", (event) => {
  const versionTab = event.target.closest("[data-version]");
  if (versionTab) setVersion(versionTab.dataset.version);

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === filter));
    renderMethods();
  }

  const methodButton = event.target.closest("[data-method]");
  if (methodButton) openSheet(methods.find((method) => method.id === methodButton.dataset.method));

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "close-sheet") closeSheet();
  if (action === "history") showToast("排盘记录将在正式版接入");
  if (action === "enter-chart" && selectedMethod) {
    showToast(`${selectedMethod.name}表单将在确认方案后继续设计`);
    closeSheet();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sheetLayer.classList.contains("is-open")) closeSheet();
});

render();
setVersion(new URLSearchParams(location.search).get("v") || "a", false);
