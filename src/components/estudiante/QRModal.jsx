import React, { useState, useEffect, useRef } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { 
  QrCode, 
  Copy, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Upload,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { estudiantePagoService } from '../../services/pagoService'
import toast from 'react-hot-toast'

const QRModal = ({ isOpen, onClose, cuotaId, cuotaInfo, onPaymentSuccess }) => {
  const [pago, setPago] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [uploadingComprobante, setUploadingComprobante] = useState(false)
  const [showComprobanteUpload, setShowComprobanteUpload] = useState(false)
  const [comprobanteFile, setComprobanteFile] = useState(null)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [hoursRemaining, setHoursRemaining] = useState(null)
  const statusCheckInterval = useRef(null)
  const countdownInterval = useRef(null)

  useEffect(() => {
    if (isOpen && cuotaId) {
      // Primero verificar si ya existe un QR pendiente
      checkExistingQR()
    } else {
      cleanup()
    }

    return () => {
      cleanup()
    }
  }, [isOpen, cuotaId])

  const cleanup = () => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current)
      statusCheckInterval.current = null
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current)
      countdownInterval.current = null
    }
    setPago(null)
    setShowComprobanteUpload(false)
    setComprobanteFile(null)
  }

  const checkExistingQR = async () => {
    try {
      setLoading(true)
      const response = await estudiantePagoService.getInfoQR(cuotaId)
      
      if (response.success && response.data.pago_id) {
        // Ya existe un pago QR, cargar su información
        // Si hay qr_base64 en la respuesta, usarlo directamente
        if (response.data.qr_base64) {
          const pagoData = {
            id: response.data.pago_id,
            monto: response.data.monto,
            nro_pago: response.data.nro_pago,
            qr_expires_at: response.data.qr_expires_at,
            estado_pagofacil: 'pendiente',
            verificado: false,
            qr_image: `data:image/png;base64,${response.data.qr_base64}`
          }
          setPago(pagoData)
          if (response.data.qr_expires_at) {
            startCountdown(response.data.qr_expires_at)
          }
          startStatusCheck(response.data.pago_id)
        } else {
          await loadPagoInfo(response.data.pago_id)
        }
      }
    } catch (error) {
      console.error('Error checking existing QR:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPagoInfo = async (pagoId) => {
    try {
      const response = await estudiantePagoService.consultarEstadoQR(pagoId)
      if (response.success) {
        const pagoData = response.data.pago
        setPago(pagoData)
        if (pagoData.qr_expires_at) {
          startCountdown(pagoData.qr_expires_at)
        }
        // Si está pendiente, iniciar consulta periódica
        if (pagoData.estado_pagofacil === 'pendiente') {
          startStatusCheck(pagoId)
        }
      }
    } catch (error) {
      console.error('Error loading pago info:', error)
    }
  }

  const generarQR = async () => {
    try {
      setGenerating(true)
      const monto = cuotaInfo?.saldo_pendiente || cuotaInfo?.monto || 0
      
      const response = await estudiantePagoService.generarPagoQR(cuotaId, monto)
      
      if (response.success) {
        // Combinar datos del pago con qr_base64 si está disponible
        const pagoData = {
          ...response.data.pago,
          qr_image: response.data.qr_base64 
            ? `data:image/png;base64,${response.data.qr_base64}` 
            : response.data.qr_image || response.data.pago.qr_image
        }
        setPago(pagoData)
        toast.success('QR generado exitosamente. Escanea el código para pagar.')
        
        // Iniciar countdown si hay fecha de expiración
        if (response.data.pago.qr_expires_at) {
          startCountdown(response.data.pago.qr_expires_at)
        }
        
        // Iniciar consulta periódica del estado (esperará 120 segundos antes de verificar)
        if (response.data.pago.id) {
          startStatusCheck(response.data.pago.id)
        }
      } else {
        const errorMessage = response.message || response.error || 'Error al generar QR'
        toast.error(errorMessage)
        // Notificar al admin sobre el error
        notifyAdminError(errorMessage, cuotaId)
      }
    } catch (error) {
      console.error('Error generating QR:', error)
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al generar QR. Por favor intenta nuevamente.'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      notifyAdminError(errorMessage, cuotaId)
    } finally {
      setGenerating(false)
    }
  }

  const startCountdown = (expiresAt) => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current)
    }

    const updateCountdown = () => {
      const now = new Date()
      const expiry = new Date(expiresAt)
      const diff = expiry - now

      if (diff <= 0) {
        setTimeRemaining(null)
        setHoursRemaining(null)
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current)
        }
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setHoursRemaining(hours)
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    countdownInterval.current = setInterval(updateCountdown, 1000)
  }

  // Calcular minutos restantes para el mensaje de expiración
  const getMinutesRemaining = () => {
    if (!pago?.qr_expires_at) return null
    const now = new Date()
    const expiry = new Date(pago.qr_expires_at)
    const diff = expiry - now
    if (diff <= 0) return null
    return Math.floor(diff / (1000 * 60))
  }

  const startStatusCheck = (pagoId) => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current)
    }

    // Esperar 120 segundos (2 minutos) antes de empezar a verificar
    // Esto da tiempo para que el pago se procese en la pasarela
    setTimeout(() => {
      // Primera verificación después de 120 segundos (2 minutos)
      consultarEstadoPago(pagoId)
      
      // Luego verificar cada 30 segundos
      statusCheckInterval.current = setInterval(async () => {
        await consultarEstadoPago(pagoId)
      }, 30000) // Consultar cada 30 segundos después de la primera verificación
    }, 120000) // 120 segundos = 2 minutos (no 4 minutos)
  }

  const consultarEstadoPago = async (pagoId) => {
    try {
      setCheckingStatus(true)
      const response = await estudiantePagoService.consultarEstadoQR(pagoId)
      
      if (response.success && response.data.pago) {
        const updatedPago = response.data.pago
        setPago(updatedPago)

        // Si el pago fue confirmado
        if (updatedPago.estado_pagofacil === 'completado' && updatedPago.verificado) {
          clearInterval(statusCheckInterval.current)
          statusCheckInterval.current = null
          toast.success('¡Pago confirmado exitosamente!')
          setShowComprobanteUpload(true)
          if (onPaymentSuccess) {
            // Pasar los datos del pago confirmado
            onPaymentSuccess(updatedPago)
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleComprobanteUpload = async () => {
    if (!comprobanteFile) {
      toast.error('Por favor selecciona un archivo de comprobante')
      return
    }

    try {
      setUploadingComprobante(true)
      const response = await estudiantePagoService.subirComprobanteQR(pago.id, comprobanteFile)
      
      if (response.success) {
        toast.success('Comprobante subido exitosamente')
        setShowComprobanteUpload(false)
        setComprobanteFile(null)
        // El pago ya está confirmado, solo cerramos el modal
        // La notificación al admin ya se envió cuando se confirmó el pago
        onClose()
      } else {
        toast.error(response.message || 'Error al subir comprobante')
      }
    } catch (error) {
      console.error('Error uploading comprobante:', error)
      toast.error('Error al subir comprobante. Por favor intenta nuevamente.')
    } finally {
      setUploadingComprobante(false)
    }
  }

  const consultarEstado = async () => {
    if (!pago?.id) return

    try {
      setCheckingStatus(true)
      const response = await estudiantePagoService.consultarEstadoQR(pago.id)
      
      if (response.success) {
        const pagoData = response.data.pago
        setPago(pagoData)
        if (pagoData.estado_pagofacil === 'completado' && pagoData.verificado) {
          toast.success('¡Pago confirmado exitosamente!')
          setShowComprobanteUpload(true)
          if (onPaymentSuccess) {
            // Pasar los datos del pago confirmado
            onPaymentSuccess(pagoData)
          }
        } else {
          toast.info('El pago aún está pendiente')
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
      toast.error('Error al consultar estado del pago')
    } finally {
      setCheckingStatus(false)
    }
  }

  const notifyAdminError = async (errorMessage, cuotaId) => {
    try {
      // El backend ya notifica automáticamente a los admins cuando hay errores
      // Aquí solo registramos el error en el frontend
      console.error('Error de pago que requiere atención del admin:', {
        error: errorMessage,
        cuotaId: cuotaId,
        timestamp: new Date().toISOString()
      })
      
      // Mostrar mensaje al usuario
      toast.error('Se ha notificado al administrador sobre este error. Por favor contacta con soporte si el problema persiste.')
    } catch (error) {
      console.error('Error al notificar admin:', error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calcular horas restantes para alerta de 14 horas desde la inscripción
  const calculateHoursRemaining = () => {
    // La fecha de inscripción debería venir en cuotaInfo o en el plan
    // Por ahora usamos fecha_ini de la cuota como referencia
    // En producción, debería venir la fecha de inscripción real
    if (!cuotaInfo?.fecha_inscripcion && !cuotaInfo?.fecha_ini) return null
    
    const fechaInscripcion = cuotaInfo.fecha_inscripcion 
      ? new Date(cuotaInfo.fecha_inscripcion)
      : new Date(cuotaInfo.fecha_ini)
    
    const ahora = new Date()
    const diffMs = ahora - fechaInscripcion
    const diffHours = diffMs / (1000 * 60 * 60)
    const remainingHours = 14 - diffHours
    return remainingHours > 0 ? remainingHours : 0
  }

  const horasRestantesInscripcion = calculateHoursRemaining()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pago por QR - PagoFácil"
      size="lg"
    >
      {/* Alerta de 14 horas */}
      {horasRestantesInscripcion !== null && horasRestantesInscripcion > 0 && horasRestantesInscripcion <= 14 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">
                ⚠️ Importante: Tiempo Restante
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Tienes <span className="font-bold">{Math.floor(horasRestantesInscripcion)} horas</span> restantes para realizar el pago. 
                Si no pagas dentro de este tiempo, tu inscripción será cancelada automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : !pago ? (
        // Vista inicial: Generar QR
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Generar Código QR de Pago
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Se generará un código QR único para esta cuota
                </p>
              </div>
            </div>

            {cuotaInfo && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monto a Pagar:</span>
                  <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    {formatCurrency(cuotaInfo.saldo_pendiente || cuotaInfo.monto || 0)}
                  </span>
                </div>
                {cuotaInfo.concepto && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Concepto:</span>
                    <span className="text-gray-900 dark:text-gray-100">{cuotaInfo.concepto}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-semibold mb-1">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Haz clic en "Generar QR" para crear el código de pago</li>
                  <li>Escanea el QR con tu aplicación bancaria</li>
                  <li>Confirma el pago en tu banco</li>
                  <li>El sistema verificará automáticamente tu pago</li>
                  <li>Opcionalmente, puedes subir el comprobante después</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={generarQR}
              disabled={generating}
              icon={generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            >
              {generating ? 'Generando QR...' : 'Generar QR'}
            </Button>
          </div>
        </div>
      ) : (
        // Vista con QR generado
        <div className="space-y-6">
          {/* Estado del pago */}
          <div className={`p-4 rounded-lg border-2 ${
            pago.estado_pagofacil === 'completado' && pago.verificado
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
              : pago.estado_pagofacil === 'pendiente'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
          }`}>
            <div className="flex items-center gap-3">
              {pago.estado_pagofacil === 'completado' && pago.verificado ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-bold text-green-900 dark:text-green-100">Pago Confirmado</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Tu pago ha sido verificado exitosamente
                    </p>
                  </div>
                </>
              ) : pago.estado_pagofacil === 'pendiente' ? (
                <>
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-bold text-yellow-900 dark:text-yellow-100">Pago Pendiente</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Esperando confirmación del pago...
                      {checkingStatus && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Verificando
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      ℹ️ El sistema verificará automáticamente después de 2 minutos desde la generación del QR
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={consultarEstado}
                    disabled={checkingStatus}
                    icon={checkingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  >
                    Verificar Ahora
                  </Button>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-bold text-red-900 dark:text-red-100">Error en el Pago</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Hubo un problema con el pago. Por favor contacta al administrador.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información del pago */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monto:</span>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {formatCurrency(pago.monto || 0)}
              </span>
            </div>
            {pago.nro_pago && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Número de Pago:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">{pago.nro_pago}</span>
              </div>
            )}
            {pago.qr_expires_at && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expira:</span>
                <span className="text-gray-900 dark:text-gray-100 text-sm">
                  {formatDate(pago.qr_expires_at)}
                  {timeRemaining && (
                    <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-semibold">
                      ({timeRemaining})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* QR Code */}
          {pago.qr_image && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                <img
                  src={pago.qr_image}
                  alt="Código QR de Pago"
                  className="w-64 h-64 mx-auto"
                  onError={(e) => {
                    console.error('Error loading QR image:', pago.qr_image)
                    e.target.style.display = 'none'
                    toast.error('Error al cargar la imagen del QR. Por favor intenta generar un nuevo QR.')
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
                Escanea este código QR con tu aplicación bancaria para realizar el pago
              </p>
              {(() => {
                const minutesRemaining = getMinutesRemaining()
                // Mostrar advertencia solo cuando queden 2 minutos o menos
                if (minutesRemaining !== null && minutesRemaining <= 2) {
                  return (
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                      ⚠️ El QR expirará en {minutesRemaining} minuto{minutesRemaining !== 1 ? 's' : ''}
                    </p>
                  )
                }
                return null
              })()}
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Instrucciones:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>Abre tu aplicación bancaria</li>
              <li>Selecciona la opción de pago por QR</li>
              <li>Escanea el código QR mostrado arriba</li>
              <li>Verifica el monto y confirma el pago</li>
              <li>El sistema verificará automáticamente tu pago</li>
            </ol>
          </div>

          {/* Subir comprobante (después del pago) */}
          {showComprobanteUpload && pago.estado_pagofacil === 'completado' && (
            <div className="border-t pt-4 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Pago Confirmado
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Tu pago ha sido verificado. Puedes subir el comprobante como respaldo.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subir Comprobante (Opcional)
                </label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setComprobanteFile(e.target.files[0])}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Formatos aceptados: PDF, JPG, PNG (máx. 5MB)
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowComprobanteUpload(false)
                    setComprobanteFile(null)
                  }}
                >
                  Omitir
                </Button>
                <Button
                  variant="primary"
                  onClick={handleComprobanteUpload}
                  disabled={!comprobanteFile || uploadingComprobante}
                  icon={uploadingComprobante ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                >
                  {uploadingComprobante ? 'Subiendo...' : 'Subir Comprobante'}
                </Button>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {pago.estado_pagofacil === 'pendiente' && (
              <Button
                variant="primary"
                onClick={consultarEstado}
                disabled={checkingStatus}
                icon={checkingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              >
                {checkingStatus ? 'Verificando...' : 'Verificar Pago'}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

export default QRModal
