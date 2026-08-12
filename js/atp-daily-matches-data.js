window.ATP_DAILY_MATCHES = {
  date: "2026-08-11",
  timezone: "Europe/Madrid",
  updatedAt: "2026-08-12T11:30:00+02:00",
  source: "https://www.tennis.com/tournaments/national-bank-open-presented-by-rogers-3?date=2026-08-12",
  matches: [
    {
      id: "montreal-2026-qf-jodar-fils", tournament: "National Bank Open Presented by Rogers", round: "Cuartos de final", time: "18:00",
      player1: { name: "Rafael Jódar", country: "España", country_code: "ES", photo: "images/players/rafael-jodar.jpg?v=1" },
      player2: { name: "Arthur Fils", country: "Francia", country_code: "FR", photo: "images/players/arthur-fils.jpg?v=1", lost: true },
    },
    {
      id: "montreal-2026-qf-darderi-nakashima", tournament: "National Bank Open Presented by Rogers", round: "Cuartos de final", time: "A continuación",
      player1: { name: "Luciano Darderi", country: "Italia", country_code: "IT", lost: true },
      player2: { name: "Brandon Nakashima", country: "Estados Unidos", country_code: "US", photo: "images/players/brandon-nakashima.jpg?v=1" },
    },
    {
      id: "montreal-2026-qf-mensik-shelton", tournament: "National Bank Open Presented by Rogers", round: "Cuartos de final", time: "00:00",
      player1: { name: "Jakub Menšík", country: "República Checa", country_code: "CZ", photo: "images/players/jakub-mensik.jpg?v=1", lost: true },
      player2: { name: "Ben Shelton", country: "Estados Unidos", country_code: "US", photo: "images/players/ben-shelton.jpg?v=1" },
    },
    {
      id: "montreal-2026-qf-merida-tien", tournament: "National Bank Open Presented by Rogers", round: "Cuartos de final", time: "02:00",
      player1: { name: "Daniel Mérida", country: "España", country_code: "ES", photo: "images/players/daniel-merida.jpg?v=1", lost: true },
      player2: { name: "Learner Tien", country: "Estados Unidos", country_code: "US" },
    },
  ],
  upcoming: [
    {
      id: "montreal-2026-sf-jodar-nakashima", date: "2026-08-12", dateLabel: "Miércoles, 12 de agosto",
      tournament: "National Bank Open Presented by Rogers", round: "Semifinal", time: "00:00 (no antes)",
      player1: { name: "Rafael Jódar", country: "España", country_code: "ES", photo: "images/players/rafael-jodar.jpg?v=1" },
      player2: { name: "Brandon Nakashima", country: "Estados Unidos", country_code: "US", photo: "images/players/brandon-nakashima.jpg?v=1" },
    },
    {
      id: "montreal-2026-sf-tien-shelton", date: "2026-08-12", dateLabel: "Miércoles, 12 de agosto",
      tournament: "National Bank Open Presented by Rogers", round: "Semifinal", time: "A continuación",
      player1: { name: "Learner Tien", country: "Estados Unidos", country_code: "US" },
      player2: { name: "Ben Shelton", country: "Estados Unidos", country_code: "US", photo: "images/players/ben-shelton.jpg?v=1" },
    },
    {
      id: "montreal-2026-final", date: "2026-08-13", dateLabel: "Jueves, 13 de agosto",
      tournament: "National Bank Open Presented by Rogers", round: "Final", time: "Por confirmar",
      player1: { name: "Ganador Jódar / Nakashima", country: "", country_code: "" },
      player2: { name: "Ganador Tien / Shelton", country: "", country_code: "" },
    },
  ],
};

{
  const configuredMatches = window.ATP_DAILY_MATCHES;
  const knownMatches = [
    ...configuredMatches.matches.map((match) => ({ ...match, date: configuredMatches.date })),
    ...configuredMatches.upcoming,
  ];
  const matchesByDate = knownMatches.reduce((dates, match) => {
    (dates[match.date] ||= []).push(match);
    return dates;
  }, {});
  window.ATP_REFRESH_DAILY_MATCHES = () => {
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const todayMatches = (matchesByDate[currentDate] || []).map((match) => {
      const currentMatch = { ...match };
      delete currentMatch.dateLabel;
      return currentMatch;
    });
    const archive = Object.fromEntries(
      Object.entries(matchesByDate)
        .filter(([date]) => date < currentDate)
        .map(([date, matches]) => [date, { date, matches }]),
    );
    window.ATP_DAILY_MATCHES = {
      ...configuredMatches,
      date: currentDate,
      matches: todayMatches,
      upcoming: knownMatches
        .filter((match) => match.date > currentDate)
        .sort((first, second) => first.date.localeCompare(second.date) || first.time.localeCompare(second.time)),
      archive,
    };
  };
  window.ATP_REFRESH_DAILY_MATCHES();
}
