import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/authService'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'

/**
 * Fase 1 — activación por token (correo). POST /auth/activar
 */
export default function ActivarCuenta() {
  const [searchParams] = useSearchParams()
  const tokenParam = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      token: tokenParam,
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = async (data) => {
    const res = await authService.activarCuenta({
      token: data.token,
      password: data.password,
      password_confirmation: data.password_confirmation,
    })
    if (res.success) {
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } else {
      setError('root', { message: res.message || 'No se pudo activar la cuenta' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activar cuenta</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Establece tu contraseña para completar la activación de la consultora (enlace del correo).
        </p>

        {done && (
          <Alert type="success" className="mt-4" title="Cuenta activada">
            Redirigiendo al inicio de sesión…
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {errors.root && (
            <Alert type="error" title="Error">
              {errors.root.message}
            </Alert>
          )}
          <Input
            label="Token"
            {...register('token', { required: 'Pega el token del enlace' })}
            error={errors.token?.message}
          />
          <Input
            label="Nueva contraseña"
            type="password"
            {...register('password', { required: 'Obligatorio', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            error={errors.password?.message}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            {...register('password_confirmation', { required: 'Confirma la contraseña' })}
            error={errors.password_confirmation?.message}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || done}>
            {isSubmitting ? 'Guardando…' : 'Activar y continuar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-primary-600 hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}
