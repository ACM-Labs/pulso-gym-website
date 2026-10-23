import { base, prepararTabla, responder, tokenValido } from "./_comun.js";

const ESTADOS = ["nueva", "contactada", "cerrada", "descartada"];

export default async function handler(req, res) {
  if (!tokenValido(req)) return responder(res, 401, { error: "Clave incorrecta." });
  try {
    await prepararTabla();
    const sql = base();
    if (req.method === "GET") {
      const filas = await sql`SELECT * FROM solicitudes ORDER BY creada DESC LIMIT 500`;
      return responder(res, 200, { solicitudes: filas });
    }
    if (req.method === "PATCH") {
      const c = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!Number.isInteger(c?.id) || !ESTADOS.includes(c?.estado)) return responder(res, 400, { error: "Datos inválidos." });
      await sql`UPDATE solicitudes SET estado = ${c.estado} WHERE id = ${c.id}`;
      return responder(res, 200, { ok: true });
    }
    return responder(res, 405, { error: "Método no permitido." });
  } catch (e) {
    console.error("solicitudes:", e);
    return responder(res, 500, { error: "Error del servidor." });
  }
}
