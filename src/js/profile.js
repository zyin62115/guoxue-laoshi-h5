const appState = window.GuoxueApp;
const form = document.querySelector("#profile-form");
const pageTitle = document.querySelector("#profile-page-title");
const nameInput = document.querySelector("#profile-name");
const yearInput = document.querySelector("#birth-year");
const monthInput = document.querySelector("#birth-month");
const dayInput = document.querySelector("#birth-day");
const timeInput = document.querySelector("#birth-time");
const birthplaceInput = document.querySelector("#birthplace");
const leapMonthField = document.querySelector("#leap-month-field");
const leapMonthInput = document.querySelector("#is-leap-month");
const errorDisplay = document.querySelector("#form-error");
const deleteButton = document.querySelector("#delete-profile");
const cancelButton = document.querySelector("#cancel-profile");
const backLink = document.querySelector(".profile-back");

const profileId = new URLSearchParams(window.location.search).get("id");
const returnTarget = new URLSearchParams(window.location.search).get("return");
const editingProfile = profileId ? appState.getProfile(profileId) : null;

function exitTarget() {
  if (returnTarget === "interpretation") return "./interpretation.html";
  if (returnTarget === "profiles") return "./profiles.html";
  return "./index.html#menu";
}

backLink.href = exitTarget();

function selectedValue(name) {
  return form.elements[name].value;
}

function setSelectedValue(name, value) {
  const input = form.querySelector(`[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function syncCalendarFields() {
  const lunar = selectedValue("calendar") === "lunar";
  leapMonthField.hidden = !lunar;
  if (!lunar) leapMonthInput.checked = false;
  dayInput.max = lunar ? "30" : "31";
}

function populateForm(profile) {
  nameInput.value = profile.name;
  setSelectedValue("gender", profile.gender);
  setSelectedValue("calendar", profile.calendar);
  yearInput.value = profile.birthDate.year;
  monthInput.value = profile.birthDate.month;
  dayInput.value = profile.birthDate.day;
  timeInput.value = profile.birthTime;
  if (
    profile.birthplace &&
    !Array.from(birthplaceInput.options).some((option) => option.value === profile.birthplace)
  ) {
    birthplaceInput.add(new Option(profile.birthplace, profile.birthplace));
  }
  birthplaceInput.value = profile.birthplace;
  leapMonthInput.checked = profile.isLeapMonth;
  syncCalendarFields();
}

function validateDate(year, month, day, calendar) {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12
  ) {
    return false;
  }

  if (calendar === "lunar") return day >= 1 && day <= 30;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function showError(message, target) {
  errorDisplay.textContent = message;
  target?.focus({ preventScroll: false });
}

function collectProfile() {
  const name = nameInput.value.trim();
  const gender = selectedValue("gender");
  const calendar = selectedValue("calendar");
  const year = Number(yearInput.value);
  const month = Number(monthInput.value);
  const day = Number(dayInput.value);
  const birthTime = timeInput.value;
  const birthplace = birthplaceInput.value.trim();

  if (!name) {
    showError("请输入姓名或称呼。", nameInput);
    return null;
  }
  if (!validateDate(year, month, day, calendar)) {
    showError(
      calendar === "lunar"
        ? "请输入有效的农历日期（1900—2100年，日期不超过30日）。"
        : "请输入有效的公历日期。",
      yearInput,
    );
    return null;
  }
  if (!birthTime) {
    showError("请选择出生时间。", timeInput);
    return null;
  }
  errorDisplay.textContent = "";
  return {
    id: editingProfile?.id,
    name,
    gender,
    calendar,
    birthDate: { year, month, day },
    birthTime,
    isLeapMonth: calendar === "lunar" && leapMonthInput.checked,
    birthplace,
  };
}

form.addEventListener("change", (event) => {
  if (event.target.name === "calendar") syncCalendarFields();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = collectProfile();
  if (!profile) return;
  appState.upsertProfile(profile);
  window.location.replace(exitTarget());
});

cancelButton.addEventListener("click", () => {
  window.location.href = exitTarget();
});

deleteButton.addEventListener("click", () => {
  if (!editingProfile) return;
  const confirmed = window.confirm(`确定删除“${editingProfile.name}”的八字档案吗？`);
  if (!confirmed) return;
  appState.deleteProfile(editingProfile.id);
  window.location.replace(exitTarget());
});

if (editingProfile) {
  pageTitle.textContent = "编辑八字档案";
  document.title = `编辑${editingProfile.name}的八字档案`;
  deleteButton.hidden = false;
  populateForm(editingProfile);
} else {
  syncCalendarFields();
  if (profileId) {
    showError("未找到原档案，将作为新档案保存。", nameInput);
  }
}
