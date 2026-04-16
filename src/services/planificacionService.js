// Servicio de gestión de planificación académica

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio para gestión de ramas académicas
 */
export const ramaAcademicaService = {
  async getRamasAcademicas(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'nombre',
        sort_direction: params.sort_direction || 'asc'
      }

      if (!queryParams.search) delete queryParams.search

      const response = await get('/admin/ramas-academicas', queryParams)
      
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
      console.error('Error fetching ramas académicas:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getRamaAcademicaById(id) {
    try {
      const response = await get(`/admin/ramas-academicas/${id}`)
      
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
      console.error('Error fetching rama académica:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createRamaAcademica(data) {
    try {
      const response = await post('/admin/ramas-academicas', data)
      
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
      console.error('Error creating rama académica:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateRamaAcademica(id, data) {
    try {
      const response = await put(`/admin/ramas-academicas/${id}`, data)
      
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
      console.error('Error updating rama académica:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removeRamaAcademica(id) {
    try {
      const response = await del(`/admin/ramas-academicas/${id}`)
      
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
      console.error('Error removing rama académica:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de versiones
 */
export const versionService = {
  async getVersiones(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        año: params.año || '',
        sort_by: params.sort_by || 'año',
        sort_direction: params.sort_direction || 'desc'
      }

      if (!queryParams.search) delete queryParams.search
      if (!queryParams.año) delete queryParams.año

      const response = await get('/admin/versiones', queryParams)
      
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
      console.error('Error fetching versiones:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getVersionById(id) {
    try {
      const response = await get(`/admin/versiones/${id}`)
      
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
      console.error('Error fetching versión:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createVersion(data) {
    try {
      const response = await post('/admin/versiones', data)
      
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
      console.error('Error creating versión:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateVersion(id, data) {
    try {
      const response = await put(`/admin/versiones/${id}`, data)
      
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
      console.error('Error updating versión:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removeVersion(id) {
    try {
      const response = await del(`/admin/versiones/${id}`)
      
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
      console.error('Error removing versión:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de tipos de programa
 */
export const tipoProgramaService = {
  async getTiposPrograma(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'nombre',
        sort_direction: params.sort_direction || 'asc'
      }

      if (!queryParams.search) delete queryParams.search

      const response = await get('/admin/tipos-programa', queryParams)
      
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
      console.error('Error fetching tipos de programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getTipoProgramaById(id) {
    try {
      const response = await get(`/admin/tipos-programa/${id}`)
      
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
      console.error('Error fetching tipo de programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createTipoPrograma(data) {
    try {
      const response = await post('/admin/tipos-programa', data)
      
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
      console.error('Error creating tipo de programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateTipoPrograma(id, data) {
    try {
      const response = await put(`/admin/tipos-programa/${id}`, data)
      
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
      console.error('Error updating tipo de programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removeTipoPrograma(id) {
    try {
      const response = await del(`/admin/tipos-programa/${id}`)
      
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
      console.error('Error removing tipo de programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de módulos
 */
export const moduloService = {
  async getModulos(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'nombre',
        sort_direction: params.sort_direction || 'asc'
      }

      if (!queryParams.search) delete queryParams.search

      const response = await get('/admin/modulos', queryParams)
      
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
      console.error('Error fetching módulos:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getModuloById(id) {
    try {
      const response = await get(`/admin/modulos/${id}`)
      
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
      console.error('Error fetching módulo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createModulo(data) {
    try {
      const response = await post('/admin/modulos', data)
      
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
      console.error('Error creating módulo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateModulo(id, data) {
    try {
      const response = await put(`/admin/modulos/${id}`, data)
      
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
      console.error('Error updating módulo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removeModulo(id) {
    try {
      const response = await del(`/admin/modulos/${id}`)
      
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
      console.error('Error removing módulo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de programas
 */
export const programaService = {
  async getProgramas(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        rama_academica_id: params.rama_academica_id || '',
        tipo_programa_id: params.tipo_programa_id || '',
        version_id: params.version_id || '',
        institucion_id: params.institucion_id || '',
        sort_by: params.sort_by || 'nombre',
        sort_direction: params.sort_direction || 'asc'
      }

      // Eliminar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '') delete queryParams[key]
      })

      const response = await get('/admin/programas', queryParams)
      
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
      console.error('Error fetching programas:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getProgramaById(id) {
    try {
      const response = await get(`/admin/programas/${id}`)
      
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
      console.error('Error fetching programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getDatosFormulario() {
    try {
      const response = await get('/admin/programas/datos-formulario')
      
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
      console.error('Error fetching datos formulario:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createPrograma(data) {
    try {
      const response = await post('/admin/programas', data)
      
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
      console.error('Error creating programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updatePrograma(id, data) {
    try {
      const response = await put(`/admin/programas/${id}`, data)
      
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
      console.error('Error updating programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removePrograma(id) {
    try {
      const response = await del(`/admin/programas/${id}`)
      
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
      console.error('Error removing programa:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

