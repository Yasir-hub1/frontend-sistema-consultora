/**
 * Permisos de colaborador: el backend guarda flags por módulo en `permisos_por_modulo`
 * y además agrega `puede_editar_personal` / `puede_registrar_personal` si algún módulo los tiene.
 * Estas funciones alinean la UI con ColaboradorAutorizacionService (Laravel).
 */

import { ROLES, normalizeRole } from './roleUtils'

export function getPermisoModulo(user, modulo) {
  const list = user?.colaborador?.permisos_por_modulo
  if (!Array.isArray(list)) return null
  const m = String(modulo || '').toLowerCase()
  return list.find((p) => String(p?.modulo || '').toLowerCase() === m) ?? null
}

/** Alta de personal (create) en empresas asignadas */
export function colaboradorPuedeRegistrarPersonal(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return Boolean(user.colaborador?.puede_registrar_personal)
}

/** Editar ficha del empleado (PUT personal), documentos si tiene permiso por módulo o este flag global */
export function colaboradorPuedeEditarLegajoGlobal(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return Boolean(user.colaborador?.puede_editar_personal)
}

/** Subir archivos del catálogo en la pestaña AFP / CAJA / Ministerio */
export function colaboradorPuedeSubirDocumentosEnModulo(user, modulo) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  if (colaboradorPuedeEditarLegajoGlobal(user)) return true
  const p = getPermisoModulo(user, modulo)
  return Boolean(p?.puede_subir_documentos)
}

/** Declaración mensual (PDF + montos) para un módulo concreto */
export function colaboradorPuedeCargarDeclaracionMensualEnModulo(user, modulo) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  const c = user.colaborador
  if (!c) return false
  if (c.puede_editar_personal || c.puede_registrar_personal) return true
  const p = getPermisoModulo(user, modulo)
  return Boolean(p?.puede_gestionar_modulo)
}

/** True si puede cargar al menos un módulo (o es consultora / edición global) */
export function colaboradorPuedeCargarAlgunaDeclaracionMensual(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  const c = user.colaborador
  if (!c) return false
  if (c.puede_editar_personal || c.puede_registrar_personal) return true
  const perms = c.permisos_por_modulo
  if (!Array.isArray(perms)) return false
  return perms.some((p) => p.puede_gestionar_modulo)
}

/** Declaración anual de aguinaldo (empresa) */
export function colaboradorPuedeCargarDeclaracionAguinaldo(user) {
  return colaboradorPuedeCargarAlgunaDeclaracionMensual(user)
}

export function colaboradorPuedeEditarEmpresaCliente(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return Boolean(user.colaborador?.puede_editar_empresa_cliente)
}
