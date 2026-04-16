import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'
import { dashboardPathForRole } from '../../utils/roleUtils'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'
import { Lock, KeyRound } from 'lucide-react'

export default function CambiarContrasenaInicial() {
  const navigate = useNavigate()
  const { user, setAuthData } = useAuth()
  const [rootError, setRootError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    setRootError(null)
    const res = await authService.cambiarContrasenaInicial({
      password: data.password,
      password_confirmation: data.password_confirmation,
    })
    if (!res.success) {
      setRootError(res.message || 'No se pudo actualizar la contraseña')
      return
    }
    const token = localStorage.getItem('token')
    const nextUser = res.data?.user
    if (nextUser && token) {
      setAuthData(nextUser, token)
    }
    navigate(dashboardPathForRole(nextUser || user), { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 shadow-xl dark:bg-gray-900/95">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nueva contraseña</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Por seguridad, define tu contraseña definitiva antes de continuar.
            </p>
          </div>
        </div>

        {rootError && (
          <Alert type="error" title="Error" className="mb-4">
            {rootError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nueva contraseña"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('password', { required: 'Obligatorio', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            error={errors.password?.message}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('password_confirmation', { required: 'Confirma la contraseña' })}
            error={errors.password_confirmation?.message}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar y continuar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
