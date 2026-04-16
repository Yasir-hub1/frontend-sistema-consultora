// Servicio de gestión de planes de pago y pagos

import { get, post, put, del, upload } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio para gestión de planes de pago (Admin)
 */
export const planPagoService = {
  async get(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        programa_id: params.programa_id || ''
      }

      if (!queryParams.search) delete queryParams.search
      if (!queryParams.programa_id) delete queryParams.programa_id

      const response = await get('/admin/planes-pago', queryParams)
      
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
      console.error('Error fetching planes pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getById(id) {
    try {
      const response = await get(`/admin/planes-pago/${id}`)
      
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
      console.error('Error fetching plan pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getDatosFormulario() {
    try {
      const response = await get('/admin/planes-pago/datos-formulario')
      
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
      console.error('Error fetching datos formulario:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async create(data) {
    try {
      const response = await post('/admin/planes-pago', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS_CREATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_CREATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error creating plan pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async update(id, data) {
    try {
      const response = await put(`/admin/planes-pago/${id}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS_UPDATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_UPDATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error updating plan pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async remove(id) {
    try {
      const response = await del(`/admin/planes-pago/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || MESSAGES.SUCCESS_DELETE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_DELETE
        }
      }
    } catch (error) {
      console.error('Error deleting plan pago:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de descuentos (Admin)
 */
export const descuentoService = {
  async get(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || ''
      }

      if (!queryParams.search) delete queryParams.search

      const response = await get('/admin/descuentos', queryParams)
      
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
      console.error('Error fetching descuentos:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getInscripcionesSinDescuento() {
    try {
      const response = await get('/admin/descuentos/inscripciones-sin-descuento')
      
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
      console.error('Error fetching inscripciones sin descuento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getById(id) {
    try {
      const response = await get(`/admin/descuentos/${id}`)
      
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
      console.error('Error fetching descuento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async create(data) {
    try {
      const response = await post('/admin/descuentos', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS_CREATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_CREATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error creating descuento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async update(id, data) {
    try {
      const response = await put(`/admin/descuentos/${id}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS_UPDATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_UPDATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error updating descuento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async remove(id) {
    try {
      const response = await del(`/admin/descuentos/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || MESSAGES.SUCCESS_DELETE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_DELETE
        }
      }
    } catch (error) {
      console.error('Error deleting descuento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de pagos (Estudiante)
 */
export const estudiantePagoService = {
  async getMisCuotas() {
    try {
      const response = await get('/estudiante/pagos')
      
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
      console.error('Error fetching mis cuotas:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getCuotaById(cuotaId) {
    try {
      const response = await get(`/estudiante/pagos/${cuotaId}`)
      
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
      console.error('Error fetching cuota:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async registrarPago(cuotaId, monto, metodo, comprobante, token = null) {
    try {
      const formData = new FormData()
      formData.append('cuota_id', cuotaId)
      formData.append('monto', monto)
      formData.append('metodo', metodo)
      formData.append('comprobante', comprobante)
      if (token) {
        formData.append('token', token)
      }

      const response = await upload('/estudiante/pagos', formData)
      
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

  async getInfoQR(cuotaId) {
    try {
      const response = await get(`/estudiante/pagos/${cuotaId}/info-qr`)
      
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
      console.error('Error fetching QR info:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async generarPagoQR(cuotaId, monto) {
    try {
      const response = await post('/estudiante/pagos', {
        cuota_id: cuotaId,
        monto: monto,
        metodo: 'QR'
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al generar QR',
          error: response.data.error || response.data.message,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error generando QR:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Error al generar QR'
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
        errors: error.response?.data?.errors
      }
    }
  },

  async consultarEstadoQR(pagoId) {
    try {
      const response = await get(`/estudiante/pagos/${pagoId}/consultar-estado-qr`)
      
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
      console.error('Error consultando estado QR:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async subirComprobanteQR(pagoId, comprobante) {
    try {
      const formData = new FormData()
      formData.append('comprobante', comprobante)

      const response = await upload(`/estudiante/pagos/${pagoId}/subir-comprobante-qr`, formData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Comprobante subido exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al subir comprobante',
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error subiendo comprobante:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al subir comprobante',
        errors: error.response?.data?.errors
      }
    }
  }
}

