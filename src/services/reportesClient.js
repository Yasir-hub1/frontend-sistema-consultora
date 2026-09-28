import api, { get } from './api'
import { MESSAGES } from '../utils/constants'

function stripEmpty(params) {
  const out = { ...params }
  Object.keys(out).forEach((key) => {
    if (out[key] === '' || out[key] === null || out[key] === undefined) delete out[key]
  })
  return out
}

async function mensajeBlob(data, fallback) {
  if (data instanceof Blob) {
    try {
      const j = JSON.parse(await data.text())
      return j.message || fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

export function createReportesClient(prefix) {
  const base = `${prefix}/reportes`

  return {
    async listReportesDeclaraciones(params = {}) {
      try {
        const response = await get(
          `${base}/declaraciones`,
          stripEmpty({
            mes_gestion: params.mes_gestion || '',
            anio: params.anio || '',
            modulo: params.modulo || '',
            empresa_cliente_id: params.empresa_cliente_id || '',
            tipo_declaracion: params.tipo_declaracion || '',
            page: params.page || 1,
            per_page: params.per_page || 50,
          })
        )
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
        const response = await get(`${base}/empresas-cliente`)
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
        const response = await api.get(`${base}/declaraciones/${id}/vista-previa`, {
          params: stripEmpty({ tipo_declaracion: tipoDeclaracion }),
          responseType: 'blob',
        })
        const blob = response.data
        if (blob instanceof Blob && blob.type?.includes('application/json')) {
          return { success: false, message: await mensajeBlob(blob, MESSAGES.ERROR_FETCH) }
        }
        return { success: true, blob }
      } catch (error) {
        return { success: false, message: await mensajeBlob(error.response?.data, error.response?.data?.message || MESSAGES.ERROR_FETCH) }
      }
    },

    async descargarReporteDeclaracion(id, nombreOriginal, tipoDeclaracion = 'mensual') {
      try {
        const response = await api.get(`${base}/declaraciones/${id}/descargar`, {
          params: stripEmpty({ tipo_declaracion: tipoDeclaracion }),
          responseType: 'blob',
        })
        const blob = response.data
        if (blob instanceof Blob && blob.type?.includes('application/json')) {
          return { success: false, message: await mensajeBlob(blob, MESSAGES.ERROR_FETCH) }
        }
        const cd = response.headers['content-disposition'] || ''
        let finalName = nombreOriginal || `declaracion-${id}.pdf`
        const match = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd)
        if (match?.[1]) {
          try {
            finalName = decodeURIComponent(match[1].replace(/"/g, '').trim()) || finalName
          } catch {
            finalName = match[1].replace(/"/g, '').trim() || finalName
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
        return { success: false, message: await mensajeBlob(error.response?.data, error.response?.data?.message || MESSAGES.ERROR_FETCH) }
      }
    },

    async getResumenAportesMensual(params) {
      try {
        const response = await get(
          `${base}/resumen-aportes`,
          stripEmpty({
            empresa_cliente_id: params.empresa_cliente_id,
            mes_gestion: params.mes_gestion,
          })
        )
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
        const response = await api.get(`${base}/resumen-aportes/pdf`, {
          params: stripEmpty({
            empresa_cliente_id: params.empresa_cliente_id,
            mes_gestion: params.mes_gestion,
          }),
          responseType: 'blob',
        })
        const blob = response.data
        if (blob instanceof Blob && blob.type?.includes('application/json')) {
          return { success: false, message: await mensajeBlob(blob, MESSAGES.ERROR_FETCH) }
        }
        return { success: true, blob }
      } catch (error) {
        return { success: false, message: await mensajeBlob(error.response?.data, error.response?.data?.message || MESSAGES.ERROR_FETCH) }
      }
    },

    async exportarReporteDeclaracionesPdf(payload) {
      try {
        const response = await api.post(`${base}/declaraciones/exportar-pdf`, payload, {
          responseType: 'blob',
        })
        const blob = response.data
        if (blob instanceof Blob && blob.type?.includes('application/json')) {
          return { success: false, message: await mensajeBlob(blob, MESSAGES.ERROR_FETCH) }
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
        return { success: false, message: await mensajeBlob(error.response?.data, error.response?.data?.message || MESSAGES.ERROR_FETCH) }
      }
    },
  }
}
