import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, FileText, Loader2 } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { tramiteService } from '../../services/tramiteService'
import { esArchivoImagen, esArchivoPdf } from '../../utils/tramiteUtils'

export default function VerDocumentoTareaModal({
  isOpen,
  onClose,
  rol,
  tramiteId,
  tareaId,
  documento,
  onDescargar,
}) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [contentType, setContentType] = useState('')

  const nombre = documento?.nombre_original || 'Documento'
  const formato = documento?.formato
  const esImagen = esArchivoImagen(nombre, formato)
  const esPdf = esArchivoPdf(nombre, formato)

  useEffect(() => {
    if (!isOpen || !documento?.id || !tramiteId || !tareaId) {
      setPreviewUrl(null)
      setContentType('')
      return undefined
    }

    let active = true

    void (async () => {
      setLoading(true)
      const res = await tramiteService.obtenerDocumentoTarea(rol, tramiteId, tareaId, documento.id)
      if (!active) return
      setLoading(false)
      if (!res.success) {
        toast.error(res.message || 'No se pudo cargar el documento')
        return
      }
      const type = res.contentType || ''
      setContentType(type)
      const url = URL.createObjectURL(res.blob)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    })()

    return () => {
      active = false
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setContentType('')
    }
  }, [isOpen, documento?.id, tramiteId, tareaId, rol])

  const puedePrevisualizar = esImagen || esPdf || contentType.startsWith('image/') || contentType.includes('pdf')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vista previa del documento"
      size="xl"
      bodyClassName="p-0"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {onDescargar ? (
            <Button
              type="button"
              className="gap-2"
              onClick={() => onDescargar(tareaId, documento)}
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6">
        <p className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
          <FileText className="h-4 w-4 shrink-0 text-primary-500" />
          <span className="truncate">{nombre}</span>
        </p>
      </div>

      <div className="min-h-[50vh] bg-gray-50 dark:bg-gray-950/50">
        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm">Cargando documento…</p>
          </div>
        ) : previewUrl && puedePrevisualizar ? (
          esImagen || contentType.startsWith('image/') ? (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
              <img
                src={previewUrl}
                alt={nombre}
                className="max-h-[75vh] max-w-full rounded-lg border border-gray-200 object-contain shadow-sm dark:border-gray-700"
              />
            </div>
          ) : (
            <iframe
              title={nombre}
              src={previewUrl}
              className="h-[75vh] w-full border-0 bg-white dark:bg-gray-900"
            />
          )
        ) : previewUrl ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center text-gray-600 dark:text-gray-400">
            <FileText className="h-12 w-12 text-gray-400" />
            <p className="text-sm">Este tipo de archivo no se puede previsualizar en el navegador.</p>
            <p className="text-xs">Usa «Descargar» para abrirlo en tu equipo.</p>
          </div>
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
            No hay vista previa disponible.
          </div>
        )}
      </div>
    </Modal>
  )
}
