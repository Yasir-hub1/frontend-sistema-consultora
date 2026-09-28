import { useCallback, useEffect, useState } from 'react'
import { Calculator, Download, FileText, Pencil, Power, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import Card from '../common/Card'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'
import Pagination from '../common/Pagination'
import GestoraDeclaracionesMes from './GestoraDeclaracionesMes'
import PlanillaGestoraAportes from './PlanillaGestoraAportes'
import { colaboradorService } from '../../services/colaboradorService'
import { PAGINATION_CONFIG } from '../../utils/constants'
import { formatBolivianos } from '../../utils/formatters'

function periodoInicial() {
  const hoy = new Date()
  return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 }
}

function valorPeriodo(anio, mes) {
  return `${anio}-${String(mes).padStart(2, '0')}`
}

export default function GestoraPersonalPanel({ empresaId, canEdit }) {
  const inicial = periodoInicial()
  const [anio, setAnio] = useState(inicial.anio)
  const [mes, setMes] = useState(inicial.mes)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [etiqueta, setEtiqueta] = useState('')
  const [editRow, setEditRow] = useState(null)
  const [draft, setDraft] = useState({ numero_cua: '', dias_trabajados: '30', total_ganado: '' })
  const [guardando, setGuardando] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [planilla, setPlanilla] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [cartaPdf, setCartaPdf] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDraft.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchDraft])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await colaboradorService.listGestora(empresaId, {
      page,
      per_page: perPage,
      search,
      anio,
      mes,
    })
    if (res.success) {
      const payload = res.data ?? {}
      setRows(Array.isArray(payload.data) ? payload.data : [])
      setTotal(Number(payload.total) || 0)
      setLastPage(Math.max(1, Number(payload.last_page) || 1))
      setEtiqueta(payload.periodo?.etiqueta ?? '')
    } else {
      setRows([])
      setTotal(0)
      setLastPage(1)
      toast.error(res.message || 'No se pudo cargar la gestora.')
    }
    setLoading(false)
  }, [empresaId, page, perPage, search, anio, mes])

  useEffect(() => {
    load()
  }, [load])

  const cambiarPeriodo = (valor) => {
    const [y, m] = String(valor).split('-')
    const anioNum = Number(y)
    const mesNum = Number(m)
    if (!anioNum || !mesNum) return
    setAnio(anioNum)
    setMes(mesNum)
    setPage(1)
    setPlanilla(null)
  }

  const abrirEdicion = (row) => {
    setEditRow(row)
    setDraft({
      numero_cua: row.numero_cua ?? '',
      dias_trabajados: String(row.dias_trabajados ?? 30),
      total_ganado: row.total_ganado ?? '',
    })
  }

  const guardarEdicion = async () => {
    if (!editRow) return
    const dias = Number(draft.dias_trabajados)
    const total = String(draft.total_ganado ?? '').trim().replace(',', '.')
    if (!Number.isInteger(dias) || dias < 0 || dias > 31) {
      toast.error('Los días trabajados van de 0 a 31.')
      return
    }
    if (total === '' || Number.isNaN(Number(total)) || Number(total) < 0) {
      toast.error('Indica un total ganado válido.')
      return
    }
    setGuardando(true)
    const res = await colaboradorService.actualizarGestora(empresaId, editRow.id, {
      anio,
      mes,
      numero_cua: draft.numero_cua,
      dias_trabajados: dias,
      total_ganado: total,
      habilitado: Boolean(editRow.habilitado),
    })
    setGuardando(false)
    if (!res.success) {
      toast.error(res.message || 'No se pudo guardar.')
      return
    }
    toast.success('Datos de gestora actualizados.')
    setEditRow(null)
    await load()
  }

  const alternarHabilitado = async (row) => {
    setTogglingId(row.id)
    const res = await colaboradorService.actualizarGestora(empresaId, row.id, {
      anio,
      mes,
      numero_cua: row.numero_cua ?? '',
      dias_trabajados: Number(row.dias_trabajados ?? 30),
      total_ganado: row.total_ganado ?? '0',
      habilitado: !row.habilitado,
    })
    setTogglingId(null)
    if (!res.success) {
      toast.error(res.message || 'No se pudo cambiar el estado.')
      return
    }
    toast.success(row.habilitado ? 'Quedó fuera de la planilla de este mes.' : 'Volvió a la planilla de este mes.')
    await load()
  }

  const generar = async () => {
    setGenerando(true)
    const res = await colaboradorService.generarAportesGestora(empresaId, { anio, mes })
    setGenerando(false)
    if (!res.success) {
      toast.error(res.message || 'No se pudo generar la planilla.')
      return
    }
    setPlanilla(res.data)
  }

  const cerrarCarta = () => {
    setCartaPdf((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
  }

  const mostrarPdf = async () => {
    setPdfLoading(true)
    const res = await colaboradorService.fetchGestoraCartaPdf(empresaId, { anio, mes })
    setPdfLoading(false)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo generar el PDF.')
      return
    }
    cerrarCarta()
    setCartaPdf({
      url: URL.createObjectURL(res.blob),
      nombre: res.nombre || `detalle_aportes_${valorPeriodo(anio, mes)}.pdf`,
    })
  }

  const descargarCarta = () => {
    if (!cartaPdf?.url) return
    const link = document.createElement('a')
    link.href = cartaPdf.url
    link.download = cartaPdf.nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const rangeLabel =
    total === 0 ? (loading ? 'Cargando…' : 'Sin registros en el periodo') : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}`

  return (
    <>
      <Card title="Gestora" subtitle={`${etiqueta || 'Periodo'} · ${rangeLabel}`} gradient>
        <div className="mb-4 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative min-w-0 max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, CI o CUA/RUA…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="input w-full pl-10"
              aria-label="Buscar en gestora"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="gestora-periodo" className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              Periodo
            </label>
            <input
              id="gestora-periodo"
              type="month"
              value={valorPeriodo(anio, mes)}
              onChange={(e) => cambiarPeriodo(e.target.value)}
              className="input w-auto py-2 text-sm"
            />
            <Button
              type="button"
              size="sm"
              className="shrink-0"
              icon={<Calculator className="h-4 w-4" />}
              loading={generando}
              onClick={() => void generar()}
            >
              Generar aportes
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              icon={<FileText className="h-4 w-4" />}
              loading={pdfLoading}
              onClick={() => void mostrarPdf()}
            >
              Mostrar en PDF
            </Button>
            <label htmlFor="gestora-per-page" className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              Por página
            </label>
            <select
              id="gestora-per-page"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="input w-auto min-w-[5rem] py-2 text-sm"
            >
              {PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.filter((n) => n <= 50).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Cargá el total ganado del mes. Los aportes se calculan sobre ese monto, no sobre los días. Deshabilitar saca a la persona solo de la planilla de este periodo. Generar aportes incluye a todo el personal habilitado del mes, no solo la página visible.
        </p>

        <GestoraDeclaracionesMes empresaId={empresaId} anio={anio} mes={mes} />

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cargando gestora…</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay personal vigente para este periodo.
          </p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={clsx(
                    'rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50',
                    !row.habilitado && 'opacity-60'
                  )}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{row.nombre}</p>
                  <p className="mt-1 text-xs text-gray-500">CUA/RUA {row.numero_cua || '—'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Días</p>
                      <p className="tabular-nums text-gray-800 dark:text-gray-100">{row.dias_trabajados}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Total ganado</p>
                      <p className="tabular-nums text-gray-800 dark:text-gray-100">{formatBolivianos(row.total_ganado)}</p>
                    </div>
                  </div>
                  {!row.habilitado ? (
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
                      Fuera de planilla
                    </p>
                  ) : null}
                  {canEdit ? (
                    <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <Button type="button" size="sm" variant="secondary" className="flex-1" icon={<Pencil className="h-4 w-4" />} onClick={() => abrirEdicion(row)}>
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        loading={togglingId === row.id}
                        icon={<Power className="h-4 w-4" />}
                        onClick={() => void alternarHabilitado(row)}
                      >
                        {row.habilitado ? 'Deshabilitar' : 'Habilitar'}
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 shadow-sm dark:border-gray-700 md:block">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/90">
                    {['Persona', 'CUA/RUA', 'Días trabajados', 'Total ganado', 'Acciones'].map((col) => (
                      <th
                        key={col}
                        className={clsx(
                          'whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400',
                          col === 'Acciones' && 'text-right'
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className={clsx('transition-colors hover:bg-gray-50/90 dark:hover:bg-gray-800/50', !row.habilitado && 'opacity-60')}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{row.nombre}</p>
                        {!row.habilitado ? (
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">Fuera de planilla</p>
                        ) : null}
                        {Number(row.total_ganado) <= 0 ? (
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">Falta total ganado</p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-600 dark:text-gray-300">{row.numero_cua || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-600 dark:text-gray-300">{row.dias_trabajados}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-800 dark:text-gray-100">
                        {formatBolivianos(row.total_ganado)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {canEdit ? (
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                              onClick={() => abrirEdicion(row)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50 dark:text-gray-300"
                              disabled={togglingId === row.id}
                              onClick={() => void alternarHabilitado(row)}
                            >
                              {row.habilitado ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Solo lectura</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <Pagination currentPage={page} totalPages={lastPage} onPageChange={setPage} className="flex-col gap-3 sm:flex-row" />
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={editRow != null}
        onClose={() => setEditRow(null)}
        title={editRow ? `Editar ${editRow.nombre}` : 'Editar'}
        size="md"
        bodyClassName="p-4 sm:p-6"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void guardarEdicion()
          }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estos días y el total ganado quedan guardados para {etiqueta || 'el periodo'}. El CUA/RUA es del legajo, no cambia con el mes.
          </p>
          <Input
            label="Nro. CUA / RUA"
            value={draft.numero_cua}
            onChange={(e) => setDraft((prev) => ({ ...prev, numero_cua: e.target.value }))}
            inputMode="numeric"
            helperText="Opcional. Solo dígitos, entre 4 y 20."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Días trabajados"
              type="number"
              min="0"
              max="31"
              step="1"
              value={draft.dias_trabajados}
              onChange={(e) => setDraft((prev) => ({ ...prev, dias_trabajados: e.target.value }))}
            />
            <Input
              label="Total ganado"
              type="number"
              min="0"
              step="0.01"
              value={draft.total_ganado}
              onChange={(e) => setDraft((prev) => ({ ...prev, total_ganado: e.target.value }))}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditRow(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={cartaPdf != null}
        onClose={cerrarCarta}
        title="Detalle de aportes"
        size="xl"
        bodyClassName="p-0"
        footer={
          <Button type="button" icon={<Download className="h-4 w-4" />} onClick={descargarCarta}>
            Descargar PDF
          </Button>
        }
      >
        {cartaPdf?.url ? (
          <iframe title="Detalle de aportes" src={cartaPdf.url} className="h-[75vh] w-full border-0 bg-gray-100" />
        ) : null}
      </Modal>
      <Modal
        isOpen={planilla != null}
        onClose={() => setPlanilla(null)}
        title={planilla?.periodo?.etiqueta ? `Planilla de aportes · ${planilla.periodo.etiqueta}` : 'Planilla de aportes'}
        size="full"
        bodyClassName="p-4 sm:p-6"
      >
        {planilla ? <PlanillaGestoraAportes planilla={planilla} /> : null}
      </Modal>
    </>
  )
}
