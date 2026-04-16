// Servicio de gestión de inscripciones para estudiantes

import { get, post } from './api'
import { MESSAGES } from '../utils/constants'

/**
 * Servicio para gestión de inscripciones (Estudiante)
 */
export const inscripcionService = {
  async getProgramasDisponibles() {
    try {
      const response = await get('/estudiante/inscripciones/programas-disponibles')
      
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
      console.error('Error fetching programas disponibles:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async verificarHorarios(grupoId) {
    try {
      const response = await post('/estudiante/inscripciones/verificar-horarios', {
        grupo_id: grupoId
      })
      
      if (response.data.success) {
        return {
          success: true,
          tieneConflictos: response.data.tiene_conflictos,
          conflictos: response.data.conflictos || [],
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al verificar horarios'
        }
      }
    } catch (error) {
      console.error('Error verificando horarios:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al verificar horarios'
      }
    }
  },

  async getMisInscripciones(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 15
      }

      const response = await get('/estudiante/inscripciones', queryParams)
      
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
      console.error('Error fetching mis inscripciones:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getInscripcionById(id) {
    try {
      const response = await get(`/estudiante/inscripciones/${id}`)
      
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
      console.error('Error fetching inscripcion:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async crearInscripcion(data) {
    try {
      const response = await post('/estudiante/inscripciones', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Inscripción realizada exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al realizar inscripción',
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error creando inscripcion:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al realizar inscripción',
        errors: error.response?.data?.errors
      }
    }
  },

  async getDescuentosDisponibles() {
    try {
      const response = await get('/estudiante/inscripciones/descuentos-disponibles')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener descuentos'
        }
      }
    } catch (error) {
      console.error('Error fetching descuentos:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener descuentos'
      }
    }
  },

  async getReglasCuotas(programaId) {
    try {
      const response = await get(`/estudiante/inscripciones/reglas-cuotas/${programaId}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener reglas de cuotas'
        }
      }
    } catch (error) {
      console.error('Error fetching reglas cuotas:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener reglas de cuotas'
      }
    }
  }
}

