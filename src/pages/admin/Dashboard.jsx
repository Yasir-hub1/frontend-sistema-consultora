import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import { adminInscripcionService } from '../../services/adminInscripcionService'
import { Link } from 'react-router-dom'
import { Building2, ClipboardList } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await adminInscripcionService.getEstadisticas()
      if (cancelled) return
      if (res.success) setStats(res.data)
      else setErr(res.message)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel administrador</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Fase 1 del flujo: registro de empresas consultoras y seguimiento de activación.
        </p>
      </div>

      {err && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          No se cargaron estadísticas ({err}). Verifica que exista{' '}
          <code className="rounded bg-black/5 px-1">GET /api/admin/estadisticas</code>.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Consultoras" subtitle="Registradas en el sistema">
          <p className="text-3xl font-bold text-primary-600">
            {stats?.total_consultoras ?? stats?.consultoras ?? '—'}
          </p>
          <Link
            to="/admin/empresas-consultoras"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <Building2 className="h-4 w-4" />
            Gestionar empresas consultoras
          </Link>
        </Card>
        <Card title="Pendientes de activación" subtitle="Estado pendiente_activacion">
          <p className="text-3xl font-bold text-amber-600">
            {stats?.consultoras_pendientes ?? '—'}
          </p>
        </Card>
        <Card title="Documentación" subtitle="Flujo operativo">
          <Link
            to="/flujo-operativo"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <ClipboardList className="h-4 w-4" />
            Ver fases 1–10
          </Link>
        </Card>
      </div>
    </div>
  )
}
