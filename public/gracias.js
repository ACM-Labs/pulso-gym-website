// Espera unos segundos y empieza la descarga; el enlace de la página sirve si el navegador la bloquea.
const estado = document.getElementById("estado-descarga");
const enlace = document.getElementById("enlace-descarga");
document.getElementById("anio").textContent = new Date().getFullYear();
let falta = 3;
const reloj = setInterval(() => {
  falta -= 1;
  if (falta > 0) {
    document.getElementById("cuenta").textContent = falta;
    document.getElementById("unidad").textContent = falta === 1 ? "segundo" : "segundos";
    return;
  }
  clearInterval(reloj);
  enlace.click();
  estado.textContent = "Descarga iniciada. Cuando termine, abre el instalador y sigue los pasos.";
}, 1000);
