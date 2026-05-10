import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Eye, FileStack, RefreshCw } from 'lucide-react'
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

function formatFecha(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

export default function EmpresaClienteOtrosDocumentos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)
  const [previewLoadingId, setPreviewLoadingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await empresaClienteService.listOtrosDocumentosColaborador()
    setLoading(false)
    if (res.success) {
      setItems(res.data?.items ?? [])
    } else {
      setItems([])
      toast.error(res.message || 'No se pudo cargar el listado.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onPreview = async (row) => {
    setPreviewLoadingId(row.id)
    const res = await empresaClienteService.fetchOtroDocumentoColaboradorVistaPreviaBlob(row.id)
    setPreviewLoadingId(null)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo abrir la vista previa.')
      return
    }
    const url = URL.createObjectURL(res.blob)
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return { id: row.id, title: row.nombre_original, url }
    })
  }

  const onClosePreview = () => {
    setPreview((p) => {
      if (p?.url) URL.revokeObjectURL(p.url)
      return null
    })
  }

  const onDescargar = async (row) => {
    try {
      await empresaClienteService.descargarOtroDocumentoColaborador(row.id, row.nombre_original)
      toast.success('Descarga iniciada.')
    } catch {
      toast.error('No se pudo descargar el archivo.')
    }
  }

  return (
    <EmpresaClienteShell>
      <div className="space-y-6">
        <div className={motionStagger} style={{ animationDelay: `${staggerDelayMs(0)}ms` }}>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            <FileStack className="h-7 w-7 text-primary-600" />
            Documentos del colaborador
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            PDF que tu consultora o colaborador cargó en «otros documentos» de tu empresa (solo lectura).
          </p>
        </div>
        <Card
          title="Archivos compartidos"
          subtitle="Para nuevas cargas, la consultora usa el portal del colaborador."
          gradient
          className={motionStagger}
          style={{ animationDelay: `${staggerDelayMs(1)}ms` }}
        >
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => void load()}
              disabled={loading}
            >
              Actualizar
            </Button>
          </div>
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Aún no hay documentos en esta sección.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Archivo</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Descripción</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Subida</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Tamaño</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((row) => (
                    <tr key={row.id} className="bg-white dark:bg-gray-900/30">
                      <td className="max-w-[12rem] px-3 py-2.5 font-medium text-gray-900 dark:text-white">
                        <span className="line-clamp-2">{row.nombre_original}</span>
                      </td>
                      <td className="max-w-[14rem] px-3 py-2.5 text-gray-600 dark:text-gray-300">
                        {row.descripcion ? (
                          <span className="line-clamp-2">{row.descripcion}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-400">
                        {formatFecha(row.fecha_subida)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-500 dark:text-gray-400">
                        {formatBytes(row.tamano_bytes)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => void onPreview(row)}
                            disabled={previewLoadingId === row.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDescargar(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 dark:border-gray-600 dark:text-primary-300 dark:hover:bg-gray-800"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Descargar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={Boolean(preview)}
        onClose={onClosePreview}
        title={preview?.title || 'Vista previa'}
        size="xl"
        bodyClassName="p-0"
      >
        {preview?.url ? (
          <iframe title={preview.title} src={preview.url} className="h-[75vh] w-full border-0 bg-gray-100 dark:bg-gray-900" />
        ) : null}
      </Modal>
    </EmpresaClienteShell>
  )
}

