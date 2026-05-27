/**
 * Roles HUMBERTO MORENO PEREZ — alineados a `usuarios.tipo` del backend.
 * Valores canónicos en mayúsculas para el frontend.
 */

export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  CONSULTORA: 'CONSULTORA',
  COLABORADOR: 'COLABORADOR',
  EMPRESA_CLIENTE: 'EMPRESA_CLIENTE',
}

const ROLE_MAP = {
  administrador: ROLES.ADMINISTRADOR,
  admin: ROLES.ADMINISTRADOR,
  ADMINISTRADOR: ROLES.ADMINISTRADOR,
  ADMIN: ROLES.ADMINISTRADOR,
  consultora: ROLES.CONSULTORA,
  CONSULTORA: ROLES.CONSULTORA,
  colaborador: ROLES.COLABORADOR,
  COLABORADOR: ROLES.COLABORADOR,
  empresa_cliente: ROLES.EMPRESA_CLIENTE,
  empresaCliente: ROLES.EMPRESA_CLIENTE,
  EMPRESA_CLIENTE: ROLES.EMPRESA_CLIENTE,
}

/**
 * Normaliza `rol` o `tipo` del backend al ROLES del frontend.
 * @param {string|null|undefined} roleOrTipo
 * @returns {string|null}
 */
export const normalizeRole = (roleOrTipo) => {
  if (!roleOrTipo) return null
  const key = String(roleOrTipo).trim()
  if (ROLE_MAP[key] !== undefined) return ROLE_MAP[key]
  const lower = key.toLowerCase()
  if (ROLE_MAP[lower] !== undefined) return ROLE_MAP[lower]
  return key.toUpperCase()
}

export const isValidRole = (role) => {
  const normalized = normalizeRole(role)
  return Object.values(ROLES).includes(normalized)
}

export const hasRole = (userRole, requiredRole) => {
  return normalizeRole(userRole) === normalizeRole(requiredRole)
}

export const hasAnyRole = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) return false
  const normalizedUserRole = normalizeRole(userRole)
  return requiredRoles.some((role) => normalizeRole(role) === normalizedUserRole)
}

export const getRoleLabel = (role) => {
  const normalized = normalizeRole(role)
  const labels = {
    [ROLES.ADMINISTRADOR]: 'Administrador del sistema',
    [ROLES.CONSULTORA]: 'Empresa consultora',
    [ROLES.COLABORADOR]: 'Colaborador',
    [ROLES.EMPRESA_CLIENTE]: 'Empresa cliente',
  }
  return labels[normalized] || normalized
}

export const getRoleColor = (role) => {
  const normalized = normalizeRole(role)
  const colors = {
    [ROLES.ADMINISTRADOR]: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    [ROLES.CONSULTORA]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    [ROLES.COLABORADOR]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    [ROLES.EMPRESA_CLIENTE]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  }
  return colors[normalized] || 'bg-gray-100 text-gray-800'
}

export const getRoleIcon = () => 'user'

export const filterValidRoles = (roles) => {
  if (!Array.isArray(roles)) return []
  return roles.map((role) => normalizeRole(role)).filter((role) => isValidRole(role))
}

export const compareRoles = (role1, role2) => {
  return normalizeRole(role1) === normalizeRole(role2)
}

/** Ruta del panel según rol (tras login o cambio de contraseña). */
export const dashboardPathForRole = (userOrRol) => {
  const r = normalizeRole(
    userOrRol && typeof userOrRol === 'object' ? userOrRol.rol : userOrRol
  )
  if (r === ROLES.ADMINISTRADOR) return '/admin/dashboard'
  if (r === ROLES.CONSULTORA) return '/consultora/dashboard'
  if (r === ROLES.COLABORADOR) return '/colaborador/dashboard'
  if (r === ROLES.EMPRESA_CLIENTE) return '/empresa-cliente/dashboard'
  return '/login'
}

export default {
  ROLES,
  normalizeRole,
  isValidRole,
  hasRole,
  hasAnyRole,
  getRoleLabel,
  getRoleColor,
  getRoleIcon,
  filterValidRoles,
  compareRoles,
  dashboardPathForRole,
}
