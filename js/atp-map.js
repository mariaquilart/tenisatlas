// ATP — muestra un mapa mundial a pantalla casi completa al pulsar "Mapa" del menú
// Un único mapamundi: sin repetición horizontal y sin espacios en blanco al
// desplazar o hacer zoom (el desplazamiento y el zoom quedan acotados al planeta).

document.addEventListener("DOMContentLoaded", () => {
  const mapBtn = document.getElementById("atp-map-btn");
  const hero = document.getElementById("atp-hero");
  const mapView = document.getElementById("atp-map-view");
  if (!mapBtn || !hero || !mapView || typeof L === "undefined") return;

  // Límites del mapa: se recorta la Antártida (sin interés para el contenido)
  // dejando el borde norte en el límite de la proyección Web Mercator.
  const worldBounds = L.latLngBounds([-60, -180], [85.05112878, 180]);

  let map = null;

  const fitWorld = () => {
    // Zoom mínimo con el que el mundo cubre por completo el contenedor visible,
    // así nunca se ve fondo blanco al alejar el zoom.
    const minZoom = map.getBoundsZoom(worldBounds, true);
    map.setMinZoom(minZoom);
    if (map.getZoom() < minZoom) map.setZoom(minZoom);
  };

  const openMap = () => {
    hero.hidden = true;
    mapView.hidden = false;
    mapBtn.classList.add("is-active");
    mapBtn.setAttribute("aria-pressed", "true");

    if (!map) {
      map = L.map("atp-map-canvas", {
        worldCopyJump: false,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0,
        maxZoom: 18,
      }).setView([20, 10], 2);

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

      window.addEventListener("resize", () => {
        map.invalidateSize();
        fitWorld();
      });
    }

    requestAnimationFrame(() => {
      map.invalidateSize();
      fitWorld();
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
