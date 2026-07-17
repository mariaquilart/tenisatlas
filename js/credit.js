// Atlas del Tenis — sección de créditos: fade in/out al entrar/salir del viewport

document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("credit-section");
  if (!section) return;

  if (!("IntersectionObserver" in window)) {
    section.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        section.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(section);
});
