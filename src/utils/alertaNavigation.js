import { ROLES, normalizeRole } from './roleUtils'

/**
 * Ruta SPA para el rol actual según `contexto.paths` del backend o reglas por módulo.
 * @param {object} alerta
 * @param {string|null|undefined} viewerRole rol/tipo del usuario (p. ej. desde AuthContext)
 * @returns {string|null} path relativo o null si no hay destino seguro
 */
export function resolveAlertaPath(alerta, viewerRole) {
  if (!alerta) return null
  const r = normalizeRole(viewerRole)
  const paths = alerta.contexto?.paths
  if (paths && typeof paths === 'object') {
    if (r === ROLES.CONSULTORA && paths.consultora) return paths.consultora
    if (r === ROLES.COLABORADOR && paths.colaborador) return paths.colaborador
    if (r === ROLES.EMPRESA_CLIENTE && paths.empresa_cliente) return paths.empresa_cliente
  }

  const eid = alerta.empresa_id
  const pid = alerta.personal_id
  const mod = alerta.modulo

  if (mod === 'asignacion_empresa' && r === ROLES.COLABORADOR && eid) {
    return `/colaborador/empresas/${eid}/personal`
  }
  if (mod === 'acceso_portal') {
    if (r === ROLES.CONSULTORA && eid) return `/consultora/mis-empresas/${eid}`
    if (r === ROLES.EMPRESA_CLIENTE) return '/empresa-cliente/dashboard'
  }
  if (mod === 'registro_personal') {
    if (r === ROLES.CONSULTORA && eid) return `/consultora/mis-empresas/${eid}`
    if (r === ROLES.EMPRESA_CLIENTE && pid) return `/empresa-cliente/personal/${pid}`
  }
  if (mod === 'declaracion_mensual') {
    if (r === ROLES.EMPRESA_CLIENTE) return '/empresa-cliente/declaraciones-mensuales'
    if (r === ROLES.CONSULTORA) return '/consultora/reportes'
  }

  const tramiteModulos = [
    'tramite_asignado',
    'tramite_recordatorio',
    'tramite_periodo_nuevo',
    'tramite_tareas_pendientes',
    'tramite_recurrencia_anulada',
    'tramite_anulado',
  ]
  if (tramiteModulos.includes(mod)) {
    const tid = alerta.contexto?.tramite_id
    if (r === ROLES.CONSULTORA && tid) return `/consultora/tramites/${tid}`
    if (r === ROLES.COLABORADOR && tid) return `/colaborador/tramites/${tid}`
  }

  return null
}
