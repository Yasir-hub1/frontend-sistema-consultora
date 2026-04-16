import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  Search,
  Shield,
  Users,
} from 'lucide-react'
import Card from '../common/Card'
import Pagination from '../common/Pagination'
import { colaboradorService } from '../../services/colaboradorService'
import { PAGINATION_CONFIG } from '../../utils/constants'

function portalBadge(habilitado) {
  if (habilitado) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/15 dark:bg-emerald-900/30 dark:text-emerald-200">
        Portal activo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300">
      Sin portal
    </span>
  )
}

function displayNombre(r) {
  return r.nombre ?? r.razon_social ?? '—'
}

function displayCorreo(r) {
  return r.correo_empresa ?? r.correo_contacto ?? null
}

/**
 * @param {{ variant?: 'page' | 'embedded' }} props
 */
export default function EmpresasAsignadasPanel({ variant = 'page' }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [stats, setStats] = useState({ asignadas: undefined, en_cartera: undefined })

  const isEmbedded = variant === 'embedded'

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
    const res = await colaboradorService.listEmpresasAsignadas({
      page,
      per_page: perPage,
      search,
    })
    if (res.success) {
      const payload = res.data
      const d = payload?.data ?? payload?.items ?? []
      setRows(Array.isArray(d) ? d : [])
      setTotal(Number(payload?.total) || 0)
      setLastPage(Math.max(1, Number(payload?.last_page) || 1))
      const st = payload?.stats
      setStats({
        asignadas: typeof st?.asignadas === 'number' ? st.asignadas : undefined,
        en_cartera: typeof st?.en_cartera === 'number' ? st.en_cartera : undefined,
      })
    } else {
      setRows([])
      setTotal(0)
      setLastPage(1)
      setMsg(res.message)
    }
    setLoading(false)
  }, [page, perPage, search])

  useEffect(() => {
    load()
  }, [load])

  const rangeLabel =
    total === 0
      ? loading
        ? 'Cargando…'
        : 'Sin registros'
      : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}`

  const sinEmpresas =
    !loading &&
    !search &&
    (stats.asignadas === 0 ||
      stats.en_cartera === 0 ||
      (stats.asignadas === undefined &&
        stats.en_cartera === undefined &&
        total === 0 &&
        lastPage <= 1))

  const statTile =
    typeof stats.asignadas === 'number'
      ? {
          value: stats.asignadas,
          label: 'Empresas asignadas',
          hint: 'Activas para tu usuario en esta consultora',
          icon: Briefcase,
          iconClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
        }
      : typeof stats.en_cartera === 'number'
        ? {
            value: stats.en_cartera,
            label: 'Empresas en cartera',
            hint: 'Total registradas bajo tu consultora',
            icon: Building2,
            iconClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
          }
        : null

  const StatIcon = statTile?.icon ?? null

  const personalBase = '/colaborador/empresas'

  return (
    <div className="space-y-6">
      {!isEmbedded && statTile && StatIcon && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${statTile.iconClass}`}
              >
                <StatIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statTile.value}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{statTile.label}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">{statTile.hint}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Personal por empresa</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Entra a cada fila para registrar o revisar legajos según tus permisos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
        >
          {msg}
        </div>
      )}

      <Card title={isEmbedded ? 'Empresas asignadas' : 'Directorio'} subtitle={rangeLabel}>
        {isEmbedded && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Busca por nombre, NIT, correo o ciudad. Usa la paginación para recorrer listas largas.
          </p>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, NIT, correo o ciudad…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="input w-full pl-10"
              aria-label="Buscar empresas"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="colab-emp-per-page" className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              Por página
            </label>
            <select
              id="colab-emp-per-page"
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
        ) : sinEmpresas ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center dark:border-gray-700 dark:bg-gray-900/20">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {typeof stats.asignadas === 'number'
                ? 'Aún no tienes empresas asignadas'
                : 'Sin empresas en cartera'}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
              {typeof stats.asignadas === 'number'
                ? 'Tu titular debe asignarte empresas cliente desde el detalle de cada empresa.'
                : 'Registra empresas cliente desde el módulo de consultora.'}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay empresas que coincidan con la búsqueda.
          </p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((r) => {
                const portalOn = r.acceso_portal_habilitado === true
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{displayNombre(r)}</p>
                      <p className="mt-0.5 text-xs text-gray-500">NIT {r.nit ?? '—'}</p>
                      {(r.ciudad || r.departamento) && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {[r.ciudad, r.departamento].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {displayCorreo(r) && (
                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-gray-500">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {displayCorreo(r)}
                        </p>
                      )}
                      <div className="mt-2">{portalBadge(portalOn)}</div>
                    </div>
                    <div className="mt-3 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                      <Link
                        to={`${personalBase}/${r.id}/personal`}
                        className="btn btn-outline btn-sm inline-flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver personal
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 md:block">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/90">
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Empresa
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      NIT
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Ubicación
                    </th>
                    <th scope="col" className="min-w-[10rem] px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Contacto
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Portal
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
                  {rows.map((r) => {
                    const portalOn = r.acceso_portal_habilitado === true
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-gray-50/90 dark:hover:bg-gray-800/50"
                      >
                        <td className="max-w-[14rem] px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">{displayNombre(r)}</span>
                          {r.razon_social && r.nombre && r.razon_social !== r.nombre && (
                            <p className="truncate text-xs text-gray-500">{r.razon_social}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{r.nit ?? '—'}</td>
                        <td className="max-w-[12rem] px-4 py-3 text-gray-700 dark:text-gray-300">
                          {[r.ciudad, r.departamento].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="max-w-[14rem] px-4 py-3">
                          <p className="truncate text-gray-700 dark:text-gray-300">{displayCorreo(r) ?? '—'}</p>
                          {r.telefono && <p className="truncate text-xs text-gray-500">{r.telefono}</p>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{portalBadge(portalOn)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <Link
                            to={`${personalBase}/${r.id}/personal`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            Personal
                            <ExternalLink className="h-3.5 w-3.5" />
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

      {!isEmbedded && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          <div className="flex gap-2">
            <Shield className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
            <p>
              El estado «Portal» indica si la empresa cliente tiene usuario de solo lectura activo; no afecta tu
              trabajo interno sobre personal y documentos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
