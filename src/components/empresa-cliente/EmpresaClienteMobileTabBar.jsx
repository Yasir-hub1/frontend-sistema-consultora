import { NavLink } from 'react-router-dom'
import { Building2, FileSpreadsheet, Home, Users } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { to: '/empresa-cliente/dashboard', label: 'Inicio', end: true, icon: Home },
  { to: '/empresa-cliente/personal', label: 'Personal', end: false, icon: Users },
  {
    to: '/empresa-cliente/declaraciones-mensuales',
    label: 'Mensual',
    end: false,
    icon: FileSpreadsheet,
  },
  { to: '/empresa-cliente/mi-consultora', label: 'Consultora', end: false, icon: Building2 },
]

/**
 * Bottom navigation for empresa-cliente on viewports &lt; lg.
 * Parent layout hides the drawer menu on mobile for this role.
 */
export default function EmpresaClienteMobileTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/90 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Secciones del portal"
    >
      <div className="mx-auto flex min-h-16 max-w-lg items-stretch justify-between gap-0 px-0.5">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg px-0.5 py-1.5 transition-colors active:bg-gray-100 dark:active:bg-gray-800/80"
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-transform duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <Icon className={clsx('h-5 w-5 shrink-0', isActive && 'scale-105')} aria-hidden />
                </span>
                <span
                  className={clsx(
                    'max-w-full truncate text-center text-[10px] font-semibold leading-tight sm:text-xs',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
