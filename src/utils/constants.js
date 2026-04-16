// Constantes — LaboraConsult frontend

export const APP_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  appName: import.meta.env.VITE_APP_NAME || 'LaboraConsult',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || false,
}

/** Origen del backend sin `/api` (p. ej. archivos en `/storage`). */
export function getApiOrigin() {
  return (APP_CONFIG.apiUrl || '').replace(/\/?api\/?$/i, '')
}

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN_ADMIN: '/auth/admin/login',
    LOGIN_ESTUDIANTE: '/auth/estudiante/login',
    LOGOUT: '/auth/logout',
    PERFIL: '/auth/perfil',
    REFRESH: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/change-password',
    // Mantener para compatibilidad
    LOGIN: '/auth/admin/login',
    ME: '/auth/perfil',
  },
  
  // Usuarios
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    SHOW: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    IMPORT: '/users/import',
    TOGGLE_STATUS: (id) => `/users/${id}/toggle-status`,
  },
  
  // Docentes
  DOCENTES: {
    LIST: '/docentes',
    CREATE: '/docentes',
    SHOW: (id) => `/docentes/${id}`,
    UPDATE: (id) => `/docentes/${id}`,
    DELETE: (id) => `/docentes/${id}`,
    CARGA_HORARIA: (id) => `/docentes/${id}/carga-horaria`,
    ASISTENCIAS: (id) => `/docentes/${id}/asistencias`,
    ESTADISTICAS: (id) => `/docentes/${id}/estadisticas`,
  },
  
  // Materias
  MATERIAS: {
    LIST: '/materias',
    CREATE: '/materias',
    SHOW: (id) => `/materias/${id}`,
    UPDATE: (id) => `/materias/${id}`,
    DELETE: (id) => `/materias/${id}`,
    SEARCH: '/materias/search',
  },
  
  // Aulas
  AULAS: {
    LIST: '/aulas',
    CREATE: '/aulas',
    SHOW: (id) => `/aulas/${id}`,
    UPDATE: (id) => `/aulas/${id}`,
    DELETE: (id) => `/aulas/${id}`,
    DISPONIBLES: '/aulas/disponibles',
    OCUPACION: (id) => `/aulas/${id}/ocupacion`,
  },
  
  // Grupos
  GRUPOS: {
    LIST: '/grupos',
    CREATE: '/grupos',
    SHOW: (id) => `/grupos/${id}`,
    UPDATE: (id) => `/grupos/${id}`,
    DELETE: (id) => `/grupos/${id}`,
    POR_GESTION: (id) => `/grupos/gestion/${id}`,
  },
  
  // Horarios
  HORARIOS: {
    LIST: '/horarios',
    CREATE: '/horarios',
    SHOW: (id) => `/horarios/${id}`,
    UPDATE: (id) => `/horarios/${id}`,
    DELETE: (id) => `/horarios/${id}`,
    VALIDAR: '/horarios/validar',
    SEMANAL: '/horarios/semanal',
    DOCENTE: (id) => `/horarios/docente/${id}`,
    GRUPO: (id) => `/horarios/grupo/${id}`,
    AULA: (id) => `/horarios/aula/${id}`,
  },
  
  // Asistencias
  ASISTENCIAS: {
    LIST: '/asistencias',
    CREATE: '/asistencias',
    SHOW: (id) => `/asistencias/${id}`,
    UPDATE: (id) => `/asistencias/${id}`,
    DELETE: (id) => `/asistencias/${id}`,
    QR: '/asistencias/qr',
    DOCENTE: (id) => `/asistencias/docente/${id}`,
    HORARIO: (id) => `/asistencias/horario/${id}`,
    GENERAR_QR: (id) => `/asistencias/generar-qr/${id}`,
  },
  
  // Reportes
  REPORTES: {
    HORARIOS_SEMANAL: '/reportes/horarios-semanal',
    ASISTENCIA_DOCENTE: '/reportes/asistencia-docente',
    CARGA_HORARIA: '/reportes/carga-horaria',
    AULAS_OCUPACION: '/reportes/aulas-ocupacion',
    EXPORT_PDF: '/reportes/export-pdf',
    EXPORT_EXCEL: '/reportes/export-excel',
  },
  
  // Dashboard
  DASHBOARD: {
    ESTADISTICAS: '/dashboard/estadisticas',
    DOCENTE: '/dashboard/docente',
    COORDINADOR: '/dashboard/coordinador',
    ADMIN: '/dashboard/admin',
  },
}

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada exitosamente',
    CREATE: 'Registro creado exitosamente',
    UPDATE: 'Registro actualizado exitosamente',
    DELETE: 'Registro eliminado exitosamente',
    IMPORT: 'Importación completada exitosamente',
    EXPORT: 'Exportación completada exitosamente',
  },
  
  ERROR: {
    FETCH: 'No se pudieron obtener los datos',
    LOGIN: 'Error al iniciar sesión',
    LOGOUT: 'Error al cerrar sesión',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    NOT_FOUND: 'Recurso no encontrado',
    SERVER_ERROR: 'Error del servidor',
    NETWORK: 'Error de conexión',
    VALIDATION: 'Datos de validación incorrectos',
    CREATE: 'Error al crear registro',
    UPDATE: 'Error al actualizar registro',
    DELETE: 'Error al eliminar registro',
    IMPORT: 'Error al importar datos',
    EXPORT: 'Error al exportar datos',
  },
  
  /** @deprecated Preferir MESSAGES.ERROR.FETCH */
  ERROR_FETCH: 'No se pudieron obtener los datos',

  VALIDATION: {
    REQUIRED: 'Este campo es obligatorio',
    EMAIL: 'Debe ser un email válido',
    MIN_LENGTH: 'Debe tener al menos {min} caracteres',
    MAX_LENGTH: 'No puede tener más de {max} caracteres',
    UNIQUE: 'Este valor ya existe',
    CONFIRMED: 'Las contraseñas no coinciden',
    DATE: 'Debe ser una fecha válida',
    TIME: 'Debe ser una hora válida',
    NUMBER: 'Debe ser un número válido',
    POSITIVE: 'Debe ser un número positivo',
  },
}

/**
 * Roles del sistema (en mayúsculas como en el backend)
 * @deprecated Usar roleUtils.js en su lugar
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  DOCENTE: 'DOCENTE',
  ESTUDIANTE: 'ESTUDIANTE',
}

export const PERMISSIONS = {
  // Usuarios
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_IMPORT: 'users.import',
  
  // Docentes
  DOCENTES_VIEW: 'docentes.view',
  DOCENTES_CREATE: 'docentes.create',
  DOCENTES_UPDATE: 'docentes.update',
  DOCENTES_DELETE: 'docentes.delete',
  
  // Materias
  MATERIAS_VIEW: 'materias.view',
  MATERIAS_CREATE: 'materias.create',
  MATERIAS_UPDATE: 'materias.update',
  MATERIAS_DELETE: 'materias.delete',
  
  // Aulas
  AULAS_VIEW: 'aulas.view',
  AULAS_CREATE: 'aulas.create',
  AULAS_UPDATE: 'aulas.update',
  AULAS_DELETE: 'aulas.delete',
  
  // Grupos
  GRUPOS_VIEW: 'grupos.view',
  GRUPOS_CREATE: 'grupos.create',
  GRUPOS_UPDATE: 'grupos.update',
  GRUPOS_DELETE: 'grupos.delete',
  
  // Horarios
  HORARIOS_VIEW: 'horarios.view',
  HORARIOS_CREATE: 'horarios.create',
  HORARIOS_UPDATE: 'horarios.update',
  HORARIOS_DELETE: 'horarios.delete',
  
  // Asistencias
  ASISTENCIAS_VIEW: 'asistencias.view',
  ASISTENCIAS_CREATE: 'asistencias.create',
  ASISTENCIAS_UPDATE: 'asistencias.update',
  ASISTENCIAS_DELETE: 'asistencias.delete',
  
  // Reportes
  REPORTES_VIEW: 'reportes.view',
  REPORTES_EXPORT: 'reportes.export',
}

export const STATUS = {
  ACTIVE: 'activo',
  INACTIVE: 'inactivo',
  PENDING: 'pendiente',
  COMPLETED: 'completado',
  CANCELLED: 'cancelado',
}

export const ATTENDANCE_STATUS = {
  PRESENTE: 'presente',
  AUSENTE: 'ausente',
  TARDANZA: 'tardanza',
  JUSTIFICADO: 'justificado',
}

export const ATTENDANCE_METHOD = {
  FORMULARIO: 'formulario',
  QR: 'qr',
  MANUAL: 'manual',
}

export const CLASSROOM_TYPES = {
  AULA: 'aula',
  LABORATORIO: 'laboratorio',
  AUDITORIO: 'auditorio',
}

export const DAYS_OF_WEEK = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

export const TIME_SLOTS = [
  '06:45', '08:15', '09:45', '11:15', '12:45', '14:15', '15:45', '17:15', '18:45', '20:15', '21:45'
]

export const PAGINATION = {
  DEFAULT_PER_PAGE: 15,
  PER_PAGE_OPTIONS: [10, 15, 25, 50, 100],
}

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
}

export const FILE_TYPES = {
  EXCEL: ['xlsx', 'xls'],
  CSV: ['csv'],
  PDF: ['pdf'],
  IMAGE: ['jpg', 'jpeg', 'png', 'gif'],
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const QR_CONFIG = {
  SIZE: 200,
  MARGIN: 4,
  EXPIRY_MINUTES: 30,
}

export const SCHEDULE_CONFIG = {
  START_TIME: '06:45',
  END_TIME: '22:00',
  DURATION_MINUTES: 90,
  TOLERANCE_MINUTES: 15,
}

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
}

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
}