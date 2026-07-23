document.addEventListener("DOMContentLoaded", () => {
  const option = document.getElementById("atp-tournaments-calendar-option");
  const calendar = document.getElementById("atp-tournaments-calendar");
  const title = document.getElementById("tournaments-calendar-title");
  const grid = document.getElementById("tournaments-calendar-grid");
  const previousButton = document.getElementById("tournaments-calendar-prev");
  const nextButton = document.getElementById("tournaments-calendar-next");
  const hero = document.getElementById("atp-hero");
  const mapView = document.getElementById("atp-map-view");
  const mapButton = document.getElementById("atp-map-btn");
  const calendarButton = document.getElementById("atp-calendar-btn");

  if (!option || !calendar || !title || !grid || !previousButton || !nextButton) return;

  const firstMonth = 6;
  const firstYear = 2026;
  const lastMonth = 6;
  const lastYear = 2027;
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  let currentMonth = firstMonth;
  let currentYear = firstYear;

  const monthIndex = (year, month) => year * 12 + month;
  const firstIndex = monthIndex(firstYear, firstMonth);
  const lastIndex = monthIndex(lastYear, lastMonth);

  const render = () => {
    title.textContent = `${monthNames[currentMonth]} de ${currentYear}`;
    grid.replaceChildren();

    const today = new Date();
    const firstWeekday = (new Date(Date.UTC(currentYear, currentMonth, 1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    for (let cell = 0; cell < cellCount; cell += 1) {
      const day = cell - firstWeekday + 1;
      const dayCell = document.createElement("div");
      dayCell.className = "tournaments-calendar__day";

      if (day < 1 || day > daysInMonth) {
        dayCell.classList.add("tournaments-calendar__day--empty");
        dayCell.setAttribute("aria-hidden", "true");
      } else {
        const dayNumber = document.createElement("span");
        dayNumber.className = "tournaments-calendar__day-number";
        dayNumber.textContent = String(day);
        dayCell.appendChild(dayNumber);
        if (cell % 7 >= 5) dayCell.classList.add("tournaments-calendar__day--weekend");
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
          dayCell.classList.add("tournaments-calendar__day--today");
          dayCell.setAttribute("aria-current", "date");
        }
        dayCell.setAttribute("aria-label", `${day} de ${monthNames[currentMonth]} de ${currentYear}`);
      }

      grid.appendChild(dayCell);
    }

    const currentIndex = monthIndex(currentYear, currentMonth);
    previousButton.disabled = currentIndex === firstIndex;
    nextButton.disabled = currentIndex === lastIndex;
  };

  const changeMonth = (increment) => {
    const targetIndex = monthIndex(currentYear, currentMonth) + increment;
    if (targetIndex < firstIndex || targetIndex > lastIndex) return;
    currentYear = Math.floor(targetIndex / 12);
    currentMonth = targetIndex % 12;
    render();
  };

  option.addEventListener("click", () => {
    currentMonth = firstMonth;
    currentYear = firstYear;
    if (hero) hero.hidden = true;
    if (mapView) mapView.hidden = true;
    if (mapButton) {
      mapButton.classList.remove("is-active");
      mapButton.setAttribute("aria-pressed", "false");
    }
    if (calendarButton) calendarButton.classList.add("is-active");
    calendar.hidden = false;
    render();
  });

  previousButton.addEventListener("click", () => changeMonth(-1));
  nextButton.addEventListener("click", () => changeMonth(1));

  const scheduleTodayRefresh = () => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    window.setTimeout(() => {
      if (!calendar.hidden) render();
      scheduleTodayRefresh();
    }, nextMidnight.getTime() - now.getTime() + 100);
  };

  scheduleTodayRefresh();
});
