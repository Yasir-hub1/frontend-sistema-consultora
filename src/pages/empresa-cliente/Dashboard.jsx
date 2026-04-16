import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Briefcase, Building2, ChevronRight, ShieldCheck } from 'lucide-react'
import Card from '../../components/common/Card'
import { empresaClienteService } from '../../services/empresaClienteService'

export default function EmpresaClienteDashboard() {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    ;(async () => {
      setLoading(true)
      const res = await empresaClienteService.getDashboard()
      if (c) return
      if (res.success) setData(res.data)
      else setMsg(res.message)
      setLoading(false)
    })()
    return () => {
      c = true
    }
  }, [])

  const empresaNombre =
    data?.empresa?.nombre ?? data?.empresa?.razon_social ?? 'Tu empresa'
  const consultoraNombre =
    data?.consultora?.nombre_comercial ?? data?.consultora?.razon_social ?? 'Consultora'

  const cards = [
    {
      title: 'Cobertura AFP',
      value: data?.cobertura_afp ?? data?.afp,
      icon: ShieldCheck,
      color: 'text-primary-700 dark:text-primary-300',
      box: 'bg-primary-100 dark:bg-primary-900/40',
    },
    {
      title: 'Cobertura CAJA',
      value: data?.cobertura_caja ?? data?.caja,
      icon: Briefcase,
      color: 'text-teal-700 dark:text-teal-300',
      box: 'bg-teal-100 dark:bg-teal-900/40',
    },
    {
      title: 'Cobertura Ministerio',
      value: data?.cobertura_ministerio ?? data?.ministerio,
      icon: Bell,
      color: 'text-amber-800 dark:text-amber-200',
      box: 'bg-amber-100 dark:bg-amber-900/40',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{empresaNombre}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Portal de solo lectura con cobertura AFP, CAJA y Ministerio para todo tu personal.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Building2 className="h-3.5 w-3.5" />
            Operado por {consultoraNombre}
          </p>
        </div>
        <Link
          to="/empresa-cliente/personal"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Ver personal
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon
          const isNumber = typeof c.value === 'number'
          return (
            <div
              key={c.title}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.box}`}>
                  <Icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${c.color}`}>
                    {loading ? '—' : c.value ?? '—'}
                    {!loading && isNumber ? '%' : ''}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{c.title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Card title="Accesos rápidos" subtitle="Navega el portal de forma directa">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/empresa-cliente/personal"
            className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary-300 hover:bg-primary-50/40 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
          >
            <p className="font-semibold text-gray-900 dark:text-white">Listado de personal</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Revisa el estado por módulo y accede al detalle de documentos.
            </p>
          </Link>
          <Link
            to="/empresa-cliente/mi-consultora"
            className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary-300 hover:bg-primary-50/40 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
          >
            <p className="font-semibold text-gray-900 dark:text-white">Mi consultora</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Consulta datos de soporte, cuenta bancaria e información de contacto.
            </p>
          </Link>
        </div>
      </Card>

      {msg && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
          {msg}
        </p>
      )}
    </div>
  )
}
