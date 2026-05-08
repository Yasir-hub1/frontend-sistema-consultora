/**
 * API colaborador — empresas asignadas, personal, documentos AFP/CAJA/Ministerio (Fases 5–8).
 */

import api, { download, get, patch, post, upload } from './api'
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
        leida: params.leida,
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

  /**
   * Descarga el archivo del legajo con autenticación (evita abrir /storage en otra pestaña).
   * @param {string} tipo curriculum|licencia|aviso|croquis|certificado_nacimiento
   */
  async fetchLegajoArchivoBlob(empresaClienteId, personalId, tipo) {
    try {
      const response = await api.get(
        `/colaborador/empresas-cliente/${empresaClienteId}/personal/${personalId}/legajo/${tipo}/stream`,
        { responseType: 'blob' }
      )
      const blob = response.data
      if (blob instanceof Blob && blob.type?.includes('application/json')) {
        const text = await blob.text()
        try {
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          return { success: false, message: MESSAGES.ERROR_FETCH }
        }
      }
      const out = blob instanceof Blob ? blob : new Blob([blob])
      return { success: true, blob: out, mime: out.type || '' }
    } catch (error) {
      const data = error.response?.data
      if (data instanceof Blob && data.type?.includes('application/json')) {
        try {
          const j = JSON.parse(await data.text())
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          /* fall through */
        }
      }
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async createPersonal(empresaClienteId, payload) {
    try {
      const isFormData = payload instanceof FormData
      const response = isFormData
        ? await upload(`/colaborador/empresas-cliente/${empresaClienteId}/personal`, payload)
        : await post(`/colaborador/empresas-cliente/${empresaClienteId}/personal`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async descargarPlantillaPersonalMasivo(empresaClienteId) {
    try {
      const response = await api.get(
        `/colaborador/empresas-cliente/${empresaClienteId}/personal/plantilla-registro-masivo`,
        { responseType: 'blob' }
      )
      const blob = response.data
      if (blob instanceof Blob && blob.type?.includes('application/json')) {
        const text = await blob.text()
        try {
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          return { success: false, message: MESSAGES.ERROR_FETCH }
        }
      }
      const cd = response.headers['content-disposition'] || ''
      let filename = 'plantilla_registro_masivo_personal.xlsx'
      const m = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd)
      if (m?.[1]) {
        try {
          filename = decodeURIComponent(m[1].replace(/"/g, '').trim()) || filename
        } catch {
          filename = m[1].replace(/"/g, '').trim() || filename
        }
      }
      const downloadUrl = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]))
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async listOtrosDocumentosEmpresa(empresaClienteId) {
    try {
      const response = await get(`/colaborador/empresas-cliente/${empresaClienteId}/otros-documentos`)
      if (response.data.success) {
        const raw = response.data.data
        return {
          success: true,
          data: { items: raw?.items ?? [] },
          message: response.data.message,
        }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH, data: { items: [] } }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
        data: { items: [] },
      }
    }
  },

  async subirOtroDocumentoEmpresa(empresaClienteId, file, descripcion) {
    try {
      const formData = new FormData()
      formData.append('archivo', file)
      if (descripcion != null && String(descripcion).trim() !== '') {
        formData.append('descripcion', String(descripcion).trim())
      }
      const response = await upload(
        `/colaborador/empresas-cliente/${empresaClienteId}/otros-documentos`,
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

  async fetchOtroDocumentoEmpresaVistaPreviaBlob(empresaClienteId, id) {
    try {
      const response = await api.get(
        `/colaborador/empresas-cliente/${empresaClienteId}/otros-documentos/${id}/vista-previa`,
        { responseType: 'blob' }
      )
      const blob = response.data
      if (blob instanceof Blob && blob.type?.includes('application/json')) {
        const text = await blob.text()
        try {
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          return { success: false, message: MESSAGES.ERROR_FETCH }
        }
      }
      return {
        success: true,
        blob,
        contentType: response.headers['content-type'] || blob.type || '',
      }
    } catch (error) {
      const data = error.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          /* fallthrough */
        }
      }
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async descargarOtroDocumentoEmpresa(empresaClienteId, id, nombreOriginal) {
    await download(
      `/colaborador/empresas-cliente/${empresaClienteId}/otros-documentos/${id}/descargar`,
      {},
      nombreOriginal || `documento-${id}.pdf`
    )
  },

  async cargarPersonalMasivo(empresaClienteId, file) {
    try {
      const formData = new FormData()
      formData.append('archivo', file)
      const response = await api.post(
        `/colaborador/empresas-cliente/${empresaClienteId}/personal/registro-masivo`,
        formData
      )
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      const d = error.response?.data
      if (d instanceof Blob) {
        try {
          const j = JSON.parse(await d.text())
          return { success: false, message: j.message || MESSAGES.ERROR.SERVER_ERROR }
        } catch {
          /* fallthrough */
        }
      }
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async updatePersonal(empresaClienteId, personalId, payload) {
    try {
      const isFormData = payload instanceof FormData
      // POST + multipart: PATCH a menudo llega sin cuerpo en PHP-FPM/nginx; el backend acepta POST al mismo URI.
      const response = isFormData
        ? await post(
            `/colaborador/empresas-cliente/${empresaClienteId}/personal/${personalId}`,
            payload
          )
        : await patch(
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

  async listDeclaracionesMensuales(empresaClienteId) {
    try {
      const response = await get(`/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-mensuales`)
      if (response.data.success) {
        const raw = response.data.data
        return {
          success: true,
          data: { items: raw?.items ?? [] },
          message: response.data.message,
        }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH, data: { items: [] } }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
        data: { items: [] },
      }
    }
  },

  async subirDeclaracionMensual(empresaClienteId, formData) {
    try {
      const response = await upload(
        `/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-mensuales`,
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

  async fetchDeclaracionVistaPreviaBlob(empresaClienteId, id) {
    try {
      const response = await api.get(
        `/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-mensuales/${id}/vista-previa`,
        { responseType: 'blob' }
      )
      const blob = response.data
      if (blob instanceof Blob && blob.type?.includes('application/json')) {
        const text = await blob.text()
        try {
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          return { success: false, message: MESSAGES.ERROR_FETCH }
        }
      }
      return {
        success: true,
        blob,
        contentType: response.headers['content-type'] || blob.type || '',
      }
    } catch (error) {
      const data = error.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          /* fall through */
        }
      }
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },

  async descargarDeclaracionMensual(empresaClienteId, id, nombreOriginal) {
    await download(
      `/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-mensuales/${id}/descargar`,
      {},
      nombreOriginal || 'declaracion'
    )
  },

  async listDeclaracionesAguinaldo(empresaClienteId) {
    try {
      const response = await get(`/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-aguinaldo`)
      if (response.data.success) {
        const raw = response.data.data
        return {
          success: true,
          data: { items: raw?.items ?? [] },
          message: response.data.message,
        }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH, data: { items: [] } }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
        data: { items: [] },
      }
    }
  },

  async subirDeclaracionAguinaldo(empresaClienteId, formData) {
    try {
      const response = await upload(
        `/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-aguinaldo`,
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

  async fetchDeclaracionAguinaldoVistaPreviaBlob(empresaClienteId, id) {
    try {
      const response = await api.get(
        `/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-aguinaldo/${id}/vista-previa`,
        { responseType: 'blob' }
      )
      const blob = response.data
      if (blob instanceof Blob && blob.type?.includes('application/json')) {
        const text = await blob.text()
        try {
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          return { success: false, message: MESSAGES.ERROR_FETCH }
        }
      }
      return {
        success: true,
        blob,
        contentType: response.headers['content-type'] || blob.type || '',
      }
    } catch (error) {
      const data = error.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          /* fall through */
        }
      }
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },

  async descargarDeclaracionAguinaldo(empresaClienteId, id, nombreOriginal) {
    await download(
      `/colaborador/empresas-cliente/${empresaClienteId}/declaraciones-aguinaldo/${id}/descargar`,
      {},
      nombreOriginal || 'aguinaldo'
    )
  },
}
