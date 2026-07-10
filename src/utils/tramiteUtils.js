/** Utilidades UI para trámites — estados, colores y etiquetas. */

export const TRAMITE_ESTADOS = {
  pendiente: {
    label: 'Pendiente',
    badge: 'bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-200',
    dot: 'bg-slate-400',
    gradient: 'from-slate-400 to-slate-500',
  },
  en_proceso: {
    label: 'En proceso',
    badge: 'bg-primary-50 text-primary-800 ring-primary-500/20 dark:bg-primary-950/50 dark:text-primary-200',
    dot: 'bg-primary-500',
    gradient: 'from-primary-400 to-primary-600',
  },
  vencido: {
    label: 'Vencido',
    badge: 'bg-red-50 text-red-800 ring-red-500/20 dark:bg-red-950/40 dark:text-red-200',
    dot: 'bg-red-500 animate-subtle-pulse',
    gradient: 'from-red-400 to-rose-600',
  },
  completado: {
    label: 'Completado',
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-teal-600',
  },
}

/** Colores hex para calendario y leyenda. */
export const TRAMITE_ESTADO_COLORES = {
  pendiente: '#64748b',
  en_proceso: '#0284c7',
  vencido: '#dc2626',
  completado: '#16a34a',
}

export const EVENTO_TIPOS_FILTRO = [
  { key: '', label: 'Todos los eventos' },
  { key: 'creacion', label: 'Creación' },
  { key: 'asignacion', label: 'Asignación' },
  { key: 'tarea_iniciada', label: 'Tarea iniciada' },
  { key: 'tarea_completada', label: 'Tarea completada' },
  { key: 'documento_subido', label: 'Documento cargado' },
  { key: 'estado_cambio', label: 'Cambio de estado' },
  { key: 'cierre', label: 'Cierre' },
  { key: 'otro', label: 'Otros' },
]

export const TAREA_ESTADOS = {
  pendiente: { label: 'Pendiente', icon: '○' },
  en_proceso: { label: 'En curso', icon: '◐' },
  completada: { label: 'Completada', icon: '●' },
}

/** Etiquetas en español para eventos del timeline. */
export const EVENTO_TIPO_CONFIG = {
  creacion: {
    label: 'Creación',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
    dot: 'bg-sky-500',
    card: 'border-sky-200/80 bg-sky-50/40 dark:border-sky-900/50 dark:bg-sky-950/20',
  },
  asignacion: {
    label: 'Asignación',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
    dot: 'bg-violet-500',
    card: 'border-violet-200/80 bg-violet-50/40 dark:border-violet-900/50 dark:bg-violet-950/20',
  },
  tarea_completada: {
    label: 'Tarea completada',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    card: 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20',
  },
  tarea_iniciada: {
    label: 'Tarea iniciada',
    badge: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200',
    dot: 'bg-primary-500',
    card: 'border-primary-200/80 bg-primary-50/40 dark:border-primary-900/50 dark:bg-primary-950/20',
  },
  documento_subido: {
    label: 'Documento cargado',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200',
    dot: 'bg-amber-500',
    card: 'border-amber-200/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20',
  },
  estado_cambio: {
    label: 'Cambio de estado',
    badge: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200',
    dot: 'bg-primary-500',
    card: 'border-primary-200/80 bg-primary-50/40 dark:border-primary-900/50 dark:bg-primary-950/20',
  },
  cierre: {
    label: 'Cierre',
    badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200',
    dot: 'bg-emerald-600',
    card: 'border-emerald-300/80 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/30',
  },
  periodo_renovado: {
    label: 'Nuevo período',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
    dot: 'bg-violet-500',
    card: 'border-violet-200/80 bg-violet-50/40 dark:border-violet-900/50 dark:bg-violet-950/20',
  },
  periodo_completado: {
    label: 'Período completado',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    card: 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20',
  },
  recurrencia_anulada: {
    label: 'Recurrencia anulada',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
    dot: 'bg-rose-500',
    card: 'border-rose-200/80 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20',
  },
  tramite_anulado: {
    label: 'Trámite anulado',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
    dot: 'bg-rose-500',
    card: 'border-rose-200/80 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20',
  },
  otro: {
    label: 'Evento',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    dot: 'bg-gray-400',
    card: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40',
  },
}

const ESTADO_TRAMITE_ES = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  vencido: 'Vencido',
  completado: 'Completado',
}

/** Trámite archivado (recurrente anulado o puntual anulado). */
export function esTramiteAnulado(tramite) {
  return Boolean(
    tramite?.anulado
    || (tramite?.es_recurrente && tramite?.recurrencia_activa === false)
  )
}

/** @deprecated usar esTramiteAnulado */
export function esTramiteRecurrenciaAnulada(tramite) {
  return esTramiteAnulado(tramite)
}

export const TRAMITE_ANULADO_UI = {
  badgeLabel: 'Anulado',
  badgeRecurrenteLabel: 'Recurrencia anulada',
  badgeClass:
    'rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
  listHint: 'Trámite anulado · no requiere gestión ni carga de documentos',
  listDetalle:
    'Este trámite quedó archivado. No puede abrirse para ver tareas, documentos ni subir información.',
  confirmRecurrente:
    '¿Anular la recurrencia mensual de este trámite? Ya no se generarán nuevos períodos ni recordatorios. Use esto si la empresa cliente dejó de trabajar con la consultora.',
  confirmPuntual:
    '¿Anular este trámite? Quedará archivado y ya no admitirá tareas, documentos ni recordatorios. Use esto si la empresa dejó de operar con la consultora o el trámite ya no aplica.',
}

/** @deprecated usar TRAMITE_ANULADO_UI */
export const RECURRENCIA_ANULADA_UI = TRAMITE_ANULADO_UI

export function etiquetaAnulacionTramite(tramite) {
  if (!esTramiteAnulado(tramite)) return null
  return tramite?.es_recurrente ? TRAMITE_ANULADO_UI.badgeRecurrenteLabel : TRAMITE_ANULADO_UI.badgeLabel
}

export function mensajeConfirmacionAnulacion(tramite) {
  return tramite?.es_recurrente
    ? TRAMITE_ANULADO_UI.confirmRecurrente
    : TRAMITE_ANULADO_UI.confirmPuntual
}

export function subtituloTramiteAnulado(tramite) {
  if (!esTramiteAnulado(tramite)) return null
  const fecha = formatFechaTramite(tramite.anulado_en || tramite.recurrencia_anulada_en)
  return fecha !== '—' ? `Anulado el ${fecha}` : null
}

/** @deprecated usar subtituloTramiteAnulado */
export function subtituloRecurrenciaAnulada(tramite) {
  return subtituloTramiteAnulado(tramite)
}

/** Bolivia: fechas solo-día "yyyy-MM-dd" o ISO sin desfase UTC. */
export function parseFechaSoloDia(value) {
  if (!value) return null
  const part = String(value).slice(0, 10)
  const [y, m, d] = part.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

/** Fecha local de hoy como "yyyy-MM-dd" (evita toISOString/UTC). */
export function hoyFechaLocal() {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatFechaHoraTramite(value) {
  if (!value) return '—'
  const soloDia = parseFechaSoloDia(value)
  if (soloDia && String(value).length <= 10) {
    return soloDia.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/La_Paz',
    })
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/La_Paz',
  })
}

export function subtituloEventoTimeline(evento) {
  const partes = []
  if (evento.usuario) partes.push(`Registrado por ${evento.usuario}`)
  if (evento.metadata?.colaborador_nombre) {
    partes.push(`Responsable: ${evento.metadata.colaborador_nombre}`)
  }
  return partes.length ? partes.join(' · ') : 'Sistema'
}

export function descripcionEventoTimeline(evento) {
  if (evento.tipo === 'estado_cambio' && evento.metadata?.desde && evento.metadata?.hasta) {
    const desde = ESTADO_TRAMITE_ES[evento.metadata.desde] ?? evento.metadata.desde
    const hasta = ESTADO_TRAMITE_ES[evento.metadata.hasta] ?? evento.metadata.hasta
    return `El trámite pasó de «${desde}» a «${hasta}».`
  }
  if (evento.tipo === 'documento_subido') {
    if (evento.metadata?.nombre_archivo) {
      return evento.descripcion || `Se cargó «${evento.metadata.nombre_archivo}».`
    }
    if (evento.metadata?.tarea_nombre) {
      return `Archivo adjunto a la tarea «${evento.metadata.tarea_nombre}».`
    }
  }
  if (evento.tipo === 'asignacion' && evento.metadata?.colaborador_nombre) {
    return `Responsable(s): ${evento.metadata.colaborador_nombre}.`
  }
  if (evento.tipo === 'tarea_iniciada' && evento.metadata?.tarea_nombre) {
    return `Se inició la tarea «${evento.metadata.tarea_nombre}».`
  }
  return evento.descripcion || ''
}

export function estadoTramiteConfig(estado) {
  return TRAMITE_ESTADOS[estado] ?? TRAMITE_ESTADOS.pendiente
}

export function formatFechaTramite(value) {
  const d = parseFechaSoloDia(value)
  if (!d) return '—'
  return d.toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/La_Paz',
  })
}

export function diasHastaVencimiento(fechaVencimiento) {
  const fin = parseFechaSoloDia(fechaVencimiento)
  const hoy = parseFechaSoloDia(hoyFechaLocal())
  if (!fin || !hoy) return null
  return Math.round((fin - hoy) / (1000 * 60 * 60 * 24))
}

/** Evento all-day para react-big-calendar: fin exclusivo al día siguiente. */
export function eventoCalendarioDesdeFecha(value, extra = {}) {
  const inicio = parseFechaSoloDia(value)
  if (!inicio) return null
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + 1)
  return {
    ...extra,
    allDay: true,
    start: inicio,
    end: fin,
  }
}

/** @deprecated usar TramiteTimeline custom */
export function eventosParaChrono(eventos = []) {
  return [...eventos]
    .sort((a, b) => new Date(a.ocurrido_en) - new Date(b.ocurrido_en))
    .map((e) => ({
      title: e.titulo,
      cardTitle: e.titulo,
      cardSubtitle: e.usuario ? `Por ${e.usuario}` : '',
      cardDetailedText: e.descripcion || '',
    }))
}

export function eventosFechasChrono(eventos = []) {
  return [...eventos]
    .sort((a, b) => new Date(a.ocurrido_en) - new Date(b.ocurrido_en))
    .map((e) => formatFechaTramite(e.ocurrido_en))
}

export const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

export function staggerDelayMs(index, step = 70, max = 420) {
  return Math.min(index * step, max)
}

export function tituloEventoCalendario(evento) {
  const estado = ESTADO_TRAMITE_ES[evento.estado] ?? evento.estado
  return `${evento.title} · ${estado}`
}

export function descripcionEventoCalendario(evento) {
  const partes = []
  if (evento.empresa_nombre) partes.push(evento.empresa_nombre)
  if (evento.tipo_label) partes.push(evento.tipo_label)
  if (evento.estado_label) partes.push(evento.estado_label)
  return partes.join(' · ')
}

export function esArchivoImagen(nombre, formato) {
  const ext = (formato || nombre?.split('.').pop() || '').toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
}

export function esArchivoPdf(nombre, formato) {
  const ext = (formato || nombre?.split('.').pop() || '').toLowerCase()
  return ext === 'pdf'
}
