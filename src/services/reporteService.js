// Servicio de reportes y bitácora

import { get } from './api'
import { MESSAGES } from '../utils/constants'

/**
 * Servicio para generación de reportes (Admin)
 */
export const reporteService = {
  async getConveniosActivos(params = {}) {
    try {
      const response = await get('/admin/reportes/convenios-activos', params)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getProgramasOfrecidos(params = {}) {
    try {
      const response = await get('/admin/reportes/programas-ofrecidos', params)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getEstadoAcademicoEstudiantes(params = {}) {
    try {
      const response = await get('/admin/reportes/estado-academico-estudiantes', params)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getMovimientosFinancieros(params = {}) {
    try {
      const response = await get('/admin/reportes/movimientos-financieros', params)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getActividadPorUsuario(params = {}) {
    try {
      const response = await get('/admin/reportes/actividad-usuario', params)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getActividadPorInstitucion(params = {}) {
    try {
      const response = await get('/admin/reportes/actividad-institucion', params)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getDatosFormulario() {
    try {
      const response = await get('/admin/reportes/datos-formulario')
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  }
}
