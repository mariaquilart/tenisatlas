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
  const tournamentModal = document.getElementById("calendar-tournament-modal");
  const tournamentName = document.getElementById("calendar-tournament-name");
  const tournamentDetails = document.getElementById("calendar-tournament-details");
  const tournamentClose = document.getElementById("calendar-tournament-close");

  if (!option || !calendar || !title || !grid || !previousButton || !nextButton
    || !tournamentModal || !tournamentName || !tournamentDetails || !tournamentClose) return;

  const firstMonth = 6;
  const firstYear = 2026;
  const lastMonth = 6;
  const lastYear = 2027;
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const tournaments = [
    {
      name: "EFG Swiss Open Gstaad",
      start: "2026-07-13",
      details: [
        ["Inicio", "13 de julio de 2026"],
        ["Fin", "19 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Gstaad (Suiza)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Nordea Open Bastad",
      start: "2026-07-13",
      details: [
        ["Inicio", "13 de julio de 2026"],
        ["Fin", "19 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Bastad (Suecia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Plava Laguna Croatia Open Umag",
      start: "2026-07-20",
      details: [
        ["Inicio", "20 de julio de 2026"],
        ["Fin", "26 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Umag (Croacia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Generali Open Kitzbühel",
      start: "2026-07-20",
      details: [
        ["Inicio", "20 de julio de 2026"],
        ["Fin", "26 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Kitzbühel (Austria)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Generali Open Kitzbühel",
      start: "2026-07-27",
      details: [
        ["Inicio", "27 de julio de 2026"],
        ["Fin", "2 de agosto de 2026"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Washington D. C. (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
  ];

  let currentMonth = firstMonth;
  let currentYear = firstYear;
  let tournamentTrigger = null;

  const monthIndex = (year, month) => year * 12 + month;
  const firstIndex = monthIndex(firstYear, firstMonth);
  const lastIndex = monthIndex(lastYear, lastMonth);

  const closeTournamentCard = () => {
    tournamentModal.hidden = true;
    if (tournamentTrigger) tournamentTrigger.focus();
    tournamentTrigger = null;
  };

  const openTournamentCard = (tournament, trigger) => {
    tournamentTrigger = trigger;
    tournamentName.textContent = tournament.name;
    tournamentDetails.replaceChildren();

    tournament.details.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "calendar-tournament-card__row";
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      row.append(term, description);
      tournamentDetails.appendChild(row);
    });

    tournamentModal.hidden = false;
    tournamentClose.focus();
  };

  const render = () => {
    const monthName = monthNames[currentMonth];
    title.textContent = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de ${currentYear}`;
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
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayTournaments = tournaments.filter((tournament) => tournament.start === dateKey);
        dayTournaments.forEach((tournament) => {
          const tournamentButton = document.createElement("button");
          tournamentButton.type = "button";
          tournamentButton.className = "tournaments-calendar__event";
          tournamentButton.textContent = tournament.name;
          tournamentButton.setAttribute("aria-label", `Ver información de ${tournament.name}`);
          tournamentButton.addEventListener("click", () => openTournamentCard(tournament, tournamentButton));
          dayCell.appendChild(tournamentButton);
        });
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
  tournamentClose.addEventListener("click", closeTournamentCard);
  tournamentModal.addEventListener("click", (event) => {
    if (event.target === tournamentModal) closeTournamentCard();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !tournamentModal.hidden) closeTournamentCard();
  });

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
