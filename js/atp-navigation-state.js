document.addEventListener("DOMContentLoaded", () => {
  const hero = document.getElementById("atp-hero");
  const credit = document.getElementById("credit-section");
  const views = [
    "atp-map-view",
    "atp-birthdays-agenda",
    "atp-tournaments-calendar",
    "atp-compare-view",
    "atp-history-view",
    "atp-versus-view",
    "atp-palmares-view",
    "atp-filters-view",
  ];
  const destinations = {
    "atp-tournaments-map-option": ["atp-map-view", "atp-map-btn"],
    "atp-players-map-option": ["atp-map-view", "atp-map-btn"],
    "atp-tournaments-calendar-option": ["atp-tournaments-calendar", "atp-calendar-btn"],
    "atp-birthdays-calendar-option": ["atp-birthdays-agenda", "atp-calendar-btn"],
    "atp-compare-btn": ["atp-compare-view", "atp-compare-btn"],
    "atp-history-btn": ["atp-history-view", "atp-history-btn"],
    "atp-versus-btn": ["atp-versus-view", "atp-versus-btn"],
    "atp-palmares-btn": ["atp-palmares-view", "atp-palmares-btn"],
    "atp-filters-btn": ["atp-filters-view", "atp-filters-btn"],
  };

  document.addEventListener("click", (event) => {
    const control = event.target.closest("button");
    const destination = control && destinations[control.id];
    if (!destination) return;

    requestAnimationFrame(() => {
      const [viewId, buttonId] = destination;
      views.forEach((id) => {
        const view = document.getElementById(id);
        if (view) view.hidden = id !== viewId;
      });
      if (hero) hero.hidden = true;
      if (credit) credit.hidden = true;
      document.querySelectorAll(".site-nav__link.is-active").forEach((button) => {
        button.classList.remove("is-active");
        button.setAttribute("aria-pressed", "false");
      });
      const activeButton = document.getElementById(buttonId);
      activeButton?.classList.add("is-active");
      activeButton?.setAttribute("aria-pressed", "true");
      if (window.matchMedia("(max-width: 720px)").matches) {
        activeButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
  });
});
