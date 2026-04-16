// Servicio de gestión de permisos

import { get } from './api'

export const permisoService = {
  /**
   * Obtener lista de permisos
   */
  async getPermisos(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 100,
        search: params.search || '',
        modulo: params.modulo || ''
      }

      const response = await get('/admin/permisos', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener permisos'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener permisos'
      }
    }
  },

  /**
   * Obtener permisos agrupados por módulo
   */
  async getPermisosPorModulo() {
    try {
      const response = await get('/admin/permisos/agrupados')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener permisos'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener permisos'
      }
    }
  }
}

