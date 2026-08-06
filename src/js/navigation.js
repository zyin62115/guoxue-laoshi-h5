function navigateBack(fallbackUrl) {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = fallbackUrl;
}

window.GuoxueNavigation = { back: navigateBack };

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const backButton = target?.closest("[data-navigation-back]");
  if (!backButton) return;

  event.preventDefault();
  navigateBack(backButton.href);
});
