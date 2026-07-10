import React, { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Home,
  Building2,
  Users,
  Briefcase,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Settings,
  FileStack,
  FileSpreadsheet,
  FileText,
  Files,
  ClipboardList,
  Check,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { normalizeRole, ROLES, getRoleLabel } from '../../utils/roleUtils'
import { resolveAlertaPath } from '../../utils/alertaNavigation'
import { consultoraService } from '../../services/consultoraService'
import { colaboradorService } from '../../services/colaboradorService'
import { empresaClienteService } from '../../services/empresaClienteService'
import { notificacionService } from '../../services/notificacionService'
import EmpresaClienteMobileTabBar from '../empresa-cliente/EmpresaClienteMobileTabBar'
import ConsultoraMobileTabBar from '../consultora/ConsultoraMobileTabBar'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifRows, setNotifRows] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifRefresh, setNotifRefresh] = useState(0)
  const location = useLocation()

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'))
  }, [])
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const role = normalizeRole(user?.rol)

  useEffect(() => {
    setNotifOpen(false)
  }, [location.pathname])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (
        role !== ROLES.CONSULTORA &&
        role !== ROLES.COLABORADOR &&
        role !== ROLES.EMPRESA_CLIENTE
      ) {
        setNotifRows([])
        return
      }
      setNotifLoading(true)
      const res =
        role === ROLES.CONSULTORA
          ? await consultoraService.listAlertas({ resuelta: false, leida: false, per_page: 10 })
          : role === ROLES.COLABORADOR
            ? await colaboradorService.listAlertas({ resuelta: false, leida: false, per_page: 10 })
            : await empresaClienteService.listAlertas({ resuelta: false, leida: false, per_page: 10 })
      if (cancelled) return
      if (res.success) {
        const d = res.data?.data ?? res.data?.items ?? res.data ?? []
        setNotifRows(Array.isArray(d) ? d : [])
      } else {
        setNotifRows([])
      }
      setNotifLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [role, location.pathname, notifRefresh])

  const marcarNotifLeida = async (id) => {
    const r = await notificacionService.marcarAlertaLeida(id, user?.rol ?? user?.tipo)
    if (r.success) {
      toast.success(r.message || 'Marcada como leída.')
      setNotifRefresh((x) => x + 1)
    } else {
      toast.error(r.message || 'No se pudo marcar como leída.')
    }
  }

  const marcarTodasNotifLeidas = async () => {
    const r = await notificacionService.marcarTodasAlertasLeidas(user?.rol ?? user?.tipo)
    if (r.success) {
      toast.success(r.message || 'Listo.')
      setNotifRefresh((x) => x + 1)
    } else {
      toast.error(r.message || 'No se pudo completar.')
    }
  }

  const adminNav = [
    { name: 'Panel', href: '/admin/dashboard', icon: Home },
    { name: 'Empresas consultoras', href: '/admin/empresas-consultoras', icon: Building2 },
  ]

  const consultoraNav = [
    { name: 'Inicio', href: '/consultora/dashboard', icon: Home },
    { name: 'Configuración inicial', href: '/consultora/configuracion', icon: Settings },
    { name: 'Catálogo documentos', href: '/consultora/catalogo-documentos', icon: FileStack },
    { name: 'Mi equipo', href: '/consultora/mi-equipo', icon: Users },
    { name: 'Mis empresas', href: '/consultora/mis-empresas', icon: Briefcase },
    { name: 'Trámites', href: '/consultora/tramites', icon: ClipboardList },
    { name: 'Alertas', href: '/consultora/alertas', icon: Bell },
    { name: 'Reportes', href: '/consultora/reportes', icon: Files },
  ]

  const colaboradorNav = [
    { name: 'Inicio', href: '/colaborador/dashboard', icon: Home },
    { name: 'Empresas asignadas', href: '/colaborador/empresas', icon: Briefcase },
    { name: 'Trámites', href: '/colaborador/tramites', icon: ClipboardList },
  ]

  const empresaNav = [
    { name: 'Inicio', href: '/empresa-cliente/dashboard', icon: Home },
    { name: 'Personal', href: '/empresa-cliente/personal', icon: Users },
    { name: 'Declaración mensual', href: '/empresa-cliente/declaraciones-mensuales', icon: FileSpreadsheet },
    { name: 'Docs. colaborador', href: '/empresa-cliente/otros-documentos', icon: FileText },
    { name: 'Trámites', href: '/empresa-cliente/tramites', icon: ClipboardList },
    { name: 'Mi empresa', href: '/empresa-cliente/mi-empresa', icon: Files },
    { name: 'Mi consultora', href: '/empresa-cliente/mi-consultora', icon: Building2 },
  ]

  const navigation =
    role === ROLES.ADMINISTRADOR
      ? adminNav
      : role === ROLES.CONSULTORA
        ? consultoraNav
        : role === ROLES.COLABORADOR
          ? colaboradorNav
          : role === ROLES.EMPRESA_CLIENTE
            ? empresaNav
            : adminNav

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const showNotifs =
    role === ROLES.CONSULTORA || role === ROLES.COLABORADOR || role === ROLES.EMPRESA_CLIENTE
  const notifCount = notifRows.length
  const isEmpresaCliente = role === ROLES.EMPRESA_CLIENTE
  const notifPanelTitle = isEmpresaCliente ? 'Declaraciones mensuales' : 'Notificaciones'
  const isConsultora = role === ROLES.CONSULTORA
  const useMobileBottomNav = isEmpresaCliente || isConsultora

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && !useMobileBottomNav && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          useMobileBottomNav
            ? 'hidden lg:block'
            : clsx(
                'transform transition-transform lg:translate-x-0',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              )
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary-600">
            <FileStack className="h-7 w-7" />
            MI EMPRESA
          </Link>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white/90 px-3 py-2 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90 sm:px-4 sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {!useMobileBottomNav && (
              <button
                type="button"
                className="shrink-0 rounded-lg p-2 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div
              className={clsx(
                'min-w-0 truncate text-sm text-gray-500 dark:text-gray-400',
                useMobileBottomNav ? 'block' : 'hidden sm:block'
              )}
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">{getRoleLabel(role)}</span>
              {user?.nombre_usuario || user?.correo ? (
                <span className="ml-2 truncate">· {user.nombre_usuario || user.correo || user.email}</span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {showNotifs && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={isEmpresaCliente ? 'Avisos de declaraciones mensuales' : 'Notificaciones'}
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-[min(92vw,22rem)] max-lg:fixed max-lg:left-3 max-lg:right-3 max-lg:top-16 max-lg:mt-0 max-lg:w-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notifPanelTitle}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{notifCount}</span>
                        {notifRows.length > 0 && (
                          <button
                            type="button"
                            onClick={() => marcarTodasNotifLeidas()}
                            className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
                          >
                            Marcar todas leídas
                          </button>
                        )}
                      </div>
                    </div>
                    {notifLoading ? (
                      <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">Cargando…</p>
                    ) : notifRows.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isEmpresaCliente ? 'Sin avisos nuevos de declaraciones.' : 'Sin notificaciones nuevas.'}
                      </p>
                    ) : (
                      <ul className="max-h-80 space-y-2 overflow-y-auto">
                        {notifRows.map((n) => {
                          const dest = resolveAlertaPath(n, user?.rol ?? user?.tipo)
                          return (
                            <li key={n.id} className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700">
                              <button
                                type="button"
                                onClick={() => {
                                  if (dest) {
                                    navigate(dest)
                                    setNotifOpen(false)
                                  }
                                }}
                                className={`min-w-0 flex-1 px-3 py-2 text-left transition ${
                                  dest
                                    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    : 'cursor-default opacity-90'
                                }`}
                              >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {n.titulo ?? 'Notificación'}
                                </p>
                                {n.descripcion && (
                                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                    {n.descripcion}
                                  </p>
                                )}
                              </button>
                              <button
                                type="button"
                                title="Marcar como leída"
                                aria-label="Marcar como leída"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  marcarNotifLeida(n.id)
                                }}
                                className="shrink-0 self-stretch rounded-r-lg px-2.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/40"
                              >
                                <Check className="mx-auto h-4 w-4" />
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Tema"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to={
                role === ROLES.ADMINISTRADOR
                  ? '/admin/perfil'
                  : role === ROLES.CONSULTORA
                    ? '/consultora/perfil'
                    : role === ROLES.COLABORADOR
                      ? '/colaborador/perfil'
                      : '/empresa-cliente/perfil'
              }
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Perfil"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 sm:px-3"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        <main
          className={clsx(
            'px-3 pb-4 pt-4 sm:px-4 md:px-6 md:pb-6 md:pt-6',
            useMobileBottomNav &&
              'max-lg:pb-[calc(1.25rem+4rem+env(safe-area-inset-bottom,0px))]'
          )}
        >
          <Outlet />
        </main>
      </div>

      {isEmpresaCliente ? <EmpresaClienteMobileTabBar /> : null}
      {isConsultora ? <ConsultoraMobileTabBar /> : null}
    </div>
  )
}

export default Layout
