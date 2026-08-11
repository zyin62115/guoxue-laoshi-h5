const chartMethods = window.ChartMethods;
const methodGrid = document.querySelector("#method-grid");

function renderMethods() {
  methodGrid.innerHTML = chartMethods.methods.map((method) => {
    const href = method.href || `./chart-entry.html?method=${encodeURIComponent(method.id)}`;
    return `
    <a
      class="method-card pressable tone-${method.tone}"
      href="${href}"
      aria-label="进入${method.name}"
    >
      <span class="method-icon" aria-hidden="true">${chartMethods.iconMarkup(method)}</span>
      <strong>${method.name}</strong>
      ${method.external ? '<em>外部</em>' : ""}
    </a>`;
  }).join("");
}

renderMethods();
