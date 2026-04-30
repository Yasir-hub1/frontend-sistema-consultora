import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Building2,
  CalendarRange,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Hash,
  CreditCard,
  Landmark,
  Plus,
  Search,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react'
import DeclaracionExcelPreview, {
  parseDeclaracionExcelBlob,
} from '../../components/colaborador/DeclaracionExcelPreview'
import ColaboradorShell, { staggerDelayMs } from '../../components/colaborador/ColaboradorShell'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { colaboradorService } from '../../services/colaboradorService'
import { useAuth } from '../../contexts/AuthContext'
import { PAGINATION_CONFIG } from '../../utils/constants'
import { ROLES } from '../../utils/roleUtils'
import { clsx } from 'clsx'

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

function formatBytes(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  if (v < 1024) return `${v} B`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`
  return `${(v / (1024 * 1024)).toFixed(1)} MB`
}

function previewKindFromFormat(formato) {
  const x = String(formato || '').toLowerCase()
  if (x === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png'].includes(x)) return 'image'
  if (['xlsx', 'xls'].includes(x)) return 'sheet'
  return 'other'
}

function mesGestionActual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function ColaboradorPersonalLista() {
  const { user } = useAuth()
  const { empresaId } = useParams()
  const canRegistrarPersonal =
    user?.rol === ROLES.CONSULTORA || Boolean(user?.colaborador?.puede_registrar_personal)
  const canEditPersonal =
    user?.rol === ROLES.CONSULTORA || Boolean(user?.colaborador?.puede_editar_personal)
  const canSubirDeclaracionMensual = canRegistrarPersonal || canEditPersonal
  const [rows, setRows] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [stats, setStats] = useState({ total_personal: 0 })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [contactosReferencia, setContactosReferencia] = useState(['', ''])
  const [curriculumFile, setCurriculumFile] = useState(null)
  const [licenciaFile, setLicenciaFile] = useState(null)
  const [avisoFile, setAvisoFile] = useState(null)
  const [croquisFile, setCroquisFile] = useState(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const [declModalOpen, setDeclModalOpen] = useState(false)
  const [declRows, setDeclRows] = useState([])
  const [declLoading, setDeclLoading] = useState(false)
  const [declMes, setDeclMes] = useState(() => mesGestionActual())
  const [declModulo, setDeclModulo] = useState('afp')
  const [declMontos, setDeclMontos] = useState({
    monto_total_ganado: '',
    monto_deposito_cns: '',
    monto_aportes_gestoras: '',
    monto_aporte_solidario_gestora: '',
    monto_planilla_mensual_mdt: '',
    monto_seprec_registro_poder_consultora: '',
  })
  const [declUploading, setDeclUploading] = useState(false)
  const declFileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [previewLoadingId, setPreviewLoadingId] = useState(null)

  const closeDeclModal = () => {
    setDeclModalOpen(false)
    setDeclModulo('afp')
    setDeclMontos({
      monto_total_ganado: '',
      monto_deposito_cns: '',
      monto_aportes_gestoras: '',
      monto_aporte_solidario_gestora: '',
      monto_planilla_mensual_mdt: '',
      monto_seprec_registro_poder_consultora: '',
    })
    setPreview((p) => {
      if (p?.url) URL.revokeObjectURL(p.url)
      return null
    })
  }

  const closePreviewOnly = () => {
    setPreview((p) => {
      if (p?.url) URL.revokeObjectURL(p.url)
      return null
    })
  }

  useEffect(() => {
    if (!declModalOpen) return
    let c = false
    ;(async () => {
      setDeclLoading(true)
      const res = await colaboradorService.listDeclaracionesMensuales(empresaId)
      if (!c && res.success) setDeclRows(res.data?.items ?? [])
      if (!c) setDeclLoading(false)
    })()
    return () => {
      c = true
    }
  }, [declModalOpen, empresaId])

  const cargarDeclaraciones = async () => {
    const res = await colaboradorService.listDeclaracionesMensuales(empresaId)
    if (res.success) setDeclRows(res.data?.items ?? [])
  }

  const onDeclaracionUpload = async () => {
    const file = declFileRef.current?.files?.[0]
    if (!file) {
      toast.error('Selecciona un archivo.')
      return
    }
    const fd = new FormData()
    fd.append('modulo', declModulo)
    fd.append('mes_gestion', declMes)
    fd.append('archivo', file)
    for (const [k, v] of Object.entries(declMontos)) {
      if (v !== '' && v != null) fd.append(k, v)
    }
    setDeclUploading(true)
    const res = await colaboradorService.subirDeclaracionMensual(empresaId, fd)
    setDeclUploading(false)
    if (res.success) {
      toast.success('Declaración guardada.')
      if (declFileRef.current) declFileRef.current.value = ''
      setDeclMontos({
        monto_total_ganado: '',
        monto_deposito_cns: '',
        monto_aportes_gestoras: '',
        monto_aporte_solidario_gestora: '',
        monto_planilla_mensual_mdt: '',
        monto_seprec_registro_poder_consultora: '',
      })
      await cargarDeclaraciones()
    } else {
      toast.error(res.message || 'No se pudo guardar.')
    }
  }

  const onPreviewDeclaracion = async (row) => {
    const kind = previewKindFromFormat(row.formato)
    setPreviewLoadingId(row.id)
    const res = await colaboradorService.fetchDeclaracionVistaPreviaBlob(empresaId, row.id)
    setPreviewLoadingId(null)
    if (!res.success || !res.blob?.size) {
      toast.error(res.message || 'No se pudo mostrar la vista previa.')
      return
    }
    if (kind === 'sheet') {
      try {
        const sheets = await parseDeclaracionExcelBlob(res.blob)
        setPreview((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url)
          return { kind: 'sheet', title: row.nombre_original, sheets }
        })
      } catch {
        toast.error('No se pudo leer el Excel.')
      }
      return
    }
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      const url = URL.createObjectURL(res.blob)
      return { url, kind: kind === 'other' ? 'pdf' : kind, title: row.nombre_original }
    })
  }

  const onDownloadDeclaracion = async (row) => {
    try {
      await colaboradorService.descargarDeclaracionMensual(empresaId, row.id, row.nombre_original)
    } catch {
      toast.error('No se pudo descargar.')
    }
  }

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
      correo_electronico: '',
      cuenta_bancaria: '',
      cargo: 'Personal',
      fecha_ingreso: new Date().toISOString().slice(0, 10),
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    reset()
    setContactosReferencia(['', ''])
    setCurriculumFile(null)
    setLicenciaFile(null)
    setAvisoFile(null)
    setCroquisFile(null)
  }

  const onCreate = async (data) => {
    setMsg(null)
    const contactos = contactosReferencia.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 3)
    if (contactos.length < 2) {
      setMsg('Debes registrar al menos 2 datos de contacto.')
      return
    }
    if (!curriculumFile || !avisoFile || !croquisFile) {
      setMsg('Curriculum, aviso de luz/agua y croquis son obligatorios.')
      return
    }
    const fd = new FormData()
    fd.append('nombres', data.nombres)
    fd.append('apellidos', data.apellidos)
    fd.append('ci', data.ci)
    fd.append('cargo', data.cargo || 'Personal')
    fd.append('fecha_ingreso', data.fecha_ingreso)
    if (data.correo_electronico) fd.append('correo_electronico', data.correo_electronico)
    if (data.cuenta_bancaria) fd.append('cuenta_bancaria', data.cuenta_bancaria)
    fd.append('contactos_referencia', JSON.stringify(contactos))
    if (curriculumFile) fd.append('curriculum_archivo', curriculumFile)
    if (licenciaFile) fd.append('licencia_conducir_archivo', licenciaFile)
    if (avisoFile) fd.append('aviso_luz_agua_archivo', avisoFile)
    if (croquisFile) fd.append('croquis_archivo', croquisFile)

    const res = await colaboradorService.createPersonal(empresaId, fd)
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
  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  return (
    <ColaboradorShell className="min-w-0">
      <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        <Link
          to="/colaborador/empresas"
          className="group inline-flex items-center gap-1 font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Empresas asignadas
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="font-medium text-gray-800 dark:text-gray-200">{nombreEmpresa}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="text-gray-600 dark:text-gray-300">Personal</span>
      </nav>

      <div className={`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${motionStagger}`}>
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 text-base font-bold text-primary-700 ring-1 ring-primary-500/25 sm:h-14 sm:w-14 sm:text-lg dark:text-primary-300">
            {(nombreEmpresa || 'E').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">Personal</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
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
            className="w-full shrink-0 sm:w-auto"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={`group rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg dark:border-gray-700/80 dark:bg-gray-900/50 ${motionStagger}`}
          style={{ animationDelay: `${staggerDelayMs(1)}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 transition-transform duration-300 group-hover:scale-105 dark:bg-primary-900/50 dark:text-primary-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{stats.total_personal}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Personas en esta empresa</p>
            </div>
          </div>
        </div>
        <div
          className={`group rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200/60 hover:shadow-soft-lg dark:border-gray-700/80 dark:bg-gray-900/50 dark:hover:border-teal-900/40 ${motionStagger}`}
          style={{ animationDelay: `${staggerDelayMs(2)}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800 transition-transform duration-300 group-hover:scale-105 dark:bg-teal-900/40 dark:text-teal-200">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Flujo por empleado</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
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

      <Card title="Directorio de personal" subtitle={rangeLabel} gradient>
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative min-w-0 max-w-md flex-1">
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
          <div className="flex flex-wrap items-center gap-2">
            {!loading ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                icon={<FileSpreadsheet className="h-4 w-4" />}
                onClick={() => {
                  setDeclMes(mesGestionActual())
                  setDeclModalOpen(true)
                }}
              >
                Declaración mensual
              </Button>
            ) : null}
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
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cargando personal…</p>
          </div>
        ) : sinPersonal ? (
          <div className="animate-fade-in-up rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50/80 to-white/50 py-14 text-center motion-reduce:animate-none dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-900/20">
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
              {rows.map((r, i) => {
                const nombre = `${r.nombres ?? ''} ${r.apellidos ?? ''}`.trim()
                return (
                  <li
                    key={r.id}
                    className={clsx(
                      motionStagger,
                      'rounded-2xl border border-gray-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-primary-800'
                    )}
                    style={{ animationDelay: `${staggerDelayMs(i)}ms` }}
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
                        className="btn btn-outline btn-sm inline-flex min-h-[44px] w-full items-center justify-center sm:min-h-0 sm:w-auto"
                      >
                        Ver legajo y documentos
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="hidden overflow-x-auto overscroll-x-contain touch-pan-x rounded-2xl border border-gray-200 shadow-sm dark:border-gray-700 md:block">
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
        isOpen={declModalOpen}
        onClose={closeDeclModal}
        title="Declaración mensual de personal"
        size="xl"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sube una declaración mensual por módulo (AFP, CAJA o Ministerio) en PDF y registra los montos del período.
          Si cargas el mismo módulo y mes, se reemplaza el archivo anterior.
        </p>
        {canSubirDeclaracionMensual ? (
          <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/40">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="decl-modulo"
                  className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400"
                >
                  Módulo
                </label>
                <select
                  id="decl-modulo"
                  value={declModulo}
                  onChange={(e) => setDeclModulo(e.target.value)}
                  className="input w-full py-2.5 text-sm font-medium"
                >
                  <option value="afp">AFP</option>
                  <option value="caja">CAJA</option>
                  <option value="ministerio">Ministerio de Trabajo</option>
                </select>
              </div>
              <div className="min-w-[12rem]">
              <label
                htmlFor="decl-mes-gestion"
                className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400"
              >
                <CalendarRange className="h-3.5 w-3.5" />
                Mes declarado
              </label>
              <input
                id="decl-mes-gestion"
                type="month"
                lang="es"
                value={declMes}
                onChange={(e) => setDeclMes(e.target.value)}
                className="input w-full font-medium"
              />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:justify-end sm:flex-row sm:items-center">
                <input ref={declFileRef} type="file" accept=".pdf" className="hidden" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Upload className="h-4 w-4" />}
                  onClick={() => declFileRef.current?.click()}
                >
                  Elegir PDF
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={declUploading}
                  onClick={() => void onDeclaracionUpload()}
                  icon={<FileSpreadsheet className="h-4 w-4" />}
                >
                  {declUploading ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Total ganado"
                type="number"
                step="0.01"
                value={declMontos.monto_total_ganado}
                onChange={(e) => setDeclMontos((p) => ({ ...p, monto_total_ganado: e.target.value }))}
              />
              <Input
                label="Depósito CNS"
                type="number"
                step="0.01"
                value={declMontos.monto_deposito_cns}
                onChange={(e) => setDeclMontos((p) => ({ ...p, monto_deposito_cns: e.target.value }))}
              />
              <Input
                label="Aportes Gestoras"
                type="number"
                step="0.01"
                value={declMontos.monto_aportes_gestoras}
                onChange={(e) => setDeclMontos((p) => ({ ...p, monto_aportes_gestoras: e.target.value }))}
              />
              <Input
                label="Aporte solidario Gestora"
                type="number"
                step="0.01"
                value={declMontos.monto_aporte_solidario_gestora}
                onChange={(e) => setDeclMontos((p) => ({ ...p, monto_aporte_solidario_gestora: e.target.value }))}
              />
              <Input
                label="Planilla mensual Septiembre (MDT)"
                type="number"
                step="0.01"
                value={declMontos.monto_planilla_mensual_mdt}
                onChange={(e) => setDeclMontos((p) => ({ ...p, monto_planilla_mensual_mdt: e.target.value }))}
              />
              <Input
                label="SEPREC registro de poder a consultora"
                type="number"
                step="0.01"
                value={declMontos.monto_seprec_registro_poder_consultora}
                onChange={(e) =>
                  setDeclMontos((p) => ({
                    ...p,
                    monto_seprec_registro_poder_consultora: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-800 dark:text-amber-200/90">
            Solo puedes consultar. Pide permiso de edición o registro de personal para subir declaraciones.
          </p>
        )}

        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Historial
          </h4>
          {declLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : declRows.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Aún no hay declaraciones cargadas.</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Mes</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Módulo</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Archivo</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Tamaño</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {declRows.map((row) => (
                    <tr key={row.id} className="bg-white dark:bg-gray-900/30">
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-900 dark:text-white">
                        {row.periodo_label}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-300">
                        {String(row.modulo || '').toUpperCase()}
                      </td>
                      <td className="max-w-[12rem] truncate px-3 py-2.5 text-gray-600 dark:text-gray-300">
                        {row.nombre_original}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-500 dark:text-gray-400">
                        {formatBytes(row.tamano_bytes)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            title="Vista previa"
                            disabled={previewLoadingId === row.id}
                            onClick={() => void onPreviewDeclaracion(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </button>
                          <button
                            type="button"
                            title="Descargar"
                            onClick={() => void onDownloadDeclaracion(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:border-gray-600 dark:text-primary-300 dark:hover:bg-gray-800"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Descargar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(preview)}
        onClose={closePreviewOnly}
        title={preview?.title || 'Vista previa'}
        size="xl"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName={preview?.kind === 'sheet' ? 'p-3 sm:p-4' : 'p-0 sm:p-0'}
      >
        {preview?.kind === 'pdf' ? (
          <iframe
            title={preview.title}
            src={preview.url}
            className="h-[min(75vh,640px)] w-full rounded-b-lg border-0 bg-gray-100 dark:bg-gray-900"
          />
        ) : preview?.kind === 'image' ? (
          <div className="flex max-h-[75vh] justify-center overflow-auto bg-gray-100 p-4 dark:bg-gray-900">
            <img src={preview.url} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ) : preview?.kind === 'sheet' && preview.sheets ? (
          <DeclaracionExcelPreview sheets={preview.sheets} />
        ) : null}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Registrar personal"
        size="lg"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Registra el legajo base con los nuevos requisitos documentales. La licencia de conducir es opcional.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nombres" {...register('nombres', { required: 'Obligatorio' })} />
            <Input label="Apellidos" {...register('apellidos', { required: 'Obligatorio' })} />
            <Input
              label="Carnet de identidad"
              leftIcon={<CreditCard className="h-4 w-4" />}
              {...register('ci', { required: 'Obligatorio' })}
            />
            <Input label="Correo electrónico" type="email" {...register('correo_electronico')} />
            <Input
              label="Cuenta bancaria"
              leftIcon={<Landmark className="h-4 w-4" />}
              {...register('cuenta_bancaria')}
            />
            <Input label="Fecha ingreso" type="date" {...register('fecha_ingreso', { required: 'Obligatorio' })} />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contactos de referencia (mín. 2, máx. 3)
              </label>
              <div className="space-y-2">
                {contactosReferencia.map((valor, idx) => (
                  <Input
                    key={`contacto-${idx}`}
                    label={`Contacto ${idx + 1}`}
                    value={valor}
                    onChange={(e) => {
                      const next = [...contactosReferencia]
                      next[idx] = e.target.value
                      setContactosReferencia(next)
                    }}
                    placeholder="Nombre y teléfono"
                  />
                ))}
                {contactosReferencia.length < 3 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setContactosReferencia((prev) => [...prev, ''])}
                  >
                    Adicionar contacto
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="sm:col-span-2 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Curriculum (PDF/imagen) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCurriculumFile(e.target.files?.[0] ?? null)}
                  className="input w-full py-2.5"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Licencia de conducir (opcional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setLicenciaFile(e.target.files?.[0] ?? null)}
                  className="input w-full py-2.5"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Avisos de luz/agua (PDF/imagen) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setAvisoFile(e.target.files?.[0] ?? null)}
                  className="input w-full py-2.5"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Croquis (PDF/imagen) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCroquisFile(e.target.files?.[0] ?? null)}
                  className="input w-full py-2.5"
                  required
                />
              </div>
            </div>
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
    </ColaboradorShell>
  )
}
