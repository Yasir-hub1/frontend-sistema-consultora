import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle, CheckCircle2, Download, Eye, FileText, Upload } from 'lucide-react'
import { clsx } from 'clsx'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'
import { colaboradorService } from '../../services/colaboradorService'
import { useAuth } from '../../contexts/AuthContext'
import { colaboradorPuedeCargarDeclaracionMensualEnModulo } from '../../utils/colaboradorPermisos'

const MODULOS = [
  {
    id: 'afp',
    titulo: 'AFP',
    campos: [
      ['monto_aportes_gestoras', 'Aportes Gestoras'],
      ['monto_aporte_solidario_gestora', 'Aporte solidario'],
    ],
  },
  {
    id: 'caja',
    titulo: 'CAJA',
    campos: [['monto_deposito_cns', 'Depósito CNS']],
  },
  {
    id: 'ministerio',
    titulo: 'Ministerio de Trabajo',
    campos: [
      ['monto_total_ganado', 'Total ganado'],
      ['monto_planilla_mensual_mdt', 'Planilla MDT'],
      ['monto_seprec_registro_poder_consultora', 'SEPREC'],
    ],
  },
]

function mesGestion(anio, mes) {
  return `${anio}-${String(mes).padStart(2, '0')}`
}

function montosVacios(modulo) {
  const o = {}
  for (const [clave] of modulo.campos) o[clave] = ''
  return o
}

function borradorInicial() {
  const o = {}
  for (const modulo of MODULOS) o[modulo.id] = { file: null, montos: montosVacios(modulo) }
  return o
}

function esPdf(file) {
  if (!file) return false
  if (file.type === 'application/pdf') return true
  return String(file.name || '').toLowerCase().endsWith('.pdf')
}

function montoVacio(valor) {
  return valor == null || String(valor).trim() === ''
}

function unirLista(items) {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} y ${items[1]}`
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

function resumirModulo(modulo, row) {
  const faltanMontos = modulo.campos.filter(([clave]) => montoVacio(row?.[clave])).map(([, etiqueta]) => etiqueta)
  if (!row) {
    return {
      registrada: false,
      tienePdf: false,
      faltanMontos,
      frase: `${modulo.titulo}: todavía no hay registro.`,
    }
  }
  const tienePdf = row.tiene_archivo === true || Boolean(row.nombre_original)
  const faltantes = []
  if (!tienePdf) faltantes.push('el PDF')
  faltantes.push(...faltanMontos)
  return {
    registrada: true,
    tienePdf,
    faltanMontos,
    frase: faltantes.length === 0 ? `${modulo.titulo}: completa.` : `${modulo.titulo}: falta ${unirLista(faltantes)}.`,
  }
}

export default function GestoraDeclaracionesMes({ empresaId, anio, mes }) {
  const { user } = useAuth()
  const periodo = mesGestion(anio, mes)
  const [items, setItems] = useState([])
  const [borradores, setBorradores] = useState(borradorInicial)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const res = await colaboradorService.listDeclaracionesMensuales(empresaId, { mes_gestion: periodo })
    const lista = res.success ? (res.data?.items ?? []) : []
    setItems(lista)
    setBorradores(() => {
      const next = borradorInicial()
      for (const row of lista) {
        const modulo = MODULOS.find((item) => item.id === row.modulo)
        if (!modulo) continue
        for (const [clave] of modulo.campos) {
          if (!montoVacio(row[clave])) next[modulo.id].montos[clave] = String(row[clave])
        }
      }
      return next
    })
    setLoading(false)
    if (!res.success) toast.error(res.message || 'No se pudieron consultar las declaraciones del mes.')
  }, [empresaId, periodo])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const porModulo = useMemo(() => {
    const map = new Map()
    for (const row of items) map.set(row.modulo, row)
    return map
  }, [items])

  const resumen = useMemo(
    () => MODULOS.map((modulo) => ({ modulo, estado: resumirModulo(modulo, porModulo.get(modulo.id)) })),
    [porModulo],
  )

  const pendientes = resumen.filter((item) => item.estado.frase.includes('falta') || !item.estado.registrada)
  const completo = pendientes.length === 0

  const puedeEnviar = (moduloId) => {
    const borrador = borradores[moduloId]
    if (!borrador) return false
    if (borrador.file) return true
    return Object.values(borrador.montos).some((valor) => !montoVacio(valor))
  }

  const guardar = async () => {
    const elegidos = MODULOS.filter((modulo) => puedeEnviar(modulo.id))
    if (elegidos.length === 0) {
      toast.error('Indica al menos un monto o adjunta un PDF.')
      return
    }
    for (const modulo of elegidos) {
      const file = borradores[modulo.id].file
      if (file && !esPdf(file)) {
        toast.error(`${modulo.titulo}: solo se permiten archivos PDF.`)
        return
      }
      if (!colaboradorPuedeCargarDeclaracionMensualEnModulo(user, modulo.id)) {
        toast.error(`No tienes permiso para registrar ${modulo.titulo}.`)
        return
      }
      for (const [clave, etiqueta] of modulo.campos) {
        const valor = String(borradores[modulo.id].montos[clave] ?? '').trim()
        if (valor !== '' && !/^\d+(\.\d{1,2})?$/.test(valor)) {
          toast.error(`${modulo.titulo}: ${etiqueta} debe ser un monto, por ejemplo 8500.00.`)
          return
        }
      }
    }

    setGuardando(true)
    const fallos = []
    for (const modulo of elegidos) {
      const borrador = borradores[modulo.id]
      const fd = new FormData()
      fd.append('modulo', modulo.id)
      fd.append('mes_gestion', periodo)
      if (borrador.file) fd.append('archivo', borrador.file)
      for (const [clave] of modulo.campos) {
        const valor = String(borrador.montos[clave] ?? '').trim()
        if (valor !== '') fd.append(clave, valor)
      }
      const res = await colaboradorService.subirDeclaracionMensual(empresaId, fd)
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

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Declaraciones del mes</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            AFP, CAJA y Ministerio de Trabajo. El PDF y los montos son opcionales: podés guardar uno, el otro, o los dos.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Consultando declaraciones de este mes…</p>
      ) : (
        <>
          <div
            className={clsx(
              'mt-4 rounded-xl border px-4 py-3',
              completo
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30'
                : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20',
            )}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              {completo ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-200" />
              )}
              {completo ? 'Este mes está completo' : 'Qué falta en este mes'}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
              {resumen.map(({ modulo, estado }) => (
                <li key={modulo.id}>{estado.frase}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {MODULOS.map((modulo) => {
              const row = porModulo.get(modulo.id)
              const estado = resumirModulo(modulo, row)
              const borrador = borradores[modulo.id]
              const puede = colaboradorPuedeCargarDeclaracionMensualEnModulo(user, modulo.id)
              return (
                <div
                  key={modulo.id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/60"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{modulo.titulo}</h4>
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        !estado.registrada && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
                        estado.registrada && estado.faltanMontos.length === 0 && estado.tienePdf && 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
                        estado.registrada && (estado.faltanMontos.length > 0 || !estado.tienePdf) && 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
                      )}
                    >
                      {!estado.registrada ? 'Sin registro' : estado.faltanMontos.length === 0 && estado.tienePdf ? 'Completa' : 'Incompleta'}
                    </span>
                  </div>

                  {estado.tienePdf && row ? (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="max-w-[12rem] truncate text-xs text-gray-600 dark:text-gray-300" title={row.nombre_original}>
                        {row.nombre_original}
                      </span>
                      <button
                        type="button"
                        onClick={() => void verPdf(row)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:underline dark:text-gray-200"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => void colaboradorService.descargarDeclaracionMensual(empresaId, row.id, row.nombre_original)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline dark:text-primary-300"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Descargar
                      </button>
                    </div>
                  ) : (
                    <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <FileText className="h-3.5 w-3.5" />
                      Sin PDF
                    </p>
                  )}

                  <input
                    id={`gestora-decl-${modulo.id}`}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    disabled={!puede || guardando}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      if (file && !esPdf(file)) {
                        toast.error('Solo se permiten archivos PDF.')
                        e.target.value = ''
                        return
                      }
                      setBorradores((prev) => ({ ...prev, [modulo.id]: { ...prev[modulo.id], file } }))
                      e.target.value = ''
                    }}
                  />
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={!puede || guardando}
                      icon={<Upload className="h-4 w-4" />}
                      onClick={() => document.getElementById(`gestora-decl-${modulo.id}`)?.click()}
                    >
                      PDF opcional
                    </Button>
                    {borrador?.file ? (
                      <button
                        type="button"
                        className="max-w-[9rem] truncate text-xs font-medium text-gray-700 dark:text-gray-200"
                        title={borrador.file.name}
                        onClick={() => setBorradores((prev) => ({ ...prev, [modulo.id]: { ...prev[modulo.id], file: null } }))}
                      >
                        Quitar {borrador.file.name}
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    {modulo.campos.map(([clave, etiqueta]) => (
                      <Input
                        key={clave}
                        label={etiqueta}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        disabled={!puede || guardando}
                        value={borrador?.montos[clave] ?? ''}
                        onChange={(e) =>
                          setBorradores((prev) => ({
                            ...prev,
                            [modulo.id]: {
                              ...prev[modulo.id],
                              montos: { ...prev[modulo.id].montos, [clave]: e.target.value },
                            },
                          }))
                        }
                      />
                    ))}
                  </div>
                  {puede ? null : (
                    <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-200">
                      Tu perfil no puede registrar este módulo.
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Guardar solo envía los módulos donde hay un monto o un PDF nuevo. Si ya había un PDF, se conserva.
            </p>
            <Button type="button" size="sm" loading={guardando} onClick={() => void guardar()} className="shrink-0">
              Guardar declaraciones
            </Button>
          </div>
        </>
      )}

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
    </section>
  )
}
