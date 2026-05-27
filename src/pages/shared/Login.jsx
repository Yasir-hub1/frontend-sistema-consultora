import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardPathForRole } from '../../utils/roleUtils'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'
import {
  Mail,
  Lock,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'

const Login = () => {
  const { login, isAuthenticated, loading, user } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-50 via-white to-primary-50/40 px-4 py-10 selection:bg-primary-200 selection:text-primary-950 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 sm:px-6">
      <div className="relative z-[1] w-full max-w-6xl motion-safe:animate-fade-in-up motion-reduce:animate-none">
        <div className="grid grid-cols-1 overflow-hidden rounded-xl bg-white shadow-soft-lg ring-1 ring-neutral-200/80 dark:bg-secondary-900 dark:ring-white/10 lg:grid-cols-12 lg:rounded-xl">
          {/* Panel hero — desktop */}
          <div className="relative hidden min-h-[560px] overflow-hidden lg:col-span-7 lg:block lg:min-h-[640px]">
            <img
              src={HERO_IMAGE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-tr from-primary-900/85 via-primary-800/50 to-primary-600/20"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-transparent to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-12">
              <div
                className="mb-6 h-px w-16 bg-white/35 motion-safe:animate-fade-in motion-reduce:animate-none"
                aria-hidden
              />
              <div className="mb-5 flex items-center gap-3 motion-safe:animate-slide-in motion-reduce:animate-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 shadow-lg backdrop-blur-md ring-1 ring-white/20">
                  <Layers className="h-7 w-7 text-white" strokeWidth={1.75} />
                </div>
                <span className="font-semibold uppercase tracking-[0.2em] text-white/90 text-[0.625rem]">
                  HUMBERTO MORENO PEREZ
                </span>
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white xl:text-5xl motion-safe:animate-fade-in motion-reduce:animate-none">
                HUMBERTO MORENO PEREZ
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/85 motion-safe:animate-fade-in motion-reduce:animate-none motion-safe:[animation-delay:80ms]">
                Acceso unificado para administrador, consultora, colaborador y empresa
                cliente — AFP, caja y ministerio con trazabilidad clara.
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="flex flex-col justify-center bg-white px-6 py-10 dark:bg-secondary-900 sm:px-10 md:px-14 lg:col-span-5 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/25">
                  <Layers className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-600 dark:text-primary-400">
                    HUMBERTO MORENO PEREZ
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Portal de acceso
                  </p>
                </div>
              </div>

              <div className="mb-8 space-y-2">
                <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400">
                  Acceso seguro
                </span>
                <h2 className="font-display text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
                  Bienvenido de nuevo
                </h2>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Ingresa con tu correo o usuario y contraseña para continuar.
                </p>
              </div>

              {errors.root && (
                <Alert type="error" title="No se pudo iniciar sesión" className="mb-6">
                  {errors.root.message}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="motion-safe:animate-fade-in motion-reduce:animate-none motion-safe:[animation-delay:40ms] motion-reduce:[animation-delay:0ms]">
                  <Input
                    label="Correo o usuario"
                    placeholder="correo@empresa.bo"
                    autoComplete="username"
                    leftIcon={<Mail className="h-4 w-4" />}
                    {...register('email', { required: 'Ingresa correo o usuario' })}
                    error={errors.email?.message}
                    containerClassName="space-y-1.5"
                    labelClassName="text-[0.6875rem] font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 pl-0.5"
                    className="h-auto border-0 bg-neutral-100 py-3.5 pl-10 text-secondary-900 shadow-none backdrop-blur-none hover:bg-neutral-100/90 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary-500/25 dark:bg-secondary-800 dark:text-white dark:hover:bg-secondary-800/90 dark:focus-visible:bg-secondary-800"
                  />
                </div>

                <div className="space-y-1.5 motion-safe:animate-fade-in motion-reduce:animate-none motion-safe:[animation-delay:90ms] motion-reduce:[animation-delay:0ms]">
                  <div className="flex items-center justify-between px-0.5">
                    <label
                      htmlFor="login-password"
                      className="text-[0.6875rem] font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400"
                    >
                      Contraseña
                    </label>
                  </div>
                  <div className="relative group">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-secondary-400 transition-colors duration-200 group-focus-within:text-primary-500 dark:text-secondary-500"
                      aria-hidden
                    >
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="input h-auto w-full rounded-xl border-0 bg-neutral-100 py-3.5 pl-10 pr-11 text-secondary-900 shadow-none backdrop-blur-none transition-colors duration-200 placeholder:text-secondary-400 hover:bg-neutral-100/90 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary-500/25 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500 dark:hover:bg-secondary-800/90 dark:focus-visible:bg-secondary-800"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      {...register('password', { required: 'Obligatorio' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 z-[1] -translate-y-1/2 rounded-lg p-1.5 text-secondary-400 transition-colors hover:bg-neutral-200/80 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-secondary-700 dark:hover:text-white"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password?.message && (
                    <p className="flex items-center gap-1 text-sm text-error-600 dark:text-error-400">
                      <span className="inline-block h-1 w-1 rounded-full bg-error-500" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 motion-safe:animate-fade-in motion-reduce:animate-none motion-safe:[animation-delay:140ms] motion-reduce:[animation-delay:0ms]">
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isSubmitting || loading}
                    loading={isSubmitting}
                    icon={<ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
                    iconPosition="right"
                    className="rounded-xl py-3.5 font-bold tracking-wide shadow-lg shadow-primary-500/15 transition-transform active:scale-[0.98] motion-safe:hover:brightness-[1.03]"
                  >
                    Iniciar sesión
                  </Button>
                </div>
              </form>

              <p className="mt-8 text-center text-xs leading-relaxed text-secondary-500 dark:text-secondary-400">
                Al iniciar sesión confirmas el uso conforme a las políticas del sistema.{' '}
                {/* <Link
                  to="/activar-cuenta"
                  className="font-medium text-primary-600 underline-offset-2 hover:underline dark:text-primary-400"
                >
                  Activar con token
                </Link> */}
                {' · '}
                {/* <Link
                  to="/flujo-operativo"
                  className="font-medium text-primary-600 underline-offset-2 hover:underline dark:text-primary-400"
                >
                  Flujo operativo
                </Link> */}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none fixed bottom-5 left-5 z-0 hidden opacity-50 sm:flex sm:items-center sm:gap-2 lg:left-auto lg:right-6"
        aria-hidden
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
        </span>
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-secondary-400 dark:text-secondary-500">
          Servicio en línea
        </span>
      </div>
    </div>
  )
}

export default Login
