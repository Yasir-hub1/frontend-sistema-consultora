import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Briefcase,
  ChevronRight,
  FileText,
  LayoutGrid,
  Mail,
  Phone,
  Upload,
  User,
} from 'lucide-react'
import { colaboradorService } from '../../services/colaboradorService'

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

export default function ColaboradorEmpleadoGestion() {
  const { empresaId, personalId } = useParams()
  const [tab, setTab] = useState('afp')
  const [empleado, setEmpleado] = useState(null)
  const [tipos, setTipos] = useState([])
  const [docs, setDocs] = useState([])
  const [msg, setMsg] = useState(null)
  const [loadingPersona, setLoadingPersona] = useState(true)
  const [loadingTipos, setLoadingTipos] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [uploadingTipoId, setUploadingTipoId] = useState(null)
  const [periodo, setPeriodo] = useState('')
  const [observacion, setObservacion] = useState('')

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
      setLoadingTipos(true)
      const res = await colaboradorService.listTiposDocumentoModulo(tab)
      if (c) return
      setTipos(res.success ? res.data : [])
      if (!res.success) setMsg(res.message)
      setLoadingTipos(false)
    })()
    return () => {
      c = true
    }
  }, [tab])

  const docsByTipo = useMemo(() => {
    const m = new Map()
    for (const d of docs) {
      const tid = d.tipo_documento_id
      if (tid == null) continue
      if (!m.has(tid)) m.set(tid, [])
      m.get(tid).push(d)
    }
    return m
  }, [docs])

  const openFilePicker = (tipoId) => {
    setPendingTipoId(tipoId)
    fileRef.current?.click()
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    const tipoId = pendingTipoId
    e.target.value = ''
    setPendingTipoId(null)
    if (!file || tipoId == null) return

    const fd = new FormData()
    fd.append('archivo', file)
    fd.append('tipo_documento_id', String(tipoId))
    if (periodo.trim()) fd.append('periodo', periodo.trim())
    if (observacion.trim()) fd.append('observacion', observacion.trim())

    setMsg(null)
    setUploadingTipoId(tipoId)
    const res = await colaboradorService.subirDocumento(empresaId, personalId, tab, fd)
    setUploadingTipoId(null)
    if (res.success) {
      setMsg('Documento guardado correctamente.')
      await loadDocs()
      const r = await colaboradorService.getPersonal(empresaId, personalId)
      if (r.success) setEmpleado(r.data)
    } else {
      setMsg(res.message)
    }
  }

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

  if (loadingPersona && !empleado) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando legajo…</p>
      </div>
    )
  }

  if (!empleado) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
        {msg || 'No se encontró el personal.'}
        <div className="mt-4">
          <Link to={`/colaborador/empresas/${empresaId}/personal`} className="font-medium text-primary-600 dark:text-primary-400">
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />

      <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        <Link
          to="/colaborador/empresas"
          className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
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

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,320px)_1fr]">
        {/* Columna identidad (mockup personal-card) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-primary-500/30 bg-gradient-to-br from-primary-500/25 to-violet-500/25 text-xl font-bold text-primary-800 dark:text-primary-200">
                {iniciales}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{nombreCompleto}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">CI {empleado.ci ?? '—'}</p>
                <div className="mt-2">
                  <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200">
                    {empleado.estado === 'inactivo' ? 'Inactivo' : 'Activo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-0 border-t border-gray-100 pt-4 dark:border-gray-800">
              {[
                ['Cargo', empleado.cargo ?? '—', Briefcase],
                ['Empresa', empresaNombre, LayoutGrid],
                ['Ingreso', formatFecha(empleado.fecha_ingreso), User],
                ['Salario', empleado.salario_mensual != null ? `Bs. ${empleado.salario_mensual}` : '—', null],
                ['Teléfono', empleado.telefono ?? '—', Phone],
                ['Correo', empleado.correo ?? '—', Mail],
                ['AFP', afp?.afp_nombre ?? '—', FileText],
                ['Nº AFP', afp?.numero_afiliado ?? '—', FileText],
                ['CAJA', caja?.caja_nombre ?? '—', FileText],
                ['Nº asegurado', caja?.numero_asegurado ?? '—', FileText],
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
            </div>

            <Link
              to={`/colaborador/empresas/${empresaId}/personal`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al personal
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-700/90 dark:bg-gray-900/50">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Estado de gestiones</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Resumen según cumplimiento registrado en cada módulo.
            </p>
            <div className="mt-4 space-y-3">
              {[
                ['AFP', afp?.estado, 'bg-primary-500'],
                ['CAJA', caja?.estado, 'bg-teal-500'],
                ['Min. Trabajo', mt?.estado, 'bg-amber-500'],
              ].map(([label, estado, bar]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-bold text-gray-600 dark:text-gray-300">{label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${bar}`}
                      style={{ width: `${progressFromEstado(estado)}%` }}
                    />
                  </div>
                  {estadoBadgeModulo(estado)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna módulos y documentos */}
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1 border-b-2 border-gray-200 dark:border-gray-700">
            {MODULOS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  setTab(m.key)
                  setMsg(null)
                }}
                className={[
                  'flex items-center gap-2 border-b-[3px] px-4 py-3 text-sm font-semibold transition',
                  tab === m.key
                    ? `-mb-0.5 ${m.tabActive}`
                    : '-mb-0.5 border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                ].join(' ')}
              >
                <FileText className="h-4 w-4 opacity-80" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/30 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="doc-periodo" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Período (si el tipo es periódico)
              </label>
              <input
                id="doc-periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="Ej. Marzo 2026"
                className="input mt-1 w-full"
              />
            </div>
            <div className="flex-[2]">
              <label htmlFor="doc-obs" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Observación para la próxima carga
              </label>
              <input
                id="doc-obs"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Nota interna opcional"
                className="input mt-1 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{modCfg.longLabel}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Cada bloque corresponde a un tipo de documento del catálogo. Sube el archivo que corresponda; el
                sistema marca la versión vigente.
              </p>
            </div>
            {loadingDocs ? (
              <span className="text-xs text-gray-500">Actualizando lista…</span>
            ) : (
              estadoBadgeModulo(
                tab === 'afp' ? afp?.estado : tab === 'caja' ? caja?.estado : mt?.estado
              )
            )}
          </div>

          {loadingTipos ? (
            <div className="mt-8 flex justify-center py-12">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : tipos.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500 dark:border-gray-700">
              No hay tipos de documento configurados para este módulo. Pide a la consultora que active el catálogo.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {tipos.map((tipo) => {
                const list = docsByTipo.get(tipo.id) ?? []
                const formatos = tipo.formatos_permitidos || 'pdf, jpg, png, xlsx…'
                const maxMb = tipo.tamano_maximo_mb ?? 10
                const busy = uploadingTipoId === tipo.id

                return (
                  <div
                    key={tipo.id}
                    className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/40"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{tipo.nombre}</h3>
                          {tipo.obligatorio ? (
                            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                              Obligatorio
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              Opcional
                            </span>
                          )}
                          {tipo.es_periodico ? (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                              Periódico
                            </span>
                          ) : null}
                        </div>
                        {tipo.descripcion ? (
                          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            {tipo.descripcion}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openFilePicker(tipo.id)}
                        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-60 ${modCfg.btn}`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {busy ? 'Subiendo…' : 'Subir'}
                      </button>
                    </div>

                    {list.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {list.map((d) => (
                          <li
                            key={d.id}
                            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/40"
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold uppercase ${extClass(d.formato)}`}
                            >
                              {String(d.formato || 'file').slice(0, 3)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {d.nombre_original ?? d.tipo_documento?.nombre ?? 'Documento'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFecha(d.fecha_subida)} · {formatBytes(d.tamano_bytes)}
                                {d.periodo ? ` · ${d.periodo}` : ''}
                                {d.es_vigente ? ' · Vigente' : ''}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openFilePicker(tipo.id)}
                      className={[
                        'mt-4 w-full rounded-2xl border-2 border-dashed border-gray-300 py-8 text-center transition dark:border-gray-600',
                        modCfg.zoneHover,
                        busy ? 'cursor-wait opacity-60' : 'cursor-pointer',
                      ].join(' ')}
                    >
                      <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                        <Upload className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {list.length ? 'Añadir otra versión' : 'Arrastra o haz clic para subir'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Formatos: {formatos} — máx. {maxMb} MB
                      </p>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
