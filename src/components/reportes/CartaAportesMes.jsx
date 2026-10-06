import { useEffect, useId, useState } from 'react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { Download, Eye, FileSpreadsheet, RotateCcw } from 'lucide-react'
import Button from '../common/Button'
import { VistaPreviaPdfModal, useVistaPreviaPdf } from '../colaborador/VistaPreviaPdf'
import { nombreEmpresa } from '../../hooks/useEmpresasReporte'

const mesActual = () => new Date().toISOString().slice(0, 7)

function conceptosAPagar(data) {
  const m = data.montos_fmt
  return [
    { etiqueta: 'Depósito CNS', detalle: '10% del total ganado', valor: m.deposito_cns },
    { etiqueta: 'Aportes Gestora', detalle: '19.92%', valor: m.aportes_gestora },
    { etiqueta: 'Aporte solidario Gestora', valor: m.aporte_solidario },
    { etiqueta: 'Planilla MDT', detalle: `${data.mes_nombre} ${data.anio}`, valor: m.planilla_mdt },
    { etiqueta: 'SEPREC registro poder', valor: m.seprec },
  ]
}

function nombreArchivo(data, mes) {
  const base = String(nombreEmpresa(data?.empresa_cliente) || 'empresa')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40)
  return `resumen_aportes_${base}_${mes}.pdf`
}

function guardarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function useMontosCarta(reportes, empresaId, mes) {
  const [data, setData] = useState(null)
  const [estado, setEstado] = useState('inactivo')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!empresaId || !mes) {
      setData(null)
      setEstado('inactivo')
      return
    }
    let cancelado = false
    setEstado('cargando')
    ;(async () => {
      const res = await reportes.getResumenAportesMensual({ empresa_cliente_id: Number(empresaId), mes_gestion: mes })
      if (cancelado) return
      setData(res.success ? res.data : null)
      setEstado(res.success ? 'listo' : 'error')
      if (!res.success) toast.error(res.message || 'No se pudieron cargar los montos.')
    })()
    return () => {
      cancelado = true
    }
  }, [reportes, empresaId, mes, intento])

  return { data, estado, reintentar: () => setIntento((n) => n + 1) }
}

function Libro({ data }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
      <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-gray-200 px-5 py-3 dark:border-gray-700">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Base del periodo</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Total ganado</p>
        </div>
        <p className="text-base font-semibold tabular-nums text-gray-900 dark:text-white">{data.montos_fmt.total_ganado}</p>
      </div>

      <p className="px-5 pt-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Conceptos a pagar</p>
      <dl className="divide-y divide-gray-100 px-5 dark:divide-gray-800">
        {conceptosAPagar(data).map((c) => (
          <div key={c.etiqueta} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-sm text-gray-700 dark:text-gray-300">
              {c.etiqueta}
              {c.detalle ? <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">{c.detalle}</span> : null}
            </dt>
            <dd className="text-sm tabular-nums text-gray-900 dark:text-gray-100">{c.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-1 flex items-baseline justify-between gap-4 border-t-2 border-gray-900 bg-gray-50 px-5 py-4 dark:border-gray-200 dark:bg-gray-800/60">
        <p className="text-sm font-bold text-gray-900 dark:text-white">Total aportes a pagar</p>
        <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">{data.montos_fmt.total_aportes}</p>
      </div>
    </div>
  )
}

function EstadoLibro({ estado, data, onReintentar }) {
  if (estado === 'listo' && data?.montos_fmt) return <Libro data={data} />

  const base = 'flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 text-center'
  if (estado === 'cargando') {
    return (
      <div aria-busy="true" className={clsx(base, 'border-gray-200 dark:border-gray-700')}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Calculando montos del periodo…</p>
      </div>
    )
  }
  if (estado === 'error') {
    return (
      <div className={clsx(base, 'border-red-200 dark:border-red-900')}>
        <p className="text-sm text-gray-700 dark:text-gray-300">Los montos fallaron al cargar. Revisá tu conexión y reintentá.</p>
        <Button type="button" size="sm" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={onReintentar}>
          Reintentar
        </Button>
      </div>
    )
  }
  return (
    <div className={clsx(base, 'border-gray-200 dark:border-gray-700')}>
      <FileSpreadsheet aria-hidden="true" className="h-8 w-8 text-gray-300 dark:text-gray-600" />
      <p className="max-w-xs text-sm text-gray-600 dark:text-gray-400">Elegí una empresa y un mes para ver los montos que van en la carta.</p>
    </div>
  )
}

export default function CartaAportesMes({ reportes, empresas }) {
  const empresaInputId = useId()
  const mesInputId = useId()
  const [empresaId, setEmpresaId] = useState('')
  const [mes, setMes] = useState(mesActual)
  const [descargando, setDescargando] = useState(false)
  const { data, estado, reintentar } = useMontosCarta(reportes, empresaId, mes)
  const previa = useVistaPreviaPdf()
  const listo = Boolean(empresaId && mes)

  const pedirPdf = () => reportes.fetchResumenAportesPdfBlob({ empresa_cliente_id: Number(empresaId), mes_gestion: mes })

  const descargar = async () => {
    setDescargando(true)
    const res = await pedirPdf()
    setDescargando(false)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo descargar la carta.')
      return
    }
    guardarBlob(res.blob, nombreArchivo(data, mes))
    toast.success('Carta descargada.')
  }

  const ver = () =>
    previa.abrir({
      clave: 'carta',
      titulo: `Carta de aportes · ${data?.mes_nombre ?? mes} ${data?.anio ?? ''}`.trim(),
      obtener: pedirPdf,
      descargar,
    })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor={empresaInputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Empresa cliente
          </label>
          <select id={empresaInputId} value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="input w-full py-2.5">
            <option value="">Elegí una empresa</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {nombreEmpresa(e)}
                {e.nit ? ` · ${e.nit}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={mesInputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Mes declarado
          </label>
          <input id={mesInputId} type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="input w-full py-2.5" />
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-5 dark:border-gray-800">
          <Button type="button" icon={<Eye className="h-4 w-4" />} loading={previa.cargando === 'carta'} disabled={!listo} onClick={ver}>
            Ver carta en PDF
          </Button>
          <Button type="button" variant="secondary" icon={<Download className="h-4 w-4" />} loading={descargando} disabled={!listo} onClick={descargar}>
            Descargar carta
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Los montos salen de las declaraciones mensuales cargadas por módulo (AFP, CAJA y Ministerio, con su total ganado, planilla
          MDT y SEPREC). El PDF lleva el logo, la cuenta bancaria y los datos de contacto de tu consultora.
        </p>
      </div>

      <EstadoLibro estado={estado} data={data} onReintentar={reintentar} />
      <VistaPreviaPdfModal vista={previa.vista} onClose={previa.cerrar} />
    </div>
  )
}
