import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle2, CircleDashed, Download, Eye, FileText, Paperclip, X } from 'lucide-react'
import { clsx } from 'clsx'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { colaboradorService } from '../../services/colaboradorService'
import { useAuth } from '../../contexts/AuthContext'
import { colaboradorPuedeCargarDeclaracionMensualEnModulo } from '../../utils/colaboradorPermisos'

export const MODULOS_DECLARACION = [
  {
    id: 'afp',
    titulo: 'AFP',
    campos: [
      { clave: 'monto_aportes_gestoras', etiqueta: 'Aportes Gestoras' },
      { clave: 'monto_aporte_solidario_gestora', etiqueta: 'Aporte solidario' },
    ],
  },
  {
    id: 'caja',
    titulo: 'CAJA',
    campos: [{ clave: 'monto_deposito_cns', etiqueta: 'Depósito CNS' }],
  },
  {
    id: 'ministerio',
    titulo: 'Ministerio de Trabajo',
    campos: [
      { clave: 'monto_total_ganado', etiqueta: 'Total ganado' },
      { clave: 'monto_planilla_mensual_mdt', etiqueta: 'Planilla MDT', alReporte: true },
      { clave: 'monto_seprec_registro_poder_consultora', etiqueta: 'SEPREC', alReporte: true },
    ],
  },
]

const MONTO_VALIDO = /^\d+(\.\d{1,2})?$/

function mesGestion(anio, mes) {
  return `${anio}-${String(mes).padStart(2, '0')}`
}

function textoMonto(valor) {
  return valor == null ? '' : String(valor).trim()
}

function borradorDesde(row, modulo) {
  const montos = {}
  for (const { clave } of modulo.campos) montos[clave] = textoMonto(row?.[clave])
  return { file: null, montos }
}

function borradoresDesde(porModulo) {
  const borradores = {}
  for (const modulo of MODULOS_DECLARACION) borradores[modulo.id] = borradorDesde(porModulo.get(modulo.id), modulo)
  return borradores
}

function esPdf(file) {
  if (file.type === 'application/pdf') return true
  return String(file.name || '').toLowerCase().endsWith('.pdf')
}

function tienePdfGuardado(row) {
  return row?.tiene_archivo === true || Boolean(row?.nombre_original)
}

function estadoModulo(modulo, row) {
  const camposFaltantes = modulo.campos.filter(({ clave }) => textoMonto(row?.[clave]) === '')
  const tienePdf = tienePdfGuardado(row)
  return {
    registrada: Boolean(row),
    tienePdf,
    camposFaltantes,
    completa: Boolean(row) && tienePdf && camposFaltantes.length === 0,
  }
}

function moduloModificado(modulo, borrador, row) {
  if (borrador.file) return true
  return modulo.campos.some(({ clave }) => textoMonto(borrador.montos[clave]) !== textoMonto(row?.[clave]))
}

function etiquetaEstado(estado) {
  if (!estado.registrada) return 'Sin registro'
  return estado.completa ? 'Completa' : 'Incompleta'
}

function Requisito({ cumplido, children }) {
  const Icono = cumplido ? CheckCircle2 : CircleDashed
  return (
    <span className="flex items-center gap-1.5">
      <Icono
        aria-hidden="true"
        className={clsx('h-3.5 w-3.5 shrink-0', cumplido ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500')}
      />
      <span className="sr-only">{cumplido ? 'Cargado:' : 'Pendiente:'}</span>
      {children}
    </span>
  )
}

function CampoMonto({ id, etiqueta, alReporte, guardado, valor, disabled, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <Requisito cumplido={guardado}>{etiqueta}</Requisito>
        {alReporte ? (
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
            Va al reporte
          </span>
        ) : null}
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-medium text-gray-400">Bs.</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          disabled={disabled}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="input h-10 rounded-lg pl-10 text-sm tabular-nums disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800"
        />
      </div>
    </div>
  )
}

function TarjetaModulo({ modulo, row, borrador, puede, guardando, onCambiarMonto, onElegirPdf, onQuitarPdf, onVerPdf, onDescargarPdf }) {
  const estado = estadoModulo(modulo, row)
  const modificado = moduloModificado(modulo, borrador, row)
  const inputPdfId = `gestora-decl-${modulo.id}`

  return (
    <article
      className={clsx(
        'flex flex-col rounded-xl border bg-white p-4 dark:bg-gray-900/60',
        modificado ? 'border-primary-300 ring-1 ring-primary-200 dark:border-primary-700 dark:ring-primary-900' : 'border-gray-200 dark:border-gray-700'
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{modulo.titulo}</h4>
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            !estado.registrada && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
            estado.completa && 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
            estado.registrada && !estado.completa && 'bg-amber-500/15 text-amber-900 dark:text-amber-100'
          )}
        >
          {modificado ? 'Sin guardar' : etiquetaEstado(estado)}
        </span>
      </header>

      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800/60">
        <div className="flex items-center justify-between gap-2">
          <Requisito cumplido={estado.tienePdf}>PDF de la declaración</Requisito>
          <span className="text-[10px] uppercase tracking-wide text-gray-400">Opcional</span>
        </div>
        {estado.tienePdf ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-5">
            <span className="max-w-[11rem] truncate text-gray-600 dark:text-gray-300" title={row.nombre_original}>
              {row.nombre_original}
            </span>
            <button type="button" onClick={onVerPdf} className="inline-flex items-center gap-1 font-semibold text-gray-700 hover:underline dark:text-gray-200">
              <Eye aria-hidden="true" className="h-3.5 w-3.5" />
              Ver
            </button>
            <button
              type="button"
              onClick={onDescargarPdf}
              className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline dark:text-primary-300"
            >
              <Download aria-hidden="true" className="h-3.5 w-3.5" />
              Descargar
            </button>
          </div>
        ) : null}

        <input
          id={inputPdfId}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          tabIndex={-1}
          disabled={!puede || guardando}
          onChange={(e) => {
            onElegirPdf(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
        <div className="mt-2 pl-5">
          {borrador.file ? (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary-50 py-1 pl-2.5 pr-1 text-primary-800 dark:bg-primary-900/40 dark:text-primary-100">
              <FileText aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate" title={borrador.file.name}>
                {borrador.file.name}
              </span>
              <button
                type="button"
                onClick={onQuitarPdf}
                aria-label={`Quitar ${borrador.file.name}`}
                className="rounded-full p-0.5 hover:bg-primary-100 dark:hover:bg-primary-800"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={!puede || guardando}
              onClick={() => document.getElementById(inputPdfId)?.click()}
              className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary-300"
            >
              <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
              {estado.tienePdf ? 'Reemplazar PDF' : 'Adjuntar PDF'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        {modulo.campos.map((campo) => (
          <CampoMonto
            key={campo.clave}
            id={`gestora-decl-${modulo.id}-${campo.clave}`}
            etiqueta={campo.etiqueta}
            alReporte={campo.alReporte}
            guardado={textoMonto(row?.[campo.clave]) !== ''}
            valor={borrador.montos[campo.clave]}
            disabled={!puede || guardando}
            onChange={(valor) => onCambiarMonto(campo.clave, valor)}
          />
        ))}
      </div>

      {puede ? null : <p className="mt-3 text-[11px] text-amber-800 dark:text-amber-200">Tu perfil no puede registrar este módulo.</p>}
    </article>
  )
}

function validarModulo(modulo, borrador) {
  if (borrador.file && !esPdf(borrador.file)) return `${modulo.titulo}: solo se permiten archivos PDF.`
  for (const { clave, etiqueta } of modulo.campos) {
    const valor = textoMonto(borrador.montos[clave]).replace(',', '.')
    if (valor !== '' && !MONTO_VALIDO.test(valor)) return `${modulo.titulo}: ${etiqueta} debe ser un monto, por ejemplo 8500.00.`
  }
  return null
}

function formularioModulo(modulo, borrador, periodo) {
  const fd = new FormData()
  fd.append('modulo', modulo.id)
  fd.append('mes_gestion', periodo)
  if (borrador.file) fd.append('archivo', borrador.file)
  for (const { clave } of modulo.campos) {
    const valor = textoMonto(borrador.montos[clave]).replace(',', '.')
    if (valor !== '') fd.append(clave, valor)
  }
  return fd
}

export default function GestoraDeclaracionesMes({ empresaId, anio, mes, onResumen }) {
  const { user } = useAuth()
  const periodo = mesGestion(anio, mes)
  const [items, setItems] = useState([])
  const [borradores, setBorradores] = useState(() => borradoresDesde(new Map()))
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const res = await colaboradorService.listDeclaracionesMensuales(empresaId, { mes_gestion: periodo })
    const lista = res.success ? (res.data?.items ?? []) : []
    setItems(lista)
    setBorradores(borradoresDesde(new Map(lista.map((row) => [row.modulo, row]))))
    setLoading(false)
    if (!res.success) toast.error(res.message || 'No se pudieron consultar las declaraciones del mes.')
  }, [empresaId, periodo])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const porModulo = useMemo(() => new Map(items.map((row) => [row.modulo, row])), [items])

  const modificados = useMemo(
    () => MODULOS_DECLARACION.filter((modulo) => moduloModificado(modulo, borradores[modulo.id], porModulo.get(modulo.id))),
    [borradores, porModulo]
  )

  useEffect(() => {
    if (loading) return
    const estados = MODULOS_DECLARACION.map((modulo) => ({ modulo, estado: estadoModulo(modulo, porModulo.get(modulo.id)) }))
    const faltanParaReporte = MODULOS_DECLARACION.flatMap((modulo) =>
      modulo.campos.filter((campo) => campo.alReporte && textoMonto(porModulo.get(modulo.id)?.[campo.clave]) === '')
    ).map((campo) => campo.etiqueta)
    onResumen?.({
      completos: estados.filter(({ estado }) => estado.completa).length,
      total: MODULOS_DECLARACION.length,
      pendientes: estados.filter(({ estado }) => !estado.completa).map(({ modulo }) => modulo.titulo),
      faltanParaReporte,
    })
  }, [loading, porModulo, onResumen])

  const actualizarBorrador = (moduloId, cambio) => {
    setBorradores((prev) => ({ ...prev, [moduloId]: { ...prev[moduloId], ...cambio(prev[moduloId]) } }))
  }

  const descartarCambios = () => setBorradores(borradoresDesde(porModulo))

  const guardar = async () => {
    for (const modulo of modificados) {
      if (!colaboradorPuedeCargarDeclaracionMensualEnModulo(user, modulo.id)) {
        toast.error(`No tienes permiso para registrar ${modulo.titulo}.`)
        return
      }
      const error = validarModulo(modulo, borradores[modulo.id])
      if (error) {
        toast.error(error)
        return
      }
    }

    setGuardando(true)
    const fallos = []
    for (const modulo of modificados) {
      const res = await colaboradorService.subirDeclaracionMensual(empresaId, formularioModulo(modulo, borradores[modulo.id], periodo))
      if (!res.success) fallos.push(res.message || `${modulo.titulo} no se guardó.`)
    }
    setGuardando(false)
    await cargar()
    if (fallos.length === 0) toast.success('Declaraciones del mes guardadas.')
    else toast.error(fallos[0])
  }

  const verPdf = async (row) => {
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return { nombre: row.nombre_original, url: null }
    })
    setPreviewLoading(true)
    const res = await colaboradorService.fetchDeclaracionVistaPreviaBlob(empresaId, row.id)
    if (!res.success) {
      setPreview(null)
      setPreviewLoading(false)
      toast.error(res.message || 'No se pudo abrir el PDF.')
      return
    }
    setPreview({ nombre: row.nombre_original, url: URL.createObjectURL(res.blob) })
    setPreviewLoading(false)
  }

  const cerrarPreview = () => {
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    setPreviewLoading(false)
  }

  if (loading) {
    return <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Consultando declaraciones de este mes…</p>
  }

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-3">
        {MODULOS_DECLARACION.map((modulo) => {
          const row = porModulo.get(modulo.id)
          return (
            <TarjetaModulo
              key={modulo.id}
              modulo={modulo}
              row={row}
              borrador={borradores[modulo.id]}
              puede={colaboradorPuedeCargarDeclaracionMensualEnModulo(user, modulo.id)}
              guardando={guardando}
              onCambiarMonto={(clave, valor) =>
                actualizarBorrador(modulo.id, (actual) => ({ montos: { ...actual.montos, [clave]: valor } }))
              }
              onElegirPdf={(file) => {
                if (file && !esPdf(file)) {
                  toast.error('Solo se permiten archivos PDF.')
                  return
                }
                actualizarBorrador(modulo.id, () => ({ file }))
              }}
              onQuitarPdf={() => actualizarBorrador(modulo.id, () => ({ file: null }))}
              onVerPdf={() => void verPdf(row)}
              onDescargarPdf={() => void colaboradorService.descargarDeclaracionMensual(empresaId, row.id, row.nombre_original)}
            />
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {modificados.length === 0
            ? 'Sin cambios por guardar. El PDF y los montos son opcionales: podés guardar uno, el otro, o los dos.'
            : `Cambios sin guardar en ${modificados.map((modulo) => modulo.titulo).join(', ')}. Si ya había un PDF y no adjuntás otro, se conserva.`}
        </p>
        <div className="flex shrink-0 gap-2">
          {modificados.length > 0 ? (
            <Button type="button" size="sm" variant="secondary" disabled={guardando} onClick={descartarCambios}>
              Descartar
            </Button>
          ) : null}
          <Button type="button" size="sm" loading={guardando} disabled={modificados.length === 0} onClick={() => void guardar()}>
            Guardar declaraciones
          </Button>
        </div>
      </div>

      <Modal
        isOpen={preview != null}
        onClose={cerrarPreview}
        title={preview?.nombre ? `Vista previa · ${preview.nombre}` : 'Vista previa'}
        size="xl"
        bodyClassName="p-0"
      >
        {previewLoading ? (
          <p className="flex h-[50vh] items-center justify-center text-sm text-gray-500">Cargando PDF…</p>
        ) : preview?.url ? (
          <iframe title="Declaración mensual" src={preview.url} className="h-[75vh] w-full border-0 bg-gray-100" />
        ) : null}
      </Modal>
    </>
  )
}
