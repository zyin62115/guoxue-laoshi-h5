const appState = window.GuoxueApp;
const form = document.querySelector("#profile-form");
const pageTitle = document.querySelector("#profile-page-title");
const nameInput = document.querySelector("#profile-name");
const yearInput = document.querySelector("#birth-year");
const monthInput = document.querySelector("#birth-month");
const dayInput = document.querySelector("#birth-day");
const timeInput = document.querySelector("#birth-time");
const birthplaceInput = document.querySelector("#birthplace");
const provinceSelect = document.querySelector("#birthplace-province");
const citySelect = document.querySelector("#birthplace-city");
const districtSelect = document.querySelector("#birthplace-district");
const leapMonthField = document.querySelector("#leap-month-field");
const leapMonthInput = document.querySelector("#is-leap-month");
const errorDisplay = document.querySelector("#form-error");
const deleteButton = document.querySelector("#delete-profile");
const cancelButton = document.querySelector("#cancel-profile");
const backLink = document.querySelector(".profile-back");

const profileId = new URLSearchParams(window.location.search).get("id");
const returnTarget = new URLSearchParams(window.location.search).get("return");
const editingProfile = profileId ? appState.getProfile(profileId) : null;
const genericCityNames = new Set(["市辖区", "县"]);
let birthplaceRegions = [];

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

function setRegionOptions(select, regions, placeholder, labelResolver = (region) => region.n) {
  select.replaceChildren(new Option(placeholder, ""));
  regions.forEach((region) => select.add(new Option(labelResolver(region), region.c)));
  select.disabled = regions.length === 0;
}

function selectedRegion(select, regions) {
  return regions.find((region) => region.c === select.value) || null;
}

function selectedProvince() {
  return selectedRegion(provinceSelect, birthplaceRegions);
}

function selectedCity() {
  return selectedRegion(citySelect, selectedProvince()?.d || []);
}

function cityLabel(city, province) {
  if (city.n === "市辖区") return province.d.length === 1 ? province.n : "城区";
  if (city.n === "县") return "县";
  return city.n;
}

function syncBirthplaceValue() {
  const province = selectedProvince();
  const city = selectedCity();
  const district = selectedRegion(districtSelect, city?.d || []);
  if (!province) {
    birthplaceInput.value = "";
    return;
  }
  if (province.c === "overseas") {
    birthplaceInput.value = province.n;
    return;
  }
  const parts = [province.n];
  if (city && !genericCityNames.has(city.n) && city.n !== province.n) parts.push(city.n);
  if (district) parts.push(district.n);
  birthplaceInput.value = parts.join("");
}

function populateDistricts() {
  const districts = selectedCity()?.d || [];
  setRegionOptions(districtSelect, districts, "选择区县");
  syncBirthplaceValue();
}

function populateCities() {
  const province = selectedProvince();
  const cities = province?.d || [];
  setRegionOptions(citySelect, cities, "选择城市", (city) => cityLabel(city, province));
  setRegionOptions(districtSelect, [], "选择区县");
  if (cities.length === 1 && genericCityNames.has(cities[0].n)) {
    citySelect.value = cities[0].c;
    populateDistricts();
    return;
  }
  syncBirthplaceValue();
}

function restoreBirthplaceSelection(value) {
  if (!value) return;
  const province = birthplaceRegions.find(
    (region) => value === region.n || value.startsWith(region.n),
  );
  if (!province) return;
  provinceSelect.value = province.c;
  populateCities();
  if (province.c === "overseas") return;

  const cities = province.d || [];
  const city =
    cities.find((region) => !genericCityNames.has(region.n) && value.includes(region.n)) ||
    cities.find((region) => (region.d || []).some((district) => value.includes(district.n))) ||
    (cities.length === 1 ? cities[0] : null);
  if (!city) return;
  citySelect.value = city.c;
  populateDistricts();

  const district = (city.d || []).find((region) => value.includes(region.n));
  if (district) districtSelect.value = district.c;
  syncBirthplaceValue();
}

async function loadBirthplaceRegions() {
  const savedBirthplace = birthplaceInput.value;
  try {
    const response = await fetch("../../public/data/china-regions.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    birthplaceRegions = await response.json();
    birthplaceRegions.push({ c: "overseas", n: "海外", d: [] });
    setRegionOptions(provinceSelect, birthplaceRegions, "选择省份");
    restoreBirthplaceSelection(savedBirthplace);
  } catch {
    setRegionOptions(provinceSelect, [], "地区数据加载失败");
    birthplaceInput.value = savedBirthplace;
  }
}

function populateForm(profile) {
  nameInput.value = profile.name;
  setSelectedValue("gender", profile.gender);
  setSelectedValue("calendar", profile.calendar);
  yearInput.value = profile.birthDate.year;
  monthInput.value = profile.birthDate.month;
  dayInput.value = profile.birthDate.day;
  timeInput.value = profile.birthTime;
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

provinceSelect.addEventListener("change", populateCities);
citySelect.addEventListener("change", populateDistricts);
districtSelect.addEventListener("change", syncBirthplaceValue);

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

loadBirthplaceRegions();
