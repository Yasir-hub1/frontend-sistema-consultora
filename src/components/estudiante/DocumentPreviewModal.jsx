import React, { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { Printer, FileText, Loader2, AlertCircle, X } from 'lucide-react'
import { APP_CONFIG } from '../../utils/constants'

const DocumentPreviewModal = ({ 
  isOpen, 
  onClose, 
  documento
}) => {
  const [imageError, setImageError] = useState(false)
  const [pdfError, setPdfError] = useState(false)

  if (!documento || !isOpen) return null

  // Construir URL completa si es relativa
  let url = documento.url_descarga || documento.path
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    const apiUrl = APP_CONFIG.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const baseUrl = apiUrl.replace('/api', '')
    
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
  const nombreArchivo = documento.nombre_documento || documento.nombre_entidad || documento.nombre || 'Documento'

  const handlePrint = () => {
    if (!url) return

    // Para imágenes, crear una ventana de impresión optimizada
    if (esImagen) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${nombreArchivo}</title>
              <style>
                @media print {
                  @page {
                    margin: 0.5cm;
                    size: auto;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                    page-break-inside: avoid;
                    display: block;
                    margin: 0 auto;
                  }
                }
                @media screen {
                  body {
                    margin: 20px;
                    text-align: center;
                    background: #f5f5f5;
                  }
                  img {
                    max-width: 90%;
                    height: auto;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border-radius: 8px;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${url}" alt="${nombreArchivo}" onload="setTimeout(() => { window.print(); }, 500); window.onafterprint = function() { setTimeout(() => { window.close(); }, 100); }" />
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    } else if (esPDF) {
      // Para PDFs, abrir en nueva ventana y luego imprimir
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        // Esperar a que el PDF se cargue antes de imprimir
        const checkLoaded = setInterval(() => {
          try {
            if (printWindow.document && printWindow.document.readyState === 'complete') {
              clearInterval(checkLoaded)
              setTimeout(() => {
                printWindow.print()
              }, 1000)
            }
          } catch (e) {
            // Si hay error de CORS (normal con PDFs), intentar imprimir directamente después de un delay
            clearInterval(checkLoaded)
            setTimeout(() => {
              printWindow.print()
            }, 2000)
          }
        }, 100)
        
        // Timeout de seguridad
        setTimeout(() => {
          clearInterval(checkLoaded)
          try {
            printWindow.print()
          } catch (e) {
            console.error('Error al imprimir PDF:', e)
          }
        }, 5000)
      }
    } else {
      // Para otros tipos, abrir y luego imprimir
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 1000)
        }
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={nombreArchivo}
      size="xl"
      className="max-w-7xl"
    >
      <div className="space-y-4">
        {/* Información del documento */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Versión:</span>
              <p className="text-gray-900 dark:text-gray-100">{documento.version || '1.0'}</p>
            </div>
            {documento.fecha_subida && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de subida:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(documento.fecha_subida).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Estado:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {documento.estado === '0' || documento.estado === 0 ? 'Pendiente' :
                 documento.estado === '1' || documento.estado === 1 ? 'Aprobado' :
                 documento.estado === '2' || documento.estado === 2 ? 'Rechazado' : 'No subido'}
              </p>
            </div>
            {documento.observaciones && (
              <div className="md:col-span-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">Observaciones:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{documento.observaciones}</p>
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
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <div className="relative w-full flex items-center justify-center bg-white dark:bg-gray-800 p-4" style={{ minHeight: '500px', maxHeight: '80vh' }}>
                  <img
                    src={url}
                    alt={nombreArchivo}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                </div>
              )}
            </div>
          ) : esPDF ? (
            <div className="relative w-full bg-white dark:bg-gray-800" style={{ minHeight: '600px', maxHeight: '80vh' }}>
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
                  className="w-full h-full rounded-lg"
                  style={{ minHeight: '600px', maxHeight: '80vh' }}
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
                icon={<Printer className="h-4 w-4" />}
                onClick={handlePrint}
              >
                Imprimir archivo
              </Button>
            </div>
          )}
        </div>

        {/* Acciones */}
        {url && (
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              size="md"
              icon={<Printer className="h-5 w-5" />}
              onClick={handlePrint}
            >
              Imprimir
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default DocumentPreviewModal

