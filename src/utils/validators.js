// Validadores para formularios del sistema

import { VALIDATION_RULES } from './constants'

/**
 * Validador requerido
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const required = (value, fieldName = 'Este campo') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} es obligatorio`
  }
  return null
}

/**
 * Validador de email
 * @param {string} value - Email a validar
 * @returns {string|null} Mensaje de error o null
 */
export const email = (value) => {
  if (!value) return null
  
  if (!VALIDATION_RULES.EMAIL_REGEX.test(value)) {
    return 'El email no es válido'
  }
  return null
}

/**
 * Validador de teléfono
 * @param {string} value - Teléfono a validar
 * @returns {string|null} Mensaje de error o null
 */
export const phone = (value) => {
  if (!value) return null
  
  if (!VALIDATION_RULES.PHONE_REGEX.test(value)) {
    return 'El teléfono no es válido'
  }
  
  const digits = value.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) {
    return 'El teléfono debe tener entre 7 y 15 dígitos'
  }
  
  return null
}

/**
 * Validador de CI boliviano
 * @param {string} value - CI a validar
 * @returns {string|null} Mensaje de error o null
 */
export const ci = (value) => {
  if (!value) return null
  
  const cleaned = value.replace(/\D/g, '')
  
  if (!VALIDATION_RULES.CI_REGEX.test(cleaned)) {
    return 'El CI debe tener 7 u 8 dígitos'
  }
  
  return null
}

/**
 * Validador de longitud mínima
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const minLength = (value, minLength, fieldName = 'Este campo') => {
  if (!value) return null
  
  if (value.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`
  }
  return null
}

/**
 * Validador de longitud máxima
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const maxLength = (value, maxLength, fieldName = 'Este campo') => {
  if (!value) return null
  
  if (value.length > maxLength) {
    return `${fieldName} no puede tener más de ${maxLength} caracteres`
  }
  return null
}

/**
 * Validador de contraseña
 * @param {string} value - Contraseña a validar
 * @returns {string|null} Mensaje de error o null
 */
export const password = (value) => {
  if (!value) return null
  
  if (value.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`
  }
  
  // Verificar que tenga al menos una letra mayúscula
  if (!/[A-Z]/.test(value)) {
    return 'La contraseña debe tener al menos una letra mayúscula'
  }
  
  // Verificar que tenga al menos una letra minúscula
  if (!/[a-z]/.test(value)) {
    return 'La contraseña debe tener al menos una letra minúscula'
  }
  
  // Verificar que tenga al menos un número
  if (!/\d/.test(value)) {
    return 'La contraseña debe tener al menos un número'
  }
  
  return null
}

/**
 * Validador de confirmación de contraseña
 * @param {string} value - Confirmación de contraseña
 * @param {string} password - Contraseña original
 * @returns {string|null} Mensaje de error o null
 */
export const confirmPassword = (value, password) => {
  if (!value) return null
  
  if (value !== password) {
    return 'Las contraseñas no coinciden'
  }
  return null
}

/**
 * Validador de número
 * @param {string|number} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const number = (value, fieldName = 'Este campo') => {
  if (!value) return null
  
  if (isNaN(value) || value === '') {
    return `${fieldName} debe ser un número válido`
  }
  return null
}

/**
 * Validador de número mínimo
 * @param {string|number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const min = (value, min, fieldName = 'Este campo') => {
  if (!value) return null
  
  const numValue = Number(value)
  if (isNaN(numValue)) {
    return `${fieldName} debe ser un número válido`
  }
  
  if (numValue < min) {
    return `${fieldName} debe ser mayor o igual a ${min}`
  }
  return null
}

/**
 * Validador de número máximo
 * @param {string|number} value - Valor a validar
 * @param {number} max - Valor máximo
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const max = (value, max, fieldName = 'Este campo') => {
  if (!value) return null
  
  const numValue = Number(value)
  if (isNaN(numValue)) {
    return `${fieldName} debe ser un número válido`
  }
  
  if (numValue > max) {
    return `${fieldName} debe ser menor o igual a ${max}`
  }
  return null
}

/**
 * Validador de fecha
 * @param {string|Date} value - Fecha a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const date = (value, fieldName = 'Este campo') => {
  if (!value) return null
  
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return `${fieldName} debe ser una fecha válida`
  }
  return null
}

/**
 * Validador de fecha mínima
 * @param {string|Date} value - Fecha a validar
 * @param {string|Date} minDate - Fecha mínima
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const minDate = (value, minDate, fieldName = 'Este campo') => {
  if (!value) return null
  
  const date = new Date(value)
  const min = new Date(minDate)
  
  if (isNaN(date.getTime()) || isNaN(min.getTime())) {
    return `${fieldName} debe ser una fecha válida`
  }
  
  if (date < min) {
    return `${fieldName} debe ser posterior a ${minDate}`
  }
  return null
}

/**
 * Validador de fecha máxima
 * @param {string|Date} value - Fecha a validar
 * @param {string|Date} maxDate - Fecha máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const maxDate = (value, maxDate, fieldName = 'Este campo') => {
  if (!value) return null
  
  const date = new Date(value)
  const max = new Date(maxDate)
  
  if (isNaN(date.getTime()) || isNaN(max.getTime())) {
    return `${fieldName} debe ser una fecha válida`
  }
  
  if (date > max) {
    return `${fieldName} debe ser anterior a ${maxDate}`
  }
  return null
}

/**
 * Validador de hora
 * @param {string} value - Hora a validar (formato HH:MM)
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const time = (value, fieldName = 'Este campo') => {
  if (!value) return null
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(value)) {
    return `${fieldName} debe tener el formato HH:MM`
  }
  return null
}

/**
 * Validador de hora mínima
 * @param {string} value - Hora a validar
 * @param {string} minTime - Hora mínima
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const minTime = (value, minTime, fieldName = 'Este campo') => {
  if (!value) return null
  
  const timeError = time(value, fieldName)
  if (timeError) return timeError
  
  const valueMinutes = timeToMinutes(value)
  const minMinutes = timeToMinutes(minTime)
  
  if (valueMinutes < minMinutes) {
    return `${fieldName} debe ser posterior a ${minTime}`
  }
  return null
}

/**
 * Validador de hora máxima
 * @param {string} value - Hora a validar
 * @param {string} maxTime - Hora máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const maxTime = (value, maxTime, fieldName = 'Este campo') => {
  if (!value) return null
  
  const timeError = time(value, fieldName)
  if (timeError) return timeError
  
  const valueMinutes = timeToMinutes(value)
  const maxMinutes = timeToMinutes(maxTime)
  
  if (valueMinutes > maxMinutes) {
    return `${fieldName} debe ser anterior a ${maxTime}`
  }
  return null
}

/**
 * Convierte tiempo HH:MM a minutos
 * @param {string} time - Tiempo en formato HH:MM
 * @returns {number} Minutos desde medianoche
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Validador de URL
 * @param {string} value - URL a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const url = (value, fieldName = 'Este campo') => {
  if (!value) return null
  
  try {
    new URL(value)
    return null
  } catch {
    return `${fieldName} debe ser una URL válida`
  }
}

/**
 * Validador de archivo
 * @param {File} file - Archivo a validar
 * @param {Array} allowedTypes - Tipos MIME permitidos
 * @param {number} maxSize - Tamaño máximo en bytes
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const file = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024, fieldName = 'Este archivo') => {
  if (!file) return null
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `${fieldName} debe ser de tipo: ${allowedTypes.join(', ')}`
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    return `${fieldName} no puede ser mayor a ${maxSizeMB}MB`
  }
  
  return null
}

/**
 * Validador de imagen
 * @param {File} file - Archivo de imagen a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const image = (file, fieldName = 'Esta imagen') => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return file(file, allowedTypes, 10 * 1024 * 1024, fieldName)
}

/**
 * Validador de documento
 * @param {File} file - Archivo de documento a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const document = (file, fieldName = 'Este documento') => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  return file(file, allowedTypes, 20 * 1024 * 1024, fieldName)
}

/**
 * Validador personalizado
 * @param {any} value - Valor a validar
 * @param {Function} validator - Función de validación
 * @param {string} errorMessage - Mensaje de error
 * @returns {string|null} Mensaje de error o null
 */
export const custom = (value, validator, errorMessage) => {
  if (!value) return null
  
  if (!validator(value)) {
    return errorMessage
  }
  return null
}

/**
 * Validador de selección múltiple
 * @param {Array} value - Array de valores seleccionados
 * @param {number} minSelections - Mínimo de selecciones
 * @param {number} maxSelections - Máximo de selecciones
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null
 */
export const multiSelect = (value, minSelections = 1, maxSelections = Infinity, fieldName = 'Este campo') => {
  if (!value || !Array.isArray(value)) {
    return `${fieldName} debe ser una selección válida`
  }
  
  if (value.length < minSelections) {
    return `Debe seleccionar al menos ${minSelections} opción(es)`
  }
  
  if (value.length > maxSelections) {
    return `No puede seleccionar más de ${maxSelections} opción(es)`
  }
  
  return null
}

/**
 * Validador de código único
 * @param {string} value - Código a validar
 * @param {Function} checkUnique - Función para verificar unicidad
 * @param {string} fieldName - Nombre del campo
 * @returns {Promise<string|null>} Mensaje de error o null
 */
export const unique = async (value, checkUnique, fieldName = 'Este campo') => {
  if (!value) return null
  
  try {
    const isUnique = await checkUnique(value)
    if (!isUnique) {
      return `${fieldName} ya existe`
    }
    return null
  } catch (error) {
    return 'Error al verificar la unicidad'
  }
}

/**
 * Combinador de validadores
 * @param {Array} validators - Array de funciones validadoras
 * @returns {Function} Función validadora combinada
 */
export const combine = (...validators) => {
  return (value, ...args) => {
    for (const validator of validators) {
      const error = validator(value, ...args)
      if (error) return error
    }
    return null
  }
}

/**
 * Validador condicional
 * @param {Function} condition - Condición para aplicar validación
 * @param {Function} validator - Validador a aplicar
 * @returns {Function} Función validadora condicional
 */
export const conditional = (condition, validator) => {
  return (value, ...args) => {
    if (condition(value, ...args)) {
      return validator(value, ...args)
    }
    return null
  }
}
