// Servicio de gestión de pagos para administradores

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio para gestión de pagos (Admin)
 */
export const gestionPagoService = {
  async get(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        estado: params.estado || '',
        fecha_desde: params.fecha_desde || '',
        fecha_hasta: params.fecha_hasta || ''
      }

      if (!queryParams.search) delete queryParams.search
      if (!queryParams.estado) delete queryParams.estado
      if (!queryParams.fecha_desde) delete queryParams.fecha_desde
      if (!queryParams.fecha_hasta) delete queryParams.fecha_hasta

      const response = await get('/admin/pagos/gestion', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_FETCH
        }
      }
    } catch (error) {
      console.error('Error fetching planes de pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getById(id) {
    try {
      const response = await get(`/admin/pagos/gestion/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_FETCH
        }
      }
    } catch (error) {
      console.error('Error fetching plan de pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async registrarPago(data) {
    try {
      const response = await post('/admin/pagos/gestion/registrar', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Pago registrado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al registrar pago',
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error registrando pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar pago',
        errors: error.response?.data?.errors
      }
    }
  },

  async actualizarPago(pagoId, data) {
    try {
      const response = await put(`/admin/pagos/gestion/${pagoId}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Pago actualizado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al actualizar pago',
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error actualizando pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar pago',
        errors: error.response?.data?.errors
      }
    }
  },

  async eliminarPago(pagoId) {
    try {
      const response = await del(`/admin/pagos/gestion/${pagoId}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Pago eliminado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al eliminar pago'
        }
      }
    } catch (error) {
      console.error('Error eliminando pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar pago'
      }
    }
  },

  async aplicarPenalidad(data) {
    try {
      const response = await post('/admin/pagos/gestion/aplicar-penalidad', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Penalidad aplicada exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al aplicar penalidad',
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error aplicando penalidad:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al aplicar penalidad',
        errors: error.response?.data?.errors
      }
    }
  }
}

