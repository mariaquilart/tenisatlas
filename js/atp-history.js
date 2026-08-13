document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("atp-history-btn");
  const view = document.getElementById("atp-history-view");
  const tournamentInput = document.getElementById("atp-history-tournament");
  const yearInput = document.getElementById("atp-history-year");
  const roundInput = document.getElementById("atp-history-round");
  const tournamentOptions = document.getElementById("atp-history-tournament-options");
  const yearOptions = document.getElementById("atp-history-year-options");
  const roundOptions = document.getElementById("atp-history-round-options");
  const searchButton = document.getElementById("atp-history-search");
  const message = document.getElementById("atp-history-message");
  const results = document.getElementById("atp-history-results");
  const history = window.ATP_VERSUS_DATA;
  if (!button || !view || !history || !tournamentInput || !yearInput || !roundInput
    || !tournamentOptions || !yearOptions || !roundOptions || !searchButton || !message || !results) return;

  const recentMatches = window.ATP_HISTORY_RECENT_MATCHES || [];

  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
  const repairMojibake = (value) => {
    const text = String(value || "");
    if (!/[ÃÅÄ]/.test(text)) return text;
    try { return decodeURIComponent(escape(text)); } catch (_) { return text; }
  };

  const photoMap = new Map();
  Object.entries(window.ATP_PLAYER_PHOTOS || {}).forEach(([name, photo]) => {
    photoMap.set(normalize(name), photo);
    photoMap.set(normalize(repairMojibake(name)), photo);
  });

  const currentTournamentNames = [...new Set(
    (window.ATP_TOURNAMENTS || []).map((tournament) => tournament.name).filter(Boolean),
  )];
  const historicalTournamentLabels = {
    "Australian Open": "Australian Championships",
    "Roland Garros": "French Open",
    "Indian Wells Open": "Indian Wells",
    "Monte-Carlo Masters": "Monte Carlo",
    "Internazionali BNL d'Italia": "Roma",
    "Canadian Open": "Montreal / Toronto / Canada Masters",
    "Rolex Paris Masters": "Paris-Bercy",
    "ABN AMRO Open": "Rotterdam",
    "Qatar ExxonMobil Open": "Doha",
    "Rio Open": "Río de Janeiro",
    "Abierto Mexicano Telcel": "Acapulco",
    "BMW Open": "Múnich",
    "Terra Wortmann Open": "Halle",
    "HSBC Championships": "Queen's Club / London",
    "Mubadala Citi DC Open": "Washington",
    "China Open": "Beijing",
    "Japan Open": "Tokio",
    "Erste Bank Open": "Viena",
    "ASB Classic": "Auckland",
    "Open Occitanie": "Montpellier",
    "IEB+ Argentina Open": "Buenos Aires",
    "Open 13 Provence": "Marsella",
    "Chile Open": "Santiago",
    "Grand Prix Hassan II": "Marrakech",
    "Tiriac Open": "Bucarest",
    "U.S. Men's Clay Court Championship": "Houston",
    "BOSS Open": "Stuttgart",
    "Libema Open": "Hertogenbosch / Rosmalen",
    "Nordea Open": "Bastad",
    "Moselle Open": "Metz",
    "European Open": "Amberes / Bruselas",
    "BNP Paribas Nordic Open": "Estocolmo",
  };
  const tournamentAliases = [
    ["Australian Open", /australian(?:open|chps)/], ["Roland Garros", /rolandgarros|frenchopen/],
    ["US Open", /usopen/], ["Wimbledon", /wimbledon/], ["Indian Wells Open", /indianwells/],
    ["Miami Open", /miami/], ["Monte-Carlo Masters", /montecarlo/], ["Mutua Madrid Open", /madrid/],
    ["Internazionali BNL d'Italia", /rome|internazionalibnl/], ["Canadian Open", /canadamasters|canadianopen|montreal|toronto/],
    ["Cincinnati Open", /cincinnati/], ["Shanghai Masters", /shanghai/], ["Rolex Paris Masters", /parismasters|parisindoors|bercy/],
    ["Nitto ATP Finals", /atpfinals|masterscup|tourfinals/], ["United Cup", /unitedcup/],
    ["HSBC Championships", /queensclub|london/], ["Terra Wortmann Open", /halle/],
    ["Libema Open", /hertogenbosch|rosmalen/], ["Mubadala Citi DC Open", /washington/],
    ["EFG Swiss Open Gstaad", /gstaad/], ["Nordea Open", /bastad/], ["Generali Open Kitzbühel", /kitzbuhel/],
    ["Plava Laguna Croatia Open Umag", /umag/], ["Millennium Estoril Open", /estoril/],
    ["ABN AMRO Open", /rotterdam/], ["Qatar ExxonMobil Open", /doha/], ["Rio Open", /riodejaneiro/],
    ["Abierto Mexicano Telcel", /acapulco/], ["BMW Open", /munich/], ["China Open", /beijing/],
    ["Japan Open", /tokyo|japanopen/], ["Erste Bank Open", /vienna/], ["ASB Classic", /auckland/],
    ["Open Occitanie", /montpellier/], ["IEB+ Argentina Open", /buenosaires/], ["Open 13 Provence", /marseille/],
    ["Chile Open", /santiago/], ["Grand Prix Hassan II", /marrakech/], ["Tiriac Open", /bucharest/],
    ["U.S. Men's Clay Court Championship", /houston/], ["BOSS Open", /stuttgart/], ["Moselle Open", /metz/],
    ["European Open", /antwerp|brussels/], ["BNP Paribas Nordic Open", /stockholm/],
  ];
  const canonicalTournament = (name) => {
    const key = normalize(name);
    const direct = currentTournamentNames.find((current) => normalize(current) === key);
    if (direct) return direct;
    const alias = tournamentAliases.find(([, pattern]) => pattern.test(key));
    if (alias) return alias[0];
    const locationMatch = currentTournamentNames.find((current) => {
      const currentKey = normalize(current);
      return key.length >= 5 && (currentKey.includes(key) || key.includes(currentKey));
    });
    return locationMatch || null;
  };
  const tournamentNames = currentTournamentNames
    .map((name) => historicalTournamentLabels[name] ? `${name} (${historicalTournamentLabels[name]})` : name)
    .sort((a, b) => a.localeCompare(b, "es"));
  const tournamentByKey = new Map(currentTournamentNames.flatMap((name) => {
    const label = historicalTournamentLabels[name] ? `${name} (${historicalTournamentLabels[name]})` : name;
    return [[normalize(label), name], [normalize(name), name]];
  }));
  const roundChoices = [
    { label: "Primera ronda", codes: ["R128", "R64"] },
    { label: "Segunda ronda", codes: ["R64", "R32"] },
    { label: "Tercera ronda", codes: ["R32"] },
    { label: "Octavos de final", codes: ["R16"] },
    { label: "Cuartos de final", codes: ["QF"] },
    { label: "Semifinal", codes: ["SF"] },
    { label: "Final", codes: ["F"] },
  ];
  const roundByKey = new Map(roundChoices.map((round) => [normalize(round.label), round]));
  const years = Array.from({ length: new Date().getFullYear() - 1969 }, (_, index) => String(new Date().getFullYear() - index));
  const getTournamentMatches = (tournament, year = null) => {
    if (!tournament) return [];
    const tournamentIds = new Set(history.tournaments
      .map((name, id) => canonicalTournament(name) === tournament ? id : -1)
      .filter((id) => id >= 0));
    const stored = history.matches
      .filter((match) => tournamentIds.has(match[2]) && (!year || String(match[4]).startsWith(`${year}-`)))
      .map((match) => ({ round: history.rounds[match[3]], date: match[4] }));
    const recent = recentMatches.filter((match) => canonicalTournament(match.tournament) === tournament
      && (!year || String(match.date).startsWith(`${year}-`)));
    return stored.concat(recent);
  };
  const availableYearsForTournament = () => {
    const tournament = tournamentByKey.get(normalize(tournamentInput.value));
    if (!tournament) return years;
    const available = new Set(getTournamentMatches(tournament).map((match) => String(match.date).slice(0, 4)));
    return years.filter((year) => available.has(year));
  };
  const availableRoundsForSelection = () => {
    const tournament = tournamentByKey.get(normalize(tournamentInput.value));
    const year = Number(yearInput.value);
    if (!tournament || !Number.isInteger(year)) return roundChoices.map((round) => round.label);
    const codes = new Set(getTournamentMatches(tournament, year).map((match) => match.round));
    const labels = [];
    if (codes.has("R128")) labels.push("Primera ronda", "Segunda ronda", "Tercera ronda");
    else if (codes.has("R64")) labels.push("Primera ronda", "Segunda ronda");
    else if (codes.has("R32")) labels.push("Primera ronda");
    if (codes.has("R16")) labels.push("Octavos de final");
    if (codes.has("QF")) labels.push("Cuartos de final");
    if (codes.has("SF")) labels.push("Semifinal");
    if (codes.has("F")) labels.push("Final");
    return [...new Set(labels)];
  };

  const parseCsv = (text) => {
    const rows = []; let row = []; let field = ""; let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"' && quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = !quoted;
      else if (character === "," && !quoted) { row.push(field); field = ""; }
      else if ((character === "\n" || character === "\r") && !quoted) {
        if (character === "\r" && text[index + 1] === "\n") index += 1;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += character;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
  };
  const liveUpdatePromise = (async () => {
    const year = new Date().getFullYear();
    try {
      const url = `https://raw.githubusercontent.com/Aneeshers/tennis-sackmann-archive/main/atp/atp_matches_${year}.csv?v=${new Date().toISOString().slice(0, 10)}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return;
      const rows = parseCsv(await response.text());
      const headers = rows.shift() || [];
      const column = (name) => headers.indexOf(name);
      const indexes = {
        winner: column("winner_name"), loser: column("loser_name"), tournament: column("tourney_name"),
        round: column("round"), date: column("tourney_date"), score: column("score"),
      };
      if ([indexes.winner, indexes.loser, indexes.tournament, indexes.round, indexes.date].some((index) => index < 0)) return;
      const known = new Set(recentMatches.map((match) => [normalize(match.tournament), match.date, match.round, normalize(match.winner), normalize(match.loser)].join("|")));
      history.matches.forEach((match) => {
        if (!String(match[4]).startsWith(String(year))) return;
        known.add([
          normalize(history.tournaments[match[2]]), match[4], history.rounds[match[3]],
          normalize(history.players[match[0]]), normalize(history.players[match[1]]),
        ].join("|"));
      });
      rows.forEach((row) => {
        const rawDate = row[indexes.date] || "";
        const match = {
          tournament: row[indexes.tournament], round: row[indexes.round], winner: row[indexes.winner], loser: row[indexes.loser],
          date: rawDate.length === 8 ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}` : rawDate,
          score: indexes.score >= 0 ? row[indexes.score] : "",
        };
        if (!match.winner || !match.loser || !match.tournament) return;
        const key = [normalize(match.tournament), match.date, match.round, normalize(match.winner), normalize(match.loser)].join("|");
        if (!known.has(key)) { known.add(key); recentMatches.push(match); }
      });
    } catch (_) { /* El archivo local sigue funcionando sin conexión. */ }
  })();

  const closeOptions = (input, container) => {
    container.hidden = true;
    container.replaceChildren();
    input.setAttribute("aria-expanded", "false");
  };
  const closeAllOptions = (except) => {
    [[tournamentInput, tournamentOptions], [yearInput, yearOptions], [roundInput, roundOptions]]
      .forEach(([input, container]) => { if (container !== except) closeOptions(input, container); });
  };
  const renderOptions = (input, container, values, query, filter = true) => {
    closeAllOptions(container);
    const normalizedQuery = normalize(query);
    const visible = (filter && normalizedQuery
      ? values.filter((value) => normalize(value).includes(normalizedQuery))
      : values);
    container.replaceChildren();
    visible.forEach((value) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "history-search__option";
      option.setAttribute("role", "option");
      option.textContent = value;
      option.addEventListener("mousedown", (event) => {
        event.preventDefault();
        input.value = value;
        if (input === tournamentInput) {
          yearInput.value = "";
          roundInput.value = "";
          closeOptions(yearInput, yearOptions);
          closeOptions(roundInput, roundOptions);
        } else if (input === yearInput) {
          roundInput.value = "";
          closeOptions(roundInput, roundOptions);
        }
        closeOptions(input, container);
      });
      container.appendChild(option);
    });
    container.hidden = !visible.length;
    input.setAttribute("aria-expanded", String(Boolean(visible.length)));
  };

  tournamentInput.addEventListener("input", () => {
    yearInput.value = "";
    roundInput.value = "";
    renderOptions(tournamentInput, tournamentOptions, tournamentNames, tournamentInput.value);
  });
  roundInput.addEventListener("input", () => renderOptions(
    roundInput, roundOptions, roundChoices.map((round) => round.label), roundInput.value,
  ));
  yearInput.addEventListener("input", () => {
    yearInput.value = yearInput.value.replace(/\D/g, "").slice(0, 4);
    roundInput.value = "";
    closeOptions(yearInput, yearOptions);
  });
  document.querySelectorAll("[data-history-toggle]").forEach((toggle) => toggle.addEventListener("click", () => {
    const type = toggle.dataset.historyToggle;
    if (type === "tournament") renderOptions(tournamentInput, tournamentOptions, tournamentNames, "");
    if (type === "year") renderOptions(yearInput, yearOptions, years, "", false);
    if (type === "round") renderOptions(roundInput, roundOptions, roundChoices.map((round) => round.label), "");
  }));
  [[tournamentInput, tournamentOptions], [yearInput, yearOptions], [roundInput, roundOptions]]
    .forEach(([input, container]) => input.addEventListener("blur", () => setTimeout(() => closeOptions(input, container), 0)));

  const initials = (name) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
  const createPortrait = (name) => {
    const portrait = document.createElement("span");
    portrait.className = "history-match__portrait";
    const photo = normalize(name) === normalize("Pedro Martínez") ? null : photoMap.get(normalize(name));
    if (!photo) { portrait.textContent = initials(name); return portrait; }
    const image = document.createElement("img");
    image.src = photo;
    image.alt = `Foto de ${name}`;
    image.addEventListener("error", () => portrait.replaceChildren(initials(name)), { once: true });
    portrait.appendChild(image);
    return portrait;
  };
  const createPlayer = (name, winner) => {
    const player = document.createElement("div");
    player.className = `history-match__player${winner ? " history-match__player--winner" : ""}`;
    const information = document.createElement("div");
    const playerName = document.createElement("strong");
    playerName.textContent = name;
    information.appendChild(playerName);
    if (winner) {
      const status = document.createElement("span");
      status.textContent = "Ganador";
      information.appendChild(status);
    }
    player.append(createPortrait(name), information);
    return player;
  };
  const createScore = (winner, loser, score) => {
    const board = document.createElement("div");
    board.className = "history-match__score";
    const tokens = String(score || "").split(/\s+/).filter((token) => /^\d+-\d+(?:\(\d+\))?$/.test(token));
    const values = tokens.map((token) => token.match(/^(\d+)-(\d+)(?:\((\d+)\))?$/));
    [[winner, 1, true], [loser, 2, false]].forEach(([name, side, won]) => {
      const row = document.createElement("div");
      row.className = `history-match__score-row${won ? " history-match__score-row--winner" : ""}`;
      const label = document.createElement("span");
      label.className = "history-match__score-name";
      label.textContent = name;
      const sets = document.createElement("span");
      sets.className = "history-match__score-sets";
      sets.textContent = values.length ? values.map((value) => value?.[side] || "–").join("  ") : "Sin marcador";
      row.append(label, sets);
      board.appendChild(row);
    });
    return board;
  };

  const search = async () => {
    await liveUpdatePromise;
    closeAllOptions();
    const tournament = tournamentByKey.get(normalize(tournamentInput.value));
    const year = Number(yearInput.value);
    const round = roundByKey.get(normalize(roundInput.value));
    message.hidden = false;
    results.hidden = true;
    if (!tournament || !round || !Number.isInteger(year) || year < 1970 || year > new Date().getFullYear()) {
      message.textContent = "Selecciona un torneo, un año válido y una ronda de las opciones disponibles.";
      return;
    }
    const tournamentHistory = getTournamentMatches(tournament);
    const tournamentYears = tournamentHistory
      .map((match) => Number(String(match.date).slice(0, 4)))
      .filter(Number.isInteger);
    const firstTournamentYear = tournamentYears.length ? Math.min(...tournamentYears) : null;
    if (firstTournamentYear && year < firstTournamentYear) {
      message.textContent = `${tournament} comenzó en ${firstTournamentYear}.`;
      return;
    }
    if (!tournamentHistory.some((match) => String(match.date).startsWith(`${year}-`))) {
      message.textContent = `${tournament} no se disputó en ${year}.`;
      return;
    }
    const tournamentIds = new Set(history.tournaments
      .map((name, id) => canonicalTournament(name) === tournament ? id : -1)
      .filter((id) => id >= 0));
    const tournamentYearMatches = history.matches.filter((match) => tournamentIds.has(match[2])
      && String(match[4]).startsWith(`${year}-`));
    const recentTournamentMatches = recentMatches.filter((match) => canonicalTournament(match.tournament) === tournament
      && String(match.date).startsWith(`${year}-`));
    const availableMainRounds = ["R128", "R64", "R32", "R16"]
      .filter((code) => tournamentYearMatches.some((match) => history.rounds[match[3]] === code)
        || recentTournamentMatches.some((match) => match.round === code));
    const mainRoundIndex = ["Primera ronda", "Segunda ronda", "Tercera ronda"].indexOf(round.label);
    const selectedCodes = mainRoundIndex >= 0
      ? [availableMainRounds[mainRoundIndex]].filter(Boolean)
      : round.codes;
    const roundIds = new Set(selectedCodes.map((code) => history.rounds.indexOf(code)).filter((id) => id >= 0));
    const matches = tournamentYearMatches.filter((match) => roundIds.has(match[3]));
    const recentRoundMatches = recentTournamentMatches.filter((match) => selectedCodes.includes(match.round));
    const totalMatches = matches.length + recentRoundMatches.length;
    results.replaceChildren();
    if (!totalMatches) {
      message.textContent = `No hay partidos registrados para ${tournament}, ${year}, ${round.label}.`;
      return;
    }
    const heading = document.createElement("div");
    heading.className = "history-results__heading";
    heading.textContent = `${totalMatches} ${totalMatches === 1 ? "partido encontrado" : "partidos encontrados"}`;
    results.appendChild(heading);
    matches.forEach((match) => {
      const winner = history.players[match[0]];
      const loser = history.players[match[1]];
      const card = document.createElement("article");
      card.className = "history-match";
      const versus = document.createElement("span");
      versus.className = "history-match__versus";
      versus.textContent = "vs";
      card.append(createPlayer(winner, true), versus, createPlayer(loser, false), createScore(winner, loser, match[5]));
      results.appendChild(card);
    });
    recentRoundMatches.forEach((match) => {
      const card = document.createElement("article");
      card.className = "history-match";
      const versus = document.createElement("span");
      versus.className = "history-match__versus";
      versus.textContent = "vs";
      card.append(createPlayer(match.winner, true), versus, createPlayer(match.loser, false), createScore(match.winner, match.loser, match.score));
      results.appendChild(card);
    });
    message.hidden = true;
    message.textContent = "";
    results.hidden = false;
  };

  button.addEventListener("click", () => {
    tournamentInput.value = "";
    yearInput.value = "";
    roundInput.value = "";
    closeAllOptions();
    message.hidden = true;
    message.textContent = "";
    results.hidden = true;
    results.replaceChildren();
    document.getElementById("atp-hero")?.setAttribute("hidden", "");
    document.getElementById("atp-map-view")?.setAttribute("hidden", "");
    document.getElementById("atp-birthdays-agenda")?.setAttribute("hidden", "");
    document.getElementById("atp-tournaments-calendar")?.setAttribute("hidden", "");
    document.getElementById("atp-versus-view")?.setAttribute("hidden", "");
    document.getElementById("atp-map-menu")?.setAttribute("hidden", "");
    document.getElementById("atp-calendar-menu")?.setAttribute("hidden", "");
    document.getElementById("atp-map-btn")?.classList.remove("is-active");
    document.getElementById("atp-calendar-btn")?.classList.remove("is-active");
    const h2hButton = document.getElementById("atp-versus-btn");
    h2hButton?.classList.remove("is-active");
    h2hButton?.setAttribute("aria-pressed", "false");
    view.hidden = false;
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    tournamentInput.focus();
  });
  searchButton.addEventListener("click", search);
  [tournamentInput, yearInput, roundInput].forEach((input) => input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") search();
  }));
});
