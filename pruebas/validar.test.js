import test from "node:test";
import assert from "node:assert/strict";
import { validarSolicitud } from "../api/_validar.js";

const valida = {
  gimnasio: "Gym Central", contacto: "Ana Gómez", correo: "ANA@correo.com", telefono: "+595 981 123 456",
  ciudad: "Asunción", ruc: "1234567-8", clientes: "101-300", plan: "anual", acepto: true,
};

test("acepta una solicitud completa y normaliza el correo", () => {
  const r = validarSolicitud(valida);
  assert.equal(r.errores, undefined);
  assert.equal(r.datos.correo, "ana@correo.com");
});
test("exige consentimiento, correo y teléfono válidos", () => {
  const r = validarSolicitud({ ...valida, acepto: false, correo: "x", telefono: "abc" });
  assert.deepEqual(Object.keys(r.errores).sort(), ["acepto", "correo", "telefono"]);
});
test("el RUC y el plan son opcionales pero se validan si vienen", () => {
  assert.equal(validarSolicitud({ ...valida, ruc: "", plan: "" }).errores, undefined);
  assert.ok(validarSolicitud({ ...valida, ruc: "12" }).errores.ruc);
  assert.ok(validarSolicitud({ ...valida, plan: "gratis" }).errores.plan);
});
test("recorta textos largos", () => {
  const r = validarSolicitud({ ...valida, mensaje: "a".repeat(5000) });
  assert.equal(r.datos.mensaje.length, 1000);
});
