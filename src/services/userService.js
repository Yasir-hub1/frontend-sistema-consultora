// Servicio de gestión de usuarios

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

export const userService = {
  /**
   * Obtener lista de usuarios con paginación
   */
  async getUsers(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
      }
      
      // Solo agregar filtros si tienen valor
      if (params.search && params.search.trim() !== '') {
        queryParams.search = params.search.trim()
      }
      if (params.rol_id && params.rol_id !== '') {
        queryParams.rol_id = params.rol_id
      }
      if (params.activo !== undefined && params.activo !== null && params.activo !== '') {
        queryParams.activo = params.activo
      }

      const response = await get('/usuarios', queryParams)
      
      // El backend devuelve: { success: true, data: { data: [...], last_page: 1, ... } }
      // response.data es: { success: true, data: { data: [...], last_page: 1, ... } }
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data, // Objeto paginado completo { data: [...], last_page: 1, ... }
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al obtener usuarios',
          data: null
        }
      }
    } catch (error) {
      console.error('Error en userService.getUsers:', error)
      console.error('Response error:', error.response?.data)
      console.error('Status:', error.response?.status)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener usuarios',
        data: null
      }
    }
  },

  /**
   * Obtener usuario por ID
   */
  async getUser(id) {
    try {
      const response = await get(`/usuarios/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Usuario no encontrado'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener usuario'
      }
    }
  },

  /**
   * Crear nuevo usuario
   */
  async createUser(data) {
    try {
      const response = await post('/usuarios', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS.SAVE,
          errors: null
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

  /**
   * Actualizar usuario
   */
  async updateUser(id, data) {
    try {
      const response = await put(`/usuarios/${id}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS.UPDATE,
          errors: null
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

  /**
   * Eliminar usuario
   */
  async deleteUser(id) {
    try {
      const response = await del(`/usuarios/${id}`)
      
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
   * Toggle estado del usuario (activar/desactivar)
   */
  async toggleStatus(id) {
    try {
      const response = await put(`/usuarios/${id}/toggle-status`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Estado actualizado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al actualizar el estado'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al actualizar el estado'
      }
    }
  },

  /**
   * Importar usuarios desde archivo Excel/CSV
   */
  async importUsers(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Para FormData, no especificar Content-Type manualmente, axios lo maneja automáticamente
      const response = await post('/usuarios/import', formData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Usuarios importados exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al importar usuarios',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al importar usuarios',
        errors: error.response?.data?.errors
      }
    }
  },

  /**
   * Exportar usuarios a CSV/Excel
   */
  async exportUsers(params = {}) {
    try {
      const queryParams = {
        page: 1,
        per_page: 10000
      }
      
      if (params.search && params.search.trim() !== '') {
        queryParams.search = params.search.trim()
      }
      if (params.rol_id && params.rol_id !== '') {
        queryParams.rol_id = params.rol_id
      }
      if (params.activo !== undefined && params.activo !== null && params.activo !== '') {
        queryParams.activo = params.activo
      }

      const response = await get('/usuarios', queryParams)
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data.data || []
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al exportar usuarios'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al exportar usuarios'
      }
    }
  }
}

