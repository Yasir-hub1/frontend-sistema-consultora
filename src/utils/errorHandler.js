/**
 * Extrae el mensaje de error de una respuesta o error
 * @param {object|Error} error - Error o respuesta del servicio
 * @returns {string} Mensaje de error
 */
export const getErrorMessage = (error) => {
  // Si es una respuesta de servicio con estructura {success: false, message: '...'}
  if (error && typeof error === 'object') {
    if (error.message) {
      return error.message
    }
    if (error.success === false && error.message) {
      return error.message
    }
  }

  // Si es un error de axios
  if (error?.response) {
    const data = error.response.data
    
    // Mensaje directo del backend
    if (data?.message) {
      return data.message
    }
    
    // Errores de validación (422)
    if (error.response.status === 422 && data?.errors) {
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
    }
    
    // Otro campo de error
    if (data?.error) {
      return data.error
    }
  }

  // Mensaje del error
  if (error?.message) {
    return error.message
  }

  // Mensaje por defecto
  return 'Ha ocurrido un error inesperado'
}

