// Servicio de gestión de asistencias

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio de gestión de asistencias
 */
export const asistenciaService = {
  /**
   * Registrar asistencia manual
   * @param {object} data - Datos de la asistencia
   * @param {number} data.horario_id - ID del horario
   * @param {string} data.fecha - Fecha de la clase
   * @param {string} data.estado - Estado de asistencia
   * @param {string} data.observaciones - Observaciones (opcional)
   * @returns {Promise<object>} Asistencia registrada
   */
  async registrarAsistencia(data) {
    try {
      const response = await post('/asistencias', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Asistencia registrada exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al registrar asistencia',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al registrar asistencia',
        errors: error.response?.data?.errors
      }
    }
  },

  /**
   * Registrar asistencia con geolocalización
   * @param {object} data - Datos de la asistencia con geolocalización
   * @param {number} data.horario_id - ID del horario
   * @param {number} data.docente_id - ID del docente
   * @param {string} data.fecha - Fecha de la clase
   * @param {number} data.latitud - Latitud
   * @param {number} data.longitud - Longitud
   * @param {string} data.direccion_geolocalizacion - Dirección (opcional)
   * @param {string} data.observaciones - Observaciones (opcional)
   * @returns {Promise<object>} Asistencia registrada
   */
  async registrarConGeolocalizacion(data) {
    try {
      const response = await post('/asistencias/geolocalizacion', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Asistencia registrada exitosamente mediante geolocalización'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al registrar asistencia con geolocalización'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al registrar asistencia con geolocalización'
      }
    }
  },

  /**
   * Registrar asistencia con código QR
   * @param {string} codigoQR - Código QR escaneado
   * @param {object} data - Datos adicionales
   * @returns {Promise<object>} Asistencia registrada
   */
  async registrarConQR(codigoQR, data = {}) {
    try {
      const response = await post('/asistencias/qr', {
        codigo_qr: codigoQR,
        ...data
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Asistencia registrada exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al registrar asistencia'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al registrar asistencia'
      }
    }
  },

  /**
   * Generar código QR para clase
   * @param {number} horarioId - ID del horario
   * @param {string} fecha - Fecha de la clase
   * @returns {Promise<object>} Código QR generado
   */
  async generarQR(horarioId, fecha) {
    try {
      const response = await get(`/asistencias/generar-qr/${horarioId}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Código QR generado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al generar código QR'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al generar código QR'
      }
    }
  },

  /**
   * Obtener lista de asistencias con paginación
   * @param {object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.per_page - Elementos por página
   * @param {string} params.search - Término de búsqueda
   * @param {string} params.sort_by - Campo de ordenamiento
   * @param {string} params.sort_direction - Dirección de ordenamiento
   * @param {string} params.gestion_id - ID de gestión académica
   * @param {string} params.docente_id - ID del docente
   * @param {string} params.grupo_id - ID del grupo
   * @param {string} params.materia_id - ID de la materia
   * @param {string} params.fecha_inicio - Fecha de inicio
   * @param {string} params.fecha_fin - Fecha de fin
   * @param {string} params.estado - Estado de asistencia
   * @returns {Promise<object>} Lista paginada de asistencias
   */
  async getAsistencias(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'fecha',
        sort_direction: params.sort_direction || 'desc',
        gestion_id: params.gestion_id || '',
        docente_id: params.docente_id || '',
        grupo_id: params.grupo_id || '',
        materia_id: params.materia_id || '',
        fecha_inicio: params.fecha_inicio || '',
        fecha_fin: params.fecha_fin || '',
        estado: params.estado || ''
      }

      const response = await get('/asistencias', queryParams)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener asistencias'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener asistencias'
      }
    }
  },

  /**
   * Obtener asistencia por ID
   * @param {number} id - ID de la asistencia
   * @returns {Promise<object>} Datos de la asistencia
   */
  async getAsistencia(id) {
    try {
      const response = await get(`/asistencias/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Asistencia no encontrada'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener asistencia'
      }
    }
  },

  /**
   * Actualizar asistencia
   * @param {number} id - ID de la asistencia
   * @param {object} data - Datos actualizados
   * @returns {Promise<object>} Asistencia actualizada
   */
  async updateAsistencia(id, data) {
    try {
      const response = await put(`/asistencias/${id}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: MESSAGES.SUCCESS.UPDATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR.UPDATE
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || MESSAGES.ERROR.UPDATE
      }
    }
  },

  /**
   * Eliminar asistencia
   * @param {number} id - ID de la asistencia
   * @returns {Promise<object>} Respuesta de eliminación
   */
  async deleteAsistencia(id) {
    try {
      const response = await del(`/asistencias/${id}`)
      
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
  },

  /**
   * Obtener estadísticas de asistencia
   * @param {object} params - Parámetros de consulta
   * @param {string} params.docente_id - ID del docente
   * @param {string} params.grupo_id - ID del grupo
   * @param {string} params.materia_id - ID de la materia
   * @param {string} params.fecha_inicio - Fecha de inicio
   * @param {string} params.fecha_fin - Fecha de fin
   * @returns {Promise<object>} Estadísticas de asistencia
   */
  async getEstadisticas(params = {}) {
    try {
      const response = await get('/asistencias/estadisticas', params)
      
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
   * Obtener asistencias de un docente específico
   * @param {number} docenteId - ID del docente
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Asistencias del docente
   */
  async getAsistenciasDocente(docenteId, params = {}) {
    try {
      const response = await get(`/asistencias/docente/${docenteId}`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener asistencias del docente'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener asistencias del docente'
      }
    }
  },

  /**
   * Obtener asistencias de un grupo específico
   * @param {number} grupoId - ID del grupo
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Asistencias del grupo
   */
  async getAsistenciasGrupo(grupoId, params = {}) {
    try {
      const response = await get(`/asistencias/grupo/${grupoId}`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener asistencias del grupo'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener asistencias del grupo'
      }
    }
  },

  /**
   * Obtener asistencias de una materia específica
   * @param {number} materiaId - ID de la materia
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Asistencias de la materia
   */
  async getAsistenciasMateria(materiaId, params = {}) {
    try {
      const response = await get(`/asistencias/materia/${materiaId}`, params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener asistencias de la materia'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener asistencias de la materia'
      }
    }
  },

  /**
   * Obtener asistencias del día actual
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Asistencias del día
   */
  async getAsistenciasHoy(params = {}) {
    try {
      const response = await get('/asistencias/hoy', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener asistencias del día'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener asistencias del día'
      }
    }
  },

  /**
   * Verificar si ya existe asistencia para un horario y fecha
   * @param {number} horarioId - ID del horario
   * @param {string} fecha - Fecha de la clase
   * @returns {Promise<object>} Resultado de la verificación
   */
  async verificarAsistenciaExistente(horarioId, fecha) {
    try {
      const response = await get(`/asistencias/verificar/${horarioId}/${fecha}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al verificar asistencia'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al verificar asistencia'
      }
    }
  },

  /**
   * Obtener resumen de asistencias por período
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Resumen de asistencias
   */
  async getResumenAsistencias(params = {}) {
    try {
      const response = await get('/asistencias/resumen', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener resumen'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener resumen'
      }
    }
  },

  /**
   * Exportar asistencias a Excel
   * @param {object} params - Parámetros de exportación
   * @returns {Promise<object>} Resultado de la exportación
   */
  async exportarAsistencias(params = {}) {
    try {
      const response = await get('/asistencias/export', params, {
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
          message: 'Error al exportar asistencias'
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
   * Obtener códigos QR activos
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Códigos QR activos
   */
  async getQRActivos(params = {}) {
    try {
      const response = await get('/asistencias/qr-activos', params)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener códigos QR activos'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener códigos QR activos'
      }
    }
  },

  /**
   * Invalidar código QR
   * @param {string} codigoQR - Código QR a invalidar
   * @returns {Promise<object>} Resultado de la invalidación
   */
  async invalidarQR(codigoQR) {
    try {
      const response = await post('/asistencias/invalidar-qr', {
        codigo_qr: codigoQR
      })
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Código QR invalidado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al invalidar código QR'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al invalidar código QR'
      }
    }
  }
}
