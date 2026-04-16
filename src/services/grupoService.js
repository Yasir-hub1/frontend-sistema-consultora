// Servicio de gestión de grupos

import { get, post, put, del, upload } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

export const grupoService = {
  async getGrupos(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        sort_by: params.sort_by || 'codigo',
        sort_direction: params.sort_direction || 'asc'
      }

      // Solo agregar filtros si tienen valor
      if (params.search && params.search.trim() !== '') {
        queryParams.search = params.search.trim()
      }
      if (params.gestion_id && params.gestion_id !== '') {
        queryParams.gestion_id = params.gestion_id
      }
      if (params.materia_id && params.materia_id !== '') {
        queryParams.materia_id = params.materia_id
      }
      if (params.activo !== undefined && params.activo !== null && params.activo !== '') {
        queryParams.activo = params.activo
      }

      const response = await get('/admin/grupos', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener grupos'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener grupos'
      }
    }
  },

  async getGrupo(id) {
    try {
      const response = await get(`/admin/grupos/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Grupo no encontrado'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener grupo'
      }
    }
  },

  async createGrupo(data) {
    try {
      const response = await post('/admin/grupos', data)
      
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

  async updateGrupo(id, data) {
    try {
      const response = await put(`/admin/grupos/${id}`, data)
      
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

  async deleteGrupo(id) {
    try {
      const response = await del(`/admin/grupos/${id}`)

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
   * Obtener datos para formularios (programas, docentes, horarios)
   * Nota: Los módulos se obtienen por programa
   * @returns {Promise<object>} Datos para formularios
   */
  async getDatosFormulario() {
    try {
      const response = await get('/admin/grupos/datos-formulario')

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener datos del formulario'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener datos del formulario'
      }
    }
  },

  /**
   * Obtener módulos por programa
   * @param {number} programaId - ID del programa
   * @returns {Promise<object>} Módulos del programa
   */
  async getModulosPorPrograma(programaId) {
    try {
      const response = await get(`/admin/grupos/modulos-por-programa/${programaId}`)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener módulos del programa'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener módulos del programa'
      }
    }
  },

  /**
   * Obtener grupos por gestión académica
   * @param {number} gestionId - ID de la gestión académica
   * @returns {Promise<object>} Grupos de la gestión
   */
  async getGruposPorGestion(gestionId) {
    try {
      const response = await get(`/admin/grupos`, { gestion_id: gestionId })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener grupos de la gestión'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener grupos de la gestión'
      }
    }
  },

  /**
   * Exportar grupos a CSV/Excel
   * @param {object} params - Parámetros de exportación
   * @returns {Promise<object>} Resultado de la exportación
   */
  async exportarGrupos(params = {}) {
    try {
      // Obtener todos los grupos sin paginación para exportar
      const queryParams = {
        page: 1,
        per_page: 10000,
        search: params.search || '',
        gestion_id: params.gestion_id || '',
        materia_id: params.materia_id || '',
        activo: params.activo || ''
      }

      // Solo agregar filtros si tienen valor
      if (!queryParams.search) delete queryParams.search
      if (!queryParams.gestion_id) delete queryParams.gestion_id
      if (!queryParams.materia_id) delete queryParams.materia_id
      if (queryParams.activo === '') delete queryParams.activo

      const response = await get('/admin/grupos', queryParams)
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data.data || [],
          message: 'Grupos exportados exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al exportar grupos'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al exportar grupos'
      }
    }
  },

  /**
   * Importar grupos desde archivo Excel/CSV
   * @param {File} file - Archivo a importar
   * @returns {Promise<object>} Resultado de la importación
   */
  async importarGrupos(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await upload('/admin/grupos/import', formData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Grupos importados exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al importar grupos',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al importar grupos',
        errors: error.response?.data?.errors
      }
    }
  }
}
