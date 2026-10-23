import { neon } from "@neondatabase/serverless";
import { timingSafeEqual } from "node:crypto";

let sql;
export function base() {
  if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
  sql ??= neon(process.env.DATABASE_URL);
  return sql;
}

let lista = false;
export async function prepararTabla() {
  if (lista) return;
  await base()`
    CREATE TABLE IF NOT EXISTS solicitudes (
      id BIGSERIAL PRIMARY KEY,
      creada TIMESTAMPTZ NOT NULL DEFAULT now(),
      gimnasio TEXT,
      contacto TEXT NOT NULL,
      correo TEXT NOT NULL,
      telefono TEXT NOT NULL,
      ciudad TEXT,
      ruc TEXT,
      clientes TEXT,
      plan TEXT,
      mensaje TEXT,
      estado TEXT NOT NULL DEFAULT 'nueva'
    )`;
  // La tabla nació con más campos obligatorios; el formulario ya no los pide.
  await base()`ALTER TABLE solicitudes ALTER COLUMN gimnasio DROP NOT NULL`;
  await base()`ALTER TABLE solicitudes ALTER COLUMN ciudad DROP NOT NULL`;
  lista = true;
}

export function responder(res, estado, cuerpo) {
  res.status(estado).setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(JSON.stringify(cuerpo));
}

export function tokenValido(req) {
  const esperado = process.env.ADMIN_TOKEN ?? "";
  if (esperado.length < 16) return false;
  const recibido = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}
