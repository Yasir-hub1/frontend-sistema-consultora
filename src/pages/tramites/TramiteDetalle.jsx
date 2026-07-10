import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Download,
  Eye,
  PlayCircle,
  Upload,
} from 'lucide-react'
import { clsx } from 'clsx'
import Button from '../../components/common/Button'
import TramiteEstadoBadge from '../../components/tramites/TramiteEstadoBadge'
import TramiteProgreso from '../../components/tramites/TramiteProgreso'
import TramiteTimeline from '../../components/tramites/TramiteTimeline'
import SubirDocumentoTareaModal from '../../components/tramites/SubirDocumentoTareaModal'
import VerDocumentoTareaModal from '../../components/tramites/VerDocumentoTareaModal'
import { useTramiteContext } from '../../hooks/useTramiteContext'
import { tramiteService } from '../../services/tramiteService'
import { download } from '../../services/api'
import { ROLES } from '../../utils/roleUtils'
import {
  formatFechaTramite,
  esTramiteAnulado,
  etiquetaAnulacionTramite,
  mensajeConfirmacionAnulacion,
  motionStagger,
  staggerDelayMs,
  TAREA_ESTADOS,
  TRAMITE_ANULADO_UI,
} from '../../utils/tramiteUtils'

export default function TramiteDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rol, basePath, readonly } = useTramiteContext()
  const isEmpresaCliente = rol === ROLES.EMPRESA_CLIENTE
  const [tramite, setTramite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyTarea, setBusyTarea] = useState(null)
  const [uploadModal, setUploadModal] = useState({ open: false, tarea: null })
  const [verDoc, setVerDoc] = useState({ open: false, tareaId: null, documento: null })
  const [anulandoTramite, setAnulandoTramite] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await tramiteService.getById(rol, id)
    setLoading(false)
    if (res.success) {
      if (esTramiteAnulado(res.data)) {
        toast.error(TRAMITE_ANULADO_UI.listDetalle)
        navigate(basePath)
        return
      }
      setTramite(res.data)
    } else {
      toast.error(res.message || 'No se pudo cargar el trámite')
      navigate(basePath)
    }
  }, [rol, id, navigate, basePath])

  useEffect(() => {
    void load()
  }, [load])

  const onIniciar = async (tareaId) => {
    if (esTramiteAnulado(tramite)) return
    setBusyTarea(tareaId)
    const res = await tramiteService.iniciarTarea(rol, id, tareaId)
    setBusyTarea(null)
    if (res.success) {
      toast.success('Tarea en proceso')
      void load()
    } else toast.error(res.message)
  }

  const onCompletar = async (tareaId) => {
    if (esTramiteAnulado(tramite)) return
    setBusyTarea(tareaId)
    const res = await tramiteService.completarTarea(rol, id, tareaId)
    setBusyTarea(null)
    if (res.success) {
      toast.success('Tarea completada')
      setTramite(res.data?.tramite ?? tramite)
      void load()
    } else toast.error(res.message)
  }

  const onUpload = async (file) => {
    if (esTramiteAnulado(tramite)) return
    const tareaId = uploadModal.tarea?.id
    if (!file || !tareaId) return
    setBusyTarea(tareaId)
    const res = await tramiteService.subirDocumentoTarea(rol, id, tareaId, file)
    setBusyTarea(null)
    if (res.success) {
      toast.success('Documento subido')
      setUploadModal({ open: false, tarea: null })
      void load()
    } else toast.error(res.message)
  }

  const onDescargar = async (tareaId, doc) => {
    try {
      const prefix = tramiteService.apiPrefix(rol)
      await download(
        `${prefix}/${id}/tareas/${tareaId}/documentos/${doc.id}/descargar`,
        {},
        doc.nombre_original
      )
    } catch {
      toast.error('No se pudo descargar el documento')
    }
  }

  const onAnularTramite = async () => {
    if (!tramite || !window.confirm(mensajeConfirmacionAnulacion(tramite))) return
    setAnulandoTramite(true)
    const res = await tramiteService.anularTramite(rol, id)
    setAnulandoTramite(false)
    if (res.success) {
      toast.success(res.message || 'Trámite anulado')
      navigate(basePath)
    } else toast.error(res.message)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!tramite) return null

  const tareas = tramite.tareas ?? []
  const eventos = tramite.eventos ?? []
  const puedeAnularTramite =
    !readonly &&
    !isEmpresaCliente &&
    !esTramiteAnulado(tramite) &&
    tramite.estado !== 'completado'

  const header = (
    <header
      className={`overflow-hidden rounded-2xl border border-gray-200/90 bg-gradient-to-br from-white via-primary-50/30 to-white p-6 shadow-sm dark:border-gray-700/90 dark:from-gray-900 dark:via-primary-950/20 dark:to-gray-900 ${motionStagger}`}
      style={{ animationDelay: `${staggerDelayMs(1)}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">{tramite.nombre}</h1>
            <TramiteEstadoBadge estado={tramite.estado} />
            {tramite.es_recurrente ? (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
                Recurrente mensual
              </span>
            ) : null}
            {esTramiteAnulado(tramite) ? (
              <span className={TRAMITE_ANULADO_UI.badgeClass}>
                {etiquetaAnulacionTramite(tramite)}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {tramite.empresa_nombre} · {tramite.tipo_label}
            {tramite.es_recurrente && tramite.periodo_actual_label
              ? ` · Período: ${tramite.periodo_actual_label}`
              : ''}
          </p>
          {tramite.descripcion ? (
            <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{tramite.descripcion}</p>
          ) : null}
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <dt className="font-semibold uppercase tracking-wide">Inicio</dt>
              <dd>{formatFechaTramite(tramite.fecha_inicio)}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide">Vencimiento</dt>
              <dd>{formatFechaTramite(tramite.fecha_vencimiento)}</dd>
            </div>
            {tramite.es_recurrente ? (
              <div>
                <dt className="font-semibold uppercase tracking-wide">Día mensual</dt>
                <dd>Día {tramite.dia_vencimiento_mes ?? '—'} de cada mes</dd>
              </div>
            ) : null}
            {(tramite.asignados ?? []).length > 0 ? (
              <div>
                <dt className="font-semibold uppercase tracking-wide">Responsables</dt>
                <dd>{tramite.asignados.map((a) => a.nombre).join(', ')}</dd>
              </div>
            ) : tramite.asignado_a ? (
              <div>
                <dt className="font-semibold uppercase tracking-wide">Responsable</dt>
                <dd>{tramite.asignado_a.nombre}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="w-full min-w-[200px] max-w-xs">
          <TramiteProgreso pct={tramite.progreso_pct} estado={tramite.estado} />
          <p className="mt-2 text-center text-xs text-gray-500">
            {tramite.tareas_completadas ?? 0} / {tramite.tareas_total ?? tareas.length} tareas
          </p>
          {puedeAnularTramite ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 w-full border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
              onClick={() => void onAnularTramite()}
              disabled={anulandoTramite}
            >
              <Ban className="mr-2 h-4 w-4" />
              {anulandoTramite
                ? 'Anulando…'
                : tramite.es_recurrente
                  ? 'Anular recurrencia'
                  : 'Anular trámite'}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )

  const timeline = (
    <TramiteTimeline
      eventos={eventos}
      tareas={tareas}
      tramiteId={id}
      rol={rol}
      onDescargarDocumento={onDescargar}
    />
  )

  const documentosAcciones = (tareaId, doc) => (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => setVerDoc({ open: true, tareaId, documento: doc })}
        className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:underline dark:text-primary-400"
      >
        <Eye className="h-3.5 w-3.5" />
        Ver
      </button>
      <button
        type="button"
        onClick={() => void onDescargar(tareaId, doc)}
        className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:underline dark:text-gray-300"
      >
        <Download className="h-3.5 w-3.5" />
        Descargar
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className={motionStagger}>
        <Link
          to={basePath}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a trámites
        </Link>
      </div>

      {header}

      {isEmpresaCliente ? (
        <div className="space-y-6">
          <section
            className={`${motionStagger}`}
            style={{ animationDelay: `${staggerDelayMs(2)}ms` }}
          >
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Seguimiento del trámite
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Consulta el historial y los documentos adjuntos. Puedes verlos en línea o descargarlos.
            </p>
            {timeline}
          </section>

          {tareas.some((t) => (t.documentos ?? []).length > 0) ? (
            <section
              className={`rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50 ${motionStagger}`}
              style={{ animationDelay: `${staggerDelayMs(3)}ms` }}
            >
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Documentos adjuntos
              </h2>
              <ul className="mt-4 space-y-3">
                {tareas.flatMap((t) =>
                  (t.documentos ?? []).map((d) => (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {d.nombre_original}
                        </p>
                        <p className="text-xs text-gray-500">Tarea: {t.nombre}</p>
                      </div>
                      {documentosAcciones(t.id, d)}
                    </li>
                  ))
                )}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section
            className={`rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50 ${motionStagger}`}
            style={{ animationDelay: `${staggerDelayMs(2)}ms` }}
          >
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tareas</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Flujo: <strong>Iniciar</strong> → <strong>Subir documento</strong> (si aplica) → <strong>Completar</strong>
            </p>
            <ol className="mt-4 space-y-3">
              {tareas.map((t, idx) => {
                const cfg = TAREA_ESTADOS[t.estado] ?? TAREA_ESTADOS.pendiente
                const busy = busyTarea === t.id
                const done = t.estado === 'completada'
                const tieneDocs = (t.documentos ?? []).length > 0
                const puedeIniciar = t.estado === 'pendiente'
                const puedeSubir = t.estado === 'en_proceso'
                const puedeCompletar =
                  t.estado === 'en_proceso' && (!t.requiere_documento || tieneDocs)
                return (
                  <li
                    key={t.id}
                    className={clsx(
                      'rounded-xl border p-4 transition-all duration-300',
                      done
                        ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                        : t.estado === 'en_proceso'
                          ? 'border-primary-200/80 bg-primary-50/40 dark:border-primary-900/50 dark:bg-primary-950/20'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'
                    )}
                    style={{ animationDelay: `${staggerDelayMs(idx, 50, 400)}ms` }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <span
                          className={clsx(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                            done
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          )}
                        >
                          {done ? <CheckCircle2 className="h-4 w-4" /> : t.orden}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{t.nombre}</p>
                          <p className="text-xs text-gray-500">{cfg.label}</p>
                          {t.requiere_documento ? (
                            <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                              Requiere documento adjunto
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {!readonly && !done ? (
                        <div className="flex flex-wrap gap-2">
                          {puedeIniciar ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={busy}
                              onClick={() => onIniciar(t.id)}
                              className="gap-1"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                              Iniciar
                            </Button>
                          ) : null}
                          {puedeSubir ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={() => setUploadModal({ open: true, tarea: t })}
                              className="gap-1"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Subir documento
                            </Button>
                          ) : null}
                          {puedeCompletar ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={busy}
                              onClick={() => onCompletar(t.id)}
                            >
                              Completar
                            </Button>
                          ) : null}
                          {t.estado === 'en_proceso' && t.requiere_documento && !tieneDocs ? (
                            <span className="self-center text-[11px] text-amber-700 dark:text-amber-300">
                              Suba un documento para completar
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {(t.documentos ?? []).length > 0 ? (
                      <ul className="mt-3 space-y-1.5 border-t border-gray-200/80 pt-3 dark:border-gray-700/80">
                        {t.documentos.map((d) => (
                          <li key={d.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate text-gray-700 dark:text-gray-300">{d.nombre_original}</span>
                            {documentosAcciones(t.id, d)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </section>

          <aside className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(3)}ms` }}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Línea de tiempo
            </h2>
            {timeline}
          </aside>
        </div>
      )}

      <SubirDocumentoTareaModal
        isOpen={uploadModal.open}
        onClose={() => setUploadModal({ open: false, tarea: null })}
        tarea={uploadModal.tarea}
        onConfirm={onUpload}
        uploading={busyTarea === uploadModal.tarea?.id}
      />

      <VerDocumentoTareaModal
        isOpen={verDoc.open}
        onClose={() => setVerDoc({ open: false, tareaId: null, documento: null })}
        rol={rol}
        tramiteId={id}
        tareaId={verDoc.tareaId}
        documento={verDoc.documento}
        onDescargar={onDescargar}
      />
    </div>
  )
}
