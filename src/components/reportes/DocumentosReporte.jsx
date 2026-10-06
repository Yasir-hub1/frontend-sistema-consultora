import { useEffect, useId, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { Download, Eye, FileDown, RotateCcw } from 'lucide-react'
import Button from '../common/Button'
import { VistaPreviaPdfModal, useVistaPreviaPdf } from '../colaborador/VistaPreviaPdf'
import { nombreEmpresa } from '../../hooks/useEmpresasReporte'
import { tamanoArchivo } from '../../utils/archivosPdf'

const TIPOS = [
  { valor: 'mensual', etiqueta: 'Declaraciones mensuales' },
  { valor: 'otros_documentos', etiqueta: 'Otros documentos' },
  { valor: 'todos', etiqueta: 'Todos' },
]

const MODULOS = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'afp', etiqueta: 'AFP' },
  { valor: 'caja', etiqueta: 'CAJA' },
  { valor: 'ministerio', etiqueta: 'Ministerio' },
]

const LIMITE_RESULTADOS = 200

const mesActual = () => new Date().toISOString().slice(0, 7)

function tipoFila(r) {
  const t = r?.tipo_declaracion ? String(r.tipo_declaracion) : ''
  if (t) return t
  return String(r?.modulo || '').toLowerCase() === 'aguinaldo' ? 'aguinaldo' : 'mensual'
}

function claveFila(r) {
  return `${tipoFila(r)}-${r.id}`
}

function etiquetaTipo(r) {
  const tipo = tipoFila(r)
  if (tipo === 'otros_documentos') return { texto: 'Otro documento', tono: 'otros' }
  if (tipo === 'aguinaldo') return { texto: 'Aguinaldo', tono: 'aguinaldo' }
  const modulo = MODULOS.find((m) => m.valor && m.valor === String(r.modulo || '').toLowerCase())
  return { texto: modulo?.etiqueta ?? String(r.modulo || '—').toUpperCase(), tono: 'mensual' }
}

function plural(n, uno, varios) {
  return `${n} ${n === 1 ? uno : varios}`
}

function useDocumentos(reportes, filtros) {
  const [rows, setRows] = useState([])
  const [estado, setEstado] = useState('cargando')
  const [intento, setIntento] = useState(0)
  const { tipo, empresaId, mes, modulo } = filtros

  useEffect(() => {
    let cancelado = false
    setEstado('cargando')
    ;(async () => {
      const res = await reportes.listReportesDeclaraciones({
        tipo_declaracion: tipo,
        mes_gestion: mes,
        anio: tipo === 'todos' && mes ? Number(mes.slice(0, 4)) : '',
        modulo: tipo === 'mensual' ? modulo : '',
        empresa_cliente_id: empresaId ? Number(empresaId) : null,
        per_page: LIMITE_RESULTADOS,
      })
      if (cancelado) return
      setRows(res.success ? res.data?.data ?? [] : [])
      setEstado(res.success ? 'listo' : 'error')
    })()
    return () => {
      cancelado = true
    }
  }, [reportes, tipo, empresaId, mes, modulo, intento])

  return { rows, estado, reintentar: () => setIntento((n) => n + 1) }
}

function Segmentado({ etiqueta, opciones, valor, onCambiar }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      {opciones.map((o) => {
        const activa = o.valor === valor
        return (
          <button
            key={o.valor || 'todos'}
            type="button"
            role="radio"
            aria-checked={activa}
            onClick={() => onCambiar(o.valor)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              activa ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            )}
          >
            {o.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

function ChipTipo({ fila }) {
  const { texto, tono } = etiquetaTipo(fila)
  return (
    <span
      className={clsx(
        'inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold',
        tono === 'mensual' && 'bg-primary-50 text-primary-800 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900',
        tono === 'otros' && 'bg-amber-50 text-amber-800 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900',
        tono === 'aguinaldo' && 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900'
      )}
    >
      {texto}
    </span>
  )
}

function NombreDocumento({ fila }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-gray-900 dark:text-white" title={fila.nombre_original}>
        {fila.nombre_original}
      </p>
      {fila.descripcion ? <p className="truncate text-xs text-gray-500 dark:text-gray-400">{fila.descripcion}</p> : null}
      <p className="text-xs tabular-nums text-gray-400 dark:text-gray-500">{tamanoArchivo(fila.tamano_bytes)}</p>
    </div>
  )
}

function AccionesFila({ fila, cargandoVista, onVer, onDescargar }) {
  return (
    <div className="flex gap-2 sm:justify-end">
      <Button type="button" size="sm" variant="secondary" icon={<Eye className="h-4 w-4" />} loading={cargandoVista} onClick={() => onVer(fila)}>
        Ver
      </Button>
      <Button type="button" size="sm" variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => onDescargar(fila)}>
        Descargar
      </Button>
    </div>
  )
}

function Resultados({ rows, cargandoClave, onVer, onDescargar }) {
  const columna = 'whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={claveFila(r)} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <div className="flex items-start justify-between gap-3">
              <NombreDocumento fila={r} />
              <ChipTipo fila={r} />
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {r.empresa_nombre || '—'} · <span className="tabular-nums">{r.periodo_label || r.mes_gestion}</span>
            </p>
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
              <AccionesFila fila={r} cargandoVista={cargandoClave === claveFila(r)} onVer={onVer} onDescargar={onDescargar} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 md:block">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/90">
            <tr>
              <th scope="col" className={columna}>
                Documento
              </th>
              <th scope="col" className={columna}>
                Empresa
              </th>
              <th scope="col" className={columna}>
                Periodo
              </th>
              <th scope="col" className={columna}>
                Tipo
              </th>
              <th scope="col" className={clsx(columna, 'text-right')}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
            {rows.map((r) => (
              <tr key={claveFila(r)} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                <td className="max-w-[18rem] px-4 py-3">
                  <NombreDocumento fila={r} />
                </td>
                <td className="max-w-[14rem] truncate px-4 py-3 text-gray-700 dark:text-gray-300">{r.empresa_nombre || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300">{r.periodo_label || r.mes_gestion}</td>
                <td className="px-4 py-3">
                  <ChipTipo fila={r} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AccionesFila fila={r} cargandoVista={cargandoClave === claveFila(r)} onVer={onVer} onDescargar={onDescargar} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Vacio({ tipo }) {
  const texto =
    tipo === 'otros_documentos'
      ? 'Los PDFs generales que suban los colaboradores en este mes aparecerán acá.'
      : 'Las declaraciones que se carguen para este mes aparecerán acá. Probá con otro mes, empresa o módulo.'
  return <p className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">{texto}</p>
}

export default function DocumentosReporte({ reportes, empresas }) {
  const empresaInputId = useId()
  const mesInputId = useId()
  const [tipo, setTipo] = useState('mensual')
  const [empresaId, setEmpresaId] = useState('')
  const [mes, setMes] = useState(mesActual)
  const [modulo, setModulo] = useState('')
  const [exportando, setExportando] = useState(false)
  const { rows, estado, reintentar } = useDocumentos(reportes, { tipo, empresaId, mes, modulo })
  const previa = useVistaPreviaPdf()

  const pesoTotal = useMemo(() => rows.reduce((acc, r) => acc + Number(r?.tamano_bytes || 0), 0), [rows])
  const moduloElegido = MODULOS.find((m) => m.valor === modulo)

  const descargar = async (fila) => {
    const res = await reportes.descargarReporteDeclaracion(fila.id, fila.nombre_original, tipoFila(fila))
    if (!res?.success) toast.error(res?.message || 'No se pudo descargar el documento.')
  }

  const ver = (fila) =>
    previa.abrir({
      clave: claveFila(fila),
      titulo: fila.nombre_original,
      obtener: () => reportes.fetchReporteDeclaracionPreviewBlob(fila.id, tipoFila(fila)),
      descargar: () => descargar(fila),
    })

  const exportar = async () => {
    setExportando(true)
    const res = await reportes.exportarReporteDeclaracionesPdf({ mes_gestion: mes, modulo: modulo || null })
    setExportando(false)
    if (res.success) toast.success('PDF consolidado descargado.')
    else toast.error(res.message || 'No se pudo exportar el PDF consolidado.')
  }

  let resultados
  if (estado === 'cargando') {
    resultados = (
      <div aria-busy="true" className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500 dark:text-gray-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
        Buscando documentos…
      </div>
    )
  } else if (estado === 'error') {
    resultados = (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-red-200 py-10 text-center dark:border-red-900">
        <p className="text-sm text-gray-700 dark:text-gray-300">La búsqueda falló. Revisá tu conexión y reintentá.</p>
        <Button type="button" size="sm" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={reintentar}>
          Reintentar
        </Button>
      </div>
    )
  } else if (rows.length === 0) {
    resultados = <Vacio tipo={tipo} />
  } else {
    resultados = <Resultados rows={rows} cargandoClave={previa.cargando} onVer={ver} onDescargar={descargar} />
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <Segmentado etiqueta="Qué documentos ver" opciones={TIPOS} valor={tipo} onCambiar={setTipo} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_auto] lg:items-end">
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={empresaInputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Empresa cliente
            </label>
            <select id={empresaInputId} value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="input w-full py-2.5">
              <option value="">Todas las empresas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {nombreEmpresa(e)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={mesInputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              {tipo === 'otros_documentos' ? 'Mes de subida' : 'Mes declarado'}
            </label>
            <input id={mesInputId} type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="input w-full py-2.5" />
          </div>
          {tipo === 'mensual' ? (
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Módulo</span>
              <Segmentado etiqueta="Módulo" opciones={MODULOS} valor={modulo} onCambiar={setModulo} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
          {estado === 'listo' ? (
            <>
              <span className="font-semibold text-gray-900 dark:text-white">{plural(rows.length, 'documento', 'documentos')}</span> ·{' '}
              {tamanoArchivo(pesoTotal)}
              {rows.length >= LIMITE_RESULTADOS ? ` · se muestran los primeros ${LIMITE_RESULTADOS}, filtrá por empresa para ver el resto` : ''}
            </>
          ) : (
            '\u00a0'
          )}
        </p>
        {tipo === 'mensual' ? (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Button type="button" variant="secondary" size="sm" icon={<FileDown className="h-4 w-4" />} loading={exportando} disabled={!mes} onClick={exportar}>
              Exportar PDF consolidado
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Todas las empresas del mes{moduloElegido?.valor ? ` · solo ${moduloElegido.etiqueta}` : ''}
            </p>
          </div>
        ) : null}
      </div>

      {resultados}
      <VistaPreviaPdfModal vista={previa.vista} onClose={previa.cerrar} />
    </div>
  )
}
