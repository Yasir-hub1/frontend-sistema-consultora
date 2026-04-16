// Formateadores para datos del sistema

/**
 * Formatea un número como moneda boliviana
 * @param {number} amount - Cantidad a formatear
 * @param {boolean} showSymbol - Mostrar símbolo de moneda
 * @returns {string} Cantidad formateada
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? 'Bs. 0,00' : '0,00'
  }
  
  const formatter = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return formatter.format(amount)
}

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {number} decimals - Número de decimales
 * @returns {string} Número formateado
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0'
  }
  
  const formatter = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  return formatter.format(number)
}

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }
  
  const formatter = new Intl.NumberFormat('es-BO', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  return formatter.format(value / 100)
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha relativa
 */
export const formatRelativeDate = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const targetDate = new Date(date)
  
  if (isNaN(targetDate.getTime())) return ''
  
  const diffInSeconds = Math.floor((now - targetDate) / 1000)
  
  if (diffInSeconds < 60) {
    return 'hace un momento'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`
}

/**
 * Formatea la duración de una clase
 * @param {string} horaInicio - Hora de inicio
 * @param {string} horaFin - Hora de fin
 * @returns {string} Duración formateada
 */
export const formatDuration = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return ''
  
  const inicio = timeToMinutes(horaInicio)
  const fin = timeToMinutes(horaFin)
  const duracion = fin - inicio
  
  if (duracion <= 0) return ''
  
  const horas = Math.floor(duracion / 60)
  const minutos = duracion % 60
  
  if (horas === 0) {
    return `${minutos} min`
  } else if (minutos === 0) {
    return `${horas}h`
  } else {
    return `${horas}h ${minutos}min`
  }
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
 * Formatea el estado de asistencia
 * @param {string} estado - Estado de asistencia
 * @returns {object} Objeto con información del estado
 */
export const formatAttendanceStatus = (estado) => {
  const estados = {
    presente: {
      text: 'Presente',
      color: 'green',
      icon: '✓',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    ausente: {
      text: 'Ausente',
      color: 'red',
      icon: '✗',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    tardanza: {
      text: 'Tardanza',
      color: 'yellow',
      icon: '⚠',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    },
    justificado: {
      text: 'Justificado',
      color: 'blue',
      icon: 'ℹ',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  }
  
  return estados[estado] || estados.ausente
}

/**
 * Formatea el rol de usuario
 * @param {string} rol - Rol del usuario
 * @returns {object} Objeto con información del rol
 */
export const formatUserRole = (rol) => {
  const roles = {
    admin: {
      text: 'Administrador',
      color: 'purple',
      icon: '👑',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800'
    },
    coordinador: {
      text: 'Coordinador',
      color: 'blue',
      icon: '👨‍💼',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    docente: {
      text: 'Docente',
      color: 'green',
      icon: '👨‍🏫',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    autoridad: {
      text: 'Autoridad',
      color: 'orange',
      icon: '🏛️',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800'
    }
  }
  
  return roles[rol] || roles.docente
}

/**
 * Formatea el estado de un horario
 * @param {string} estado - Estado del horario
 * @returns {object} Objeto con información del estado
 */
export const formatScheduleStatus = (estado) => {
  const estados = {
    activo: {
      text: 'Activo',
      color: 'green',
      icon: '✓',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    inactivo: {
      text: 'Inactivo',
      color: 'gray',
      icon: '○',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    },
    suspendido: {
      text: 'Suspendido',
      color: 'red',
      icon: '⏸',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    completado: {
      text: 'Completado',
      color: 'blue',
      icon: '✓',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  }
  
  return estados[estado] || estados.activo
}

/**
 * Formatea el tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Formatea el nombre completo de una persona
 * @param {string} nombres - Nombres
 * @param {string} apellidos - Apellidos
 * @returns {string} Nombre completo formateado
 */
export const formatFullName = (nombres, apellidos) => {
  const nombresFormatted = nombres ? nombres.trim() : ''
  const apellidosFormatted = apellidos ? apellidos.trim() : ''
  
  if (!nombresFormatted && !apellidosFormatted) {
    return 'Sin nombre'
  }
  
  return `${nombresFormatted} ${apellidosFormatted}`.trim()
}

/**
 * Formatea las iniciales de una persona
 * @param {string} nombres - Nombres
 * @param {string} apellidos - Apellidos
 * @returns {string} Iniciales
 */
export const formatInitials = (nombres, apellidos) => {
  const nombresFormatted = nombres ? nombres.trim() : ''
  const apellidosFormatted = apellidos ? apellidos.trim() : ''
  
  let iniciales = ''
  
  if (nombresFormatted) {
    iniciales += nombresFormatted.charAt(0).toUpperCase()
  }
  
  if (apellidosFormatted) {
    iniciales += apellidosFormatted.charAt(0).toUpperCase()
  }
  
  return iniciales || '?'
}

/**
 * Formatea el código de un grupo
 * @param {string} codigo - Código del grupo
 * @param {string} gestion - Gestión académica
 * @returns {string} Código formateado
 */
export const formatGroupCode = (codigo, gestion) => {
  if (!codigo) return ''
  
  const codigoFormatted = codigo.trim().toUpperCase()
  const gestionFormatted = gestion ? ` - ${gestion}` : ''
  
  return `${codigoFormatted}${gestionFormatted}`
}

/**
 * Formatea el código de una materia
 * @param {string} codigo - Código de la materia
 * @param {string} nombre - Nombre de la materia
 * @returns {string} Código formateado
 */
export const formatSubjectCode = (codigo, nombre) => {
  if (!codigo) return nombre || ''
  
  const codigoFormatted = codigo.trim().toUpperCase()
  const nombreFormatted = nombre ? ` - ${nombre}` : ''
  
  return `${codigoFormatted}${nombreFormatted}`
}

/**
 * Formatea el código de un aula
 * @param {string} codigo - Código del aula
 * @param {string} nombre - Nombre del aula
 * @param {number} capacidad - Capacidad del aula
 * @returns {string} Código formateado
 */
export const formatClassroomCode = (codigo, nombre, capacidad) => {
  if (!codigo) return nombre || ''
  
  const codigoFormatted = codigo.trim().toUpperCase()
  const nombreFormatted = nombre ? ` - ${nombre}` : ''
  const capacidadFormatted = capacidad ? ` (${capacidad} pax)` : ''
  
  return `${codigoFormatted}${nombreFormatted}${capacidadFormatted}`
}

/**
 * Formatea el horario de una clase
 * @param {string} dia - Día de la semana
 * @param {string} horaInicio - Hora de inicio
 * @param {string} horaFin - Hora de fin
 * @returns {string} Horario formateado
 */
export const formatClassSchedule = (dia, horaInicio, horaFin) => {
  if (!dia || !horaInicio || !horaFin) return ''
  
  const diaFormatted = dia.charAt(0).toUpperCase() + dia.slice(1)
  
  return `${diaFormatted} ${horaInicio} - ${horaFin}`
}

/**
 * Formatea el progreso de una tarea
 * @param {number} completado - Tareas completadas
 * @param {number} total - Total de tareas
 * @returns {object} Objeto con información del progreso
 */
export const formatProgress = (completado, total) => {
  if (total === 0) {
    return {
      percentage: 0,
      text: '0%',
      color: 'gray',
      bgColor: 'bg-gray-200'
    }
  }
  
  const percentage = Math.round((completado / total) * 100)
  
  let color = 'gray'
  let bgColor = 'bg-gray-200'
  
  if (percentage >= 80) {
    color = 'green'
    bgColor = 'bg-green-500'
  } else if (percentage >= 60) {
    color = 'yellow'
    bgColor = 'bg-yellow-500'
  } else if (percentage >= 40) {
    color = 'orange'
    bgColor = 'bg-orange-500'
  } else {
    color = 'red'
    bgColor = 'bg-red-500'
  }
  
  return {
    percentage,
    text: `${percentage}%`,
    color,
    bgColor
  }
}

/**
 * Formatea el tiempo restante
 * @param {Date|string} fechaFin - Fecha de finalización
 * @returns {string} Tiempo restante formateado
 */
export const formatTimeRemaining = (fechaFin) => {
  if (!fechaFin) return ''
  
  const ahora = new Date()
  const fin = new Date(fechaFin)
  
  if (isNaN(fin.getTime())) return ''
  
  const diffInSeconds = Math.floor((fin - ahora) / 1000)
  
  if (diffInSeconds <= 0) {
    return 'Tiempo agotado'
  }
  
  const dias = Math.floor(diffInSeconds / (24 * 60 * 60))
  const horas = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutos = Math.floor((diffInSeconds % (60 * 60)) / 60)
  
  if (dias > 0) {
    return `${dias} día${dias !== 1 ? 's' : ''} ${horas}h ${minutos}m`
  } else if (horas > 0) {
    return `${horas}h ${minutos}m`
  } else {
    return `${minutos}m`
  }
}

/**
 * Formatea el estado de conexión
 * @param {boolean} isOnline - Estado de conexión
 * @returns {object} Objeto con información del estado
 */
export const formatConnectionStatus = (isOnline) => {
  return {
    text: isOnline ? 'En línea' : 'Sin conexión',
    color: isOnline ? 'green' : 'red',
    icon: isOnline ? '🟢' : '🔴',
    bgColor: isOnline ? 'bg-green-100' : 'bg-red-100',
    textColor: isOnline ? 'text-green-800' : 'text-red-800'
  }
}
