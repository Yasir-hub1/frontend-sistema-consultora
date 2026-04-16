// Servicio de gestión de documentos

import { get, post, put, del, upload } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

/**
 * Servicio para gestión de tipos de documento (Admin)
 */
export const tipoDocumentoService = {
  async get(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || ''
      }

      if (!queryParams.search) delete queryParams.search

      const response = await get('/admin/tipos-documento', queryParams)
      
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
      console.error('Error fetching tipos documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getById(id) {
    try {
      const response = await get(`/admin/tipos-documento/${id}`)
      
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
      console.error('Error fetching tipo documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async create(data) {
    try {
      const response = await post('/admin/tipos-documento', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS_CREATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_CREATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error creating tipo documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_CREATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async update(id, data) {
    try {
      const response = await put(`/admin/tipos-documento/${id}`, data)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || MESSAGES.SUCCESS_UPDATE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_UPDATE,
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error updating tipo documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_UPDATE,
        errors: error.response?.data?.errors
      }
    }
  },

  async remove(id) {
    try {
      const response = await del(`/admin/tipos-documento/${id}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || MESSAGES.SUCCESS_DELETE
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR_DELETE
        }
      }
    } catch (error) {
      console.error('Error deleting tipo documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_DELETE
      }
    }
  }
}

/**
 * Servicio para validación de documentos (Admin)
 */
export const validacionDocumentoService = {
  async getEstudiantesPendientes(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || ''
      }

      if (!queryParams.search) delete queryParams.search

      const response = await get('/admin/documentos/validacion', queryParams)
      
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
      console.error('Error fetching estudiantes pendientes:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async getDocumentosEstudiante(estudianteId) {
    try {
      const response = await get(`/admin/documentos/validacion/${estudianteId}`)
      
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
      console.error('Error fetching documentos estudiante:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async aprobarDocumento(documentoId, observaciones = '') {
    try {
      const response = await post(`/admin/documentos/validacion/${documentoId}/aprobar`, {
        observaciones
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Documento aprobado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al aprobar documento'
        }
      }
    } catch (error) {
      console.error('Error aprobando documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al aprobar documento'
      }
    }
  },

  async rechazarDocumento(documentoId, motivo) {
    try {
      const response = await post('/admin/documentos/validacion/rechazar', {
        documento_id: documentoId,
        motivo
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Documento rechazado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al rechazar documento'
        }
      }
    } catch (error) {
      console.error('Error rechazando documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al rechazar documento'
      }
    }
  },

  async aprobarTodos(estudianteId) {
    try {
      const response = await post(`/admin/documentos/validacion/${estudianteId}/aprobar-todos`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Todos los documentos aprobados exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al aprobar documentos'
        }
      }
    } catch (error) {
      console.error('Error aprobando todos los documentos:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al aprobar documentos'
      }
    }
  }
}

/**
 * Servicio para gestión de documentos (Estudiante)
 */
export const estudianteDocumentoService = {
  async getMisDocumentos() {
    try {
      const response = await get('/estudiante/documentos')
      
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
      console.error('Error fetching mis documentos:', error)
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH
      }
    }
  },

  async subirDocumento(tipoDocumentoId, archivo) {
    try {
      const formData = new FormData()
      formData.append('tipo_documento_id', tipoDocumentoId)
      formData.append('archivo', archivo)

      const response = await upload('/estudiante/documentos/subir', formData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Documento subido exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al subir documento',
          errors: response.data.errors
        }
      }
    } catch (error) {
      console.error('Error subiendo documento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al subir documento',
        errors: error.response?.data?.errors
      }
    }
  }
}

