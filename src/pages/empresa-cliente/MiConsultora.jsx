import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, CreditCard, Landmark, Mail, Phone, Wallet } from 'lucide-react'
import Card from '../../components/common/Card'
import EmpresaClienteShell, { staggerDelayMs } from '../../components/empresa-cliente/EmpresaClienteShell'
import { empresaClienteService } from '../../services/empresaClienteService'

const ROWS = [
  { key: 'banco', label: 'Banco', icon: Landmark, get: (d) => d?.banco },
  {
    key: 'cuenta',
    label: 'Cuenta',
    icon: CreditCard,
    get: (d) => d?.nro_cuenta ?? d?.numero_cuenta,
  },
  { key: 'titular', label: 'Titular', icon: Wallet, get: (d) => d?.titular_cuenta },
  { key: 'moneda', label: 'Moneda', icon: Banknote, get: (d) => d?.moneda },
  {
    key: 'soporte',
    label: 'Soporte',
    icon: Mail,
    get: (d) => d?.correo_soporte ?? d?.correo,
  },
  {
    key: 'telefono',
    label: 'Teléfono',
    icon: Phone,
    get: (d) => d?.telefono_contacto ?? d?.telefono,
  },
]

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

  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  return (
    <EmpresaClienteShell className="min-w-0">
      <div className="space-y-6">
        <div className={`${motionStagger}`}>
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
            Mi consultora
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Datos bancarios y contacto para pagos del servicio (visible al cliente).
          </p>
        </div>

        {msg && (
          <p
            className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 motion-reduce:animate-none dark:border-amber-800 dark:bg-amber-900/25 dark:text-amber-100"
            role="status"
          >
            {msg}
          </p>
        )}

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
          <Card title="Datos para transferencia" subtitle="Verificá los datos antes de transferir" gradient>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ROWS.map((row, i) => {
                const Icon = row.icon
                const value = row.get(data) ?? '—'
                return (
                  <div
                    key={row.key}
                    className={`group flex gap-3 rounded-xl border border-transparent bg-white/50 px-3 py-3 transition-all duration-200 hover:border-primary-200/60 hover:bg-primary-50/30 hover:shadow-sm dark:bg-gray-900/20 dark:hover:border-primary-900/50 dark:hover:bg-primary-950/20 ${motionStagger}`}
                    style={{ animationDelay: `${staggerDelayMs(i + 2)}ms` }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 transition-transform duration-200 group-hover:scale-105 dark:bg-primary-900/50 dark:text-primary-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {row.label}
                      </dt>
                      <dd className="mt-0.5 break-words text-sm font-medium text-gray-900 dark:text-gray-100">
                        {value}
                      </dd>
                    </div>
                  </div>
                )
              })}
            </dl>
          </Card>
        </div>

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(2)}ms` }}>
          <Card
            title="Documentos del personal"
            subtitle="Revisá en pantalla antes de descargar o imprimir"
            gradient
          >
            <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-900/60 dark:bg-primary-950/20">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Desde el listado de personal puedes abrir cada legajo, usar la vista previa de documentos y luego
                decidir si descargar o imprimir.
              </p>
              <div className="mt-4">
                <Link
                  to="/empresa-cliente/personal"
                  className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Ir al personal
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </EmpresaClienteShell>
  )
}
