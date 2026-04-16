import React, { useState, useEffect, useRef } from 'react'
import { QrCode, Camera, X, Check } from 'lucide-react'
import { asistenciaService } from '../../services/asistenciaService'
import Button from '../common/Button'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const [codigoIngresado, setCodigoIngresado] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    return () => {
      // Limpiar stream al desmontar
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const iniciarEscaneo = async () => {
    try {
      setError(null)
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Tu navegador no soporta el acceso a la cámara. Puedes ingresar el código manualmente.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Cámara trasera preferida
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setScanning(true)
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      setError('No se pudo acceder a la cámara. Puedes ingresar el código manualmente.')
    }
  }

  const detenerEscaneo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setScanning(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleManualInput = () => {
    if (!codigoIngresado.trim()) {
      toast.error('Ingresa el código QR')
      return
    }

    handleEscanearQR(codigoIngresado.trim())
  }

  const handleEscanearQR = async (codigoQR) => {
    try {
      // Registrar asistencia con QR
      const result = await asistenciaService.registrarConQR(codigoQR, {
        observaciones: 'Registrado mediante escáner QR'
      })

      if (result.success) {
        toast.success('Asistencia registrada exitosamente mediante QR')
        if (onScan) {
          onScan(codigoQR)
        }
        detenerEscaneo()
      } else {
        toast.error(result.message || 'Error al registrar asistencia')
      }
    } catch (error) {
      toast.error('Error al procesar el código QR')
      console.error('Error al escanear QR:', error)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
          <p className="text-sm text-warning-700 dark:text-warning-300">{error}</p>
        </div>
      )}

      {!scanning ? (
        <div className="space-y-4">
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Inicia el escáner para leer el código QR
            </p>
            <Button
              onClick={iniciarEscaneo}
              variant="primary"
              icon={<Camera className="h-5 w-5" />}
            >
              Iniciar Escáner
            </Button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
              O ingresa el código manualmente
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                placeholder="Pega el código QR aquí..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualInput()
                  }
                }}
              />
              <Button
                onClick={handleManualInput}
                variant="primary"
                icon={<Check className="h-5 w-5" />}
                disabled={!codigoIngresado.trim()}
              >
                Registrar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-4 border-primary-500 rounded-lg" style={{ width: '70%', height: '70%' }}>
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary-500"></div>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-info-50 dark:bg-info-900/20 rounded-lg">
            <p className="text-xs text-info-700 dark:text-info-300 text-center">
              Apunta la cámara hacia el código QR. El escaneo es automático.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={detenerEscaneo}
              variant="outline"
              fullWidth
              icon={<X className="h-5 w-5" />}
            >
              Detener Escáner
            </Button>
            <div className="flex-1">
              <input
                type="text"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                placeholder="O ingresa código manualmente..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualInput()
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRScanner

