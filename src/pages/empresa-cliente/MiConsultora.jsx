import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import { empresaClienteService } from '../../services/empresaClienteService'

export default function EmpresaClienteMiConsultora() {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    let c = false
    ;(async () => {
      const res = await empresaClienteService.getMiConsultora()
      if (c) return
      if (res.success) setData(res.data)
      else setMsg(res.message)
    })()
    return () => {
      c = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi consultora</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Datos bancarios y contacto para pagos del servicio (visible al cliente).
        </p>
      </div>

      {msg && <p className="text-sm text-amber-800 dark:text-amber-200">{msg}</p>}

      <Card title="Datos para transferencia">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Banco</dt>
            <dd className="mt-1">{data?.banco ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Cuenta</dt>
            <dd className="mt-1">{data?.nro_cuenta ?? data?.numero_cuenta ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Titular</dt>
            <dd className="mt-1">{data?.titular_cuenta ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Moneda</dt>
            <dd className="mt-1">{data?.moneda ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Soporte</dt>
            <dd className="mt-1">{data?.correo_soporte ?? data?.correo ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Teléfono</dt>
            <dd className="mt-1">{data?.telefono_contacto ?? data?.telefono ?? '—'}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
