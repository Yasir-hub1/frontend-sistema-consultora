import React, { useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardPathForRole } from '../../utils/roleUtils'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'
import { Mail, Lock, Layers } from 'lucide-react'

const Login = () => {
  const { login, isAuthenticated, loading, user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm()

  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      navigate(dashboardPathForRole(user), { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  if (isAuthenticated && user) {
    return <Navigate to={dashboardPathForRole(user)} replace />
  }

  const onSubmit = async (data) => {
    const result = await login({
      email: data.email,
      correo: data.email,
      nombre_usuario: data.nombre_usuario,
      password: data.password,
    })

    if (!result.success) {
      setError('root', {
        type: 'manual',
        message: result.error || 'Credenciales incorrectas',
      })
      return
    }

    if (result.user?.debe_cambiar_contrasena || result.user?.debe_cambiar_password) {
      navigate('/cambiar-contrasena-inicial', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 shadow-xl dark:bg-gray-900/95">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-600">
            <Layers className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">LaboraConsult</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Acceso administrador, consultora, colaborador o empresa cliente
            </p>
          </div>
        </div>

        {errors.root && (
          <Alert type="error" title="No se pudo iniciar sesión" className="mb-4">
            {errors.root.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Correo o usuario"
              placeholder="correo@empresa.bo"
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email', { required: 'Ingresa correo o usuario' })}
              error={errors.email?.message}
            />
          </div>

          <Input
            label="Contraseña"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('password', { required: 'Obligatorio' })}
            error={errors.password?.message}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
            {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/activar-cuenta" className="text-primary-600 hover:underline">
            Activar con token (cuentas antiguas)
          </Link>
          {' · '}
          <Link to="/flujo-operativo" className="text-primary-600 hover:underline">
            Ver flujo operativo
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
