import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js/max";
import ubicaciones from "../data/ubicacionesMexico.json";

const regiones = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["es"], { type: "region" }) : null;
export const PAISES_TELEFONO = getCountries().map((codigo) => ({
  codigo, nombre: regiones?.of(codigo) || codigo, prefijo: `+${getCountryCallingCode(codigo)}`,
})).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
export const ESTADOS = ubicaciones;
export const CAMPOS_POR_PASO = {
  1: ["empresa.nombre", "empresa.telefono", "empresa.correo"],
  2: ["empresa.direccion", "empresa.estado", "empresa.ciudad", "empresa.codigoPostal"],
  3: ["administrador.nombre", "administrador.apellidos", "administrador.correo", "administrador.telefono", "administrador.password", "administrador.passwordConfirmation"],
};
export const MAPA_ERRORES_API = {
  nombre_empresa: "empresa.nombre", correo_empresa: "empresa.correo", telefono_empresa: "empresa.telefono",
  direccion: "empresa.direccion", estado: "empresa.estado", ciudad: "empresa.ciudad", codigo_postal: "empresa.codigoPostal",
  nombre_administrador: "administrador.nombre", telefono_administrador: "administrador.telefono",
  email: "administrador.correo", password: "administrador.password", password_confirmation: "administrador.passwordConfirmation",
};
export function requisitosPassword(password) {
  return [
    { texto: "Mínimo 8 caracteres", cumple: Array.from(password).length >= 8 },
    { texto: "Una mayúscula", cumple: /\p{Lu}/u.test(password) },
    { texto: "Una minúscula", cumple: /\p{Ll}/u.test(password) },
    { texto: "Un número", cumple: /[0-9]/.test(password) },
    { texto: "Un signo o carácter especial", cumple: /[^\p{L}\p{N}\s\p{C}]/u.test(password) },
  ];
}
export function fortalezaPassword(password) {
  if (!password) return { texto: "Sin contraseña", color: "secondary", porcentaje: 0 };
  const cumple = requisitosPassword(password).every((r) => r.cumple) && !/[\s\p{C}]/u.test(password);
  // Indicador orientativo: cumplir la política no garantiza que una contraseña sea difícil de adivinar.
  if (!cumple) return { texto: "Débil", color: "danger", porcentaje: 25 };
  if (Array.from(password).length < 12) return { texto: "Media", color: "warning", porcentaje: 65 };
  return { texto: "Fuerte", color: "success", porcentaje: 100 };
}
export function analizarTelefono(value, pais) {
  if (!getCountries().includes(pais) || !/^\+?[0-9 ()\-]+$/.test(value.trim())) return null;
  try {
    const phone = parsePhoneNumberFromString(value.trim(), { defaultCountry: pais, extract: false });
    if (!phone?.isValid() || phone.country !== pais || phone.ext) return null;
    return phone;
  } catch { return null; }
}
export function validarCorreo(value) {
  const correo = value.trim();
  if (correo.length > 254 || /\s/.test(correo)) return false;
  const partes = correo.split("@");
  if (partes.length !== 2) return false;
  const [local, domain] = partes;
  return local.length > 0 && local.length <= 64 &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) &&
    !local.startsWith(".") && !local.endsWith(".") && !local.includes("..") &&
    domain.includes(".") && domain.split(".").every((label) =>
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label));
}
export function validarCampo(key, data, paises) {
  const [grupo, campo] = key.split(".");
  const raw = data[grupo][campo];
  const value = raw.trim();
  if (!value) return key === "administrador.telefono" ? "" : "Este campo es obligatorio.";
  if (/[\p{C}]/u.test(raw)) return "Elimina los caracteres de control de este campo.";
  if (campo === "password") {
    if (Array.from(raw).length > 64) return "Usa como máximo 64 caracteres.";
    if (/\s/.test(raw)) return "La contraseña no debe contener espacios.";
    if (!requisitosPassword(raw).every((r) => r.cumple)) return "Cumple todos los requisitos de la contraseña.";
  }
  if (campo === "passwordConfirmation" && raw !== data.administrador.password) return "Las contraseñas no coinciden.";
  if (campo === "correo" && !validarCorreo(raw)) return "Escribe un correo válido, por ejemplo nombre@empresa.com.";
  if (campo === "telefono" && !analizarTelefono(raw, paises[grupo])) return "Escribe un teléfono válido para el país seleccionado, sin extensiones.";
  if (["nombre", "apellidos"].includes(campo)) {
    const max = grupo === "empresa" ? 150 : 100;
    if (value.length < 2 || value.length > max) return `Escribe entre 2 y ${max} caracteres.`;
    if (grupo === "administrador" && !/^[\p{L}\p{M}]+(?:[ .'’\-][\p{L}\p{M}]+)*\.?$/u.test(value)) return "Usa letras, espacios, apóstrofos o guiones para tu nombre.";
    if (grupo === "empresa" && !/[\p{L}\p{N}]/u.test(value)) return "Escribe el nombre de la empresa.";
  }
  if (campo === "direccion" && (value.length < 5 || value.length > 255 || !/[\p{L}\p{N}]/u.test(value))) return "Escribe una dirección de entre 5 y 255 caracteres.";
  if (campo === "estado" && !ESTADOS.some((e) => e.nombre === raw)) return "Selecciona un estado de la lista.";
  if (campo === "ciudad" && !ESTADOS.find((e) => e.nombre === data.empresa.estado)?.municipios.includes(raw)) return "Selecciona un municipio del estado elegido.";
  if (campo === "codigoPostal" && !/^[0-9]{5}$/.test(raw)) return "El código postal debe tener exactamente 5 dígitos.";
  return "";
}
export function validarFormulario(data, paises) {
  return Object.fromEntries(Object.values(CAMPOS_POR_PASO).flat().map((key) => [key, validarCampo(key, data, paises)]).filter(([, error]) => error));
}
export function construirPayload(data, paises) {
  const e = data.empresa, a = data.administrador;
  return {
    nombre_empresa: e.nombre.trim(), correo_empresa: e.correo.trim(),
    telefono_empresa: analizarTelefono(e.telefono, paises.empresa)?.number || "",
    direccion: e.direccion.trim(), estado: e.estado, ciudad: e.ciudad, codigo_postal: e.codigoPostal,
    nombre_administrador: `${a.nombre.trim()} ${a.apellidos.trim()}`.replace(/\s+/g, " "),
    telefono_administrador: a.telefono.trim() ? analizarTelefono(a.telefono, paises.administrador)?.number || "" : "",
    email: a.correo.trim(), password: a.password, password_confirmation: a.passwordConfirmation,
  };
}
