const $ = (s, r = document) => r.querySelector(s);
$("#anio").textContent = new Date().getFullYear();

const texto = (t) => Object.assign(document.createElement("span"), { textContent: t });

async function cargarPlanes() {
  const lista = $("#lista-planes");
  const selector = $("#plan");
  try {
    const r = await fetch("/planes.json");
    const { moneda, planes } = await r.json();
    lista.replaceChildren(
      ...planes.map((p) => {
        const art = document.createElement("article");
        art.className = "plan" + (p.destacado ? " destacado" : "");
        if (p.destacado) art.append(Object.assign(document.createElement("span"), { className: "insignia", textContent: "Más elegido" }));
        const precio = document.createElement("div");
        precio.className = "precio";
        precio.append(p.precio == null ? texto("Consultar") : texto(`${moneda} ${p.precio.toLocaleString("es-PY")}`));
        precio.append(" ", Object.assign(document.createElement("small"), { textContent: p.periodo }));
        const ul = document.createElement("ul");
        p.incluye.forEach((i) => ul.append(Object.assign(document.createElement("li"), { textContent: i })));
        const boton = Object.assign(document.createElement("a"), { className: "boton" + (p.destacado ? "" : " claro"), href: "#registro", textContent: "Solicitar este plan" });
        boton.addEventListener("click", () => (selector.value = p.id));
        art.append(
          Object.assign(document.createElement("h3"), { textContent: p.nombre }),
          Object.assign(document.createElement("p"), { className: "desc", textContent: p.descripcion }),
          precio,
          ul,
          boton,
        );
        return art;
      }),
    );
    planes.forEach((p) => selector.append(new Option(p.nombre, p.id)));
    selector.append(new Option("Aún no lo sé", "no-se"));
  } catch {
    lista.textContent = "No pudimos cargar los planes. Escríbenos desde el formulario y te los enviamos.";
    selector.append(new Option("Aún no lo sé", "no-se"));
  }
}

const form = $("#formulario");
const estado = $("#estado-envio");

function marcarErrores(errores = {}) {
  form.querySelectorAll(".campo").forEach((campo) => {
    const el = campo.querySelector("input, select, textarea");
    const msg = errores[el?.name];
    campo.toggleAttribute("data-error", Boolean(msg));
    const span = campo.querySelector(".mensaje-error");
    if (span) span.textContent = msg ?? "";
    el?.setAttribute("aria-invalid", msg ? "true" : "false");
  });
  const primero = form.querySelector("[aria-invalid='true']");
  primero?.focus();
}

function avisar(tipo, mensaje) {
  estado.hidden = !mensaje;
  estado.className = "estado-envio " + (tipo ?? "");
  estado.textContent = mensaje ?? "";
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  avisar();
  const datos = Object.fromEntries(new FormData(form));
  datos.acepto = $("#acepto").checked;
  const boton = $("#enviar");
  boton.disabled = true;
  boton.textContent = "Enviando…";
  try {
    const r = await fetch("/api/solicitud", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
    const cuerpo = await r.json().catch(() => ({}));
    if (r.ok) {
      marcarErrores();
      $("#zona-formulario").innerHTML =
        '<div class="formulario exito" style="display:block"><div class="icono">✓</div><h3>¡Solicitud enviada!</h3><p>Gracias. El equipo de ACM Labs te contactará pronto.</p></div>';
      return;
    }
    if (cuerpo.errores) marcarErrores(cuerpo.errores);
    avisar("mal", cuerpo.error ?? "No pudimos enviar tu solicitud.");
  } catch {
    avisar("mal", "Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.");
  } finally {
    boton.disabled = false;
    boton.textContent = "Enviar solicitud";
  }
});

cargarPlanes();

// Escala la réplica del panel (diseñada a 1000 px) al ancho disponible y muestra la fecha de hoy.
const lienzo = $("#demo-lienzo");
if (lienzo) {
  $("#demo-fecha").textContent = new Date().toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" });
  const caja = lienzo.parentElement;
  const ajustar = () => caja.style.setProperty("--demo-k", Math.min(1, caja.clientWidth / 1000));
  new ResizeObserver(ajustar).observe(caja);
  ajustar();
}
