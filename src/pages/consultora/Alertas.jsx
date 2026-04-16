import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import { consultoraService } from '../../services/consultoraService'

export default function ConsultoraAlertas() {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    let c = false
    ;(async () => {
      const res = await consultoraService.listAlertas({ resuelta: false, per_page: 100 })
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
  }, [])

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

      <Card title="Pendientes">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">Sin alertas o endpoint en construcción.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
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
                {a.personal_id && a.empresa_cliente_id && (
                  <Link
                    to={`/colaborador/empresas/${a.empresa_cliente_id}/personal/${a.personal_id}`}
                    className="ml-2 text-primary-600 hover:underline"
                  >
                    Abrir ficha
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
