// Servicio de gestión de materias

import { get, post, put, del, upload } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

export const materiaService = {
  async getMaterias(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'nombre',
        sort_direction: params.sort_direction || 'asc',
        gestion_id: params.gestion_id || '',
        estado: params.estado || ''
      }

      const response = await get('/materias', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener materias'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener materias'
      }
    }
  },

  async getMateria(id) {
    try {
      const response = await get(`/materias/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Materia no encontrada'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener materia'
      }
    }
  },

  async createMateria(data) {
    try {
      const response = await post('/materias', data)
      
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

  async updateMateria(id, data) {
    try {
      const response = await put(`/materias/${id}`, data)
      
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

  async deleteMateria(id) {
    try {
      const response = await del(`/materias/${id}`)
      
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
   * Buscar materias (para autocomplete)
   * @param {string} termino - Término de búsqueda
   * @returns {Promise<object>} Lista de materias encontradas
   */
  async searchMaterias(termino) {
    try {
      const response = await get('/materias/search', { q: termino })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en la búsqueda'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error en la búsqueda'
      }
    }
  },

  /**
   * Exportar materias a CSV/Excel
   * @param {object} params - Parámetros de exportación
   * @returns {Promise<object>} Resultado de la exportación
   */
  async exportarMaterias(params = {}) {
    try {
      // Obtener todas las materias sin paginación para exportar
      const queryParams = {
        page: 1,
        per_page: 10000,
        search: params.search || '',
        nivel: params.nivel || '',
        semestre: params.semestre || '',
        activa: params.activa || ''
      }

      // Solo agregar filtros si tienen valor
      if (!queryParams.search) delete queryParams.search
      if (!queryParams.nivel) delete queryParams.nivel
      if (!queryParams.semestre) delete queryParams.semestre
      if (queryParams.activa === '') delete queryParams.activa

      const response = await get('/materias', queryParams)
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data.data || [],
          message: 'Materias exportadas exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al exportar materias'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al exportar materias'
      }
    }
  },

  /**
   * Importar materias desde archivo Excel/CSV
   * @param {File} file - Archivo a importar
   * @returns {Promise<object>} Resultado de la importación
   */
  async importarMaterias(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await upload('/materias/import', formData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Materias importadas exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al importar materias',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al importar materias',
        errors: error.response?.data?.errors
      }
    }
  }
}
