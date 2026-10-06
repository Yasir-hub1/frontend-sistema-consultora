import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Download, Search, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import Pagination from '../common/Pagination'
import GestoraDeclaracionesMes from './GestoraDeclaracionesMes'
import GestoraReporteMes, { AccionesReporte, requisitosReporte } from './GestoraReporteMes'
import GestoraTablaMes, { useEdicionMes } from './GestoraTablaMes'
import { ESTADO_PASO, PasoCierre, ProgresoCierre } from './GestoraPasos'
import { colaboradorService } from '../../services/colaboradorService'
import { PAGINATION_CONFIG } from '../../utils/constants'

const RESUMEN_VACIO = { vigentes: 0, habilitados: 0, con_total: 0, deshabilitados: 0 }

function periodoInicial() {
  const hoy = new Date()
  return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 }
}

function valorPeriodo(anio, mes) {
  return `${anio}-${String(mes).padStart(2, '0')}`
}

function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`
}

function pasoPersonal(resumen) {
  return resumen.vigentes > 0
    ? { estado: ESTADO_PASO.LISTO, resumen: plural(resumen.vigentes, 'persona vigente', 'personas vigentes') }
    : { estado: ESTADO_PASO.PENDIENTE, resumen: 'Sin personal en este mes' }
}

function pasoTotalGanado(resumen) {
  if (resumen.habilitados === 0) return { estado: ESTADO_PASO.BLOQUEADO, resumen: 'Primero registra personal' }
  const texto = `${resumen.con_total} de ${resumen.habilitados} con total ganado`
  return { estado: resumen.con_total === resumen.habilitados ? ESTADO_PASO.LISTO : ESTADO_PASO.PENDIENTE, resumen: texto }
}

function pasoDeclaraciones(declaraciones) {
  if (!declaraciones) return { estado: ESTADO_PASO.PENDIENTE, resumen: 'Consultando…' }
  const texto = `${declaraciones.completos} de ${declaraciones.total} módulos completos`
  return { estado: declaraciones.completos === declaraciones.total ? ESTADO_PASO.LISTO : ESTADO_PASO.PENDIENTE, resumen: texto }
}

function pasoReporte(resumen, requisitos) {
  if (resumen.con_total === 0) return { estado: ESTADO_PASO.BLOQUEADO, resumen: 'Falta total ganado' }
  return requisitos.every((req) => req.estado === ESTADO_PASO.LISTO)
    ? { estado: ESTADO_PASO.LISTO, resumen: 'Listo para generar' }
    : { estado: ESTADO_PASO.PENDIENTE, resumen: 'Se puede generar, con pendientes' }
}

function bloqueoReporte(resumen, cambios) {
  if (cambios > 0) return 'Guardá los cambios de la tabla para incluirlos en el reporte.'
  if (resumen.con_total === 0) return 'Se habilita cuando al menos una persona tenga total ganado.'
  return null
}

function Dato({ etiqueta, valor }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
      <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{valor}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{etiqueta}</p>
    </div>
  )
}

export default function GestoraPersonalPanel({
  empresaId,
  canEdit,
  canRegistrar,
  version = 0,
  onEditarLegajo,
  onRegistrar,
  onRegistroMasivo,
}) {
  const inicial = periodoInicial()
  const [anio, setAnio] = useState(inicial.anio)
  const [mes, setMes] = useState(inicial.mes)
  const [rows, setRows] = useState([])
  const [resumen, setResumen] = useState(RESUMEN_VACIO)
  const [declaraciones, setDeclaraciones] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [etiqueta, setEtiqueta] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const edicion = useEdicionMes(rows)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDraft.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchDraft])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await colaboradorService.listGestora(empresaId, { page, per_page: perPage, search, anio, mes })
    if (res.success) {
      const payload = res.data ?? {}
      setRows(Array.isArray(payload.data) ? payload.data : [])
      setTotal(Number(payload.total) || 0)
      setLastPage(Math.max(1, Number(payload.last_page) || 1))
      setEtiqueta(payload.periodo?.etiqueta ?? '')
      setResumen({ ...RESUMEN_VACIO, ...payload.resumen })
    } else {
      setRows([])
      setTotal(0)
      setLastPage(1)
      setResumen(RESUMEN_VACIO)
      toast.error(res.message || 'No se pudo cargar la gestora.')
    }
    setLoading(false)
  }, [empresaId, page, perPage, search, anio, mes, version])

  useEffect(() => {
    load()
  }, [load])

  const puedeSalirDeLaTabla = () => {
    if (edicion.cambios === 0) return true
    const descartar = window.confirm(
      `Tenés ${plural(edicion.cambios, 'persona', 'personas')} con cambios sin guardar. ¿Descartar esos cambios?`
    )
    if (descartar) edicion.descartar()
    return descartar
  }

  const cambiarPeriodo = (valor) => {
    const [y, m] = String(valor).split('-')
    const anioNum = Number(y)
    const mesNum = Number(m)
    if (!anioNum || !mesNum || !puedeSalirDeLaTabla()) return
    setAnio(anioNum)
    setMes(mesNum)
    setPage(1)
    setDeclaraciones(null)
  }

  const cambiarPagina = (siguiente) => {
    if (puedeSalirDeLaTabla()) setPage(siguiente)
  }

  const guardarCambios = async () => {
    if (edicion.conError > 0) {
      toast.error('Corregí los datos marcados en rojo antes de guardar.')
      return
    }
    setGuardando(true)
    const res = await colaboradorService.actualizarGestoraLote(empresaId, { anio, mes, filas: edicion.filasGuardables })
    setGuardando(false)
    if (!res.success) {
      toast.error(res.message || 'No se pudieron guardar los cambios.')
      return
    }
    toast.success(`${plural(res.data?.guardados ?? edicion.cambios, 'persona actualizada', 'personas actualizadas')}.`)
    edicion.descartar()
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

  const periodo = valorPeriodo(anio, mes)
  const nombreMes = etiqueta || 'este mes'
  const requisitos = requisitosReporte(resumen, declaraciones)
  const pasos = [
    { numero: 1, titulo: 'Registrar personal', ...pasoPersonal(resumen) },
    { numero: 2, titulo: 'Total ganado y días', ...pasoTotalGanado(resumen) },
    { numero: 3, titulo: 'Consolidar declaraciones', ...pasoDeclaraciones(declaraciones) },
    { numero: 4, titulo: 'Revisar el reporte', ...pasoReporte(resumen, requisitos) },
  ]
  const rangeLabel =
    total === 0 ? (loading ? 'Cargando…' : 'Sin registros') : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}`

  return (
    <div className="space-y-5">
      <section
        aria-label="Mes de cierre"
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50 sm:p-5"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Cierre Gestora</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{etiqueta || 'Mes de cierre'}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Seguí los pasos en orden para sacar el reporte del mes.</p>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
              Mes de cierre
            </span>
            <input type="month" value={periodo} onChange={(e) => cambiarPeriodo(e.target.value)} className="input w-full py-2 text-sm sm:w-auto" />
          </label>
        </div>
        <ProgresoCierre pasos={pasos} />
      </section>

      <PasoCierre
        numero={1}
        titulo="Registrar personal"
        descripcion="Alta individual o por Excel. Editar en la lista cambia el legajo: nombre, carnet, CUA/RUA y archivos."
        estado={pasos[0].estado}
        resumen={pasos[0].resumen}
        acciones={
          canRegistrar ? (
            <>
              <Button type="button" variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={onRegistroMasivo}>
                Registro masivo
              </Button>
              <Button type="button" size="sm" icon={<UserPlus className="h-4 w-4" />} onClick={onRegistrar}>
                Registrar personal
              </Button>
            </>
          ) : null
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Dato etiqueta={`Vigentes en ${nombreMes}`} valor={resumen.vigentes} />
          <Dato etiqueta="Habilitadas para la planilla" valor={resumen.habilitados} />
          <Dato etiqueta="Fuera de planilla este mes" valor={resumen.deshabilitados} />
        </div>
        {canRegistrar ? null : (
          <p className="mt-3 text-xs text-amber-800 dark:text-amber-200/90">
            No tienes permiso para registrar personal. Pide a la consultora que lo habilite en Mi equipo → Permisos.
          </p>
        )}
      </PasoCierre>

      <PasoCierre
        numero={2}
        titulo="Total ganado y días del mes"
        descripcion={`Escribí los días y el total ganado de ${nombreMes} directo en la tabla y guardá todo junto. Enter pasa a la fila de abajo. «A todos» copia los días o el total de una persona a las demás habilitadas de la página. Las personas deshabilitadas no cuentan en nada hasta que las habilites.`}
        estado={pasos[1].estado}
        resumen={pasos[1].resumen}
        acciones={<AccionesReporte key={periodo} empresaId={empresaId} anio={anio} mes={mes} bloqueo={bloqueoReporte(resumen, edicion.cambios)} />}
      >
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 max-w-md flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, CI o CUA/RUA…"
              value={searchDraft}
              onChange={(e) => {
                if (puedeSalirDeLaTabla()) setSearchDraft(e.target.value)
              }}
              className="input w-full pl-10"
              aria-label="Buscar personal"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="tabular-nums">{rangeLabel}</span>
            <label htmlFor="gestora-per-page" className="sr-only">
              Por página
            </label>
            <select
              id="gestora-per-page"
              value={perPage}
              onChange={(e) => {
                if (!puedeSalirDeLaTabla()) return
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="input w-auto min-w-[5rem] py-2 text-sm"
            >
              {PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.filter((n) => n <= 100).map((n) => (
                <option key={n} value={n}>
                  {n} por página
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cargando personal…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {search ? 'Nadie coincide con la búsqueda.' : 'No hay personal vigente para este mes.'}
            </p>
            {!search && canRegistrar ? (
              <Button type="button" size="sm" className="mt-4" icon={<UserPlus className="h-4 w-4" />} onClick={onRegistrar}>
                Registrar personal
              </Button>
            ) : null}
          </div>
        ) : (
          <div aria-busy={loading} className={loading ? 'opacity-60 transition-opacity' : undefined}>
            <GestoraTablaMes
              rows={rows}
              canEdit={canEdit}
              edicion={edicion}
              guardando={guardando}
              togglingId={togglingId}
              onGuardar={() => void guardarCambios()}
              onEditarLegajo={(id) => onEditarLegajo?.(id)}
              onAlternar={(row) => void alternarHabilitado(row)}
            />
            {lastPage > 1 ? (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Pagination currentPage={page} totalPages={lastPage} onPageChange={cambiarPagina} className="flex-col gap-3 sm:flex-row" />
              </div>
            ) : null}
          </div>
        )}
      </PasoCierre>

      <PasoCierre
        numero={3}
        titulo="Consolidar declaraciones"
        descripcion={`AFP, CAJA y Ministerio de Trabajo de ${nombreMes}. Planilla MDT y SEPREC van a la carta del reporte; el resto queda archivado con el mes.`}
        estado={pasos[2].estado}
        resumen={pasos[2].resumen}
      >
        <GestoraDeclaracionesMes key={periodo} empresaId={empresaId} anio={anio} mes={mes} onResumen={setDeclaraciones} />
      </PasoCierre>

      <PasoCierre
        numero={4}
        titulo="Revisar el reporte"
        descripcion="Lo que necesita el reporte para salir completo. «Generar aportes» y «Mostrar en PDF» están en el paso 2; con pendientes se puede generar, pero esos montos salen en cero."
        estado={pasos[3].estado}
        resumen={pasos[3].resumen}
      >
        <GestoraReporteMes requisitos={requisitos} />
      </PasoCierre>
    </div>
  )
}
