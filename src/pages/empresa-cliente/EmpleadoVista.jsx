import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Building2,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Landmark,
  Loader2,
  Printer,
  Shield,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import EmpresaClienteShell, { staggerDelayMs } from '../../components/empresa-cliente/EmpresaClienteShell'
import { empresaClienteService } from '../../services/empresaClienteService'

const TAB_CONFIG = [
  { id: 'afp', label: 'AFP', short: 'AFP', icon: Shield, empty: 'No hay documentos AFP cargados.' },
  { id: 'caja', label: 'Caja de salud', short: 'Caja', icon: Building2, empty: 'No hay documentos de caja.' },
  {
    id: 'ministerio',
    label: 'Ministerio',
    short: 'Ministerio',
    icon: Landmark,
    empty: 'No hay documentos del Ministerio.',
  },
]

function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return null
  const n = Number(bytes)
  if (n <= 0) return null
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function formatFecha(iso) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

function previewKind(nombreOriginal, contentType) {
  const n = (nombreOriginal || '').toLowerCase()
  const ct = (contentType || '').toLowerCase()
  if (ct.includes('pdf') || n.endsWith('.pdf')) return 'pdf'
  if (ct.startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(n)) return 'image'
  return 'none'
}

export default function EmpresaClienteEmpleadoVista() {
  const { personalId } = useParams()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('afp')
  const [msg, setMsg] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)
  const [printing, setPrinting] = useState(false)
  const [objectUrl, setObjectUrl] = useState(null)
  const previewGenRef = useRef(0)

  useEffect(() => {
    let c = false
    ;(async () => {
      const res = await empresaClienteService.getPersonal(personalId)
      if (c) return
      if (res.success) setData(res.data)
      else setMsg(res.message)
    })()
    return () => {
      c = true
    }
  }, [personalId])

  const docsForTab = useCallback(
    (t) => {
      if (t === 'afp') return data?.documentos_afp ?? data?.afp?.documentos ?? []
      if (t === 'caja') return data?.documentos_caja ?? data?.caja?.documentos ?? []
      return data?.documentos_ministerio ?? data?.ministerio?.documentos ?? []
    },
    [data]
  )

  const docs = docsForTab(tab)

  const revokePreviewUrl = useCallback(() => {
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const closePreview = useCallback(() => {
    previewGenRef.current += 1
    revokePreviewUrl()
    setPreview(null)
    setPreviewError(null)
    setPreviewLoading(false)
  }, [revokePreviewUrl])

  useEffect(() => {
    return () => {
      revokePreviewUrl()
    }
  }, [revokePreviewUrl])

  const handleDescargar = async (doc) => {
    const id = doc.id
    const nombre = doc.nombre_original ?? doc.tipo_documento?.nombre ?? `documento-${id}`
    setMsg(null)
    setDownloadingId(id)
    const res = await empresaClienteService.descargarDocumento(id, nombre)
    setDownloadingId(null)
    if (!res.success) setMsg(res.message || 'No se pudo descargar el archivo.')
  }

  const handleVistaPrevia = async (doc) => {
    const id = doc.id
    const nombre = doc.nombre_original ?? doc.tipo_documento?.nombre ?? `documento-${id}`

    const gen = ++previewGenRef.current
    setMsg(null)
    setPreview({ id, nombre, tipoLabel: doc.tipo_documento?.nombre })
    setPreviewLoading(true)
    setPreviewError(null)
    revokePreviewUrl()

    const res = await empresaClienteService.streamDocumento(id)
    if (gen !== previewGenRef.current) return

    if (!res.success || !res.blob) {
      setPreviewLoading(false)
      setPreviewError(res.message || 'No se pudo cargar el documento.')
      return
    }

    const kind = previewKind(res.nombreOriginal, res.contentType)
    if (kind === 'none') {
      setPreviewLoading(false)
      setPreviewError('Vista previa no disponible en el navegador para este formato. Usa Descargar.')
      toast('Usa «Descargar» para abrir este archivo en tu equipo.')
      return
    }

    const url = URL.createObjectURL(res.blob)
    setObjectUrl(url)
    setPreview({
      id,
      nombre: res.nombreOriginal || nombre,
      tipoLabel: doc.tipo_documento?.nombre,
      kind,
      contentType: res.contentType,
    })
    setPreviewLoading(false)
  }

  const handleImprimirPreview = async () => {
    if (!preview || !objectUrl || preview.kind === 'none') return

    setPrinting(true)
    try {
      if (preview.kind === 'pdf') {
        const w = window.open(objectUrl, '_blank', 'noopener,noreferrer')
        if (!w) throw new Error('No se pudo abrir la ventana de impresión.')
        setTimeout(() => {
          try {
            w.focus()
            w.print()
          } catch {
            // no-op: algunos navegadores bloquean print programático
          }
        }, 350)
      } else if (preview.kind === 'image') {
        const w = window.open('', '_blank', 'noopener,noreferrer')
        if (!w) throw new Error('No se pudo abrir la ventana de impresión.')
        w.document.write(`
          <html>
            <head>
              <title>Imprimir documento</title>
              <style>
                html, body { margin: 0; padding: 0; }
                body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${objectUrl}" alt="Documento" />
            </body>
          </html>
        `)
        w.document.close()
        w.onload = () => {
          w.focus()
          w.print()
        }
      }
    } catch (error) {
      toast.error(error?.message || 'No se pudo iniciar la impresión.')
    } finally {
      setPrinting(false)
    }
  }

  const tabMeta = TAB_CONFIG.find((x) => x.id === tab) ?? TAB_CONFIG[0]
  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  return (
    <EmpresaClienteShell className="min-w-0">
      <div className="space-y-6">
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${motionStagger}`}>
          <div>
            <Link
              to="/empresa-cliente/personal"
              className="group mb-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Volver al personal
            </Link>
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
              {data ? `${data.nombres} ${data.apellidos}` : 'Empleado'}
            </h1>
            {data?.ci && (
              <p className="mt-1.5 inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                CI {data.ci}
              </p>
            )}
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Consulta y descarga documentos cargados por tu consultora. Las vistas previas se abren de
              forma segura en esta ventana.
            </p>
          </div>
        </div>

        {msg && (
          <div
            role="status"
            className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm motion-reduce:animate-none dark:border-amber-800 dark:bg-amber-900/25 dark:text-amber-100"
          >
            {msg}
          </div>
        )}

        <div
          className={`-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [scrollbar-width:thin] md:mx-0 md:flex-wrap md:overflow-visible md:pb-0 ${motionStagger}`}
          style={{ animationDelay: `${staggerDelayMs(1)}ms` }}
          role="tablist"
          aria-label="Módulos de documentos"
        >
          {TAB_CONFIG.map((t, i) => {
            const Icon = t.icon
            const count = docsForTab(t.id).length
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 ${
                  active
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25 ring-2 ring-primary-500/30'
                    : 'border border-gray-200/90 bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/70 hover:shadow-md dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:border-primary-600 dark:hover:bg-primary-900/30'
                }`}
                style={{ animationDelay: `${staggerDelayMs(i, 55, 220)}ms` }}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} />
                {t.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(2)}ms` }}>
          <Card title={`Documentos — ${tabMeta.label}`} subtitle="Solo lectura · descarga con tu sesión" gradient>
            {!Array.isArray(docs) || docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <FileText className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">{tabMeta.empty}</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {docs.map((d, i) => {
                  const title = d.nombre_original ?? d.tipo_documento?.nombre ?? `Documento #${d.id}`
                  const tipoNombre = d.tipo_documento?.nombre
                  const sizeLabel = formatFileSize(d.tamano_bytes)
                  const fechaLabel = formatFecha(d.fecha_subida)
                  const ext = (d.formato || title.split('.').pop() || '').toString().toUpperCase()
                  const downloadBusy = downloadingId === d.id
                  const previewBusy = previewLoading && preview?.id === d.id

                  return (
                    <li
                      key={d.id}
                      className={`group flex flex-col rounded-xl border border-gray-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/80 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary-800/60 ${motionStagger}`}
                      style={{ animationDelay: `${staggerDelayMs(i)}ms` }}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition-transform duration-300 group-hover:scale-105 dark:bg-primary-900/40 dark:text-primary-300">
                          {/xlsx?|csv/i.test(title) ? (
                            <FileSpreadsheet className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 dark:text-white" title={title}>
                            {title}
                          </p>
                          {tipoNombre && tipoNombre !== title && (
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{tipoNombre}</p>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            {ext && <span className="font-mono">{ext}</span>}
                            {sizeLabel && <span>{sizeLabel}</span>}
                            {fechaLabel && <span>Subido {fechaLabel}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-700/80">
                        <button
                          type="button"
                          disabled={previewBusy}
                          onClick={() => handleVistaPrevia(d)}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 sm:min-h-0 sm:flex-initial sm:py-2"
                        >
                          {previewBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          Vista previa
                        </button>
                        <button
                          type="button"
                          disabled={downloadBusy}
                          onClick={() => handleDescargar(d)}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/25 disabled:opacity-50 sm:min-h-0 sm:flex-initial sm:py-2"
                        >
                          {downloadBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Descargar
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>

        <Modal
          isOpen={!!preview}
          onClose={closePreview}
          title={preview?.nombre ? `Vista previa · ${preview.nombre}` : 'Vista previa'}
          size="xl"
          overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
          className="max-w-5xl animate-scale-in rounded-2xl shadow-2xl motion-reduce:animate-none"
          bodyClassName="max-h-[min(78vh,720px)] overflow-hidden p-0 sm:p-0"
          footer={
            preview?.id ? (
              <div className="flex w-full flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={previewLoading || previewError || !preview?.kind || preview.kind === 'none' || printing}
                  onClick={handleImprimirPreview}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                  Imprimir
                </button>
                <button
                  type="button"
                  onClick={() => handleDescargar({ id: preview.id, nombre_original: preview.nombre })}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </button>
              </div>
            ) : null
          }
        >
          <div className="flex min-h-[min(70vh,640px)] flex-col bg-gray-100 dark:bg-gray-900/80">
            {previewLoading && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400 motion-reduce:animate-none" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Cargando documento…</p>
              </div>
            )}
            {!previewLoading && previewError && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">{previewError}</p>
              </div>
            )}
            {!previewLoading && !previewError && preview?.kind === 'pdf' && objectUrl && (
              <iframe title="Vista previa PDF" src={objectUrl} className="h-[min(70vh,640px)] w-full flex-1 border-0 bg-white" />
            )}
            {!previewLoading && !previewError && preview?.kind === 'image' && objectUrl && (
              <div className="flex flex-1 items-center justify-center overflow-auto p-4">
                <img
                  src={objectUrl}
                  alt={preview.nombre || 'Documento'}
                  className="max-h-[min(68vh,620px)] max-w-full object-contain shadow-md"
                />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </EmpresaClienteShell>
  )
}
