import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Plus,
  Search,
  Ban,
} from 'lucide-react'
import { clsx } from 'clsx'
import Button from '../../components/common/Button'
import Pagination from '../../components/common/Pagination'
import TramiteResumenCards from '../../components/tramites/TramiteResumenCards'
import TramiteEstadoBadge from '../../components/tramites/TramiteEstadoBadge'
import TramiteProgreso from '../../components/tramites/TramiteProgreso'
import CrearTramiteModal from '../../components/tramites/CrearTramiteModal'
import { useTramiteContext } from '../../hooks/useTramiteContext'
import { useAuth } from '../../contexts/AuthContext'
import { tramiteService } from '../../services/tramiteService'
import { consultoraService } from '../../services/consultoraService'
import { colaboradorService } from '../../services/colaboradorService'
import ColaboradorShell from '../../components/colaborador/ColaboradorShell'
import {
  diasHastaVencimiento,
  esTramiteAnulado,
  etiquetaAnulacionTramite,
  formatFechaTramite,
  motionStagger,
  TRAMITE_ANULADO_UI,
  staggerDelayMs,
  subtituloTramiteAnulado,
} from '../../utils/tramiteUtils'
import { PAGINATION_CONFIG } from '../../utils/constants'
import { ROLES } from '../../utils/roleUtils'

const FILTROS = [
  { key: '', label: 'Todos' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'vencido', label: 'Vencidos' },
  { key: 'completado', label: 'Completados' },
]

export default function TramitesListaPage() {
  const { rol, basePath, canCreate } = useTramiteContext()
  const { user } = useAuth()
  const colaboradorMiId = user?.colaborador?.id ?? null
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [resumen, setResumen] = useState(null)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const estadoFiltro = searchParams.get('estado') || ''

  const [modalOpen, setModalOpen] = useState(false)
  const [empresas, setEmpresas] = useState([])
  const [colaboradores, setColaboradores] = useState([])

  const loadResumen = useCallback(async () => {
    const res = await tramiteService.getResumen(rol)
    if (res.success) setResumen(res.data)
  }, [rol])

  const loadList = useCallback(async () => {
    setLoading(true)
    const res = await tramiteService.list(rol, {
      page,
      per_page: perPage,
      estado: estadoFiltro || undefined,
      search,
    })
    setLoading(false)
    if (res.success) {
      setRows(res.data)
      setMeta(res.meta)
    } else {
      setRows([])
      toast.error(res.message)
    }
  }, [rol, page, perPage, estadoFiltro, search])

  useEffect(() => {
    void loadResumen()
  }, [loadResumen])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!canCreate) return
    void (async () => {
      if (rol === ROLES.CONSULTORA) {
        const [eRes, cRes] = await Promise.all([
          consultoraService.listEmpresasCliente({ per_page: 200 }),
          consultoraService.listColaboradores({ per_page: 200 }),
        ])
        if (eRes.success) setEmpresas(eRes.data?.data ?? eRes.data ?? [])
        if (cRes.success) setColaboradores(cRes.data?.data ?? cRes.data ?? [])
      } else {
        const eRes = await colaboradorService.listEmpresasAsignadas({ per_page: 200 })
        if (eRes.success) {
          const d = eRes.data?.data ?? eRes.data?.items ?? eRes.data ?? []
          setEmpresas(Array.isArray(d) ? d : [])
        }
      }
    })()
  }, [canCreate, rol])

  const setEstado = (key) => {
    if (key) setSearchParams({ estado: key })
    else setSearchParams({})
    setPage(1)
  }

  const inner = (
    <div className="space-y-6">
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${motionStagger}`}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-primary-50/60 px-3 py-1 text-primary-700 dark:border-primary-800/50 dark:bg-primary-950/40 dark:text-primary-300">
            <ClipboardList className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wide sm:text-xs">Trámites</span>
          </div>
          <h1 className="mt-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
            Gestión de trámites
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Control operativo por empresa: tareas, vencimientos, documentos y seguimiento en timeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`${basePath}/agenda`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-primary-300 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <CalendarDays className="h-4 w-4" />
            Agenda
          </Link>
          {canCreate ? (
            <Button type="button" onClick={() => setModalOpen(true)} className="min-h-[44px] gap-2">
              <Plus className="h-4 w-4" />
              Nuevo trámite
            </Button>
          ) : null}
        </div>
      </div>

      <TramiteResumenCards resumen={resumen} basePath={basePath} />

      <div
        className={`rounded-2xl border border-gray-200/90 bg-white shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50 ${motionStagger}`}
        style={{ animationDelay: `${staggerDelayMs(2)}ms` }}
      >
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTROS.map((f) => (
              <button
                key={f.key || 'all'}
                type="button"
                onClick={() => setEstado(f.key)}
                className={clsx(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  (estadoFiltro || '') === f.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEstado('proximos')}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                estadoFiltro === 'proximos'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              Próximos 7 días
            </button>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              setSearch(searchDraft)
              setPage(1)
            }}
          >
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Buscar trámite…"
                className="input w-full pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Buscar
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay trámites con los filtros actuales.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row, idx) => {
              const dias = diasHastaVencimiento(row.fecha_vencimiento)
              const recurrenciaAnulada = esTramiteAnulado(row)
              const anuladaEn = subtituloTramiteAnulado(row)
              const contenido = (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={clsx(
                          'font-semibold',
                          recurrenciaAnulada
                            ? 'text-gray-500 line-through decoration-rose-300/80 dark:text-gray-400 dark:decoration-rose-700/80'
                            : 'text-gray-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300'
                        )}
                      >
                        {row.nombre}
                      </h2>
                      {!recurrenciaAnulada ? <TramiteEstadoBadge estado={row.estado} /> : null}
                      {row.es_recurrente && !recurrenciaAnulada ? (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                          Mensual
                        </span>
                      ) : null}
                      {recurrenciaAnulada ? (
                        <span className={TRAMITE_ANULADO_UI.badgeClass}>
                          {etiquetaAnulacionTramite(row)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {row.empresa_nombre} · {row.tipo_label}
                    </p>
                    {recurrenciaAnulada ? (
                      <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                        <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          {TRAMITE_ANULADO_UI.listHint}
                          {anuladaEn ? ` · ${anuladaEn}` : ''}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Inicio {formatFechaTramite(row.fecha_inicio)}
                        {row.fecha_vencimiento ? (
                          <>
                            {' '}
                            · Vence {formatFechaTramite(row.fecha_vencimiento)}
                            {dias != null && row.estado !== 'completado' ? (
                              <span
                                className={clsx(
                                  'ml-1 font-semibold',
                                  dias < 0 ? 'text-red-600' : dias <= 7 ? 'text-amber-600' : 'text-gray-500'
                                )}
                              >
                                ({dias < 0 ? `hace ${Math.abs(dias)} d` : `en ${dias} d`})
                              </span>
                            ) : null}
                          </>
                        ) : null}
                      </p>
                    )}
                    {!recurrenciaAnulada ? (
                      <div className="mt-3 max-w-md">
                        <TramiteProgreso pct={row.progreso_pct} estado={row.estado} showLabel={false} />
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        {TRAMITE_ANULADO_UI.listDetalle}
                      </p>
                    )}
                  </div>
                  {!recurrenciaAnulada ? (
                    <ChevronRight className="hidden h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-primary-500 sm:block" />
                  ) : (
                    <Ban className="hidden h-5 w-5 shrink-0 text-rose-400 sm:block" aria-hidden />
                  )}
                </>
              )

              if (recurrenciaAnulada) {
                return (
                  <div
                    key={row.id}
                    className={clsx(
                      'flex flex-col gap-3 border-l-4 border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/20 sm:flex-row sm:items-center sm:justify-between',
                      motionStagger
                    )}
                    style={{ animationDelay: `${staggerDelayMs(idx, 40, 320)}ms` }}
                    title={TRAMITE_ANULADO_UI.listDetalle}
                  >
                    {contenido}
                  </div>
                )
              }

              return (
                <Link
                  key={row.id}
                  to={`${basePath}/${row.id}`}
                  className={clsx(
                    'group flex flex-col gap-3 p-4 transition hover:bg-primary-50/40 dark:hover:bg-primary-950/20 sm:flex-row sm:items-center sm:justify-between',
                    motionStagger
                  )}
                  style={{ animationDelay: `${staggerDelayMs(idx, 40, 320)}ms` }}
                >
                  {contenido}
                </Link>
              )
            })}
          </div>
        )}

        {!loading && meta.total > 0 ? (
          <div className="border-t border-gray-100 p-4 dark:border-gray-800">
            <Pagination
              page={page}
              totalPages={meta.last_page || 1}
              total={meta.total}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n)
                setPage(1)
              }}
            />
          </div>
        ) : null}
      </div>

      {canCreate ? (
        <CrearTramiteModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          rol={rol}
          empresas={empresas}
          colaboradores={colaboradores}
          colaboradorMiId={colaboradorMiId}
          onCreated={() => {
            void loadResumen()
            void loadList()
            navigate(`${basePath}`)
          }}
        />
      ) : null}
    </div>
  )

  if (rol === ROLES.COLABORADOR) {
    return <ColaboradorShell className="min-w-0">{inner}</ColaboradorShell>
  }
  return inner
}
