/**
 * API colaborador — empresas asignadas, personal, documentos AFP/CAJA/Ministerio (Fases 5–8).
 */

import { get, patch, post, upload } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

function stripEmpty(params) {
  const out = { ...params }
  Object.keys(out).forEach((key) => {
    if (out[key] === '' || out[key] === null || out[key] === undefined) delete out[key]
  })
  return out
}

export const colaboradorService = {
  async getDashboard() {
    try {
      const response = await get('/colaborador/dashboard')
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async listAlertas(params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        resuelta: params.resuelta,
      })
      const response = await get('/colaborador/alertas', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async listEmpresasAsignadas(params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
      })
      const response = await get('/colaborador/empresas-cliente', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async listTiposDocumentoModulo(modulo, params = {}) {
    try {
      const query = stripEmpty({
        caja_variante: params.caja_variante,
      })
      const response = await get(`/colaborador/modulos/${modulo}/tipos-documento`, query)
      if (response.data.success) {
        const raw = response.data.data
        return {
          success: true,
          data: Array.isArray(raw) ? raw : [],
          message: response.data.message,
        }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH, data: [] }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
        data: [],
      }
    }
  },

  async patchCajaRegimen(empresaClienteId, personalId, regimenCaja) {
    try {
      const response = await patch(
        `/colaborador/empresas-cliente/${empresaClienteId}/personal/${personalId}/caja-regimen`,
        { regimen_caja: regimenCaja }
      )
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async listPersonal(empresaClienteId, params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
      })
      const response = await get(`/colaborador/empresas-cliente/${empresaClienteId}/personal`, queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getPersonal(empresaClienteId, personalId) {
    try {
      const response = await get(`/colaborador/empresas-cliente/${empresaClienteId}/personal/${personalId}`)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async createPersonal(empresaClienteId, payload) {
    try {
      const response = await post(`/colaborador/empresas-cliente/${empresaClienteId}/personal`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async updatePersonal(empresaClienteId, personalId, payload) {
    try {
      const response = await patch(
        `/colaborador/empresas-cliente/${empresaClienteId}/personal/${personalId}`,
        payload
      )
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async updateEmpresaAsignada(empresaClienteId, payload) {
    try {
      const response = await patch(`/colaborador/empresas-cliente/${empresaClienteId}`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async getDocumentosModulo(empresaClienteId, personalId, modulo) {
    try {
      const response = await get(
        `/colaborador/empresas-cliente/${empresaClienteId}/personal/${personalId}/modulos/${modulo}/documentos`
      )
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async subirDocumento(empresaClienteId, personalId, modulo, formData) {
    try {
      const response = await upload(
        `/colaborador/empresas-cliente/${empresaClienteId}/personal/${personalId}/modulos/${modulo}/documentos`,
        formData
      )
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },
}
