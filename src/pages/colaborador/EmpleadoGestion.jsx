import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  FileText,
  CreditCard,
  LayoutGrid,
  Landmark,
  Mail,
  Pencil,
  Upload,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { colaboradorService } from '../../services/colaboradorService'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import ColaboradorShell, { staggerDelayMs } from '../../components/colaborador/ColaboradorShell'
import Input from '../../components/common/Input'
import { ROLES } from '../../utils/roleUtils'

const MODULOS = [
  {
    key: 'afp',
    label: 'AFP',
    longLabel: 'AFP — Aportes y afiliación',
    accent: 'primary',
    tabActive: 'border-primary-500 text-primary-700 dark:text-primary-300',
    bar: 'bg-primary-500',
    zoneHover: 'hover:border-primary-400 hover:bg-primary-500/5',
    btn: 'bg-primary-600 text-white hover:bg-primary-700',
  },
  {
    key: 'caja',
    label: 'CAJA',
    longLabel: 'CAJA — Salud y asegurado',
    accent: 'teal',
    tabActive: 'border-teal-500 text-teal-700 dark:text-teal-300',
    bar: 'bg-teal-500',
    zoneHover: 'hover:border-teal-400 hover:bg-teal-500/5',
    btn: 'bg-teal-600 text-white hover:bg-teal-700',
  },
  {
    key: 'ministerio',
    label: 'Ministerio',
    longLabel: 'Ministerio de Trabajo',
    accent: 'amber',
    tabActive: 'border-amber-500 text-amber-800 dark:text-amber-200',
    bar: 'bg-amber-500',
    zoneHover: 'hover:border-amber-400 hover:bg-amber-500/5',
    btn: 'bg-amber-600 text-white hover:bg-amber-700',
  },
]

function formatBytes(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  if (v < 1024) return `${v} B`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`
  return `${(v / (1024 * 1024)).toFixed(1)} MB`
}

function formatFecha(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function isoToDateInput(iso) {
  if (!iso) return ''
  const s = String(iso)
  return s.length >= 10 ? s.slice(0, 10) : s
}

function progressFromEstado(estado) {
  const e = String(estado ?? '').toLowerCase()
  if (e.includes('complet') || e.includes('vigente') || e === 'activo' || e === 'ok') return 100
  if (e.includes('pend') || e.includes('falt')) return 42
  return 18
}

function estadoBadgeModulo(estado) {
  const pct = progressFromEstado(estado)
  if (pct >= 99) {
    return <span className="badge inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200">Al día</span>
  }
  if (pct >= 40) {
    return <span className="badge inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-500/20 dark:text-amber-200">Pendiente</span>
  }
  return <span className="badge inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">En curso</span>
}

function extClass(formato) {
  const f = String(formato || '').toLowerCase()
  if (f.includes('pdf')) return 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
  if (f.includes('xls') || f.includes('csv')) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
  if (f.includes('jpg') || f.includes('png') || f.includes('jpeg')) return 'bg-primary-500/15 text-primary-700 dark:text-primary-300'
  if (f.includes('doc')) return 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
  return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
}

function tituloPasoPetrolera(nombre) {
  return String(nombre || '').replace(/^\s*Petrolera\s*[—–-]\s*/i, '')
}

function documentoVigente(list) {
  const arr = Array.isArray(list) ? list : []
  return arr.find((d) => d.es_vigente) ?? null
}

export default function ColaboradorEmpleadoGestion() {
  const { user } = useAuth()
  const { empresaId, personalId } = useParams()
  const canEditPersonal =
    user?.rol === ROLES.CONSULTORA || Boolean(user?.colaborador?.puede_editar_personal)
  const canEditEmpresa =
    user?.rol === ROLES.CONSULTORA || Boolean(user?.colaborador?.puede_editar_empresa_cliente)
  const [editPersonaOpen, setEditPersonaOpen] = useState(false)
  const [editEmpresaOpen, setEditEmpresaOpen] = useState(false)
  const [savingPersona, setSavingPersona] = useState(false)
  const [savingEmpresa, setSavingEmpresa] = useState(false)
  const [contactosReferencia, setContactosReferencia] = useState(['', ''])
  const [curriculumFile, setCurriculumFile] = useState(null)
  const [licenciaFile, setLicenciaFile] = useState(null)
  const [avisoFile, setAvisoFile] = useState(null)
  const [croquisFile, setCroquisFile] = useState(null)
  const personaForm = useForm({
    defaultValues: {
      nombres: '',
      apellidos: '',
      ci: '',
      correo_electronico: '',
      cuenta_bancaria: '',
      fecha_ingreso: '',
    },
  })
  const empresaForm = useForm({
    defaultValues: {
      nombre: '',
      nit: '',
      razon_social: '',
      ciudad: '',
      departamento: '',
      direccion: '',
      telefono: '',
      correo_empresa: '',
      actividad_economica: '',
      matricula_comercio: '',
      rep_legal_nombres: '',
      rep_legal_apellidos: '',
      rep_legal_ci: '',
      observaciones: '',
    },
  })
  const { register: regPersona, handleSubmit: handleSubmitPersona, reset: resetPersona, formState: personaFs } =
    personaForm
  const { register: regEmpresa, handleSubmit: handleSubmitEmpresa, reset: resetEmpresa, formState: empresaFs } =
    empresaForm
  const [tab, setTab] = useState('afp')
  const [empleado, setEmpleado] = useState(null)
  const [tipos, setTipos] = useState([])
  const [docs, setDocs] = useState([])
  const [msg, setMsg] = useState(null)
  const [loadingPersona, setLoadingPersona] = useState(true)
  const [loadingTipos, setLoadingTipos] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [uploadingTipoId, setUploadingTipoId] = useState(null)
  const [observacion, setObservacion] = useState('')
  const [cajaRegimen, setCajaRegimen] = useState(null)
  const [cajaRegimenSaving, setCajaRegimenSaving] = useState(false)
  const [petroleraStep, setPetroleraStep] = useState(0)

  const fileRef = useRef(null)
  const [pendingTipoId, setPendingTipoId] = useState(null)

  const modCfg = MODULOS.find((m) => m.key === tab) ?? MODULOS[0]

  useEffect(() => {
    let c = false
    ;(async () => {
      setLoadingPersona(true)
      const res = await colaboradorService.getPersonal(empresaId, personalId)
      if (c) return
      if (res.success) setEmpleado(res.data)
      else setMsg(res.message)
      setLoadingPersona(false)
    })()
    return () => {
      c = true
    }
  }, [empresaId, personalId])

  useEffect(() => {
    const r = empleado?.caja?.regimen_caja ?? empleado?.personal_caja?.regimen_caja
    if (r === 'nacional' || r === 'petrolera') setCajaRegimen(r)
    else if (empleado) setCajaRegimen(null)
  }, [empleado])

  const onSelectCajaRegimen = useCallback(
    async (value) => {
      if (value !== 'nacional' && value !== 'petrolera') return
      setTab('caja')
      setMsg(null)
      if (value === cajaRegimen) return
      setCajaRegimenSaving(true)
      const res = await colaboradorService.patchCajaRegimen(empresaId, personalId, value)
      setCajaRegimenSaving(false)
      if (res.success) {
        setEmpleado(res.data)
        setCajaRegimen(value)
        setPetroleraStep(0)
        setMsg(null)
      } else {
        toast.error(res.message || 'No se pudo guardar el régimen.')
      }
    },
    [cajaRegimen, empresaId, personalId]
  )

  const loadDocs = useCallback(async () => {
    setLoadingDocs(true)
    const res = await colaboradorService.getDocumentosModulo(empresaId, personalId, tab)
    if (res.success) {
      const d = res.data?.items ?? res.data?.documentos ?? res.data ?? []
      setDocs(Array.isArray(d) ? d : [])
    } else {
      setDocs([])
      setMsg(res.message)
    }
    setLoadingDocs(false)
  }, [empresaId, personalId, tab])

  useEffect(() => {
    loadDocs()
  }, [loadDocs])

  useEffect(() => {
    let c = false
    ;(async () => {
      if (tab === 'caja' && !cajaRegimen) {
        setTipos([])
        setLoadingTipos(false)
        return
      }
      setLoadingTipos(true)
      const res = await colaboradorService.listTiposDocumentoModulo(
        tab,
        tab === 'caja' ? { caja_variante: cajaRegimen } : {}
      )
      if (c) return
      setTipos(res.success ? res.data : [])
      if (!res.success) setMsg(res.message)
      setLoadingTipos(false)
    })()
    return () => {
      c = true
    }
  }, [tab, cajaRegimen])

  useEffect(() => {
    setPetroleraStep(0)
  }, [tab, cajaRegimen])

  const tiposOrdenados = useMemo(
    () => [...tipos].sort((a, b) => (a.orden_visualizacion ?? 0) - (b.orden_visualizacion ?? 0)),
    [tipos]
  )

  const tiposVisible = useMemo(() => {
    if (tab === 'caja' && cajaRegimen === 'petrolera' && tiposOrdenados.length) {
      const t = tiposOrdenados[petroleraStep]
      return t ? [t] : []
    }
    return tiposOrdenados
  }, [tab, cajaRegimen, tiposOrdenados, petroleraStep])

  const docsForModulo = useMemo(() => {
    if (tab !== 'caja' || tipos.length === 0) return docs
    const allowed = new Set(tipos.map((t) => t.id))
    return docs.filter((d) => allowed.has(d.tipo_documento_id))
  }, [docs, tab, tipos])

  const docsByTipo = useMemo(() => {
    const m = new Map()
    for (const d of docsForModulo) {
      const tid = d.tipo_documento_id
      if (tid == null) continue
      if (!m.has(tid)) m.set(tid, [])
      m.get(tid).push(d)
    }
    return m
  }, [docsForModulo])

  const openFilePicker = (tipoId) => {
    if (!canEditPersonal) return
    setPendingTipoId(tipoId)
    fileRef.current?.click()
  }

  const subirArchivoTipo = useCallback(
    async (file, tipoId) => {
      if (!file || tipoId == null || !canEditPersonal) return
      const fd = new FormData()
      fd.append('archivo', file)
      fd.append('tipo_documento_id', String(tipoId))
      if (observacion.trim()) fd.append('observacion', observacion.trim())

      setUploadingTipoId(tipoId)
      const res = await colaboradorService.subirDocumento(empresaId, personalId, tab, fd)
      setUploadingTipoId(null)
      if (res.success) {
        toast.success('Archivo guardado.')
        await loadDocs()
        const r = await colaboradorService.getPersonal(empresaId, personalId)
        if (r.success) setEmpleado(r.data)
      } else {
        toast.error(res.message || 'No se pudo subir el archivo.')
      }
    },
    [canEditPersonal, empresaId, observacion, personalId, tab, loadDocs]
  )

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    const tipoId = pendingTipoId
    e.target.value = ''
    setPendingTipoId(null)
    await subirArchivoTipo(file, tipoId)
  }

  const onDropArchivo = (e, tipoId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!canEditPersonal || uploadingTipoId != null) return
    const file = e.dataTransfer.files?.[0]
    if (file) void subirArchivoTipo(file, tipoId)
  }

  const onSavePersona = handleSubmitPersona(async (data) => {
    setSavingPersona(true)
    setMsg(null)
    const contactos = contactosReferencia.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 3)
    const payload = new FormData()
    payload.append('nombres', data.nombres)
    payload.append('apellidos', data.apellidos)
    payload.append('ci', data.ci)
    payload.append('cargo', empleado?.cargo || 'Personal')
    payload.append('fecha_ingreso', data.fecha_ingreso)
    payload.append('correo_electronico', data.correo_electronico || '')
    payload.append('cuenta_bancaria', data.cuenta_bancaria || '')
    payload.append('contactos_referencia', JSON.stringify(contactos))
    if (curriculumFile) payload.append('curriculum_archivo', curriculumFile)
    if (licenciaFile) payload.append('licencia_conducir_archivo', licenciaFile)
    if (avisoFile) payload.append('aviso_luz_agua_archivo', avisoFile)
    if (croquisFile) payload.append('croquis_archivo', croquisFile)

    const res = await colaboradorService.updatePersonal(empresaId, personalId, payload)
    setSavingPersona(false)
    if (res.success) {
      setEmpleado(res.data)
      setEditPersonaOpen(false)
      setCurriculumFile(null)
      setLicenciaFile(null)
      setAvisoFile(null)
      setCroquisFile(null)
      toast.success('Datos del trabajador actualizados.')
    } else {
      toast.error(res.message || 'No se pudo guardar.')
    }
  })

  const onSaveEmpresa = handleSubmitEmpresa(async (data) => {
    setSavingEmpresa(true)
    setMsg(null)
    const payload = {}
    for (const [k, v] of Object.entries(data)) {
      payload[k] = v === '' ? null : v
    }
    const res = await colaboradorService.updateEmpresaAsignada(empresaId, payload)
    setSavingEmpresa(false)
    if (res.success) {
      const r2 = await colaboradorService.getPersonal(empresaId, personalId)
      if (r2.success) setEmpleado(r2.data)
      setEditEmpresaOpen(false)
      toast.success('Datos de la empresa actualizados.')
    } else {
      toast.error(res.message || 'No se pudo guardar.')
    }
  })

  const nombreCompleto = empleado
    ? `${empleado.nombres ?? ''} ${empleado.apellidos ?? ''}`.trim()
    : '…'
  const iniciales = empleado
    ? `${empleado.nombres?.[0] ?? ''}${empleado.apellidos?.[0] ?? ''}`.toUpperCase() || '—'
    : '—'
  const empresaCliente = empleado?.empresa_cliente ?? empleado?.empresaCliente
  const empresaNombre = empresaCliente?.nombre ?? empresaCliente?.razon_social ?? 'Empresa'

  const afp = empleado?.afp ?? empleado?.personal_afp
  const caja = empleado?.caja ?? empleado?.personal_caja
  const mt = empleado?.ministerio ?? empleado?.personal_ministerio

  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  if (loadingPersona && !empleado) {
    return (
      <ColaboradorShell className="min-w-0">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando legajo…</p>
        </div>
      </ColaboradorShell>
    )
  }

  if (!empleado) {
    return (
      <ColaboradorShell className="min-w-0">
        <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800 motion-reduce:animate-none dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {msg || 'No se encontró el personal.'}
          <div className="mt-4">
            <Link
              to={`/colaborador/empresas/${empresaId}/personal`}
              className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              Volver al listado
            </Link>
          </div>
        </div>
      </ColaboradorShell>
    )
  }

  return (
    <ColaboradorShell className="min-w-0">
    <div className="space-y-6">
      <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />

      <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        <Link
          to="/colaborador/empresas"
          className="group inline-flex items-center gap-1 font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Empresas
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <Link
          to={`/colaborador/empresas/${empresaId}/personal`}
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {empresaNombre}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="font-medium text-gray-800 dark:text-gray-200">Legajo</span>
      </nav>

      {msg && (
        <div
          role="status"
          className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100"
        >
          {msg}
        </div>
      )}

      {/* Estado de gestiones — arriba, ancho completo, cambio de módulo y régimen CAJA rápido */}
      <section
        className={`overflow-hidden rounded-2xl border border-gray-200/90 bg-gradient-to-br from-white via-gray-50/80 to-white shadow-sm dark:border-gray-700/90 dark:from-gray-900/80 dark:via-gray-900/50 dark:to-gray-900/80 ${motionStagger}`}
        style={{ animationDelay: `${staggerDelayMs(0)}ms` }}
      >
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800 md:px-5 md:py-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Estado de gestiones</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">CAJA: elige régimen antes de subir.</p>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth p-3 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] md:grid md:snap-none md:grid-cols-3 md:gap-4 md:overflow-visible md:p-4 md:pb-4">
          <button
            type="button"
            onClick={() => {
              setTab('afp')
              setMsg(null)
            }}
            className={clsx(
              'flex min-w-[min(100%,288px)] shrink-0 snap-center flex-col rounded-xl border-2 bg-white/90 p-3 text-left shadow-sm transition-all duration-200 active:scale-[0.99] dark:bg-gray-900/60 motion-reduce:active:scale-100 md:min-w-0',
              tab === 'afp'
                ? 'border-primary-500 ring-2 ring-primary-500/25 dark:border-primary-500'
                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">AFP</span>
              {estadoBadgeModulo(afp?.estado)}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-primary-500 transition-[width] duration-300"
                style={{ width: `${progressFromEstado(afp?.estado)}%` }}
              />
            </div>
          </button>

          <div
            className={clsx(
              'flex min-w-[min(100%,288px)] shrink-0 snap-center flex-col rounded-xl border-2 bg-white/90 p-3 shadow-sm dark:bg-gray-900/60 md:min-w-0',
              tab === 'caja'
                ? 'border-teal-500 ring-2 ring-teal-500/25 dark:border-teal-500'
                : 'border-transparent'
            )}
          >
            <button
              type="button"
              onClick={() => {
                setTab('caja')
                setMsg(null)
              }}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">CAJA</span>
              {estadoBadgeModulo(caja?.estado)}
            </button>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-teal-500 transition-[width] duration-300"
                style={{ width: `${progressFromEstado(caja?.estado)}%` }}
              />
            </div>
            <div
              className="mt-3 rounded-xl bg-gray-100 p-1 dark:bg-gray-800/90"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  disabled={cajaRegimenSaving || !canEditPersonal}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectCajaRegimen('nacional')
                  }}
                  className={clsx(
                    'rounded-lg py-2 text-[11px] font-bold uppercase tracking-wide transition disabled:opacity-50',
                    cajaRegimen === 'nacional'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-700/80'
                  )}
                >
                  Nacional
                </button>
                <button
                  type="button"
                  disabled={cajaRegimenSaving || !canEditPersonal}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectCajaRegimen('petrolera')
                  }}
                  className={clsx(
                    'rounded-lg py-2 text-[11px] font-bold uppercase tracking-wide transition disabled:opacity-50',
                    cajaRegimen === 'petrolera'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-700/80'
                  )}
                >
                  Petrolera
                </button>
              </div>
            </div>
            {cajaRegimenSaving ? (
              <p className="mt-2 text-center text-[10px] text-gray-500">Guardando…</p>
            ) : !cajaRegimen ? (
              <p className="mt-2 text-center text-[10px] text-amber-700 dark:text-amber-300/90">Elige régimen para cargar tipos</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setTab('ministerio')
              setMsg(null)
            }}
            className={clsx(
              'flex min-w-[min(100%,288px)] shrink-0 snap-center flex-col rounded-xl border-2 bg-white/90 p-3 text-left shadow-sm transition-all duration-200 active:scale-[0.99] dark:bg-gray-900/60 motion-reduce:active:scale-100 md:min-w-0',
              tab === 'ministerio'
                ? 'border-amber-500 ring-2 ring-amber-500/25 dark:border-amber-500'
                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Min. trabajo
              </span>
              {estadoBadgeModulo(mt?.estado)}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
                style={{ width: `${progressFromEstado(mt?.estado)}%` }}
              />
            </div>
          </button>
        </div>
      </section>

      <div className={`grid gap-6 lg:grid-cols-[minmax(280px,320px)_1fr] ${motionStagger}`} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
        {/* Columna identidad (mockup personal-card) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-primary-500/30 bg-gradient-to-br from-primary-500/25 to-violet-500/25 text-xl font-bold text-primary-800 dark:text-primary-200">
                {iniciales}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h1 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">{nombreCompleto}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CI {empleado.ci ?? '—'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canEditPersonal ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<Pencil className="h-3.5 w-3.5" />}
                        onClick={() => {
                          resetPersona({
                            nombres: empleado.nombres ?? '',
                            apellidos: empleado.apellidos ?? '',
                            ci: empleado.ci ?? '',
                            fecha_ingreso: isoToDateInput(empleado.fecha_ingreso),
                            correo_electronico: empleado.correo_electronico ?? '',
                            cuenta_bancaria: empleado.cuenta_bancaria ?? '',
                          })
                          setContactosReferencia(
                            (empleado.contactos_referencia ?? []).slice(0, 3).length
                              ? (empleado.contactos_referencia ?? []).slice(0, 3)
                              : ['', '']
                          )
                          setEditPersonaOpen(true)
                        }}
                      >
                        Editar legajo
                      </Button>
                    ) : null}
                    {canEditEmpresa && empresaCliente ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<Building2 className="h-3.5 w-3.5" />}
                        onClick={() => {
                          resetEmpresa({
                            nombre: empresaCliente.nombre ?? '',
                            nit: empresaCliente.nit ?? '',
                            razon_social: empresaCliente.razon_social ?? '',
                            ciudad: empresaCliente.ciudad ?? '',
                            departamento: empresaCliente.departamento ?? '',
                            direccion: empresaCliente.direccion ?? '',
                            telefono: empresaCliente.telefono ?? '',
                            correo_empresa: empresaCliente.correo_empresa ?? '',
                            actividad_economica: empresaCliente.actividad_economica ?? '',
                            matricula_comercio: empresaCliente.matricula_comercio ?? '',
                            rep_legal_nombres: empresaCliente.rep_legal_nombres ?? '',
                            rep_legal_apellidos: empresaCliente.rep_legal_apellidos ?? '',
                            rep_legal_ci: empresaCliente.rep_legal_ci ?? '',
                            observaciones: empresaCliente.observaciones ?? '',
                          })
                          setEditEmpresaOpen(true)
                        }}
                      >
                        Editar empresa
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200">
                    {empleado.estado === 'inactivo' ? 'Inactivo' : 'Activo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-0 border-t border-gray-100 pt-4 dark:border-gray-800">
              {[
                ['Carnet de identidad', empleado.ci ?? '—', CreditCard],
                ['Empresa', empresaNombre, LayoutGrid],
                ['Ingreso', formatFecha(empleado.fecha_ingreso), User],
                ['Correo electrónico', empleado.correo_electronico ?? '—', Mail],
                ['Cuenta bancaria', empleado.cuenta_bancaria ?? '—', Landmark],
              ].map(([k, v, Icon]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 border-b border-gray-100 py-2.5 text-sm last:border-0 dark:border-gray-800"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
                    {k}
                  </span>
                  <span className="max-w-[60%] text-right font-medium text-gray-900 dark:text-gray-100">{v}</span>
                </div>
              ))}
              <div className="border-b border-gray-100 py-2.5 text-sm last:border-0 dark:border-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Contactos de referencia
                </span>
                <div className="mt-2 space-y-1 font-medium text-gray-900 dark:text-gray-100">
                  {(empleado.contactos_referencia ?? []).length > 0 ? (
                    (empleado.contactos_referencia ?? []).map((c, idx) => (
                      <p key={`${idx}-${c}`} className="truncate">{c}</p>
                    ))
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2 text-xs">
                {[
                  ['Curriculum', empleado.curriculum_archivo_url, empleado.curriculum_archivo_nombre],
                  ['Licencia', empleado.licencia_conducir_archivo_url, empleado.licencia_conducir_archivo_nombre],
                  ['Aviso luz/agua', empleado.aviso_luz_agua_archivo_url, empleado.aviso_luz_agua_archivo_nombre],
                  ['Croquis', empleado.croquis_archivo_url, empleado.croquis_archivo_nombre],
                ].map(([label, url, nombre]) => (
                  <a
                    key={label}
                    href={url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      'rounded-lg border px-2.5 py-2 text-center font-medium',
                      url
                        ? 'border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300 dark:hover:bg-primary-950/30'
                        : 'cursor-default border-gray-200 text-gray-400 dark:border-gray-700'
                    )}
                  >
                    {label}: {url ? nombre || 'Ver archivo' : 'Sin archivo'}
                  </a>
                ))}
              </div>
            </div>

            <Link
              to={`/colaborador/empresas/${empresaId}/personal`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al personal
            </Link>
          </div>
        </div>

        {/* Columna módulos y documentos */}
        <div className="min-w-0">
          <div
            className="-mx-1 mb-2 flex gap-0 overflow-x-auto overscroll-x-contain scroll-smooth border-b-2 border-gray-200 [scrollbar-width:thin] dark:border-gray-700 md:mx-0 md:flex-wrap md:overflow-visible"
            role="tablist"
            aria-label="Módulos AFP, CAJA, Ministerio"
          >
            {MODULOS.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={tab === m.key}
                onClick={() => {
                  setTab(m.key)
                  setMsg(null)
                }}
                className={clsx(
                  'flex shrink-0 items-center gap-2 border-b-[3px] px-3 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 sm:px-4',
                  tab === m.key
                    ? `-mb-0.5 ${m.tabActive}`
                    : '-mb-0.5 border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <FileText className="h-4 w-4 shrink-0 opacity-80" />
                {m.label}
              </button>
            ))}
          </div>

          {tab === 'caja' && !cajaRegimen && (
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={cajaRegimenSaving || !canEditPersonal}
                onClick={() => onSelectCajaRegimen('nacional')}
                className="group flex flex-col items-start rounded-2xl border-2 border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-teal-700"
              >
                <span className="text-sm font-bold text-gray-900 dark:text-white">Caja Nacional</span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">04-03 CNS</span>
              </button>
              <button
                type="button"
                disabled={cajaRegimenSaving || !canEditPersonal}
                onClick={() => onSelectCajaRegimen('petrolera')}
                className="group flex flex-col items-start rounded-2xl border-2 border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-teal-700"
              >
                <span className="text-sm font-bold text-gray-900 dark:text-white">Caja Petrolera</span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Cuatro trámites</span>
              </button>
            </div>
          )}

          {tab === 'caja' && cajaRegimen === 'petrolera' && tiposOrdenados.length > 1 && (
            <div className="mb-4 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [scrollbar-width:thin]">
              {tiposOrdenados.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPetroleraStep(i)}
                  className={clsx(
                    'flex min-w-[5.5rem] shrink-0 snap-center flex-col items-center rounded-xl border px-2.5 py-2 text-center transition sm:min-w-[6.75rem]',
                    petroleraStep === i
                      ? 'border-teal-500 bg-teal-50 shadow-sm dark:border-teal-500 dark:bg-teal-950/35'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-gray-600'
                  )}
                >
                  <span
                    className={clsx(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                      petroleraStep === i
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-tight text-gray-800 dark:text-gray-100">
                    {tituloPasoPetrolera(t.nombre)}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{modCfg.longLabel}</h2>
              {tab === 'caja' && cajaRegimen === 'petrolera' ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Paso en la barra superior.</p>
              ) : null}
            </div>
            {loadingDocs ? (
              <span className="text-xs text-gray-500">Actualizando lista…</span>
            ) : (
              estadoBadgeModulo(
                tab === 'afp' ? afp?.estado : tab === 'caja' ? caja?.estado : mt?.estado
              )
            )}
          </div>

          {!loadingTipos && tipos.length > 0 && (tab !== 'caja' || cajaRegimen) ? (
            <input
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Nota al subir (opcional)"
              className="input mt-4 w-full max-w-md text-sm"
            />
          ) : null}

          {loadingTipos ? (
            <div className="mt-8 flex justify-center py-12">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : tab === 'caja' && !cajaRegimen ? null : tipos.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500 dark:border-gray-700">
              Sin tipos en el catálogo (consultora) o falta elegir régimen en CAJA.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {tiposVisible.map((tipo) => {
                const list = docsByTipo.get(tipo.id) ?? []
                const vigente = documentoVigente(list)
                const formatos = tipo.formatos_permitidos || 'pdf, jpg, png, xlsx…'
                const maxMb = tipo.tamano_maximo_mb ?? 10
                const busy = uploadingTipoId === tipo.id
                const uploadDisabled = busy || !canEditPersonal

                return (
                  <div
                    key={tipo.id}
                    className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/40 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <h3 className="min-w-0 flex-1 font-semibold text-gray-900 dark:text-white">{tipo.nombre}</h3>
                      {tipo.obligatorio ? (
                        <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                          Obligatorio
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Opcional
                        </span>
                      )}
                    </div>
                    {tipo.descripcion ? (
                      <p className="mt-1.5 text-xs leading-snug text-gray-500 dark:text-gray-400">{tipo.descripcion}</p>
                    ) : null}

                    {vigente ? (
                      <div
                        className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/90 p-3 dark:border-gray-800 dark:bg-gray-800/30 sm:flex-row sm:items-center sm:gap-4"
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onDrop={(e) => onDropArchivo(e, tipo.id)}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold uppercase ${extClass(vigente.formato)}`}
                        >
                          {String(vigente.formato || 'file').slice(0, 3)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {vigente.nombre_original ?? tipo.nombre}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFecha(vigente.fecha_subida)} · {formatBytes(vigente.tamano_bytes)}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={uploadDisabled}
                          onClick={() => openFilePicker(tipo.id)}
                          className={clsx(
                            'inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 sm:min-h-0',
                            modCfg.btn
                          )}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {busy ? 'Subiendo…' : 'Reemplazar'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadDisabled}
                        onClick={() => openFilePicker(tipo.id)}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onDrop={(e) => onDropArchivo(e, tipo.id)}
                        className={clsx(
                          'mt-4 flex min-h-[7rem] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 py-8 transition dark:border-gray-600 sm:min-h-0',
                          uploadDisabled ? 'cursor-not-allowed opacity-50' : `cursor-pointer ${modCfg.zoneHover}`,
                          busy && 'cursor-wait'
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Upload className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {busy ? 'Subiendo…' : 'Subir archivo'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatos} · máx. {maxMb} MB
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={editPersonaOpen}
        onClose={() => setEditPersonaOpen(false)}
        title="Editar datos del trabajador"
        size="lg"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={onSavePersona} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Actualiza el legajo básico y, si necesitas, reemplaza documentos del expediente personal.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Nombres"
              {...regPersona('nombres', { required: 'Obligatorio' })}
              error={personaFs.errors.nombres?.message}
            />
            <Input
              label="Apellidos"
              {...regPersona('apellidos', { required: 'Obligatorio' })}
              error={personaFs.errors.apellidos?.message}
            />
            <Input
              label="Carnet de identidad"
              leftIcon={<CreditCard className="h-4 w-4" />}
              {...regPersona('ci', { required: 'Obligatorio' })}
              error={personaFs.errors.ci?.message}
            />
            <Input label="Correo electrónico" type="email" {...regPersona('correo_electronico')} />
            <Input
              label="Cuenta bancaria"
              leftIcon={<Landmark className="h-4 w-4" />}
              {...regPersona('cuenta_bancaria')}
            />
            <Input label="Fecha de ingreso" type="date" {...regPersona('fecha_ingreso', { required: 'Obligatorio' })} />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contactos de referencia (máx. 3)
              </label>
              <div className="space-y-2">
                {contactosReferencia.map((valor, idx) => (
                  <Input
                    key={`contacto-ref-${idx}`}
                    label={`Contacto ${idx + 1}`}
                    value={valor}
                    onChange={(e) => {
                      const next = [...contactosReferencia]
                      next[idx] = e.target.value
                      setContactosReferencia(next)
                    }}
                  />
                ))}
                {contactosReferencia.length < 3 ? (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setContactosReferencia((prev) => [...prev, ''])}>
                    Adicionar contacto
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="sm:col-span-2 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reemplazar curriculum
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCurriculumFile(e.target.files?.[0] ?? null)}
                  className="input w-full py-2.5"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reemplazar licencia (opcional)
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
                  Reemplazar aviso luz/agua
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setAvisoFile(e.target.files?.[0] ?? null)}
                  className="input w-full py-2.5"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reemplazar croquis
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCroquisFile(e.target.files?.[0] ?? null)}
                  className="input w-full py-2.5"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditPersonaOpen(false)} disabled={savingPersona}>
              Cancelar
            </Button>
            <Button type="submit" disabled={savingPersona}>
              {savingPersona ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editEmpresaOpen}
        onClose={() => setEditEmpresaOpen(false)}
        title="Editar ficha de empresa"
        size="lg"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6 max-h-[85vh] overflow-y-auto"
      >
        <form onSubmit={onSaveEmpresa} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Datos generales visibles en legajos. El acceso al portal de la empresa se administra desde la
            consultora.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nombre comercial" {...regEmpresa('nombre', { required: 'Obligatorio' })} error={empresaFs.errors.nombre?.message} />
            <Input label="NIT" {...regEmpresa('nit', { required: 'Obligatorio' })} error={empresaFs.errors.nit?.message} />
            <div className="sm:col-span-2">
              <Input label="Razón social" {...regEmpresa('razon_social')} />
            </div>
            <Input label="Ciudad" {...regEmpresa('ciudad')} />
            <Input label="Departamento" {...regEmpresa('departamento')} />
            <div className="sm:col-span-2">
              <Input label="Dirección" {...regEmpresa('direccion')} />
            </div>
            <Input label="Teléfono" {...regEmpresa('telefono')} />
            <Input label="Correo empresa" type="email" {...regEmpresa('correo_empresa')} />
            <Input label="Actividad económica" {...regEmpresa('actividad_economica')} />
            <Input label="Matrícula comercio" {...regEmpresa('matricula_comercio')} />
            <Input label="Representante — nombres" {...regEmpresa('rep_legal_nombres')} />
            <Input label="Representante — apellidos" {...regEmpresa('rep_legal_apellidos')} />
            <Input label="Representante — CI" {...regEmpresa('rep_legal_ci')} />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
              <textarea className="input min-h-[5rem] w-full py-2" {...regEmpresa('observaciones')} />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditEmpresaOpen(false)} disabled={savingEmpresa}>
              Cancelar
            </Button>
            <Button type="submit" disabled={savingEmpresa}>
              {savingEmpresa ? 'Guardando…' : 'Guardar empresa'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </ColaboradorShell>
  )
}
