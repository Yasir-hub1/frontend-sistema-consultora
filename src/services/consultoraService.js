/**
 * API titular consultora — configuración, equipo, empresas cliente, alertas (Fases 2–4, 9).
 */

import api, { del, get, post, put, patch, upload } from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'

function stripEmpty(params) {
  const out = { ...params }
  Object.keys(out).forEach((key) => {
    if (out[key] === '' || out[key] === null || out[key] === undefined) delete out[key]
  })
  return out
}

export const consultoraService = {
  async getInstitucionesFinancieras() {
    try {
      const response = await get('/consultora/catalogos/instituciones-financieras')
      if (response.data.success) {
        const raw = response.data.data
        const rows = raw?.data ?? raw ?? []
        return {
          success: true,
          data: Array.isArray(rows) ? rows : [],
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

  async getMiConfiguracion() {
    try {
      const response = await get('/consultora/configuracion')
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async guardarPasoConfiguracion(paso, payload) {
    try {
      const response = await put(`/consultora/configuracion/paso/${paso}`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async subirLogo(formData) {
    try {
      const response = await upload('/consultora/configuracion/logo', formData)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async finalizarConfiguracion() {
    try {
      const response = await post('/consultora/configuracion/finalizar', {})
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return {
        success: false,
        message: response.data.message || MESSAGES.ERROR.UPDATE,
        errors: response.data.errors,
      }
    } catch (error) {
      const d = error.response?.data
      return {
        success: false,
        message: d?.message || MESSAGES.ERROR.UPDATE,
        errors: d?.errors,
      }
    }
  },

  async listColaboradores(params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
      })
      const response = await get('/consultora/colaboradores', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async createColaborador(payload) {
    try {
      const response = await post('/consultora/colaboradores', payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async patchColaboradorAcceso(colaboradorId, payload) {
    try {
      const response = await patch(`/consultora/colaboradores/${colaboradorId}/acceso`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async updateColaboradorPermisos(colaboradorId, payload) {
    try {
      const response = await put(`/consultora/colaboradores/${colaboradorId}/permisos`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      const d = error.response?.data
      const msg =
        d?.message ||
        (d?.errors && typeof d.errors === 'object'
          ? Object.entries(d.errors)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
              .join(' · ')
          : null) ||
        MESSAGES.ERROR.UPDATE
      return { success: false, message: msg, errors: d?.errors }
    }
  },

  async listEmpresasCliente(params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        search: params.search || '',
      })
      const response = await get('/consultora/empresas-cliente', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getEmpresaCliente(id) {
    try {
      const response = await get(`/consultora/empresas-cliente/${id}`)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async createEmpresaCliente(payload) {
    try {
      const response = await post('/consultora/empresas-cliente', payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async patchEmpresaCliente(empresaId, payload) {
    try {
      const response = await patch(`/consultora/empresas-cliente/${empresaId}`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async patchEmpresaClienteAccesoPortal(empresaId, payload) {
    try {
      const response = await patch(`/consultora/empresas-cliente/${empresaId}/acceso-portal`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async generarAccesoEmpresaCliente(empresaId, payload) {
    try {
      const response = await post(`/consultora/empresas-cliente/${empresaId}/generar-acceso`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async asignarColaboradoresEmpresa(empresaId, payload) {
    try {
      const response = await put(`/consultora/empresas-cliente/${empresaId}/asignaciones`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async listTiposDocumentoCatalogo(params = {}) {
    try {
      const queryParams = stripEmpty({
        modulo: params.modulo,
        caja_variante: params.caja_variante,
      })
      const response = await get('/consultora/catalogos/tipos-documento', queryParams)
      if (response.data.success) {
        const raw = response.data.data
        return { success: true, data: Array.isArray(raw) ? raw : [], message: response.data.message }
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

  async createTipoDocumentoCatalogo(payload) {
    try {
      const response = await post('/consultora/catalogos/tipos-documento', payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.SERVER_ERROR }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.SERVER_ERROR }
    }
  },

  async updateTipoDocumentoCatalogo(id, payload) {
    try {
      const response = await put(`/consultora/catalogos/tipos-documento/${id}`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async deleteTipoDocumentoCatalogo(id) {
    try {
      const response = await del(`/consultora/catalogos/tipos-documento/${id}`)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.UPDATE }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async listAlertas(params = {}) {
    try {
      const queryParams = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        nivel: params.nivel || '',
        modulo: params.modulo || '',
        resuelta: params.resuelta,
        leida: params.leida,
      })
      const response = await get('/consultora/alertas', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async listReportesDeclaraciones(params = {}) {
    try {
      const queryParams = stripEmpty({
        mes_gestion: params.mes_gestion || '',
        anio: params.anio || '',
        modulo: params.modulo || '',
        empresa_cliente_id: params.empresa_cliente_id || '',
        tipo_declaracion: params.tipo_declaracion || '',
        page: params.page || 1,
        per_page: params.per_page || 50,
      })
      const response = await get('/consultora/reportes/declaraciones', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async listEmpresasClienteReporte() {
    try {
      const response = await get('/consultora/reportes/empresas-cliente')
      if (response.data.success) {
        const rows = response.data.data ?? []
        return { success: true, data: Array.isArray(rows) ? rows : [], message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH, data: [] }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH, data: [] }
    }
  },

  async fetchReporteDeclaracionPreviewBlob(id, tipoDeclaracion = 'mensual') {
    try {
      const response = await api.get(
        `/consultora/reportes/declaraciones/${id}/vista-previa`,
        {
          params: stripEmpty({ tipo_declaracion: tipoDeclaracion }),
          responseType: 'blob',
        }
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
      return { success: true, blob }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async descargarReporteDeclaracion(id, nombreOriginal, tipoDeclaracion = 'mensual') {
    try {
      const response = await api.get(`/consultora/reportes/declaraciones/${id}/descargar`, {
        params: stripEmpty({ tipo_declaracion: tipoDeclaracion }),
        responseType: 'blob',
      })

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
      let finalName = nombreOriginal || `declaracion-${id}.pdf`
      const m = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd)
      if (m?.[1]) {
        try {
          finalName = decodeURIComponent(m[1].replace(/"/g, '').trim()) || finalName
        } catch {
          finalName = m[1].replace(/"/g, '').trim() || finalName
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]))
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = finalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      return { success: true }
    } catch (error) {
      const data = error.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          return { success: false, message: MESSAGES.ERROR_FETCH }
        }
      }
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getResumenAportesMensual(params) {
    try {
      const queryParams = stripEmpty({
        empresa_cliente_id: params.empresa_cliente_id,
        mes_gestion: params.mes_gestion,
      })
      const response = await get('/consultora/reportes/resumen-aportes', queryParams)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR_FETCH }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async fetchResumenAportesPdfBlob(params) {
    try {
      const queryParams = stripEmpty({
        empresa_cliente_id: params.empresa_cliente_id,
        mes_gestion: params.mes_gestion,
      })
      const response = await api.get('/consultora/reportes/resumen-aportes/pdf', {
        params: queryParams,
        responseType: 'blob',
      })
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
      return { success: true, blob }
    } catch (error) {
      const data = error.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          return { success: false, message: MESSAGES.ERROR_FETCH }
        }
      }
      return { success: false, message: error.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async exportarReporteDeclaracionesPdf(payload) {
    try {
      const response = await api.post('/consultora/reportes/declaraciones/exportar-pdf', payload, {
        responseType: 'blob',
      })
      const blob = response.data
      if (blob instanceof Blob && blob.type?.includes('application/json')) {
        const text = await blob.text()
        const j = JSON.parse(text)
        return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
      }
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `reporte_${payload.mes_gestion}_${(payload.modulo || 'todos').toUpperCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      return { success: true }
    } catch (error) {
      const data = error.response?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const j = JSON.parse(text)
          return { success: false, message: j.message || MESSAGES.ERROR_FETCH }
        } catch {
          // fallthrough
        }
      }
      return { success: false, message: error.response?.data?.message || error.message || MESSAGES.ERROR_FETCH }
    }
  },
}
