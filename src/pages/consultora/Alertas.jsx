import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'
import Card from '../../components/common/Card'
import { consultoraService } from '../../services/consultoraService'
import { notificacionService } from '../../services/notificacionService'
import { useAuth } from '../../contexts/AuthContext'
import { resolveAlertaPath } from '../../utils/alertaNavigation'

export default function ConsultoraAlertas() {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    let c = false
    ;(async () => {
      const res = await consultoraService.listAlertas({ resuelta: false, leida: false, per_page: 100 })
      if (c) return
      if (res.success) {
        const d = res.data?.data ?? res.data?.items ?? res.data ?? []
        setRows(Array.isArray(d) ? d : [])
      } else {
        setRows([])
        setMsg(res.message)
      }
    })()
    return () => {
      c = true
    }
  }, [refresh])

  const marcarLeida = async (id) => {
    const r = await notificacionService.marcarAlertaLeida(id, user?.rol ?? user?.tipo)
    if (r.success) {
      toast.success(r.message || 'Marcada como leída.')
      setRefresh((x) => x + 1)
    } else {
      toast.error(r.message || 'No se pudo marcar como leída.')
    }
  }

  const marcarTodasLeidas = async () => {
    const r = await notificacionService.marcarTodasAlertasLeidas(user?.rol ?? user?.tipo)
    if (r.success) {
      toast.success(r.message || 'Listo.')
      setRefresh((x) => x + 1)
    } else {
      toast.error(r.message || 'No se pudo completar.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alertas</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Fase 9 — prioridad, módulo y enlace al empleado afectado.
        </p>
      </div>

      {msg && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-900/20">
          {msg}
        </p>
      )}

      <Card title="Pendientes (sin leer)">
        {rows.length > 0 && (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => marcarTodasLeidas()}
              className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              Marcar todas leídas
            </button>
          </div>
        )}
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Sin alertas pendientes de lectura.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((a) => {
              const dest = resolveAlertaPath(a, user?.rol ?? user?.tipo)
              return (
                <li key={a.id} className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => dest && navigate(dest)}
                    className={`min-w-0 flex-1 p-3 text-left text-sm ${
                      dest
                        ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40'
                        : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-bold ${
                        a.nivel === 'urgente'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {a.nivel ?? 'normal'}
                    </span>
                    {a.titulo ?? a.mensaje}
                    {dest && (
                      <span className="ml-2 text-xs font-medium text-primary-600 dark:text-primary-400">
                        Abrir detalle →
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    title="Marcar como leída"
                    aria-label="Marcar como leída"
                    onClick={() => marcarLeida(a.id)}
                    className="shrink-0 self-stretch rounded-r-lg px-3 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/40"
                  >
                    <Check className="mx-auto h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
