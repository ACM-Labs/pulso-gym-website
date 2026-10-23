import { base, prepararTabla, responder } from "./_comun.js";
import { validarSolicitud } from "./_validar.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { error: "Método no permitido." });
  const cuerpo = typeof req.body === "string" ? leerJson(req.body) : req.body;
  // Campo trampa para robots: una persona no lo ve ni lo llena. Se responde «ok» sin guardar.
  if (cuerpo && typeof cuerpo.sitio === "string" && cuerpo.sitio !== "") return responder(res, 200, { ok: true });

  const { datos, errores } = validarSolicitud(cuerpo);
  if (errores) return responder(res, 400, { error: "Revisa los datos.", errores });

  try {
    await prepararTabla();
    const sql = base();
    // Máximo 5 solicitudes por correo por día, para frenar abusos.
    const [{ n }] = await sql`
      SELECT count(*)::int AS n FROM solicitudes WHERE correo = ${datos.correo} AND creada > now() - interval '1 day'`;
    if (n >= 5) return responder(res, 429, { error: "Ya recibimos tus solicitudes. Te contactaremos pronto." });
    await sql`
      INSERT INTO solicitudes (contacto, correo, telefono, plan)
      VALUES (${datos.contacto}, ${datos.correo}, ${datos.telefono}, ${datos.plan || null})`;
    return responder(res, 201, { ok: true });
  } catch (e) {
    console.error("solicitud:", e);
    return responder(res, 500, { error: "No pudimos guardar tu solicitud. Inténtalo de nuevo en unos minutos." });
  }
}

function leerJson(t) {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
