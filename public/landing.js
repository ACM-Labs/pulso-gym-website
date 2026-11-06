// Landing de Pulso Gym: entradas al hacer scroll, recorrido por las pantallas y palabras que suben con el desplazamiento.
// El formulario y los planes viven en portal.js. Sin este archivo la página se lee completa.
(() => {
const reducir = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// 1. Aparecen al entrar en pantalla, una sola vez
const aparecen = $$("[data-aparece]");
if ("IntersectionObserver" in window && !reducir.matches) {
  const io = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visto");
        io.unobserve(e.target);
      }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  aparecen.forEach((el) => io.observe(el));
} else {
  aparecen.forEach((el) => el.classList.add("visto"));
}

// 2. Recorrido por las pantallas del sistema
const lista = $("#modulos");
if (lista) {
  const filas = $$(".modulo", lista);
  const botones = $$("button", lista);
  const imagenes = $$(".escena img");
  const todas = $$("img[data-claro]", lista.closest(".tour"));
  const alterna = $("#tema-boton");
  const buscar = $("#buscar");
  const vacio = $("#sin-resultado");
  let oscuro = false;

  const pintar = () => {
    todas.forEach((img) => {
      const o = oscuro && img.dataset.oscuro;
      const destino = o ? img.dataset.oscuro : img.dataset.claro;
      if (img.getAttribute("src") !== destino) img.src = destino;
    });
  };
  const elegir = (boton, enfocar) => {
    botones.forEach((b) => {
      const activo = b === boton;
      b.setAttribute("aria-selected", String(activo));
      b.tabIndex = activo ? 0 : -1;
      b.closest(".modulo").classList.toggle("activo", activo);
    });
    imagenes.forEach((img) => img.classList.toggle("activa", img.dataset.m === boton.dataset.m));
    $("#escena").setAttribute("aria-labelledby", boton.id);
    if (enfocar) boton.focus();
  };
  botones.forEach((b) => {
    b.addEventListener("click", () => elegir(b));
    b.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && elegir(b));
  });
  lista.addEventListener("keydown", (e) => {
    const visibles = botones.filter((b) => !b.closest(".modulo").hidden);
    const i = visibles.indexOf(document.activeElement);
    if (i < 0) return;
    const paso = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (e.key === "Home") elegir(visibles[0], true);
    else if (e.key === "End") elegir(visibles.at(-1), true);
    else if (paso) elegir(visibles[(i + paso + visibles.length) % visibles.length], true);
    else return;
    e.preventDefault();
  });
  buscar?.addEventListener("input", () => {
    const q = buscar.value.trim().toLowerCase();
    let hay = 0;
    filas.forEach((li) => {
      const ok = !q || li.textContent.toLowerCase().includes(q);
      li.hidden = !ok;
      hay += ok ? 1 : 0;
    });
    vacio.hidden = hay > 0;
    const actual = botones.find((b) => b.getAttribute("aria-selected") === "true");
    if (hay && actual.closest(".modulo").hidden) elegir(botones.find((b) => !b.closest(".modulo").hidden));
  });
  alterna?.addEventListener("click", () => {
    oscuro = !oscuro;
    alterna.setAttribute("aria-pressed", String(oscuro));
    pintar();
  });
  elegir(botones[0]);
}

// 3. Las palabras del cambio suben un poco mientras se pasa la sección
const palabras = $$(".palabra p");
if (palabras.length && !reducir.matches) {
  let marco = 0;
  const mover = () => {
    marco = 0;
    const caja = palabras[0].closest(".palabras").getBoundingClientRect();
    const alto = innerHeight;
    // 0 cuando la sección entra por abajo, 1 cuando sale por arriba
    const avance = Math.min(1, Math.max(0, (alto - caja.top) / (alto + caja.height)));
    palabras.forEach((p, i) => p.style.setProperty("--sube", `${(1 - avance) * (i ? 70 : 30)}px`));
  };
  addEventListener("scroll", () => (marco ||= requestAnimationFrame(mover)), { passive: true });
  mover();
}

})();
