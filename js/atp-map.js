// ATP — muestra un mapa mundial a pantalla casi completa al pulsar "Mapa" del menú
// Un único mapamundi: sin repetición horizontal y sin espacios en blanco al
// desplazar o hacer zoom (el desplazamiento y el zoom quedan acotados al planeta).
// Incluye marcadores de torneo con clustering y filtros combinables de
// categoría / superficie, más una tarjeta con los datos de cada torneo.

document.addEventListener("DOMContentLoaded", () => {
  const mapBtn = document.getElementById("atp-map-btn");
  const hero = document.getElementById("atp-hero");
  const mapView = document.getElementById("atp-map-view");
  if (!mapBtn || !hero || !mapView || typeof L === "undefined") return;

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
        ${Object.prototype.hasOwnProperty.call(t, "prizeMoney") ? row("Premios", t.prizeMoney ? escapeHtml(t.prizeMoney) : "—") : ""}
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
    const emptyMsg = document.getElementById("atp-map-empty");

    const categories = CATEGORY_ORDER.filter((c) => data.some((t) => t.category === c));
    const surfaces = SURFACE_ORDER.filter((s) => data.some((t) => t.surface === s));
    // Sin filtros activos al abrir el mapa: un conjunto vacío equivale a
    // mostrar todos los valores de ese grupo.
    const activeCategories = new Set();
    const activeSurfaces = new Set();

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
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
      clusterGroup.clearLayers();
      const visible = markers.filter(
        (m) =>
          (!activeCategories.size || activeCategories.has(m.tournament.category)) &&
          (!activeSurfaces.size || activeSurfaces.has(m.tournament.surface))
      );
      if (visible.length) clusterGroup.addLayers(visible);
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

    map.addLayer(clusterGroup);
    refresh();
  };

  let map = null;

  const openMap = () => {
    hero.hidden = true;
    mapView.hidden = false;
    mapBtn.classList.add("is-active");
    mapBtn.setAttribute("aria-pressed", "true");

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

  mapBtn.addEventListener("click", () => {
    if (mapView.hidden) openMap();
    else closeMap();
  });
});
