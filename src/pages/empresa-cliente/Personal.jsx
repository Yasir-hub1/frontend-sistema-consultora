import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search, Users } from 'lucide-react'
import Card from '../../components/common/Card'
import Pagination from '../../components/common/Pagination'
import { empresaClienteService } from '../../services/empresaClienteService'
import { PAGINATION_CONFIG } from '../../utils/constants'

function Badge({ estado }) {
  const c =
    estado === 'al_dia'
      ? 'bg-emerald-100 text-emerald-800'
      : estado === 'pendiente'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-red-100 text-red-800'
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${c}`}>
      {estado ?? '—'}
    </span>
  )
}

export default function EmpresaClientePersonal() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [stats, setStats] = useState({ total_personal: 0 })
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
    const res = await empresaClienteService.listPersonal({
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
      setStats({ total_personal: Number(st?.total_personal) || 0 })
    } else {
      setRows([])
      setTotal(0)
      setLastPage(1)
      setEmpresa(null)
      setMsg(res.message)
    }
    setLoading(false)
  }, [page, perPage, search])

  useEffect(() => {
    let c = false
    ;(async () => {
      if (c) return
      await load()
    })()
    return () => {
      c = true
    }
  }, [load])

  const rangeLabel =
    total === 0
      ? loading
        ? 'Cargando…'
        : 'Sin registros'
      : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}`

  const sinPersonal = !loading && !search && stats.total_personal === 0
  const empresaNombre = empresa?.nombre ?? empresa?.razon_social ?? 'Tu empresa'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Personal</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Listado de empleados y estado por módulo (solo lectura).
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            {empresaNombre}
            {empresa?.nit ? <> · NIT {empresa.nit}</> : null}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_personal}</p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total personal</p>
        </div>
      </div>

      {msg && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">{msg}</p>}

      <Card title="Empleados" subtitle={rangeLabel}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, CI o cargo…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="input w-full pl-10"
              aria-label="Buscar personal"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="empresa-personal-per-page" className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              Por página
            </label>
            <select
              id="empresa-personal-per-page"
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
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center dark:border-gray-700 dark:bg-gray-900/20">
            <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Sin personal registrado</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tu consultora aún no registró empleados para esta empresa.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay resultados para tu búsqueda.
          </p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {r.nombres} {r.apellidos}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">CI {r.ci ?? '—'} · {r.cargo ?? '—'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge estado={r.estado_afp ?? r.personal_afp?.estado} />
                    <Badge estado={r.estado_caja ?? r.personal_caja?.estado} />
                    <Badge estado={r.estado_ministerio ?? r.personal_ministerio?.estado} />
                  </div>
                  <div className="mt-3 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                    <Link
                      to={`/empresa-cliente/personal/${r.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Ver detalle
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/90">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">CI</th>
                    <th className="px-4 py-3">Cargo</th>
                    <th className="px-4 py-3">AFP</th>
                    <th className="px-4 py-3">CAJA</th>
                    <th className="px-4 py-3">MT</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {r.nombres} {r.apellidos}
                      </td>
                      <td className="px-4 py-3">{r.ci}</td>
                      <td className="px-4 py-3">{r.cargo}</td>
                      <td className="px-4 py-3">
                        <Badge estado={r.estado_afp ?? r.personal_afp?.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge estado={r.estado_caja ?? r.personal_caja?.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge estado={r.estado_ministerio ?? r.personal_ministerio?.estado} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/empresa-cliente/personal/${r.id}`}
                          className="font-medium text-primary-600 hover:underline"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
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
    </div>
  )
}
