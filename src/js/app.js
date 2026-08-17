const CONSULTATION_URL =
  "https://gx.yipuwh.com/h6/pages/jiedu/chat?isShowPay=0&projectCode=qingzhou";
const GUIDE_START_DAY = Date.UTC(2026, 7, 17);
const DAILY_GUIDES = window.GuoxueDailyGuides;

const pressables = document.querySelectorAll("[data-action]");
const questionInput = document.querySelector("#home-question");
const actionButton = document.querySelector("#home-action");
const voiceDock = document.querySelector(".voice-dock");
const scrollTopButton = document.querySelector("#scroll-top-button");
const appToast = document.querySelector("#app-toast");
const interpretationButton = document.querySelector('[data-action="interpretation"]');
const professionalChartButton = document.querySelector('[data-action="professional-chart"]');
const learningMaterialsButton = document.querySelector('[data-action="learning-materials"]');
const guideDate = document.querySelector("#guide-date");
const guideDateText = document.querySelector("#guide-date-text");
const guideContent = document.querySelector("#guide-content");
const guideGood = document.querySelector("#guide-good");
const guideAvoid = document.querySelector("#guide-avoid");
const imageUploadButton = document.querySelector("#home-image-upload");
const imageInput = document.querySelector("#home-image-input");
const imagePreview = document.querySelector("#home-image-preview");
const imagePreviewImage = document.querySelector("#home-image-preview-image");
const imagePreviewName = document.querySelector("#home-image-preview-name");
const imageRemoveButton = document.querySelector("#home-image-remove");

let isComposing = false;
let scrollTicking = false;
let toastTimer = null;
let dailyGuideTimer = null;
let imageComposer = null;

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function lunarDayName(day) {
  const days = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
  ];
  return days[Number(day) - 1] || day;
}

function formatGuideDate(date) {
  try {
    const formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    );
    if (parts.month && parts.day) {
      return `${parts.month}${lunarDayName(parts.day)}`;
    }
  } catch {
    // 不支持农历日历的浏览器回退到本地公历日期。
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getDailyGuideIndex(date) {
  const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const elapsedDays = Math.floor((localDay - GUIDE_START_DAY) / 86400000);
  return elapsedDays < 0 ? 0 : elapsedDays % DAILY_GUIDES.length;
}

function renderDailyGuide() {
  const now = new Date();
  const guide = DAILY_GUIDES[getDailyGuideIndex(now)];
  guideDate.dateTime = localDateKey(now);
  guideDateText.textContent = formatGuideDate(now);
  guideContent.textContent = guide.lines.join("");
  guideGood.textContent = guide.good;
  guideAvoid.textContent = guide.avoid;

  if (dailyGuideTimer) window.clearTimeout(dailyGuideTimer);
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  dailyGuideTimer = window.setTimeout(renderDailyGuide, nextDay.getTime() - now.getTime() + 1000);
}

function clearPressedState(element) {
  element.classList.remove("is-pressed");
}

pressables.forEach((element) => {
  element.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    element.classList.add("is-pressed");
  });
  element.addEventListener("pointerup", () => clearPressedState(element));
  element.addEventListener("pointercancel", () => clearPressedState(element));
  element.addEventListener("pointerleave", () => clearPressedState(element));
  element.addEventListener("blur", () => clearPressedState(element));
});

function syncActionState() {
  actionButton.disabled = !(questionInput.value.trim() || imageComposer?.hasImage());
}

function openConsultation() {
  if (!questionInput.value.trim() && !imageComposer?.hasImage()) {
    syncActionState();
    return;
  }
  window.location.assign(CONSULTATION_URL);
}

function syncScrollTopButton() {
  const visible = window.scrollY >= window.innerHeight;
  scrollTopButton.classList.toggle("is-visible", visible);
  scrollTopButton.setAttribute("aria-hidden", String(!visible));
  scrollTopButton.tabIndex = visible ? 0 : -1;
}

function queueScrollStateUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    syncScrollTopButton();
    scrollTicking = false;
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  appToast.textContent = message;
  appToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    appToast.classList.remove("is-visible");
  }, 1800);
}

imageComposer = window.GuoxueImageAttachments.bindComposer({
  dock: voiceDock,
  uploadButton: imageUploadButton,
  fileInput: imageInput,
  preview: imagePreview,
  previewImage: imagePreviewImage,
  previewName: imagePreviewName,
  removeButton: imageRemoveButton,
  onChange: syncActionState,
  showError: showToast,
});

professionalChartButton.addEventListener("click", () => {
  window.location.href = "./chart-prototypes.html";
});
interpretationButton.addEventListener("click", () => {
  window.location.assign(CONSULTATION_URL);
});
learningMaterialsButton.addEventListener("click", () => {
  window.location.href = "./wechat-simulator.html?context=learning-materials&return=./index.html";
});

questionInput.addEventListener("input", syncActionState);
questionInput.addEventListener("compositionstart", () => {
  isComposing = true;
});
questionInput.addEventListener("compositionend", () => {
  isComposing = false;
  syncActionState();
});
questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing && !isComposing) {
    event.preventDefault();
    openConsultation();
  }
});

actionButton.addEventListener("click", openConsultation);
scrollTopButton.addEventListener("click", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});

window.addEventListener("scroll", queueScrollStateUpdate, { passive: true });
window.addEventListener("resize", queueScrollStateUpdate);
window.addEventListener("pageshow", () => {
  renderDailyGuide();
  syncActionState();
  syncScrollTopButton();
});
window.addEventListener("focus", renderDailyGuide);
window.addEventListener("beforeunload", () => {
  if (toastTimer) window.clearTimeout(toastTimer);
  if (dailyGuideTimer) window.clearTimeout(dailyGuideTimer);
});

renderDailyGuide();
syncActionState();
syncScrollTopButton();
