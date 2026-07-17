// Atlas del Tenis — interacciones sutiles de la portada

document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector(".hero__content");
  const court = document.querySelector(".hero__court");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Entrada suave del contenido
  if (content) {
    content.style.opacity = "0";
    content.style.transform = "translateY(14px)";
    content.style.transition = "opacity 1s ease, transform 1s ease";
    requestAnimationFrame(() => {
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    });
  }

  // Ligero parallax del fondo al mover el ratón (solo escritorio, movimiento reducido respetado)
  if (court && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    court.style.transition = "transform 0.4s ease-out";
    window.addEventListener("mousemove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 10;
      court.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
    });
  }
});
