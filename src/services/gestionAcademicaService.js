// Servicio de gestión de gestiones académicas

import { get, post, put, del } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

export const gestionAcademicaService = {
  /**
   * Obtener lista de gestiones académicas con paginación
   * @param {object} params - Parámetros de consulta
   * @returns {Promise<object>} Lista paginada de gestiones académicas
   */
  async getGestiones(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        sort_by: params.sort_by || 'año',
        sort_order: params.sort_order || 'desc',
        año: params.año || '',
        periodo: params.periodo || '',
        activa: params.activa || ''
      }

      const response = await get('/gestiones-academicas', queryParams)
      
      console.log('🔍 gestionAcademicaService.getGestiones - Response completa:', response)
      console.log('🔍 gestionAcademicaService.getGestiones - response.data:', response.data)
      console.log('🔍 gestionAcademicaService.getGestiones - response.data.success:', response.data?.success)
      console.log('🔍 gestionAcademicaService.getGestiones - response.data.data:', response.data?.data)
      
      // El backend devuelve: { success: true, data: { data: [...], last_page: 1, ... } }
      // response.data es: { success: true, data: { data: [...], last_page: 1, ... } }
      if (response.data && response.data.success) {
        const paginatedData = response.data.data
        console.log('✅ gestionAcademicaService.getGestiones - Datos paginados:', paginatedData)
        console.log('✅ gestionAcademicaService.getGestiones - Total items:', paginatedData?.total)
        console.log('✅ gestionAcademicaService.getGestiones - Array data:', paginatedData?.data)
        
        return {
          success: true,
          data: paginatedData, // Este es el objeto paginado completo { data: [...], last_page: 1, ... }
          message: response.data.message
        }
      } else {
        console.error('❌ gestionAcademicaService.getGestiones - Response sin success:', response.data)
        return {
          success: false,
          message: response.data?.message || 'Error al obtener gestiones académicas',
          data: null
        }
      }
    } catch (error) {
      console.error('❌ Error en gestionAcademicaService.getGestiones:', error)
      console.error('❌ Response error:', error.response?.data)
      console.error('❌ Status:', error.response?.status)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener gestiones académicas',
        data: null
      }
    }
  },

  /**
   * Obtener gestión académica activa
   * @returns {Promise<object>} Gestión académica activa
   */
  async getGestionActiva() {
    try {
      const response = await get('/gestiones-academicas/activa')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'No hay gestión académica activa'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener gestión académica activa'
      }
    }
  },

  /**
   * Obtener gestión académica por ID
   * @param {number} id - ID de la gestión académica
   * @returns {Promise<object>} Datos de la gestión académica
   */
  async getGestion(id) {
    try {
      const response = await get(`/gestiones-academicas/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Gestión académica no encontrada'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al obtener gestión académica'
      }
    }
  },

  /**
   * Crear nueva gestión académica
   * @param {object} data - Datos de la gestión académica
   * @returns {Promise<object>} Gestión académica creada
   */
  async createGestion(data) {
    try {
      const response = await post('/gestiones-academicas', data)
      
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
   * Actualizar gestión académica
   * @param {number} id - ID de la gestión académica
   * @param {object} data - Datos actualizados
   * @returns {Promise<object>} Gestión académica actualizada
   */
  async updateGestion(id, data) {
    try {
      const response = await put(`/gestiones-academicas/${id}`, data)
      
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
   * Eliminar gestión académica
   * @param {number} id - ID de la gestión académica
   * @returns {Promise<object>} Respuesta de eliminación
   */
  async deleteGestion(id) {
    try {
      const response = await del(`/gestiones-academicas/${id}`)
      
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
   * Activar una gestión académica
   * @param {number} id - ID de la gestión académica
   * @returns {Promise<object>} Gestión académica activada
   */
  async activarGestion(id) {
    try {
      const response = await put(`/gestiones-academicas/${id}/activar`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Gestión académica activada exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al activar la gestión académica'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al activar la gestión académica'
      }
    }
  },

  /**
   * Exportar gestiones académicas a CSV/Excel
   * @param {object} params - Parámetros de filtrado
   * @returns {Promise<object>} Lista de gestiones académicas para exportar
   */
  async exportarGestiones(params = {}) {
    try {
      const queryParams = {
        page: 1,
        per_page: 10000,
        search: params.search || '',
        año: params.año || '',
        periodo: params.periodo || '',
        activa: params.activa || ''
      }

      const response = await get('/gestiones-academicas', queryParams)
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data.data || []
        }
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al exportar gestiones académicas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al exportar gestiones académicas'
      }
    }
  },

  /**
   * Importar gestiones académicas desde archivo Excel/CSV
   * @param {File} file - Archivo a importar
   * @returns {Promise<object>} Resultado de la importación
   */
  async importarGestiones(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await post('/gestiones-academicas/import', formData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Gestiones académicas importadas exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al importar gestiones académicas',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al importar gestiones académicas',
        errors: error.response?.data?.errors
      }
    }
  }
}

