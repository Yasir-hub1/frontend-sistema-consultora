import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertTriangle, Bell, Briefcase, Check, ChevronRight, LayoutDashboard, ShieldCheck, ClipboardList } from 'lucide-react'
import EmpresasAsignadasPanel from '../../components/colaborador/EmpresasAsignadasPanel'
import ColaboradorShell, { staggerDelayMs } from '../../components/colaborador/ColaboradorShell'
import TramiteResumenCards from '../../components/tramites/TramiteResumenCards'
import { colaboradorService } from '../../services/colaboradorService'
import { tramiteService } from '../../services/tramiteService'
import { notificacionService } from '../../services/notificacionService'
import { useAuth } from '../../contexts/AuthContext'
import { resolveAlertaPath } from '../../utils/alertaNavigation'
import { sanitizeUiMessage } from '../../utils/uiMessage'
import { ROLES } from '../../utils/roleUtils'

export default function ColaboradorDashboard() {
  const [data, setData] = useState(null)
  const [alertasList, setAlertasList] = useState([])
  const [tramiteResumen, setTramiteResumen] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertasRefresh, setAlertasRefresh] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [res, resAlertas] = await Promise.all([
        colaboradorService.getDashboard(),
        colaboradorService.listAlertas({ resuelta: false, leida: false, per_page: 5 }),
      ])
      if (cancelled) return
      if (res.success) setData(res.data)
      else setMsg(res.message)
      if (resAlertas.success) {
        const d = resAlertas.data?.data ?? resAlertas.data?.items ?? resAlertas.data ?? []
        setAlertasList(Array.isArray(d) ? d : [])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [alertasRefresh])

  useEffect(() => {
    void (async () => {
      const res = await tramiteService.getResumen(ROLES.COLABORADOR)
      if (res.success) setTramiteResumen(res.data)
    })()
  }, [])

  const marcarAlertaLeida = async (id) => {
    const r = await notificacionService.marcarAlertaLeida(id, user?.rol ?? user?.tipo)
    if (r.success) {
      toast.success(r.message || 'Marcada como leída.')
      setAlertasRefresh((x) => x + 1)
    } else {
      toast.error(r.message || 'No se pudo marcar como leída.')
    }
  }

  const marcarTodasAlertasLeidas = async () => {
    const r = await notificacionService.marcarTodasAlertasLeidas(user?.rol ?? user?.tipo)
    if (r.success) {
      toast.success(r.message || 'Listo.')
      setAlertasRefresh((x) => x + 1)
    } else {
      toast.error(r.message || 'No se pudo completar.')
    }
  }

  const empresas = data?.empresas_asignadas ?? 0
  const alertasPendientes = data?.alertas_pendientes ?? 0
  const recordatorios = data?.recordatorios_documentos ?? {}
  const moduloCards = [
    {
      key: 'afp',
      label: 'AFP',
      faltantes: Number(recordatorios?.afp?.faltantes || 0),
      items: Array.isArray(recordatorios?.afp?.items) ? recordatorios.afp.items : [],
      tone: 'primary',
    },
    {
      key: 'caja',
      label: 'CAJA',
      faltantes: Number(recordatorios?.caja?.faltantes || 0),
      items: Array.isArray(recordatorios?.caja?.items) ? recordatorios.caja.items : [],
      tone: 'teal',
    },
    {
      key: 'ministerio',
      label: 'Ministerio de Trabajo',
      faltantes: Number(recordatorios?.ministerio?.faltantes || 0),
      items: Array.isArray(recordatorios?.ministerio?.items) ? recordatorios.ministerio.items : [],
      tone: 'amber',
    },
  ]
  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  return (
    <ColaboradorShell className="min-w-0">
      <div className="space-y-6">
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${motionStagger}`}
          style={{ animationDelay: '0ms' }}
        >
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-primary-50/60 px-3 py-1 text-primary-700 shadow-sm dark:border-primary-800/50 dark:bg-primary-950/40 dark:text-primary-300">
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wide sm:text-xs">Colaborador</span>
            </div>
            <h1 className="mt-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
              Inicio
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Resumen de tu carga de trabajo y acceso directo a las empresas en las que colaboras.
            </p>
          </div>
          <Link
            to="/colaborador/empresas"
            className="group inline-flex min-h-[44px] w-full items-center justify-center gap-1 self-stretch rounded-xl border border-primary-200/80 bg-white/80 px-3.5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition-all duration-300 hover:border-primary-300 hover:bg-primary-50/80 hover:shadow-md active:scale-[0.99] dark:border-primary-900/40 dark:bg-gray-900/40 dark:text-primary-300 dark:hover:border-primary-700 sm:w-auto sm:justify-start sm:self-start sm:py-2"
          >
            Ir al listado completo
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {msg && (
          <div
            role="status"
            className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 shadow-sm motion-reduce:animate-none dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
          >
            {sanitizeUiMessage(msg)}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              key: 'emp',
              value: empresas,
              label: 'Empresas asignadas',
              icon: Briefcase,
              box: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
              delay: 0,
            },
            {
              key: 'alert',
              value: alertasPendientes,
              label: 'Alertas pendientes',
              icon: Bell,
              box: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
              hint:
                alertasPendientes > 0
                  ? 'Revisa con tu consultora o desde el módulo de alertas cuando esté disponible.'
                  : null,
              delay: 1,
            },
          ].map((c, i) => {
            const Icon = c.icon
            return (
              <div
                key={c.key}
                className={`group rounded-2xl border border-gray-200/90 bg-white/90 p-4 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/50 hover:shadow-soft-lg dark:border-gray-700/80 dark:bg-gray-900/50 dark:hover:border-violet-800/40 ${motionStagger}`}
                style={{ animationDelay: `${staggerDelayMs(c.delay ?? i)}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${c.box}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
                      {loading ? (
                        <span className="inline-block animate-subtle-pulse motion-reduce:animate-none">—</span>
                      ) : (
                        c.value
                      )}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{c.label}</p>
                    {c.hint ? <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-500">{c.hint}</p> : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {tramiteResumen ? (
          <div className={motionStagger} style={{ animationDelay: `${staggerDelayMs(2)}ms` }}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Trámites
              </h2>
              <Link
                to="/colaborador/tramites/agenda"
                className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                Agenda
              </Link>
            </div>
            <TramiteResumenCards resumen={tramiteResumen} basePath="/colaborador/tramites" />
          </div>
        ) : null}

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(3)}ms` }}>
          <div className="rounded-2xl border border-gray-200/90 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/50">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                Recordatorios por documentos faltantes
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {moduloCards.map((m) => (
                <div key={m.key} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">{m.label}</p>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                      {m.faltantes}
                    </span>
                  </div>
                  {m.faltantes === 0 ? (
                    <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">Sin faltantes.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {m.items.map((it) => (
                        <li key={`${m.key}-${it.personal_id}`} className="text-xs">
                          <button
                            type="button"
                            onClick={() => navigate(it.path)}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/60"
                          >
                            <p className="font-medium text-gray-900 dark:text-white">{it.personal_nombre}</p>
                            <p className="text-gray-500 dark:text-gray-400">{it.empresa_nombre}</p>
                          </button>
                        </li>
                      ))}
                      {m.faltantes > m.items.length ? (
                        <li className="text-xs text-gray-500 dark:text-gray-400">
                          +{m.faltantes - m.items.length} más
                        </li>
                      ) : null}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {moduloCards.some((m) => m.faltantes > 0) ? (
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                Revisa y completa documentos en AFP, CAJA y Ministerio.
              </p>
            ) : null}
          </div>
        </div>

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(3)}ms` }}>
          <div className="rounded-2xl border border-gray-200/90 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/50">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones recientes</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {alertasList.length} sin leer
                </span>
                {alertasList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => marcarTodasAlertasLeidas()}
                    className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Marcar todas leídas
                  </button>
                )}
              </div>
            </div>
            {alertasList.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin notificaciones nuevas.</p>
            ) : (
              <ul className="space-y-2">
                {alertasList.map((a, j) => {
                  const dest = resolveAlertaPath(a, user?.rol ?? user?.tipo)
                  return (
                    <li
                      key={a.id}
                      className={`flex gap-1 rounded-xl border border-gray-200/90 dark:border-gray-700 ${motionStagger}`}
                      style={{ animationDelay: `${staggerDelayMs(j, 45, 280)}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => dest && navigate(dest)}
                        className={`min-h-[44px] min-w-0 flex-1 px-3 py-2.5 text-left text-sm transition-all duration-200 sm:min-h-0 ${
                          dest
                            ? 'cursor-pointer hover:bg-primary-50/40 active:bg-gray-50 dark:hover:bg-gray-800/60 dark:active:bg-gray-800/80'
                            : 'cursor-default opacity-90'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{a.titulo ?? 'Notificación'}</p>
                        {a.descripcion && (
                          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{a.descripcion}</p>
                        )}
                      </button>
                      <button
                        type="button"
                        title="Marcar como leída"
                        aria-label="Marcar como leída"
                        onClick={(e) => {
                          e.stopPropagation()
                          marcarAlertaLeida(a.id)
                        }}
                        className="shrink-0 self-stretch rounded-r-xl px-3 text-primary-600 hover:bg-primary-50/60 dark:text-primary-400 dark:hover:bg-primary-950/30"
                      >
                        <Check className="mx-auto h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(4)}ms` }}>
          <EmpresasAsignadasPanel variant="embedded" />
        </div>
      </div>
    </ColaboradorShell>
  )
}
