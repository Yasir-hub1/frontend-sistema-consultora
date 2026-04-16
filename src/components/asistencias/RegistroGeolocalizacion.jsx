import React, { useState, useEffect } from 'react'
import { MapPin, Check, X, AlertCircle, Edit } from 'lucide-react'
import { asistenciaService } from '../../services/asistenciaService'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Input from '../common/Input'
import toast from 'react-hot-toast'

const RegistroGeolocalizacion = ({ isOpen, onClose, horario, docente, docenteId, fecha, onSuccess }) => {
  const [ubicacion, setUbicacion] = useState(null)
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false)
  const [registrando, setRegistrando] = useState(false)
  const [error, setError] = useState(null)
  const [distancia, setDistancia] = useState(null)
  const [observaciones, setObservaciones] = useState('')
  const [modoManual, setModoManual] = useState(false)
  const [coordenadasManuales, setCoordenadasManuales] = useState({
    latitud: '',
    longitud: ''
  })

  useEffect(() => {
    if (isOpen && horario) {
      obtenerUbicacion()
    }
  }, [isOpen, horario])

  const obtenerUbicacion = () => {
    setCargandoUbicacion(true)
    setError(null)
    setModoManual(false)

    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en tu dispositivo. Por favor, ingresa las coordenadas manualmente.')
      setCargandoUbicacion(false)
      setModoManual(true)
      return
    }

    // Verificar si estamos en un contexto seguro (HTTPS o localhost)
    const isSecureContext = window.isSecureContext || 
      location.protocol === 'https:' || 
      location.hostname === 'localhost' || 
      location.hostname === '127.0.0.1'

    if (!isSecureContext) {
      setError('La geolocalización solo funciona en conexiones HTTPS o en localhost. Por favor, ingresa las coordenadas manualmente o accede desde localhost.')
      setCargandoUbicacion(false)
      setModoManual(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubic = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precision: position.coords.accuracy
        }
        setUbicacion(ubic)
        setCargandoUbicacion(false)
        setModoManual(false)
      },
      (err) => {
        let errorMessage = 'Error al obtener ubicación'
        
        // Mensajes de error más específicos
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permiso de geolocalización denegado. Por favor, ingresa las coordenadas manualmente.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible. Por favor, ingresa las coordenadas manualmente.'
            break
          case err.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado. Por favor, intenta nuevamente o ingresa las coordenadas manualmente.'
            break
          default:
            if (err.message && err.message.includes('secure')) {
              errorMessage = 'La geolocalización requiere HTTPS o localhost. Por favor, ingresa las coordenadas manualmente.'
            } else {
              errorMessage = `Error: ${err.message}. Por favor, ingresa las coordenadas manualmente.`
            }
        }
        
        setError(errorMessage)
        setCargandoUbicacion(false)
        setModoManual(true)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleRegistrar = async () => {
    // Verificar que tenemos los datos necesarios
    const docenteIdFinal = docente?.id || docenteId || horario?.docente_id
    
    if (!horario || !docenteIdFinal) {
      toast.error('Faltan datos para registrar la asistencia. Por favor, selecciona un horario.')
      return
    }

    // Obtener coordenadas (automáticas o manuales)
    let latitud, longitud
    
    if (modoManual && coordenadasManuales.latitud && coordenadasManuales.longitud) {
      latitud = parseFloat(coordenadasManuales.latitud)
      longitud = parseFloat(coordenadasManuales.longitud)
      
      if (isNaN(latitud) || isNaN(longitud)) {
        toast.error('Las coordenadas deben ser números válidos')
        return
      }
      
      if (latitud < -90 || latitud > 90) {
        toast.error('La latitud debe estar entre -90 y 90')
        return
      }
      
      if (longitud < -180 || longitud > 180) {
        toast.error('La longitud debe estar entre -180 y 180')
        return
      }
    } else if (ubicacion) {
      latitud = ubicacion.latitud
      longitud = ubicacion.longitud
    } else {
      toast.error('Debes proporcionar las coordenadas (automáticas o manuales)')
      return
    }

    setRegistrando(true)
    try {
      const data = {
        horario_id: horario.id,
        docente_id: docenteIdFinal,
        fecha: fecha || new Date().toISOString().split('T')[0],
        latitud: latitud,
        longitud: longitud,
        observaciones: observaciones + (modoManual ? ' (Coordenadas ingresadas manualmente)' : '')
      }

      const result = await asistenciaService.registrarConGeolocalizacion(data)

      if (result.success) {
        toast.success('Asistencia registrada exitosamente con geolocalización')
        if (onSuccess) onSuccess(result.data)
        onClose()
        resetForm()
      } else {
        toast.error(result.message || 'Error al registrar asistencia')
      }
    } catch (error) {
      toast.error('Error al registrar asistencia con geolocalización')
    } finally {
      setRegistrando(false)
    }
  }

  const resetForm = () => {
    setUbicacion(null)
    setError(null)
    setDistancia(null)
    setObservaciones('')
    setModoManual(false)
    setCoordenadasManuales({ latitud: '', longitud: '' })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Asistencia con Geolocalización"
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error-900 dark:text-error-100">Error de geolocalización</p>
              <p className="text-sm text-error-700 dark:text-error-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {horario && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Información del Horario</p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Materia:</span> {horario.grupo?.materia?.nombre || 'N/A'}</p>
              <p><span className="font-medium">Grupo:</span> {horario.grupo?.numero_grupo || 'N/A'}</p>
              <p><span className="font-medium">Aula:</span> {horario.aula?.nombre || 'N/A'}</p>
              <p><span className="font-medium">Hora:</span> {horario.hora_inicio} - {horario.hora_fin}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ubicación Actual
            </label>
            {cargandoUbicacion ? (
              <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Obteniendo ubicación...</span>
              </div>
            ) : ubicacion ? (
              <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-success-900 dark:text-success-100">
                      Ubicación obtenida
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-success-700 dark:text-success-300">
                      <p>Latitud: {ubicacion.latitud.toFixed(6)}</p>
                      <p>Longitud: {ubicacion.longitud.toFixed(6)}</p>
                      <p>Precisión: ±{ubicacion.precision.toFixed(0)} metros</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  No se pudo obtener la ubicación. Por favor, intenta nuevamente.
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={obtenerUbicacion}
              variant="outline"
              size="sm"
              icon={<MapPin className="h-4 w-4" />}
              disabled={cargandoUbicacion}
            >
              Intentar Obtener Ubicación
            </Button>
            <Button
              onClick={() => {
                setModoManual(true)
                setError(null)
              }}
              variant="outline"
              size="sm"
              icon={<Edit className="h-4 w-4" />}
            >
              Ingresar Manualmente
            </Button>
          </div>

          {modoManual && (
            <div className="p-4 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-xl space-y-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-info-600 dark:text-info-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-info-900 dark:text-info-100 mb-2">
                    Ingreso Manual de Coordenadas
                  </p>
                  <p className="text-xs text-info-700 dark:text-info-300 mb-4">
                    Ingresa las coordenadas GPS del aula. Puedes obtenerlas usando una aplicación de mapas o GPS.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitud"
                  type="number"
                  step="any"
                  value={coordenadasManuales.latitud}
                  onChange={(e) => setCoordenadasManuales(prev => ({ ...prev, latitud: e.target.value }))}
                  placeholder="Ej: -17.8321"
                  error={coordenadasManuales.latitud && (parseFloat(coordenadasManuales.latitud) < -90 || parseFloat(coordenadasManuales.latitud) > 90) ? 'La latitud debe estar entre -90 y 90' : ''}
                />
                <Input
                  label="Longitud"
                  type="number"
                  step="any"
                  value={coordenadasManuales.longitud}
                  onChange={(e) => setCoordenadasManuales(prev => ({ ...prev, longitud: e.target.value }))}
                  placeholder="Ej: -63.1528"
                  error={coordenadasManuales.longitud && (parseFloat(coordenadasManuales.longitud) < -180 || parseFloat(coordenadasManuales.longitud) > 180) ? 'La longitud debe estar entre -180 y 180' : ''}
                />
              </div>
              
              {horario?.aula && horario.aula.latitud && horario.aula.longitud && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coordenadas del Aula (referencia):
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Lat: {horario.aula.latitud}, Lon: {horario.aula.longitud}
                  </p>
                  <Button
                    onClick={() => {
                      setCoordenadasManuales({
                        latitud: horario.aula.latitud.toString(),
                        longitud: horario.aula.longitud.toString()
                      })
                    }}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                  >
                    Usar coordenadas del aula
                  </Button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              placeholder="Ingresa cualquier observación relevante..."
            />
          </div>

          {distancia && (
            <div className="p-3 bg-info-50 dark:bg-info-900/20 rounded-lg">
              <p className="text-sm text-info-700 dark:text-info-300">
                Distancia al aula: {distancia.toFixed(2)} metros
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={registrando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleRegistrar}
            disabled={(!ubicacion && !modoManual) || (modoManual && (!coordenadasManuales.latitud || !coordenadasManuales.longitud)) || registrando}
            loading={registrando}
            icon={<Check className="h-4 w-4" />}
          >
            Registrar Asistencia
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default RegistroGeolocalizacion

