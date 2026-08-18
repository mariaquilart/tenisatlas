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
  // El CSV externo usa a veces la fecha de inicio del torneo en vez de la fecha
  // real del partido. El marcador y el año permiten unir ese registro con el
  // local aunque difieran el nombre del torneo, la ronda o el día.
  const matchIdentity = (match) => {
    const date = String(match.date || "");
    const score = normalize(match.score);
    const occurrence = score ? `${date.slice(0, 4)}|${score}` : date;
    return [normalize(match.winner), normalize(match.loser), occurrence].join("|");
  };
  const addLiveMatch = (match, knownMatches) => {
    const key = matchIdentity(match);
    if (knownMatches.has(key)) return;
    knownMatches.add(key);
    liveMatches.push(match);
  };
  const addLocalCompletedMatches = () => {
    const knownMatches = new Set(liveMatches.map(matchIdentity));
    const daily = window.ATP_DAILY_MATCHES || {};
    const days = [
      ...Object.values(daily.archive || {}),
      { date: daily.date, matches: daily.matches || [] },
    ];
    days.forEach((day) => (day.matches || []).forEach((match) => {
      const first = match.player1;
      const second = match.player2;
      if (!first?.name || !second?.name || first.lost === second.lost) return;
      const winner = first.lost ? second : first;
      const loser = first.lost ? first : second;
      addLiveMatch({
        winner: winner.name,
        loser: loser.name,
        tournament: match.tournament || "Torneo no disponible",
        roundCode: match.round || "Ronda no disponible",
        date: match.date || day.date,
        score: match.score || "",
      }, knownMatches);
      [winner.name, loser.name].forEach((name) => {
        const key = normalize(name);
        if (!players.has(key)) players.set(key, name);
      });
    }));
  };
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
      addLocalCompletedMatches();
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
      const scoreColumn = column("score");
      if ([winnerColumn, loserColumn, tournamentColumn, roundColumn, dateColumn].some((index) => index < 0)) return;

      const known = new Set(history.matches
        .filter((match) => String(match[4]).startsWith(String(year)))
        .map((match) => matchIdentity({
          winner: history.players[match[0]], loser: history.players[match[1]], date: match[4], score: match[5],
        })));
      liveMatches.forEach((match) => known.add(matchIdentity(match)));
      rows.forEach((row) => {
        const winner = row[winnerColumn];
        const loser = row[loserColumn];
        if (!winner || !loser) return;
        const rawDate = row[dateColumn] || "";
        const date = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;
        const match = {
          winner, loser, tournament: row[tournamentColumn], roundCode: row[roundColumn], date,
          score: scoreColumn >= 0 ? row[scoreColumn] : "",
        };
        addLiveMatch(match, known);
        [winner, loser].forEach((name) => {
          const normalizedName = normalize(name);
          if (!players.has(normalizedName)) players.set(normalizedName, name);
        });
      });
      playerNames = [...players.values()].sort((a, b) => a.localeCompare(b, "es"));
    } catch (error) {
      if (!liveMatches.length) addLocalCompletedMatches();
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

  const buildScoreboard = (match) => {
    const board = document.createElement("div");
    board.className = "versus-scoreboard";
    const tokens = String(match.score || "").trim().split(/\s+/).filter(Boolean);
    const setScores = tokens.filter((token) => /^\d+-\d+(?:\(\d+\))?$/.test(token));
    const status = tokens.filter((token) => !/^\d+-\d+(?:\(\d+\))?$/.test(token)).join(" ");
    if (!setScores.length) {
      board.classList.add("versus-scoreboard--empty");
      board.textContent = match.score || "Marcador no disponible";
      return board;
    }

    const heading = document.createElement("div");
    heading.className = "versus-scoreboard__heading";
    const playerHeading = document.createElement("span");
    playerHeading.textContent = "Jugador";
    heading.appendChild(playerHeading);
    setScores.forEach((_, index) => {
      const setHeading = document.createElement("span");
      setHeading.textContent = `S${index + 1}`;
      heading.appendChild(setHeading);
    });

    const scores = setScores.map((setScore) => {
      const parts = setScore.match(/^(\d+)-(\d+)(?:\((\d+)\))?$/);
      return { winner: parts?.[1] || "–", loser: parts?.[2] || "–", tiebreak: parts?.[3] || "" };
    });
    const createRow = (name, side, won) => {
      const row = document.createElement("div");
      row.className = `versus-scoreboard__row${won ? " versus-scoreboard__row--winner" : ""}`;
      const player = document.createElement("strong");
      player.className = "versus-scoreboard__player";
      player.textContent = name;
      row.appendChild(player);
      scores.forEach((score) => {
        const cell = document.createElement("span");
        cell.className = "versus-scoreboard__set";
        cell.textContent = score[side];
        if (side === "loser" && score.tiebreak) {
          const tiebreak = document.createElement("sup");
          tiebreak.textContent = score.tiebreak;
          cell.appendChild(tiebreak);
        }
        row.appendChild(cell);
      });
      return row;
    };
    board.append(heading, createRow(match.winner, "winner", true), createRow(match.loser, "loser", false));
    if (status) {
      const note = document.createElement("div");
      note.className = "versus-scoreboard__status";
      note.textContent = status;
      board.appendChild(note);
    }
    return board;
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
      R32: "Tercera ronda", R64: "Segunda ronda", R128: "Primera ronda",
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
        score: match[5] || "",
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
    if (meetings.length) {
      const tableHeader = document.createElement("div");
      tableHeader.className = "versus-match versus-match--header";
      ["Fecha", "Torneo", "Ronda", "Ganador", "Sets"].forEach((label) => {
        const heading = document.createElement("span");
        heading.textContent = label;
        tableHeader.appendChild(heading);
      });
      matchesContainer.appendChild(tableHeader);
    }
    meetings.forEach((match) => {
      const normalizedTournament = normalize(match.tournament);
      const isGrandSlam = ["australianopen", "rolandgarros", "frenchopen", "wimbledon", "usopen"]
        .some((grandSlam) => normalizedTournament.includes(grandSlam));
      const row = document.createElement("article");
      row.className = "versus-match";
      if (isGrandSlam) row.classList.add("versus-match--grand-slam");
      const date = document.createElement("time");
      date.className = "versus-match__date";
      date.dateTime = match.date;
      date.textContent = formatDate(match.date);
      const event = document.createElement("div");
      event.className = "versus-match__event";
      const tournament = document.createElement("strong");
      tournament.textContent = match.tournament;
      event.appendChild(tournament);
      const round = document.createElement("div");
      round.className = "versus-match__round";
      round.textContent = match.round;
      const winner = document.createElement("div");
      winner.className = "versus-match__winner";
      const winnerName = document.createElement("strong");
      winnerName.textContent = match.winner;
      winner.appendChild(winnerName);
      const sets = document.createElement("div");
      sets.className = "versus-match__sets";
      const setsButton = document.createElement("button");
      setsButton.type = "button";
      setsButton.className = "versus-match__sets-button";
      setsButton.setAttribute("aria-expanded", "false");
      setsButton.setAttribute("aria-label", `Ver sets de ${match.winner} contra ${match.loser}`);
      setsButton.textContent = ">";
      sets.appendChild(setsButton);
      const scoreDetail = document.createElement("div");
      scoreDetail.className = "versus-match__score-detail";
      scoreDetail.hidden = true;
      scoreDetail.appendChild(buildScoreboard(match));
      setsButton.addEventListener("click", () => {
        const expanded = setsButton.getAttribute("aria-expanded") === "true";
        setsButton.setAttribute("aria-expanded", String(!expanded));
        scoreDetail.hidden = expanded;
      });
      row.append(date, event, round, winner, sets);
      const group = document.createElement("div");
      group.className = "versus-match-group";
      if (isGrandSlam) group.classList.add("versus-match-group--grand-slam");
      group.append(row, scoreDetail);
      matchesContainer.appendChild(group);
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
    inputOne.value = "";
    inputTwo.value = "";
    closeOptions(inputOne, optionsOne);
    closeOptions(inputTwo, optionsTwo);
    message.hidden = true;
    message.textContent = "";
    result.hidden = true;
    summary.replaceChildren();
    matchesContainer.replaceChildren();
    document.getElementById("atp-hero")?.setAttribute("hidden", "");
    document.getElementById("atp-map-view")?.setAttribute("hidden", "");
    document.getElementById("atp-birthdays-agenda")?.setAttribute("hidden", "");
    document.getElementById("atp-tournaments-calendar")?.setAttribute("hidden", "");
    document.getElementById("atp-history-view")?.setAttribute("hidden", "");
    document.getElementById("atp-map-menu")?.setAttribute("hidden", "");
    document.getElementById("atp-calendar-menu")?.setAttribute("hidden", "");
    document.getElementById("atp-map-btn")?.classList.remove("is-active");
    document.getElementById("atp-calendar-btn")?.classList.remove("is-active");
    const historyButton = document.getElementById("atp-history-btn");
    historyButton?.classList.remove("is-active");
    historyButton?.setAttribute("aria-pressed", "false");
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
