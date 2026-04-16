import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { hasAnyRole, normalizeRole, ROLES } from '../../utils/roleUtils'

/**
 * Componente para proteger rutas basadas en roles
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.allowedRoles - Roles permitidos para acceder a la ruta
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {React.ReactNode} Componente protegido o redirección
 */
const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  // Si no está autenticado, redirigir al login según la ruta
  if (!isAuthenticated) {
    let loginPath = '/login'
    
    if (location.pathname.startsWith('/estudiante')) {
      loginPath = '/estudiante/login'
    } else if (location.pathname.startsWith('/docente')) {
      loginPath = '/docente/login'
    } else if (allowedRoles.length > 0) {
      const normalizedRole = normalizeRole(allowedRoles[0])
      if (normalizedRole === ROLES.ESTUDIANTE) {
        loginPath = '/estudiante/login'
      } else if (normalizedRole === ROLES.DOCENTE) {
        loginPath = '/docente/login'
      }
    }
    
    return <Navigate to={loginPath} replace />
  }

  // Si no hay roles especificados, permitir acceso
  if (!allowedRoles || allowedRoles.length === 0) {
    return children
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasPermission = hasAnyRole(user?.rol, allowedRoles)

  if (!hasPermission) {
    // Redirigir al dashboard según el rol del usuario
    const userRole = normalizeRole(user?.rol)
    let dashboardPath = '/dashboard'
    
    if (userRole === ROLES.ESTUDIANTE) {
      dashboardPath = '/estudiante/dashboard'
    } else if (userRole === ROLES.DOCENTE) {
      dashboardPath = '/docente/dashboard'
    } else if (userRole === ROLES.ADMIN) {
      dashboardPath = '/admin/dashboard'
    }
    
    return <Navigate to={dashboardPath} replace />
  }

  return children
}

export default RoleBasedRoute
