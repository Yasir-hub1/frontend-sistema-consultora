/**
 * Permisos de colaborador — alineado con ColaboradorAutorizacionService (Laravel).
 * Cada acción usa solo el flag explícito configurado en Mi equipo (sin atajos globales cruzados).
 */

import { ROLES, normalizeRole } from './roleUtils'

/** Normaliza 0/1/string desde API a booleano. */
export function normalizePermisoBool(v) {
  if (v === true || v === 1 || v === '1') return true
  if (v === false || v === 0 || v === '0' || v === '' || v == null) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  return Boolean(v)
}

export function getPermisoModulo(user, modulo) {
  const list = user?.colaborador?.permisos_por_modulo
  if (!Array.isArray(list)) return null
  const m = String(modulo || '').toLowerCase()
  return list.find((p) => String(p?.modulo || '').toLowerCase() === m) ?? null
}

function permisoModuloActivo(user, modulo, campo) {
  const p = getPermisoModulo(user, modulo)
  return normalizePermisoBool(p?.[campo])
}

function algunPermisoModuloActivo(user, campo) {
  const list = user?.colaborador?.permisos_por_modulo
  if (!Array.isArray(list)) return false
  return list.some((p) => normalizePermisoBool(p?.[campo]))
}

const CAMPOS_ACCESO_PESTANA_MODULO = [
  'puede_subir_documentos',
  'puede_editar_personal',
]

/** Puede ver / entrar a la pestaña del módulo en gestión de empleado. */
export function colaboradorPuedeAccederModulo(user, modulo) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  const p = getPermisoModulo(user, modulo)
  if (!p) return false
  if (normalizePermisoBool(p.puede_ver)) return true
  return CAMPOS_ACCESO_PESTANA_MODULO.some((campo) => normalizePermisoBool(p[campo]))
}

/** Alta de personal en empresas asignadas. */
export function colaboradorPuedeRegistrarPersonal(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return algunPermisoModuloActivo(user, 'puede_registrar_personal')
}

/** Editar ficha del empleado (datos de legajo, régimen CAJA). */
export function colaboradorPuedeEditarLegajoGlobal(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return algunPermisoModuloActivo(user, 'puede_editar_personal')
}

/** Subir archivos del catálogo en AFP / CAJA / Ministerio (solo flag del módulo). */
export function colaboradorPuedeSubirDocumentosEnModulo(user, modulo) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return permisoModuloActivo(user, modulo, 'puede_subir_documentos')
}

/** Declaración mensual de un módulo (solo flag puede_gestionar_modulo de ese módulo). */
export function colaboradorPuedeCargarDeclaracionMensualEnModulo(user, modulo) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return permisoModuloActivo(user, modulo, 'puede_gestionar_modulo')
}

export function colaboradorPuedeCargarAlgunaDeclaracionMensual(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return ['afp', 'caja', 'ministerio'].some((m) => colaboradorPuedeCargarDeclaracionMensualEnModulo(user, m))
}

/** Declaración anual de aguinaldo — solo flag explícito en colaborador. */
export function colaboradorPuedeCargarDeclaracionAguinaldo(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return normalizePermisoBool(user.colaborador?.puede_declarar_aguinaldo)
}

export function colaboradorPuedeEditarEmpresaCliente(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return normalizePermisoBool(user.colaborador?.puede_editar_empresa_cliente)
}

export function colaboradorPuedeGestionarDocumentosLegalesMiEmpresa(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return normalizePermisoBool(user.colaborador?.puede_gestionar_documentos_legales_mi_empresa)
}

export function colaboradorPuedeGestionarOtrosDocumentosEmpresa(user) {
  if (!user) return false
  if (normalizeRole(user.rol) === ROLES.CONSULTORA) return true
  return normalizePermisoBool(user.colaborador?.puede_gestionar_otros_documentos_empresa)
}
