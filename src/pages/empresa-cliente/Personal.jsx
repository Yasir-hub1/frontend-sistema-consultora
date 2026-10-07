import { useCallback, useEffect, useState } from 'react'
import { Search, Users } from 'lucide-react'
import Card from '../../components/common/Card'
import EmpresaClienteShell, { staggerDelayMs } from '../../components/empresa-cliente/EmpresaClienteShell'
import Pagination from '../../components/common/Pagination'
import { empresaClienteService } from '../../services/empresaClienteService'
import { PAGINATION_CONFIG } from '../../utils/constants'

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

  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  return (
    <EmpresaClienteShell className="min-w-0">
      <div className="space-y-6">
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${motionStagger}`}
          style={{ animationDelay: '0ms' }}
        >
          <div>
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
              Personal
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Empleados que tu consultora registró para tu empresa (solo lectura).
            </p>
            <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-200">{empresaNombre}</span>
              {empresa?.nit ? (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] dark:bg-gray-800">
                  NIT {empresa.nit}
                </span>
              ) : null}
            </p>
          </div>
          <div className="group relative w-full overflow-hidden rounded-2xl border border-primary-200/70 bg-gradient-to-br from-white to-primary-50/40 px-4 py-4 shadow-soft transition-all duration-300 hover:shadow-soft-lg dark:border-primary-900/50 dark:from-gray-900/80 dark:to-primary-950/30 sm:w-auto sm:px-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-400/15 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-primary-500/20" />
            <p className="relative text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
              {loading ? <span className="animate-subtle-pulse motion-reduce:animate-none">…</span> : stats.total_personal}
            </p>
            <p className="relative text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
              Total personal
            </p>
          </div>
        </div>

        {msg && (
          <p
            className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 motion-reduce:animate-none dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
            role="status"
          >
            {msg}
          </p>
        )}

        <div className={`${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
          <Card title="Empleados" subtitle={rangeLabel} gradient>
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative min-w-0 max-w-md flex-1">
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
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cargando listado…</p>
          </div>
        ) : sinPersonal ? (
          <div className="animate-fade-in-up rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50/80 to-white/50 py-14 text-center motion-reduce:animate-none dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-900/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Users className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Sin personal registrado</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Tu consultora aún no registró empleados para esta empresa.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 motion-reduce:animate-none dark:border-gray-700">
            No hay resultados para tu búsqueda.
          </p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((r, i) => (
                <li
                  key={r.id}
                  className={`${motionStagger} rounded-xl border border-gray-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-primary-800`}
                  style={{ animationDelay: `${staggerDelayMs(i)}ms` }}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {r.nombres} {r.apellidos}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">CI {r.ci ?? '—'} · {r.cargo ?? '—'}</p>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto overscroll-x-contain touch-pan-x rounded-xl border border-gray-200 shadow-sm dark:border-gray-700 md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50/95 dark:bg-gray-800/95">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">CI</th>
                    <th className="px-4 py-3">Cargo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="transition-colors duration-200 hover:bg-primary-50/30 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {r.nombres} {r.apellidos}
                      </td>
                      <td className="px-4 py-3">{r.ci}</td>
                      <td className="px-4 py-3">{r.cargo}</td>
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
      </div>
    </EmpresaClienteShell>
  )
}
