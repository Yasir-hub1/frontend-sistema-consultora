/**
 * API empresa cliente — portal solo lectura (Fase 10).
 */

import api, { download, downloadPost, get } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

function stripEmpty(params) {
  const out = { ...params }
  Object.keys(out).forEach((key) => {
    if (out[key] === '' || out[key] === null || out[key] === undefined) delete out[key]
  })
  return out
}

export const empresaClienteService = {
  async getDashboard() {
    try {
      const response = await get('/empresa-cliente/dashboard')
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
      const response = await get('/empresa-cliente/alertas', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getMiConsultora() {
    try {
      const response = await get('/empresa-cliente/mi-consultora')
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async listPersonal(params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
        estado_modulo: params.estado_modulo || '',
      })
      const response = await get('/empresa-cliente/personal', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getPersonal(personalId) {
    try {
      const response = await get(`/empresa-cliente/personal/${personalId}`)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getUrlDescargaDocumento(documentoId) {
    try {
      const response = await get(`/empresa-cliente/documentos/${documentoId}/descargar`)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  /**
   * Descarga autenticada (Bearer). Evita window.open al /stream sin token.
   */
  async descargarDocumento(documentoId, nombreSugerido) {
    const meta = await this.streamDocumento(documentoId)
    if (!meta.success || !meta.blob) {
      return { success: false, message: meta.message || MESSAGES.ERROR_FETCH }
    }
    const name = nombreSugerido || meta.nombreOriginal || `documento-${documentoId}`
    const downloadUrl = window.URL.createObjectURL(meta.blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    return { success: true }
  },

  /**
   * Obtiene el archivo con el token de sesión (vista previa o descarga manual).
   * @returns {{ success: true, blob: Blob, nombreOriginal: string, contentType: string } | { success: false, message: string }}
   */
  async streamDocumento(documentoId) {
    try {
      const response = await get(
        `/empresa-cliente/documentos/${documentoId}/stream`,
        {},
        { responseType: 'blob', silent: true }
      )
      const blob = response.data
      if (blob instanceof Blob && blob.size > 0 && blob.type?.includes('application/json')) {
        const j = JSON.parse(await blob.text())
        return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
      }
      const cd = response.headers['content-disposition']
      let nombre = `documento-${documentoId}`
      if (cd) {
        const m = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd)
        if (m) {
          try {
            nombre = decodeURIComponent(m[1].replace(/"/g, '').trim())
          } catch {
            nombre = m[1].replace(/"/g, '').trim() || nombre
          }
        }
      }
      const contentType =
        (blob instanceof Blob && blob.type && blob.type !== 'application/octet-stream'
          ? blob.type
          : null) ||
        response.headers['content-type'] ||
        'application/octet-stream'
      return { success: true, blob, nombreOriginal: nombre, contentType }
    } catch (error) {
      const d = error.response?.data
      if (d instanceof Blob) {
        try {
          const j = JSON.parse(await d.text())
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          /* fallthrough */
        }
      }
      return {
        success: false,
        message: error.message || error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },

  async listDeclaracionesMensuales() {
    try {
      const response = await get('/empresa-cliente/declaraciones-mensuales')
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

  async descargarDeclaracionMensual(id, nombreOriginal) {
    await download(
      `/empresa-cliente/declaraciones-mensuales/${id}/descargar`,
      {},
      nombreOriginal || `declaracion-${id}`
    )
  },

  async fetchDeclaracionMensualVistaPreviaBlob(id) {
    try {
      const response = await api.get(
        `/empresa-cliente/declaraciones-mensuales/${id}/vista-previa`,
        { responseType: 'blob' }
      )
      const blob = response.data
      const cd = response.headers['content-disposition'] || ''
      const m = /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i.exec(cd)
      const nombre = m ? decodeURIComponent(m[1]) : `declaracion-${id}`
      const contentType =
        (blob instanceof Blob && blob.type && blob.type !== 'application/octet-stream'
          ? blob.type
          : null) ||
        response.headers['content-type'] ||
        'application/octet-stream'
      return { success: true, blob, nombreOriginal: nombre, contentType }
    } catch (error) {
      const d = error.response?.data
      if (d instanceof Blob) {
        try {
          const j = JSON.parse(await d.text())
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          /* noop */
        }
      }
      return {
        success: false,
        message: error.message || error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },

  async descargarDeclaracionesMensualesZip(meses, fallbackName = 'declaraciones.zip') {
    try {
      await downloadPost(
        '/empresa-cliente/declaraciones-mensuales/descarga-zip',
        { meses },
        fallbackName
      )
      return { success: true }
    } catch (error) {
      const msg =
        (error instanceof Error && error.message) ||
        error.response?.data?.message ||
        MESSAGES.ERROR.SERVER_ERROR
      return { success: false, message: msg }
    }
  },

  async listDeclaracionesAguinaldo() {
    try {
      const response = await get('/empresa-cliente/declaraciones-aguinaldo')
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

  async descargarDeclaracionAguinaldo(id, nombreOriginal) {
    await download(
      `/empresa-cliente/declaraciones-aguinaldo/${id}/descargar`,
      {},
      nombreOriginal || `declaracion-aguinaldo-${id}`
    )
  },

  async fetchDeclaracionAguinaldoVistaPreviaBlob(id) {
    try {
      const response = await api.get(
        `/empresa-cliente/declaraciones-aguinaldo/${id}/vista-previa`,
        { responseType: 'blob' }
      )
      const blob = response.data
      const cd = response.headers['content-disposition'] || ''
      const m = /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i.exec(cd)
      const nombre = m ? decodeURIComponent(m[1]) : `declaracion-aguinaldo-${id}`
      const contentType =
        (blob instanceof Blob && blob.type && blob.type !== 'application/octet-stream'
          ? blob.type
          : null) ||
        response.headers['content-type'] ||
        'application/octet-stream'
      return { success: true, blob, nombreOriginal: nombre, contentType }
    } catch (error) {
      const d = error.response?.data
      if (d instanceof Blob) {
        try {
          const j = JSON.parse(await d.text())
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          /* noop */
        }
      }
      return {
        success: false,
        message: error.message || error.response?.data?.message || MESSAGES.ERROR_FETCH,
      }
    }
  },
}
