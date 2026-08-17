const RANKINGS_URL = "https://site.web.api.espn.com/apis/site/v2/sports/tennis/atp/rankings";
const SCOREBOARD_URL = "https://site.web.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard";
const TIME_ZONE = "Europe/Madrid";

const dateKey = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const compactDate = (date) => dateKey(date).replaceAll("-", "");
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
const normalize = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status} al consultar ${url}`);
  return response.json();
};

const updateRankings = (payload) => {
  const rankings = (payload?.rankings?.[0]?.ranks || []).slice(0, 200).map((entry) => ({
    name: entry.athlete?.displayName,
    ranking: entry.current,
    points: entry.points,
    country: entry.athlete?.citizenshipCountry || entry.athlete?.flagAltText || null,
    age: entry.athlete?.age || null,
    photo: entry.athlete?.headshot || null,
  })).filter((player) => player.name);
  if (!rankings.length) return;

  window.ATP_LIVE_RANKINGS = rankings;
  window.ATP_COMPARE_RANKING_ADDITIONS = rankings.map((player) => player.name);
  window.ATP_PALMARES_EXTRA_PLAYERS = rankings.slice(0, 150).map((player) => player.name);
  window.ATP_COMPARE_RANKING_OVERRIDES ||= {};
  window.ATP_PLAYER_PHOTOS ||= {};
  rankings.forEach((player) => {
    window.ATP_COMPARE_RANKING_OVERRIDES[player.name] = {
      ...(window.ATP_COMPARE_RANKING_OVERRIDES[player.name] || {}),
      ranking: player.ranking, points: player.points, country: player.country,
      age: player.age, photo: player.photo,
    };
    if (player.photo) window.ATP_PLAYER_PHOTOS[player.name] ||= player.photo;
  });
  const today = dateKey(new Date());
  window.ATP_COMPARE_METADATA = { ...(window.ATP_COMPARE_METADATA || {}), rankingDate: today, source: RANKINGS_URL };
  window.ATP_PALMARES_METADATA = { ...(window.ATP_PALMARES_METADATA || {}), rankingDate: today };
};

const scoreFrom = (players) => {
  const setCount = Math.max(...players.map((player) => player.linescores?.length || 0), 0);
  return Array.from({ length: setCount }, (_, index) => players.map((player) => {
    const set = player.linescores?.[index];
    if (set?.value === undefined) return null;
    return `${set.value}${set.tiebreak !== undefined ? `(${set.tiebreak})` : ""}`;
  }).filter((value) => value !== null).join("-")).filter(Boolean).join(" ");
};

const roundCode = (round = "") => {
  const value = round.toLowerCase();
  if (value.includes("final") && !value.includes("semi")) return "F";
  if (value.includes("semi")) return "SF";
  if (value.includes("quarter")) return "QF";
  const number = Number(value.match(/round\s*(\d+)/)?.[1]);
  return ({ 1: "R128", 2: "R64", 3: "R32", 4: "R16" })[number] || round || "Ronda ATP";
};

const titleCategory = (tournament = "") => {
  const name = normalize(tournament);
  const atlasTournament = (window.ATP_TOURNAMENTS || []).find((item) => {
    const atlasName = normalize(item.name);
    return atlasName === name || atlasName.includes(name) || name.includes(atlasName);
  });
  if (atlasTournament?.category) return atlasTournament.category;
  if (["australianopen", "rolandgarros", "frenchopen", "wimbledon", "usopen"].some((item) => name.includes(item))) return "Grand Slam";
  if (name.includes("finals")) return "ATP Finals";
  if (["indianwells", "miamiopen", "montecarlo", "madridopen", "italianopen", "roma", "canadianopen", "nationalbankopen", "cincinnati", "shanghai", "parismasters"].some((item) => name.includes(item))) return "Masters 1000";
  return "ATP 250";
};

const updateMatches = (payload) => {
  const completed = (payload?.events || []).flatMap((event) => (event.groupings || [])
    .filter((group) => group.grouping?.slug === "mens-singles")
    .flatMap((group) => (group.competitions || []).map((competition) => ({ event, competition }))))
    .filter(({ competition }) => competition.status?.type?.completed && competition.competitors?.length === 2)
    .map(({ event, competition }) => {
      const winner = competition.competitors.find((player) => player.winner);
      const loser = competition.competitors.find((player) => !player.winner);
      return {
        tournament: event.name || "ATP Tour",
        date: dateKey(new Date(competition.date)),
        round: roundCode(competition.round?.displayName),
        winner: winner?.athlete?.displayName,
        loser: loser?.athlete?.displayName,
        score: scoreFrom([winner, loser].filter(Boolean)),
      };
    }).filter((match) => match.winner && match.loser);
  if (!completed.length) return;

  const current = window.ATP_HISTORY_RECENT_MATCHES || [];
  const merged = new Map(current.map((match) => [`${match.date}|${normalize(match.tournament)}|${normalize(match.winner)}|${normalize(match.loser)}`, match]));
  completed.forEach((match) => merged.set(`${match.date}|${normalize(match.tournament)}|${normalize(match.winner)}|${normalize(match.loser)}`, match));
  window.ATP_HISTORY_RECENT_MATCHES = [...merged.values()].sort((a, b) => b.date.localeCompare(a.date));

  const titleUpdates = window.ATP_PALMARES_OFFICIAL_UPDATES || [];
  const titleMap = new Map(titleUpdates.map((title) => [`${title.date}|${normalize(title.tournament)}|${normalize(title.winner)}`, title]));
  completed.filter((match) => match.round === "F").forEach((match) => {
    const title = { tournament: match.tournament, date: match.date, category: titleCategory(match.tournament), winner: match.winner };
    titleMap.set(`${title.date}|${normalize(title.tournament)}|${normalize(title.winner)}`, title);
  });
  window.ATP_PALMARES_OFFICIAL_UPDATES = [...titleMap.values()].sort((a, b) => a.date.localeCompare(b.date));
  const latest = completed.reduce((date, match) => match.date > date ? match.date : date, "");
  window.ATP_PALMARES_METADATA = { ...(window.ATP_PALMARES_METADATA || {}), verifiedThrough: latest, source: SCOREBOARD_URL };
};

const now = new Date();
const range = `${compactDate(addDays(now, -45))}-${compactDate(addDays(now, 14))}`;
const [rankingsResult, matchesResult] = await Promise.allSettled([
  fetchJson(RANKINGS_URL),
  fetchJson(`${SCOREBOARD_URL}?dates=${range}&limit=1000`),
]);
if (rankingsResult.status === "fulfilled") updateRankings(rankingsResult.value);
else console.warn("No se pudo actualizar el ranking ATP; se conservan los datos locales.", rankingsResult.reason);
if (matchesResult.status === "fulfilled") updateMatches(matchesResult.value);
else console.warn("No se pudo actualizar el historial ATP; se conservan los datos locales.", matchesResult.reason);
window.ATP_AUTO_UPDATED_AT = new Date().toISOString();

const nextMidnight = new Date();
nextMidnight.setHours(24, 0, 5, 0);
window.setTimeout(() => window.location.reload(), nextMidnight.getTime() - Date.now());
