// Servicio de gestión de horarios

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio de gestión de horarios
 */
export const horarioService = {
  /**
   * Obtener lista de horarios con paginación
   * @param {object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.per_page - Elementos por página
   * @param {string} params.search - Término de búsqueda
   * @param {string} params.sort_by - Campo de ordenamiento
   * @param {string} params.sort_direction - Dirección de ordenamiento
   * @param {string} params.gestion_id - ID de gestión académica
   * @param {string} params.docente_id - ID del docente
   * @param {string} params.grupo_id - ID del grupo
   * @param {string} params.aula_id - ID del aula
   * @param {string} params.dia - Día de la semana
   * @param {string} params.estado - Estado del horario
   * @returns {Promise<object>} Lista paginada de horarios
   */
  async getHorarios(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'dia',
        sort_direction: params.sort_direction || 'asc',
        gestion_id: params.gestion_id || '',
        docente_id: params.docente_id || '',
        grupo_id: params.grupo_id || '',
        aula_id: params.aula_id || '',
        dia: params.dia || '',
        estado: params.estado || ''
      }

      const response = await get('/horarios', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener horarios'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener horarios'
      }
    }
  },

  /**
   * Obtener horario por ID
   * @param {number} id - ID del horario
   * @returns {Promise<object>} Datos del horario
   */
  async getHorario(id) {
    try {
      const response = await get(`/horarios/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Horario no encontrado'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener horario'
      }
    }
  },

  /**
   * Crear nuevo horario
   * @param {object} data - Datos del horario
   * @returns {Promise<object>} Horario creado
   */
  async createHorario(data) {
    try {
      const response = await post('/horarios', data)
      
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

  /**
   * Actualizar horario
   * @param {number} id - ID del horario
   * @param {object} data - Datos actualizados
   * @returns {Promise<object>} Horario actualizado
   */
  async updateHorario(id, data) {
    try {
      const response = await put(`/horarios/${id}`, data)
      
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

  /**
   * Eliminar horario
   * @param {number} id - ID del horario
   * @returns {Promise<object>} Respuesta de eliminación
   */
  async deleteHorario(id) {
    try {
      const response = await del(`/horarios/${id}`)
      
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
   * Validar horario antes de guardar
   * @param {object} data - Datos del horario a validar
   * @returns {Promise<object>} Resultado de la validación
   */
  async validarHorario(data) {
    try {
      const response = await post('/horarios/validar', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en la validación'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error en la validación'
      }
    }
  },

  /**
   * Obtener vista semanal de horarios
   * @param {object} params - Parámetros de consulta
   * @param {string} params.gestion_id - ID de gestión académica
   * @param {string} params.docente_id - ID del docente (opcional)
   * @param {string} params.grupo_id - ID del grupo (opcional)
   * @param {string} params.aula_id - ID del aula (opcional)
   * @param {string} params.semana - Semana específica (opcional)
   * @returns {Promise<object>} Vista semanal de horarios
   */
  async getHorarioSemanal(params = {}) {
    try {
      const response = await get('/horarios/semanal', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener horario semanal'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener horario semanal'
      }
    }
  },

  /**
   * Obtener horarios de un docente específico
   * @param {number} docenteId - ID del docente
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Horarios del docente
   */
  async getHorariosDocente(docenteId, params = {}) {
    try {
      const response = await get(`/horarios/docente/${docenteId}`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener horarios del docente'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener horarios del docente'
      }
    }
  },

  /**
   * Obtener horarios de un grupo específico
   * @param {number} grupoId - ID del grupo
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Horarios del grupo
   */
  async getHorariosGrupo(grupoId, params = {}) {
    try {
      const response = await get(`/horarios/grupo/${grupoId}`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener horarios del grupo'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener horarios del grupo'
      }
    }
  },

  /**
   * Obtener horarios de un aula específica
   * @param {number} aulaId - ID del aula
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Horarios del aula
   */
  async getHorariosAula(aulaId, params = {}) {
    try {
      const response = await get(`/horarios/aula/${aulaId}`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener horarios del aula'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener horarios del aula'
      }
    }
  },

  /**
   * Verificar conflictos de horarios
   * @param {object} data - Datos del horario a verificar
   * @returns {Promise<object>} Conflictos encontrados
   */
  async verificarConflictos(data) {
    try {
      const response = await post('/horarios/verificar-conflictos', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al verificar conflictos'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al verificar conflictos'
      }
    }
  },

  /**
   * Obtener disponibilidad de docente en un horario específico
   * @param {number} docenteId - ID del docente
   * @param {object} horario - Datos del horario
   * @returns {Promise<object>} Disponibilidad del docente
   */
  async getDisponibilidadDocente(docenteId, horario) {
    try {
      const response = await post(`/horarios/disponibilidad/docente/${docenteId}`, horario)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al verificar disponibilidad'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al verificar disponibilidad'
      }
    }
  },

  /**
   * Obtener disponibilidad de aula en un horario específico
   * @param {number} aulaId - ID del aula
   * @param {object} horario - Datos del horario
   * @returns {Promise<object>} Disponibilidad del aula
   */
  async getDisponibilidadAula(aulaId, horario) {
    try {
      const response = await post(`/horarios/disponibilidad/aula/${aulaId}`, horario)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al verificar disponibilidad'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al verificar disponibilidad'
      }
    }
  },

  /**
   * Duplicar horarios de una gestión a otra
   * @param {object} data - Datos de duplicación
   * @param {string} data.gestion_origen - ID de gestión origen
   * @param {string} data.gestion_destino - ID de gestión destino
   * @param {boolean} data.sobrescribir - Sobrescribir horarios existentes
   * @returns {Promise<object>} Resultado de la duplicación
   */
  async duplicarHorarios(data) {
    try {
      const response = await post('/horarios/duplicar', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Horarios duplicados exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al duplicar horarios'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al duplicar horarios'
      }
    }
  },

  /**
   * Exportar horarios a Excel
   * @param {object} params - Parámetros de exportación
   * @returns {Promise<object>} Resultado de la exportación
   */
  async exportarHorarios(params = {}) {
    try {
      const response = await get('/horarios/export', params, {
        responseType: 'blob'
      })
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: MESSAGES.SUCCESS.EXPORT
        }
      } else {
        return {
          success: false,
          message: 'Error al exportar horarios'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || MESSAGES.ERROR.EXPORT
      }
    }
  },

  /**
   * Obtener estadísticas de horarios
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Estadísticas de horarios
   */
  async getEstadisticas(params = {}) {
    try {
      const response = await get('/horarios/estadisticas', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener estadísticas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener estadísticas'
      }
    }
  },

  /**
   * Generar horarios automáticamente
   * @param {object} params - Parámetros de generación
   * @param {number} params.gestion_id - ID de gestión académica
   * @param {object} params.preferencias - Preferencias de generación
   * @returns {Promise<object>} Resultado de la generación
   */
  async generarAutomatico(params = {}) {
    try {
      const response = await post('/horarios/generar-automatico', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Horarios generados exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al generar horarios automáticamente'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al generar horarios automáticamente'
      }
    }
  }
}
