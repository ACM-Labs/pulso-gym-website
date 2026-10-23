const limpiar = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export const PLANES = ["mensual", "anual", "perpetuo", "no-se"];
export const TAMANOS = ["hasta-100", "101-300", "301-800", "mas-800"];

/** Devuelve { datos } o { errores } con un mensaje por campo. */
export function validarSolicitud(cuerpo) {
  const c = cuerpo && typeof cuerpo === "object" ? cuerpo : {};
  const d = {
    gimnasio: limpiar(c.gimnasio, 120),
    contacto: limpiar(c.contacto, 120),
    correo: limpiar(c.correo, 160).toLowerCase(),
    telefono: limpiar(c.telefono, 40),
    ciudad: limpiar(c.ciudad, 80),
    ruc: limpiar(c.ruc, 20),
    clientes: limpiar(c.clientes, 20),
    plan: limpiar(c.plan, 20),
    mensaje: typeof c.mensaje === "string" ? c.mensaje.trim().slice(0, 1000) : "",
  };
  const errores = {};
  if (d.gimnasio.length < 2) errores.gimnasio = "Escribe el nombre del gimnasio.";
  if (d.contacto.length < 2) errores.contacto = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo)) errores.correo = "Escribe un correo válido.";
  if ((d.telefono.match(/\d/g) ?? []).length < 6 || !/^[\d\s+()\-]+$/.test(d.telefono))
    errores.telefono = "Escribe un teléfono válido.";
  if (d.ciudad.length < 2) errores.ciudad = "Escribe la ciudad.";
  if (d.ruc && !/^\d{5,9}(-\d)?$/.test(d.ruc)) errores.ruc = "Usa el formato 1234567 o 1234567-8.";
  if (d.clientes && !TAMANOS.includes(d.clientes)) errores.clientes = "Elige una opción.";
  if (d.plan && !PLANES.includes(d.plan)) errores.plan = "Elige un plan.";
  if (c.acepto !== true) errores.acepto = "Debes aceptar el tratamiento de tus datos.";
  return Object.keys(errores).length ? { errores } : { datos: d };
}
