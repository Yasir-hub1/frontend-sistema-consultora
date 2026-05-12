import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Eye, FileText } from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import EmpresaClienteShell from '../../components/empresa-cliente/EmpresaClienteShell'
import { empresaClienteService } from '../../services/empresaClienteService'

const DOCUMENTOS = empresaClienteService.DOCUMENTOS_MI_EMPRESA

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

export default function EmpresaClienteMiEmpresa() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState({
    open: false,
    title: '',
    url: '',
    contentType: '',
    key: '',
    nombreOriginal: '',
  })

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

  const load = async () => {
    setLoading(true)
    const res = await empresaClienteService.listMiEmpresaDocumentos()
    if (res.success) setRows(res.data?.items || [])
    else toast.error(res.message || 'No se pudieron cargar los documentos.')
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(
    () => () => {
      if (preview.url) URL.revokeObjectURL(preview.url)
    },
    [preview.url]
  )

  const onPreview = async (row) => {
    const res = await empresaClienteService.fetchMiEmpresaDocumentoVistaPreviaBlob(row.key)
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
    try {
      await empresaClienteService.descargarMiEmpresaDocumento(row.key, row.nombre || `${row.key}.pdf`)
    } catch (error) {
      toast.error(error?.message || 'No se pudo descargar el documento.')
    }
  }

  return (
    <EmpresaClienteShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">Mi empresa</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Documentos legales de tu empresa en PDF. La carga y el reemplazo los realiza tu consultora o colaborador; acá podés
            consultarlos y descargarlos cuando los hayan subido.
          </p>
        </div>

        <Card
          title="Documentos empresariales (PDF)"
          subtitle="Solo lectura: ver y descargar"
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
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                      Cargando…
                    </td>
                  </tr>
                ) : (
                  mapped.map((row) => (
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
                      <div className="flex justify-end gap-2">
                        {row.uploaded ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<Eye className="h-4 w-4" />}
                              onClick={() => void onPreview(row)}
                            >
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<Download className="h-4 w-4" />}
                              onClick={() => void onDownload(row)}
                            >
                              Descargar
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                )}
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
    </EmpresaClienteShell>
  )
}
