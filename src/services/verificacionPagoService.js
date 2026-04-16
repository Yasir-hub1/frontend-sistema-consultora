import { get, post } from './api'

/**
 * Servicio para verificación de pagos (Admin)
 */
export const verificacionPagoService = {
  /**
   * Listar pagos pendientes de verificación
   */
  async listar(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 15,
        search: params.search || '',
        metodo: params.metodo || '',
        estudiante_id: params.estudiante_id || ''
      }

      // Eliminar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key]
        }
      })

      const response = await get('/admin/pagos/verificacion', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          resumen: response.data.resumen,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener pagos'
        }
      }
    } catch (error) {
      console.error('Error fetching pagos:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener pagos'
      }
    }
  },

  /**
   * Obtener detalle de un pago
   */
  async obtener(pagoId) {
    try {
      const response = await get(`/admin/pagos/verificacion/${pagoId}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener pago'
        }
      }
    } catch (error) {
      console.error('Error fetching pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener pago'
      }
    }
  },

  /**
   * Aprobar/verificar un pago
   */
  async aprobar(pagoId, observaciones = '') {
    try {
      const response = await post(`/admin/pagos/verificacion/${pagoId}/aprobar`, {
        observaciones
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Pago aprobado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al aprobar pago'
        }
      }
    } catch (error) {
      console.error('Error aprobando pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al aprobar pago'
      }
    }
  },

  /**
   * Rechazar un pago
   */
  async rechazar(pagoId, motivo) {
    try {
      const response = await post(`/admin/pagos/verificacion/${pagoId}/rechazar`, {
        motivo
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Pago rechazado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al rechazar pago'
        }
      }
    } catch (error) {
      console.error('Error rechazando pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al rechazar pago',
        errors: error.response?.data?.errors
      }
    }
  },

  /**
   * Obtener resumen de pagos verificados
   */
  async obtenerResumenVerificados(params = {}) {
    try {
      const queryParams = {
        fecha_inicio: params.fecha_inicio || '',
        fecha_fin: params.fecha_fin || ''
      }

      // Eliminar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '') {
          delete queryParams[key]
        }
      })

      const response = await get('/admin/pagos/verificacion/resumen/verificados', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener resumen'
        }
      }
    } catch (error) {
      console.error('Error fetching resumen:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener resumen'
      }
    }
  }
}

