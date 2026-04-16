/**
 * API administrador LaboraConsult — registro y seguimiento de empresas consultoras (Fase 1 del flujo).
 * Misma estructura de petición que el servicio anterior: query limpio, { success, data, message }.
 */

import { get, post, put, patch } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

function stripEmpty(params) {
  const out = { ...params }
  Object.keys(out).forEach((key) => {
    if (out[key] === '' || out[key] === null || out[key] === undefined) {
      delete out[key]
    }
  })
  return out
}

export const adminInscripcionService = {
  /**
   * Lista empresas consultoras (panel admin).
   * GET /admin/empresas-consultoras
   */
  async getConsultoras(params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        estado: params.estado || '',
        sort_by: params.sort_by || 'creado_en',
        sort_direction: params.sort_direction || 'desc',
      })

      const response = await get('/admin/empresas-consultoras', queryParams)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR_FETCH,
      }
    } catch (error) {
      console.error('Error fetching consultoras:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },

  /**
   * Detalle de una consultora (admin).
   * GET /admin/empresas-consultoras/:id
   */
  async getConsultoraById(id) {
    try {
      const response = await get(`/admin/empresas-consultoras/${id}`)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR_FETCH,
      }
    } catch (error) {
      console.error('Error fetching consultora:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },

  /**
   * Actualiza datos de la consultora y correo del titular.
   * PUT /admin/empresas-consultoras/:id
   */
  async updateConsultora(id, payload) {
    try {
      const response = await put(`/admin/empresas-consultoras/${id}`, payload)
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    }
  },

  /**
   * Registra nueva consultora (Fase 1 — administrador).
   * POST /admin/empresas-consultoras
   */
  async createConsultora(payload) {
    try {
      const response = await post('/admin/empresas-consultoras', payload)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    } catch (error) {
      console.error('Error creating consultora:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    }
  },

  /**
   * Reenvía / expone enlace de activación (si el backend lo soporta).
   * POST /admin/empresas-consultoras/:id/reenviar-activacion
   */
  /**
   * Habilitar / deshabilitar acceso al portal del usuario titular de la consultora.
   * PATCH /admin/empresas-consultoras/:id/acceso-usuario
   */
  async patchConsultoraAccesoUsuario(id, payload) {
    try {
      const response = await patch(`/admin/empresas-consultoras/${id}/acceso-usuario`, payload)
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    }
  },

  async reenviarActivacionConsultora(id) {
    try {
      const response = await post(`/admin/empresas-consultoras/${id}/reenviar-activacion`, {})

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR,
      }
    }
  },

  /**
   * Métricas globales del panel admin.
   * GET /admin/estadisticas
   */
  async getEstadisticas() {
    try {
      const response = await get('/admin/estadisticas')

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR_FETCH,
      }
    } catch (error) {
      console.error('Error fetching estadisticas admin:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },
}
