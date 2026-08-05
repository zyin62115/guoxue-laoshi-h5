(function initializeNavigation(global) {
  function goBack(fallback = "./index.html") {
    if (global.history.length > 1) {
      global.history.back();
      return;
    }
    global.location.href = fallback;
  }

  document.addEventListener("click", (event) => {
    const backLink = event.target.closest("[data-history-back]");
    if (
      !backLink ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    goBack(backLink.getAttribute("href") || "./index.html");
  });

  global.GuoxueNavigation = Object.freeze({ goBack });
})(window);
