document.addEventListener("DOMContentLoaded", () => {
  const menuPairs = [
    {
      button: document.getElementById("atp-calendar-btn"),
      menu: document.getElementById("atp-calendar-menu"),
    },
    {
      button: document.getElementById("atp-map-btn"),
      menu: document.getElementById("atp-map-menu"),
    },
  ].filter(({ button, menu }) => button && menu);

  const closeMenu = (button, menu, returnFocus = false) => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) button.focus();
  };

  const positionMenu = (button, menu) => {
    const buttonRect = button.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const left = Math.min(buttonRect.left, window.innerWidth - menuWidth - 12);
    const safeLeft = Math.max(12, left);
    const arrowLeft = Math.min(menuWidth - 16, Math.max(16, buttonRect.left + buttonRect.width / 2 - safeLeft));

    menu.style.top = `${buttonRect.bottom + 8}px`;
    menu.style.left = `${safeLeft}px`;
    menu.style.setProperty("--calendar-arrow-left", `${arrowLeft}px`);
  };

  const openMenu = (button, menu) => {
    menuPairs.forEach((pair) => {
      if (pair.menu !== menu) closeMenu(pair.button, pair.menu);
    });
    menu.hidden = false;
    positionMenu(button, menu);
    button.setAttribute("aria-expanded", "true");
  };

  menuPairs.forEach(({ button, menu }) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (menu.hidden) openMenu(button, menu);
      else closeMenu(button, menu);
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest(".calendar-menu__item")) closeMenu(button, menu);
    });
  });

  document.addEventListener("click", (event) => {
    menuPairs.forEach(({ button, menu }) => {
      if (!menu.hidden && !menu.contains(event.target) && event.target !== button) closeMenu(button, menu);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    menuPairs.forEach(({ button, menu }) => {
      if (!menu.hidden) closeMenu(button, menu, true);
    });
  });

  const repositionOpenMenus = () => {
    menuPairs.forEach(({ button, menu }) => {
      if (!menu.hidden) positionMenu(button, menu);
    });
  };

  window.addEventListener("resize", repositionOpenMenus);

  const navigation = menuPairs[0]?.button.closest(".site-nav__menu");
  if (navigation) navigation.addEventListener("scroll", repositionOpenMenus);
});
