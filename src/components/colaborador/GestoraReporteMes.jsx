import { useState } from 'react'
import toast from 'react-hot-toast'
import { Calculator, Download, FileText } from 'lucide-react'
import Button from '../common/Button'
import Modal from '../common/Modal'
import PlanillaGestoraAportes from './PlanillaGestoraAportes'
import { ESTADO_PASO, EstadoPaso, idPaso } from './GestoraPasos'
import { colaboradorService } from '../../services/colaboradorService'

function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`
}

function unirLista(items) {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

export function requisitosReporte(personal, declaraciones) {
  const conTotal = personal?.con_total ?? 0
  const habilitados = personal?.habilitados ?? 0
  const sinTotal = Math.max(0, habilitados - conTotal)
  const faltanParaReporte = declaraciones?.faltanParaReporte ?? []
  const pendientes = declaraciones?.pendientes ?? []

  return [
    {
      id: 'total',
      paso: 2,
      titulo: 'Total ganado del mes',
      estado: conTotal === 0 ? ESTADO_PASO.BLOQUEADO : sinTotal > 0 ? ESTADO_PASO.PENDIENTE : ESTADO_PASO.LISTO,
      resumen: conTotal === 0 ? 'Nadie en planilla' : `${plural(conTotal, 'persona', 'personas')} en planilla`,
      detalle:
        conTotal === 0
          ? 'Cargá el total ganado de al menos una persona habilitada. Sin eso no se puede generar el reporte.'
          : sinTotal > 0
            ? `${plural(sinTotal, 'persona habilitada no tiene', 'personas habilitadas no tienen')} total ganado y no entra a la planilla.`
            : 'Todas las personas habilitadas tienen total ganado.',
    },
    {
      id: 'ministerio',
      paso: 3,
      titulo: 'Planilla MDT y SEPREC',
      estado: faltanParaReporte.length === 0 ? ESTADO_PASO.LISTO : ESTADO_PASO.PENDIENTE,
      resumen: faltanParaReporte.length === 0 ? 'Cargados' : `Falta ${unirLista(faltanParaReporte)}`,
      detalle:
        faltanParaReporte.length === 0
          ? 'La carta toma estos montos del Ministerio de Trabajo.'
          : 'Se cargan en Ministerio de Trabajo. Si faltan, en la carta salen en Bs. 0,00.',
    },
    {
      id: 'declaraciones',
      paso: 3,
      titulo: 'Declaraciones AFP, CAJA y Ministerio',
      estado: pendientes.length === 0 ? ESTADO_PASO.LISTO : ESTADO_PASO.PENDIENTE,
      resumen: pendientes.length === 0 ? 'Completas' : `Pendiente ${unirLista(pendientes)}`,
      detalle: 'Quedan archivadas con el mes. CNS y Gestora se calculan del total ganado, no de estos montos.',
    },
  ]
}

function descargarBlobUrl(url, nombre) {
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function AccionesReporte({ empresaId, anio, mes, bloqueo }) {
  const [generando, setGenerando] = useState(false)
  const [planilla, setPlanilla] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [cartaPdf, setCartaPdf] = useState(null)
  const deshabilitado = Boolean(bloqueo)

  const generar = async () => {
    setGenerando(true)
    const res = await colaboradorService.generarAportesGestora(empresaId, { anio, mes })
    setGenerando(false)
    if (!res.success) {
      toast.error(res.message || 'No se pudo generar la planilla.')
      return
    }
    setPlanilla(res.data)
  }

  const cerrarCarta = () => {
    setCartaPdf((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
  }

  const mostrarPdf = async () => {
    setPdfLoading(true)
    const res = await colaboradorService.fetchGestoraCartaPdf(empresaId, { anio, mes })
    setPdfLoading(false)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo generar el PDF.')
      return
    }
    cerrarCarta()
    setCartaPdf({
      url: URL.createObjectURL(res.blob),
      nombre: res.nombre || `detalle_aportes_${anio}-${String(mes).padStart(2, '0')}.pdf`,
    })
  }

  return (
    <>
      <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="sm"
            icon={<Calculator className="h-4 w-4" />}
            loading={generando}
            disabled={deshabilitado}
            title={bloqueo || undefined}
            onClick={() => void generar()}
          >
            Generar aportes
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<FileText className="h-4 w-4" />}
            loading={pdfLoading}
            disabled={deshabilitado}
            title={bloqueo || undefined}
            onClick={() => void mostrarPdf()}
          >
            Mostrar en PDF
          </Button>
        </div>
        {bloqueo ? <p className="text-[11px] text-gray-500 dark:text-gray-400 sm:text-right">{bloqueo}</p> : null}
      </div>

      <Modal
        isOpen={cartaPdf != null}
        onClose={cerrarCarta}
        title="Detalle de aportes"
        size="xl"
        bodyClassName="p-0"
        footer={
          <Button type="button" icon={<Download className="h-4 w-4" />} onClick={() => descargarBlobUrl(cartaPdf.url, cartaPdf.nombre)}>
            Descargar PDF
          </Button>
        }
      >
        {cartaPdf?.url ? <iframe title="Detalle de aportes" src={cartaPdf.url} className="h-[75vh] w-full border-0 bg-gray-100" /> : null}
      </Modal>
      <Modal
        isOpen={planilla != null}
        onClose={() => setPlanilla(null)}
        title={planilla?.periodo?.etiqueta ? `Planilla de aportes · ${planilla.periodo.etiqueta}` : 'Planilla de aportes'}
        size="full"
        bodyClassName="p-4 sm:p-6"
      >
        {planilla ? <PlanillaGestoraAportes planilla={planilla} /> : null}
      </Modal>
    </>
  )
}

export default function GestoraReporteMes({ requisitos }) {
  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
      {requisitos.map((req) => (
        <li key={req.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.titulo}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {req.detalle}{' '}
              {req.estado === ESTADO_PASO.LISTO ? null : (
                <a href={`#${idPaso(req.paso)}`} className="font-semibold text-primary-700 hover:underline dark:text-primary-300">
                  Ir al paso {req.paso}
                </a>
              )}
            </p>
          </div>
          <div className="shrink-0">
            <EstadoPaso estado={req.estado} texto={req.resumen} />
          </div>
        </li>
      ))}
    </ul>
  )
}
