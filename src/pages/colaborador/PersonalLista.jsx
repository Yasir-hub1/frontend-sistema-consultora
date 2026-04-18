import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Hash,
  Plus,
  Search,
  UserPlus,
  Users,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { colaboradorService } from '../../services/colaboradorService'
import { useAuth } from '../../contexts/AuthContext'
import { PAGINATION_CONFIG } from '../../utils/constants'
import { ROLES } from '../../utils/roleUtils'

function estadoModuloBadge(estado) {
  const e = String(estado ?? '').toLowerCase()
  const ok =
    e.includes('complet') || e.includes('al') || e === 'vigente' || e === 'activo' || e === 'ok'
  if (ok) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        OK
      </span>
    )
  }
  if (e.includes('pend') || e.includes('falt')) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Pend.
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      {estado ?? '—'}
    </span>
  )
}

export default function ColaboradorPersonalLista() {
  const { user } = useAuth()
  const { empresaId } = useParams()
  const canRegistrarPersonal =
    user?.rol === ROLES.CONSULTORA || Boolean(user?.colaborador?.puede_registrar_personal)
  const [rows, setRows] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [stats, setStats] = useState({ total_personal: 0 })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchDraft.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchDraft])

  useEffect(() => {
    setPage(1)
  }, [perPage])

  const load = useCallback(async () => {
    setLoading(true)
    setMsg(null)
    const res = await colaboradorService.listPersonal(empresaId, {
      page,
      per_page: perPage,
      search,
    })
    if (res.success) {
      const payload = res.data
      setEmpresa(payload?.empresa ?? null)
      const d = payload?.data ?? payload?.items ?? []
      setRows(Array.isArray(d) ? d : [])
      setTotal(Number(payload?.total) || 0)
      setLastPage(Math.max(1, Number(payload?.last_page) || 1))
      const st = payload?.stats
      setStats({
        total_personal: Number(st?.total_personal) || 0,
      })
    } else {
      setRows([])
      setEmpresa(null)
      setTotal(0)
      setLastPage(1)
      setMsg(res.message)
    }
    setLoading(false)
  }, [empresaId, page, perPage, search])

  useEffect(() => {
    load()
  }, [load])

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      nombres: '',
      apellidos: '',
      ci: '',
      fecha_nacimiento: '',
      cargo: '',
      fecha_ingreso: '',
      afp_id: '',
      nro_afp: '',
      caja_id: '',
      nro_caja: '',
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    reset()
  }

  const onCreate = async (data) => {
    setMsg(null)
    const res = await colaboradorService.createPersonal(empresaId, data)
    if (res.success) {
      closeModal()
      await load()
      setMsg('Personal registrado. Ya puedes cargar documentos en AFP, CAJA y Ministerio.')
    } else setMsg(res.message)
  }

  const nombreEmpresa = empresa?.nombre ?? empresa?.razon_social ?? 'Empresa'
  const rangeLabel =
    total === 0
      ? loading
        ? 'Cargando…'
        : 'Sin registros'
      : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}`

  const sinPersonal = !loading && !search && stats.total_personal === 0

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        <Link
          to="/colaborador/empresas"
          className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Empresas asignadas
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="font-medium text-gray-800 dark:text-gray-200">{nombreEmpresa}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="text-gray-600 dark:text-gray-300">Personal</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 text-lg font-bold text-primary-700 ring-1 ring-primary-500/25 dark:text-primary-300">
            {(nombreEmpresa || 'E').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Personal</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
              Legajo por empleado: alta, seguimiento de módulos AFP, CAJA y Ministerio, y carga de documentos
              por tipo.
            </p>
            {empresa?.nit && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Hash className="h-3.5 w-3.5" />
                NIT {empresa.nit}
              </p>
            )}
          </div>
        </div>
        {canRegistrarPersonal ? (
          <Button
            type="button"
            onClick={() => {
              setMsg(null)
              setModalOpen(true)
            }}
            icon={<UserPlus className="h-4 w-4" />}
            className="shrink-0"
          >
            Registrar personal
          </Button>
        ) : (
          <p className="max-w-sm text-xs text-amber-800 dark:text-amber-200/90">
            No tienes permiso para registrar personal. Pide a la consultora que lo habilite en Mi equipo →
            Permisos.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_personal}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Personas en esta empresa</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Flujo por empleado</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Entra al detalle para subir planillas, comprobantes y contratos según el catálogo de la consultora.
              </p>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          role="status"
          className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100"
        >
          {msg}
        </div>
      )}

      <Card title="Directorio de personal" subtitle={rangeLabel}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, apellido o CI…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="input w-full pl-10"
              aria-label="Buscar personal"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="colab-per-page" className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              Por página
            </label>
            <select
              id="colab-per-page"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
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

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : sinPersonal ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center dark:border-gray-700 dark:bg-gray-900/20">
            <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Aún no hay personal registrado</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
              Crea el primer legajo para habilitar los módulos AFP, CAJA y Ministerio de Trabajo.
            </p>
            {canRegistrarPersonal ? (
              <Button type="button" className="mt-5" onClick={() => setModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
                Registrar empleado
              </Button>
            ) : null}
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay resultados para tu búsqueda.
          </p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((r) => {
                const nombre = `${r.nombres ?? ''} ${r.apellidos ?? ''}`.trim()
                return (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-violet-500/20 text-sm font-bold text-primary-800 dark:text-primary-200">
                        {(r.nombres?.[0] ?? '?') + (r.apellidos?.[0] ?? '')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{nombre || '—'}</p>
                        <p className="text-xs text-gray-500">CI {r.ci ?? '—'} · {r.cargo ?? '—'}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">AFP</span>
                          {estadoModuloBadge(r.estado_afp)}
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">CAJA</span>
                          {estadoModuloBadge(r.estado_caja)}
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">MT</span>
                          {estadoModuloBadge(r.estado_ministerio)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                      <Link
                        to={`/colaborador/empresas/${empresaId}/personal/${r.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Ver legajo y documentos
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 md:block">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/90">
                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Persona
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      CI
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Cargo
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      AFP
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      CAJA
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Min.
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
                  {rows.map((r) => {
                    const nombre = `${r.nombres ?? ''} ${r.apellidos ?? ''}`.trim()
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-gray-50/90 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/15 to-violet-500/15 text-xs font-bold text-primary-800 dark:text-primary-200">
                              {(r.nombres?.[0] ?? '?') + (r.apellidos?.[0] ?? '')}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{nombre || '—'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">{r.ci ?? '—'}</td>
                        <td className="max-w-[10rem] truncate px-4 py-3 text-gray-600 dark:text-gray-300">
                          {r.cargo ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{estadoModuloBadge(r.estado_afp)}</td>
                        <td className="whitespace-nowrap px-4 py-3">{estadoModuloBadge(r.estado_caja)}</td>
                        <td className="whitespace-nowrap px-4 py-3">{estadoModuloBadge(r.estado_ministerio)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <Link
                            to={`/colaborador/empresas/${empresaId}/personal/${r.id}`}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            Legajo →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <Pagination
                currentPage={page}
                totalPages={lastPage}
                onPageChange={setPage}
                className="flex-col gap-3 sm:flex-row"
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Registrar personal"
        size="lg"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Los datos abren el legajo y las fichas AFP, CAJA y Ministerio. Luego podrás adjuntar documentos por
            tipo desde el detalle del empleado.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nombres" {...register('nombres', { required: 'Obligatorio' })} />
            <Input label="Apellidos" {...register('apellidos', { required: 'Obligatorio' })} />
            <Input label="CI" {...register('ci', { required: 'Obligatorio' })} />
            <Input label="Fecha nacimiento" type="date" {...register('fecha_nacimiento')} />
            <Input label="Cargo" {...register('cargo', { required: 'Obligatorio' })} />
            <Input label="Fecha ingreso" type="date" {...register('fecha_ingreso', { required: 'Obligatorio' })} />
            <Input label="AFP (id catálogo)" {...register('afp_id')} />
            <Input label="Nº afiliado AFP" {...register('nro_afp')} />
            <Input label="Caja (id)" {...register('caja_id')} />
            <Input label="Nº asegurado caja" {...register('nro_caja')} />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} icon={<UserPlus className="h-4 w-4" />}>
              {isSubmitting ? 'Guardando…' : 'Guardar personal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
