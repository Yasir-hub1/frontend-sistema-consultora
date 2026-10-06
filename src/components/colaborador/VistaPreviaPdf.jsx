import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Download } from 'lucide-react'
import Button from '../common/Button'
import Modal from '../common/Modal'

export const MODAL_DOCUMENTOS_CLASES = {
  overlayClassName: 'animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none',
  className: 'animate-scale-in rounded-2xl motion-reduce:animate-none',
}

/**
 * `obtener` devuelve `{ success, blob, message }` como los servicios de vista previa.
 */
export function useVistaPreviaPdf() {
  const [vista, setVista] = useState(null)
  const [cargando, setCargando] = useState(null)
  const urlRef = useRef(null)

  const liberar = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
  }

  const cerrar = useCallback(() => {
    liberar()
    setVista(null)
  }, [])

  useEffect(() => liberar, [])

  const abrir = useCallback(async ({ clave, titulo, obtener, descargar }) => {
    setCargando(clave)
    const res = await obtener()
    setCargando(null)
    if (!res.success || !res.blob?.size) {
      toast.error(res.message || 'No se pudo abrir la vista previa.')
      return
    }
    liberar()
    urlRef.current = URL.createObjectURL(new Blob([res.blob], { type: 'application/pdf' }))
    setVista({ url: urlRef.current, titulo, descargar })
  }, [])

  return { vista, cargando, abrir, cerrar }
}

export function VistaPreviaPdfModal({ vista, onClose }) {
  return (
    <Modal
      isOpen={Boolean(vista)}
      onClose={onClose}
      title={vista?.titulo || 'Vista previa'}
      size="xl"
      {...MODAL_DOCUMENTOS_CLASES}
      bodyClassName="p-0 sm:p-0"
      footer={
        vista?.descargar ? (
          <Button type="button" size="sm" variant="outline" icon={<Download className="h-4 w-4" />} onClick={vista.descargar}>
            Descargar
          </Button>
        ) : null
      }
    >
      {vista ? <iframe title={vista.titulo} src={vista.url} className="h-[min(72vh,640px)] w-full border-0 bg-gray-100 dark:bg-gray-900" /> : null}
    </Modal>
  )
}
