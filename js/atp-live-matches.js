(() => {
  const ENDPOINT = "https://site.web.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard";
  const CACHE_KEY = "tenisatlas-atp-live-matches-v1";
  const REFRESH_INTERVAL = 5 * 60 * 1000;

  const dateKey = (date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(date);
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  };

  const compactDate = (date) => dateKey(date).replaceAll("-", "");
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
  const localTime = (isoDate) => new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(isoDate));

  const countryCodeFrom = (competitor) => {
    const flag = competitor?.athlete?.flag;
    const fileCode = flag?.href?.match(/\/([a-z]{3})\.png(?:\?|$)/i)?.[1];
    return fileCode?.toUpperCase() || flag?.alt || "";
  };

  const playerFrom = (competitor) => ({
    name: competitor?.athlete?.displayName || competitor?.displayName || "Jugador por confirmar",
    country_code: countryCodeFrom(competitor),
    photo: competitor?.athlete?.headshot?.href || undefined,
    lost: competitor?.winner === false,
  });

  const scoreFrom = (competitors) => {
    const sets = Math.max(...competitors.map((player) => player?.linescores?.length || 0), 0);
    return Array.from({ length: sets }, (_, index) => competitors
      .map((player) => player?.linescores?.[index]?.value)
      .filter((value) => value !== undefined)
      .join("-")).filter(Boolean).join(" ");
  };

  const eventToMatch = (event) => {
    const competition = event?.competitions?.[0];
    const competitors = competition?.competitors || [];
    if (competitors.length !== 2) return null;
    const status = competition?.status?.type || event?.status?.type || {};
    const completed = Boolean(status.completed || status.state === "post");
    const inProgress = status.state === "in";
    const score = scoreFrom(competitors);
    return {
      id: `espn-atp-${event.id || competition.id}`,
      date: dateKey(new Date(competition.date || event.date)),
      tournament: event?.name || event?.league?.name || competition?.tournament?.name || event?.season?.name || "ATP Tour",
      round: competition?.round?.displayName || competition?.type?.text || competition?.type?.abbreviation || "Partido ATP",
      time: completed ? "Finalizado" : inProgress ? "En juego" : localTime(competition.date || event.date),
      score: score || undefined,
      player1: playerFrom(competitors[0]),
      player2: playerFrom(competitors[1]),
    };
  };

  const flattenEvents = (payload) => (payload?.events || []).flatMap((event) => {
    const singlesGroups = (event.groupings || []).filter((group) => group?.grouping?.slug === "mens-singles");
    const competitions = singlesGroups.length
      ? singlesGroups.flatMap((group) => group.competitions || [])
      : (event.competitions || []);
    return competitions
      .map((competition) => eventToMatch({ ...event, id: competition.id, competitions: [competition] }))
      .filter(Boolean);
  });

  const identity = (match) => {
    const players = [match.player1?.name, match.player2?.name].filter(Boolean).sort().join("|").toLowerCase();
    return `${match.date}|${players}`;
  };

  const installMatches = (remoteMatches) => {
    const daily = window.ATP_DAILY_MATCHES;
    if (!daily || !remoteMatches.length) return;
    const localMatches = [
      ...Object.values(daily.archive || {}).flatMap((entry) => entry.matches || []),
      ...(daily.matches || []).map((match) => ({ ...match, date: match.date || daily.date })),
      ...(daily.upcoming || []),
    ];
    const merged = new Map(localMatches.map((match) => [identity(match), match]));
    remoteMatches.forEach((match) => merged.set(identity(match), match));
    const allMatches = [...merged.values()];
    const today = dateKey(new Date());
    window.ATP_DAILY_MATCHES = {
      ...daily,
      date: today,
      updatedAt: new Date().toISOString(),
      source: ENDPOINT,
      matches: allMatches.filter((match) => match.date === today),
      upcoming: allMatches.filter((match) => match.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
      archive: Object.fromEntries([...new Set(allMatches.filter((match) => match.date < today).map((match) => match.date))]
        .map((date) => [date, { date, matches: allMatches.filter((match) => match.date === date) }])),
    };
    document.dispatchEvent(new CustomEvent("atp:daily-matches-updated"));
  };

  const readCache = () => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (Array.isArray(cache?.matches)) installMatches(cache.matches);
    } catch (_) { /* La copia local es opcional. */ }
  };

  const refresh = async () => {
    const now = new Date();
    const range = `${compactDate(addDays(now, -7))}-${compactDate(addDays(now, 7))}`;
    try {
      const response = await fetch(`${ENDPOINT}?dates=${range}&limit=1000`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Marcador no disponible (${response.status})`);
      const matches = flattenEvents(await response.json());
      if (!matches.length) throw new Error("El marcador no devolvio partidos ATP");
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), matches }));
      installMatches(matches);
    } catch (error) {
      console.warn("No se pudieron actualizar los partidos ATP; se mantiene la copia local.", error);
    }
  };

  window.ATP_LOAD_LIVE_MATCHES = refresh;
  readCache();
  refresh();
  window.setInterval(refresh, REFRESH_INTERVAL);
})();
