import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Package,
  Trash2,
} from 'lucide-react'
import { clsx } from 'clsx'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import EmpresaClienteShell, { staggerDelayMs } from '../../components/empresa-cliente/EmpresaClienteShell'
import { empresaClienteService } from '../../services/empresaClienteService'

function formatBytes(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  if (v < 1024) return `${v} B`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`
  return `${(v / (1024 * 1024)).toFixed(1)} MB`
}

function labelModulo(modulo) {
  const m = String(modulo || '').toLowerCase()
  if (m === 'afp') return 'AFP'
  if (m === 'caja') return 'CAJA'
  if (m === 'ministerio') return 'MDT'
  return String(modulo || '').toUpperCase() || '—'
}

export default function EmpresaClienteDeclaracionesMensuales() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickMesId, setQuickMesId] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [downloadingId, setDownloadingId] = useState(null)
  const [zipLoading, setZipLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)

  function previewKind(nombreOriginal, contentType) {
    const c = String(contentType || '').toLowerCase()
    const n = String(nombreOriginal || '').toLowerCase()
    if (c.includes('pdf') || n.endsWith('.pdf')) return 'pdf'
    if (c.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/.test(n)) return 'image'
    return 'none'
  }

  const load = useCallback(async () => {
    setLoading(true)
    const res = await empresaClienteService.listDeclaracionesMensuales()
    if (res.success) {
      const list = res.data?.items ?? []
      setItems(list)
      setQuickMesId((prev) => {
        if (prev && list.some((i) => String(i.id) === String(prev))) return prev
        return list[0]?.id ? String(list[0].id) : ''
      })
      setSelected(new Set())
    } else {
      setItems([])
      toast.error(res.message || 'No se pudo cargar el listado.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === items.length) setSelected(new Set())
    else setSelected(new Set(items.map((i) => i.id)))
  }

  const mesesSeleccionados = useMemo(() => {
    const meses = []
    for (const i of items) {
      if (selected.has(i.id)) meses.push(i.mes_gestion)
    }
    return meses.sort()
  }, [items, selected])

  const onDescargaRapida = async () => {
    const row = items.find((i) => String(i.id) === String(quickMesId))
    if (!row) {
      toast.error('Elige un mes con archivo disponible.')
      return
    }
    setDownloadingId(row.id)
    try {
      await empresaClienteService.descargarDeclaracionMensual(row.id, row.nombre_original)
      toast.success('Descarga iniciada.')
    } catch {
      toast.error('No se pudo descargar.')
    }
    setDownloadingId(null)
  }

  const onDescargarFila = async (row) => {
    setDownloadingId(row.id)
    try {
      await empresaClienteService.descargarDeclaracionMensual(row.id, row.nombre_original)
      toast.success('Descarga iniciada.')
    } catch {
      toast.error('No se pudo descargar.')
    }
    setDownloadingId(null)
  }

  const onDescargarSeleccion = async () => {
    if (mesesSeleccionados.length === 0) {
      toast.error('Selecciona al menos un mes.')
      return
    }
    if (mesesSeleccionados.length === 1) {
      const row = items.find((i) => i.mes_gestion === mesesSeleccionados[0])
      if (row) await onDescargarFila(row)
      return
    }
    setZipLoading(true)
    try {
      const res = await empresaClienteService.descargarDeclaracionesMensualesZip(
        mesesSeleccionados,
        'declaraciones_mensuales.zip'
      )
      if (res.success) toast.success('ZIP generado.')
      else toast.error(res.message || 'No se pudo generar el ZIP.')
    } catch {
      toast.error('No se pudo generar el ZIP.')
    }
    setZipLoading(false)
  }

  const onVerFila = async (row) => {
    setPreview((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl)
      return prev
    })
    setPreviewLoading(true)
    setPreviewError(null)
    setPreview({ id: row.id, nombre: row.nombre_original, objectUrl: null, kind: null })
    const res = await empresaClienteService.fetchDeclaracionMensualVistaPreviaBlob(row.id)
    if (!res.success) {
      setPreviewError(res.message || 'No se pudo cargar la vista previa.')
      setPreviewLoading(false)
      return
    }
    const objectUrl = URL.createObjectURL(res.blob)
    setPreview({
      id: row.id,
      nombre: res.nombreOriginal || row.nombre_original,
      objectUrl,
      kind: previewKind(res.nombreOriginal || row.nombre_original, res.contentType),
    })
    setPreviewLoading(false)
  }

  const closePreview = () => {
    setPreview((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl)
      return null
    })
    setPreviewError(null)
    setPreviewLoading(false)
  }

  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'
  const selectionOpen = items.length > 0 && selected.size > 0

  return (
    <EmpresaClienteShell className="min-w-0">
      <div
        className={clsx(
          'space-y-6',
          selectionOpen &&
            'max-lg:pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-24'
        )}
      >
        <nav
          className={`flex flex-wrap items-center gap-1 text-xs text-gray-500 motion-reduce:animate-none dark:text-gray-400 sm:text-sm ${motionStagger}`}
        >
          <Link
            to="/empresa-cliente/dashboard"
            className="group inline-flex items-center gap-1 font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="font-medium text-gray-800 dark:text-gray-200">Declaración mensual</span>
        </nav>

        <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${motionStagger}`} style={{ animationDelay: '60ms' }}>
          <div>
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-white dark:to-gray-300">
              Declaración mensual de personal
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Descarga el PDF que tu consultora cargó por mes. Puedes bajar un mes concreto o varios meses en un solo
              ZIP.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cargando declaraciones…</p>
          </div>
        ) : items.length === 0 ? (
          <div className={`${motionStagger}`} style={{ animationDelay: '120ms' }}>
            <Card title="Sin declaraciones" subtitle="Aún no hay archivos disponibles" gradient>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Cuando la consultora suba la declaración mensual de tu personal, aparecerá aquí para descargarla.
              </p>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(0)}ms` }}>
                <Card
                  title="Descarga por mes"
                  subtitle="Elige un período con archivo y descarga directa"
                  className="h-full border-primary-200/80 transition-all duration-300 hover:shadow-md dark:border-primary-900/40"
                  gradient
                >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label htmlFor="decl-quick-mes" className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Mes
                  </label>
                  <select
                    id="decl-quick-mes"
                    value={quickMesId}
                    onChange={(e) => setQuickMesId(e.target.value)}
                    className="input w-full py-2.5 text-sm font-medium"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={String(i.id)}>
                        {i.periodo_label} · {labelModulo(i.modulo)} · {i.nombre_original}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  icon={<Download className="h-4 w-4" />}
                  disabled={!quickMesId || downloadingId != null}
                  onClick={() => void onDescargaRapida()}
                  className="w-full shrink-0 sm:w-auto"
                >
                  {downloadingId && String(downloadingId) === String(quickMesId) ? 'Descargando…' : 'Descargar'}
                </Button>
              </div>
                </Card>
              </div>

              <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
                <Card
                  title="Varios meses en ZIP"
                  subtitle="Marca filas abajo y genera un único archivo comprimido"
                  className="h-full border-teal-200/80 transition-all duration-300 hover:shadow-md dark:border-teal-900/40"
                  gradient
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 transition-transform duration-300 hover:scale-105 dark:bg-teal-900/50 dark:text-teal-200">
                      <Package className="h-5 w-5" />
                    </div>
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      Selecciona <strong className="text-gray-800 dark:text-gray-200">dos o más</strong> meses en la tabla.
                      Si solo eliges uno, se descargará el archivo suelto (igual que arriba).
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(2)}ms` }}>
              <Card title="Archivos disponibles" subtitle={`${items.length} período(s) con documento`} gradient>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-950/40 sm:min-h-0 sm:px-2 sm:py-1"
              >
                {selected.size === items.length ? 'Quitar selección' : 'Seleccionar todos'}
              </button>
            </div>

            <ul className="space-y-3 md:hidden">
              {items.map((row, ri) => {
                const isSel = selected.has(row.id)
                return (
                  <li
                    key={row.id}
                    className={clsx(
                      motionStagger,
                      'rounded-xl border border-gray-200/90 bg-white/95 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40',
                      isSel && 'border-primary-300 ring-2 ring-primary-500/20 dark:border-primary-700'
                    )}
                    style={{ animationDelay: `${staggerDelayMs(ri, 45, 320)}ms` }}
                  >
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggle(row.id)}
                        className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        aria-label={`Seleccionar ${row.periodo_label}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{row.periodo_label}</p>
                        <p className="mt-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                          Módulo: {labelModulo(row.modulo)}
                        </p>
                        <p className="mt-1 break-words text-sm text-gray-600 dark:text-gray-300">{row.nombre_original}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatBytes(row.tamano_bytes)}</p>
                        <button
                          type="button"
                          onClick={() => void onVerFila(row)}
                          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition-all active:scale-[0.99] dark:border-gray-600 dark:text-gray-200"
                        >
                          <Eye className="h-4 w-4 shrink-0" />
                          Ver
                        </button>
                        <button
                          type="button"
                          disabled={downloadingId === row.id}
                          onClick={() => void onDescargarFila(row)}
                          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-primary-700 transition-all active:scale-[0.99] disabled:opacity-50 dark:border-gray-600 dark:text-primary-300"
                        >
                          <Download className="h-4 w-4 shrink-0" />
                          {downloadingId === row.id ? 'Descargando…' : 'Descargar'}
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 shadow-sm dark:border-gray-700 md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/95 dark:border-gray-700 dark:bg-gray-800/90">
                    <th className="w-10 px-3 py-3" aria-label="Seleccionar" />
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">Mes</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">Módulo</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">Archivo</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">Tamaño</th>
                    <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((row, ri) => {
                    const isSel = selected.has(row.id)
                    return (
                      <tr
                        key={row.id}
                        className={clsx(
                          motionStagger,
                          'bg-white transition-colors duration-200 dark:bg-gray-900/30',
                          isSel && 'bg-primary-50/90 dark:bg-primary-900/20',
                          !isSel && 'hover:bg-gray-50/90 dark:hover:bg-gray-800/40'
                        )}
                        style={{ animationDelay: `${staggerDelayMs(ri, 40, 360)}ms` }}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggle(row.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            aria-label={`Seleccionar ${row.periodo_label}`}
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-900 dark:text-white">
                          {row.periodo_label}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-gray-600 dark:text-gray-300">
                          {labelModulo(row.modulo)}
                        </td>
                        <td className="max-w-[14rem] truncate px-3 py-3 text-gray-600 dark:text-gray-300" title={row.nombre_original}>
                          {row.nombre_original}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-gray-500 dark:text-gray-400">
                          {formatBytes(row.tamano_bytes)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void onVerFila(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver
                            </button>
                            <button
                              type="button"
                              disabled={downloadingId === row.id}
                              onClick={() => void onDescargarFila(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm disabled:opacity-50 dark:border-gray-600 dark:text-primary-300 dark:hover:bg-gray-800"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {downloadingId === row.id ? '…' : 'Descargar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
              </Card>
            </div>
        </>
      )}

      {items.length > 0 && selected.size > 0 ? (
        <div
          className={clsx(
            'fixed left-0 right-0 z-50 animate-slide-in-bottom border-t border-gray-200 bg-white/95 px-3 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] backdrop-blur-md motion-reduce:animate-none dark:border-gray-700 dark:bg-gray-900/95',
            'max-lg:bottom-[calc(4rem+env(safe-area-inset-bottom,0px))]',
            'lg:bottom-0 lg:left-64 lg:z-40 lg:px-4'
          )}
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-5xl flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
              <span className="min-w-0 leading-snug">
                <strong>{selected.size}</strong> mes{selected.size !== 1 ? 'es' : ''} seleccionado
                {selected.size !== 1 ? 's' : ''}
                {selected.size >= 2 ? ' · ZIP' : ''}
              </span>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setSelected(new Set())}
                className="min-h-[44px] w-full justify-center sm:min-h-0 sm:w-auto"
              >
                Limpiar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={zipLoading || downloadingId != null}
                icon={
                  selected.size >= 2 ? <Package className="h-4 w-4" /> : <Download className="h-4 w-4" />
                }
                onClick={() => void onDescargarSeleccion()}
                className="min-h-[44px] w-full justify-center sm:min-h-0 sm:w-auto"
              >
                {zipLoading
                  ? 'Preparando…'
                  : selected.size >= 2
                    ? `ZIP (${selected.size})`
                    : 'Descargar'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <Modal
        isOpen={Boolean(preview)}
        onClose={closePreview}
        title={preview?.nombre ? `Vista previa · ${preview.nombre}` : 'Vista previa'}
        size="xl"
        bodyClassName="p-0 max-h-[85vh] overflow-hidden"
      >
        <div className="min-h-[360px] bg-gray-50 dark:bg-gray-900">
          {previewLoading ? (
            <div className="flex h-[420px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Cargando vista previa…
            </div>
          ) : previewError ? (
            <div className="flex h-[420px] items-center justify-center px-6 text-center text-sm text-gray-600 dark:text-gray-300">
              {previewError}
            </div>
          ) : preview?.kind === 'pdf' && preview.objectUrl ? (
            <iframe title={preview.nombre || 'Vista previa'} src={preview.objectUrl} className="h-[75vh] w-full border-0" />
          ) : preview?.kind === 'image' && preview.objectUrl ? (
            <div className="flex h-[75vh] items-center justify-center p-4">
              <img src={preview.objectUrl} alt={preview.nombre || 'Vista previa'} className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 px-6 text-center text-sm text-gray-600 dark:text-gray-300">
              <p>No hay vista previa para este formato.</p>
              {preview?.id ? (
                <Button type="button" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => void onDescargarFila({ id: preview.id, nombre_original: preview.nombre })}>
                  Descargar archivo
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </Modal>
      </div>
    </EmpresaClienteShell>
  )
}
