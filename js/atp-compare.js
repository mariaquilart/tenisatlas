document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("atp-compare-btn");
  const view = document.getElementById("atp-compare-view");
  const inputOne = document.getElementById("atp-compare-player-one");
  const inputTwo = document.getElementById("atp-compare-player-two");
  const optionsOne = document.getElementById("atp-compare-options-one");
  const optionsTwo = document.getElementById("atp-compare-options-two");
  const toggleOne = document.getElementById("atp-compare-toggle-one");
  const toggleTwo = document.getElementById("atp-compare-toggle-two");
  const message = document.getElementById("atp-compare-message");
  const result = document.getElementById("atp-compare-result");
  const playersNode = document.getElementById("atp-compare-players");
  const headNode = document.getElementById("atp-compare-table-head");
  const bodyNode = document.getElementById("atp-compare-table-body");
  const history = window.ATP_VERSUS_DATA;
  if (!button || !view || !inputOne || !inputTwo || !history) return;

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, " ").replace(/['’]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const aliases = { "yunchaokete bu": "bu yunchaokete", "alexander shevchenko": "aleksandr shevchenko" };
  const mapPlayers = window.ATP_PLAYERS_MAP_DATA || [];
  const excludedMapPlayers = new Set(["Dino Prizmic", "Holger Rune"]);
  const rankedSeed = mapPlayers.filter((player) => player.ranking <= 100 && !excludedMapPlayers.has(player.name)).map((player) => player.name)
    .concat(window.ATP_PALMARES_EXTRA_PLAYERS || [], window.ATP_COMPARE_RANKING_ADDITIONS || []);
  const rankedMap = new Map(rankedSeed.map((player) => [normalize(player), player]));
  if (rankedMap.size < 200) history.players.forEach((player) => { if (rankedMap.size < 200 && !rankedMap.has(normalize(player))) rankedMap.set(normalize(player), player); });
  const players = [...rankedMap.values()].slice(0, 200).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  const profileMap = new Map(mapPlayers.map((player) => [normalize(player.name), player]));
  Object.entries(window.ATP_COMPARE_RANKING_OVERRIDES || {}).forEach(([name, values]) => {
    profileMap.set(normalize(name), { ...(profileMap.get(normalize(name)) || { name }), ...values });
  });
  const photoMap = new Map(Object.entries(window.ATP_PLAYER_PHOTOS || {}).map(([name, photo]) => [normalize(name), photo]));
  [["Jannik Sinner", "https://a.espncdn.com/i/headshots/tennis/players/full/3623.png"], ["Carlos Alcaraz", "https://a.espncdn.com/i/headshots/tennis/players/full/3782.png"], ["Novak Djokovic", "https://a.espncdn.com/i/headshots/tennis/players/full/296.png"], ["Ben Shelton", "images/players/ben-shelton.jpg?v=1"]]
    .forEach(([name, photo]) => { if (!photoMap.has(normalize(name))) photoMap.set(normalize(name), photo); });

  const slams = new Set(["australian open", "roland garros", "wimbledon", "us open"]);
  const masters = ["indian wells", "miami", "monte carlo", "monte-carlo", "madrid masters", "rome masters", "canada masters", "montreal masters", "toronto masters", "cincinnati masters", "shanghai masters", "paris masters", "hamburg masters", "stuttgart masters", "stockholm masters", "essen masters"];
  const atp500 = ["rotterdam", "rio de janeiro", "dubai", "barcelona", "washington", "beijing", "tokyo", "vienna", "basel", "hamburg", "memphis", "valencia", "mexico city", "london / queen", "mubadala dc"];
  const nonTour = ["davis cup", "atp cup", "laver cup", "united cup", "nextgen finals", "next gen finals"];
  const classify = (tournament, year) => {
    const key = normalize(tournament); const season = Number(year);
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
  const titlesFor = (player) => {
    const key = aliases[normalize(player)] || normalize(player);
    const id = history.players.findIndex((name) => normalize(name) === key);
    const titles = new Map();
    if (id >= 0) history.matches.forEach((match) => {
      if (match[0] !== id || history.rounds[match[3]] !== "F") return;
      const tournament = history.tournaments[match[2]];
      if (nonTour.some((item) => normalize(tournament).includes(item))) return;
      const year = String(match[4]).slice(0, 4);
      titles.set(`${normalize(tournament)}-${year}`, { tournament, year, category: classify(tournament, year) });
    });
    (window.ATP_HISTORY_RECENT_MATCHES || []).forEach((match) => {
      if (match.round !== "F" || normalize(match.winner) !== normalize(player)) return;
      const year = String(match.date).slice(0, 4);
      titles.set(`${normalize(match.tournament)}-${year}`, { tournament: match.tournament, year, category: classify(match.tournament, year) });
    });
    (window.ATP_PALMARES_OFFICIAL_UPDATES || []).forEach((title) => {
      if (normalize(title.winner) !== normalize(player)) return;
      const year = String(title.date).slice(0, 4);
      titles.set(`${normalize(title.tournament)}-${year}`, { tournament: title.tournament, year, category: title.category });
    });
    return [...titles.values()].sort((a, b) => Number(a.year) - Number(b.year));
  };
  const recordFor = (player) => {
    const key = aliases[normalize(player)] || normalize(player);
    const id = history.players.findIndex((name) => normalize(name) === key);
    let wins = 0; let losses = 0;
    if (id >= 0) history.matches.forEach((match) => { if (match[0] === id) wins += 1; if (match[1] === id) losses += 1; });
    (window.ATP_HISTORY_RECENT_MATCHES || []).forEach((match) => {
      if (normalize(match.winner) === normalize(player)) wins += 1;
      if (normalize(match.loser) === normalize(player)) losses += 1;
    });
    const total = wins + losses;
    return { wins, losses, percentage: total ? `${(wins * 100 / total).toFixed(1).replace(".0", "")} %` : "Sin dato" };
  };
  const ageFromBirth = (birth) => {
    if (!birth || String(birth).length !== 8) return "Sin dato";
    const today = new Date(); const year = Number(String(birth).slice(0, 4)); const month = Number(String(birth).slice(4, 6)); const day = Number(String(birth).slice(6, 8));
    return today.getFullYear() - year - (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day) ? 1 : 0);
  };
  const dataFor = (player) => {
    const profile = profileMap.get(normalize(player)); const titles = titlesFor(player); const record = recordFor(player);
    const count = (category) => titles.filter((title) => title.category === category).length;
    return { name: player, photo: photoMap.get(normalize(player)), ranking: profile?.ranking || "Sin dato", points: profile?.points ? profile.points.toLocaleString("es-ES") : "Sin dato", country: profile?.country || "Sin dato", age: ageFromBirth(profile?.birth) === "Sin dato" ? (profile?.age || "Sin dato") : ageFromBirth(profile?.birth), height: profile?.height ? `${profile.height} cm` : "Sin dato", hand: profile ? (profile.right === undefined ? "Sin dato" : profile.right ? "Diestro" : "Zurdo") : "Sin dato", wins: record.wins || "Sin dato", losses: record.losses || "Sin dato", percentage: record.percentage, total: titles.length, slam: count("Grand Slam"), masters: count("Masters 1000"), atp500: count("ATP 500"), atp250: count("ATP 250"), finals: count("ATP Finals"), first: titles[0] ? `${titles[0].tournament.replace(/ Masters$/i, "")} · ${titles[0].year}` : "Sin título", latest: titles.at(-1) ? `${titles.at(-1).tournament.replace(/ Masters$/i, "")} · ${titles.at(-1).year}` : "Sin título" };
  };

  let selectedOne = null; let selectedTwo = null;
  const close = (input, options, toggle) => { options.hidden = true; input.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-expanded", "false"); };
  const renderOptions = (slot, query = "") => {
    const [input, options, toggle] = slot === 1 ? [inputOne, optionsOne, toggleOne] : [inputTwo, optionsTwo, toggleTwo];
    const needle = normalize(query); options.replaceChildren();
    const matches = players.filter((player) => !needle || normalize(player).includes(needle));
    matches.forEach((player) => { const option = document.createElement("button"); option.type = "button"; option.className = "palmares-search__option"; option.setAttribute("role", "option"); option.textContent = player; option.addEventListener("click", () => select(slot, player)); options.appendChild(option); });
    options.hidden = false; input.setAttribute("aria-expanded", "true"); toggle.setAttribute("aria-expanded", "true");
  };
  const portrait = (data) => {
    const card = document.createElement("section"); card.className = "compare-player";
    const imageBox = document.createElement("div"); imageBox.className = "compare-player__portrait";
    const initials = data.name.split(/\s+/).filter(Boolean); imageBox.textContent = `${initials[0]?.[0] || ""}${initials.at(-1)?.[0] || ""}`;
    if (data.photo) { const image = document.createElement("img"); image.src = data.photo; image.alt = `Retrato de ${data.name}`; image.addEventListener("error", () => image.remove(), { once: true }); imageBox.appendChild(image); }
    const rank = document.createElement("span"); rank.className = "compare-player__rank"; rank.textContent = data.ranking === "Sin dato" ? "Top 200 ATP" : `N.º ${data.ranking} ATP`;
    const name = document.createElement("h2"); name.textContent = data.name; card.append(imageBox, rank, name); return card;
  };
  const rows = [
    ["Ranking ATP", "ranking"], ["Puntos ATP", "points"], ["País", "country"], ["Edad", "age"], ["Altura", "height"], ["Mano", "hand"],
    ["Partidos ganados", "wins"], ["Partidos perdidos", "losses"], ["Victorias", "percentage"], ["Títulos totales", "total"],
    ["Grand Slam", "slam"], ["Masters 1000", "masters"], ["ATP 500", "atp500"], ["ATP 250", "atp250"], ["ATP Finals", "finals"]
  ];
  const renderComparison = () => {
    if (!selectedOne || !selectedTwo || selectedOne === selectedTwo) { result.hidden = true; message.hidden = false; message.textContent = selectedOne === selectedTwo && selectedOne ? "Selecciona dos tenistas distintos." : "Selecciona dos tenistas distintos para compararlos."; return; }
    const one = dataFor(selectedOne); const two = dataFor(selectedTwo); playersNode.replaceChildren(portrait(one), portrait(two));
    headNode.innerHTML = `<tr><th>Dato</th><th>${one.name}</th><th>${two.name}</th></tr>`; bodyNode.replaceChildren();
    rows.forEach(([label, key]) => { const row = document.createElement("tr"); const equal = one[key] === two[key] && !["Sin dato", "Sin título"].includes(String(one[key])); if (equal) row.className = "is-match"; [label, one[key], two[key]].forEach((value, index) => { const cell = document.createElement(index ? "td" : "th"); if (!index) cell.scope = "row"; cell.textContent = value; row.appendChild(cell); }); bodyNode.appendChild(row); });
    message.hidden = true; result.hidden = false;
  };
  function select(slot, player) { if (slot === 1) { selectedOne = player; inputOne.value = player; close(inputOne, optionsOne, toggleOne); } else { selectedTwo = player; inputTwo.value = player; close(inputTwo, optionsTwo, toggleTwo); } renderComparison(); }
  [[1, inputOne, optionsOne, toggleOne], [2, inputTwo, optionsTwo, toggleTwo]].forEach(([slot, input, options, toggle]) => {
    input.addEventListener("input", () => { if (slot === 1) selectedOne = null; else selectedTwo = null; result.hidden = true; renderOptions(slot, input.value); });
    input.addEventListener("focus", () => renderOptions(slot, input.value));
    input.addEventListener("keydown", (event) => { if (event.key === "Escape") close(input, options, toggle); if (event.key === "Enter") { const match = players.find((player) => normalize(player).includes(normalize(input.value))); if (match) select(slot, match); } });
    toggle.addEventListener("click", () => options.hidden ? renderOptions(slot, "") : close(input, options, toggle));
  });
  document.addEventListener("click", (event) => { if (!event.target.closest(".compare-search")) { close(inputOne, optionsOne, toggleOne); close(inputTwo, optionsTwo, toggleTwo); } });
  button.addEventListener("click", () => {
    ["atp-hero", "atp-map-view", "atp-birthdays-agenda", "atp-tournaments-calendar", "atp-versus-view", "atp-history-view", "atp-palmares-view"].forEach((id) => document.getElementById(id)?.setAttribute("hidden", ""));
    document.querySelectorAll(".site-nav__link.is-active").forEach((item) => { item.classList.remove("is-active"); item.setAttribute("aria-pressed", "false"); });
    view.hidden = false; button.classList.add("is-active"); button.setAttribute("aria-pressed", "true"); inputOne.focus();
  });
  document.querySelector(".site-nav__menu")?.addEventListener("click", (event) => {
    const opensSubmenu = event.target.id === "atp-map-btn" || event.target.id === "atp-calendar-btn";
    if (event.target !== button && !opensSubmenu) {
      view.hidden = true;
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    }
  }, true);
});
