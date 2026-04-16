// Servicio de gestión de bitácora

import { get } from './api'

export const bitacoraService = {
  /**
   * Obtener lista de registros de bitácora con paginación
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Lista paginada de registros
   */
  async getBitacora(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 50,
        usuario_id: params.usuario_id || '',
        tabla: params.tabla || '',
        transaccion: params.transaccion || '',
        fecha_desde: params.fecha_desde || '',
        fecha_hasta: params.fecha_hasta || '',
        recientes: params.recientes || false
      }

      // Limpiar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === false || queryParams[key] === null) {
          delete queryParams[key]
        }
      })

      const response = await get('/admin/bitacora', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener registros de bitácora'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener registros de bitácora'
      }
    }
  },

  /**
   * Obtener registro de bitácora por ID
   * @param {number} id - ID del registro
   * @returns {Promise<object>} Registro de bitácora
   */
  async getRegistro(id) {
    try {
      const response = await get(`/admin/bitacora/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Registro no encontrado'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener registro'
      }
    }
  },

  /**
   * Obtener estadísticas de bitácora
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Estadísticas
   */
  async getEstadisticas(params = {}) {
    try {
      const queryParams = {
        fecha_desde: params.fecha_desde || '',
        fecha_hasta: params.fecha_hasta || ''
      }

      // Limpiar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null) {
          delete queryParams[key]
        }
      })

      const response = await get('/admin/bitacora/estadisticas', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener estadísticas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener estadísticas'
      }
    }
  }
}

