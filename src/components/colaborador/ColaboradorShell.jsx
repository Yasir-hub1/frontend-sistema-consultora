import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { useAuth } from '../../contexts/AuthContext'
import { normalizeRole, ROLES } from '../../utils/roleUtils'
import LoadingSpinner from '../common/LoadingSpinner'

/** Fondo suave + capa de contenido para páginas colaborador. */
export default function ColaboradorShell({ children, className }) {
  const { user, refreshUser } = useAuth()
  const [permisosListos, setPermisosListos] = useState(() => normalizeRole(user?.rol) !== ROLES.COLABORADOR)

  useEffect(() => {
    if (normalizeRole(user?.rol) !== ROLES.COLABORADOR) {
      setPermisosListos(true)
      return
    }
    let cancelled = false
    ;(async () => {
      await refreshUser()
      if (!cancelled) setPermisosListos(true)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshUser, user?.rol])

  if (!permisosListos) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={clsx('relative isolate', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 mx-auto h-[min(18rem,36vh)] max-w-6xl overflow-hidden"
      >
        <div className="absolute -left-28 top-0 h-[16rem] w-[16rem] rounded-full bg-gradient-to-br from-violet-400/18 via-primary-400/14 to-transparent blur-3xl dark:from-violet-600/14 dark:via-primary-600/12" />
        <div className="absolute -right-24 top-6 h-[14rem] w-[14rem] rounded-full bg-gradient-to-bl from-primary-400/14 to-fuchsia-400/10 blur-3xl dark:from-primary-700/12 dark:to-fuchsia-900/10" />
        <div className="absolute left-1/2 top-[3.5rem] h-px w-[min(90%,32rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/28 to-transparent dark:via-violet-500/18" />
      </div>
      {children}
    </div>
  )
}

export function staggerDelayMs(index, step = 70, max = 420) {
  return Math.min(index * step, max)
}
