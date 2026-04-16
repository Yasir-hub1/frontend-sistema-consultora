// Servicio de gestión de aulas

import { get, post, put, del, upload } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

export const aulaService = {
  async getAulas(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        sort_by: params.sort_by || 'nombre',
        sort_direction: params.sort_direction || 'asc'
      }

      // Solo agregar filtros si tienen valor
      if (params.search && params.search.trim() !== '') {
        queryParams.search = params.search.trim()
      }
      if (params.tipo && params.tipo !== '') {
        queryParams.tipo = params.tipo
      }
      if (params.edificio && params.edificio.trim() !== '') {
        queryParams.edificio = params.edificio.trim()
      }
      if (params.activa !== undefined && params.activa !== null && params.activa !== '') {
        queryParams.activa = params.activa
      }

      const response = await get('/aulas', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener aulas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener aulas'
      }
    }
  },

  async getAula(id) {
    try {
      const response = await get(`/aulas/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Aula no encontrada'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener aula'
      }
    }
  },

  async createAula(data) {
    try {
      const response = await post('/aulas', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS.SAVE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR.SAVE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || MESSAGES.ERROR.SAVE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateAula(id, data) {
    try {
      const response = await put(`/aulas/${id}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS.UPDATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR.UPDATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || MESSAGES.ERROR.UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async deleteAula(id) {
    try {
      const response = await del(`/aulas/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || MESSAGES.SUCCESS.DELETE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR.DELETE
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || MESSAGES.ERROR.DELETE
      }
    }
  },

  /**
   * Obtener aulas disponibles para un horario específico
   * @param {object} params - Parámetros de consulta
   * @param {number} params.dia_semana - Día de la semana (1-6)
   * @param {string} params.hora_inicio - Hora de inicio (H:i)
   * @param {string} params.hora_fin - Hora de fin (H:i)
   * @param {number} params.horario_id - ID del horario a excluir (opcional)
   * @returns {Promise<object>} Lista de aulas disponibles
   */
  async getAulasDisponibles(params) {
    try {
      const response = await get('/aulas/disponibles', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener aulas disponibles'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener aulas disponibles'
      }
    }
  },

  /**
   * Obtener ocupación de un aula
   * @param {number} id - ID del aula
   * @param {object} params - Parámetros de consulta
   * @param {number} params.dia - Día específico (opcional)
   * @returns {Promise<object>} Ocupación del aula
   */
  async getOcupacion(id, params = {}) {
    try {
      const response = await get(`/aulas/${id}/ocupacion`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener ocupación del aula'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener ocupación del aula'
      }
    }
  },

  /**
   * Exportar aulas a CSV/Excel
   * @param {object} params - Parámetros de exportación
   * @returns {Promise<object>} Resultado de la exportación
   */
  async exportarAulas(params = {}) {
    try {
      // Obtener todas las aulas sin paginación para exportar
      const queryParams = {
        page: 1,
        per_page: 10000,
        search: params.search || '',
        tipo: params.tipo || '',
        edificio: params.edificio || '',
        activa: params.activa || ''
      }

      // Solo agregar filtros si tienen valor
      if (!queryParams.search) delete queryParams.search
      if (!queryParams.tipo) delete queryParams.tipo
      if (!queryParams.edificio) delete queryParams.edificio
      if (queryParams.activa === '') delete queryParams.activa

      const response = await get('/aulas', queryParams)
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data.data || [],
          message: 'Aulas exportadas exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al exportar aulas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al exportar aulas'
      }
    }
  },

  /**
   * Importar aulas desde archivo Excel/CSV
   * @param {File} file - Archivo a importar
   * @returns {Promise<object>} Resultado de la importación
   */
  async importarAulas(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await upload('/aulas/import', formData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Aulas importadas exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al importar aulas',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al importar aulas',
        errors: error.response?.data?.errors
      }
    }
  }
}
