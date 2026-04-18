import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Briefcase, ChevronRight, LayoutDashboard } from 'lucide-react'
import EmpresasAsignadasPanel from '../../components/colaborador/EmpresasAsignadasPanel'
import { colaboradorService } from '../../services/colaboradorService'

export default function ColaboradorDashboard() {
  const [data, setData] = useState(null)
  const [alertasList, setAlertasList] = useState([])
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [res, resAlertas] = await Promise.all([
        colaboradorService.getDashboard(),
        colaboradorService.listAlertas({ resuelta: false, per_page: 5 }),
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
  }, [])

  const empresas = data?.empresas_asignadas ?? 0
  const alertasPendientes = data?.alertas_pendientes ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs font-semibold uppercase tracking-wide">Colaborador</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Inicio</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Resumen de tu carga de trabajo y acceso directo a las empresas en las que colaboras.
          </p>
        </div>
        <Link
          to="/colaborador/empresas"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Ir al listado completo
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {msg && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
        >
          {msg}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '—' : empresas}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Empresas asignadas</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '—' : alertasPendientes}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Alertas pendientes</p>
              {alertasPendientes > 0 && (
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-500">
                  Revisa con tu consultora o desde el módulo de alertas cuando esté disponible.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones recientes</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">{alertasList.length} visibles</span>
        </div>
        {alertasList.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Sin notificaciones nuevas.</p>
        ) : (
          <ul className="space-y-2">
            {alertasList.map((a) => (
              <li key={a.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">{a.titulo ?? 'Notificación'}</p>
                {a.descripcion && (
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{a.descripcion}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <EmpresasAsignadasPanel variant="embedded" />
    </div>
  )
}
