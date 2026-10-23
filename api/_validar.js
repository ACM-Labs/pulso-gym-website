const limpiar = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export const PLANES = ["mensual", "anual", "perpetuo"];

/** Devuelve { datos } o { errores } con un mensaje por campo. */
export function validarSolicitud(cuerpo) {
  const c = cuerpo && typeof cuerpo === "object" ? cuerpo : {};
  const d = {
    contacto: limpiar(c.contacto, 120),
    correo: limpiar(c.correo, 160).toLowerCase(),
    telefono: limpiar(c.telefono, 40),
    plan: limpiar(c.plan, 20),
  };
  const errores = {};
  if (d.contacto.length < 3 || !d.contacto.includes(" ")) errores.contacto = "Escribe tu nombre completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo)) errores.correo = "Escribe un correo válido.";
  if ((d.telefono.match(/\d/g) ?? []).length < 6 || !/^[\d\s+()\-]+$/.test(d.telefono))
    errores.telefono = "Escribe un número de contacto válido.";
  if (d.plan && !PLANES.includes(d.plan)) errores.plan = "Elige un plan.";
  if (c.acepto !== true) errores.acepto = "Debes aceptar el tratamiento de tus datos.";
  return Object.keys(errores).length ? { errores } : { datos: d };
}
