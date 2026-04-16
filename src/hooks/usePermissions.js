// Hook para verificar permisos del usuario
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook para verificar permisos del usuario
 * @returns {object} Funciones para verificar permisos
 */
export const usePermissions = () => {
  const { user, hasPermission, hasPermissionByModuleAction, hasAnyPermission } = useAuth()

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} permisoNombre - Nombre del permiso
   * @returns {boolean}
   */
  const can = (permisoNombre) => {
    return hasPermission(permisoNombre)
  }

  /**
   * Verificar si el usuario tiene un permiso por módulo y acción
   * @param {string} modulo - Módulo del permiso
   * @param {string} accion - Acción del permiso
   * @returns {boolean}
   */
  const canDo = (modulo, accion) => {
    return hasPermissionByModuleAction(modulo, accion)
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos
   * @param {string[]} permisos - Array de nombres de permisos
   * @returns {boolean}
   */
  const canAny = (permisos) => {
    return hasAnyPermission(permisos)
  }

  /**
   * Verificar si el usuario puede crear en un módulo
   * @param {string} modulo - Módulo
   * @returns {boolean}
   */
  const canCreate = (modulo) => {
    return hasPermissionByModuleAction(modulo, 'crear')
  }

  /**
   * Verificar si el usuario puede editar en un módulo
   * @param {string} modulo - Módulo
   * @returns {boolean}
   */
  const canEdit = (modulo) => {
    return hasPermissionByModuleAction(modulo, 'editar')
  }

  /**
   * Verificar si el usuario puede eliminar en un módulo
   * @param {string} modulo - Módulo
   * @returns {boolean}
   */
  const canDelete = (modulo) => {
    return hasPermissionByModuleAction(modulo, 'eliminar')
  }

  /**
   * Verificar si el usuario puede ver en un módulo
   * @param {string} modulo - Módulo
   * @returns {boolean}
   */
  const canView = (modulo) => {
    return hasPermissionByModuleAction(modulo, 'ver')
  }

  return {
    can,
    canDo,
    canAny,
    canCreate,
    canEdit,
    canDelete,
    canView,
    permisos: user?.permisos || []
  }
}

