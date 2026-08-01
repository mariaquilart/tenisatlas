document.addEventListener("DOMContentLoaded", () => {
  const option = document.getElementById("atp-tournaments-calendar-option");
  const calendar = document.getElementById("atp-tournaments-calendar");
  const title = document.getElementById("tournaments-calendar-title");
  const grid = document.getElementById("tournaments-calendar-grid");
  const previousButton = document.getElementById("tournaments-calendar-prev");
  const nextButton = document.getElementById("tournaments-calendar-next");
  const hero = document.getElementById("atp-hero");
  const mapView = document.getElementById("atp-map-view");
  const birthdaysView = document.getElementById("atp-birthdays-agenda");
  const mapButton = document.getElementById("atp-map-btn");
  const calendarButton = document.getElementById("atp-calendar-btn");
  const tournamentModal = document.getElementById("calendar-tournament-modal");
  const tournamentName = document.getElementById("calendar-tournament-name");
  const tournamentDetails = document.getElementById("calendar-tournament-details");
  const tournamentClose = document.getElementById("calendar-tournament-close");
  const currentTournamentsList = document.getElementById("calendar-tournaments-current");
  const pastTournamentsList = document.getElementById("calendar-tournaments-past");
  const upcomingTournamentsList = document.getElementById("calendar-tournaments-upcoming");
  const sidebarSectionToggles = calendar.querySelectorAll(".tournaments-sidebar__section-toggle");
  const matchesModal = document.getElementById("calendar-matches-modal");
  const matchesClose = document.getElementById("calendar-matches-close");
  const matchesStatus = document.getElementById("calendar-matches-status");
  const matchesList = document.getElementById("calendar-matches-list");
  const winnerModal = document.getElementById("calendar-winner-modal");
  const winnerClose = document.getElementById("calendar-winner-close");
  const winnerTournament = document.getElementById("calendar-winner-tournament");
  const winnerContent = document.getElementById("calendar-winner-content");

  if (!option || !calendar || !title || !grid || !previousButton || !nextButton
    || !tournamentModal || !tournamentName || !tournamentDetails || !tournamentClose
    || !currentTournamentsList || !pastTournamentsList || !upcomingTournamentsList
    || !sidebarSectionToggles.length || !matchesModal || !matchesClose
    || !matchesStatus || !matchesList || !winnerModal || !winnerClose
    || !winnerTournament || !winnerContent) return;

  const firstMonth = 6;
  const firstYear = 2026;
  const lastMonth = 6;
  const lastYear = 2027;
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const tournaments = [
    {
      name: "EFG Swiss Open Gstaad",
      start: "2026-07-13",
      winner: {
        name: "Stefanos Tsitsipas",
        country: "Grecia",
        countryCode: "GR",
        photo: "images/players/stefanos-tsitsipas.jpg?v=2",
        defeated: "Raphael Collignon",
      },
      details: [
        ["Inicio", "13 de julio de 2026"],
        ["Fin", "19 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Gstaad (Suiza)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Nordea Open Bastad",
      start: "2026-07-13",
      winner: {
        name: "Andrey Rublev",
        country: "Rusia",
        countryCode: "RU",
        photo: "images/players/andrey-rublev.jpg?v=2",
        defeated: "Luciano Darderi",
      },
      details: [
        ["Inicio", "13 de julio de 2026"],
        ["Fin", "19 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Bastad (Suecia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Plava Laguna Croatia Open Umag",
      start: "2026-07-13",
      winner: {
        name: "Daniel Mérida",
        country: "España",
        countryCode: "ES",
        photo: "images/players/daniel-merida.jpg?v=2",
        defeated: "Damir Džumhur",
      },
      details: [
        ["Inicio", "13 de julio de 2026"],
        ["Fin", "19 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Umag (Croacia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Generali Open Kitzbühel",
      start: "2026-07-20",
      winner: {
        name: "Quentin Halys",
        country: "Francia",
        countryCode: "FR",
        photo: "images/players/quentin-halys.jpg?v=2",
        defeated: "Alexander Bublik",
      },
      details: [
        ["Inicio", "20 de julio de 2026"],
        ["Fin", "25 de julio de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Kitzbühel (Austria)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Mubadala DC Open (Washington)",
      start: "2026-07-27",
      details: [
        ["Inicio", "27 de julio de 2026"],
        ["Fin", "2 de agosto de 2026"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Washington D. C. (Estados Unidos)"],
        ["Superficie", "Pista dura"],
      ],
    },
    {
      name: "Mifel Tennis Open by Telcel Oppo Los Cabos",
      start: "2026-07-27",
      details: [
        ["Inicio", "27 de julio de 2026"],
        ["Fin", "2 de agosto de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Los Cabos (México)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "National Bank Open Presented by Rogers",
      start: "2026-08-03",
      details: [
        ["Inicio", "3 de agosto de 2026"],
        ["Fin", "12 de agosto de 2026"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Montreal (Canadá)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Cincinnati Open",
      start: "2026-08-13",
      details: [
        ["Inicio", "13 de agosto de 2026"],
        ["Fin", "23 de agosto de 2026"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Cincinnati (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Winston-Salem Open",
      start: "2026-08-23",
      details: [
        ["Inicio", "23 de agosto de 2026"],
        ["Fin", "29 de agosto de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Winston-Salem (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "US Open",
      start: "2026-08-31",
      details: [
        ["Inicio", "31 de agosto de 2026"],
        ["Fin", "13 de septiembre de 2026"],
        ["Categoría", "Grand Slam"],
        ["Ubicación", "Nueva York (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Davis Cup Finals Group Stage",
      start: "2026-09-14",
      details: [
        ["Inicio", "14 de septiembre de 2026"],
        ["Fin", "20 de septiembre de 2026"],
        ["Categoría", "Equipos"],
        ["Ubicación", "Varias sedes"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Chengdu Open",
      start: "2026-09-21",
      details: [
        ["Inicio", "21 de septiembre de 2026"],
        ["Fin", "27 de septiembre de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Chengdu (China)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Hangzhou Open",
      start: "2026-09-21",
      details: [
        ["Inicio", "21 de septiembre de 2026"],
        ["Fin", "27 de septiembre de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Hangzhou (China)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Kinoshita Group Japan Open Tennis Championships",
      start: "2026-09-30",
      details: [
        ["Inicio", "30 de septiembre de 2026"],
        ["Fin", "6 de octubre de 2026"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Tokio (Japón)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "China Open",
      start: "2026-09-30",
      details: [
        ["Inicio", "30 de septiembre de 2026"],
        ["Fin", "6 de octubre de 2026"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Pekín (China)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Rolex Shanghai Masters",
      start: "2026-10-07",
      details: [
        ["Inicio", "7 de octubre de 2026"],
        ["Fin", "18 de octubre de 2026"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Shanghái (China)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Almaty Open",
      start: "2026-10-19",
      details: [
        ["Inicio", "19 de octubre de 2026"],
        ["Fin", "25 de octubre de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Almaty (Kazajistán)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "European Open",
      start: "2026-10-19",
      details: [
        ["Inicio", "19 de octubre de 2026"],
        ["Fin", "25 de octubre de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Amberes (Bélgica)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Open 13 Provence",
      start: "2026-10-19",
      details: [
        ["Inicio", "19 de octubre de 2026"],
        ["Fin", "25 de octubre de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Marsella (Francia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Erste Bank Open",
      start: "2026-10-26",
      details: [
        ["Inicio", "26 de octubre de 2026"],
        ["Fin", "1 de noviembre de 2026"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Viena (Austria)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Swiss Indoors Basel",
      start: "2026-10-26",
      details: [
        ["Inicio", "26 de octubre de 2026"],
        ["Fin", "1 de noviembre de 2026"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Basilea (Suiza)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Rolex Paris Masters",
      start: "2026-11-02",
      details: [
        ["Inicio", "2 de noviembre de 2026"],
        ["Fin", "8 de noviembre de 2026"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "París (Francia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "BNP Paribas Nordic Open",
      start: "2026-11-09",
      details: [
        ["Inicio", "9 de noviembre de 2026"],
        ["Fin", "15 de noviembre de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Estocolmo (Suecia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Belgrade Open",
      start: "2026-11-09",
      details: [
        ["Inicio", "9 de noviembre de 2026"],
        ["Fin", "15 de noviembre de 2026"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Belgrado (Serbia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Nitto ATP Finals",
      start: "2026-11-15",
      details: [
        ["Inicio", "15 de noviembre de 2026"],
        ["Fin", "22 de noviembre de 2026"],
        ["Categoría", "ATP Finals"],
        ["Ubicación", "Turín (Italia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Next Gen ATP Finals presented by PIF",
      start: "2026-12-10",
      details: [
        ["Inicio", "10 de diciembre de 2026 (TBC)"],
        ["Fin", "14 de diciembre de 2026 (TBC)"],
        ["Categoría", "Next Gen ATP Finals"],
        ["Ubicación", "Yeda (Arabia Saudí)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "United Cup",
      start: "2027-01-01",
      details: [
        ["Inicio", "1 de enero de 2027"],
        ["Fin", "10 de enero de 2027"],
        ["Categoría", "Equipos"],
        ["Ubicación", "Perth / Sídney (Australia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Brisbane International presented by ANZ",
      start: "2027-01-04",
      details: [
        ["Inicio", "4 de enero de 2027"],
        ["Fin", "10 de enero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Brisbane (Australia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Bank of China Hong Kong Tennis Open",
      start: "2027-01-04",
      details: [
        ["Inicio", "4 de enero de 2027"],
        ["Fin", "10 de enero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Hong Kong (Hong Kong)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Adelaide International",
      start: "2027-01-04",
      details: [
        ["Inicio", "4 de enero de 2027"],
        ["Fin", "10 de enero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Adelaida (Australia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "ASB Classic",
      start: "2027-01-11",
      details: [
        ["Inicio", "11 de enero de 2027"],
        ["Fin", "16 de enero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Auckland (Nueva Zelanda)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Australian Open",
      start: "2027-01-11",
      details: [
        ["Inicio", "11 de enero de 2027"],
        ["Fin", "24 de enero de 2027"],
        ["Categoría", "Grand Slam"],
        ["Ubicación", "Melbourne (Australia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Open Occitanie",
      start: "2027-02-01",
      details: [
        ["Inicio", "1 de febrero de 2027"],
        ["Fin", "7 de febrero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Montpellier (Francia)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "ABN AMRO Open",
      start: "2027-02-08",
      details: [
        ["Inicio", "8 de febrero de 2027"],
        ["Fin", "14 de febrero de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Róterdam (Países Bajos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Nexo Dallas Open",
      start: "2027-02-08",
      details: [
        ["Inicio", "8 de febrero de 2027"],
        ["Fin", "14 de febrero de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Dallas (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "IEB+ Argentina Open",
      start: "2027-02-08",
      details: [
        ["Inicio", "8 de febrero de 2027"],
        ["Fin", "14 de febrero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Buenos Aires (Argentina)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Qatar ExxonMobil Open",
      start: "2027-02-08",
      details: [
        ["Inicio", "8 de febrero de 2027"],
        ["Fin", "14 de febrero de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Doha (Catar)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Rio Open presented by Claro",
      start: "2027-02-15",
      details: [
        ["Inicio", "15 de febrero de 2027"],
        ["Fin", "21 de febrero de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Río de Janeiro (Brasil)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Delray Beach Open",
      start: "2027-02-15",
      details: [
        ["Inicio", "15 de febrero de 2027"],
        ["Fin", "21 de febrero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Delray Beach (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Abierto Mexicano Telcel presentado por HSBC",
      start: "2027-02-22",
      details: [
        ["Inicio", "22 de febrero de 2027"],
        ["Fin", "28 de febrero de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Acapulco (México)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "BCI Seguros Chile Open",
      start: "2027-02-22",
      details: [
        ["Inicio", "22 de febrero de 2027"],
        ["Fin", "28 de febrero de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Santiago (Chile)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Dubai Duty Free Tennis Championships",
      start: "2027-03-01",
      details: [
        ["Inicio", "1 de marzo de 2027"],
        ["Fin", "7 de marzo de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Dubái (Emiratos Árabes Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "BNP Paribas Open",
      start: "2027-03-04",
      details: [
        ["Inicio", "4 de marzo de 2027"],
        ["Fin", "14 de marzo de 2027"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Indian Wells (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Miami Open presented by Itaú",
      start: "2027-03-18",
      details: [
        ["Inicio", "18 de marzo de 2027"],
        ["Fin", "31 de marzo de 2027"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Miami (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Rolex Monte-Carlo Masters",
      start: "2027-04-04",
      details: [
        ["Inicio", "4 de abril de 2027"],
        ["Fin", "11 de abril de 2027"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Montecarlo (Mónaco)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Barcelona Open Banc Sabadell",
      start: "2027-04-12",
      details: [
        ["Inicio", "12 de abril de 2027"],
        ["Fin", "18 de abril de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Barcelona (España)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "BMW Open by Bitpanda",
      start: "2027-04-12",
      details: [
        ["Inicio", "12 de abril de 2027"],
        ["Fin", "18 de abril de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Múnich (Alemania)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Mutua Madrid Open",
      start: "2027-04-21",
      details: [
        ["Inicio", "21 de abril de 2027"],
        ["Fin", "2 de mayo de 2027"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Madrid (España)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Internazionali BNL d'Italia",
      start: "2027-05-05",
      details: [
        ["Inicio", "5 de mayo de 2027"],
        ["Fin", "16 de mayo de 2027"],
        ["Categoría", "Masters 1000"],
        ["Ubicación", "Roma (Italia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Bitpanda Hamburg Open",
      start: "2027-05-17",
      details: [
        ["Inicio", "17 de mayo de 2027"],
        ["Fin", "23 de mayo de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Hamburgo (Alemania)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Gonet Geneva Open",
      start: "2027-05-17",
      details: [
        ["Inicio", "17 de mayo de 2027"],
        ["Fin", "23 de mayo de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Ginebra (Suiza)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Roland Garros",
      start: "2027-05-23",
      details: [
        ["Inicio", "23 de mayo de 2027"],
        ["Fin", "6 de junio de 2027"],
        ["Categoría", "Grand Slam"],
        ["Ubicación", "París (Francia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "BOSS Open",
      start: "2027-06-07",
      details: [
        ["Inicio", "7 de junio de 2027"],
        ["Fin", "13 de junio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Stuttgart (Alemania)"],
        ["Superficie", "Hierba"],
      ],
    },
    {
      name: "Libéma Open",
      start: "2027-06-07",
      details: [
        ["Inicio", "7 de junio de 2027"],
        ["Fin", "13 de junio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Países Bajos"],
        ["Superficie", "Hierba"],
      ],
    },
    {
      name: "HSBC Championships (Queen's Club)",
      start: "2027-06-14",
      details: [
        ["Inicio", "14 de junio de 2027"],
        ["Fin", "20 de junio de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Londres (Reino Unido)"],
        ["Superficie", "Hierba"],
      ],
    },
    {
      name: "Terra Wortmann Open",
      start: "2027-06-14",
      details: [
        ["Inicio", "14 de junio de 2027"],
        ["Fin", "20 de junio de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Halle (Alemania)"],
        ["Superficie", "Hierba"],
      ],
    },
    {
      name: "Mallorca Championships",
      start: "2027-06-21",
      details: [
        ["Inicio", "21 de junio de 2027"],
        ["Fin", "27 de junio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Mallorca (España)"],
        ["Superficie", "Hierba"],
      ],
    },
    {
      name: "Lexus Eastbourne Open",
      start: "2027-06-21",
      details: [
        ["Inicio", "21 de junio de 2027"],
        ["Fin", "27 de junio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Eastbourne (Reino Unido)"],
        ["Superficie", "Hierba"],
      ],
    },
    {
      name: "Wimbledon",
      start: "2027-06-28",
      details: [
        ["Inicio", "28 de junio de 2027"],
        ["Fin", "11 de julio de 2027"],
        ["Categoría", "Grand Slam"],
        ["Ubicación", "Londres (Reino Unido)"],
        ["Superficie", "Hierba"],
      ],
    },
    {
      name: "EFG Swiss Open Gstaad",
      start: "2027-07-12",
      details: [
        ["Inicio", "12 de julio de 2027"],
        ["Fin", "18 de julio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Gstaad (Suiza)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Nordea Open",
      start: "2027-07-12",
      details: [
        ["Inicio", "12 de julio de 2027"],
        ["Fin", "18 de julio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Bastad (Suecia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Plava Laguna Croatia Open Umag",
      start: "2027-07-12",
      details: [
        ["Inicio", "12 de julio de 2027"],
        ["Fin", "18 de julio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Umag (Croacia)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Generali Open Kitzbühel",
      start: "2027-07-19",
      details: [
        ["Inicio", "19 de julio de 2027"],
        ["Fin", "25 de julio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Kitzbühel (Austria)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Millennium Estoril Open",
      start: "2027-07-19",
      details: [
        ["Inicio", "19 de julio de 2027"],
        ["Fin", "25 de julio de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Estoril (Portugal)"],
        ["Superficie", "Tierra batida"],
      ],
    },
    {
      name: "Citi Open",
      start: "2027-07-26",
      details: [
        ["Inicio", "26 de julio de 2027"],
        ["Fin", "1 de agosto de 2027"],
        ["Categoría", "ATP 500"],
        ["Ubicación", "Washington D. C. (Estados Unidos)"],
        ["Superficie", "Dura"],
      ],
    },
    {
      name: "Mifel Tennis Open by Telcel Oppo Los Cabos",
      start: "2027-07-26",
      details: [
        ["Inicio", "26 de julio de 2027"],
        ["Fin", "1 de agosto de 2027"],
        ["Categoría", "ATP 250"],
        ["Ubicación", "Los Cabos (México)"],
        ["Superficie", "Dura"],
      ],
    },
  ];

  const monthIndex = (year, month) => year * 12 + month;
  const firstIndex = monthIndex(firstYear, firstMonth);
  const lastIndex = monthIndex(lastYear, lastMonth);
  const todayForInitialMonth = new Date();
  const initialIndex = Math.min(
    lastIndex,
    Math.max(firstIndex, monthIndex(todayForInitialMonth.getFullYear(), todayForInitialMonth.getMonth())),
  );
  let currentYear = Math.floor(initialIndex / 12);
  let currentMonth = initialIndex % 12;
  let tournamentTrigger = null;
  let matchesTrigger = null;
  let winnerTrigger = null;

  const closeTournamentCard = () => {
    tournamentModal.hidden = true;
    if (tournamentTrigger) tournamentTrigger.focus();
    tournamentTrigger = null;
  };

  const openTournamentCard = (tournament, trigger) => {
    tournamentTrigger = trigger;
    tournamentName.textContent = tournament.name;
    tournamentDetails.replaceChildren();

    tournament.details.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "calendar-tournament-card__row";
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      row.append(term, description);
      tournamentDetails.appendChild(row);
    });

    tournamentModal.hidden = false;
    tournamentClose.focus();
  };

  const detailValue = (tournament, label) => {
    const detail = tournament.details.find(([detailLabel]) => detailLabel === label);
    return detail ? detail[1] : "";
  };

  const parseSpanishDate = (value) => {
    const match = value.match(/(\d{1,2}) de ([a-záéíóú]+) de (\d{4})/i);
    if (!match) return null;
    const month = monthNames.indexOf(match[2].toLowerCase());
    if (month < 0) return null;
    return new Date(Number(match[3]), month, Number(match[1]), 12);
  };

  const flagEmoji = (countryCode) => {
    return /^[A-Z]{2}$/.test(countryCode || "") ? countryCode : "—";
  };

  const closeWinnerCard = () => {
    winnerModal.hidden = true;
    if (winnerTrigger) winnerTrigger.focus();
    winnerTrigger = null;
  };

  const openWinnerCard = (tournament, trigger) => {
    const winner = tournament.winner;
    if (!winner) return;
    winnerTrigger = trigger;
    winnerTournament.textContent = tournament.name;
    winnerContent.replaceChildren();

    const portrait = document.createElement("span");
    portrait.className = "calendar-winner-card__portrait";
    const photo = document.createElement("img");
    photo.className = "calendar-winner-card__photo";
    photo.src = winner.photo;
    photo.alt = `Foto de ${winner.name}`;
    photo.width = 96;
    photo.height = 96;
    const flag = document.createElement("span");
    flag.className = "calendar-winner-card__flag";
    flag.textContent = flagEmoji(winner.countryCode);
    flag.setAttribute("aria-hidden", "true");
    portrait.append(photo, flag);

    const label = document.createElement("span");
    label.className = "calendar-winner-card__label";
    label.textContent = "GANADOR";
    const name = document.createElement("strong");
    name.className = "calendar-winner-card__name";
    name.textContent = winner.name;
    const country = document.createElement("span");
    country.className = "calendar-winner-card__country";
    country.textContent = winner.country;
    const result = document.createElement("p");
    result.className = "calendar-winner-card__result";
    result.append("Ganó la final frente a ");
    const opponent = document.createElement("strong");
    opponent.textContent = winner.defeated;
    result.appendChild(opponent);

    winnerContent.append(label, portrait, name, country, result);
    winnerModal.hidden = false;
    winnerClose.focus();
  };

  const createSidebarCard = (tournament, showWinner = false) => {
    const interactive = showWinner && tournament.winner;
    const card = document.createElement(interactive ? "button" : "article");
    card.className = "tournaments-sidebar__card";
    if (interactive) {
      card.type = "button";
      card.classList.add("tournaments-sidebar__card--interactive");
      card.setAttribute("aria-label", `Ver campeón de ${tournament.name}`);
      card.addEventListener("click", () => openWinnerCard(tournament, card));
    }

    const name = document.createElement("strong");
    name.className = "tournaments-sidebar__card-name";
    name.textContent = tournament.name;
    card.appendChild(name);

    return card;
  };

  const fillSidebarList = (list, items, showWinners = false) => {
    list.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "tournaments-sidebar__empty";
      empty.textContent = "No hay torneos";
      list.appendChild(empty);
      return;
    }
    items.forEach((tournament) => list.appendChild(createSidebarCard(tournament, showWinners)));
  };

  const renderSidebar = () => {
    const todayValue = new Date();
    const today = new Date(todayValue.getFullYear(), todayValue.getMonth(), todayValue.getDate(), 12);
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-`;
    const monthTournaments = tournaments.filter((tournament) => tournament.start.startsWith(monthPrefix));
    const current = [];
    const past = [];
    const upcoming = [];

    monthTournaments.forEach((tournament) => {
      const [year, month, day] = tournament.start.split("-").map(Number);
      const start = new Date(year, month - 1, day, 12);
      const end = parseSpanishDate(detailValue(tournament, "Fin"));
      if (end && start <= today && today <= end) current.push(tournament);
      else if (end && end < today) past.push(tournament);
      else if (start > today) upcoming.push(tournament);
    });

    fillSidebarList(currentTournamentsList, current);
    fillSidebarList(pastTournamentsList, past, true);
    fillSidebarList(upcomingTournamentsList, upcoming);
  };

  const closeMatchesCard = () => {
    matchesModal.hidden = true;
    if (matchesTrigger) matchesTrigger.focus();
    matchesTrigger = null;
  };

  const createMatchCard = (match) => {
    const card = document.createElement("article");
    card.className = "calendar-match";

    const round = document.createElement("span");
    round.className = "calendar-match__round";
    round.textContent = match.round || match.tournament || "Partido";

    const tournament = document.createElement("span");
    tournament.className = "calendar-match__tournament";
    tournament.textContent = match.tournament || "Torneo ATP";

    const header = document.createElement("div");
    header.className = "calendar-match__header";
    const time = document.createElement("time");
    time.className = "calendar-match__time";
    time.textContent = match.time || "Por confirmar";
    header.append(tournament, time);

    const versus = document.createElement("div");
    versus.className = "calendar-match__versus";
    const versusLabel = document.createElement("span");
    versusLabel.textContent = "vs.";
    versus.appendChild(versusLabel);

    const flagEmoji = (countryCode) => {
      return /^[A-Z]{2}$/.test(countryCode || "") ? countryCode : "—";
    };

    const createPlayer = (player) => {
      const playerColumn = document.createElement("div");
      playerColumn.className = "calendar-match__player";
      const avatar = document.createElement("span");
      avatar.className = "calendar-match__player-mark";
      if (player?.photo) {
        const photo = document.createElement("img");
        photo.className = "calendar-match__player-photo";
        photo.src = player.photo;
        photo.alt = `Foto de ${player.name}`;
        photo.width = 52;
        photo.height = 52;
        photo.addEventListener("error", () => photo.remove(), { once: true });
        avatar.appendChild(photo);
      }
      const flag = document.createElement("span");
      flag.className = "calendar-match__player-flag";
      flag.textContent = flagEmoji(player?.country_code);
      flag.setAttribute("aria-hidden", "true");
      avatar.appendChild(flag);
      const playerName = document.createElement("strong");
      playerName.textContent = player?.name || "Por confirmar";
      const country = document.createElement("span");
      country.className = "calendar-match__country";
      country.textContent = player?.country || "País no disponible";
      playerColumn.append(avatar, playerName, country);
      return playerColumn;
    };

    const matchup = document.createElement("div");
    matchup.className = "calendar-match__matchup";
    matchup.append(createPlayer(match.player1), versus, createPlayer(match.player2));

    card.append(round, header, matchup);
    return card;
  };

  const openMatchesCard = (dateKey, trigger) => {
    matchesTrigger = trigger;
    matchesList.replaceChildren();
    matchesModal.hidden = false;
    matchesClose.focus();

    const data = window.ATP_DAILY_MATCHES;
    matchesStatus.hidden = false;
    if (!data || data.date !== dateKey) {
      matchesStatus.textContent = "Todavía no hay partidos verificados para hoy.";
      return;
    }
    if (!Array.isArray(data.matches) || !data.matches.length) {
      matchesStatus.textContent = "No hay partidos ATP programados para hoy.";
      return;
    }
    matchesStatus.hidden = true;
    data.matches.forEach((match) => matchesList.appendChild(createMatchCard(match)));
  };

  const render = () => {
    const monthName = monthNames[currentMonth];
    title.textContent = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de ${currentYear}`;
    grid.replaceChildren();

    const today = new Date();
    const todayAtNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
    const firstWeekday = (new Date(Date.UTC(currentYear, currentMonth, 1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    grid.style.setProperty("--calendar-weeks", String(cellCount / 7));

    for (let cell = 0; cell < cellCount; cell += 1) {
      const day = cell - firstWeekday + 1;
      const dayCell = document.createElement("div");
      dayCell.className = "tournaments-calendar__day";

      if (day < 1 || day > daysInMonth) {
        dayCell.classList.add("tournaments-calendar__day--empty");
        dayCell.setAttribute("aria-hidden", "true");
      } else {
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayNumber = document.createElement(isToday ? "button" : "span");
        dayNumber.className = "tournaments-calendar__day-number";
        dayNumber.textContent = String(day);
        if (isToday) {
          dayNumber.type = "button";
          dayNumber.classList.add("tournaments-calendar__day-number--interactive");
          dayNumber.setAttribute("aria-label", `Ver partidos de hoy, ${day} de ${monthNames[currentMonth]} de ${currentYear}`);
          dayNumber.addEventListener("click", () => openMatchesCard(dateKey, dayNumber));
        }
        dayCell.appendChild(dayNumber);
        const dayTournaments = tournaments.filter((tournament) => tournament.start === dateKey);
        if (dayTournaments.length > 1) {
          dayCell.classList.add("tournaments-calendar__day--multiple-events");
        }
        if (dayTournaments.length > 2) {
          dayCell.classList.add("tournaments-calendar__day--crowded");
        }
        dayTournaments.forEach((tournament) => {
          const tournamentButton = document.createElement("button");
          tournamentButton.type = "button";
          tournamentButton.className = "tournaments-calendar__event";
          tournamentButton.textContent = tournament.name;
          tournamentButton.title = tournament.name;
          tournamentButton.setAttribute("aria-label", `Ver información de ${tournament.name}`);
          const [startYear, startMonth, startDay] = tournament.start.split("-").map(Number);
          const tournamentStart = new Date(startYear, startMonth - 1, startDay, 12);
          const tournamentEnd = parseSpanishDate(detailValue(tournament, "Fin"));
          if (tournamentEnd && tournamentStart <= todayAtNoon && todayAtNoon <= tournamentEnd) {
            tournamentButton.classList.add("tournaments-calendar__event--live");
          } else if (tournamentEnd && tournamentEnd < todayAtNoon) {
            tournamentButton.classList.add("tournaments-calendar__event--past");
          }
          tournamentButton.addEventListener("click", () => openTournamentCard(tournament, tournamentButton));
          dayCell.appendChild(tournamentButton);
        });
        if (cell % 7 >= 5) dayCell.classList.add("tournaments-calendar__day--weekend");
        if (isToday) {
          dayCell.classList.add("tournaments-calendar__day--today");
          dayCell.setAttribute("aria-current", "date");
        }
        dayCell.setAttribute("aria-label", `${day} de ${monthNames[currentMonth]} de ${currentYear}`);
      }

      grid.appendChild(dayCell);
    }

    const currentIndex = monthIndex(currentYear, currentMonth);
    previousButton.disabled = currentIndex === firstIndex;
    nextButton.disabled = currentIndex === lastIndex;
    renderSidebar();
  };

  const changeMonth = (increment) => {
    const targetIndex = monthIndex(currentYear, currentMonth) + increment;
    if (targetIndex < firstIndex || targetIndex > lastIndex) return;
    currentYear = Math.floor(targetIndex / 12);
    currentMonth = targetIndex % 12;
    render();
  };

  option.addEventListener("click", () => {
    const today = new Date();
    const todayIndex = Math.min(
      lastIndex,
      Math.max(firstIndex, monthIndex(today.getFullYear(), today.getMonth())),
    );
    currentYear = Math.floor(todayIndex / 12);
    currentMonth = todayIndex % 12;
    if (hero) hero.hidden = true;
    if (mapView) mapView.hidden = true;
    if (birthdaysView) birthdaysView.hidden = true;
    if (mapButton) {
      mapButton.classList.remove("is-active");
      mapButton.setAttribute("aria-pressed", "false");
    }
    if (calendarButton) calendarButton.classList.add("is-active");
    calendar.hidden = false;
    render();
  });

  previousButton.addEventListener("click", () => changeMonth(-1));
  nextButton.addEventListener("click", () => changeMonth(1));
  tournamentClose.addEventListener("click", closeTournamentCard);
  matchesClose.addEventListener("click", closeMatchesCard);
  winnerClose.addEventListener("click", closeWinnerCard);
  sidebarSectionToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const list = document.getElementById(toggle.getAttribute("aria-controls"));
      if (!list) return;
      const collapsed = !list.hidden;
      list.hidden = collapsed;
      toggle.textContent = collapsed ? "+" : "−";
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.setAttribute("aria-label", `${collapsed ? "Desplegar" : "Plegar"} ${toggle.closest(".tournaments-sidebar__section").querySelector(".tournaments-sidebar__heading").textContent.toLowerCase()}`);
    });
  });
  tournamentModal.addEventListener("click", (event) => {
    if (event.target === tournamentModal) closeTournamentCard();
  });
  matchesModal.addEventListener("click", (event) => {
    if (event.target === matchesModal) closeMatchesCard();
  });
  winnerModal.addEventListener("click", (event) => {
    if (event.target === winnerModal) closeWinnerCard();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !tournamentModal.hidden) closeTournamentCard();
    if (event.key === "Escape" && !matchesModal.hidden) closeMatchesCard();
    if (event.key === "Escape" && !winnerModal.hidden) closeWinnerCard();
  });

  const scheduleTodayRefresh = () => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    window.setTimeout(() => {
      if (!calendar.hidden) render();
      scheduleTodayRefresh();
    }, nextMidnight.getTime() - now.getTime() + 100);
  };

  scheduleTodayRefresh();
});
