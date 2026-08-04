const iconPaths = {
  bazi: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="15"/><path d="M32 17v5M47 32h-5M32 47v-5M17 32h5M32 25v9l7 4"/>`,
  dunjia: `<path d="M14 13c6-3 12-3 18 0v38c-6-3-12-3-18 0V13ZM50 13c-6-3-12-3-18 0v38c6-3 12-3 18 0V13Z"/><path d="M20 22h7M20 30h7M37 22h7M37 30h7"/>`,
  qimen: `<rect x="12" y="12" width="40" height="40" rx="4"/><path d="M25 12v40M39 12v40M12 25h40M12 39h40"/><circle cx="32" cy="32" r="5"/>`,
  yinpan: `<path d="m32 8 8 4 8 8 4 12-4 12-8 8-8 4-8-4-8-8-4-12 4-12 8-8 8-4Z"/><path d="M32 20a12 12 0 1 0 0 24 6 6 0 0 0 0-12 6 6 0 0 1 0-12Z"/><circle cx="32" cy="26" r="1.5"/><circle cx="32" cy="38" r="1.5"/>`,
  meihua: `<path d="M32 29c-13-3-14-15-7-18 5-2 8 4 7 12M32 29c3-13 15-14 18-7 2 5-4 8-12 7M32 29c13 3 14 15 7 18-5 2-8-4-7-12M32 29c-3 13-15 14-18 7-2-5 4-8 12-7"/><circle cx="32" cy="29" r="5"/><path d="M35 34c5 7 9 12 15 17"/>`,
  liuyao: `<circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="6"/><path d="M32 11v42M11 32h42"/>`,
  ziwei: `<circle cx="32" cy="32" r="7"/><ellipse cx="32" cy="32" rx="24" ry="11"/><ellipse cx="32" cy="32" rx="11" ry="24" transform="rotate(35 32 32)"/><path d="m48 14 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4Z"/>`,
  name: `<path d="M15 13h27l7 7v31H15V13Z"/><path d="M42 13v8h8M22 27h18M22 35h14M22 43h10"/><path d="m45 38 7 7-13 9-5 1 2-5 9-12Z"/>`,
  number: `<rect x="11" y="14" width="42" height="36" rx="4"/><path d="M18 22h28M18 30h28M18 38h28M18 46h28"/><circle cx="25" cy="22" r="3"/><circle cx="39" cy="30" r="3"/><circle cx="30" cy="38" r="3"/><circle cx="43" cy="46" r="3"/>`,
  direction: `<path d="M9 47 22 28l8 11 7-10 18 18"/><circle cx="32" cy="38" r="15"/><path d="m37 31-3 9-9 3 3-9 9-3Z"/>`,
  flying: `<rect x="12" y="12" width="40" height="40" rx="3"/><path d="M25 12v40M39 12v40M12 25h40M12 39h40"/><path d="m32 21 2.5 7.5H42l-6 4.5 2.2 7-6.2-4-6.2 4 2.2-7-6-4.5h7.5L32 21Z"/>`,
  library: `<path d="M13 14c7-3 13-2 19 2v36c-6-4-12-5-19-2V14ZM51 14c-7-3-13-2-19 2v36c6-4 12-5 19-2V14Z"/><path d="M22 27h4M20 35h8M38 27h6M38 35h6"/>`,
  kangxi: `<path d="M14 10h30l7 7v37H18c-3 0-5-2-5-5s2-5 5-5h26V10"/><path d="M22 19h15M22 27h19M22 35h15"/><path d="M44 10v34"/>`,
};

const methods = [
  { id: "bazi", name: "生平子时", category: "命理排盘", tone: "orange", desc: "四柱命局与十年大运", fields: ["姓名（选填）", "性别", "出生日期与时间", "出生地区", "真太阳时（选填）"] },
  { id: "dunjia", name: "遁甲学", category: "决策排盘", tone: "blue", desc: "九宫格局与时空推演", fields: ["起局日期", "起局时间"] },
  { id: "qimen", name: "决策学", category: "决策排盘", tone: "orange", desc: "转盘飞盘，多法起局", fields: ["起局时间", "盘式", "置闰方式", "真太阳时（选填）"] },
  { id: "yinpan", name: "阴盘决策", category: "决策排盘", tone: "orange", desc: "时盘刻盘与终身局", fields: ["起局时间", "性别", "所排事项（选填）", "时盘 / 刻盘"] },
  { id: "meihua", name: "梅花学", category: "易学起盘", tone: "orange", desc: "时间、随机、报数起卦", fields: ["起盘方式", "日期与时间", "起盘参数"] },
  { id: "liuyao", name: "逻辑学", category: "易学起盘", tone: "blue", desc: "铜钱、盘名、背数起盘", fields: ["起盘方式", "排盘时间", "占问内容（选填）"] },
  { id: "ziwei", name: "星像学", category: "命理排盘", tone: "orange", desc: "十二宫盘与大限流年", fields: ["姓名", "性别", "出生日期与时间"] },
  { id: "name", name: "姓名学", category: "姓名测算", tone: "blue", desc: "三才五格与六格分析", fields: ["姓", "名", "排盘类型"] },
  { id: "number", name: "数字规律", category: "命理测算", tone: "orange", desc: "先后天数与数组解读", fields: ["姓名", "性别", "出生日期与时间"] },
  { id: "direction", name: "山向决策", category: "堪舆排盘", tone: "blue", desc: "山向度数与九宫盘象", fields: ["所排事项（选填）", "山向度数", "排盘年份"] },
  { id: "flying", name: "玄空飞星", category: "堪舆排盘", tone: "orange", desc: "九宫飞星与二十四山", fields: ["排盘时间", "大运", "山向", "盘式", "备注（选填）"] },
  { id: "library", name: "观复字库", category: "文化工具", tone: "blue", desc: "古文字形与文化释义", fields: ["输入要查询的汉字"], external: true },
  { id: "kangxi", name: "康熙字典", category: "文化工具", tone: "orange", desc: "繁体笔画与字义查询", fields: ["姓名（最多 4 字）"] },
];

const methodGrid = document.querySelector("#method-grid");
const sheetLayer = document.querySelector("#sheet-layer");
const entrySheet = document.querySelector("#entry-sheet");
const sheetIcon = document.querySelector("#sheet-icon");
const sheetTitle = document.querySelector("#sheet-title");
const sheetCategory = document.querySelector("#sheet-category");
const sheetSummary = document.querySelector("#sheet-summary");
const fieldPreview = document.querySelector("#field-preview");
const chartToast = document.querySelector("#chart-toast");
let selectedMethod = null;
let activeTrigger = null;
let toastTimer = null;

function iconMarkup(method) {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${iconPaths[method.id]}</svg>`;
}

function renderMethods() {
  methodGrid.innerHTML = methods.map((method) => `
    <button
      class="method-card pressable tone-${method.tone}"
      type="button"
      data-method="${method.id}"
      aria-label="进入${method.name}"
      aria-haspopup="dialog"
      aria-expanded="false"
    >
      <span class="method-icon" aria-hidden="true">${iconMarkup(method)}</span>
      <strong>${method.name}</strong>
      ${method.external ? '<em>外部</em>' : ""}
    </button>`).join("");
}

function openSheet(method, trigger) {
  selectedMethod = method;
  activeTrigger = trigger;
  sheetIcon.className = `sheet-icon tone-${method.tone}`;
  sheetIcon.innerHTML = iconMarkup(method);
  sheetTitle.textContent = method.name;
  sheetCategory.textContent = method.category;
  sheetSummary.textContent = method.desc;
  fieldPreview.innerHTML = method.fields.map((field, index) => `
    <div class="preview-field">
      <span>${index + 1}</span>
      <label>${field}</label>
      <i aria-hidden="true">›</i>
    </div>`).join("");
  document.querySelectorAll("[data-method]").forEach((button) => {
    button.setAttribute("aria-expanded", String(button === trigger));
  });
  sheetLayer.classList.add("is-open");
  sheetLayer.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
  requestAnimationFrame(() => entrySheet.focus());
}

function closeSheet({ restoreFocus = true } = {}) {
  sheetLayer.classList.remove("is-open");
  sheetLayer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
  document.querySelectorAll("[data-method]").forEach((button) => button.setAttribute("aria-expanded", "false"));
  if (restoreFocus && activeTrigger) activeTrigger.focus();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  chartToast.textContent = message;
  chartToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => chartToast.classList.remove("is-visible"), 1800);
}

function trapSheetFocus(event) {
  if (event.key !== "Tab") return;
  const focusable = [...entrySheet.querySelectorAll("button:not([disabled])")];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && (document.activeElement === first || document.activeElement === entrySheet)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

document.addEventListener("click", (event) => {
  const methodButton = event.target.closest("[data-method]");
  if (methodButton) {
    const method = methods.find((item) => item.id === methodButton.dataset.method);
    if (method) openSheet(method, methodButton);
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "close-sheet") closeSheet();
  if (action === "history") showToast("排盘记录功能开发中");
  if (action === "enter-chart" && selectedMethod) {
    closeSheet();
    showToast(`${selectedMethod.name}表单将在下一阶段接入`);
  }
});

document.addEventListener("keydown", (event) => {
  if (!sheetLayer.classList.contains("is-open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeSheet();
    return;
  }
  trapSheetFocus(event);
});

window.addEventListener("beforeunload", () => window.clearTimeout(toastTimer));

renderMethods();
