const calendarGrid = document.querySelector("#calendar-grid");
const calendarTitle = document.querySelector("#calendar-title");
const monthPicker = document.querySelector("#month-picker");
const previousMonthButton = document.querySelector("#previous-month");
const nextMonthButton = document.querySelector("#next-month");
const todayButton = document.querySelector("#today-button");
const selectedWeekday = document.querySelector("#selected-weekday");
const selectedDay = document.querySelector("#selected-day");
const selectedSolar = document.querySelector("#selected-solar");
const selectedLunar = document.querySelector("#selected-lunar");
const selectedGanzhi = document.querySelector("#selected-ganzhi");

const today = startOfDay(new Date());
let selectedDate = today;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getLunarParts(date) {
  try {
    const formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    );
  } catch (error) {
    return null;
  }
}

function lunarDayName(day) {
  const days = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
  ];
  return days[Number(day) - 1] || day;
}

function lunarText(date, compact = false) {
  const parts = getLunarParts(date);
  if (!parts) return compact ? "" : "农历信息暂不可用";
  const day = lunarDayName(parts.day);
  if (compact) return day === "初一" ? parts.month : day;
  const year = parts.yearName ? `${parts.yearName}年 ` : "";
  return `农历 ${year}${parts.month}${day}`;
}

function renderSelectedDate() {
  selectedWeekday.textContent = new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
  }).format(selectedDate);
  selectedDay.textContent = selectedDate.getDate();
  selectedSolar.textContent = `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`;
  selectedLunar.textContent = lunarText(selectedDate);

  const parts = getLunarParts(selectedDate);
  const zodiac = parts?.yearName
    ? new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { year: "long" }).format(selectedDate)
    : "传统历法日期";
  selectedGanzhi.textContent = zodiac;
}

function createDayButton(date) {
  const button = document.createElement("button");
  const isOutside = date.getMonth() !== visibleMonth.getMonth();
  button.type = "button";
  button.className = "calendar-day pressable";
  button.classList.toggle("is-outside", isOutside);
  button.classList.toggle("is-today", sameDay(date, today));
  button.classList.toggle("is-selected", sameDay(date, selectedDate));
  button.dataset.date = dateKey(date);
  button.setAttribute("role", "gridcell");
  button.setAttribute("aria-selected", String(sameDay(date, selectedDate)));
  button.setAttribute(
    "aria-label",
    `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日，${lunarText(date)}`,
  );

  const solar = document.createElement("b");
  solar.textContent = date.getDate();
  const lunar = document.createElement("small");
  lunar.textContent = lunarText(date, true);
  button.append(solar, lunar);
  return button;
}

function renderCalendar() {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  calendarTitle.textContent = `${year}年 ${month + 1}月`;
  monthPicker.value = `${year}-${String(month + 1).padStart(2, "0")}`;

  const gridStart = new Date(year, month, 1 - new Date(year, month, 1).getDay());
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 42; index += 1) {
    fragment.append(
      createDayButton(
        new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index),
      ),
    );
  }
  calendarGrid.replaceChildren(fragment);
  renderSelectedDate();
}

function changeMonth(offset) {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
  selectedDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  renderCalendar();
}

previousMonthButton.addEventListener("click", () => changeMonth(-1));
nextMonthButton.addEventListener("click", () => changeMonth(1));
todayButton.addEventListener("click", () => {
  selectedDate = today;
  visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
});

monthPicker.addEventListener("change", () => {
  const [year, month] = monthPicker.value.split("-").map(Number);
  if (!year || !month) return;
  visibleMonth = new Date(year, month - 1, 1);
  selectedDate = new Date(year, month - 1, 1);
  renderCalendar();
});

calendarGrid.addEventListener("click", (event) => {
  const dayButton = event.target.closest("[data-date]");
  if (!dayButton) return;
  const [year, month, day] = dayButton.dataset.date.split("-").map(Number);
  selectedDate = new Date(year, month - 1, day);
  visibleMonth = new Date(year, month - 1, 1);
  renderCalendar();
});

renderCalendar();
