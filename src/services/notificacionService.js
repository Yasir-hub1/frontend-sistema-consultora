import { get, put, del, patch } from './api'
import { ROLES, normalizeRole } from '../utils/roleUtils'

function baseUrlAlertasPorRol(roleOrTipo) {
  const r = normalizeRole(roleOrTipo)
  if (r === ROLES.CONSULTORA) return '/consultora/alertas'
  if (r === ROLES.COLABORADOR) return '/colaborador/alertas'
  if (r === ROLES.EMPRESA_CLIENTE) return '/empresa-cliente/alertas'
  return null
}

export const notificacionService = {
  /**
   * Obtener notificaciones del usuario
   * @param {object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.per_page - Elementos por página
   * @param {boolean} params.leida - Filtrar por leída/no leída
   * @param {string} params.tipo - Tipo de notificación
   * @returns {Promise<object>} Lista de notificaciones
   */
  async getNotificaciones(params = {}) {
    try {
      const response = await get('/notificaciones', params)
      
      if (response.data && response.data.success) {
        // El backend devuelve: { success: true, data: { data: [...], last_page: 1, ... }, no_leidas: X }
        return {
          success: true,
          data: response.data.data, // Objeto paginado completo
          noLeidas: response.data.no_leidas || 0
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al obtener notificaciones',
          data: null
        }
      }
    } catch (error) {
      // No loguear errores de red/CORS para evitar spam en consola
      const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))
      const isCORSError = error.message?.includes('CORS') || error.message?.includes('blocked')
      
      if (!isNetworkError && !isCORSError) {
        console.error('Error en notificacionService.getNotificaciones:', error)
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener notificaciones',
        data: null
      }
    }
  },

  /**
   * Contar notificaciones no leídas
   * @returns {Promise<object>} Contador de no leídas
   */
  async contarNoLeidas() {
    try {
      const response = await get('/notificaciones/no-leidas')
      
      if (response.data.success) {
        return {
          success: true,
          count: response.data.data.count || 0
        }
      } else {
        return {
          success: false,
          count: 0
        }
      }
    } catch (error) {
      return {
        success: false,
        count: 0
      }
    }
  },

  /**
   * Marcar notificación como leída
   * @param {number} id - ID de la notificación
   * @returns {Promise<object>} Resultado de la operación
   */
  async marcarLeida(id) {
    try {
      const response = await put(`/notificaciones/${id}/marcar-leida`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Notificación marcada como leída'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al marcar notificación'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al marcar notificación'
      }
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   * @returns {Promise<object>} Resultado de la operación
   */
  async marcarTodasLeidas() {
    try {
      const response = await put('/notificaciones/marcar-todas-leidas')
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Todas las notificaciones marcadas como leídas'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al marcar notificaciones'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al marcar notificaciones'
      }
    }
  },

  /**
   * Eliminar notificación
   * @param {number} id - ID de la notificación
   * @returns {Promise<object>} Resultado de la operación
   */
  async eliminarNotificacion(id) {
    try {
      const response = await del(`/notificaciones/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Notificación eliminada exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al eliminar notificación'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al eliminar notificación'
      }
    }
  },

  /**
   * Marcar alerta del panel (Consult-360) como leída según el rol del usuario.
   * @param {number} id - ID de la alerta
   * @param {string} roleOrTipo - Rol normalizado o tipo backend
   */
  async marcarAlertaLeida(id, roleOrTipo) {
    const base = baseUrlAlertasPorRol(roleOrTipo)
    if (!base) {
      return { success: false, message: 'Rol no soportado para alertas.' }
    }
    try {
      const response = await patch(`${base}/${id}/marcar-leida`, {})
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Marcada como leída.',
        }
      }
      return {
        success: false,
        message: response.data?.message || 'No se pudo marcar como leída.',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al marcar como leída.',
      }
    }
  },

  /**
   * Marcar todas las alertas visibles para el rol como leídas.
   * @param {string} roleOrTipo
   */
  async marcarTodasAlertasLeidas(roleOrTipo) {
    const base = baseUrlAlertasPorRol(roleOrTipo)
    if (!base) {
      return { success: false, message: 'Rol no soportado para alertas.' }
    }
    try {
      const response = await patch(`${base}/marcar-todas-leidas`, {})
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Marcadas como leídas.',
        }
      }
      return {
        success: false,
        message: response.data?.message || 'No se pudo completar.',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al marcar como leídas.',
      }
    }
  },
}

