import { useAuth } from '../contexts/AuthContext'
import { normalizeRole, ROLES } from '../utils/roleUtils'

export function useTramiteContext() {
  const { user } = useAuth()
  const rol = normalizeRole(user?.rol)

  const basePath =
    rol === ROLES.COLABORADOR
      ? '/colaborador/tramites'
      : rol === ROLES.EMPRESA_CLIENTE
        ? '/empresa-cliente/tramites'
        : '/consultora/tramites'

  const readonly = rol === ROLES.EMPRESA_CLIENTE
  const canCreate = !readonly

  return { user, rol, basePath, readonly, canCreate }
}
