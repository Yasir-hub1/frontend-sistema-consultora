import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FileUp,
  Hash,
  CreditCard,
  Landmark,
  Gift,
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
import { formatCurrency } from '../../utils/formatters'
import {
  colaboradorPuedeCargarAlgunaDeclaracionMensual,
  colaboradorPuedeCargarDeclaracionAguinaldo,
  colaboradorPuedeCargarDeclaracionMensualEnModulo,
  colaboradorPuedeGestionarOtrosDocumentosEmpresa,
  colaboradorPuedeRegistrarPersonal,
} from '../../utils/colaboradorPermisos'
import { clsx } from 'clsx'
import { sanitizeUiMessage } from '../../utils/uiMessage'

/** Campos de monto aplicables por módulo (alineado con el backend). */
const DECLARACION_CAMPOS_POR_MODULO = {
  afp: ['monto_aportes_gestoras', 'monto_aporte_solidario_gestora'],
  caja: ['monto_deposito_cns'],
  ministerio: [
    'monto_total_ganado',
    'monto_planilla_mensual_mdt',
    'monto_seprec_registro_poder_consultora',
  ],
}

const DECLARACION_LABELS = {
  monto_total_ganado: 'Total ganado',
  monto_deposito_cns: 'Depósito CNS',
  monto_aportes_gestoras: 'Aportes Gestoras',
  monto_aporte_solidario_gestora: 'Aporte solidario Gestora',
  monto_planilla_mensual_mdt: 'Planilla MDT (Mensual)',
  monto_seprec_registro_poder_consultora: 'SEPREC registro de poder a consultora',
}

function etiquetaModuloDeclaracion(mod) {
  const m = String(mod || '').toLowerCase()
  if (m === 'afp') return 'AFP'
  if (m === 'caja') return 'CAJA'
  if (m === 'ministerio') return 'Ministerio de Trabajo'
  return String(mod || '').toUpperCase()
}

/** PDF por MIME o, si el navegador no informa tipo, por extensión .pdf */
function isPdfFile(file) {
  if (!file || !(file instanceof File)) return false
  if (file.type === 'application/pdf') return true
  if (file.type && file.type !== 'application/pdf') return false
  return String(file.name || '').toLowerCase().endsWith('.pdf')
}

function isImageOrPdfFile(file) {
  if (!file || !(file instanceof File)) return false
  if (file.type === 'application/pdf') return true
  if (file.type.startsWith('image/')) return true
  const n = String(file.name || '').toLowerCase()
  return /\.(pdf|png|jpe?g|webp)$/i.test(n)
}

function pickPdfOnly(setFile) {
  return (e) => {
    const f = e.target.files?.[0] ?? null
    if (f && !isPdfFile(f)) {
      toast.error('Solo se permiten archivos PDF.')
      e.target.value = ''
      setFile(null)
      return
    }
    setFile(f)
  }
}

function pickImageOrPdf(setFile) {
  return (e) => {
    const f = e.target.files?.[0] ?? null
    if (f && !isImageOrPdfFile(f)) {
      toast.error('Solo se permiten archivos PDF o imagen.')
      e.target.value = ''
      setFile(null)
      return
    }
    setFile(f)
  }
}

function resumenMontosDeclaracionFila(row) {
  const m = String(row.modulo || '').toLowerCase()
  const keys = DECLARACION_CAMPOS_POR_MODULO[m] ?? []
  const partes = []
  for (const k of keys) {
    const v = row[k]
    if (v === null || v === undefined || v === '') continue
    const n = Number(v)
    if (Number.isNaN(n)) continue
    partes.push(`${DECLARACION_LABELS[k]}: ${formatCurrency(n)}`)
  }
  return partes
}

const DECL_MODULOS = ['afp', 'caja', 'ministerio']

const DECL_MODULO_META = {
  afp: { titulo: 'AFP', descripcion: 'Aportes a gestoras', icon: CreditCard, ring: 'ring-violet-500/30' },
  caja: { titulo: 'CAJA', descripcion: 'Depósito CNS y afines', icon: Building2, ring: 'ring-sky-500/30' },
  ministerio: {
    titulo: 'Ministerio de Trabajo',
    descripcion: 'Total ganado, MDT mensual y SEPREC',
    icon: Landmark,
    ring: 'ring-amber-500/30',
  },
}

function crearMontosVaciosModulo(modulo) {
  const o = {}
  for (const k of DECLARACION_CAMPOS_POR_MODULO[modulo] ?? []) {
    o[k] = ''
  }
  return o
}

function borradoresDeclaracionIniciales() {
  return {
    afp: { file: null, montos: crearMontosVaciosModulo('afp') },
    caja: { file: null, montos: crearMontosVaciosModulo('caja') },
    ministerio: { file: null, montos: crearMontosVaciosModulo('ministerio') },
  }
}

/** Rellena montos desde el historial para el mes (no asigna archivos). */
function mergeMontosDesdeHistorial(mesGestion, rows) {
  const next = borradoresDeclaracionIniciales()
  for (const r of rows) {
    if (r.mes_gestion !== mesGestion) continue
    const mod = r.modulo
    if (!next[mod]) continue
    for (const k of DECLARACION_CAMPOS_POR_MODULO[mod] ?? []) {
      const v = r[k]
      if (v != null && v !== '') next[mod].montos[k] = String(v)
    }
  }
  return next
}

function estadoBorradorModulo(borrador) {
  if (borrador.file) return 'listo'
  const tieneMontos = Object.values(borrador.montos).some((v) => v !== '' && v != null)
  if (tieneMontos) return 'falta_archivo'
  return 'vacio'
}

const ORDEN_MODULOS = { afp: 1, caja: 2, ministerio: 3 }

function agruparDeclaracionesPorMes(rows) {
  const map = new Map()
  for (const row of rows) {
    const key = row.mes_gestion || `${row.anio}-${String(row.mes).padStart(2, '0')}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        periodo_label: row.periodo_label,
        ultima_fecha_subida: row.fecha_subida || null,
        items: [],
      })
    }
    const grupo = map.get(key)
    grupo.items.push(row)
    if (!grupo.ultima_fecha_subida || (row.fecha_subida && row.fecha_subida > grupo.ultima_fecha_subida)) {
      grupo.ultima_fecha_subida = row.fecha_subida
    }
  }
  return Array.from(map.values())
    .map((g) => ({
      ...g,
      items: g.items.sort((a, b) => (ORDEN_MODULOS[a.modulo] ?? 99) - (ORDEN_MODULOS[b.modulo] ?? 99)),
    }))
    .sort((a, b) => {
      if (a.ultima_fecha_subida && b.ultima_fecha_subida) {
        return b.ultima_fecha_subida.localeCompare(a.ultima_fecha_subida)
      }
      return b.key.localeCompare(a.key)
    })
}

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

function anioGestionActual() {
  return new Date().getFullYear()
}

export default function ColaboradorPersonalLista() {
  const { user } = useAuth()
  const { empresaId } = useParams()
  const canRegistrarPersonal = colaboradorPuedeRegistrarPersonal(user)
  const canGestionarOtrosDocumentos = colaboradorPuedeGestionarOtrosDocumentosEmpresa(user)
  const canSubirDeclaracionMensual = colaboradorPuedeCargarAlgunaDeclaracionMensual(user)
  const canSubirDeclaracionAguinaldo = colaboradorPuedeCargarDeclaracionAguinaldo(user)
  const [rows, setRows] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [stats, setStats] = useState({ total_personal: 0 })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [masivoModalOpen, setMasivoModalOpen] = useState(false)
  const [downloadingPlantilla, setDownloadingPlantilla] = useState(false)
  const [uploadingPlantilla, setUploadingPlantilla] = useState(false)
  const [archivoMasivo, setArchivoMasivo] = useState(null)
  const [resumenMasivo, setResumenMasivo] = useState(null)
  const [contactosReferencia, setContactosReferencia] = useState(['', ''])
  const [curriculumFile, setCurriculumFile] = useState(null)
  const [licenciaFile, setLicenciaFile] = useState(null)
  const [avisoFile, setAvisoFile] = useState(null)
  const [croquisFile, setCroquisFile] = useState(null)
  const [certNacimientoFile, setCertNacimientoFile] = useState(null)
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
  const [declBorradores, setDeclBorradores] = useState(borradoresDeclaracionIniciales)
  const [declFormCollapsed, setDeclFormCollapsed] = useState(true)
  const [declDetalleMesOpen, setDeclDetalleMesOpen] = useState(null)
  const [declUploading, setDeclUploading] = useState(false)
  const declRowsRef = useRef(declRows)
  declRowsRef.current = declRows
  const [preview, setPreview] = useState(null)
  const [previewLoadingId, setPreviewLoadingId] = useState(null)
  const [registroLegajoPreview, setRegistroLegajoPreview] = useState(null)

  const [aguiModalOpen, setAguiModalOpen] = useState(false)
  const [aguiRows, setAguiRows] = useState([])
  const [aguiLoading, setAguiLoading] = useState(false)
  const [aguiAnio, setAguiAnio] = useState(() => anioGestionActual())
  const [aguiUploading, setAguiUploading] = useState(false)
  const aguiFileRef = useRef(null)
  const [aguiPreviewLoadingId, setAguiPreviewLoadingId] = useState(null)

  const [otrosDocsModalOpen, setOtrosDocsModalOpen] = useState(false)
  const [otrosDocsRows, setOtrosDocsRows] = useState([])
  const [otrosDocsLoading, setOtrosDocsLoading] = useState(false)
  const [otrosDocFile, setOtrosDocFile] = useState(null)
  const [otrosDocDescripcion, setOtrosDocDescripcion] = useState('')
  const [otrosDocUploading, setOtrosDocUploading] = useState(false)
  const [otrosDocPreviewLoadingId, setOtrosDocPreviewLoadingId] = useState(null)

  const closeDeclModal = () => {
    setDeclModalOpen(false)
    setDeclMes(mesGestionActual())
    setDeclBorradores(borradoresDeclaracionIniciales())
    setDeclFormCollapsed(true)
    setDeclDetalleMesOpen(null)
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

  /**
   * Montos iniciales desde servidor al abrir/cargar o al cambiar el mes.
   * No depende de declRows en el array de deps: si no, tras un guardado parcial se pisarían los PDF aún no enviados.
   */
  useEffect(() => {
    if (!declModalOpen || declLoading) return
    setDeclBorradores(mergeMontosDesdeHistorial(declMes, declRowsRef.current))
  }, [declModalOpen, declLoading, declMes])

  const cargarDeclaraciones = async () => {
    const res = await colaboradorService.listDeclaracionesMensuales(empresaId)
    const items = res.success ? (res.data?.items ?? []) : []
    if (res.success) setDeclRows(items)
    return items
  }

  const onGuardarDeclaracionesMes = async () => {
    const modulosConArchivo = DECL_MODULOS.filter((m) => declBorradores[m].file)
    if (modulosConArchivo.length === 0) {
      toast.error('Agrega al menos un PDF en AFP, CAJA o Ministerio.')
      return
    }
    for (const modulo of modulosConArchivo) {
      const { file } = declBorradores[modulo]
      if (!isPdfFile(file)) {
        toast.error(`${etiquetaModuloDeclaracion(modulo)}: solo se permiten archivos PDF.`)
        return
      }
    }
    const sinPermisoDeclarar = modulosConArchivo.filter(
      (m) => !colaboradorPuedeCargarDeclaracionMensualEnModulo(user, m)
    )
    if (sinPermisoDeclarar.length > 0) {
      toast.error(
        `No tienes permiso para declarar: ${sinPermisoDeclarar.map(etiquetaModuloDeclaracion).join(', ')}. Pídeselo en Mi equipo (Subir documentos o Gestionar módulo).`
      )
      return
    }
    setDeclUploading(true)
    const ok = []
    const fallos = []
    for (const modulo of modulosConArchivo) {
      const { file, montos } = declBorradores[modulo]
      const fd = new FormData()
      fd.append('modulo', modulo)
      fd.append('mes_gestion', declMes)
      fd.append('archivo', file)
      const permitidas = new Set(DECLARACION_CAMPOS_POR_MODULO[modulo] ?? [])
      for (const [k, v] of Object.entries(montos)) {
        if (!permitidas.has(k)) continue
        if (v !== '' && v != null) fd.append(k, v)
      }
      const res = await colaboradorService.subirDeclaracionMensual(empresaId, fd)
      if (res.success) ok.push(modulo)
      else fallos.push({ modulo, message: res.message || 'Error al guardar' })
    }
    setDeclUploading(false)
    const itemsActualizados = await cargarDeclaraciones()
    setDeclBorradores((prev) => {
      const next = { ...prev }
      for (const m of ok) {
        next[m] = { file: null, montos: crearMontosVaciosModulo(m) }
      }
      const merged = mergeMontosDesdeHistorial(declMes, itemsActualizados)
      for (const m of ok) {
        for (const k of Object.keys(next[m].montos)) {
          next[m].montos[k] = merged[m].montos[k] ?? ''
        }
      }
      return next
    })
    if (fallos.length === 0) {
      setDeclMes(mesGestionActual())
      setDeclBorradores(borradoresDeclaracionIniciales())
      setDeclFormCollapsed(true)
      toast.success(
        ok.length === DECL_MODULOS.length
          ? 'Las tres declaraciones del mes se guardaron correctamente.'
          : `Guardado: ${ok.map((m) => etiquetaModuloDeclaracion(m)).join(', ')}.`,
      )
    } else {
      const nombresOk = ok.map((m) => etiquetaModuloDeclaracion(m)).join(', ')
      const nombresMal = fallos.map((f) => etiquetaModuloDeclaracion(f.modulo)).join(', ')
      if (ok.length) toast.success(`Guardado: ${nombresOk}.`)
      toast.error(
        fallos.length === modulosConArchivo.length
          ? fallos[0].message
          : `No se guardó: ${nombresMal}. ${fallos[0].message}`,
      )
    }
  }

  const onLimpiarDeclaraciones = () => {
    setDeclMes(mesGestionActual())
    setDeclBorradores(borradoresDeclaracionIniciales())
    setDeclFormCollapsed(true)
    toast.success('Formulario limpiado.')
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

  const closeAguiModal = () => {
    setAguiModalOpen(false)
    setAguiAnio(anioGestionActual())
    if (aguiFileRef.current) aguiFileRef.current.value = ''
  }

  useEffect(() => {
    if (!aguiModalOpen) return
    let c = false
    ;(async () => {
      setAguiLoading(true)
      const res = await colaboradorService.listDeclaracionesAguinaldo(empresaId)
      if (!c && res.success) setAguiRows(res.data?.items ?? [])
      if (!c) setAguiLoading(false)
    })()
    return () => {
      c = true
    }
  }, [aguiModalOpen, empresaId])

  const cargarAguinaldos = async () => {
    const res = await colaboradorService.listDeclaracionesAguinaldo(empresaId)
    if (res.success) setAguiRows(res.data?.items ?? [])
  }

  const onAguinaldoUpload = async () => {
    const file = aguiFileRef.current?.files?.[0]
    if (!file) {
      toast.error('Selecciona un archivo PDF.')
      return
    }
    if (!isPdfFile(file)) {
      toast.error('Solo se permiten archivos PDF.')
      if (aguiFileRef.current) aguiFileRef.current.value = ''
      return
    }
    const y = Number(aguiAnio)
    if (!Number.isFinite(y) || y < 2000 || y > 2100) {
      toast.error('Indica un año de gestión válido (2000–2100).')
      return
    }
    const fd = new FormData()
    fd.append('anio', String(y))
    fd.append('archivo', file)
    setAguiUploading(true)
    const res = await colaboradorService.subirDeclaracionAguinaldo(empresaId, fd)
    setAguiUploading(false)
    if (res.success) {
      toast.success(`Aguinaldo ${y} guardado.`)
      if (aguiFileRef.current) aguiFileRef.current.value = ''
      await cargarAguinaldos()
    } else {
      toast.error(res.message || 'No se pudo guardar.')
    }
  }

  const onPreviewAguinaldo = async (row) => {
    const kind = previewKindFromFormat(row.formato)
    setAguiPreviewLoadingId(row.id)
    const res = await colaboradorService.fetchDeclaracionAguinaldoVistaPreviaBlob(empresaId, row.id)
    setAguiPreviewLoadingId(null)
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
        toast.error('No se pudo leer el archivo.')
      }
      return
    }
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      const url = URL.createObjectURL(res.blob)
      return { url, kind: kind === 'other' ? 'pdf' : kind, title: row.nombre_original }
    })
  }

  const onDownloadAguinaldo = async (row) => {
    try {
      await colaboradorService.descargarDeclaracionAguinaldo(empresaId, row.id, row.nombre_original)
    } catch {
      toast.error('No se pudo descargar.')
    }
  }

  useEffect(() => {
    if (!otrosDocsModalOpen) return
    let c = false
    ;(async () => {
      setOtrosDocsLoading(true)
      const res = await colaboradorService.listOtrosDocumentosEmpresa(empresaId)
      if (!c && res.success) setOtrosDocsRows(res.data?.items ?? [])
      if (!c) setOtrosDocsLoading(false)
    })()
    return () => {
      c = true
    }
  }, [otrosDocsModalOpen, empresaId])

  const closeOtrosDocsModal = () => {
    setOtrosDocsModalOpen(false)
    setOtrosDocFile(null)
    setOtrosDocDescripcion('')
  }

  const onSubirOtroDocumento = async () => {
    if (!otrosDocFile) {
      toast.error('Selecciona un PDF.')
      return
    }
    if (!isPdfFile(otrosDocFile)) {
      toast.error('Solo se permiten archivos PDF.')
      return
    }
    setOtrosDocUploading(true)
    const res = await colaboradorService.subirOtroDocumentoEmpresa(empresaId, otrosDocFile, otrosDocDescripcion)
    setOtrosDocUploading(false)
    if (res.success) {
      toast.success('Documento guardado.')
      setOtrosDocFile(null)
      setOtrosDocDescripcion('')
      const list = await colaboradorService.listOtrosDocumentosEmpresa(empresaId)
      if (list.success) setOtrosDocsRows(list.data?.items ?? [])
    } else {
      toast.error(res.message || 'No se pudo guardar.')
    }
  }

  const onPreviewOtroDocumento = async (row) => {
    setOtrosDocPreviewLoadingId(row.id)
    const res = await colaboradorService.fetchOtroDocumentoEmpresaVistaPreviaBlob(empresaId, row.id)
    setOtrosDocPreviewLoadingId(null)
    if (!res.success || !res.blob?.size) {
      toast.error(res.message || 'No se pudo mostrar la vista previa.')
      return
    }
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      const url = URL.createObjectURL(res.blob)
      return { url, kind: 'pdf', title: row.nombre_original }
    })
  }

  const onDownloadOtroDocumento = async (row) => {
    try {
      await colaboradorService.descargarOtroDocumentoEmpresa(empresaId, row.id, row.nombre_original)
    } catch {
      toast.error('No se pudo descargar.')
    }
  }

  const declHistorialPorMes = agruparDeclaracionesPorMes(declRows)

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
      fecha_ingreso: new Date().toISOString().slice(0, 10),
    },
  })

  const openRegistroLegajoPreview = (file, title) => {
    setRegistroLegajoPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      if (!file) return null
      const kind = isPdfFile(file) ? 'pdf' : 'image'
      return { url: URL.createObjectURL(file), kind, title: title || file.name }
    })
  }

  const closeRegistroLegajoPreview = () => {
    setRegistroLegajoPreview((p) => {
      if (p?.url) URL.revokeObjectURL(p.url)
      return null
    })
  }

  const closeModal = () => {
    setModalOpen(false)
    reset()
    setContactosReferencia(['', ''])
    setCurriculumFile(null)
    setLicenciaFile(null)
    setAvisoFile(null)
    setCroquisFile(null)
    setCertNacimientoFile(null)
    closeRegistroLegajoPreview()
  }

  const descargarPlantillaMasiva = async () => {
    setDownloadingPlantilla(true)
    const res = await colaboradorService.descargarPlantillaPersonalMasivo(empresaId)
    setDownloadingPlantilla(false)
    if (res.success) {
      setMsg('Plantilla descargada. Los documentos del legajo puedes subirlos después desde el detalle del empleado.')
    } else {
      setMsg(res.message || 'No se pudo descargar la plantilla.')
    }
  }

  const subirPlantillaMasiva = async () => {
    if (!archivoMasivo) {
      setMsg('Selecciona un archivo .xlsx, .xls o .csv.')
      return
    }
    setUploadingPlantilla(true)
    setResumenMasivo(null)
    const res = await colaboradorService.cargarPersonalMasivo(empresaId, archivoMasivo)
    setUploadingPlantilla(false)
    if (res.success) {
      await load()
      const data = res.data || {}
      setResumenMasivo({
        creados: Number(data.creados) || 0,
        procesados: Number(data.procesados) || 0,
        errores: Array.isArray(data.errores) ? data.errores : [],
      })
      setMsg(res.message || 'Carga masiva completada.')
      setArchivoMasivo(null)
    } else {
      setMsg(res.message || 'No se pudo procesar la plantilla.')
    }
  }

  const onCreate = async (data) => {
    setMsg(null)
    const contactos = contactosReferencia.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 3)
    if (contactos.length < 2) {
      setMsg('Debes registrar al menos 2 datos de contacto.')
      return
    }
    const legajoPdfFiles = [curriculumFile, avisoFile, croquisFile, licenciaFile].filter(Boolean)
    if (legajoPdfFiles.some((f) => !isPdfFile(f))) {
      setMsg('Solo se permiten archivos PDF en curriculum, licencia, avisos y croquis.')
      return
    }
    if (certNacimientoFile && !isImageOrPdfFile(certNacimientoFile)) {
      setMsg('El certificado de nacimiento debe ser PDF o imagen (JPG, PNG, WEBP).')
      return
    }
    const fd = new FormData()
    fd.append('nombres', data.nombres)
    fd.append('apellidos', data.apellidos)
    fd.append('ci', data.ci)
    fd.append('cargo', 'Personal')
    fd.append('fecha_ingreso', data.fecha_ingreso)
    if (data.correo_electronico) fd.append('correo_electronico', data.correo_electronico)
    if (data.cuenta_bancaria) fd.append('cuenta_bancaria', data.cuenta_bancaria)
    fd.append('contactos_referencia', JSON.stringify(contactos))
    if (curriculumFile) fd.append('curriculum_archivo', curriculumFile)
    if (licenciaFile) fd.append('licencia_conducir_archivo', licenciaFile)
    if (avisoFile) fd.append('aviso_luz_agua_archivo', avisoFile)
    if (croquisFile) fd.append('croquis_archivo', croquisFile)
    if (certNacimientoFile) fd.append('certificado_nacimiento_archivo', certNacimientoFile)

    const res = await colaboradorService.createPersonal(empresaId, fd)
    if (res.success) {
      closeModal()
      await load()
      setMsg(
        'Personal registrado. Podés completar curriculum, avisos y demás documentos del legajo cuando los tengas; también en AFP, CAJA y Ministerio.'
      )
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
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMsg(null)
                setResumenMasivo(null)
                setArchivoMasivo(null)
                setMasivoModalOpen(true)
              }}
              icon={<Download className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Registro masivo
            </Button>
            <Button
              type="button"
              onClick={() => {
                setMsg(null)
                setModalOpen(true)
              }}
              icon={<UserPlus className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Registrar personal
            </Button>
          </div>
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
          {sanitizeUiMessage(msg)}
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
              <>
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
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="shrink-0 border-amber-200/80 bg-amber-50/90 text-amber-950 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/35 dark:text-amber-100 dark:hover:bg-amber-900/40"
                  icon={<Gift className="h-4 w-4" />}
                  onClick={() => {
                    setAguiAnio(anioGestionActual())
                    setAguiModalOpen(true)
                  }}
                >
                  Declaración anual de aguinaldo
                </Button>
                {canGestionarOtrosDocumentos ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    icon={<FileText className="h-4 w-4" />}
                    onClick={() => setOtrosDocsModalOpen(true)}
                  >
                    Otros documentos (PDF)
                  </Button>
                ) : null}
              </>
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
        isOpen={otrosDocsModalOpen}
        onClose={closeOtrosDocsModal}
        title="Otros documentos de la empresa"
        size="lg"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6 max-h-[85vh] overflow-y-auto"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Subí PDFs generales de esta empresa cliente (no están ligados a un empleado concreto). La descripción es
          opcional y ayuda a identificar el archivo. Podés ver y descargar cada documento como en el resto del portal.
        </p>
        {canGestionarOtrosDocumentos ? (
          <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Archivo PDF</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                if (f && !isPdfFile(f)) {
                  toast.error('Solo se permiten archivos PDF.')
                  e.target.value = ''
                  setOtrosDocFile(null)
                  return
                }
                setOtrosDocFile(f)
              }}
              className="input w-full py-2.5 text-sm"
            />
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Descripción (opcional)
            </label>
            <textarea
              value={otrosDocDescripcion}
              onChange={(e) => setOtrosDocDescripcion(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Ej. Convenio marco 2024, comunicado interno…"
              className="input min-h-[5rem] w-full resize-y py-2.5 text-sm"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => void onSubirOtroDocumento()}
                loading={otrosDocUploading}
                disabled={!otrosDocFile}
                icon={<Upload className="h-4 w-4" />}
              >
                Subir documento
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-800 dark:text-amber-200/90">
            No tienes permiso para subir en esta sección.
          </p>
        )}
        <div className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Documentos cargados
          </p>
          {otrosDocsLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">Cargando…</p>
          ) : otrosDocsRows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-700">
              Aún no hay documentos en esta lista.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/90">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-200">Archivo</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-200">Descripción</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-200">Tamaño</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-200">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
                  {otrosDocsRows.map((row) => (
                    <tr key={row.id}>
                      <td className="max-w-[12rem] px-3 py-2.5">
                        <span className="font-medium text-gray-900 dark:text-white">{row.nombre_original}</span>
                      </td>
                      <td className="max-w-[14rem] px-3 py-2.5 text-gray-600 dark:text-gray-300">
                        {row.descripcion ? (
                          <span className="line-clamp-2 text-sm">{row.descripcion}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-400">
                        {formatBytes(row.tamano_bytes)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            title="Vista previa"
                            disabled={otrosDocPreviewLoadingId === row.id}
                            onClick={() => void onPreviewOtroDocumento(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </button>
                          <button
                            type="button"
                            title="Descargar"
                            onClick={() => void onDownloadOtroDocumento(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-semibold text-primary-800 transition hover:bg-primary-50 dark:border-primary-800 dark:text-primary-200 dark:hover:bg-primary-950/40"
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
        isOpen={declModalOpen}
        onClose={closeDeclModal}
        title="Declaración mensual de personal"
        size="full"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Elige el <strong className="font-semibold text-gray-800 dark:text-gray-200">mes declarado</strong> una sola vez.
          Completa <strong className="font-semibold text-gray-800 dark:text-gray-200">AFP, CAJA y Ministerio</strong> con su
          PDF y montos; al final pulsa <strong className="font-semibold text-gray-800 dark:text-gray-200">Guardar todo</strong>{' '}
          y se enviarán todas las filas listas. Si ya había datos para ese mes, se reemplazan al guardar.
        </p>
        {canSubirDeclaracionMensual ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-[12rem] flex-1">
                <label
                  htmlFor="decl-mes-gestion"
                  className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400"
                >
                  <CalendarRange className="h-3.5 w-3.5" />
                  Mes declarado (común a los tres módulos)
                </label>
                <input
                  id="decl-mes-gestion"
                  type="month"
                  lang="es"
                  value={declMes}
                  onChange={(e) => setDeclMes(e.target.value)}
                  className="input w-full max-w-xs font-medium"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const listos = DECL_MODULOS.filter((m) => declBorradores[m].file)
                  const conMontosSinPdf = DECL_MODULOS.filter(
                    (m) => !declBorradores[m].file && estadoBorradorModulo(declBorradores[m]) === 'falta_archivo',
                  )
                  return (
                    <>
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                          listos.length === DECL_MODULOS.length
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                        )}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        {listos.length}/{DECL_MODULOS.length} módulos con PDF listos
                      </span>
                      {conMontosSinPdf.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-800 dark:text-amber-200/90">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          Falta PDF en: {conMontosSinPdf.map((m) => DECL_MODULO_META[m].titulo).join(', ')}
                        </span>
                      ) : null}
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDeclFormCollapsed((p) => !p)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {declFormCollapsed ? 'Expandir carga de módulos' : 'Colapsar carga de módulos'}
              </button>
            </div>

            {!declFormCollapsed ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {DECL_MODULOS.map((mod) => {
                const meta = DECL_MODULO_META[mod]
                const Icon = meta.icon
                const b = declBorradores[mod]
                const est = estadoBorradorModulo(b)
                const puedeDeclararMod = colaboradorPuedeCargarDeclaracionMensualEnModulo(user, mod)
                return (
                  <div
                    key={mod}
                    className={clsx(
                      'flex flex-col rounded-2xl border bg-white p-4 shadow-sm dark:bg-gray-900/35',
                      est === 'listo'
                        ? 'border-emerald-300/80 ring-2 ring-emerald-500/20 dark:border-emerald-700/50'
                        : est === 'falta_archivo'
                          ? 'border-amber-200 ring-1 ring-amber-400/25 dark:border-amber-800/60'
                          : 'border-gray-200 dark:border-gray-700',
                      meta.ring,
                    )}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800',
                            est === 'listo' && 'bg-emerald-500/15 dark:bg-emerald-500/10',
                          )}
                        >
                          <Icon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{meta.titulo}</h3>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{meta.descripcion}</p>
                        </div>
                      </div>
                      {est === 'listo' ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Listo
                        </span>
                      ) : est === 'falta_archivo' ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-100">
                          <AlertCircle className="h-3 w-3" />
                          Falta PDF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:bg-gray-400">
                          <CircleDashed className="h-3 w-3" />
                          Pendiente
                        </span>
                      )}
                    </div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <input
                        id={`decl-file-${mod}`}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        disabled={!puedeDeclararMod}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null
                          if (f && !isPdfFile(f)) {
                            toast.error('Solo se permiten archivos PDF.')
                            e.target.value = ''
                            return
                          }
                          setDeclBorradores((p) => ({ ...p, [mod]: { ...p[mod], file: f } }))
                          e.target.value = ''
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={!puedeDeclararMod}
                        icon={<Upload className="h-4 w-4" />}
                        onClick={() => document.getElementById(`decl-file-${mod}`)?.click()}
                      >
                        Elegir PDF
                      </Button>
                      {b.file ? (
                        <>
                          <span
                            className="max-w-[10rem] truncate text-xs font-medium text-gray-700 dark:text-gray-200"
                            title={b.file.name}
                          >
                            {b.file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeclBorradores((p) => ({ ...p, [mod]: { ...p[mod], file: null } }))}
                            className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
                          >
                            Quitar
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">Sin archivo</span>
                      )}
                    </div>
                    {!puedeDeclararMod ? (
                      <p className="mb-2 text-[11px] text-amber-800 dark:text-amber-200/90">
                        Tu perfil no incluye permiso para declarar este módulo. La consultora puede habilitarlo en Mi
                        equipo → Permisos (Subir documentos o Gestionar módulo).
                      </p>
                    ) : null}

                    <div className="grid flex-1 gap-2 sm:grid-cols-1">
                      {(DECLARACION_CAMPOS_POR_MODULO[mod] ?? []).map((campo) => (
                        <Input
                          key={campo}
                          label={DECLARACION_LABELS[campo]}
                          type="number"
                          step="0.01"
                          disabled={!puedeDeclararMod}
                          value={b.montos[campo] ?? ''}
                          onChange={(e) =>
                            setDeclBorradores((p) => ({
                              ...p,
                              [mod]: {
                                ...p[mod],
                                montos: { ...p[mod].montos, [campo]: e.target.value },
                              },
                            }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            ) : null}

            <div className="sticky bottom-0 z-10 -mx-2 flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50/95 p-3 backdrop-blur-sm dark:border-gray-600 dark:bg-gray-900/90 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Solo se envían los módulos con PDF. Los montos vacíos se guardan como sin valor. Puedes volver a cargar el
                mismo mes para <span className="font-medium">editar</span> (reemplazo).
              </p>
              <Button
                type="button"
                size="sm"
                disabled={declUploading || DECL_MODULOS.every((m) => !declBorradores[m].file)}
                onClick={() => void onGuardarDeclaracionesMes()}
                icon={<FileSpreadsheet className="h-4 w-4" />}
                className="shrink-0 sm:min-w-[12rem]"
              >
                {declUploading ? 'Guardando…' : 'Guardar todo'}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={onLimpiarDeclaraciones}>
                Limpiar todo
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-800 dark:text-amber-200/90">
            Solo puedes consultar el historial. Para cargar PDFs necesitas permiso en Mi equipo: «Editar legajo»,
            «Registrar personal», «Subir documentos» o «Gestionar módulo» en AFP, CAJA o Ministerio.
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
          ) : declHistorialPorMes.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Aún no hay declaraciones cargadas.</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Mes</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Fecha subida</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Módulos</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {declHistorialPorMes.map((grupo) => (
                    <Fragment key={grupo.key}>
                    <tr key={`head-${grupo.key}`} className="bg-white dark:bg-gray-900/30">
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-900 dark:text-white">
                        {grupo.periodo_label}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-300">
                        {grupo.ultima_fecha_subida
                          ? new Date(grupo.ultima_fecha_subida).toLocaleString('es-BO')
                          : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-300">
                        {grupo.items.map((it) => etiquetaModuloDeclaracion(it.modulo)).join(', ')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setDeclDetalleMesOpen((p) => (p === grupo.key ? null : grupo.key))}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {declDetalleMesOpen === grupo.key ? 'Ocultar detalle' : 'Ver detalle'}
                        </button>
                      </td>
                    </tr>
                    {declDetalleMesOpen === grupo.key ? (
                      <tr key={`detail-${grupo.key}`} className="bg-gray-50/70 dark:bg-gray-800/30">
                        <td colSpan={4} className="px-3 py-3">
                          <div className="space-y-2">
                            {grupo.items.map((row) => (
                              <div
                                key={row.id}
                                className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/40"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {etiquetaModuloDeclaracion(row.modulo)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.nombre_original}</p>
                                  </div>
                                  <div className="inline-flex gap-1">
                                    <button
                                      type="button"
                                      title="Vista previa"
                                      disabled={previewLoadingId === row.id}
                                      onClick={() => void onPreviewDeclaracion(row)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      Ver PDF
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
                                </div>
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                  {(() => {
                                    const partes = resumenMontosDeclaracionFila(row)
                                    if (partes.length === 0) return <span className="text-gray-400">Sin montos.</span>
                                    return (
                                      <ul className="list-inside list-disc space-y-0.5">
                                        {partes.map((t, idx) => (
                                          <li key={idx}>{t}</li>
                                        ))}
                                      </ul>
                                    )
                                  })()}
                                </div>
                                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                                  Tamaño: {formatBytes(row.tamano_bytes)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={aguiModalOpen}
        onClose={closeAguiModal}
        title="Declaración anual de aguinaldo"
        size="xl"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Registra el <strong className="font-semibold text-gray-800 dark:text-gray-200">año de gestión</strong> del
          aguinaldo y sube el <strong className="font-semibold text-gray-800 dark:text-gray-200">PDF</strong>{' '}
          correspondiente. Si vuelves a cargar el mismo año, se reemplaza el archivo anterior.
        </p>

        {canSubirDeclaracionAguinaldo ? (
          <div className="mt-4 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-white p-4 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-gray-900/40 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-[8rem]">
                <label
                  htmlFor="agui-anio"
                  className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-900/90 dark:text-amber-200/90"
                >
                  <CalendarRange className="h-3.5 w-3.5" />
                  Año de gestión
                </label>
                <select
                  id="agui-anio"
                  value={aguiAnio}
                  onChange={(e) => setAguiAnio(Number(e.target.value))}
                  className="input w-full max-w-[12rem] font-semibold"
                >
                  {Array.from({ length: 20 }, (_, i) => anioGestionActual() - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <input
                  ref={aguiFileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f && !isPdfFile(f)) {
                      toast.error('Solo se permiten archivos PDF.')
                      e.target.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Upload className="h-4 w-4" />}
                  onClick={() => aguiFileRef.current?.click()}
                >
                  Elegir PDF
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={aguiUploading}
                  onClick={() => void onAguinaldoUpload()}
                  icon={<Gift className="h-4 w-4" />}
                >
                  {aguiUploading ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-800 dark:text-amber-200/90">
            Solo puedes consultar. Para subir el PDF de aguinaldo necesitas los mismos permisos que para declaraciones
            (Mi equipo: editar/registrar legajo o subir/gestionar al menos un módulo).
          </p>
        )}

        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Historial de cargas
          </h4>
          {aguiLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : aguiRows.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Aún no hay declaraciones de aguinaldo.</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Año</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Archivo</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Subida</th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Tamaño</th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {aguiRows.map((row) => (
                    <tr key={row.id} className="bg-white dark:bg-gray-900/30">
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-gray-900 dark:text-white">
                        {row.periodo_label ?? row.anio}
                      </td>
                      <td className="max-w-[14rem] truncate px-3 py-2.5 text-gray-600 dark:text-gray-300">
                        {row.nombre_original}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {row.fecha_subida ? new Date(row.fecha_subida).toLocaleString('es-BO') : '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-500 dark:text-gray-400">
                        {formatBytes(row.tamano_bytes)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            title="Vista previa"
                            disabled={aguiPreviewLoadingId === row.id}
                            onClick={() => void onPreviewAguinaldo(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </button>
                          <button
                            type="button"
                            title="Descargar"
                            onClick={() => void onDownloadAguinaldo(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/40"
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
        isOpen={Boolean(registroLegajoPreview)}
        onClose={closeRegistroLegajoPreview}
        title={registroLegajoPreview?.title || 'Vista previa'}
        size="xl"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-0 sm:p-0"
      >
        {registroLegajoPreview?.kind === 'pdf' ? (
          <iframe
            title={registroLegajoPreview.title}
            src={registroLegajoPreview.url}
            className="h-[min(75vh,640px)] w-full rounded-b-lg border-0 bg-gray-100 dark:bg-gray-900"
          />
        ) : registroLegajoPreview?.kind === 'image' ? (
          <div className="flex max-h-[75vh] justify-center overflow-auto bg-gray-100 p-4 dark:bg-gray-900">
            <img src={registroLegajoPreview.url} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={masivoModalOpen}
        onClose={() => setMasivoModalOpen(false)}
        title="Registro masivo de personal"
        size="lg"
        overlayClassName="animate-fade-in bg-black/55 backdrop-blur-sm motion-reduce:animate-none"
        className="animate-scale-in rounded-2xl motion-reduce:animate-none"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Descargá la plantilla Excel, completá una fila por empleado y subila aquí. Los PDF del legajo son opcionales;
            podés adjuntarlos después en el detalle de cada persona.
          </p>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Columnas</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              NOMBRES, APELLIDOS, CI, FECHA_NACIMIENTO(YYYY-MM-DD) opcional, FECHA_INGRESO(YYYY-MM-DD), CARGO opcional,
              CORREO_ELECTRONICO opcional, CUENTA_BANCARIA opcional, CONTACTO_REFERENCIA_1, CONTACTO_REFERENCIA_2,
              CONTACTO_REFERENCIA_3 opcional (mínimo 2 contactos con datos entre las tres columnas).
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/30">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Subir plantilla completada</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setArchivoMasivo(e.target.files?.[0] || null)}
                className="input w-full text-sm"
              />
              <Button
                type="button"
                onClick={() => void subirPlantillaMasiva()}
                loading={uploadingPlantilla}
                icon={<FileUp className="h-4 w-4" />}
                className="sm:shrink-0"
              >
                Cargar masivo
              </Button>
            </div>
            {archivoMasivo ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Archivo: {archivoMasivo.name}</p>
            ) : null}
          </div>
          {resumenMasivo ? (
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm dark:border-primary-800 dark:bg-primary-900/20">
              <p className="font-semibold text-primary-900 dark:text-primary-100">
                Resultado: {resumenMasivo.creados} creados de {resumenMasivo.procesados} procesados.
              </p>
              {resumenMasivo.errores.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-primary-900 dark:text-primary-100">
                  {resumenMasivo.errores.slice(0, 10).map((e, i) => (
                    <li key={`${e.fila}-${i}`}>
                      Fila {e.fila}: {e.mensaje}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setMasivoModalOpen(false)}>
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={() => void descargarPlantillaMasiva()}
              loading={downloadingPlantilla}
              icon={<Download className="h-4 w-4" />}
            >
              Descargar plantilla
            </Button>
          </div>
        </div>
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
            Registrá el legajo base. Curriculum, avisos, croquis y certificado de nacimiento son opcionales; podés
            subirlos ahora o después desde el detalle del empleado. La licencia de conducir sigue siendo opcional.
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
                  Curriculum (PDF, opcional)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={pickPdfOnly(setCurriculumFile)}
                    className="input min-w-0 flex-1 py-2.5"
                  />
                  {curriculumFile ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="sm:w-auto sm:shrink-0"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => openRegistroLegajoPreview(curriculumFile, 'Curriculum')}
                    >
                      Ver
                    </Button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Licencia de conducir (opcional, PDF)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={pickPdfOnly(setLicenciaFile)}
                    className="input min-w-0 flex-1 py-2.5"
                  />
                  {licenciaFile ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="sm:w-auto sm:shrink-0"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => openRegistroLegajoPreview(licenciaFile, 'Licencia de conducir')}
                    >
                      Ver
                    </Button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Avisos de luz/agua (PDF, opcional)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={pickPdfOnly(setAvisoFile)}
                    className="input min-w-0 flex-1 py-2.5"
                  />
                  {avisoFile ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="sm:w-auto sm:shrink-0"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => openRegistroLegajoPreview(avisoFile, 'Aviso luz/agua')}
                    >
                      Ver
                    </Button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Croquis (PDF, opcional)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={pickPdfOnly(setCroquisFile)}
                    className="input min-w-0 flex-1 py-2.5"
                  />
                  {croquisFile ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="sm:w-auto sm:shrink-0"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => openRegistroLegajoPreview(croquisFile, 'Croquis')}
                    >
                      Ver
                    </Button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Certificado de nacimiento (imagen o PDF, opcional)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                    onChange={pickImageOrPdf(setCertNacimientoFile)}
                    className="input min-w-0 flex-1 py-2.5"
                  />
                  {certNacimientoFile ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="sm:w-auto sm:shrink-0"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => openRegistroLegajoPreview(certNacimientoFile, 'Certificado de nacimiento')}
                    >
                      Ver
                    </Button>
                  ) : null}
                </div>
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
