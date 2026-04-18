import React, { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { normalizeRole, ROLES, getRoleLabel } from '../../utils/roleUtils'
import { consultoraService } from '../../services/consultoraService'
import { colaboradorService } from '../../services/colaboradorService'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifRows, setNotifRows] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
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
      if (role !== ROLES.CONSULTORA && role !== ROLES.COLABORADOR) {
        setNotifRows([])
        return
      }
      setNotifLoading(true)
      const res =
        role === ROLES.CONSULTORA
          ? await consultoraService.listAlertas({ resuelta: false, per_page: 10 })
          : await colaboradorService.listAlertas({ resuelta: false, per_page: 10 })
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
  }, [role, location.pathname])

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
    { name: 'Alertas', href: '/consultora/alertas', icon: Bell },
  ]

  const colaboradorNav = [
    { name: 'Inicio', href: '/colaborador/dashboard', icon: Home },
    { name: 'Empresas asignadas', href: '/colaborador/empresas', icon: Briefcase },
  ]

  const empresaNav = [
    { name: 'Inicio', href: '/empresa-cliente/dashboard', icon: Home },
    { name: 'Personal', href: '/empresa-cliente/personal', icon: Users },
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

  const showNotifs = role === ROLES.CONSULTORA || role === ROLES.COLABORADOR
  const notifCount = notifRows.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform dark:border-gray-700 dark:bg-gray-800 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary-600">
            <FileStack className="h-7 w-7" />
            LaboraConsult
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden text-sm text-gray-500 sm:block dark:text-gray-400">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {getRoleLabel(role)}
              </span>
              {user?.nombre_usuario || user?.correo ? (
                <span className="ml-2">
                  · {user.nombre_usuario || user.correo || user.email}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showNotifs && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-[min(92vw,22rem)] rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{notifCount}</span>
                    </div>
                    {notifLoading ? (
                      <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">Cargando…</p>
                    ) : notifRows.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Sin notificaciones nuevas.
                      </p>
                    ) : (
                      <ul className="max-h-80 space-y-2 overflow-y-auto">
                        {notifRows.map((n) => (
                          <li
                            key={n.id}
                            className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {n.titulo ?? 'Notificación'}
                            </p>
                            {n.descripcion && (
                              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                {n.descripcion}
                              </p>
                            )}
                          </li>
                        ))}
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
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
