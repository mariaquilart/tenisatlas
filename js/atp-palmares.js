document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("atp-palmares-btn");
  const compareButton = document.getElementById("atp-compare-btn");
  const view = document.getElementById("atp-palmares-view");
  const input = document.getElementById("atp-palmares-player");
  const toggle = document.getElementById("atp-palmares-toggle");
  const options = document.getElementById("atp-palmares-options");
  const message = document.getElementById("atp-palmares-message");
  const result = document.getElementById("atp-palmares-result");
  const nameNode = document.getElementById("atp-palmares-name");
  const totalNode = document.getElementById("atp-palmares-total");
  const photoNode = document.getElementById("atp-palmares-photo");
  const initialsNode = document.getElementById("atp-palmares-initials");
  const filtersNode = document.getElementById("atp-palmares-filters");
  const titlesNode = document.getElementById("atp-palmares-titles");
  const history = window.ATP_VERSUS_DATA;
  if (!button || !view || !input || !history) return;
  compareButton?.addEventListener("click", () => {
    ["atp-hero", "atp-map-view", "atp-birthdays-agenda", "atp-tournaments-calendar", "atp-versus-view", "atp-history-view", "atp-palmares-view"].forEach((id) => document.getElementById(id)?.setAttribute("hidden", ""));
    document.querySelectorAll(".site-nav__link.is-active").forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    document.getElementById("atp-compare-view")?.removeAttribute("hidden");
    compareButton.classList.add("is-active");
    compareButton.setAttribute("aria-pressed", "true");
  });

  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, " ").replace(/['’]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const historyAliases = { "yunchaokete bu": "bu yunchaokete" };
  const excludedMapPlayers = new Set(["Dino Prizmic", "Holger Rune"]);
  const rankingPlayers = (window.ATP_PLAYERS_MAP_DATA || [])
    .filter((player) => player.ranking <= 100 && !excludedMapPlayers.has(player.name))
    .map((player) => player.name)
    .concat(window.ATP_PALMARES_EXTRA_PLAYERS || []);
  const players = [...new Map(rankingPlayers.map((player) => [normalize(player), player])).values()]
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  if (players.length !== 150) console.error(`Palmarés ATP: se esperaban 150 jugadores y se cargaron ${players.length}.`);
  if (!(window.ATP_PALMARES_OFFICIAL_UPDATES || []).every((title) => title.winner && title.tournament && title.date && title.category)) {
    console.error("Palmarés ATP: hay actualizaciones oficiales incompletas.");
  }

  const categories = ["Todos", "Grand Slam", "Masters 1000", "ATP 500", "ATP 250"];
  const slams = new Set(["australian open", "roland garros", "wimbledon", "us open"]);
  const masters = ["indian wells", "miami", "monte carlo", "monte-carlo", "madrid masters", "rome masters", "canada masters", "montreal masters", "toronto masters", "cincinnati masters", "shanghai masters", "paris masters", "hamburg masters", "stuttgart masters", "stockholm masters", "essen masters"];
  const atp500 = ["rotterdam", "rio de janeiro", "dubai", "barcelona", "washington", "beijing", "tokyo", "vienna", "basel", "hamburg", "memphis", "valencia", "mexico city", "london / queen", "mubadala dc"];
  const nonTour = ["davis cup", "atp cup", "laver cup", "united cup", "nextgen finals", "next gen finals"];
  let selectedPlayer = null;
  let activeFilter = "Todos";
  const playerPhotos = new Map(Object.entries(window.ATP_PLAYER_PHOTOS || {}).map(([player, url]) => [normalize(player), url]));
  const featuredPhotos = new Map([
    ["carlos alcaraz", "https://a.espncdn.com/i/headshots/tennis/players/full/3782.png"],
    ["jannik sinner", "https://a.espncdn.com/i/headshots/tennis/players/full/3623.png"],
    ["novak djokovic", "https://a.espncdn.com/i/headshots/tennis/players/full/296.png"],
    ["ben shelton", "images/players/ben-shelton.jpg?v=1"]
  ]);

  const renderPortrait = (player) => {
    const words = player.split(/\s+/).filter(Boolean);
    initialsNode.textContent = `${words[0]?.[0] || ""}${words.at(-1)?.[0] || ""}`;
    initialsNode.hidden = false;
    photoNode.hidden = true;
    photoNode.alt = `Retrato de ${player}`;
    const photo = playerPhotos.get(normalize(player)) || featuredPhotos.get(normalize(player));
    if (!photo) {
      photoNode.removeAttribute("src");
      return;
    }
    photoNode.onload = () => {
      photoNode.hidden = false;
      initialsNode.hidden = true;
    };
    photoNode.onerror = () => {
      photoNode.hidden = true;
      initialsNode.hidden = false;
    };
    photoNode.src = photo;
  };

  const classify = (tournament, year) => {
    const key = normalize(tournament);
    const season = Number(year);
    if (slams.has(key)) return "Grand Slam";
    if (masters.some((item) => key.includes(item))) return "Masters 1000";
    if ((key.includes("queen") || key.includes("halle")) && season >= 2015) return "ATP 500";
    if (key.includes("acapulco") && season >= 2014) return "ATP 500";
    if ((key.includes("doha") || key.includes("dallas") || key.includes("munich")) && season >= 2025) return "ATP 500";
    if (atp500.some((item) => key.includes(item))) return "ATP 500";
    if (key.includes("tour finals") || key.includes("masters cup")) return "ATP Finals";
    if (key.includes("olympics")) return "Juegos Olímpicos";
    return "ATP 250";
  };

  const titleData = (player) => {
    const playerKey = historyAliases[normalize(player)] || normalize(player);
    const playerIndex = history.players.findIndex((name) => normalize(name) === playerKey);
    const titleMap = new Map();
    if (playerIndex >= 0) history.matches.forEach((match) => {
      if (match[0] !== playerIndex || history.rounds[match[3]] !== "F") return;
      const tournament = history.tournaments[match[2]];
      if (nonTour.some((item) => normalize(tournament).includes(item))) return;
      const year = String(match[4]).slice(0, 4);
      titleMap.set(`${normalize(tournament)}-${year}`, { tournament, year, category: classify(tournament, year) });
    });
    (window.ATP_HISTORY_RECENT_MATCHES || []).forEach((match) => {
      if (match.round !== "F" || normalize(match.winner) !== normalize(player)) return;
      const year = String(match.date).slice(0, 4);
      titleMap.set(`${normalize(match.tournament)}-${year}`, { tournament: match.tournament, year, category: classify(match.tournament, year) });
    });
    (window.ATP_PALMARES_OFFICIAL_UPDATES || []).forEach((title) => {
      if (normalize(title.winner) !== normalize(player)) return;
      const year = String(title.date).slice(0, 4);
      titleMap.set(`${normalize(title.tournament)}-${year}`, { tournament: title.tournament, year, category: title.category });
    });
    return [...titleMap.values()].sort((a, b) => Number(a.year) - Number(b.year) || a.tournament.localeCompare(b.tournament, "es"));
  };

  const closeOptions = () => {
    options.hidden = true;
    input.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-expanded", "false");
  };

  const renderOptions = (query = "") => {
    const needle = normalize(query);
    const matches = players.filter((player) => !needle || normalize(player).includes(needle));
    options.replaceChildren();
    matches.forEach((player) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "palmares-search__option";
      option.setAttribute("role", "option");
      option.textContent = player;
      option.addEventListener("click", () => selectPlayer(player));
      options.appendChild(option);
    });
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "palmares-search__empty";
      empty.textContent = "Ningún tenista coincide con la búsqueda.";
      options.appendChild(empty);
    }
    options.hidden = false;
    input.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-expanded", "true");
  };

  const renderTitles = () => {
    const titles = titleData(selectedPlayer);
    const visible = activeFilter === "Todos" ? titles : titles.filter((title) => title.category === activeFilter);
    nameNode.textContent = selectedPlayer;
    renderPortrait(selectedPlayer);
    totalNode.innerHTML = `<span class="palmares-result__total-number">${titles.length}</span><span class="palmares-result__total-label">${titles.length === 1 ? "título" : "títulos"}</span>`;
    titlesNode.replaceChildren();
    const displayCategories = activeFilter === "Todos"
      ? ["Grand Slam", "Masters 1000", "ATP 500", "ATP 250", "ATP Finals", "Juegos Olímpicos"]
      : [activeFilter];
    displayCategories.forEach((category) => {
      const categoryTitles = visible.filter((title) => title.category === category);
      if (!categoryTitles.length) return;
      const section = document.createElement("section");
      section.className = `palmares-category palmares-category--${normalize(category).replace(/\s+/g, "-")}`;
      const categoryHeader = document.createElement("header");
      categoryHeader.className = "palmares-category__header";
      const heading = document.createElement("h3");
      heading.textContent = category;
      const count = document.createElement("span");
      count.className = "palmares-category__count";
      count.textContent = `${categoryTitles.length} ${categoryTitles.length === 1 ? "título" : "títulos"}`;
      categoryHeader.append(heading, count);
      const list = document.createElement("ul");
      categoryTitles.forEach((title) => {
        const item = document.createElement("li");
        const ball = document.createElement("span");
        ball.className = "palmares-category__tennis-ball";
        ball.setAttribute("aria-hidden", "true");
        const tournament = document.createElement("button");
        tournament.type = "button";
        tournament.className = "palmares-category__title-link";
        tournament.textContent = title.tournament.replace(/ Masters$/i, "");
        tournament.title = `Ver la final de ${title.tournament} ${title.year} en Historial`;
        tournament.setAttribute("aria-label", `Ver la final de ${title.tournament} de ${title.year} en Historial`);
        tournament.addEventListener("click", () => {
          window.ATP_OPEN_HISTORY_FILTER?.({ tournament: title.tournament, year: title.year, round: "Final" });
        });
        item.append(ball, tournament, document.createTextNode(` — ${title.year}`));
        list.appendChild(item);
      });
      section.append(categoryHeader, list);
      titlesNode.appendChild(section);
    });
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "palmares-titles__empty";
      empty.textContent = activeFilter === "Todos" ? "Este tenista todavía no tiene títulos ATP." : `No tiene títulos en ${activeFilter}.`;
      titlesNode.appendChild(empty);
    }
    message.hidden = true;
    result.hidden = false;
  };

  const renderFilters = () => {
    filtersNode.replaceChildren();
    categories.forEach((category) => {
      const filter = document.createElement("button");
      filter.type = "button";
      filter.className = `palmares-filters__button${category === activeFilter ? " is-active" : ""}`;
      filter.setAttribute("aria-pressed", String(category === activeFilter));
      filter.textContent = category;
      filter.addEventListener("click", () => {
        activeFilter = category;
        renderFilters();
        renderTitles();
      });
      filtersNode.appendChild(filter);
    });
  };

  function selectPlayer(player) {
    selectedPlayer = player;
    activeFilter = "Todos";
    input.value = player;
    closeOptions();
    renderFilters();
    renderTitles();
  }

  input.addEventListener("input", () => renderOptions(input.value));
  input.addEventListener("focus", () => renderOptions(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeOptions();
    if (event.key === "Enter") {
      const exact = players.find((player) => normalize(player) === normalize(input.value));
      const first = players.find((player) => normalize(player).includes(normalize(input.value)));
      if (exact || first) selectPlayer(exact || first);
    }
  });
  toggle.addEventListener("click", () => options.hidden ? renderOptions("") : closeOptions());
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".palmares-search")) closeOptions();
  });

  button.addEventListener("click", () => {
    ["atp-hero", "atp-map-view", "atp-birthdays-agenda", "atp-tournaments-calendar", "atp-versus-view", "atp-history-view"].forEach((id) => document.getElementById(id)?.setAttribute("hidden", ""));
    document.querySelectorAll(".site-nav__link.is-active").forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    view.hidden = false;
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    input.focus();
  });
  document.querySelector(".site-nav__menu")?.addEventListener("click", (event) => {
    if (event.target.id === "atp-filters-btn") return;
    if (event.target !== button) {
      view.hidden = true;
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    }
  }, true);
});
