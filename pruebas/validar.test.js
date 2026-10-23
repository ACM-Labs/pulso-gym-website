import test from "node:test";
import assert from "node:assert/strict";
import { validarSolicitud } from "../api/_validar.js";

const valida = { contacto: "Ana Gómez", correo: "ANA@correo.com", telefono: "+595 981 123 456", plan: "anual", acepto: true };

test("acepta una solicitud con nombre, teléfono y correo, y normaliza el correo", () => {
  const r = validarSolicitud(valida);
  assert.equal(r.errores, undefined);
  assert.equal(r.datos.correo, "ana@correo.com");
});
test("exige nombre completo, correo, teléfono y consentimiento válidos", () => {
  const r = validarSolicitud({ contacto: "Ana", correo: "x", telefono: "abc", acepto: false });
  assert.deepEqual(Object.keys(r.errores).sort(), ["acepto", "contacto", "correo", "telefono"]);
});
test("el plan es opcional pero se valida si viene", () => {
  assert.equal(validarSolicitud({ ...valida, plan: "" }).errores, undefined);
  assert.ok(validarSolicitud({ ...valida, plan: "gratis" }).errores.plan);
});
test("recorta textos largos", () => {
  const r = validarSolicitud({ ...valida, contacto: "Ana " + "a".repeat(500) });
  assert.equal(r.datos.contacto.length, 120);
});
