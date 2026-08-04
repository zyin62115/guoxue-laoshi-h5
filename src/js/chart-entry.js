const params = new URLSearchParams(window.location.search);
const method = window.ChartMethods.getMethod(params.get("method"));
const entryTitle = document.querySelector("#entry-title");
const entryCategory = document.querySelector("#entry-category");
const entryMethodIcon = document.querySelector("#entry-method-icon");
const entryHeading = document.querySelector("#entry-heading");
const entryDescription = document.querySelector("#entry-description");
const formFields = document.querySelector("#form-fields");
const chartForm = document.querySelector("#chart-form");
const formError = document.querySelector("#form-error");
const chartSubmit = document.querySelector("#chart-submit");
const entryToast = document.querySelector("#entry-toast");
const helpLink = document.querySelector(".entry-help");
let toastTimer = null;

function fieldControl(field) {
  const required = field.optional ? "" : " required";
  const common = `id="${field.id}" name="${field.id}"${required}`;
  if (field.type === "select") {
    return `<select ${common}>${field.options.map((option) => `<option value="${option}">${option}</option>`).join("")}</select>`;
  }
  if (field.type === "textarea") {
    return `<textarea ${common} placeholder="${field.placeholder || ""}"${field.maxlength ? ` maxlength="${field.maxlength}"` : ""}></textarea>`;
  }
  if (field.type === "checkbox") {
    return `<label class="switch"><input ${common} type="checkbox"><span aria-hidden="true"></span><b>开启</b></label>`;
  }
  return `<input ${common} type="${field.type}" placeholder="${field.placeholder || ""}"${field.maxlength ? ` maxlength="${field.maxlength}"` : ""}${field.min !== undefined ? ` min="${field.min}"` : ""}${field.max !== undefined ? ` max="${field.max}"` : ""}>`;
}

function renderField(field) {
  return `<div class="form-field${field.type === "checkbox" ? " checkbox-field" : ""}">
    <label for="${field.id}">${field.label}${field.optional ? "<small>选填</small>" : ""}</label>
    ${fieldControl(field)}
  </div>`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  entryToast.textContent = message;
  entryToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => entryToast.classList.remove("is-visible"), 2000);
}

if (!method) {
  window.location.replace("./chart-prototypes.html");
} else {
  document.title = `${method.name} · 专业排盘`;
  entryTitle.textContent = method.name;
  entryCategory.textContent = method.category;
  entryMethodIcon.className = `entry-method-icon tone-${method.tone}`;
  entryMethodIcon.innerHTML = window.ChartMethods.iconMarkup(method);
  entryHeading.textContent = `${method.name}信息`;
  entryDescription.textContent = method.desc;
  formFields.innerHTML = method.fields.map(renderField).join("");
  chartSubmit.textContent = method.action;
  helpLink.href = `./wechat-simulator.html?context=chart&return=${encodeURIComponent(`./chart-entry.html?method=${method.id}`)}`;
}

chartForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!chartForm.checkValidity()) {
    formError.textContent = "请完成必填信息后再排盘";
    chartForm.reportValidity();
    return;
  }
  formError.textContent = "";
  showToast("信息已保存，排盘算法将在下一阶段接入");
});

window.addEventListener("beforeunload", () => window.clearTimeout(toastTimer));
