window.ATP_DAILY_MATCHES = {
  date: "2026-08-10",
  timezone: "Europe/Madrid",
  updatedAt: "2026-08-10T12:00:00+02:00",
  source: "https://www.tennis.com/tournaments/national-bank-open-presented-by-rogers-3?date=2026-08-10",
  matches: [
    {
      id: "montreal-2026-qf-jodar-fils",
      tournament: "National Bank Open Presented by Rogers",
      round: "Cuartos de final",
      time: "00:00",
      player1: {
        name: "Rafael Jódar",
        country: "España",
        country_code: "ES",
        photo: "images/players/rafael-jodar.jpg?v=1",
      },
      player2: {
        name: "Arthur Fils",
        country: "Francia",
        country_code: "FR",
        photo: "images/players/arthur-fils.jpg?v=1",
      },
    },
    {
      id: "montreal-2026-qf-darderi-nakashima",
      tournament: "National Bank Open Presented by Rogers",
      round: "Cuartos de final",
      time: "01:10",
      player1: {
        name: "Luciano Darderi",
        country: "Italia",
        country_code: "IT",
      },
      player2: {
        name: "Brandon Nakashima",
        country: "Estados Unidos",
        country_code: "US",
        photo: "images/players/brandon-nakashima.jpg?v=1",
      },
    },
  ],
  upcoming: [
    {
      id: "montreal-2026-qf-mensik-shelton",
      date: "2026-08-11",
      dateLabel: "Martes, 11 de agosto",
      tournament: "National Bank Open Presented by Rogers",
      round: "Cuartos de final",
      time: "22:00",
      player1: {
        name: "Jakub Menšík",
        country: "República Checa",
        country_code: "CZ",
        photo: "images/players/jakub-mensik.jpg?v=1",
      },
      player2: {
        name: "Ben Shelton",
        country: "Estados Unidos",
        country_code: "US",
        photo: "images/players/ben-shelton.jpg?v=1",
      },
    },
    {
      id: "montreal-2026-qf-merida-tien",
      date: "2026-08-11",
      dateLabel: "Martes, 11 de agosto",
      tournament: "National Bank Open Presented by Rogers",
      round: "Cuartos de final",
      time: "22:00",
      player1: {
        name: "Daniel Mérida",
        country: "España",
        country_code: "ES",
        photo: "images/players/daniel-merida.jpg?v=1",
      },
      player2: {
        name: "Learner Tien",
        country: "Estados Unidos",
        country_code: "US",
      },
    },
    {
      id: "montreal-2026-sf-1",
      date: "2026-08-13",
      dateLabel: "Jueves, 13 de agosto",
      tournament: "National Bank Open Presented by Rogers",
      round: "Semifinal",
      time: "00:00",
      player1: {
        name: "Por confirmar",
        country: "Ganador de cuartos",
        country_code: "",
      },
      player2: {
        name: "Por confirmar",
        country: "Ganador de cuartos",
        country_code: "",
      },
    },
    {
      id: "montreal-2026-sf-2",
      date: "2026-08-13",
      dateLabel: "Jueves, 13 de agosto",
      tournament: "National Bank Open Presented by Rogers",
      round: "Semifinal",
      time: "00:00",
      player1: {
        name: "Por confirmar",
        country: "Ganador de cuartos",
        country_code: "",
      },
      player2: {
        name: "Por confirmar",
        country: "Ganador de cuartos",
        country_code: "",
      },
    },
    {
      id: "montreal-2026-final",
      date: "2026-08-14",
      dateLabel: "Viernes, 14 de agosto",
      tournament: "National Bank Open Presented by Rogers",
      round: "Final",
      time: "02:00",
      player1: {
        name: "Por confirmar",
        country: "Ganador de semifinal",
        country_code: "",
      },
      player2: {
        name: "Por confirmar",
        country: "Ganador de semifinal",
        country_code: "",
      },
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
