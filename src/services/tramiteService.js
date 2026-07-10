/**
 * API de trámites — prefijo según rol del usuario autenticado.
 */

import { get, post, patch, upload } from './api'
import api from './api'
import { MESSAGES, PAGINATION_CONFIG } from '../utils/constants'
import { normalizeRole, ROLES } from '../utils/roleUtils'

function apiPrefix(rol) {
  const r = normalizeRole(rol)
  if (r === ROLES.CONSULTORA) return '/consultora/tramites'
  if (r === ROLES.COLABORADOR) return '/colaborador/tramites'
  if (r === ROLES.EMPRESA_CLIENTE) return '/empresa-cliente/tramites'
  return '/consultora/tramites'
}

function stripEmpty(params) {
  const out = { ...params }
  Object.keys(out).forEach((k) => {
    if (out[k] === '' || out[k] == null) delete out[k]
  })
  return out
}

export const tramiteService = {
  apiPrefix,

  async getColaboradoresAsignables(rol, empresaClienteId) {
    try {
      const response = await get(`${apiPrefix(rol)}/colaboradores-asignables`, {
        empresa_cliente_id: empresaClienteId,
      })
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getTipos(rol) {
    try {
      const response = await get(`${apiPrefix(rol)}/tipos`)
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getResumen(rol) {
    try {
      const response = await get(`${apiPrefix(rol)}/resumen`)
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async getCalendario(rol, params = {}) {
    try {
      const response = await get(`${apiPrefix(rol)}/calendario`, stripEmpty(params))
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async list(rol, params = {}) {
    try {
      const query = stripEmpty({
        page: params.page || 1,
        per_page: params.per_page || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        estado: params.estado,
        empresa_cliente_id: params.empresa_cliente_id,
        tipo: params.tipo,
        search: params.search,
      })
      const response = await get(apiPrefix(rol), query)
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data?.data ?? [],
          meta: response.data.data?.meta ?? {},
        }
      }
      return { success: false, message: response.data.message, data: [], meta: {} }
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || MESSAGES.ERROR_FETCH,
        data: [],
        meta: {},
      }
    }
  },

  async getById(rol, id) {
    try {
      const response = await get(`${apiPrefix(rol)}/${id}`)
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR_FETCH }
    }
  },

  async create(rol, payload) {
    try {
      const response = await post(apiPrefix(rol), payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR.CREATE }
    }
  },

  async update(rol, id, payload) {
    try {
      const response = await patch(`${apiPrefix(rol)}/${id}`, payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async anularTramite(rol, id) {
    try {
      const response = await post(`${apiPrefix(rol)}/${id}/anular`, {})
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  /** @deprecated usar anularTramite */
  async anularRecurrencia(rol, id) {
    return this.anularTramite(rol, id)
  },

  async iniciarTarea(rol, tramiteId, tareaId) {
    try {
      const response = await post(`${apiPrefix(rol)}/${tramiteId}/tareas/${tareaId}/iniciar`, {})
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async completarTarea(rol, tramiteId, tareaId) {
    try {
      const response = await post(`${apiPrefix(rol)}/${tramiteId}/tareas/${tareaId}/completar`, {})
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  async subirDocumentoTarea(rol, tramiteId, tareaId, file, tipo = 'adjunto') {
    try {
      const fd = new FormData()
      fd.append('archivo', file)
      if (tipo) fd.append('tipo', tipo)
      const response = await upload(`${apiPrefix(rol)}/${tramiteId}/tareas/${tareaId}/documentos`, fd)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || MESSAGES.ERROR.UPDATE }
    }
  },

  descargarDocumentoUrl(rol, tramiteId, tareaId, documentoId) {
    const base = import.meta.env.VITE_API_URL || '/api'
    const token = localStorage.getItem('token')
    const prefix = apiPrefix(rol)
    const path = `${prefix}/${tramiteId}/tareas/${tareaId}/documentos/${documentoId}/descargar`
    return `${base}${path}${token ? `?token=${encodeURIComponent(token)}` : ''}`
  },

  async obtenerDocumentoTarea(rol, tramiteId, tareaId, documentoId) {
    try {
      const response = await api.get(
        `${apiPrefix(rol)}/${tramiteId}/tareas/${tareaId}/documentos/${documentoId}/descargar`,
        { responseType: 'blob' }
      )
      const blob = response.data
      if (blob instanceof Blob && blob.type?.includes('application/json')) {
        const j = JSON.parse(await blob.text())
        return { success: false, message: j.message || 'No se pudo cargar el documento' }
      }
      const contentType = response.headers['content-type'] || blob.type || 'application/octet-stream'
      return {
        success: true,
        blob: blob instanceof Blob ? blob : new Blob([blob]),
        contentType,
      }
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || 'No se pudo cargar el documento',
      }
    }
  },
}
