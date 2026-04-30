import { NavLink } from 'react-router-dom'
import { Bell, Briefcase, FileStack, Home, Settings, Users } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { to: '/consultora/dashboard', label: 'Inicio', short: 'Inicio', end: true, icon: Home },
  { to: '/consultora/configuracion', label: 'Configuración', short: 'Config', end: false, icon: Settings },
  { to: '/consultora/catalogo-documentos', label: 'Catálogo', short: 'Catálogo', end: false, icon: FileStack },
  { to: '/consultora/mi-equipo', label: 'Mi equipo', short: 'Equipo', end: false, icon: Users },
  { to: '/consultora/mis-empresas', label: 'Mis empresas', short: 'Empresas', end: false, icon: Briefcase },
  { to: '/consultora/alertas', label: 'Alertas', short: 'Alertas', end: false, icon: Bell },
]

/**
 * Navegación inferior en &lt; lg para rol consultora (sustituye el menú hamburguesa).
 */
export default function ConsultoraMobileTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/90 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Secciones de consultora"
    >
      <div className="flex min-h-16 items-stretch gap-1 overflow-x-auto overscroll-x-contain scroll-smooth px-2 py-1.5 [scrollbar-width:thin]">
        {TABS.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex min-w-[4.5rem] max-w-[5.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors active:bg-gray-100 dark:active:bg-gray-800/80"
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <Icon className={clsx('h-[1.15rem] w-[1.15rem] shrink-0', isActive && 'scale-105')} aria-hidden />
                </span>
                <span
                  className={clsx(
                    'w-full truncate text-center text-[9px] font-semibold leading-tight sm:text-[10px]',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                  title={label}
                >
                  {short}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
