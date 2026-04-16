// Servicio de estadísticas de rendimiento académico

import { get } from './api'
import { MESSAGES } from '../utils/constants'

/**
 * Servicio para estadísticas de rendimiento (Admin)
 */
export const estadisticasRendimientoService = {
  async getPorGrupo(grupoId) {
    try {
      const response = await get('/admin/estadisticas-rendimiento/por-grupo', { grupo_id: grupoId })
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getPorDocente(registroDocente) {
    try {
      const response = await get('/admin/estadisticas-rendimiento/por-docente', { registro_docente: registroDocente })
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getPorModulo(moduloId) {
    try {
      const response = await get('/admin/estadisticas-rendimiento/por-modulo', { modulo_id: moduloId })
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getResumenGeneral() {
    try {
      const response = await get('/admin/estadisticas-rendimiento/resumen-general')
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

