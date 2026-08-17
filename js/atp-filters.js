document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("atp-filters-btn");
  const view = document.getElementById("atp-filters-view");
  const panel = document.getElementById("atp-players-filter-panel");
  const countrySelect = document.getElementById("atp-filter-country");
  const funnel = document.getElementById("atp-filters-funnel");
  const results = document.getElementById("atp-filters-results");
  const empty = document.getElementById("atp-filters-empty");
  const clearButton = document.getElementById("atp-filters-clear");
  const history = window.ATP_VERSUS_DATA;
  if (!button || !view || !panel || !history) return;

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, " ").replace(/['’]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const mapPlayers = window.ATP_PLAYERS_MAP_DATA || [];
  const excluded = new Set(["Dino Prizmic", "Holger Rune"]);
  const seed = mapPlayers.filter((player) => player.ranking <= 100 && !excluded.has(player.name)).map((player) => player.name)
    .concat(window.ATP_PALMARES_EXTRA_PLAYERS || [], window.ATP_COMPARE_RANKING_ADDITIONS || []);
  const ranked = new Map(seed.map((name) => [normalize(name), name]));
  if (ranked.size < 200) history.players.forEach((name) => { if (ranked.size < 200 && !ranked.has(normalize(name))) ranked.set(normalize(name), name); });
  const names = [...ranked.values()].slice(0, 200);
  const nameKeys = new Set(names.map(normalize));
  const profiles = new Map(mapPlayers.map((player) => [normalize(player.name), player]));
  Object.entries(window.ATP_COMPARE_RANKING_OVERRIDES || {}).forEach(([name, values]) => profiles.set(normalize(name), { ...(profiles.get(normalize(name)) || { name }), ...values }));
  const photos = new Map(Object.entries(window.ATP_PLAYER_PHOTOS || {}).map(([name, photo]) => [normalize(name), photo]));
  [["Jannik Sinner", "https://a.espncdn.com/i/headshots/tennis/players/full/3623.png"], ["Carlos Alcaraz", "https://a.espncdn.com/i/headshots/tennis/players/full/3782.png"], ["Novak Djokovic", "https://a.espncdn.com/i/headshots/tennis/players/full/296.png"], ["Ben Shelton", "images/players/ben-shelton.jpg?v=1"]]
    .forEach(([name, photo]) => { if (!photos.has(normalize(name))) photos.set(normalize(name), photo); });

  const clay = ["roland garros", "monte carlo", "monte-carlo", "madrid", "rome", "roma", "barcelona", "rio de janeiro", "buenos aires", "munich", "munich", "hamburg", "bastad", "gstaad", "kitzbuhel", "umag", "estoril", "geneva", "houston", "marrakech", "santiago"];
  const grass = ["wimbledon", "queen", "halle", "stuttgart", "hertogenbosch", "rosmalen", "newport", "eastbourne", "mallorca"];
  const slams = new Set(["australian open", "roland garros", "wimbledon", "us open"]);
  const masters = ["indian wells", "miami", "monte carlo", "monte-carlo", "madrid masters", "rome masters", "canada masters", "montreal masters", "toronto masters", "cincinnati masters", "shanghai masters", "paris masters"];
  const nonTour = ["davis cup", "atp cup", "laver cup", "united cup", "nextgen finals", "next gen finals"];
  const surfaceOf = (tournament) => { const key = normalize(tournament); if (grass.some((item) => key.includes(item))) return "grass"; if (clay.some((item) => key.includes(item))) return "clay"; return "hard"; };
  const isBigTitle = (tournament) => { const key = normalize(tournament); return slams.has(key) || masters.some((item) => key.includes(item)) || key.includes("tour finals") || key.includes("masters cup"); };
  const ageOf = (birth) => {
    if (!birth || String(birth).length !== 8) return null;
    const value = String(birth); const today = new Date(); const year = Number(value.slice(0, 4)); const month = Number(value.slice(4, 6)); const day = Number(value.slice(6, 8));
    return today.getFullYear() - year - (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day) ? 1 : 0);
  };
  let playerData = null;
  const buildData = () => {
    if (playerData) return playerData;
    const titleMaps = new Map(names.map((name) => [normalize(name), new Map()]));
    history.matches.forEach((match) => {
      if (history.rounds[match[3]] !== "F") return;
      const winner = history.players[match[0]]; const key = normalize(winner); if (!nameKeys.has(key)) return;
      const tournament = history.tournaments[match[2]]; if (nonTour.some((item) => normalize(tournament).includes(item))) return;
      const year = String(match[4]).slice(0, 4); titleMaps.get(key).set(`${normalize(tournament)}-${year}`, { tournament, year });
    });
    (window.ATP_HISTORY_RECENT_MATCHES || []).forEach((match) => {
      if (match.round !== "F" || !nameKeys.has(normalize(match.winner))) return;
      const year = String(match.date).slice(0, 4); titleMaps.get(normalize(match.winner)).set(`${normalize(match.tournament)}-${year}`, { tournament: match.tournament, year });
    });
    (window.ATP_PALMARES_OFFICIAL_UPDATES || []).forEach((title) => {
      if (!nameKeys.has(normalize(title.winner))) return;
      const year = String(title.date).slice(0, 4); titleMaps.get(normalize(title.winner)).set(`${normalize(title.tournament)}-${year}`, { tournament: title.tournament, year });
    });
    playerData = names.map((name, index) => {
      const key = normalize(name); const profile = profiles.get(key); const titles = [...titleMaps.get(key).values()];
      const surfaces = { hard: 0, clay: 0, grass: 0 }; titles.forEach((title) => { surfaces[surfaceOf(title.tournament)] += 1; });
      const maxSurface = Math.max(...Object.values(surfaces)); const leaders = Object.keys(surfaces).filter((surface) => surfaces[surface] === maxSurface);
      const favoriteSurface = maxSurface && leaders.length === 1 ? leaders[0] : null;
      const bigShare = titles.length ? titles.filter((title) => isBigTitle(title.tournament)).length / titles.length : 0;
      let style = null;
      if (profile?.height || titles.length) {
        const grassShare = titles.length ? surfaces.grass / titles.length : 0; const clayShare = titles.length ? surfaces.clay / titles.length : 0; const hardShare = titles.length ? surfaces.hard / titles.length : 0;
        if (profile?.height >= 190 || grassShare >= .35 || (hardShare >= .75 && bigShare >= .2)) style = "aggressive";
        else if ((profile?.height && profile.height <= 180) || clayShare >= .6) style = "defensive";
        else style = "balanced";
      }
      return { name, ranking: profile?.ranking || index + 1, country: profile?.country || null, age: ageOf(profile?.birth) ?? profile?.age ?? null, height: profile?.height || null, hand: profile?.right === undefined ? null : (profile.right ? "right" : "left"), titles: titles.length, surface: favoriteSurface, style, photo: photos.get(key) || null };
    });
    return playerData;
  };

  const countries = [...new Set(mapPlayers.map((player) => player.country).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  countries.forEach((country) => { const option = document.createElement("option"); option.value = country; option.textContent = country; countrySelect.appendChild(option); });
  const selects = [...panel.querySelectorAll("select[data-player-filter]")];
  const predicates = {
    height: (player, value) => player.height && (value === "lt180" ? player.height < 180 : value === "180-190" ? player.height >= 180 && player.height <= 190 : player.height > 190),
    hand: (player, value) => player.hand === value,
    age: (player, value) => player.age !== null && (value === "u21" ? player.age <= 21 : value === "22-25" ? player.age >= 22 && player.age <= 25 : value === "26-30" ? player.age >= 26 && player.age <= 30 : player.age > 30),
    titles: (player, value) => value === "0" ? player.titles === 0 : value === "1-5" ? player.titles >= 1 && player.titles <= 5 : value === "6-10" ? player.titles >= 6 && player.titles <= 10 : value === "11-25" ? player.titles >= 11 && player.titles <= 25 : player.titles >= 26,
    country: (player, value) => player.country === value,
    surface: (player, value) => player.surface === value,
    style: (player, value) => player.style === value
  };
  const cardFor = (player) => {
    const card = document.createElement("article"); card.className = "players-filter-card";
    const portrait = document.createElement("div"); portrait.className = "players-filter-card__portrait";
    const parts = player.name.split(/\s+/); portrait.textContent = `${parts[0]?.[0] || ""}${parts.at(-1)?.[0] || ""}`;
    if (player.photo) { const image = document.createElement("img"); image.src = player.photo; image.alt = `Retrato de ${player.name}`; image.loading = "lazy"; image.addEventListener("error", () => image.remove(), { once: true }); portrait.appendChild(image); }
    const information = document.createElement("div"); const rank = document.createElement("span"); rank.textContent = `N.º ${player.ranking} ATP`; const name = document.createElement("h2"); name.textContent = player.name; information.append(rank, name); card.append(portrait, information); return card;
  };
  const render = () => {
    let filtered = buildData(); funnel.replaceChildren();
    const base = document.createElement("strong"); base.textContent = `${filtered.length} jugadores`; funnel.appendChild(base);
    selects.forEach((select) => {
      if (!select.value) return;
      filtered = filtered.filter((player) => predicates[select.dataset.playerFilter](player, select.value));
    });
    base.textContent = `${filtered.length} ${filtered.length === 1 ? "jugador" : "jugadores"}`;
    results.replaceChildren(...filtered.map(cardFor)); results.hidden = !filtered.length; empty.hidden = Boolean(filtered.length);
  };
  selects.forEach((select) => select.addEventListener("change", render));
  clearButton.addEventListener("click", () => { selects.forEach((select) => { select.value = ""; }); render(); });
  button.addEventListener("click", () => {
    ["atp-hero", "atp-map-view", "atp-birthdays-agenda", "atp-tournaments-calendar", "atp-versus-view", "atp-history-view", "atp-palmares-view", "atp-compare-view"].forEach((id) => document.getElementById(id)?.setAttribute("hidden", ""));
    document.querySelectorAll(".site-nav__link.is-active").forEach((item) => { item.classList.remove("is-active"); item.setAttribute("aria-pressed", "false"); });
    view.hidden = false; button.classList.add("is-active"); button.setAttribute("aria-pressed", "true"); render();
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
