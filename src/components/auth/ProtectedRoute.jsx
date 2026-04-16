import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { normalizeRole, hasAnyRole, dashboardPathForRole } from '../../utils/roleUtils'
import LoadingSpinner from '../common/LoadingSpinner'

function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()
  const [isInitialCheck, setIsInitialCheck] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user && !isAuthenticated) {
      setIsInitialCheck(true)
    } else {
      setIsInitialCheck(false)
    }
  }, [user, isAuthenticated])

  if (loading || (isInitialCheck && localStorage.getItem('token') && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const debeCambiar =
    Boolean(user?.debe_cambiar_contrasena) || Boolean(user?.debe_cambiar_password)

  if (
    debeCambiar &&
    location.pathname !== '/cambiar-contrasena-inicial'
  ) {
    return <Navigate to="/cambiar-contrasena-inicial" replace />
  }

  if (
    !debeCambiar &&
    location.pathname === '/cambiar-contrasena-inicial'
  ) {
    return <Navigate to={dashboardPathForRole(user)} replace />
  }

  if (requiredRoles.length > 0) {
    const userRole = normalizeRole(user?.rol)
    const hasRequiredRole = hasAnyRole(userRole, requiredRoles)

    if (!hasRequiredRole) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Acceso denegado</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Tu usuario no tiene permiso para esta sección.
            </p>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn btn-primary mt-6"
            >
              Volver
            </button>
          </div>
        </div>
      )
    }
  }

  return children
}

export default ProtectedRoute
