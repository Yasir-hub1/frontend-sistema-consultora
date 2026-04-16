// Servicio de gestión de roles

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

export const roleService = {
  /**
   * Obtener lista de roles con paginación
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Lista paginada de roles
   */
  async getRoles(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'nombre',
        sort_order: params.sort_order || 'asc'
      }

      const response = await get('/admin/roles', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener roles'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener roles'
      }
    }
  },

  /**
   * Obtener todos los roles sin paginación (para selects)
   * @returns {Promise<object>} Lista de roles
   */
  async getAllRoles() {
    try {
      const response = await get('/admin/roles/all')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener roles'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener roles'
      }
    }
  },

  /**
   * Obtener rol por ID
   * @param {number} id - ID del rol
   * @returns {Promise<object>} Datos del rol
   */
  async getRole(id) {
    try {
      const response = await get(`/admin/roles/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Rol no encontrado'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener rol'
      }
    }
  },

  /**
   * Obtener permisos disponibles
   */
  async getPermisos() {
    try {
      const response = await get('/admin/permisos')
      
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
  },

  /**
   * Obtener permisos agrupados por módulo
   */
  async getPermisosAgrupados() {
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
          message: response.data.message || 'Error al obtener permisos agrupados'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener permisos agrupados'
      }
    }
  },

  /**
   * Crear nuevo rol
   * @param {object} data - Datos del rol (nombre_rol, descripcion, permisos)
   * @returns {Promise<object>} Rol creado
   */
  async createRole(data) {
    try {
      // Mapear nombre a nombre_rol si es necesario
      const datosBackend = {
        nombre_rol: data.nombre_rol || data.nombre,
        descripcion: data.descripcion || '',
        activo: data.activo !== undefined ? data.activo : true
      }
      
      const response = await post('/admin/roles', datosBackend)
      
      // Si hay permisos, asignarlos después de crear el rol
      if (data.permisos && Array.isArray(data.permisos) && data.permisos.length > 0 && response.data.success) {
        const rolId = response.data.data?.rol_id || response.data.data?.id
        if (rolId) {
          await this.asignarPermisos(rolId, data.permisos)
        }
      }
      
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
   * Actualizar rol
   * @param {number} id - ID del rol
   * @param {object} data - Datos actualizados (nombre_rol, descripcion, permisos)
   * @returns {Promise<object>} Rol actualizado
   */
  async updateRole(id, data) {
    try {
      // Mapear nombre a nombre_rol si es necesario
      const datosBackend = {
        nombre_rol: data.nombre_rol || data.nombre,
        descripcion: data.descripcion || '',
        activo: data.activo !== undefined ? data.activo : true
      }
      
      const response = await put(`/admin/roles/${id}`, datosBackend)
      
      // Si hay permisos, asignarlos después de actualizar el rol
      if (data.permisos && Array.isArray(data.permisos) && data.permisos.length >= 0) {
        await this.asignarPermisos(id, data.permisos)
      }
      
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
   * Asignar permisos a un rol
   */
  async asignarPermisos(roleId, permisosIds) {
    try {
      const response = await post(`/admin/roles/${roleId}/permisos`, { permisos: permisosIds })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Permisos asignados exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al asignar permisos',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al asignar permisos',
        errors: error.response?.data?.errors
      }
    }
  },

  /**
   * Eliminar rol
   * @param {number} id - ID del rol
   * @returns {Promise<object>} Respuesta de eliminación
   */
  async deleteRole(id) {
    try {
      const response = await del(`/admin/roles/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: MESSAGES.SUCCESS.DELETE
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
        message: error.message || MESSAGES.ERROR.DELETE
      }
    }
  }
}

