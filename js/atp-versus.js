document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("atp-versus-btn");
  const view = document.getElementById("atp-versus-view");
  const inputOne = document.getElementById("atp-versus-player-one");
  const inputTwo = document.getElementById("atp-versus-player-two");
  const compareButton = document.getElementById("atp-versus-compare");
  const optionsOne = document.getElementById("atp-versus-options-one");
  const optionsTwo = document.getElementById("atp-versus-options-two");
  const message = document.getElementById("atp-versus-message");
  const result = document.getElementById("atp-versus-result");
  const summary = document.getElementById("atp-versus-summary");
  const matchesContainer = document.getElementById("atp-versus-matches");
  if (!button || !view || !inputOne || !inputTwo || !compareButton || !optionsOne || !optionsTwo) return;

  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

  const history = window.ATP_VERSUS_DATA || { players: [], tournaments: [], rounds: [], matches: [] };
  const players = new Map();
  const playerIds = new Map();
  history.players.forEach((name, id) => {
    const key = normalize(name);
    if (!players.has(key)) {
      players.set(key, name);
      playerIds.set(key, id);
    }
  });

  Object.values(window.ATP_MATCHES_HISTORY || {}).forEach((day) => (day.matches || []).forEach((match) => {
    [match.player1, match.player2].forEach((player) => {
      if (player?.photo) photoMap.set(normalize(player.name), player.photo);
    });
  }));

  let playerNames = [...players.values()].sort((a, b) => a.localeCompare(b, "es"));
  const liveMatches = [];
  const parseCsv = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
        else quoted = !quoted;
      } else if (character === "," && !quoted) {
        row.push(field); field = "";
      } else if ((character === "\n" || character === "\r") && !quoted) {
        if (character === "\r" && text[index + 1] === "\n") index += 1;
        row.push(field);
        if (row.some(Boolean)) rows.push(row);
        row = []; field = "";
      } else field += character;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
  };

  const refreshCurrentYear = async () => {
    const year = new Date().getFullYear();
    try {
      liveMatches.length = 0;
      const url = `https://raw.githubusercontent.com/Aneeshers/tennis-sackmann-archive/main/atp/atp_matches_${year}.csv?v=${new Date().toISOString().slice(0, 10)}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = parseCsv(await response.text());
      const headers = rows.shift() || [];
      const column = (name) => headers.indexOf(name);
      const winnerColumn = column("winner_name");
      const loserColumn = column("loser_name");
      const tournamentColumn = column("tourney_name");
      const roundColumn = column("round");
      const dateColumn = column("tourney_date");
      if ([winnerColumn, loserColumn, tournamentColumn, roundColumn, dateColumn].some((index) => index < 0)) return;

      const known = new Set(history.matches
        .filter((match) => String(match[4]).startsWith(String(year)))
        .map((match) => [
          normalize(history.players[match[0]]), normalize(history.players[match[1]]),
          history.tournaments[match[2]], history.rounds[match[3]], match[4],
        ].join("|")));
      rows.forEach((row) => {
        const winner = row[winnerColumn];
        const loser = row[loserColumn];
        if (!winner || !loser) return;
        const rawDate = row[dateColumn] || "";
        const date = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;
        const match = { winner, loser, tournament: row[tournamentColumn], roundCode: row[roundColumn], date };
        const key = [normalize(winner), normalize(loser), match.tournament, match.roundCode, date].join("|");
        if (known.has(key)) return;
        known.add(key);
        liveMatches.push(match);
        [winner, loser].forEach((name) => {
          const normalizedName = normalize(name);
          if (!players.has(normalizedName)) players.set(normalizedName, name);
        });
      });
      playerNames = [...players.values()].sort((a, b) => a.localeCompare(b, "es"));
    } catch (error) {
      console.warn("No se pudo actualizar el histórico ATP; se usan los datos locales.", error);
    }
  };
  let liveUpdatePromise = Promise.resolve();
  const closeOptions = (input, container) => {
    container.hidden = true;
    container.replaceChildren();
    input.setAttribute("aria-expanded", "false");
  };
  const showOptions = (input, container) => {
    const query = normalize(input.value);
    if (!query) {
      closeOptions(input, container);
      return;
    }
    const suggestions = playerNames
      .filter((name) => normalize(name).includes(query))
      .slice(0, 8);
    container.replaceChildren();
    suggestions.forEach((name) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "versus-search__option";
      option.setAttribute("role", "option");
      option.textContent = name;
      option.addEventListener("mousedown", (event) => {
        event.preventDefault();
        input.value = name;
        closeOptions(input, container);
      });
      container.appendChild(option);
    });
    container.hidden = !suggestions.length;
    input.setAttribute("aria-expanded", String(Boolean(suggestions.length)));
  };

  [[inputOne, optionsOne], [inputTwo, optionsTwo]].forEach(([input, container]) => {
    input.addEventListener("input", () => showOptions(input, container));
    input.addEventListener("focus", () => showOptions(input, container));
    input.addEventListener("blur", () => closeOptions(input, container));
  });

  const initials = (name) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
  const portrait = (name) => {
    const holder = document.createElement("div");
    holder.className = "versus-player__portrait";
    const photo = photoMap.get(normalize(name));
    if (!photo) {
      holder.textContent = initials(name);
      return holder;
    }
    const image = document.createElement("img");
    image.src = photo;
    image.alt = `Foto de ${name}`;
    image.addEventListener("error", () => holder.replaceChildren(initials(name)), { once: true });
    holder.appendChild(image);
    return holder;
  };

  const playerCard = (name, wins) => {
    const card = document.createElement("article");
    card.className = "versus-player";
    const playerName = document.createElement("h2");
    playerName.className = "versus-player__name";
    playerName.textContent = name;
    const victories = document.createElement("p");
    victories.className = "versus-player__wins";
    victories.textContent = `${wins} ${wins === 1 ? "victoria" : "victorias"}`;
    card.append(portrait(name), playerName, victories);
    return card;
  };

  const formatDate = (date) => {
    const parsed = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(parsed);
  };

  const compare = async () => {
    compareButton.disabled = true;
    await liveUpdatePromise;
    compareButton.disabled = false;
    const keyOne = normalize(inputOne.value);
    const keyTwo = normalize(inputTwo.value);
    const nameOne = players.get(keyOne);
    const nameTwo = players.get(keyTwo);
    result.hidden = true;
    message.hidden = false;
    if (!nameOne || !nameTwo) {
      message.textContent = "Selecciona dos tenistas de las sugerencias del buscador.";
      return;
    }
    if (keyOne === keyTwo) {
      message.textContent = "Selecciona dos tenistas diferentes.";
      return;
    }

    const idOne = playerIds.get(keyOne);
    const idTwo = playerIds.get(keyTwo);
    const roundLabels = {
      F: "Final", SF: "Semifinal", QF: "Cuartos de final", R16: "Octavos de final",
      R32: "Dieciseisavos de final", R64: "Primera ronda", R128: "Primera ronda",
      RR: "Fase de grupos", Q1: "Primera ronda de clasificación", Q2: "Segunda ronda de clasificación",
      Q3: "Ronda final de clasificación", BR: "Partido por el bronce",
    };
    const meetings = history.matches
      .filter((match) => (match[0] === idOne && match[1] === idTwo) || (match[0] === idTwo && match[1] === idOne))
      .map((match) => ({
        winnerId: match[0],
        winner: history.players[match[0]],
        loser: history.players[match[1]],
        tournament: history.tournaments[match[2]] || "Torneo no disponible",
        round: roundLabels[history.rounds[match[3]]] || history.rounds[match[3]] || "Ronda no disponible",
        date: match[4],
      }))
      .concat(liveMatches
        .filter((match) => {
          const winner = normalize(match.winner);
          const loser = normalize(match.loser);
          return (winner === keyOne && loser === keyTwo) || (winner === keyTwo && loser === keyOne);
        })
        .map((match) => ({
          ...match,
          winnerId: playerIds.get(normalize(match.winner)),
          round: roundLabels[match.roundCode] || match.roundCode || "Ronda no disponible",
        })))
      .sort((a, b) => b.date.localeCompare(a.date));
    const winsOne = meetings.filter((match) => normalize(match.winner) === keyOne).length;
    const winsTwo = meetings.length - winsOne;

    const score = document.createElement("div");
    score.className = "versus-score";
    const scoreValue = document.createElement("strong");
    scoreValue.textContent = `${winsOne}-${winsTwo}`;
    const scoreLabel = document.createElement("span");
    scoreLabel.textContent = `${meetings.length} enfrentamientos`;
    score.append(scoreValue, scoreLabel);
    summary.replaceChildren(playerCard(nameOne, winsOne), score, playerCard(nameTwo, winsTwo));

    matchesContainer.replaceChildren();
    meetings.forEach((match) => {
      const row = document.createElement("article");
      row.className = "versus-match";
      const date = document.createElement("time");
      date.className = "versus-match__date";
      date.dateTime = match.date;
      date.textContent = formatDate(match.date);
      const event = document.createElement("div");
      event.className = "versus-match__event";
      const tournament = document.createElement("strong");
      tournament.textContent = match.tournament;
      const round = document.createElement("span");
      round.textContent = match.round;
      event.append(tournament, round);
      const winner = document.createElement("div");
      winner.className = "versus-match__winner";
      const winnerName = document.createElement("strong");
      winnerName.textContent = match.winner;
      const winnerLabel = document.createElement("span");
      winnerLabel.textContent = "Ganador";
      winner.append(winnerName, winnerLabel);
      row.append(date, event, winner);
      matchesContainer.appendChild(row);
    });
    if (!meetings.length) {
      const empty = document.createElement("p");
      empty.className = "versus-view__message";
      empty.textContent = "No hay enfrentamientos registrados entre estos jugadores en el historial disponible.";
      matchesContainer.appendChild(empty);
    }
    message.textContent = meetings.length
      ? `${meetings.length} ${meetings.length === 1 ? "enfrentamiento encontrado" : "enfrentamientos encontrados"}.`
      : "Sin enfrentamientos registrados.";
    result.hidden = false;
  };

  button.addEventListener("click", () => {
    liveUpdatePromise = refreshCurrentYear();
    document.getElementById("atp-hero")?.setAttribute("hidden", "");
    document.getElementById("atp-map-view")?.setAttribute("hidden", "");
    document.getElementById("atp-birthdays-agenda")?.setAttribute("hidden", "");
    document.getElementById("atp-tournaments-calendar")?.setAttribute("hidden", "");
    document.getElementById("atp-map-menu")?.setAttribute("hidden", "");
    document.getElementById("atp-calendar-menu")?.setAttribute("hidden", "");
    document.getElementById("atp-map-btn")?.classList.remove("is-active");
    document.getElementById("atp-calendar-btn")?.classList.remove("is-active");
    view.hidden = false;
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    inputOne.focus();
  });
  compareButton.addEventListener("click", compare);
  [inputOne, inputTwo].forEach((input) => input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") compare();
  }));
});
