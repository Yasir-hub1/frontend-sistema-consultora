import { get } from './api'

export const auditoriaService = {
  /**
   * Obtener registros de auditoría
   * @param {object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.per_page - Elementos por página
   * @param {string} params.modelo - Filtrar por modelo
   * @param {string} params.accion - Filtrar por acción
   * @param {number} params.user_id - Filtrar por usuario
   * @param {string} params.fecha_inicio - Fecha inicio
   * @param {string} params.fecha_fin - Fecha fin
   * @returns {Promise<object>} Lista de registros de auditoría
   */
  async getAuditoria(params = {}) {
    try {
      const response = await get('/auditoria', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener auditoría'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener auditoría'
      }
    }
  },

  /**
   * Obtener auditoría por modelo
   * @param {string} modelo - Nombre del modelo
   * @param {object} params - Parámetros adicionales
   * @returns {Promise<object>} Lista de registros de auditoría del modelo
   */
  async getAuditoriaPorModelo(modelo, params = {}) {
    try {
      const response = await get(`/auditoria/modelo/${modelo}`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener auditoría'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener auditoría'
      }
    }
  }
}

