const chartMethods = window.ChartMethods;
const methodGrid = document.querySelector("#method-grid");
const chartToast = document.querySelector("#chart-toast");
let toastTimer = null;

function renderMethods() {
  methodGrid.innerHTML = chartMethods.methods.map((method) => `
    <a
      class="method-card pressable tone-${method.tone}"
      href="./chart-entry.html?method=${encodeURIComponent(method.id)}"
      aria-label="进入${method.name}"
    >
      <span class="method-icon" aria-hidden="true">${chartMethods.iconMarkup(method)}</span>
      <strong>${method.name}</strong>
      ${method.external ? '<em>外部</em>' : ""}
    </a>`).join("");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  chartToast.textContent = message;
  chartToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => chartToast.classList.remove("is-visible"), 1800);
}

document.addEventListener("click", (event) => {
  if (event.target.closest('[data-action="history"]')) {
    showToast("暂无排盘记录");
  }
});

window.addEventListener("beforeunload", () => window.clearTimeout(toastTimer));
renderMethods();
