document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("atp-calendar-btn");
  const menu = document.getElementById("atp-calendar-menu");
  if (!button || !menu) return;

  const closeMenu = (returnFocus = false) => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) button.focus();
  };

  const positionMenu = () => {
    const buttonRect = button.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const left = Math.min(buttonRect.left, window.innerWidth - menuWidth - 12);
    const safeLeft = Math.max(12, left);
    const arrowLeft = Math.min(menuWidth - 16, Math.max(16, buttonRect.left + buttonRect.width / 2 - safeLeft));

    menu.style.top = `${buttonRect.bottom + 8}px`;
    menu.style.left = `${safeLeft}px`;
    menu.style.setProperty("--calendar-arrow-left", `${arrowLeft}px`);
  };

  const openMenu = () => {
    menu.hidden = false;
    positionMenu();
    button.setAttribute("aria-expanded", "true");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest(".calendar-menu__item")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== button) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) closeMenu(true);
  });

  window.addEventListener("resize", () => {
    if (!menu.hidden) positionMenu();
  });

  const navigation = button.closest(".site-nav__menu");
  if (navigation) {
    navigation.addEventListener("scroll", () => {
      if (!menu.hidden) positionMenu();
    });
  }
});
