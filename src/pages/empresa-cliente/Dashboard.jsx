import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2, Check, ChevronRight } from 'lucide-react'
import Card from '../../components/common/Card'
import EmpresaClienteShell, { staggerDelayMs } from '../../components/empresa-cliente/EmpresaClienteShell'
import { empresaClienteService } from '../../services/empresaClienteService'
import { notificacionService } from '../../services/notificacionService'
import { useAuth } from '../../contexts/AuthContext'
import { resolveAlertaPath } from '../../utils/alertaNavigation'

export default function EmpresaClienteDashboard() {
  const [data, setData] = useState(null)
  const [alertasList, setAlertasList] = useState([])
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertasRefresh, setAlertasRefresh] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    let c = false
    ;(async () => {
      setLoading(true)
      const [res, resAlertas] = await Promise.all([
        empresaClienteService.getDashboard(),
        empresaClienteService.listAlertas({ resuelta: false, leida: false, per_page: 5 }),
      ])
      if (c) return
      if (res.success) setData(res.data)
      else setMsg(res.message)
      if (resAlertas.success) {
        const d = resAlertas.data?.data ?? resAlertas.data?.items ?? resAlertas.data ?? []
        setAlertasList(Array.isArray(d) ? d : [])
      } else {
        setAlertasList([])
      }
      setLoading(false)
    })()
    return () => {
      c = true
    }
  }, [alertasRefresh])

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

  const empresaNombre =
    data?.empresa?.nombre ?? data?.empresa?.razon_social ?? 'Tu empresa'
  const consultoraNombre =
    data?.consultora?.nombre_comercial ?? data?.consultora?.razon_social ?? 'Consultora'
  const alertaModuloLabel = {
    declaracion_mensual: 'Declaraciones mensuales',
  }
  const alertasByModulo = alertasList.reduce((acc, a) => {
    const key = (a?.modulo || 'general').toString().toLowerCase()
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  return (
    <EmpresaClienteShell className="min-w-0">
      <div className="space-y-6">
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${motionStagger}`}
          style={{ animationDelay: '0ms' }}
        >
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:via-gray-100 dark:to-gray-300">
              {empresaNombre}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Portal de solo lectura con tu personal, las declaraciones mensuales y los documentos que carga tu consultora.
            </p>
            <p className="mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-gray-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm dark:border-gray-600/60 dark:bg-gray-800/50 dark:text-gray-300">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" />
              <span className="min-w-0">
                Operado por{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-100">{consultoraNombre}</span>
              </span>
            </p>
          </div>
          <Link
            to="/empresa-cliente/personal"
            className="group inline-flex min-h-[44px] w-full items-center justify-center gap-1 self-stretch rounded-xl border border-primary-200/80 bg-primary-50/80 px-3.5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition-all duration-300 hover:border-primary-300 hover:bg-primary-100/90 hover:shadow-md active:scale-[0.99] dark:border-primary-800/50 dark:bg-primary-950/40 dark:text-primary-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/50 sm:w-auto sm:justify-start sm:self-start sm:py-2"
          >
            Ver personal
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
          <Card title="Accesos rápidos" subtitle="Navega el portal de forma directa" gradient>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/empresa-cliente/personal"
                className="group rounded-xl border border-gray-200/80 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-primary-600 dark:hover:bg-primary-950/30"
              >
                <p className="font-semibold text-gray-900 dark:text-white">Listado de personal</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Consulta tus empleados registrados por la consultora.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                  Abrir
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <Link
                to="/empresa-cliente/declaraciones-mensuales"
                className="group rounded-xl border border-gray-200/80 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-teal-600 dark:hover:bg-teal-950/25"
              >
                <p className="font-semibold text-gray-900 dark:text-white">Declaración mensual</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Descarga por mes o varios meses en ZIP, según lo cargue tu consultora.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  Abrir
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <Link
                to="/empresa-cliente/mi-consultora"
                className="group rounded-xl border border-gray-200/80 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-primary-600 dark:hover:bg-primary-950/30 sm:col-span-2 lg:col-span-1"
              >
                <p className="font-semibold text-gray-900 dark:text-white">Mi consultora</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Consulta datos de soporte, cuenta bancaria e información de contacto.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                  Abrir
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </Card>
        </div>

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(2)}ms` }}>
          <Card
            title="Declaraciones mensuales"
            subtitle="Avisos cuando tu consultora sube un PDF de declaración (AFP, CAJA o Ministerio de Trabajo)"
          >
            {alertasList.length > 0 && (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => marcarTodasAlertasLeidas()}
                  className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
                >
                  Marcar todas leídas
                </button>
              </div>
            )}
            {alertasList.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sin avisos nuevos de declaraciones.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(alertasByModulo).map(([modulo, rows], i) => (
                  <div key={modulo}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {alertaModuloLabel[modulo] ?? modulo}
                    </p>
                    <ul className="space-y-2">
                      {rows.map((a, j) => {
                        const dest = resolveAlertaPath(a, user?.rol ?? user?.tipo)
                        return (
                          <li
                            key={a.id}
                            className={`flex gap-1 rounded-xl border border-gray-200/90 dark:border-gray-700 ${motionStagger}`}
                            style={{ animationDelay: `${staggerDelayMs(i + j, 50, 280)}ms` }}
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
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {msg && (
          <p
            className="animate-fade-in-up rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 shadow-sm motion-reduce:animate-none dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
            role="status"
          >
            {msg}
          </p>
        )}
      </div>
    </EmpresaClienteShell>
  )
}
