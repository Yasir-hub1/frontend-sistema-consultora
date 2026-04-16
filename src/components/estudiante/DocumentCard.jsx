import React, { useState } from 'react'
import { FileText, Upload, CheckCircle, Clock, XCircle, Eye, RefreshCw, AlertCircle } from 'lucide-react'
import UploadDocumentModal from './UploadDocumentModal'
import toast from 'react-hot-toast'

const DocumentCard = ({ documento, onUploadSuccess }) => {
  const [showModal, setShowModal] = useState(false)

  const getEstadoInfo = () => {
    if (!documento.subido) {
      return {
        icon: <Upload className="h-5 w-5" />,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
        estado: 'Pendiente',
        badge: 'bg-gray-100 text-gray-600'
      }
    }

    switch (documento.estado) {
      case 'aprobado':
      case '1':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          estado: 'Aprobado',
          badge: 'bg-green-100 text-green-700'
        }
      case 'rechazado':
      case '2':
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          estado: 'Rechazado',
          badge: 'bg-red-100 text-red-700'
        }
      case 'pendiente':
      case '0':
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          estado: 'En Revisión',
          badge: 'bg-yellow-100 text-yellow-700'
        }
    }
  }

  const estadoInfo = getEstadoInfo()

  // Mapeo de nombres de documentos para mostrar nombres más cortos
  const nombresDocumentos = {
    'Estudiante': 'Documento',
    'Carnet de Identidad - Anverso': 'CI - Anverso',
    'Carnet de Identidad - Reverso': 'CI - Reverso',
    'Certificado de Nacimiento': 'Certificado de Nacimiento',
    'Título de Bachiller': 'Título de Bachiller',
    'CI - Anverso': 'CI - Anverso',
    'CI - Reverso': 'CI - Reverso'
  }

  // Determinar si es opcional (solo Título de Bachiller)
  const esOpcional = documento.nombre?.toLowerCase().includes('título') || 
                     documento.nombre?.toLowerCase().includes('bachiller') ||
                     documento.nombre_entidad?.toLowerCase().includes('título') ||
                     documento.nombre_entidad?.toLowerCase().includes('bachiller')

  const nombreDocumento = nombresDocumentos[documento.nombre] || 
                          nombresDocumentos[documento.nombre_entidad] || 
                          documento.nombre || 
                          documento.nombre_entidad || 
                          'Documento'

  return (
    <>
      <div className={`relative border-2 rounded-lg p-4 transition-all ${
        documento.subido 
          ? `${estadoInfo.borderColor} ${estadoInfo.bgColor}` 
          : 'border-dashed border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
      }`}>
        {/* Badge de estado */}
        {documento.subido && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.badge} flex items-center gap-1`}>
            {estadoInfo.icon}
            {estadoInfo.estado}
          </div>
        )}

        {/* Contenido */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className={`p-3 rounded-lg ${documento.subido ? estadoInfo.bgColor : 'bg-gray-100'}`}>
            {documento.subido ? (
              estadoInfo.icon
            ) : (
              <FileText className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1 w-full">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {nombreDocumento}
            </h3>
            {(!documento.requerido || esOpcional) && (
              <p className="text-xs text-gray-500 mb-2">Opcional</p>
            )}
            {documento.requerido && !esOpcional && (
              <p className="text-xs text-gray-500 mb-2">Requerido</p>
            )}

            {/* Información del documento subido */}
            {documento.subido && (
              <div className="mt-2 space-y-1">
                {documento.fecha_subida && (
                  <p className="text-xs text-gray-600">
                    Subido: {new Date(documento.fecha_subida).toLocaleDateString()}
                  </p>
                )}
                {documento.observaciones && documento.estado === 'rechazado' && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <p className="font-medium mb-1">Observaciones:</p>
                    <p>{documento.observaciones}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón de acción */}
          <button
            onClick={() => setShowModal(true)}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
              documento.subido && documento.estado === 'rechazado'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : documento.subido
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {documento.subido && documento.estado === 'rechazado' ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Re-subir
              </>
            ) : documento.subido ? (
              <>
                <Eye className="h-4 w-4" />
                Ver/Actualizar
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de subida */}
      <UploadDocumentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tiposDocumento={[{
          tipo_documento_id: documento.tipo_documento_id,
          nombre: documento.nombre || documento.nombre_entidad,
          nombre_entidad: documento.nombre_entidad || documento.nombre,
          requerido: documento.requerido
        }]}
        tipoDocumentoSeleccionado={documento.tipo_documento_id}
        onSuccess={() => {
          setShowModal(false)
          // Esperar un momento para que el backend procese antes de recargar
          setTimeout(() => {
            onUploadSuccess?.()
          }, 1000)
        }}
      />
    </>
  )
}

export default DocumentCard

