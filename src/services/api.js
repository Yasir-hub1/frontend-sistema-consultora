// Configuración de Axios para el sistema académico

import axios from 'axios'
import toast from 'react-hot-toast'
import { APP_CONFIG, MESSAGES } from '../utils/constants'

// Crear instancia de Axios
const api = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log de peticiones en modo debug
    if (APP_CONFIG.debugMode) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Log de respuestas en modo debug
    if (APP_CONFIG.debugMode) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Solo loguear errores si no son errores de red/CORS esperados
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))
    const isCORSError = error.message?.includes('CORS') || error.message?.includes('blocked')
    
    // No loguear errores de red/CORS repetidos para evitar spam en consola
    if (!isNetworkError && !isCORSError) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      })
    }
    
    // Manejar error 401 (No autorizado)
    if (error.response?.status === 401) {
      // Solo limpiar token si no es una petición de perfil (checkAuth)
      // El checkAuth manejará la limpieza de sesión si es necesario
      const isProfileRequest = originalRequest.url?.includes('/auth/perfil')
      
      if (!isProfileRequest) {
        // Limpiar token y redirigir al login en caso de 401
        localStorage.removeItem('token')
        sessionStorage.clear()
        
        // Evitar redirigir si ya estamos en login o si es una petición de login
        if (!originalRequest.url?.includes('/auth/login') && !window.location.pathname.includes('/login')) {
          // Limpiar cualquier caché
          if (window.queryClient) {
            window.queryClient.clear()
          }
          
          window.location.href = '/login'
        }
      } else {
        // Para peticiones de perfil, solo limpiar el token pero no redirigir
        // El AuthContext manejará la redirección
        localStorage.removeItem('token')
        sessionStorage.clear()
      }
      
      return Promise.reject(error)
    }
    
    // Manejar otros errores
    const errorMessage = getErrorMessage(error)
    
    // No mostrar toast para errores de red/CORS en notificaciones (se manejan silenciosamente)
    const isNotificationsRequest = originalRequest.url?.includes('/notificaciones')
    const shouldShowToast = !originalRequest.silent && !(isNetworkError && isNotificationsRequest)
    
    if (shouldShowToast) {
      toast.error(errorMessage)
    }
    
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

/**
 * Obtiene el mensaje de error apropiado
 * @param {Error} error - Error de la petición
 * @returns {string} Mensaje de error
 */
const getErrorMessage = (error) => {
  // Error de red (sin respuesta del servidor)
  if (!error.response) {
    // Verificar si es un error de CORS
    if (error.message?.includes('CORS') || error.message?.includes('blocked')) {
      return 'Error de CORS: El servidor no permite solicitudes desde este origen'
    }
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return 'Error de conexión: No se pudo conectar con el servidor'
    }
    return error.message || MESSAGES.ERROR.NETWORK
  }
  
  const status = error.response.status
  const data = error.response.data
  
  // Mensajes específicos del backend (prioridad alta)
  if (data?.message) {
    return data.message
  }
  
  // Errores de validación (422) - mostrar el primer error o todos
  if (status === 422 && data?.errors) {
    const errorMessages = []
    if (typeof data.errors === 'object') {
      Object.keys(data.errors).forEach(key => {
        const fieldErrors = Array.isArray(data.errors[key]) 
          ? data.errors[key] 
          : [data.errors[key]]
        fieldErrors.forEach(msg => errorMessages.push(`${key}: ${msg}`))
      })
      if (errorMessages.length > 0) {
        return errorMessages.length === 1 
          ? errorMessages[0]
          : `Errores de validación: ${errorMessages.slice(0, 3).join(', ')}${errorMessages.length > 3 ? '...' : ''}`
      }
    }
    return 'Datos de validación incorrectos'
  }
  
  // Mensajes por código de estado
  switch (status) {
    case 400:
      return data?.errors ? (typeof data.errors === 'string' ? data.errors : 'Datos inválidos') : 'Solicitud incorrecta'
    case 401:
      return data?.message || MESSAGES.ERROR.UNAUTHORIZED
    case 403:
      return data?.message || MESSAGES.ERROR.FORBIDDEN
    case 404:
      return data?.message || MESSAGES.ERROR.NOT_FOUND
    case 422:
      return data?.message || 'Datos de validación incorrectos'
    case 429:
      return 'Demasiadas solicitudes. Intenta más tarde'
    case 500:
      return data?.message || data?.error || MESSAGES.ERROR.SERVER_ERROR
    case 502:
      return 'Servidor no disponible'
    case 503:
      return 'Servicio temporalmente no disponible'
    default:
      return data?.message || data?.error || MESSAGES.ERROR.SERVER_ERROR
  }
}

/**
 * Realiza una petición GET
 * @param {string} url - URL de la petición
 * @param {object} params - Parámetros de consulta
 * @param {object} config - Configuración adicional
 * @returns {Promise} Respuesta de la petición
 */
export const get = (url, params = {}, config = {}) => {
  return api.get(url, { params, ...config })
}

/**
 * Realiza una petición POST
 * @param {string} url - URL de la petición
 * @param {object} data - Datos a enviar
 * @param {object} config - Configuración adicional
 * @returns {Promise} Respuesta de la petición
 */
export const post = (url, data = {}, config = {}) => {
  return api.post(url, data, config)
}

/**
 * Realiza una petición PUT
 * @param {string} url - URL de la petición
 * @param {object} data - Datos a enviar
 * @param {object} config - Configuración adicional
 * @returns {Promise} Respuesta de la petición
 */
export const put = (url, data = {}, config = {}) => {
  return api.put(url, data, config)
}

/**
 * Realiza una petición PATCH
 * @param {string} url - URL de la petición
 * @param {object} data - Datos a enviar
 * @param {object} config - Configuración adicional
 * @returns {Promise} Respuesta de la petición
 */
export const patch = (url, data = {}, config = {}) => {
  return api.patch(url, data, config)
}

/**
 * Realiza una petición DELETE
 * @param {string} url - URL de la petición
 * @param {object} config - Configuración adicional
 * @returns {Promise} Respuesta de la petición
 */
export const del = (url, config = {}) => {
  return api.delete(url, config)
}

/**
 * Realiza una petición con archivos (multipart/form-data)
 * @param {string} url - URL de la petición
 * @param {FormData} formData - Datos del formulario
 * @param {object} config - Configuración adicional
 * @returns {Promise} Respuesta de la petición
 */
export const upload = (url, formData, config = {}) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

/**
 * Realiza una petición de descarga de archivo
 * @param {string} url - URL de la petición
 * @param {object} params - Parámetros de consulta
 * @param {string} filename - Nombre del archivo
 * @returns {Promise} Respuesta de la petición
 */
export const download = (url, params = {}, filename = 'download') => {
  return api.get(url, {
    params,
    responseType: 'blob'
  }).then(response => {
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  })
}

/**
 * Realiza múltiples peticiones en paralelo
 * @param {Array} requests - Array de peticiones
 * @returns {Promise} Respuestas de las peticiones
 */
export const all = (requests) => {
  return Promise.all(requests)
}

/**
 * Realiza múltiples peticiones en paralelo con manejo de errores
 * @param {Array} requests - Array de peticiones
 * @returns {Promise} Respuestas de las peticiones
 */
export const allSettled = (requests) => {
  return Promise.allSettled(requests)
}

/**
 * Configuración de timeout personalizado
 * @param {number} timeout - Timeout en milisegundos
 * @returns {object} Configuración de Axios
 */
export const withTimeout = (timeout) => {
  return { timeout }
}

/**
 * Configuración para petición silenciosa (sin toast de error)
 * @returns {object} Configuración de Axios
 */
export const silent = () => {
  return { silent: true }
}

/**
 * Configuración para petición con retry automático
 * @param {number} retries - Número de reintentos
 * @param {number} delay - Delay entre reintentos en ms
 * @returns {object} Configuración de Axios
 */
export const withRetry = (retries = 3, delay = 1000) => {
  return { retries, retryDelay: delay }
}

// Exportar la instancia de Axios para uso directo
export default api