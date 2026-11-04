import { responder } from "./_comun.js";

// Países que usan el euro (zona euro y microestados con euro).
const EURO = new Set("AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK AD MC SM VA ME XK".split(" "));

// Guaraníes por unidad si el servicio de cambio no responde (solo referencia).
const RESPALDO = { USD: 7300, EUR: 8400 };
const VIGENCIA_MS = 6 * 60 * 60 * 1000;
let cache = null;

function monedaDe(pais) {
  if (pais === "PY") return "PYG";
  if (EURO.has(pais)) return "EUR";
  return "USD";
}

// Guaraníes por 1 USD y por 1 EUR, con el cambio del día y copia en memoria por 6 horas.
async function tasas() {
  if (cache && Date.now() - cache.en < VIGENCIA_MS) return cache;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(4000) });
    const { result, rates } = await r.json();
    if (result === "success" && rates?.PYG > 0 && rates?.EUR > 0) {
      cache = { en: Date.now(), fuente: "cambio del día", USD: rates.PYG, EUR: rates.PYG / rates.EUR };
      return cache;
    }
  } catch {
    // se usa la última tasa conocida o la de respaldo
  }
  return cache ?? { en: 0, fuente: "referencial", ...RESPALDO };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return responder(res, 405, { error: "Método no permitido" });
  const pais = String(req.headers["x-vercel-ip-country"] ?? "").toUpperCase();
  const t = await tasas();
  responder(res, 200, { pais: pais || null, moneda: monedaDe(pais), tasas: { USD: t.USD, EUR: t.EUR }, fuente: t.fuente });
}
