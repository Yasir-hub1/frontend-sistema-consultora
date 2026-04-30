import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/common/Card'
import { getRoleLabel, normalizeRole } from '../../utils/roleUtils'

const Perfil = () => {
  const { user } = useAuth()
  const r = normalizeRole(user?.rol)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi perfil</h1>
      <Card title="Datos de sesión" subtitle="Información asociada a tu usuario en Consult-360">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Rol</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{getRoleLabel(r)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Usuario / correo</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">
              {user?.nombre_usuario || user?.correo || user?.email || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Estado</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{user?.estado || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Verificado</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">
              {user?.verificado ? 'Sí' : 'No'}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          La edición de perfil y cambio de contraseña se conectarán cuando el backend exponga los
          endpoints correspondientes.
        </p>
      </Card>
    </div>
  )
}

export default Perfil
