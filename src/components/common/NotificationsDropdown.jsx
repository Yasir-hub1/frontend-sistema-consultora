import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, X, Clock, AlertCircle, Calendar, User } from 'lucide-react'
import { notificacionService } from '../../services/notificacionService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
// Función auxiliar para formatear fechas relativas
const formatRelativeTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  return 'ahora'
}

const NotificationsDropdown = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotificaciones()
    
    // Actualizar cada 30 segundos solo si no hay errores de red
    const interval = setInterval(() => {
      if (!hasNetworkError) {
        fetchNotificaciones()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [hasNetworkError])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotificaciones = async () => {
    try {
      setLoading(true)
      const result = await notificacionService.getNotificaciones({ per_page: 5 })
      if (result.success) {
        setNotificaciones(result.data?.data || [])
        setNoLeidas(result.noLeidas || 0)
        setHasNetworkError(false) // Resetear el flag si la petición fue exitosa
      } else {
        // Si hay un error pero no es de red, no marcar como error de red
        const isNetworkError = result.message?.includes('conexión') || result.message?.includes('CORS')
        setHasNetworkError(isNetworkError)
      }
    } catch (error) {
      // Manejar errores silenciosamente para notificaciones
      const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))
      const isCORSError = error.message?.includes('CORS') || error.message?.includes('blocked')
      
      if (isNetworkError || isCORSError) {
        setHasNetworkError(true)
      }
      // No loguear errores de red/CORS para evitar spam en consola
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarLeida = async (id, e) => {
    e.stopPropagation()
    const result = await notificacionService.marcarLeida(id)
    if (result.success) {
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true, leida_at: new Date().toISOString() } : n)
      )
      setNoLeidas(prev => Math.max(0, prev - 1))
    }
  }

  const handleMarcarTodasLeidas = async () => {
    setLoading(true)
    const result = await notificacionService.marcarTodasLeidas()
    if (result.success) {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      setNoLeidas(0)
      toast.success('Todas las notificaciones marcadas como leídas')
    }
    setLoading(false)
  }

  const handleEliminar = async (id, e) => {
    e.stopPropagation()
    const result = await notificacionService.eliminarNotificacion(id)
    if (result.success) {
      setNotificaciones(prev => prev.filter(n => n.id !== id))
      toast.success('Notificación eliminada')
    }
  }

  const handleClickNotificacion = (notificacion) => {
    if (!notificacion.leida) {
      handleMarcarLeida(notificacion.id, { stopPropagation: () => {} })
    }
    
    if (notificacion.accion_url) {
      navigate(notificacion.accion_url)
      setIsOpen(false)
    }
  }

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'horario_cambio':
        return <Calendar className="h-4 w-4" />
      case 'asistencia':
        return <Check className="h-4 w-4" />
      case 'alerta':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getColorTipo = (tipo) => {
    switch (tipo) {
      case 'horario_cambio':
        return 'text-primary-500 bg-primary-100 dark:bg-primary-900/30'
      case 'asistencia':
        return 'text-success-500 bg-success-100 dark:bg-success-900/30'
      case 'alerta':
        return 'text-warning-500 bg-warning-100 dark:bg-warning-900/30'
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
      >
        <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-error-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse shadow-glow">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 glass-card border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-glow-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-500/10 to-accent-500/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold gradient-text">Notificaciones</h3>
                {noLeidas > 0 && (
                  <button
                    onClick={handleMarcarTodasLeidas}
                    disabled={loading}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    {loading ? 'Marcando...' : 'Marcar todas leídas'}
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      onClick={() => handleClickNotificacion(notificacion)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                        !notificacion.leida ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getColorTipo(notificacion.tipo)}`}>
                          {getIconoTipo(notificacion.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${!notificacion.leida ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                {notificacion.titulo}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {notificacion.mensaje}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatRelativeTime(notificacion.created_at || notificacion.fecha_envio)}
                                </div>
                                {(notificacion.fecha_formateada || notificacion.created_at) && (
                                  <span className="text-xs">
                                    {notificacion.fecha_formateada || 
                                     (notificacion.created_at ? new Date(notificacion.created_at).toLocaleString('es-ES', {
                                       day: '2-digit',
                                       month: '2-digit',
                                       year: 'numeric',
                                       hour: '2-digit',
                                       minute: '2-digit'
                                     }) : '')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notificacion.leida && (
                                <button
                                  onClick={(e) => handleMarcarLeida(notificacion.id, e)}
                                  className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleEliminar(notificacion.id, e)}
                                className="p-1 rounded-lg hover:bg-error-100 dark:hover:bg-error-900/30 transition-colors"
                                title="Eliminar"
                              >
                                <X className="h-4 w-4 text-error-600 dark:text-error-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {!notificacion.leida && (
                          <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notificaciones.length > 0 && (
              <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
                <button
                  onClick={() => {
                    navigate('/notificaciones')
                    setIsOpen(false)
                  }}
                  className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationsDropdown

