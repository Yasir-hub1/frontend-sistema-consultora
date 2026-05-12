import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, Download, Eye, FileText, RefreshCw, Upload } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { colaboradorService } from '../../services/colaboradorService'
import { empresaClienteService } from '../../services/empresaClienteService'
import { useAuth } from '../../contexts/AuthContext'
import { colaboradorPuedeGestionarDocumentosLegalesMiEmpresa } from '../../utils/colaboradorPermisos'
import { PAGINATION_CONFIG } from '../../utils/constants'

const DOCUMENTOS = empresaClienteService.DOCUMENTOS_MI_EMPRESA

/** Coincide con validación Laravel `max:10240` (kilobytes) en Mi empresa / colaborador. */
const MAX_PDF_BYTES = 10 * 1024 * 1024

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })
}

function displayNombreEmpresa(r) {
  return r.nombre ?? r.razon_social ?? '—'
}

/**
 * Carga de PDFs del catálogo «Mi empresa» (NIT, ROE, etc.) para empresas asignadas.
 */
export default function ColaboradorMiEmpresaDocumentosPanel() {
  const { user } = useAuth()
  const [empresas, setEmpresas] = useState([])
  const [empresaId, setEmpresaId] = useState('')
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [rows, setRows] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [uploadingKey, setUploadingKey] = useState('')
  const [preview, setPreview] = useState({
    open: false,
    title: '',
    url: '',
    contentType: '',
    key: '',
    nombreOriginal: '',
  })
  const fileInputRefs = useRef({})

  const puedeSubir = colaboradorPuedeGestionarDocumentosLegalesMiEmpresa(user)

  const mapped = useMemo(() => {
    const byKey = new Map(rows.map((r) => [r.tipo_documento, r]))
    return DOCUMENTOS.map((doc) => {
      const row = byKey.get(doc.key)
      return {
        key: doc.key,
        label: doc.label,
        uploaded: Boolean(row?.subido),
        nombre: row?.nombre_original || '',
        tamano: row?.tamano_bytes || null,
        fecha: row?.fecha_subida || null,
      }
    })
  }, [rows])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingEmpresas(true)
      const res = await colaboradorService.listEmpresasAsignadas({
        page: 1,
        per_page: Math.max(50, PAGINATION_CONFIG.DEFAULT_PAGE_SIZE),
        search: '',
      })
      if (cancelled) return
      if (res.success) {
        const payload = res.data
        const d = payload?.data ?? payload?.items ?? []
        const list = Array.isArray(d) ? d : []
        setEmpresas(list)
        setEmpresaId((prev) => {
          if (prev && list.some((e) => String(e.id) === String(prev))) return prev
          return list[0]?.id != null ? String(list[0].id) : ''
        })
      } else {
        setEmpresas([])
        setEmpresaId('')
        toast.error(res.message || 'No se pudieron cargar las empresas.')
      }
      setLoadingEmpresas(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!empresaId) {
      setRows([])
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingDocs(true)
      const res = await colaboradorService.listMiEmpresaDocumentos(Number(empresaId))
      if (cancelled) return
      if (res.success) setRows(res.data?.items || [])
      else toast.error(res.message || 'No se pudieron cargar los documentos.')
      setLoadingDocs(false)
    })()
    return () => {
      cancelled = true
    }
  }, [empresaId])

  useEffect(
    () => () => {
      if (preview.url) URL.revokeObjectURL(preview.url)
    },
    [preview.url]
  )

  const openSelector = (key) => {
    fileInputRefs.current[key]?.click()
  }

  const onSelectedFile = async (key, file) => {
    if (!file || !empresaId) return
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF.')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error('El PDF no puede superar 10 MB. Comprimí el archivo o dividí el contenido.')
      return
    }
    setUploadingKey(key)
    const res = await colaboradorService.uploadMiEmpresaDocumento(Number(empresaId), key, file)
    if (res.success) {
      toast.success('Documento guardado correctamente.')
      const reload = await colaboradorService.listMiEmpresaDocumentos(Number(empresaId))
      if (reload.success) setRows(reload.data?.items || [])
    } else {
      toast.error(res.message || 'No se pudo subir el documento.')
    }
    setUploadingKey('')
  }

  const onPreview = async (row) => {
    if (!empresaId) return
    const res = await colaboradorService.fetchMiEmpresaDocumentoVistaPreviaBlob(Number(empresaId), row.key)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo cargar la vista previa.')
      return
    }
    if (preview.url) URL.revokeObjectURL(preview.url)
    const url = URL.createObjectURL(res.blob)
    setPreview({
      open: true,
      title: row.nombre || row.label,
      url,
      contentType: res.contentType || 'application/pdf',
      key: row.key,
      nombreOriginal: row.nombre || `${row.key}.pdf`,
    })
  }

  const closePreview = () => {
    if (preview.url) URL.revokeObjectURL(preview.url)
    setPreview({ open: false, title: '', url: '', contentType: '', key: '', nombreOriginal: '' })
  }

  const onDownload = async (row) => {
    if (!empresaId) return
    try {
      await colaboradorService.descargarMiEmpresaDocumento(Number(empresaId), row.key, row.nombre || `${row.key}.pdf`)
    } catch (error) {
      toast.error(error?.message || 'No se pudo descargar el documento.')
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200/90 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/50">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              Documentos legales de la empresa (PDF)
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-gray-600 dark:text-gray-400">
              Los cargás vos en nombre del cliente; en el portal «Mi empresa» solo pueden ver y descargar.
            </p>
          </div>
          <label className="flex min-w-[12rem] flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Empresa
            <select
              value={empresaId}
              disabled={loadingEmpresas || empresas.length === 0}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {empresas.length === 0 ? (
                <option value="">Sin empresas asignadas</option>
              ) : (
                empresas.map((e) => (
                  <option key={e.id} value={String(e.id)}>
                    {displayNombreEmpresa(e)}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        {!puedeSubir ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
            No tenés permiso para subir estos documentos. Pedí a tu consultora que ajuste permisos en Mi equipo.
          </p>
        ) : null}

        <Card
          title="Catálogo"
          subtitle="Opcionales; podés reemplazar cuando haga falta"
          gradient
          headerClassName="px-5 py-4"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50/70 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Archivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Subido</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {mapped.map((row) => {
                  const isUploading = uploadingKey === row.key
                  return (
                    <tr key={row.key} className="align-top">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-4 w-4 text-primary-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{row.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {row.uploaded ? (
                          <div className="space-y-0.5">
                            <p className="max-w-[24rem] truncate font-medium">{row.nombre}</p>
                            <p className="text-xs text-gray-500">{formatSize(row.tamano)}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin archivo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(row.fecha)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          {row.uploaded ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Eye className="h-4 w-4" />}
                                onClick={() => void onPreview(row)}
                                disabled={!empresaId || loadingDocs}
                              >
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Download className="h-4 w-4" />}
                                onClick={() => void onDownload(row)}
                                disabled={!empresaId || loadingDocs}
                              >
                                Descargar
                              </Button>
                            </>
                          ) : null}
                          {puedeSubir ? (
                            <>
                              <Button
                                size="sm"
                                icon={
                                  isUploading ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : row.uploaded ? (
                                    <RefreshCw className="h-4 w-4" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )
                                }
                                loading={isUploading}
                                disabled={!empresaId || loadingDocs}
                                onClick={() => openSelector(row.key)}
                              >
                                {row.uploaded ? 'Reemplazar' : 'Subir PDF'}
                              </Button>
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[row.key] = el
                                }}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  e.target.value = ''
                                  void onSelectedFile(row.key, file)
                                }}
                              />
                            </>
                          ) : null}
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

      <Modal
        isOpen={preview.open}
        onClose={closePreview}
        title={preview.title || 'Vista previa'}
        size="xl"
        footer={
          <Button
            size="sm"
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() => void onDownload({ key: preview.key, nombre: preview.nombreOriginal })}
          >
            Descargar
          </Button>
        }
      >
        {!preview.url ? null : preview.contentType?.includes('pdf') ? (
          <iframe title="Vista previa" src={preview.url} className="h-[70vh] w-full rounded-md border border-gray-200 dark:border-gray-700" />
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">No hay vista previa para este formato.</p>
        )}
      </Modal>
    </>
  )
}
