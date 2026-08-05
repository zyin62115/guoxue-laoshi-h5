const profileState = window.GuoxueApp;
const profilesPageList = document.querySelector("#profiles-page-list");
const collectionToast = document.querySelector("#collection-toast");
let toastTimer = null;

function formatProfileBirth(profile) {
  const { year, month, day } = profile.birthDate;
  const calendar = profile.calendar === "lunar" ? "农历" : "公历";
  const leap = profile.calendar === "lunar" && profile.isLeapMonth ? "闰" : "";
  const birthplace = profile.birthplace ? ` · ${profile.birthplace}` : "";
  return `${calendar} ${year}年${leap}${month}月${day}日 ${profile.birthTime}${birthplace}`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  collectionToast.textContent = message;
  collectionToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => collectionToast.classList.remove("is-visible"), 1800);
}

function renderProfiles() {
  const profiles = profileState.getProfiles();
  const activeId = profileState.getActiveProfileId();
  if (!profiles.length) {
    const empty = document.createElement("a");
    empty.className = "collection-empty pressable";
    empty.href = "./profile.html?return=profiles";
    empty.innerHTML = "<span>档</span><strong>还没有档案</strong><small>添加出生信息，方便后续问答与生成报告</small>";
    profilesPageList.replaceChildren(empty);
    return;
  }

  profilesPageList.replaceChildren(
    ...profiles.map((profile) => {
      const card = document.createElement("article");
      card.className = "archive-card";
      card.classList.toggle("is-active", profile.id === activeId);

      const select = document.createElement("button");
      select.className = "archive-select pressable";
      select.type = "button";
      select.dataset.profileId = profile.id;
      select.setAttribute("aria-label", `${profile.id === activeId ? "当前档案，" : ""}选择${profile.name}的八字档案`);
      select.innerHTML = `
        <span class="archive-avatar">${profile.name.slice(0, 1)}</span>
        <span class="archive-copy"><strong></strong><small></small></span>
        <span class="archive-check" aria-hidden="true">✓</span>`;
      select.querySelector("strong").textContent = profile.name;
      select.querySelector("small").textContent = formatProfileBirth(profile);

      const edit = document.createElement("a");
      edit.className = "archive-edit pressable";
      edit.href = `./profile.html?id=${encodeURIComponent(profile.id)}&return=profiles`;
      edit.textContent = "编辑";
      edit.setAttribute("aria-label", `编辑${profile.name}的八字档案`);
      card.append(select, edit);
      return card;
    }),
  );
}

profilesPageList.addEventListener("click", (event) => {
  const select = event.target.closest("[data-profile-id]");
  if (!select) return;
  profileState.setActiveProfile(select.dataset.profileId);
  renderProfiles();
  showToast("已设为当前对话档案");
});

window.addEventListener("pageshow", renderProfiles);
renderProfiles();
