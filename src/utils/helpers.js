// Utilidades y funciones helper del sistema

/**
 * Formatea una fecha a string legible
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'time')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  }
  
  return d.toLocaleDateString('es-ES', options[format] || options.short)
}

/**
 * Formatea una fecha y hora completa
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatea una fecha en tiempo relativo (hace X minutos/horas/días)
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Fecha no disponible'
  
  try {
    // Intentar parsear la fecha
    const fecha = new Date(date)
    
    // Validar que la fecha sea válida
    if (isNaN(fecha.getTime())) {
      console.warn('Fecha inválida:', date)
      return 'Fecha inválida'
    }
    
    const now = new Date()
    const diff = now.getTime() - fecha.getTime()
    
    // Si la diferencia es negativa, la fecha es en el futuro (error de zona horaria)
    if (diff < 0) {
      // Si la diferencia es muy grande (más de 1 día), probablemente es un error de zona horaria
      // Intentar ajustar asumiendo que la fecha viene en UTC pero se interpretó como local
      const fechaUTC = new Date(date + (date.includes('Z') ? '' : 'Z'))
      if (!isNaN(fechaUTC.getTime())) {
        const diffUTC = now.getTime() - fechaUTC.getTime()
        if (diffUTC >= 0 && diffUTC < 86400000 * 365) { // Menos de 1 año
          return formatRelativeTimeFromDiff(diffUTC)
        }
      }
      return 'hace un momento'
    }
    
    return formatRelativeTimeFromDiff(diff)
  } catch (error) {
    console.error('Error formateando fecha relativa:', error, date)
    return 'Fecha inválida'
  }
}

/**
 * Formatea el tiempo relativo desde una diferencia en milisegundos
 */
const formatRelativeTimeFromDiff = (diffMs) => {
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `hace ${years} año${years > 1 ? 's' : ''}`
  if (months > 0) return `hace ${months} mes${months > 1 ? 'es' : ''}`
  if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  if (seconds > 0) return `hace ${seconds} segundo${seconds > 1 ? 's' : ''}`
  return 'hace un momento'
}

/**
 * Formatea un número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Formatear según longitud
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  
  return phone
}

/**
 * Formatea un CI boliviano
 * @param {string} ci - Cédula de identidad
 * @returns {string} CI formateado
 */
export const formatCI = (ci) => {
  if (!ci) return ''
  
  const cleaned = ci.replace(/\D/g, '')
  
  if (cleaned.length === 7) {
    return cleaned.replace(/(\d{3})(\d{4})/, '$1-$2')
  } else if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3')
  }
  
  return ci
}

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalizeWords = (str) => {
  if (!str) return ''
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength) + '...'
}

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Debounce function para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si un teléfono es válido
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7
}

/**
 * Valida si un CI es válido
 * @param {string} ci - CI a validar
 * @returns {boolean} True si es válido
 */
export const isValidCI = (ci) => {
  const ciRegex = /^[\d]{7,8}$/
  return ciRegex.test(ci)
}

/**
 * Calcula la edad basada en la fecha de nacimiento
 * @param {Date|string} birthDate - Fecha de nacimiento
 * @returns {number} Edad en años
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0
  
  const today = new Date()
  const birth = new Date(birthDate)
  
  if (isNaN(birth.getTime())) return 0
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Convierte bytes a formato legible
 * @param {number} bytes - Bytes a convertir
 * @returns {string} Tamaño formateado
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtiene el color para una materia basado en su ID
 * @param {number} materiaId - ID de la materia
 * @returns {string} Color hexadecimal
 */
export const getMateriaColor = (materiaId) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ]
  
  return colors[materiaId % colors.length]
}

/**
 * Calcula el porcentaje de asistencia
 * @param {number} presentes - Número de asistencias presentes
 * @param {number} total - Total de clases
 * @returns {number} Porcentaje de asistencia
 */
export const calculateAttendancePercentage = (presentes, total) => {
  if (total === 0) return 0
  return Math.round((presentes / total) * 100)
}

/**
 * Obtiene el estado de asistencia basado en el porcentaje
 * @param {number} percentage - Porcentaje de asistencia
 * @returns {object} Estado de asistencia
 */
export const getAttendanceStatus = (percentage) => {
  if (percentage >= 80) {
    return { status: 'excelente', color: 'green', text: 'Excelente' }
  } else if (percentage >= 70) {
    return { status: 'bueno', color: 'blue', text: 'Bueno' }
  } else if (percentage >= 60) {
    return { status: 'regular', color: 'yellow', text: 'Regular' }
  } else {
    return { status: 'deficiente', color: 'red', text: 'Deficiente' }
  }
}

/**
 * Valida si hay conflicto de horarios
 * @param {Array} horarios - Array de horarios
 * @param {Object} nuevoHorario - Nuevo horario a validar
 * @returns {Array} Array de conflictos encontrados
 */
export const validateScheduleConflicts = (horarios, nuevoHorario) => {
  const conflictos = []
  
  horarios.forEach(horario => {
    // Verificar conflicto de docente
    if (horario.docente_id === nuevoHorario.docente_id) {
      if (isTimeOverlap(horario, nuevoHorario)) {
        conflictos.push({
          tipo: 'docente',
          mensaje: `El docente ya tiene clase en este horario`,
          horario: horario
        })
      }
    }
    
    // Verificar conflicto de aula
    if (horario.aula_id === nuevoHorario.aula_id) {
      if (isTimeOverlap(horario, nuevoHorario)) {
        conflictos.push({
          tipo: 'aula',
          mensaje: `El aula ya está ocupada en este horario`,
          horario: horario
        })
      }
    }
    
    // Verificar conflicto de grupo
    if (horario.grupo_id === nuevoHorario.grupo_id) {
      if (isTimeOverlap(horario, nuevoHorario)) {
        conflictos.push({
          tipo: 'grupo',
          mensaje: `El grupo ya tiene clase en este horario`,
          horario: horario
        })
      }
    }
  })
  
  return conflictos
}

/**
 * Verifica si dos horarios se superponen
 * @param {Object} horario1 - Primer horario
 * @param {Object} horario2 - Segundo horario
 * @returns {boolean} True si hay superposición
 */
const isTimeOverlap = (horario1, horario2) => {
  if (horario1.dia !== horario2.dia) return false
  
  const inicio1 = timeToMinutes(horario1.hora_inicio)
  const fin1 = timeToMinutes(horario1.hora_fin)
  const inicio2 = timeToMinutes(horario2.hora_inicio)
  const fin2 = timeToMinutes(horario2.hora_fin)
  
  return inicio1 < fin2 && inicio2 < fin1
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
 * Genera un código QR único para asistencia
 * @param {number} horarioId - ID del horario
 * @param {string} fecha - Fecha de la clase
 * @returns {string} Código QR
 */
export const generateQRCode = (horarioId, fecha) => {
  const timestamp = Date.now()
  const data = {
    horarioId,
    fecha,
    timestamp,
    type: 'asistencia'
  }
  
  return btoa(JSON.stringify(data))
}

/**
 * Valida un código QR de asistencia
 * @param {string} qrCode - Código QR a validar
 * @returns {Object|null} Datos del QR o null si es inválido
 */
export const validateQRCode = (qrCode) => {
  try {
    const data = JSON.parse(atob(qrCode))
    
    // Verificar que el QR no sea muy antiguo (1 hora)
    const now = Date.now()
    const qrTime = data.timestamp
    const maxAge = 60 * 60 * 1000 // 1 hora en ms
    
    if (now - qrTime > maxAge) {
      return null
    }
    
    return data
  } catch (error) {
    return null
  }
}

/**
 * Exporta datos a CSV
 * @param {Array} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Descarga un archivo desde una URL
 * @param {string} url - URL del archivo
 * @param {string} filename - Nombre del archivo
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si se copió exitosamente
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback para navegadores más antiguos
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return true
  }
}

/**
 * Obtiene el nombre del día de la semana
 * @param {number} dayNumber - Número del día (1-7)
 * @returns {string} Nombre del día
 */
export const getDayName = (dayNumber) => {
  const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  return days[dayNumber] || ''
}

/**
 * Obtiene el nombre corto del día de la semana
 * @param {number} dayNumber - Número del día (1-7)
 * @returns {string} Nombre corto del día
 */
export const getShortDayName = (dayNumber) => {
  const days = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return days[dayNumber] || ''
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  
  const diffTime = Math.abs(d2 - d1)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Verifica si una fecha está en el rango especificado
 * @param {Date|string} date - Fecha a verificar
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {boolean} True si está en el rango
 */
export const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(d.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false
  }
  
  return d >= start && d <= end
}