import React, { useState, useRef, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { upload } from '../../services/api'
import { compressImage, formatFileSize } from '../../utils/imageCompression'
import toast from 'react-hot-toast'

const UploadDocumentModal = ({ isOpen, onClose, tiposDocumento, tipoDocumentoSeleccionado, onSuccess }) => {
  const [selectedTipo, setSelectedTipo] = useState(tipoDocumentoSeleccionado || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const fileInputRef = useRef(null)

  // Si hay un tipo preseleccionado, establecerlo al abrir el modal
  useEffect(() => {
    if (isOpen && tipoDocumentoSeleccionado) {
      setSelectedTipo(tipoDocumentoSeleccionado)
    } else if (!isOpen) {
      // Limpiar al cerrar
      setSelectedFile(null)
      setPreview(null)
      setOriginalSize(0)
      setCompressedSize(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [isOpen, tipoDocumentoSeleccionado])

  // Tipos de documento predefinidos si no vienen del backend
  const documentosPredefinidos = [
    { tipo_documento_id: 1, nombre: 'Carnet de Identidad - Anverso', requerido: true },
    { tipo_documento_id: 2, nombre: 'Carnet de Identidad - Reverso', requerido: true },
    { tipo_documento_id: 3, nombre: 'Certificado de Nacimiento', requerido: true },
    { tipo_documento_id: 4, nombre: 'Título de Bachiller', requerido: false }
  ]

  // Usar tipos de documento del backend o los predefinidos
  const documentosDisponibles = tiposDocumento && tiposDocumento.length > 0 
    ? tiposDocumento.map(tipo => ({
        tipo_documento_id: tipo.tipo_documento_id,
        nombre: tipo.nombre || tipo.nombre_entidad || 'Documento',
        requerido: tipo.requerido !== false
      }))
    : documentosPredefinidos

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos JPG, PNG o PDF')
      return
    }

    // Validar tamaño (máximo 10MB antes de comprimir)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('El archivo es muy grande. Máximo 10MB')
      return
    }

    setOriginalSize(file.size)
    setSelectedFile(file)

    // Mostrar preview si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    // Comprimir imagen si es necesario
    if (file.type.startsWith('image/')) {
      try {
        setUploading(true)
        const compressed = await compressImage(file, 1920, 1920, 0.8, 2)
        setCompressedSize(compressed.size)
        setSelectedFile(compressed)
        toast.success(`Imagen comprimida: ${formatFileSize(originalSize)} → ${formatFileSize(compressed.size)}`)
      } catch (error) {
        console.error('Error comprimiendo imagen:', error)
        toast.error('Error al comprimir la imagen')
      } finally {
        setUploading(false)
      }
    } else {
      setCompressedSize(file.size)
    }
  }

  const handleUpload = async () => {
    if (!selectedTipo) {
      toast.error('Selecciona un tipo de documento')
      return
    }

    if (!selectedFile) {
      toast.error('Selecciona un archivo')
      return
    }

    // Buscar el tipo_documento_id real desde el backend
    const tipoDoc = documentosDisponibles.find(t => 
      t.tipo_documento_id == selectedTipo || 
      String(t.tipo_documento_id) === String(selectedTipo)
    )

    if (!tipoDoc || !tipoDoc.tipo_documento_id) {
      toast.error('Tipo de documento no válido')
      return
    }

    const formData = new FormData()
    formData.append('archivo', selectedFile)
    formData.append('tipo_documento_id', tipoDoc.tipo_documento_id)

    try {
      setUploading(true)
      console.log('Subiendo documento:', {
        tipo_documento_id: tipoDoc.tipo_documento_id,
        archivo: selectedFile.name,
        tamaño: selectedFile.size
      })
      
      const response = await upload('/estudiante/documentos/subir', formData)

      console.log('Respuesta del servidor:', response.data)

      if (response.data.success) {
        toast.success('Documento subido exitosamente')
        // Esperar un momento antes de cerrar para que el usuario vea el mensaje
        setTimeout(() => {
          onSuccess?.()
          handleClose()
        }, 500)
      } else {
        toast.error(response.data.message || 'Error al subir el documento')
      }
    } catch (error) {
      console.error('Error subiendo documento:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.archivo?.[0] ||
                          error.response?.data?.errors?.tipo_documento_id?.[0] ||
                          'Error al subir el documento'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!tipoDocumentoSeleccionado) {
      setSelectedTipo('')
    }
    setSelectedFile(null)
    setPreview(null)
    setOriginalSize(0)
    setCompressedSize(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Subir Documento
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo de documento - Solo mostrar si hay más de uno o no hay preseleccionado */}
          {(!tipoDocumentoSeleccionado || documentosDisponibles.length > 1) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={uploading || !!tipoDocumentoSeleccionado}
              >
                <option value="">Selecciona un tipo de documento</option>
                {documentosDisponibles.map((tipo) => (
                  <option key={tipo.tipo_documento_id} value={tipo.tipo_documento_id}>
                    {tipo.nombre || tipo.nombre_entidad || 'Documento'}
                    {tipo.requerido === false && ' (Opcional)'}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Mostrar nombre del documento si está preseleccionado */}
          {tipoDocumentoSeleccionado && documentosDisponibles.length === 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                Subiendo: {documentosDisponibles[0]?.nombre || documentosDisponibles[0]?.nombre_entidad || 'Documento'}
              </p>
            </div>
          )}

          {/* Selector de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
              <div className="space-y-1 text-center">
                {preview ? (
                  <div className="space-y-2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto max-h-48 rounded-lg"
                    />
                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                    {originalSize > 0 && compressedSize > 0 && originalSize !== compressedSize && (
                      <p className="text-xs text-green-600">
                        Comprimido: {formatFileSize(originalSize)} → {formatFileSize(compressedSize)}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                          >
                            <span>Selecciona un archivo</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              onChange={handleFileSelect}
                              ref={fileInputRef}
                              disabled={uploading}
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF hasta 10MB
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Información de compresión */}
          {originalSize > 0 && compressedSize > 0 && originalSize !== compressedSize && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Imagen comprimida exitosamente
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Tamaño original: {formatFileSize(originalSize)} → Tamaño comprimido: {formatFileSize(compressedSize)}
                  {' '}({Math.round((1 - compressedSize / originalSize) * 100)}% de reducción)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedTipo || !selectedFile || uploading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir Documento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadDocumentModal

