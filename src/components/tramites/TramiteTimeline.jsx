import { useMemo, useState } from 'react'
import { ArrowDownUp, Download, Eye, FileText, Search } from 'lucide-react'
import { clsx } from 'clsx'
import {
  descripcionEventoTimeline,
  EVENTO_TIPO_CONFIG,
  EVENTO_TIPOS_FILTRO,
  formatFechaHoraTramite,
  subtituloEventoTimeline,
} from '../../utils/tramiteUtils'
import VerDocumentoTareaModal from './VerDocumentoTareaModal'

function textoBusquedaEvento(e) {
  return [
    e.titulo,
    e.descripcion,
    e.usuario,
    e.metadata?.nombre_archivo,
    e.metadata?.tarea_nombre,
    e.metadata?.colaborador_nombre,
    EVENTO_TIPO_CONFIG[e.tipo]?.label,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** Resuelve documento desde metadata del evento o lista de tareas (eventos antiguos). */
function resolverDocumentoEvento(evento, tareas = []) {
  const meta = evento.metadata || {}
  const nombre = meta.nombre_archivo || evento.descripcion

  if (meta.documento_id && meta.tarea_id) {
    return {
      docId: meta.documento_id,
      tareaId: meta.tarea_id,
      nombreArchivo: meta.nombre_archivo || nombre,
      formato: meta.formato,
    }
  }

  if (meta.tarea_id && nombre) {
    const tarea = tareas.find((t) => t.id === meta.tarea_id)
    const doc = tarea?.documentos?.find((d) => d.nombre_original === nombre)
    if (doc) {
      return {
        docId: doc.id,
        tareaId: meta.tarea_id,
        nombreArchivo: doc.nombre_original,
        formato: doc.formato,
      }
    }
  }

  if (nombre) {
    for (const t of tareas) {
      const doc = t.documentos?.find((d) => d.nombre_original === nombre)
      if (doc) {
        return {
          docId: doc.id,
          tareaId: t.id,
          nombreArchivo: doc.nombre_original,
          formato: doc.formato,
        }
      }
    }
  }

  return null
}

export default function TramiteTimeline({
  eventos = [],
  tareas = [],
  className = '',
  tramiteId,
  rol,
  onDescargarDocumento,
}) {
  const [busqueda, setBusqueda] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [ordenDesc, setOrdenDesc] = useState(false)
  const [verDoc, setVerDoc] = useState({ open: false, tareaId: null, documento: null })

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    let lista = [...eventos]
    if (tipoFiltro) {
      lista = lista.filter((e) => e.tipo === tipoFiltro)
    }
    if (q) {
      lista = lista.filter((e) => textoBusquedaEvento(e).includes(q))
    }
    lista.sort((a, b) => {
      const diff = new Date(a.ocurrido_en) - new Date(b.ocurrido_en)
      return ordenDesc ? -diff : diff
    })
    return lista
  }, [eventos, busqueda, tipoFiltro, ordenDesc])

  if (!eventos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
        Aún no hay eventos en la línea de tiempo.
      </div>
    )
  }

  return (
    <>
      <div
        className={clsx(
          'rounded-2xl border border-gray-200/90 bg-white/90 shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50',
          className
        )}
      >
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Historial del trámite
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                {filtrados.length} de {eventos.length} evento(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOrdenDesc((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-primary-300 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-700"
              title={ordenDesc ? 'Más recientes primero' : 'Cronológico (creación → asignación → acciones)'}
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {ordenDesc ? 'Recientes' : 'Cronológico'}
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en el historial…"
                className="input w-full pl-9 text-sm"
              />
            </div>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="input w-full text-sm sm:w-48"
            >
              {EVENTO_TIPOS_FILTRO.map((f) => (
                <option key={f.key || 'all'} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain scroll-smooth p-4 [scrollbar-width:thin]">
          {filtrados.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No hay eventos que coincidan con la búsqueda o el filtro.
            </p>
          ) : (
            <ol className="relative space-y-0 border-l-2 border-primary-200/80 pl-6 dark:border-primary-800/60">
              {filtrados.map((e, idx) => {
                const cfg = EVENTO_TIPO_CONFIG[e.tipo] ?? EVENTO_TIPO_CONFIG.otro
                const esDoc = e.tipo === 'documento_subido'
                const docResuelto = esDoc ? resolverDocumentoEvento(e, tareas) : null
                const docId = docResuelto?.docId
                const tareaId = docResuelto?.tareaId
                const nombreArchivo = docResuelto?.nombreArchivo || e.metadata?.nombre_archivo || e.descripcion
                const puedeDoc = esDoc && docId && tareaId && tramiteId && rol

                return (
                  <li
                    key={e.id ?? idx}
                    className="relative pb-6 last:pb-0 animate-fade-in-up motion-reduce:animate-none"
                    style={{ animationDelay: `${Math.min(idx * 60, 360)}ms` }}
                  >
                    <span
                      className={clsx(
                        'absolute -left-[1.65rem] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900',
                        cfg.dot
                      )}
                      aria-hidden
                    />

                    <div
                      className={clsx(
                        'rounded-xl border p-3.5 shadow-sm transition hover:shadow-md',
                        cfg.card
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span
                            className={clsx(
                              'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                              cfg.badge
                            )}
                          >
                            {cfg.label}
                          </span>
                          <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{e.titulo}</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {formatFechaHoraTramite(e.ocurrido_en)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                        {subtituloEventoTimeline(e)}
                      </p>

                      {descripcionEventoTimeline(e) ? (
                        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                          {descripcionEventoTimeline(e)}
                        </p>
                      ) : null}

                      {esDoc && nombreArchivo ? (
                        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
                              <FileText className="h-4 w-4 shrink-0 text-primary-500" />
                              <span className="truncate font-medium">{nombreArchivo}</span>
                            </span>
                            {puedeDoc ? (
                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVerDoc({
                                      open: true,
                                      tareaId,
                                      documento: {
                                        id: docId,
                                        nombre_original: nombreArchivo,
                                        formato: docResuelto?.formato ?? e.metadata?.formato,
                                      },
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Ver
                                </button>
                                {typeof onDescargarDocumento === 'function' ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onDescargarDocumento(tareaId, {
                                        id: docId,
                                        nombre_original: nombreArchivo,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:underline dark:text-gray-300"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Descargar
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          {e.metadata?.tarea_nombre ? (
                            <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                              Tarea: {e.metadata.tarea_nombre}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>

      <VerDocumentoTareaModal
        isOpen={verDoc.open}
        onClose={() => setVerDoc({ open: false, tareaId: null, documento: null })}
        rol={rol}
        tramiteId={tramiteId}
        tareaId={verDoc.tareaId}
        documento={verDoc.documento}
        onDescargar={onDescargarDocumento}
      />
    </>
  )
}
