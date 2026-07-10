import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
  Briefcase,
  Bell,
  Files,
  ClipboardList,
} from 'lucide-react'
import Card from '../../components/common/Card'
import TramiteResumenCards from '../../components/tramites/TramiteResumenCards'
import { consultoraService } from '../../services/consultoraService'
import { tramiteService } from '../../services/tramiteService'
import { ROLES } from '../../utils/roleUtils'

const actions = [
  {
    to: '/consultora/configuracion',
    label: 'Configuraci?n',
    desc: 'Marca, soporte, bancos y plantillas',
    icon: Settings,
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  {
    to: '/consultora/mi-equipo',
    label: 'Mi equipo',
    desc: 'Colaboradores y acceso al portal',
    icon: Users,
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  {
    to: '/consultora/mis-empresas',
    label: 'Empresas cliente',
    desc: 'Clientes y accesos de solo lectura',
    icon: Briefcase,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    to: '/consultora/tramites',
    label: 'Tr?mites',
    desc: 'Tareas, vencimientos y seguimiento',
    icon: ClipboardList,
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  {
    to: '/consultora/alertas',
    label: 'Alertas',
    desc: 'Seguimiento y pendientes',
    icon: Bell,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  },
  {
    to: '/consultora/reportes',
    label: 'Reportes',
    desc: 'Declaraciones por mes y m?dulo',
    icon: Files,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
]

export default function ConsultoraDashboard() {
  const [cfg, setCfg] = useState(null)
  const [note, setNote] = useState(null)
  const [tramiteResumen, setTramiteResumen] = useState(null)

  useEffect(() => {
    let c = false
    ;(async () => {
      const res = await consultoraService.getMiConfiguracion()
      if (c) return
      if (res.success) setCfg(res.data)
      else setNote(res.message)
    })()
    return () => {
      c = true
    }
  }, [])

  useEffect(() => {
    void (async () => {
      const res = await tramiteService.getResumen(ROLES.CONSULTORA)
      if (res.success) setTramiteResumen(res.data)
    })()
  }, [])

  const completa = cfg?.configuracion_completa ?? cfg?.configuracionCompleta
  const nombre =
    cfg?.consultora?.nombre_comercial?.trim() ||
    cfg?.consultora?.razon_social?.trim() ||
    'Tu consultora'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs font-semibold uppercase tracking-wide">Panel</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {nombre}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400">
            Accesos r?pidos a configuraci?n, equipo interno, empresas cliente y alertas.
          </p>
        </div>
      </div>

      {note && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
        >
          {note}
        </div>
      )}

      <div
        className={`rounded-2xl border p-5 shadow-sm transition-colors ${
          completa
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-gray-900/40'
            : 'border-amber-200 bg-gradient-to-br from-amber-50/90 to-white dark:border-amber-900/50 dark:from-amber-950/30 dark:to-gray-900/40'
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                completa
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {completa ? 'Consultora operativa' : 'Configuraci?n pendiente'}
              </h2>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {completa
                  ? 'Puedes gestionar clientes, equipo y documentaci?n con normalidad.'
                  : 'Completa el asistente de configuraci?n inicial para desbloquear todas las ?reas.'}
              </p>
            </div>
          </div>
          <Link
            to="/consultora/configuracion"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            {completa ? 'Revisar configuraci?n' : 'Continuar configuraci?n'}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {tramiteResumen ? (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tr?mites</h3>
            <Link
              to="/consultora/tramites/agenda"
              className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              Ver agenda
            </Link>
          </div>
          <TramiteResumenCards resumen={tramiteResumen} basePath="/consultora/tramites" />
        </div>
      ) : null}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Accesos r?pidos</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map(({ to, label, desc, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-primary-700"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-primary-600 opacity-0 transition group-hover:opacity-100 dark:text-primary-400">
                  Abrir
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Card title="Resumen" subtitle="Estado sincronizado con el servidor">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Configuraci?n
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {completa ? 'Completa' : 'En progreso'}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              NIT
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
              {cfg?.consultora?.nit ?? 'ÿÿÿ'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
