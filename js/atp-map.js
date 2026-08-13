// ATP — muestra un mapa mundial a pantalla casi completa al pulsar "Mapa" del menú
// Un único mapamundi: sin repetición horizontal y sin espacios en blanco al
// desplazar o hacer zoom (el desplazamiento y el zoom quedan acotados al planeta).
// Incluye marcadores de torneo con clustering y filtros combinables de
// categoría / superficie, más una tarjeta con los datos de cada torneo.

document.addEventListener("DOMContentLoaded", () => {
  const mapBtn = document.getElementById("atp-map-btn");
  const tournamentsMapOption = document.getElementById("atp-tournaments-map-option");
  const playersMapOption = document.getElementById("atp-players-map-option");
  const hero = document.getElementById("atp-hero");
  const mapView = document.getElementById("atp-map-view");
  const mapFilters = document.getElementById("atp-map-filters");
  if (!mapBtn || !tournamentsMapOption || !playersMapOption || !hero || !mapView || typeof L === "undefined") return;

  // Límites del mapa: se recorta la Antártida (sin interés para el contenido)
  // dejando el borde norte en el límite de la proyección Web Mercator.
  const worldBounds = L.latLngBounds([-60, -180], [85.05112878, 180]);

  const SURFACE_LABELS = { Hard: "Pista dura", Clay: "Tierra batida", Grass: "Hierba" };
  const CATEGORY_ORDER = ["Grand Slam", "ATP Masters 1000", "ATP 500", "ATP 250"];
  const SURFACE_ORDER = ["Hard", "Clay", "Grass"];

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const buildCardHTML = (t) => {
    const row = (label, value) =>
      `<div class="tournament-card__row"><span class="tournament-card__row-label">${escapeHtml(label)}</span><span class="tournament-card__row-value">${value}</span></div>`;

    const location = [t.venue && t.venue.street, t.venue && t.venue.city, t.venue && t.venue.country]
      .filter(Boolean)
      .map(escapeHtml)
      .join(", ");

    const photo = t.photo
      ? `<img class="tournament-card__photo" src="${escapeHtml(t.photo)}" alt="Estadio principal de ${escapeHtml(t.name)}" loading="lazy">`
      : "";

    return `
      ${photo}
      <div class="tournament-card__body">
        <div class="tournament-card__name">${escapeHtml(t.name)}</div>
        ${row("Ubicación", location || "No disponible")}
        ${row("Categoría", t.category ? escapeHtml(t.category) : "No disponible")}
        ${row("Superficie", t.surface ? escapeHtml(SURFACE_LABELS[t.surface] || t.surface) : "No disponible")}
        ${row("Primera edición", t.firstEdition ? String(t.firstEdition) : "No disponible")}
        ${row("Más títulos", t.mostTitlesPlayer ? escapeHtml(t.mostTitlesPlayer) : "No disponible")}
        ${Object.prototype.hasOwnProperty.call(t, "prizeMoney") ? row("Premio", t.prizeMoney ? escapeHtml(t.prizeMoney) : "—") : ""}
      </div>
    `;
  };

  // Centro real (en espacio de píxeles proyectados, no media de latitudes)
  // de los límites del mundo para el zoom dado — así queda bien encajado.
  const projectedCenter = (zoom) => {
    const nwPoint = map.project(worldBounds.getNorthWest(), zoom);
    const sePoint = map.project(worldBounds.getSouthEast(), zoom);
    return map.unproject(nwPoint.add(sePoint).divideBy(2), zoom);
  };

  // Zoom mínimo con el que el mundo cubre siempre todo el contenedor, para
  // que nunca aparezcan bordes (claros u oscuros) alrededor del mapa.
  const clampToCover = () => {
    const coverZoom = map.getBoundsZoom(worldBounds, true);
    map.setMinZoom(coverZoom);
    if (map.getZoom() < coverZoom) map.setZoom(coverZoom);
  };

  const setupTournaments = () => {
    const data = Array.isArray(window.ATP_TOURNAMENTS) ? window.ATP_TOURNAMENTS : [];
    if (!data.length || typeof L.markerClusterGroup !== "function") return;

    const categoryContainer = document.querySelector('#atp-map-filters [data-filter-group="category"]');
    const surfaceContainer = document.querySelector('#atp-map-filters [data-filter-group="surface"]');
    const todayButton = document.getElementById("atp-map-today-filter");
    const emptyMsg = document.getElementById("atp-map-empty");

    const categories = CATEGORY_ORDER.filter((c) => data.some((t) => t.category === c));
    const surfaces = SURFACE_ORDER.filter((s) => data.some((t) => t.surface === s));
    // Sin filtros activos al abrir el mapa: un conjunto vacío equivale a
    // mostrar todos los valores de ese grupo.
    const activeCategories = new Set();
    const activeSurfaces = new Set();
    let todayOnly = false;

    const monthNumbers = {
      enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
      julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
    };
    const toDateKey = (value) => {
      const match = String(value || "").toLowerCase().match(/(\d{1,2}) de ([a-záéíóúñ]+) de (\d{4})/i);
      if (!match || !monthNumbers[match[2]]) return null;
      return `${match[3]}-${String(monthNumbers[match[2]]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
    };
    const calendarIntervals = (window.ATP_CALENDAR_TOURNAMENTS || []).map((tournament) => ({
      name: tournament.name,
      start: tournament.start,
      end: toDateKey(tournament.details?.find(([label]) => label === "Fin")?.[1]),
    }));
    const calendarNameByMapId = {
      "canadian-open": "National Bank Open Presented by Rogers",
      "washington-open": "Mubadala DC Open (Washington)",
    };
    const isTournamentToday = (tournament) => {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const calendarName = calendarNameByMapId[tournament.id] || tournament.name;
      return calendarIntervals.some((interval) =>
        interval.name === calendarName && interval.start <= todayKey && todayKey <= interval.end);
    };

    tournamentLayer = L.markerClusterGroup({
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
      spiderLegPolylineOptions: { opacity: 0, weight: 0 },
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<div class="tournament-cluster">${cluster.getChildCount()}</div>`,
          className: "",
          iconSize: L.point(42, 42),
        }),
    });

    const markers = data
      .filter((t) => typeof t.lat === "number" && typeof t.lng === "number")
      .map((t) => {
        const marker = L.marker([t.lat, t.lng], {
          icon: L.divIcon({
            className: "tournament-marker",
            html: "",
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -22],
          }),
        });
        marker.bindPopup(buildCardHTML(t), { maxWidth: 300, minWidth: 260 });
        marker.tournament = t;
        return marker;
      });

    const refresh = () => {
      tournamentLayer.clearLayers();
      const visible = markers.filter(
        (m) =>
          (!activeCategories.size || activeCategories.has(m.tournament.category)) &&
          (!activeSurfaces.size || activeSurfaces.has(m.tournament.surface)) &&
          (!todayOnly || isTournamentToday(m.tournament))
      );
      if (visible.length) tournamentLayer.addLayers(visible);
      if (emptyMsg) emptyMsg.hidden = visible.length !== 0;
    };

    const addChip = (container, value, label, activeSet, exclusive = false) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "map-filters__chip";
      btn.textContent = label;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        const pressed = btn.getAttribute("aria-pressed") === "true";
        if (pressed) {
          activeSet.delete(value);
          btn.setAttribute("aria-pressed", "false");
        } else {
          if (exclusive) {
            activeSet.clear();
            container.querySelectorAll('.map-filters__chip[aria-pressed="true"]').forEach((chip) => {
              chip.setAttribute("aria-pressed", "false");
            });
          }
          activeSet.add(value);
          btn.setAttribute("aria-pressed", "true");
        }
        refresh();
      });
      container.appendChild(btn);
    };

    if (categoryContainer) categories.forEach((c) => addChip(categoryContainer, c, c, activeCategories, true));
    if (surfaceContainer) surfaces.forEach((s) => addChip(surfaceContainer, s, SURFACE_LABELS[s] || s, activeSurfaces));
    if (todayButton) {
      todayButton.addEventListener("click", () => {
        todayOnly = !todayOnly;
        todayButton.setAttribute("aria-pressed", String(todayOnly));
        refresh();
      });
    }

    map.addLayer(tournamentLayer);
    refresh();
  };

  const normalizePlayerName = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  const repairMojibake = (value) => {
    const text = String(value || "");
    if (!/[ÃÅÄ]/.test(text)) return text;
    try {
      return decodeURIComponent(escape(text));
    } catch (_) {
      return text;
    }
  };

  const escapeSqlText = (value) => String(value || "").replace(/''/g, "'");

  const PLAYER_MAP_SUPPLEMENTS = [
    { name: "Tommy Paul", country: "Estados Unidos", city: "Voorhees", birth: "19970517", right: true, height: 185, ranking: 21, points: 2075 },
    { name: "João Fonseca", country: "Brasil", city: "Río de Janeiro", birth: "20060821", right: true, height: 185, ranking: 27, points: 1700 },
    { name: "Arthur Fery", country: "Reino Unido", city: "Sèvres", birth: "20020712", right: true, height: 0, ranking: 36, points: 1285 },
    { name: "Raphaël Collignon", country: "Bélgica", city: "Rochester, Minnesota", birth: "20020113", right: true, height: 0, ranking: 38, points: 1234 },
    { name: "Nuno Borges", country: "Portugal", city: "Maia", birth: "19970219", right: true, height: 185, ranking: 55, points: 970 },
    { name: "James Duckworth", country: "Australia", city: "Sídney", birth: "19920121", right: true, height: 183, ranking: 86, points: 721 },
    { name: "Alexander Shevchenko", country: "Kazajistán", city: "Rostov del Don", birth: "20001129", right: true, height: 185, ranking: 89, points: 699 },
  ];

  const LOCAL_PLAYER_PHOTOS = {
    "Rafael Nadal": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Rafael_Nadal_en_2024_%28cropped%29.jpg/330px-Rafael_Nadal_en_2024_%28cropped%29.jpg",
    "Roger Federer": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Roger_Federer_2015_%28cropped%29.jpg/330px-Roger_Federer_2015_%28cropped%29.jpg",
    "Àlex Corretja": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/%C3%80lex_Corretja_in_2009.jpg/330px-%C3%80lex_Corretja_in_2009.jpg",
    "Feliciano López": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Lopez_F._RG21_%2810%29_%2851376399843%29.jpg/330px-Lopez_F._RG21_%2810%29_%2851376399843%29.jpg",
    "John McEnroe": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/John_McEnroe_005.png/330px-John_McEnroe_005.png",
    "Jannik Sinner": "https://upload.wikimedia.org/wikipedia/commons/6/64/Jannik_Sinner_2025_US_Open.jpg",
    "Carlos Alcaraz": "https://upload.wikimedia.org/wikipedia/commons/d/d4/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Carlos_Alcaraz_-_240422_192324_%28cropped%29.jpg",
    "Félix Auger-Aliassime": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/F%C3%A9lix_Auger-Aliassime_%282023_DC_Open%29_01_%28cropped%29.jpg/640px-F%C3%A9lix_Auger-Aliassime_%282023_DC_Open%29_01_%28cropped%29.jpg",
    "Novak Djokovic": "https://upload.wikimedia.org/wikipedia/commons/d/d1/Novak_Djokovic_Paris_2024_Olympic_Games_%28cropped%29.jpg",
    "Sebastian Korda": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sebastian_Korda_%282023_DC_Open%29_02.jpg/640px-Sebastian_Korda_%282023_DC_Open%29_02.jpg",
    "Ethan Quinn": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ethan_Quinn_%282023_US_Open%29_02_%28cropped%29.jpg/640px-Ethan_Quinn_%282023_US_Open%29_02_%28cropped%29.jpg",
    "Tomáš Macháč": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Machac_WMQ23_%2853062093175%29.jpg",
    "Holger Rune": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Rune_RG22_%284%29_%2852144534990%29.jpg",
    "Tommy Paul": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/2017_Citi_Open_Tennis_Tommy_Paul_%28cropped%29.jpg/330px-2017_Citi_Open_Tennis_Tommy_Paul_%28cropped%29.jpg",
    "João Fonseca": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Jo%C3%A3o_Fonseca_%282024_Cary%29_09_%28cropped%29.jpg/330px-Jo%C3%A3o_Fonseca_%282024_Cary%29_09_%28cropped%29.jpg",
    "Arthur Fery": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Fery_WMQ22_%2813%29_%2852191184348%29.jpg/330px-Fery_WMQ22_%2813%29_%2852191184348%29.jpg",
    "Nuno Borges": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Borges_BOR22_%2852082935912%29.jpg/330px-Borges_BOR22_%2852082935912%29.jpg",
    "Alexander Shevchenko": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/EFG_Swiss_Open_Gstaad-ATP_250%2C_Tennis_Herren_250_%28cropped%29.jpg/330px-EFG_Swiss_Open_Gstaad-ATP_250%2C_Tennis_Herren_250_%28cropped%29.jpg",
    "Alejandro Tabilo": "images/players/alejandro-tabilo.jpg",
    "Alex de Miñaur": "images/players/alex-de-minaur.jpg",
    "Alexander Blockx": "images/players/alexander-blockx.jpg",
    "Andrey Rublev": "images/players/andrey-rublev.jpg",
    "Arthur Fils": "images/players/arthur-fils.jpg",
    "Ben Shelton": "images/players/ben-shelton.jpg",
    "Brandon Nakashima": "images/players/brandon-nakashima.jpg",
    "Cameron Norrie": "images/players/cameron-norrie.jpg",
    "Daniel Mérida": "images/players/daniel-merida.jpg",
    "Denis Shapovalov": "images/players/denis-shapovalov.jpg",
    "Jakub Menšík": "images/players/jakub-mensik.jpg",
    "Jiří Lehečka": "images/players/jiri-lehecka.jpg",
    "Lorenzo Musetti": "images/players/lorenzo-musetti.jpg",
    "Luca Van Assche": "images/players/luca-van-assche.jpg",
    "Quentin Halys": "images/players/quentin-halys.jpg",
    "Rafael Jódar": "images/players/rafael-jodar.jpg",
    "Stefanos Tsitsipas": "images/players/stefanos-tsitsipas.jpg",
    "Taylor Fritz": "images/players/taylor-fritz.jpg",
    "Terence Atmane": "images/players/terence-atmane.jpg",
  };
  window.ATP_PLAYER_PHOTOS = Object.assign(window.ATP_PLAYER_PHOTOS || {}, LOCAL_PLAYER_PHOTOS);

  const BUILTIN_PLAYER_COORDINATES = {
    "San Candido, Italia": [12.2847097, 46.7097542], "El Palmar, España": [-1.1634534, 37.9391241],
    "Hamburgo, Alemania": [10.0013165, 53.5501721], "Montreal, Canadá": [-73.5698065, 45.5031824],
    "Belgrado, Serbia": [20.4456588, 44.8153318], "Moscú, Rusia": [37.6063916, 55.625578],
    "Sídney, Australia": [151.2082848, -33.8698439], "Rancho Santa Fe, Estados Unidos": [-117.1979781, 33.0242314],
    "Florencia, Italia": [11.2556404, 43.7697955], "Atlanta, Estados Unidos": [-84.3898151, 33.7544657],
    "Gátchina, Kazajistán": [30.1252083, 59.5680407], "Mladá Boleslav, República Checa": [14.9031301, 50.4116187],
    "Carrara, Italia": [10.0977529, 44.0796519], "Oslo, Noruega": [10.7389701, 59.9133301],
    "Leganés, España": [-3.76527, 40.3281942], "Prostějov, República Checa": [17.1117979, 49.4721467],
    "Rocabruna, Mónaco": [7.4432967, 43.7527839], "Irvine, Estados Unidos": [-117.825981, 33.6856969],
    "Hyattsville, Estados Unidos": [-76.9408647, 38.9529442], "Voorhees, Estados Unidos": [-74.9619779, 39.8512162],
    "Villa Gesell, Italia": [-56.9679411, -37.2556627], "Buenos Aires, Argentina": [-58.3887904, -34.6095579],
    "Bondoufle, Francia": [2.3805119, 48.6137157], "Málaga, España": [-4.4422005, 36.7647913],
    "Toronto, Chile": [-79.3839347, 43.6534817], "Río de Janeiro, Brasil": [-43.2093727, -22.9110137],
    "Metz, Francia": [6.1763552, 49.1196964], "Gassin, Francia": [6.585476, 43.2291533],
    "La Plata, Argentina": [-57.9537638, -34.9206797], "San Diego, Estados Unidos": [-117.162772, 32.7174202],
    "Amberes, Bélgica": [4.3997081, 51.2211097], "Lima, Perú": [-77.0305912, -12.0459808],
    "Lommel, Bélgica": [5.3076895, 51.2305657], "San Remo, Italia": [7.7772658, 43.8362985],
    "Sèvres, Reino Unido": [2.2127083, 48.8247407], "Johannesburgo, Reino Unido": [28.049722, -26.205],
    "Rochester, Minnesota, Bélgica": [-92.4630182, 44.0234387], "Roma, Italia": [12.4829321, 41.8933203],
    "Warstein, Alemania": [8.3536824, 51.4458105], "Laguna Hills, Estados Unidos": [-117.6882067, 33.5948758],
    "Tel Aviv, Canadá": [34.7818064, 32.0852997], "9 de Julio, Argentina": [-60.8845839, -35.4439161],
    "Santañí, España": [3.1291638, 39.3553499], "Saint-Martin-Boulogne, Francia": [1.633867, 50.7258932],
    "Soisy-sous-Montmorency, Francia": [2.3002885, 48.9875044], "Ciudad de General San Martín, Argentina": [-58.3778987, -34.5950235],
    "Woluwe-Saint-Lambert, Francia": [4.4256732, 50.8430448], "Bradenton, Estados Unidos": [-82.5748194, 27.4989278],
    "Fresno, Estados Unidos": [-119.78483, 36.7394421], "Atenas, Grecia": [23.7348324, 37.9755648],
    "Bondy, Francia": [2.48291, 48.9031], "Maia, Portugal": [-8.6299982, 41.2373456],
    "Karlsruhe, Alemania": [8.4034195, 49.0068705], "Beroun, República Checa": [14.0733907, 49.9640292],
    "Neuilly-sur-Seine, Francia": [2.2695658, 48.884683], "Kempen, Alemania": [6.4195011, 51.3642126],
    "Budapest, Hungría": [19.1457723, 47.4813896], "Madrid, España": [-3.703507, 40.416782],
    "Asunción, Paraguay": [-57.6343814, -25.2800459], "Piotrków Trybunalski, Polonia": [19.696167, 51.4082625],
    "Gijón, España": [-5.66275, 43.5449422], "Haarlem, Países Bajos": [4.6435679, 52.3837281],
    "Wageningen, Países Bajos": [5.6662814, 51.9663016], "Bílovec, República Checa": [18.01623, 49.7567664],
    "Breslavia, Polonia": [17.0326689, 51.1089776], "Novi Pazar, Serbia": [20.518057, 43.1406913],
    "Sacramento, Estados Unidos": [-121.493895, 38.5810606], "Prešov, Eslovaquia": [21.2392122, 49.0000074],
    "Coblenza, Reino Unido": [7.5943951, 50.3533278], "Lisboa, Portugal": [-9.1365919, 38.7077507],
    "Busto Arsizio, Italia": [8.8518269, 45.611932], "Thousand Oaks, Estados Unidos": [-118.8375937, 34.1705609],
    "Nyíregyháza, Hungría": [21.7167982, 47.9557802], "La Lucila, Argentina": [-58.4870085, -34.4981589],
    "Međugorje, Croacia": [17.6775328, 43.1905339], "Turín, Italia": [7.6824892, 45.0677551],
    "Ciudad de Santiago del Estero, Argentina": [-63.5408542, -27.6431016], "Lyon, Francia": [4.8320114, 45.7578137],
    "Gifu, Japón": [136.7627526, 35.4230949], "Toulouse, Francia": [1.4442433, 43.6044638],
    "Home Hill, Australia": [147.4135855, -19.659461], "Split, Croacia": [16.4399659, 43.5116383],
    "Gentofte, Dinamarca": [12.541436, 55.7535946], "Rostov del Don, Kazajistán": [39.701505, 47.2213858],
  };

  const buildPlayerCardHTML = (player) => {
    const photo = player.photo
      ? `<img class="player-map-card__photo" src="${escapeHtml(player.photo)}" alt="Foto de ${escapeHtml(player.fullName)}">`
      : `<span class="player-map-card__placeholder" aria-hidden="true">${escapeHtml(player.initials)}</span>`;
    const row = (label, value) =>
      `<div class="player-map-card__row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`;
    return `<article class="player-map-card">
      <div class="player-map-card__portrait">${photo}</div>
      <h3 class="player-map-card__name">${escapeHtml(player.fullName)}</h3>
      <div class="player-map-card__details">
        ${row("País", player.country)}
        ${row("Ciudad natal", player.city)}
        ${row("Nacimiento", player.birthLabel)}
        ${row("Mano", player.hand)}
        ${row("Altura", player.height ? `${player.height} cm` : "-")}
        ${row("Puntos", player.points ? player.points.toLocaleString("es-ES") : "-")}
      </div>
    </article>`;
  };

  const setupPlayers = async () => {
    if (playerLayer) return;
    playerLayer = L.markerClusterGroup({
      maxClusterRadius: 42,
      spiderfyOnMaxZoom: true,
      spiderLegPolylineOptions: { opacity: 0, weight: 0 },
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => L.divIcon({
        html: `<div class="tournament-cluster">${cluster.getChildCount()}</div>`,
        className: "",
        iconSize: L.point(42, 42),
      }),
    });
    map.addLayer(playerLayer);

    try {
      const photoByNormalizedName = new Map(
        Object.entries({ ...(window.ATP_PLAYER_PHOTOS || {}), ...LOCAL_PLAYER_PHOTOS }).flatMap(([name, photo]) => [
          [normalizePlayerName(name), photo],
          [normalizePlayerName(repairMojibake(name)), photo],
        ]),
      );
      const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
      ];
      const playerDisplayNames = {
        danielmeridaaguilar: "Daniel Mérida",
      };
      const sourcePlayers = [...(window.ATP_PLAYERS_MAP_DATA || []), ...PLAYER_MAP_SUPPLEMENTS];
      const players = sourcePlayers.map((sourcePlayer) => {
        const fullName = playerDisplayNames[normalizePlayerName(sourcePlayer.name)] || sourcePlayer.name;
        const normalizedName = normalizePlayerName(fullName);
        const birthDate = String(sourcePlayer.birth);
        const birthYear = Number(birthDate.slice(0, 4));
        const birthMonth = Number(birthDate.slice(4, 6));
        const birthDay = Number(birthDate.slice(6, 8));
        return {
          fullName,
          initials: fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join(""),
          country: sourcePlayer.country,
          city: sourcePlayer.city,
          birthLabel: `${birthDay} de ${monthNames[birthMonth - 1]} de ${birthYear}`,
          hand: sourcePlayer.right ? "Diestro" : "Zurdo",
          height: Number(sourcePlayer.height) || null,
          ranking: Number(sourcePlayer.ranking) || null,
          points: Number(sourcePlayer.points) || null,
          photo: window.ATP_PLAYER_PHOTOS?.[fullName]
            || photoByNormalizedName.get(normalizedName)
            || "",
        };
      });
      if (!players.length) throw new Error("No se cargaron los datos embebidos de jugadores");

      const geocodeCache = JSON.parse(localStorage.getItem("atp-player-city-coordinates-v2") || "{}");
      let nextPlayerIndex = 0;
      const addNextPlayer = async () => {
        const player = players[nextPlayerIndex];
        nextPlayerIndex += 1;
        if (!player) return;
        const cacheKey = `${player.city}, ${player.country}`;
        let coordinates = BUILTIN_PLAYER_COORDINATES[cacheKey] || geocodeCache[cacheKey];
        if (!coordinates) {
          const query = encodeURIComponent(cacheKey);
          const geocodeResponse = await fetch(`https://photon.komoot.io/api/?q=${query}&limit=1`);
          const geocodeData = geocodeResponse.ok ? await geocodeResponse.json() : null;
          coordinates = geocodeData?.features?.[0]?.geometry?.coordinates;
          if (coordinates) {
            geocodeCache[cacheKey] = coordinates;
            localStorage.setItem("atp-player-city-coordinates-v2", JSON.stringify(geocodeCache));
          }
        }
        if (!coordinates) {
          await addNextPlayer();
          return;
        }
        const marker = L.marker([coordinates[1], coordinates[0]], {
          icon: L.divIcon({
            className: "tournament-marker player-map-marker",
            html: "",
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -22],
          }),
        });
        marker.bindPopup(buildPlayerCardHTML(player), {
          className: "player-map-popup",
          maxWidth: 300,
          minWidth: 260,
        });
        playerLayer.addLayer(marker);
        await addNextPlayer();
      };
      await Promise.all(Array.from({ length: Math.min(5, players.length) }, () => addNextPlayer()));
    } catch (error) {
      console.error(error);
    }
  };

  let map = null;
  let tournamentLayer = null;
  let playerLayer = null;

  const openMap = (mode) => {
    const calendarView = document.getElementById("atp-tournaments-calendar");
    const birthdaysView = document.getElementById("atp-birthdays-agenda");
    const calendarButton = document.getElementById("atp-calendar-btn");
    const versusView = document.getElementById("atp-versus-view");
    const versusButton = document.getElementById("atp-versus-btn");
    const historyView = document.getElementById("atp-history-view");
    const historyButton = document.getElementById("atp-history-btn");
    if (calendarView) calendarView.hidden = true;
    if (birthdaysView) birthdaysView.hidden = true;
    if (versusView) versusView.hidden = true;
    if (historyView) historyView.hidden = true;
    if (historyButton) {
      historyButton.classList.remove("is-active");
      historyButton.setAttribute("aria-pressed", "false");
    }
    if (versusButton) {
      versusButton.classList.remove("is-active");
      versusButton.setAttribute("aria-pressed", "false");
    }
    if (calendarButton) calendarButton.classList.remove("is-active");
    hero.hidden = true;
    mapView.hidden = false;
    mapBtn.classList.add("is-active");
    mapBtn.setAttribute("aria-pressed", "true");
    mapView.dataset.mapMode = mode;

    const firstOpen = !map;

    if (!map) {
      map = L.map("atp-map-canvas", {
        worldCopyJump: false,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0,
        maxZoom: 18,
      }).setView(worldBounds.getCenter(), 2);

      // Teselas de Esri (rotulan el mundo en inglés por defecto, sin clave API)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, &copy; OpenStreetMap contributors, and the GIS User Community",
          noWrap: true,
          bounds: worldBounds,
          maxZoom: 18,
        }
      ).addTo(map);

      setupTournaments();

      window.addEventListener("resize", () => {
        map.invalidateSize();
        clampToCover();
      });
    }

    if (mapFilters) mapFilters.hidden = mode === "players";
    if (tournamentLayer) {
      if (mode === "tournaments" && !map.hasLayer(tournamentLayer)) map.addLayer(tournamentLayer);
      if (mode === "players" && map.hasLayer(tournamentLayer)) map.removeLayer(tournamentLayer);
    }
    if (mode === "players") {
      setupPlayers();
      if (playerLayer && !map.hasLayer(playerLayer)) map.addLayer(playerLayer);
    } else if (playerLayer && map.hasLayer(playerLayer)) {
      map.removeLayer(playerLayer);
    }
    if (mode === "players") map.closePopup();

    requestAnimationFrame(() => {
      map.invalidateSize();
      const coverZoom = map.getBoundsZoom(worldBounds, true);
      map.setMinZoom(coverZoom);
      // Solo la primera vez se encuadra el mundo completo a pantalla; en
      // aperturas posteriores se respeta la posición/zoom que dejó el usuario,
      // solo corrigiendo si ha quedado por debajo del zoom de cobertura.
      if (firstOpen) {
        map.setView(projectedCenter(coverZoom), coverZoom, { animate: false });
      } else if (map.getZoom() < coverZoom) {
        map.setZoom(coverZoom);
      }
    });
  };

  const closeMap = () => {
    mapView.hidden = true;
    hero.hidden = false;
    mapBtn.classList.remove("is-active");
    mapBtn.setAttribute("aria-pressed", "false");
  };

  tournamentsMapOption.addEventListener("click", () => openMap("tournaments"));
  playersMapOption.addEventListener("click", () => openMap("players"));
});
