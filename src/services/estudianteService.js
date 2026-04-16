// Servicio de gestión de estudiantes

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio para gestión de estudiantes
 */
export const estudianteService = {
  async getEstudiantes(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || ''
      }

      if (!queryParams.search) delete queryParams.search

      const response = await get('/admin/estudiantes', queryParams)
      
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
      console.error('Error fetching estudiantes:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getEstudianteById(id) {
    try {
      const response = await get(`/admin/estudiantes/${id}`)
      
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
      console.error('Error fetching estudiante:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createEstudiante(data) {
    try {
      const response = await post('/admin/estudiantes', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_CREATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error creating estudiante:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateEstudiante(id, data) {
    try {
      const response = await put(`/admin/estudiantes/${id}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_UPDATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error updating estudiante:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async activarEstudiante(id) {
    try {
      const response = await post(`/admin/estudiantes/${id}/activar`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Estudiante activado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al activar estudiante'
        }
      }
    } catch (error) {
      console.error('Error activating estudiante:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al activar estudiante'
      }
    }
  },

  async desactivarEstudiante(id) {
    try {
      const response = await post(`/admin/estudiantes/${id}/desactivar`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Estudiante desactivado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al desactivar estudiante'
        }
      }
    } catch (error) {
      console.error('Error deactivating estudiante:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al desactivar estudiante'
      }
    }
  },

  async removeEstudiante(id) {
    try {
      const response = await del(`/admin/estudiantes/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_DELETE
        }
      }
    } catch (error) {
      console.error('Error removing estudiante:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

