document.addEventListener("DOMContentLoaded", () => {
  const option = document.getElementById("atp-birthdays-calendar-option");
  const agenda = document.getElementById("atp-birthdays-agenda");
  const monthsContainer = document.getElementById("birthdays-agenda-months");
  const todayNotice = document.getElementById("birthdays-agenda-today");
  const todayPlayers = document.getElementById("birthdays-agenda-today-players");
  const confetti = document.getElementById("birthdays-agenda-confetti");
  const hero = document.getElementById("atp-hero");
  const mapView = document.getElementById("atp-map-view");
  const tournamentsCalendar = document.getElementById("atp-tournaments-calendar");
  const mapButton = document.getElementById("atp-map-btn");
  const calendarButton = document.getElementById("atp-calendar-btn");

  if (!option || !agenda || !monthsContainer || !todayNotice || !todayPlayers || !confetti) return;

  const birthdays = [
    { name: "Jannik Sinner", day: 16, month: 8, year: 2001 },
    { name: "Alexander Zverev", day: 20, month: 4, year: 1997 },
    { name: "Carlos Alcaraz", day: 5, month: 5, year: 2003 },
    { name: "Felix Auger-Aliassime", day: 8, month: 8, year: 2000 },
    { name: "Novak Djokovic", day: 22, month: 5, year: 1987 },
    { name: "Alex de Miñaur", day: 17, month: 2, year: 1999 },
    { name: "Daniil Medvedev", day: 11, month: 2, year: 1996 },
    { name: "Ben Shelton", day: 9, month: 10, year: 2002 },
    { name: "Flavio Cobolli", day: 6, month: 5, year: 2002 },
    { name: "Taylor Fritz", day: 28, month: 10, year: 1997 },
    { name: "Alexander Bublik", day: 17, month: 6, year: 1997 },
    { name: "Jiří Lehečka", day: 8, month: 11, year: 2001 },
    { name: "Casper Ruud", day: 22, month: 12, year: 1998 },
    { name: "Andrey Rublev", day: 20, month: 10, year: 1997 },
    { name: "Lorenzo Musetti", day: 3, month: 3, year: 2002 },
    { name: "Learner Tien", day: 2, month: 12, year: 2005 },
    { name: "Jakub Menšík", day: 1, month: 9, year: 2005 },
    { name: "Valentin Vacherot", day: 16, month: 1, year: 1999 },
    { name: "Frances Tiafoe", day: 20, month: 1, year: 1998 },
    { name: "Francisco Cerúndolo", day: 13, month: 8, year: 1998 },
    { name: "Tommy Paul", day: 17, month: 1, year: 1997 },
    { name: "Luciano Darderi", day: 14, month: 2, year: 2002 },
    { name: "Arthur Fils", day: 12, month: 6, year: 2004 },
    { name: "Rafael Jódar", day: 17, month: 9, year: 2006 },
    { name: "Alejandro Davidovich Fokina", day: 5, month: 6, year: 1999 },
    { name: "Karen Khachanov", day: 21, month: 5, year: 1996 },
    { name: "João Fonseca", day: 21, month: 8, year: 2006 },
    { name: "Arthur Rinderknech", day: 23, month: 7, year: 1995 },
    { name: "Alejandro Tabilo", day: 2, month: 6, year: 1997 },
    { name: "Tomás Martín Etcheverry", day: 30, month: 7, year: 1999 },
    { name: "Alexander Blockx", day: 8, month: 4, year: 2005 },
    { name: "Brandon Nakashima", day: 3, month: 8, year: 2001 },
    { name: "Sebastián Korda", day: 5, month: 7, year: 2000 },
    { name: "Alex Michelsen", day: 25, month: 8, year: 2004 },
    { name: "Nuno Borges", day: 19, month: 2, year: 1997 },
    { name: "Matteo Arnaldi", day: 22, month: 2, year: 2001 },
    { name: "Matteo Gigante", day: 4, month: 1, year: 2002 },
    { name: "Hamad Medjedovic", day: 18, month: 7, year: 2003 },
    { name: "Quentin Halys", day: 26, month: 10, year: 1996 },
    { name: "Zizou Bergs", day: 3, month: 6, year: 1999 },
    { name: "Gabriel Diallo", day: 24, month: 9, year: 2001 },
    { name: "Mariano Navone", day: 27, month: 2, year: 2001 },
    { name: "Giovanni Mpetshi Perricard", day: 8, month: 8, year: 2003 },
    { name: "Jaume Munar", day: 5, month: 5, year: 1997 },
    { name: "Juan Manuel Cerúndolo", day: 15, month: 11, year: 2001 },
    { name: "Adrian Mannarino", day: 29, month: 6, year: 1988 },
    { name: "Marin Čilić", day: 28, month: 9, year: 1988 },
    { name: "Matteo Berrettini", day: 12, month: 4, year: 1996 },
    { name: "Miomir Kecmanović", day: 31, month: 8, year: 1999 },
    { name: "Ugo Humbert", day: 26, month: 6, year: 1998 },
    { name: "Ignacio Buse", day: 18, month: 4, year: 2004 },
    { name: "Arthur Fery", day: 12, month: 6, year: 2002 },
    { name: "Raphaël Collignon", day: 13, month: 1, year: 2002 },
    { name: "Cameron Norrie", day: 23, month: 8, year: 1995 },
    { name: "Ethan Quinn", day: 12, month: 3, year: 2004 },
    { name: "Luca Van Assche", day: 11, month: 5, year: 2004 },
    { name: "Stefanos Tsitsipas", day: 12, month: 8, year: 1998 },
    { name: "Tomáš Macháč", day: 13, month: 10, year: 2000 },
    { name: "Fábián Marozsán", day: 8, month: 10, year: 1999 },
    { name: "Pablo Carreño Busta", day: 12, month: 7, year: 1991 },
    { name: "Aleksandar Kovacevic", day: 29, month: 8, year: 1998 },
    { name: "Jacob Fearnley", day: 15, month: 7, year: 2001 },
    { name: "Camilo Ugo Carabelli", day: 17, month: 6, year: 1999 },
    { name: "Luca Nardi", day: 6, month: 8, year: 2003 },
    { name: "Tallon Griekspoor", day: 2, month: 7, year: 1996 },
    { name: "Denis Shapovalov", day: 15, month: 4, year: 1999 },
    { name: "Botic van de Zandschulp", day: 4, month: 10, year: 1995 },
    { name: "Vít Kopřiva", day: 15, month: 6, year: 1997 },
    { name: "Hubert Hurkacz", day: 11, month: 2, year: 1997 },
    { name: "Kamil Majchrzak", day: 13, month: 1, year: 1996 },
    { name: "Alex Molčan", day: 1, month: 12, year: 1997 },
    { name: "Zachary Svajda", day: 29, month: 11, year: 2002 },
    { name: "Hugo Gaston", day: 26, month: 9, year: 2000 },
    { name: "Valentin Royer", day: 29, month: 5, year: 2001 },
    { name: "Jaime Faria", day: 6, month: 8, year: 2003 },
    { name: "Jenson Brooksby", day: 26, month: 10, year: 2000 },
    { name: "Mattia Bellucci", day: 1, month: 6, year: 2001 },
    { name: "Roberto Bautista Agut", day: 14, month: 4, year: 1988 },
    { name: "Marcos Giron", day: 24, month: 7, year: 1993 },
    { name: "Mackenzie McDonald", day: 16, month: 4, year: 1995 },
    { name: "Thiago Seyboth Wild", day: 10, month: 3, year: 2000 },
    { name: "Daniel Altmaier", day: 12, month: 9, year: 1998 },
    { name: "Nicolás Jarry", day: 11, month: 10, year: 1995 },
    { name: "Reilly Opelka", day: 28, month: 8, year: 1997 },
    { name: "Laslo Djere", day: 2, month: 6, year: 1995 },
    { name: "Roberto Carballés Baena", day: 23, month: 3, year: 1993 },
    { name: "David Goffin", day: 7, month: 12, year: 1990 },
    { name: "Borna Ćorić", day: 14, month: 11, year: 1996 },
    { name: "Roman Safiullin", day: 7, month: 8, year: 1997 },
    { name: "Kei Nishikori", day: 29, month: 12, year: 1989 },
    { name: "Hugo Dellien", day: 16, month: 6, year: 1993 },
    { name: "Rinky Hijikata", day: 23, month: 2, year: 2001 },
    { name: "Jesper de Jong", day: 31, month: 5, year: 2000 },
    { name: "Nishesh Basavareddy", day: 2, month: 5, year: 2005 },
    { name: "Aleksandar Vukic", day: 6, month: 4, year: 1996 },
    { name: "Christopher O'Connell", day: 3, month: 6, year: 1994 },
    { name: "Yunchaokete Bu", day: 8, month: 1, year: 2002 },
    { name: "Jan-Lennard Struff", day: 25, month: 4, year: 1990 },
    { name: "Yannick Hanfmann", day: 13, month: 11, year: 1991 },
    { name: "Terence Atmane", day: 9, month: 1, year: 2002 },
    { name: "Corentin Moutet", day: 19, month: 4, year: 1999 },
    { name: "Roman Andrés Burruchaga", day: 23, month: 1, year: 2002 },
    { name: "Daniel Mérida", day: 9, month: 4, year: 2004 },
    { name: "Martín Landaluce", day: 8, month: 1, year: 2006 },
    { name: "Thiago Agustín Tirante", day: 10, month: 4, year: 2001 },
    { name: "Adolfo Daniel Vallejo", day: 28, month: 4, year: 2004 },
    { name: "Lorenzo Sonego", day: 11, month: 5, year: 1995 },
    { name: "Holger Rune", day: 29, month: 4, year: 2003 },
    { name: "James Duckworth", day: 21, month: 1, year: 1992 },
    { name: "Márton Fucsovics", day: 8, month: 2, year: 1992 },
    { name: "Jan Choinski", day: 11, month: 6, year: 1996 },
    { name: "Alexander Shevchenko", day: 29, month: 9, year: 2000 },
    { name: "Marco Trungelliti", day: 31, month: 1, year: 1990 },
    { name: "Sho Shimabukuro", day: 30, month: 1, year: 1997 },
    { name: "Adam Walton", day: 17, month: 4, year: 1999 },
    { name: "Emilio Nava", day: 2, month: 12, year: 2001 },
    { name: "Dino Prižmić", day: 5, month: 8, year: 2005 },
    { name: "Francisco Comesaña", day: 6, month: 10, year: 2000 },
  ];
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const playerCountries = {
    "Jannik Sinner": "IT",
    "Alexander Zverev": "DE",
    "Carlos Alcaraz": "ES",
    "Felix Auger-Aliassime": "CA",
    "Novak Djokovic": "RS",
    "Alex de Miñaur": "AU",
    "Daniil Medvedev": "RU",
    "Ben Shelton": "US",
    "Flavio Cobolli": "IT",
    "Taylor Fritz": "US",
    "Alexander Bublik": "KZ",
    "Jiří Lehečka": "CZ",
    "Casper Ruud": "NO",
    "Andrey Rublev": "RU",
    "Lorenzo Musetti": "IT",
    "Learner Tien": "US",
    "Jakub Menšík": "CZ",
    "Valentin Vacherot": "MC",
    "Frances Tiafoe": "US",
    "Francisco Cerúndolo": "AR",
    "Tommy Paul": "US",
    "Luciano Darderi": "IT",
    "Arthur Fils": "FR",
    "Rafael Jódar": "ES",
    "Alejandro Davidovich Fokina": "ES",
    "Karen Khachanov": "RU",
    "João Fonseca": "BR",
    "Arthur Rinderknech": "FR",
    "Alejandro Tabilo": "CL",
    "Tomás Martín Etcheverry": "AR",
    "Alexander Blockx": "BE",
    "Brandon Nakashima": "US",
    "Sebastián Korda": "US",
    "Alex Michelsen": "US",
    "Nuno Borges": "PT",
    "Matteo Arnaldi": "IT",
    "Matteo Gigante": "IT",
    "Hamad Medjedovic": "RS",
    "Quentin Halys": "FR",
    "Zizou Bergs": "BE",
    "Gabriel Diallo": "CA",
    "Mariano Navone": "AR",
    "Giovanni Mpetshi Perricard": "FR",
    "Jaume Munar": "ES",
    "Juan Manuel Cerúndolo": "AR",
    "Adrian Mannarino": "FR",
    "Marin Čilić": "HR",
    "Matteo Berrettini": "IT",
    "Miomir Kecmanović": "RS",
    "Ugo Humbert": "FR",
    "Ignacio Buse": "PE",
    "Arthur Fery": "GB",
    "Raphaël Collignon": "BE",
    "Cameron Norrie": "GB",
    "Ethan Quinn": "US",
    "Luca Van Assche": "FR",
    "Stefanos Tsitsipas": "GR",
    "Tomáš Macháč": "CZ",
    "Fábián Marozsán": "HU",
    "Pablo Carreño Busta": "ES",
    "Aleksandar Kovacevic": "US",
    "Jacob Fearnley": "GB",
    "Camilo Ugo Carabelli": "AR",
    "Luca Nardi": "IT",
    "Tallon Griekspoor": "NL",
    "Denis Shapovalov": "CA",
    "Botic van de Zandschulp": "NL",
    "Vít Kopřiva": "CZ",
    "Hubert Hurkacz": "PL",
    "Kamil Majchrzak": "PL",
    "Alex Molčan": "SK",
    "Zachary Svajda": "US",
    "Hugo Gaston": "FR",
    "Valentin Royer": "FR",
    "Jaime Faria": "PT",
    "Jenson Brooksby": "US",
    "Mattia Bellucci": "IT",
    "Roberto Bautista Agut": "ES",
    "Marcos Giron": "US",
    "Mackenzie McDonald": "US",
    "Thiago Seyboth Wild": "BR",
    "Daniel Altmaier": "DE",
    "Nicolás Jarry": "CL",
    "Reilly Opelka": "US",
    "Laslo Djere": "RS",
    "Roberto Carballés Baena": "ES",
    "David Goffin": "BE",
    "Borna Ćorić": "HR",
    "Roman Safiullin": "RU",
    "Kei Nishikori": "JP",
    "Hugo Dellien": "BO",
    "Rinky Hijikata": "AU",
    "Jesper de Jong": "NL",
    "Nishesh Basavareddy": "US",
    "Aleksandar Vukic": "AU",
    "Christopher O'Connell": "AU",
    "Yunchaokete Bu": "CN",
    "Jan-Lennard Struff": "DE",
    "Yannick Hanfmann": "DE",
    "Terence Atmane": "FR",
    "Corentin Moutet": "FR",
    "Roman Andrés Burruchaga": "AR",
    "Daniel Mérida": "ES",
    "Martín Landaluce": "ES",
    "Thiago Agustín Tirante": "AR",
    "Adolfo Daniel Vallejo": "PY",
    "Lorenzo Sonego": "IT",
    "Holger Rune": "DK",
    "James Duckworth": "AU",
    "Márton Fucsovics": "HU",
    "Jan Choinski": "GB",
    "Alexander Shevchenko": "KZ",
    "Marco Trungelliti": "AR",
    "Sho Shimabukuro": "JP",
    "Adam Walton": "AU",
    "Emilio Nava": "US",
    "Dino Prižmić": "HR",
    "Francisco Comesaña": "AR",
  };

  const createBirthdayEntry = (birthday) => {
    const item = document.createElement("article");
    item.className = "birthdays-agenda__birthday";
    const day = document.createElement("time");
    day.className = "birthdays-agenda__birthday-day";
    day.textContent = String(birthday.day).padStart(2, "0");
    const information = document.createElement("div");
    information.className = "birthdays-agenda__birthday-info";
    const nameRow = document.createElement("div");
    nameRow.className = "birthdays-agenda__birthday-name-row";
    const countryCode = playerCountries[birthday.name];
    const flag = document.createElement(countryCode === "RU" ? "span" : "img");
    flag.className = countryCode === "RU"
      ? "birthdays-agenda__birthday-flag birthdays-agenda__birthday-flag--neutral"
      : "birthdays-agenda__birthday-flag";
    if (countryCode === "RU") {
      flag.setAttribute("aria-label", "Sin bandera");
    } else {
      flag.src = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
      flag.alt = "";
      flag.width = 20;
      flag.height = 15;
      flag.loading = "lazy";
    }
    const name = document.createElement("strong");
    name.className = "birthdays-agenda__birthday-name";
    name.textContent = birthday.name;
    const year = document.createElement("span");
    year.className = "birthdays-agenda__birthday-year";
    year.textContent = String(birthday.year);
    nameRow.append(flag, name);
    information.append(nameRow, year);
    item.append(day, information);
    return item;
  };

  const renderMonths = () => {
    const currentMonth = new Date().getMonth();
    monthsContainer.replaceChildren();

    monthNames.forEach((monthName, monthIndex) => {
      const month = document.createElement("section");
      month.className = "birthdays-agenda__month";
      if (monthIndex === currentMonth) month.classList.add("birthdays-agenda__month--current");

      const heading = document.createElement("h2");
      heading.className = "birthdays-agenda__month-name";
      heading.textContent = monthName;
      const list = document.createElement("div");
      list.className = "birthdays-agenda__month-list";
      const monthBirthdays = birthdays
        .filter((birthday) => birthday.month === monthIndex + 1)
        .sort((a, b) => a.day - b.day || a.name.localeCompare(b.name, "es"));

      if (monthBirthdays.length) {
        monthBirthdays.forEach((birthday) => list.appendChild(createBirthdayEntry(birthday)));
      } else {
        const empty = document.createElement("p");
        empty.className = "birthdays-agenda__empty";
        empty.textContent = "Sin cumpleaños registrados";
        list.appendChild(empty);
      }

      month.append(heading, list);
      monthsContainer.appendChild(month);
    });
  };

  const renderConfetti = () => {
    confetti.replaceChildren();
    const colors = ["#d6bd87", "#39745b", "#c98372", "#718b80", "#ead8ae"];
    for (let index = 0; index < 30; index += 1) {
      const piece = document.createElement("i");
      piece.style.setProperty("--confetti-left", `${(index * 37) % 100}%`);
      piece.style.setProperty("--confetti-delay", `${(index % 10) * -0.18}s`);
      piece.style.setProperty("--confetti-duration", `${2.4 + (index % 6) * 0.18}s`);
      piece.style.setProperty("--confetti-color", colors[index % colors.length]);
      piece.style.setProperty("--confetti-turn", `${120 + (index % 5) * 70}deg`);
      confetti.appendChild(piece);
    }
  };

  const renderTodayNotice = () => {
    const today = new Date();
    const todaysBirthdays = birthdays.filter(
      (birthday) => birthday.month === today.getMonth() + 1 && birthday.day === today.getDate(),
    );

    todayPlayers.replaceChildren();
    todayNotice.hidden = !todaysBirthdays.length;
    if (!todaysBirthdays.length) {
      confetti.replaceChildren();
      return;
    }

    todaysBirthdays.forEach((birthday) => {
      const player = document.createElement("article");
      player.className = "birthdays-agenda__today-player";
      const portrait = document.createElement("span");
      portrait.className = "birthdays-agenda__today-portrait";
      if (birthday.photo) {
        const photo = document.createElement("img");
        photo.className = "birthdays-agenda__today-photo";
        photo.src = birthday.photo;
        photo.alt = `Foto de ${birthday.name}`;
        photo.width = 82;
        photo.height = 82;
        portrait.appendChild(photo);
      } else {
        portrait.textContent = birthday.name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("");
      }
      const information = document.createElement("span");
      information.className = "birthdays-agenda__today-info";
      const name = document.createElement("strong");
      name.className = "birthdays-agenda__today-name";
      name.textContent = birthday.name;
      const age = document.createElement("span");
      age.className = "birthdays-agenda__today-age";
      const years = today.getFullYear() - birthday.year;
      age.textContent = `Cumple ${years} años`;
      information.append(name, age);
      player.append(portrait, information);
      todayPlayers.appendChild(player);
    });
    renderConfetti();
  };

  option.addEventListener("click", () => {
    if (hero) hero.hidden = true;
    if (mapView) mapView.hidden = true;
    if (tournamentsCalendar) tournamentsCalendar.hidden = true;
    if (mapButton) {
      mapButton.classList.remove("is-active");
      mapButton.setAttribute("aria-pressed", "false");
    }
    if (calendarButton) calendarButton.classList.add("is-active");
    renderMonths();
    renderTodayNotice();
    agenda.hidden = false;
  });
});
