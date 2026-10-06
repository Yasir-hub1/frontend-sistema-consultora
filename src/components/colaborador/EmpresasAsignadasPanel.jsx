import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowRight, Briefcase, FolderOpen, Mail, MapPin, Phone, Search, X } from 'lucide-react'
import Card from '../common/Card'
import Pagination from '../common/Pagination'
import DocumentosEmpresaModal, { CAMPO_LEGALES, CAMPO_OTROS } from './DocumentosEmpresaModal'
import { CATALOGO_LEGAL, MedidorLegal } from './DocumentosLegalesEmpresa'
import { useAuth } from '../../contexts/AuthContext'
import { colaboradorService } from '../../services/colaboradorService'
import {
  colaboradorPuedeGestionarDocumentosLegalesMiEmpresa,
  colaboradorPuedeGestionarOtrosDocumentosEmpresa,
} from '../../utils/colaboradorPermisos'
import { PAGINATION_CONFIG } from '../../utils/constants'
import { staggerDelayMs } from './ColaboradorShell'

const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'
const RUTA_EMPRESAS = '/colaborador/empresas'
const encabezadoColumna = 'whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'

function displayNombre(r) {
  return r.nombre ?? r.razon_social ?? '—'
}

function displayCorreo(r) {
  return r.correo_empresa ?? r.correo_contacto ?? null
}

function displayUbicacion(r) {
  return [r.ciudad, r.departamento].filter(Boolean).join(' · ')
}

function rutaPersonal(r) {
  return `${RUTA_EMPRESAS}/${r.id}/personal`
}

function conteo(r, campo) {
  return Number(r[campo]) || 0
}

function plural(n, singular, varios) {
  return `${n} ${n === 1 ? singular : varios}`
}

function resumenCartera(stats, total) {
  if (typeof stats.asignadas === 'number') return `${plural(stats.asignadas, 'empresa asignada', 'empresas asignadas')} a tu usuario`
  if (typeof stats.en_cartera === 'number') return `${plural(stats.en_cartera, 'empresa', 'empresas')} en la cartera de tu consultora`
  return plural(total, 'empresa', 'empresas')
}

function EstadoPortal({ activo }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium',
        activo ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400'
      )}
    >
      <span aria-hidden="true" className={clsx('h-1.5 w-1.5 rounded-full', activo ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600')} />
      {activo ? 'Portal activo' : 'Sin portal'}
    </span>
  )
}

function NombreEmpresa({ empresa }) {
  const razonDistinta = empresa.razon_social && empresa.nombre && empresa.razon_social !== empresa.nombre
  return (
    <div className="min-w-0">
      <Link
        to={rutaPersonal(empresa)}
        className="text-[15px] font-semibold leading-snug text-gray-900 hover:text-primary-700 hover:underline focus-visible:underline focus-visible:outline-none dark:text-white dark:hover:text-primary-300"
      >
        {displayNombre(empresa)}
      </Link>
      {razonDistinta ? <p className="truncate text-xs text-gray-500 dark:text-gray-400">{empresa.razon_social}</p> : null}
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">NIT {empresa.nit ?? '—'}</span>
        <EstadoPortal activo={empresa.acceso_portal_habilitado === true} />
      </p>
    </div>
  )
}

function Contacto({ empresa }) {
  const correo = displayCorreo(empresa)
  const ubicacion = displayUbicacion(empresa)
  if (!correo && !empresa.telefono && !ubicacion) return <span className="text-gray-400">—</span>
  return (
    <ul className="min-w-0 space-y-1 text-sm text-gray-700 dark:text-gray-300">
      {ubicacion ? (
        <li className="flex items-center gap-1.5">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{ubicacion}</span>
        </li>
      ) : null}
      {correo ? (
        <li className="flex items-center gap-1.5">
          <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{correo}</span>
        </li>
      ) : null}
      {empresa.telefono ? (
        <li className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Phone aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          {empresa.telefono}
        </li>
      ) : null}
    </ul>
  )
}

function ResumenDocumentos({ empresa, verLegales }) {
  const legales = conteo(empresa, CAMPO_LEGALES)
  const otros = conteo(empresa, CAMPO_OTROS)
  const total = CATALOGO_LEGAL.length
  return (
    <div className="w-40 space-y-1.5">
      {verLegales ? (
        <div>
          <p className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-gray-700 dark:text-gray-200">Legales</span>
            <span className={clsx('font-semibold tabular-nums', legales === total ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-300')}>
              {legales} de {total}
            </span>
          </p>
          <MedidorLegal cargados={legales} className="mt-1" />
        </div>
      ) : null}
      <p className="text-xs text-gray-600 dark:text-gray-400">{plural(otros, 'otro documento', 'otros documentos')}</p>
    </div>
  )
}

function AccionesEmpresa({ empresa, onDocumentos, className }) {
  const base =
    'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900'
  return (
    <div className={clsx('flex gap-2', className)}>
      <button
        type="button"
        onClick={() => onDocumentos(empresa)}
        aria-label={`Documentos de ${displayNombre(empresa)}`}
        className={clsx(
          base,
          'flex-1 border border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-primary-800 dark:hover:bg-primary-950/40 dark:hover:text-primary-200 md:flex-none'
        )}
      >
        <FolderOpen aria-hidden="true" className="h-4 w-4" />
        Documentos
      </button>
      <Link to={rutaPersonal(empresa)} className={clsx(base, 'flex-1 bg-primary-600 text-white hover:bg-primary-700 md:flex-none')}>
        Ver personal
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  )
}

function FilasCargando({ cantidad }) {
  return (
    <div aria-busy="true" aria-label="Cargando empresas" className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-5">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 animate-pulse rounded bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
          </div>
          <div className="hidden h-9 w-60 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none dark:bg-gray-800 sm:block" />
        </div>
      ))}
    </div>
  )
}

function SinEmpresas({ asignadas }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center dark:border-gray-700">
      <Briefcase aria-hidden="true" className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        {asignadas ? 'Acá aparecerán las empresas que te asignen' : 'Acá aparecerán las empresas cliente de tu consultora'}
      </p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
        {asignadas ? 'El titular de la consultora las asigna desde el detalle de cada empresa cliente.' : 'Registralas desde el módulo de consultora.'}
      </p>
    </div>
  )
}

function SinResultados({ busqueda, onLimpiar }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        0 resultados para <span className="font-semibold text-gray-900 dark:text-white">«{busqueda}»</span>. Probá con otro nombre, NIT,
        correo o ciudad.
      </p>
      <button type="button" onClick={onLimpiar} className="text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">
        Limpiar búsqueda
      </button>
    </div>
  )
}

function TarjetasEmpresas({ rows, verLegales, onDocumentos }) {
  return (
    <ul className="space-y-3 md:hidden">
      {rows.map((r, i) => (
        <li
          key={r.id}
          className={clsx(motionStagger, 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50')}
          style={{ animationDelay: `${staggerDelayMs(i)}ms` }}
        >
          <NombreEmpresa empresa={r} />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <Contacto empresa={r} />
            <ResumenDocumentos empresa={r} verLegales={verLegales} />
          </div>
          <AccionesEmpresa empresa={r} onDocumentos={onDocumentos} className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800" />
        </li>
      ))}
    </ul>
  )
}

function TablaEmpresas({ rows, verLegales, onDocumentos }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 md:block">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800/90">
          <tr>
            <th scope="col" className={encabezadoColumna}>
              Empresa
            </th>
            <th scope="col" className={encabezadoColumna}>
              Contacto
            </th>
            <th scope="col" className={encabezadoColumna}>
              Documentos
            </th>
            <th scope="col" className={clsx(encabezadoColumna, 'text-right')}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
          {rows.map((r) => (
            <tr key={r.id} className="align-top transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
              <td className="max-w-[18rem] px-4 py-4">
                <NombreEmpresa empresa={r} />
              </td>
              <td className="max-w-[16rem] px-4 py-4">
                <Contacto empresa={r} />
              </td>
              <td className="px-4 py-4">
                <ResumenDocumentos empresa={r} verLegales={verLegales} />
              </td>
              <td className="whitespace-nowrap px-4 py-4">
                <AccionesEmpresa empresa={r} onDocumentos={onDocumentos} className="justify-end" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * @param {{ variant?: 'page' | 'embedded' }} props
 */
export default function EmpresasAsignadasPanel({ variant = 'page' }) {
  const { user } = useAuth()
  const verLegales = colaboradorPuedeGestionarDocumentosLegalesMiEmpresa(user)
  const canSubirOtros = colaboradorPuedeGestionarOtrosDocumentosEmpresa(user)
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
  const [empresaDocumentos, setEmpresaDocumentos] = useState(null)

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
    const res = await colaboradorService.listEmpresasAsignadas({ page, per_page: perPage, search })
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

  const actualizarConteo = useCallback((empresaId, campo, cantidad) => {
    setRows((prev) => {
      if (!prev.some((r) => r.id === empresaId && conteo(r, campo) !== cantidad)) return prev
      return prev.map((r) => (r.id === empresaId ? { ...r, [campo]: cantidad } : r))
    })
  }, [])

  const abrirDocumentos = useCallback(
    (r) =>
      setEmpresaDocumentos({
        id: r.id,
        nombre: displayNombre(r),
        [CAMPO_LEGALES]: conteo(r, CAMPO_LEGALES),
        [CAMPO_OTROS]: conteo(r, CAMPO_OTROS),
      }),
    []
  )
  const cerrarDocumentos = useCallback(() => setEmpresaDocumentos(null), [])

  const limpiarBusqueda = () => {
    setSearchDraft('')
    setSearch('')
    setPage(1)
  }

  const sinEmpresas =
    !loading &&
    !search &&
    (stats.asignadas === 0 ||
      stats.en_cartera === 0 ||
      (stats.asignadas === undefined && stats.en_cartera === undefined && total === 0 && lastPage <= 1))

  const rango = total > 0 ? `Mostrando ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}` : null

  const encabezado = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h3 className="card-title">{isEmbedded ? 'Empresas asignadas' : 'Directorio'}</h3>
        <p className="card-description">{loading && total === 0 ? 'Cargando empresas…' : resumenCartera(stats, total)}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 sm:w-80">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Nombre, NIT, correo o ciudad"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            className="input w-full pl-10 pr-9"
            aria-label="Buscar empresas por nombre, NIT, correo o ciudad"
          />
          {searchDraft ? (
            <button
              type="button"
              onClick={limpiarBusqueda}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
          Por página
          <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="input w-auto min-w-[4.5rem] py-2 text-sm">
            {PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.filter((n) => n <= 50).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )

  let contenido
  if (loading) {
    contenido = <FilasCargando cantidad={Math.min(perPage, 4)} />
  } else if (sinEmpresas) {
    contenido = <SinEmpresas asignadas={typeof stats.asignadas === 'number'} />
  } else if (rows.length === 0) {
    contenido = <SinResultados busqueda={search} onLimpiar={limpiarBusqueda} />
  } else {
    contenido = (
      <>
        <TarjetasEmpresas rows={rows} verLegales={verLegales} onDocumentos={abrirDocumentos} />
        <TablaEmpresas rows={rows} verLegales={verLegales} onDocumentos={abrirDocumentos} />
        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{rango}</p>
          <Pagination currentPage={page} totalPages={lastPage} onPageChange={setPage} className="flex-col gap-3 sm:flex-row" />
        </div>
      </>
    )
  }

  return (
    <div className="space-y-4">
      {msg ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100"
        >
          {msg}
        </div>
      ) : null}

      <Card header={encabezado} gradient hover={false}>
        {contenido}
      </Card>

      {!isEmbedded ? (
        <p className="px-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-600 dark:text-gray-300">Portal activo</span> significa que la empresa cliente tiene
          un usuario de solo lectura habilitado. Tu trabajo con su personal y sus documentos sigue igual en ambos casos.
        </p>
      ) : null}

      <DocumentosEmpresaModal
        empresa={empresaDocumentos}
        verLegales={verLegales}
        canSubirLegales={verLegales}
        canSubirOtros={canSubirOtros}
        onClose={cerrarDocumentos}
        onCantidad={actualizarConteo}
      />
    </div>
  )
}
