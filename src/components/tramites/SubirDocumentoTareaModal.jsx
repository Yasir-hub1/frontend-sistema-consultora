import { useEffect, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'

const MAX_MB = 10

export default function SubirDocumentoTareaModal({
  isOpen,
  onClose,
  tarea,
  onConfirm,
  uploading = false,
}) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setError('')
    }
  }, [isOpen])

  const onPick = (e) => {
    const f = e.target.files?.[0] ?? null
    setError('')
    if (!f) {
      setFile(null)
      return
    }
    const okType = f.type === 'application/pdf' || f.type.startsWith('image/')
    const okExt = /\.(pdf|png|jpe?g|webp)$/i.test(f.name)
    if (!okType && !okExt) {
      setError('Solo se permiten archivos PDF o imagen (JPG, PNG, WebP).')
      setFile(null)
      e.target.value = ''
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo no puede superar ${MAX_MB} MB.`)
      setFile(null)
      e.target.value = ''
      return
    }
    setFile(f)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      setError('Selecciona un archivo para continuar.')
      return
    }
    onConfirm?.(file)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subir documento"
      size="md"
      bodyClassName="p-4 sm:p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {tarea ? (
          <div className="rounded-xl border border-primary-200/80 bg-primary-50/50 p-3 dark:border-primary-900/50 dark:bg-primary-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
              Tarea
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{tarea.nombre}</p>
            {tarea.requiere_documento ? (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Este paso requiere al menos un documento antes de marcarlo como completado.
              </p>
            ) : null}
          </div>
        ) : null}

        <label
          className={`flex min-h-[10rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition ${
            file
              ? 'border-primary-400 bg-primary-50/40 dark:border-primary-600 dark:bg-primary-950/20'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-primary-700 dark:hover:bg-gray-800/40'
          }`}
        >
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onPick}
            disabled={uploading}
          />
          {file ? (
            <>
              <FileText className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              <p className="mt-3 max-w-full truncate px-2 text-sm font-semibold text-gray-900 dark:text-white">
                {file.name}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · Toca para cambiar
              </p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                Toca para elegir archivo
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF o imagen · máx. {MAX_MB} MB</p>
            </>
          )}
        </label>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={uploading || !file} className="gap-2">
            <Upload className="h-4 w-4" />
            {uploading ? 'Subiendo…' : 'Subir documento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
