import React, { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { CheckCircle, XCircle, Download, FileText, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { APP_CONFIG } from '../../utils/constants'

const DocumentPreviewModal = ({ 
  isOpen, 
  onClose, 
  documento, 
  estudiante,
  onAprobar,
  onRechazar,
  loading = false
}) => {
  const [imageError, setImageError] = useState(false)
  const [pdfError, setPdfError] = useState(false)
  const [showRechazarForm, setShowRechazarForm] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  if (!documento || !isOpen) return null

  // Construir URL completa si es relativa
  // El backend ahora devuelve url(Storage::url()) que genera URLs completas
  // Pero también puede devolver URLs relativas como /storage/...
  let url = documento.url_descarga || documento.path
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    // Si es una URL relativa, construir la URL completa apuntando al backend
    // APP_CONFIG.apiUrl es algo como 'http://localhost:8000/api'
    const apiUrl = APP_CONFIG.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const baseUrl = apiUrl.replace('/api', '') // Quitar /api para obtener la base del backend (http://localhost:8000)
    
    // Si la URL empieza con /storage/, solo agregar el dominio del backend
    // Si no, agregar /storage/ antes
    if (url.startsWith('/storage/')) {
      url = `${baseUrl}${url}`
    } else if (url.startsWith('/')) {
      url = `${baseUrl}/storage${url}`
    } else {
      url = `${baseUrl}/storage/${url}`
    }
  }

  const esImagen = url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  const esPDF = url && /\.pdf$/i.test(url)
  const nombreArchivo = documento.nombre_documento || documento.nombre || 'Documento'

  const handleAprobar = async () => {
    if (onAprobar) {
      await onAprobar(documento.id || documento.documento_id)
    }
  }

  const handleRechazar = async () => {
    if (!motivoRechazo || motivoRechazo.trim().length < 10) {
      toast.error('El motivo del rechazo debe tener al menos 10 caracteres')
      return
    }

    if (onRechazar) {
      await onRechazar(documento.id || documento.documento_id, motivoRechazo)
      setShowRechazarForm(false)
      setMotivoRechazo('')
    }
  }

  const handleDownload = () => {
    if (url) {
      // Usar la URL ya construida (que apunta al backend)
      const link = document.createElement('a')
      link.href = url
      link.download = nombreArchivo
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const puedeAprobarRechazar = documento.estado === '0' || documento.estado === 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vista Previa: ${nombreArchivo}`}
      size="xl"
      className="max-w-6xl"
    >
      <div className="space-y-4">
        {/* Información del documento */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {estudiante && (
              <>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Estudiante:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {estudiante.nombre} {estudiante.apellido}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">CI:</span>
                  <p className="text-gray-900 dark:text-gray-100">{estudiante.ci}</p>
                </div>
              </>
            )}
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Versión:</span>
              <p className="text-gray-900 dark:text-gray-100">{documento.version || '1.0'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Estado:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {documento.estado === '0' || documento.estado === 0 ? 'Pendiente' :
                 documento.estado === '1' || documento.estado === 1 ? 'Aprobado' :
                 documento.estado === '2' || documento.estado === 2 ? 'Rechazado' : 'Desconocido'}
              </p>
            </div>
            {documento.fecha_subida && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de subida:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(documento.fecha_subida).toLocaleDateString()}
                </p>
              </div>
            )}
            {documento.observaciones && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Observaciones:</span>
                <p className="text-gray-900 dark:text-gray-100">{documento.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* Vista previa del documento */}
        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
          {!url ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No hay archivo disponible para este documento
              </p>
            </div>
          ) : esImagen ? (
            <div className="relative bg-white dark:bg-gray-800">
              {imageError ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Error al cargar la imagen
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageError(false)
                      window.open(url, '_blank')
                    }}
                  >
                    Abrir en nueva pestaña
                  </Button>
                </div>
              ) : (
                <div className="relative w-full" style={{ minHeight: '400px', maxHeight: '70vh' }}>
                  <img
                    src={url}
                    alt={nombreArchivo}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '70vh' }}
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : esPDF ? (
            <div className="relative w-full" style={{ minHeight: '600px', maxHeight: '70vh' }}>
              {pdfError ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Error al cargar el PDF. Puede que el navegador no soporte la visualización.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                  >
                    Abrir en nueva pestaña
                  </Button>
                </div>
              ) : (
                <iframe
                  src={url}
                  className="w-full h-full"
                  style={{ minHeight: '600px', maxHeight: '70vh' }}
                  title={nombreArchivo}
                  onError={() => setPdfError(true)}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                Tipo de archivo no soportado para vista previa
              </p>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={handleDownload}
              >
                Descargar archivo
              </Button>
            </div>
          )}
        </div>

        {/* Formulario de rechazo */}
        {showRechazarForm && (
          <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">
              Motivo del Rechazo *
            </h4>
            <textarea
              className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              rows="4"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Describe el motivo del rechazo (mínimo 10 caracteres)..."
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {motivoRechazo.length}/500 caracteres
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRechazarForm(false)
                  setMotivoRechazo('')
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<XCircle className="h-4 w-4" />}
                onClick={handleRechazar}
                disabled={loading || !motivoRechazo || motivoRechazo.trim().length < 10}
              >
                Confirmar Rechazo
              </Button>
            </div>
          </div>
        )}

        {/* Acciones */}
        {puedeAprobarRechazar && !showRechazarForm && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
            >
              Descargar
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<XCircle className="h-4 w-4" />}
                onClick={() => setShowRechazarForm(true)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Rechazar
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={handleAprobar}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Aprobar'}
              </Button>
            </div>
          </div>
        )}

        {/* Si ya está procesado, solo mostrar botón de descarga */}
        {!puedeAprobarRechazar && (
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
            >
              Descargar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default DocumentPreviewModal

