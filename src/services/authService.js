// Servicio de autenticación — HUMBERTO MORENO PEREZ (Sanctum)

import { get, post, put } from './api'
import { MESSAGES } from '../utils/constants'
import { normalizeRole } from '../utils/roleUtils'

function mapLaboraUser(raw) {
  if (!raw) return raw
  const u = { ...raw }
  const tipo = u.tipo || u.tipo_usuario
  if (tipo && !u.rol) {
    u.rol = normalizeRole(tipo)
  } else if (u.rol) {
    u.rol = normalizeRole(u.rol)
  }
  const dc = u.debe_cambiar_contrasena ?? u.debe_cambiar_password
  u.debe_cambiar_contrasena = Boolean(dc)
  u.debe_cambiar_password = u.debe_cambiar_contrasena
  return u
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión para administradores
   * @param {object} credentials - Credenciales de login
   * @param {string} credentials.email - Email del usuario (opcional)
   * @param {string} credentials.ci - CI del usuario (opcional, alternativo a email)
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<object>} Respuesta con token y usuario
   */
  async loginAdmin(credentials) {
    try {
      const response = await post('/auth/admin/login', credentials)
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            token: response.data.token,
            user: response.data.user,
            token_type: response.data.token_type,
            expires_in: response.data.expires_in,
            debe_cambiar_password: response.data.debe_cambiar_password || response.data.user?.debe_cambiar_password || false
          },
          message: MESSAGES.SUCCESS.LOGIN
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR.LOGIN
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || MESSAGES.ERROR.LOGIN
      }
    }
  },

  /**
   * Iniciar sesión para docentes
   * @param {object} credentials - Credenciales de login
   * @param {string} credentials.email - Email del docente (opcional)
   * @param {string} credentials.ci - CI del docente (opcional, alternativo a email)
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<object>} Respuesta con token y usuario
   */
  async loginDocente(credentials) {
    try {
      const response = await post('/auth/docente/login', credentials)
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            token: response.data.token,
            user: response.data.user,
            token_type: response.data.token_type,
            expires_in: response.data.expires_in,
            debe_cambiar_password: response.data.debe_cambiar_password || response.data.user?.debe_cambiar_password || false
          },
          message: MESSAGES.SUCCESS.LOGIN
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR.LOGIN
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || MESSAGES.ERROR.LOGIN
      }
    }
  },

  /**
   * Iniciar sesión para estudiantes
   * @param {object} credentials - Credenciales de login
   * @param {string} credentials.ci - CI del estudiante
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<object>} Respuesta con token y usuario
   */
  async loginEstudiante(credentials) {
    try {
      const response = await post('/auth/estudiante/login', credentials)
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            token: response.data.token,
            user: response.data.user || response.data.data,
            token_type: response.data.token_type,
            expires_in: response.data.expires_in
          },
          message: MESSAGES.SUCCESS.LOGIN
        }
      } else {
        return {
          success: false,
          message: response.data.message || MESSAGES.ERROR.LOGIN
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || MESSAGES.ERROR.LOGIN
      }
    }
  },

  /**
   * Login unificado HUMBERTO MORENO PEREZ — el backend discrimina por `usuarios.tipo`.
   * POST /auth/login
   */
  async loginLaboraConsult(credentials) {
    try {
      const body = {
        correo: credentials.correo || credentials.email,
        email: credentials.email || credentials.correo,
        nombre_usuario: credentials.nombre_usuario,
        password: credentials.password,
      }
      const response = await post('/auth/login', body)
      const d = response.data
      const token = d.token || d?.data?.token
      const userRaw = d.user || d?.data?.user || d?.data

      if (token && userRaw && typeof userRaw === 'object' && !userRaw.token) {
        const user = mapLaboraUser(userRaw)
        return {
          success: true,
          data: {
            token,
            user,
            token_type: d.token_type || d?.data?.token_type || 'Bearer',
            debe_cambiar_password: user.debe_cambiar_contrasena,
            debe_cambiar_contrasena: user.debe_cambiar_contrasena,
          },
          message: MESSAGES.SUCCESS.LOGIN,
        }
      }

      if (d.success && token && userRaw) {
        const user = mapLaboraUser(userRaw)
        return {
          success: true,
          data: {
            token,
            user,
            token_type: d.token_type || d?.data?.token_type || 'Bearer',
            debe_cambiar_password: user.debe_cambiar_contrasena,
            debe_cambiar_contrasena: user.debe_cambiar_contrasena,
          },
          message: d.message || MESSAGES.SUCCESS.LOGIN,
        }
      }

      return {
        success: false,
        message: d.message || MESSAGES.ERROR.LOGIN,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || MESSAGES.ERROR.LOGIN,
      }
    }
  },

  /** POST /auth/activar — establecer contraseña con token de correo (Fase 1). */
  async activarCuenta(payload) {
    try {
      const response = await post('/auth/activar', payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.VALIDATION }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR.VALIDATION,
      }
    }
  },

  /** POST /auth/cambiar-contrasena-inicial — usuario autenticado, primer cambio obligatorio. */
  async cambiarContrasenaInicial(payload) {
    try {
      const response = await post('/auth/cambiar-contrasena-inicial', payload)
      if (response.data.success) {
        const raw = response.data.data?.user ?? response.data.data
        return {
          success: true,
          data: { user: mapLaboraUser(raw) },
          message: response.data.message,
        }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.VALIDATION }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR.VALIDATION,
      }
    }
  },

  /** POST /auth/primer-acceso — contraseña temporal. */
  async primerAcceso(payload) {
    try {
      const response = await post('/auth/primer-acceso', payload)
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, message: response.data.message || MESSAGES.ERROR.VALIDATION }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || MESSAGES.ERROR.VALIDATION,
      }
    }
  },

  /** Entrada única al sistema. */
  async login(credentials) {
    return this.loginLaboraConsult(credentials)
  },

  /**
   * Cerrar sesión
   * @returns {Promise<object>} Respuesta del logout
   */
  async logout() {
    try {
      // Intentar hacer logout en el backend, pero no bloquear si falla
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await post('/auth/logout')
          return {
            success: true,
            message: MESSAGES.SUCCESS.LOGOUT
          }
        } catch (error) {
          // Incluso si hay error en el backend, consideramos el logout exitoso
          // El frontend limpiará todo localmente
          return {
            success: true,
            message: MESSAGES.SUCCESS.LOGOUT
          }
        }
      }
      
      return {
        success: true,
        message: MESSAGES.SUCCESS.LOGOUT
      }
    } catch (error) {
      // Incluso si hay error, consideramos el logout exitoso
      return {
        success: true,
        message: MESSAGES.SUCCESS.LOGOUT
      }
    }
  },

  /**
   * Obtener usuario actual (perfil)
   * @returns {Promise<object>} Datos del usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await get('/auth/perfil')
      
      if (response.data.success) {
        const raw = response.data.data || response.data.user || response.data
        const userObj =
          raw && typeof raw === 'object' && 'user' in raw && raw.user ? raw.user : raw

        return {
          success: true,
          data: mapLaboraUser(userObj),
        }
      } else {
        // Si no hay datos válidos, lanzar error para que se limpie la sesión
        throw new Error(response.data.message || 'Error al obtener usuario')
      }
    } catch (error) {
      // Si es 401 o cualquier error, lanzar para que se limpie
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        sessionStorage.clear()
      }
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener usuario')
    }
  },

  /**
   * Refrescar token
   * @returns {Promise<object>} Nuevo token
   */
  async refreshToken() {
    try {
      const response = await post('/auth/refresh')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.message || 'Error al refrescar token')
      }
    } catch (error) {
      throw new Error(error.message || 'Error al refrescar token')
    }
  },

  /**
   * Actualizar perfil de usuario
   * @param {object} data - Datos del perfil
   * @returns {Promise<object>} Usuario actualizado
   */
  async updateProfile(data) {
    try {
      const response = await put('/auth/profile', data)
      
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
   * Cambiar contraseña
   * @param {object} data - Datos del cambio de contraseña
   * @param {string} data.current_password - Contraseña actual
   * @param {string} data.new_password - Nueva contraseña
   * @param {string} data.new_password_confirmation - Confirmación de nueva contraseña
   * @returns {Promise<object>} Respuesta del cambio
   */
  async changePassword(data) {
    try {
      const response = await put('/auth/change-password', data)
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Contraseña actualizada exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al cambiar contraseña'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al cambiar contraseña'
      }
    }
  },

  /**
   * Solicitar restablecimiento de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<object>} Respuesta de la solicitud
   */
  async requestPasswordReset(email) {
    try {
      const response = await post('/auth/forgot-password', { email })
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Se ha enviado un enlace de restablecimiento a tu email'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al solicitar restablecimiento'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al solicitar restablecimiento'
      }
    }
  },

  /**
   * Restablecer contraseña
   * @param {object} data - Datos del restablecimiento
   * @param {string} data.token - Token de restablecimiento
   * @param {string} data.email - Email del usuario
   * @param {string} data.password - Nueva contraseña
   * @param {string} data.password_confirmation - Confirmación de nueva contraseña
   * @returns {Promise<object>} Respuesta del restablecimiento
   */
  async resetPassword(data) {
    try {
      const response = await post('/auth/reset-password', data)
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Contraseña restablecida exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al restablecer contraseña'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al restablecer contraseña'
      }
    }
  },

  /**
   * Verificar token de restablecimiento
   * @param {string} token - Token a verificar
   * @returns {Promise<object>} Respuesta de la verificación
   */
  async verifyResetToken(token) {
    try {
      const response = await get(`/auth/verify-reset-token/${token}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Token inválido'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Token inválido'
      }
    }
  },

  /**
   * Verificar email
   * @param {string} token - Token de verificación
   * @returns {Promise<object>} Respuesta de la verificación
   */
  async verifyEmail(token) {
    try {
      const response = await post('/auth/verify-email', { token })
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Email verificado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al verificar email'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al verificar email'
      }
    }
  },

  /**
   * Reenviar email de verificación
   * @returns {Promise<object>} Respuesta del reenvío
   */
  async resendVerificationEmail() {
    try {
      const response = await post('/auth/resend-verification')
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Email de verificación reenviado'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al reenviar email'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al reenviar email'
      }
    }
  },

  /**
   * Obtener permisos del usuario
   * @returns {Promise<object>} Permisos del usuario
   */
  async getPermissions() {
    try {
      const response = await get('/auth/permissions')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.message || 'Error al obtener permisos')
      }
    } catch (error) {
      throw new Error(error.message || 'Error al obtener permisos')
    }
  },

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} permission - Permiso a verificar
   * @returns {Promise<boolean>} True si tiene el permiso
   */
  async hasPermission(permission) {
    try {
      const response = await get(`/auth/has-permission/${permission}`)
      return response.data.success && response.data.data.has_permission
    } catch (error) {
      return false
    }
  },

  /**
   * Obtener roles del usuario
   * @returns {Promise<object>} Roles del usuario
   */
  async getRoles() {
    try {
      const response = await get('/auth/roles')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.message || 'Error al obtener roles')
      }
    } catch (error) {
      throw new Error(error.message || 'Error al obtener roles')
    }
  },

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {Promise<boolean>} True si tiene el rol
   */
  async hasRole(role) {
    try {
      const response = await get(`/auth/has-role/${role}`)
      return response.data.success && response.data.data.has_role
    } catch (error) {
      return false
    }
  },

  /**
   * Registrar un nuevo estudiante
   * @param {object} data - Datos del estudiante
   * @param {string} data.ci - CI del estudiante
   * @param {string} data.nombre - Nombre del estudiante
   * @param {string} data.apellido - Apellido del estudiante
   * @param {string} data.celular - Celular del estudiante
   * @param {string} data.fecha_nacimiento - Fecha de nacimiento
   * @param {string} data.direccion - Dirección
   * @param {string} data.provincia - Provincia
   * @param {string} data.password - Contraseña
   * @param {string} data.password_confirmation - Confirmación de contraseña
   * @returns {Promise<object>} Respuesta con token y usuario
   */
  async registrarEstudiante(data) {
    try {
      const response = await post('/auth/estudiante/registrar', data)
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            token: response.data.token,
            user: response.data.user || response.data.data,
            token_type: response.data.token_type || 'bearer',
            expires_in: response.data.expires_in
          },
          message: response.data.message || 'Registro exitoso. Bienvenido al sistema'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el registro',
          errors: response.data.errors
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al registrar',
        errors: error.response?.data?.errors
      }
    }
  }
}