// Servicio de gestión de asignación de docentes y grupos

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio para gestión de docentes
 */
export const docenteService = {
  async getDocentes(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        especializacion: params.especializacion || '',
        sort_by: params.sort_by || 'apellido',
        sort_direction: params.sort_direction || 'asc'
      }

      if (!queryParams.search) delete queryParams.search
      if (!queryParams.especializacion) delete queryParams.especializacion

      const response = await get('/admin/docentes', queryParams)
      
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
      console.error('Error fetching docentes:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getSiguienteRegistro() {
    try {
      const response = await get('/admin/docentes/siguiente-registro')
      
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
      console.error('Error fetching siguiente registro:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getDocenteById(registro) {
    try {
      const response = await get(`/admin/docentes/${registro}`)
      
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
      console.error('Error fetching docente:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createDocente(data) {
    try {
      const response = await post('/admin/docentes', data)
      
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
      console.error('Error creating docente:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateDocente(registro, data) {
    try {
      const response = await put(`/admin/docentes/${registro}`, data)
      
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
      console.error('Error updating docente:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removeDocente(registro) {
    try {
      const response = await del(`/admin/docentes/${registro}`)
      
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
      console.error('Error removing docente:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de horarios
 */
export const horarioService = {
  async getHorarios(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        dias: params.dias || '',
        turno: params.turno || ''
      }

      if (!queryParams.search) delete queryParams.search
      if (!queryParams.dias) delete queryParams.dias
      if (!queryParams.turno) delete queryParams.turno

      const response = await get('/admin/horarios', queryParams)
      
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
      console.error('Error fetching horarios:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getHorarioById(id) {
    try {
      const response = await get(`/admin/horarios/${id}`)
      
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
      console.error('Error fetching horario:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async createHorario(data) {
    try {
      const response = await post('/admin/horarios', data)
      
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
      console.error('Error creating horario:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async updateHorario(id, data) {
    try {
      const response = await put(`/admin/horarios/${id}`, data)
      
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
      console.error('Error updating horario:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removeHorario(id) {
    try {
      const response = await del(`/admin/horarios/${id}`)
      
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
      console.error('Error removing horario:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para gestión de grupos
 */
export const grupoService = {
  async getGrupos(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        programa_id: params.programa_id || '',
        modulo_id: params.modulo_id || '',
        docente_id: params.docente_id || ''
      }

      // Eliminar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '') delete queryParams[key]
      })

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
          message: response.data.message || MESSAGES.ERROR_FETCH
        }
      }
    } catch (error) {
      console.error('Error fetching grupos:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getGrupoById(id) {
    try {
      const response = await get(`/admin/grupos/${id}`)
      
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
      console.error('Error fetching grupo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

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

  async createGrupo(data) {
    try {
      const response = await post('/admin/grupos', data)
      
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
      console.error('Error creating grupo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
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
      console.error('Error updating grupo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async removeGrupo(id) {
    try {
      const response = await del(`/admin/grupos/${id}`)
      
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
      console.error('Error removing grupo:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

