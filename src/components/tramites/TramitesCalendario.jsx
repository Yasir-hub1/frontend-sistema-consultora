import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { clsx } from 'clsx'
import { tramiteService } from '../../services/tramiteService'
import {
  descripcionEventoCalendario,
  estadoTramiteConfig,
  eventoCalendarioDesdeFecha,
  TRAMITE_ESTADO_COLORES,
} from '../../utils/tramiteUtils'

const locales = { es }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1, locale: es }),
  getDay,
  locales,
})

const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha de vencimiento',
  time: 'Hora',
  event: 'Trámite',
  noEventsInRange: 'No hay trámites con vencimiento en este rango.',
  showMore: (total) => `+${total} más`,
}

const LEYENDA_ESTADOS = [
  { estado: 'pendiente', label: 'Pendiente' },
  { estado: 'en_proceso', label: 'En proceso' },
  { estado: 'vencido', label: 'Vencido' },
  { estado: 'completado', label: 'Completado' },
]

function rangoMesVisible(fecha = new Date()) {
  const inicioMes = startOfMonth(fecha)
  const finMes = endOfMonth(fecha)
  return {
    start: subDays(inicioMes, 7),
    end: addDays(finMes, 7),
  }
}

function mapEventoApi(e) {
  const evento = eventoCalendarioDesdeFecha(e.start ?? e.fecha_vencimiento, {
    ...e,
    nombre: e.title,
    title: e.title,
  })
  return evento ?? { ...e, allDay: true, start: new Date(), end: new Date() }
}

function eventStyleGetter(event) {
  const bg = TRAMITE_ESTADO_COLORES[event.estado] || TRAMITE_ESTADO_COLORES.en_proceso
  return {
    style: {
      backgroundColor: bg,
      borderRadius: '8px',
      border: 'none',
      color: '#fff',
      fontSize: '0.72rem',
      fontWeight: 600,
      padding: '3px 6px',
      boxShadow: `0 2px 8px ${bg}40`,
      lineHeight: 1.3,
    },
  }
}

function EventoMes({ event }) {
  const nombre = event.nombre || event.title?.split(' · ')[0] || event.title
  return (
    <span className="block truncate text-white" title={event.descripcion || event.title}>
      <span className="font-semibold">{nombre}</span>
      {event.estado_label ? (
        <span className="ml-1 opacity-90">· {event.estado_label}</span>
      ) : null}
    </span>
  )
}

function EventoAgenda({ event }) {
  const cfg = estadoTramiteConfig(event.estado)
  const nombre = event.nombre || event.title?.split(' · ')[0] || event.title
  return (
    <div className="flex flex-col gap-0.5 py-0.5">
      <span className="font-semibold text-gray-900 dark:text-white">{nombre}</span>
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {event.fecha_vencimiento_label ? `Vence: ${event.fecha_vencimiento_label}` : null}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {descripcionEventoCalendario(event)}
      </span>
      <span className={clsx('mt-0.5 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', cfg.badge)}>
        {event.estado_label || cfg.label}
      </span>
    </div>
  )
}

export default function TramitesCalendario({ rol, onSelectEvent, empresaClienteId, colaboradorId, className }) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaCalendario, setFechaCalendario] = useState(() => new Date())
  const [rango, setRango] = useState(() => rangoMesVisible(new Date()))
  const [estadoFiltro, setEstadoFiltro] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await tramiteService.getCalendario(rol, {
      desde: format(rango.start, 'yyyy-MM-dd'),
      hasta: format(rango.end, 'yyyy-MM-dd'),
      empresa_cliente_id: empresaClienteId || undefined,
      asignado_a_colaborador_id: colaboradorId || undefined,
    })
    if (res.success) {
      const raw = res.data?.eventos ?? []
      setEventos(raw.map(mapEventoApi))
    } else {
      setEventos([])
    }
    setLoading(false)
  }, [rol, rango, empresaClienteId, colaboradorId])

  useEffect(() => {
    void load()
  }, [load])

  const onRangeChange = useCallback((range) => {
    let start
    let end
    if (Array.isArray(range) && range.length > 0) {
      start = range[0]
      end = range[range.length - 1]
    } else if (range?.start && range?.end) {
      start = range.start
      end = range.end
    } else {
      return
    }

    const desde = format(start, 'yyyy-MM-dd')
    const hasta = format(end, 'yyyy-MM-dd')

    setRango((prev) => {
      if (
        format(prev.start, 'yyyy-MM-dd') === desde &&
        format(prev.end, 'yyyy-MM-dd') === hasta
      ) {
        return prev
      }
      return { start, end }
    })
  }, [])

  const onNavigate = useCallback((nuevaFecha) => {
    setFechaCalendario(nuevaFecha)
    setRango((prev) => {
      const next = rangoMesVisible(nuevaFecha)
      if (
        format(prev.start, 'yyyy-MM-dd') === format(next.start, 'yyyy-MM-dd') &&
        format(prev.end, 'yyyy-MM-dd') === format(next.end, 'yyyy-MM-dd')
      ) {
        return prev
      }
      return next
    })
  }, [])

  const eventosVisibles = useMemo(
    () => (estadoFiltro ? eventos.filter((e) => e.estado === estadoFiltro) : eventos),
    [eventos, estadoFiltro]
  )

  const components = useMemo(
    () => ({
      event: EventoMes,
      agenda: { event: EventoAgenda },
    }),
    []
  )

  return (
    <div
      className={clsx(
        'tramite-calendar overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cada fecha muestra trámites que <strong className="font-semibold text-gray-700 dark:text-gray-200">vencen ese día</strong>.
          Los recurrentes mensuales aparecen en cada mes del rango visible. El color indica su estado.
        </p>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="input w-full text-sm sm:w-44"
        >
          <option value="">Todos los estados</option>
          {LEYENDA_ESTADOS.map((l) => (
            <option key={l.estado} value={l.estado}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
        {LEYENDA_ESTADOS.map((l) => (
          <span key={l.estado} className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TRAMITE_ESTADO_COLORES[l.estado] }}
            />
            {l.label}
          </span>
        ))}
      </div>

      <div className="relative min-h-[600px] p-3 sm:p-4">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : null}
        <Calendar
          localizer={localizer}
          culture="es"
          messages={messages}
          events={eventosVisibles}
          date={fechaCalendario}
          onNavigate={onNavigate}
          startAccessor="start"
          endAccessor="end"
          allDayAccessor="allDay"
          titleAccessor="title"
          tooltipAccessor={(e) => e.descripcion || descripcionEventoCalendario(e)}
          style={{ height: 600 }}
          onRangeChange={onRangeChange}
          onSelectEvent={onSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={components}
          popup
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
        />
      </div>

      {!loading && eventosVisibles.length === 0 ? (
        <p className="border-t border-gray-100 px-4 py-3 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          No hay trámites con vencimiento en el período visible
          {estadoFiltro ? ' con el estado seleccionado' : ''}.
        </p>
      ) : null}

      <style>{`
        .tramite-calendar .rbc-toolbar button {
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          transition: all 0.2s;
        }
        .tramite-calendar .rbc-toolbar button.rbc-active,
        .tramite-calendar .rbc-toolbar button:hover {
          background: #0284c7;
          color: white;
          box-shadow: 0 2px 8px rgb(2 132 199 / 0.35);
        }
        .tramite-calendar .rbc-event {
          min-height: 1.35rem;
          border: none !important;
          color: #fff !important;
        }
        .tramite-calendar .rbc-event-content {
          color: #fff !important;
        }
        .tramite-calendar .rbc-event-label {
          color: #fff !important;
        }
        .tramite-calendar .rbc-agenda-table tbody > tr > td {
          vertical-align: top;
          padding-top: 0.65rem;
          padding-bottom: 0.65rem;
        }
        .tramite-calendar .rbc-agenda-date-cell,
        .tramite-calendar .rbc-agenda-time-cell {
          white-space: nowrap;
          font-weight: 600;
          color: #374151;
        }
        .dark .tramite-calendar .rbc-toolbar {
          color: #e5e7eb;
        }
        .dark .tramite-calendar .rbc-toolbar button {
          background: #1f2937;
          border-color: #374151;
          color: #e5e7eb;
        }
        .dark .tramite-calendar .rbc-month-view,
        .dark .tramite-calendar .rbc-time-view,
        .dark .tramite-calendar .rbc-agenda-view {
          border-color: #374151;
          background: #111827;
        }
        .dark .tramite-calendar .rbc-header,
        .dark .tramite-calendar .rbc-date-cell,
        .dark .tramite-calendar .rbc-agenda-date-cell,
        .dark .tramite-calendar .rbc-agenda-time-cell {
          color: #d1d5db;
        }
        .dark .tramite-calendar .rbc-off-range-bg {
          background: #0f172a;
        }
        .dark .tramite-calendar .rbc-today {
          background: rgb(2 132 199 / 0.12);
        }
        .dark .tramite-calendar .rbc-agenda-event-cell {
          color: #e5e7eb;
        }
      `}</style>
    </div>
  )
}
