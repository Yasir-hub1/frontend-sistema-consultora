import { useId, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { FileStack, Mail } from 'lucide-react'
import CartaAportesMes from '../../components/reportes/CartaAportesMes'
import DocumentosReporte from '../../components/reportes/DocumentosReporte'
import { useEmpresasReporte } from '../../hooks/useEmpresasReporte'
import { createReportesClient } from '../../services/reportesClient'

const VISTA_CARTA = 'carta'
const VISTA_DOCUMENTOS = 'documentos'

const VISTAS = [
  {
    id: VISTA_CARTA,
    etiqueta: 'Carta de aportes',
    icono: Mail,
    descripcion: 'Montos a pagar de una empresa en un mes y la carta en PDF para enviarle.',
  },
  {
    id: VISTA_DOCUMENTOS,
    etiqueta: 'Documentos cargados',
    icono: FileStack,
    descripcion: 'Declaraciones mensuales y otros PDFs que cargaron los colaboradores, por empresa y mes.',
  },
]

function SelectorVista({ activa, onCambiar, idBase }) {
  return (
    <div role="tablist" aria-label="Sección de reportes" className="grid gap-2 sm:grid-cols-2">
      {VISTAS.map((v) => {
        const seleccionada = v.id === activa
        const Icono = v.icono
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            id={`${idBase}-tab-${v.id}`}
            aria-selected={seleccionada}
            aria-controls={`${idBase}-panel-${v.id}`}
            onClick={() => onCambiar(v.id)}
            className={clsx(
              'flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
              seleccionada
                ? 'border-primary-300 bg-white shadow-sm ring-1 ring-primary-200 dark:border-primary-700 dark:bg-gray-900 dark:ring-primary-800'
                : 'border-gray-200 bg-white/60 hover:border-gray-300 hover:bg-white dark:border-gray-700 dark:bg-gray-900/30 dark:hover:bg-gray-900/60'
            )}
          >
            <span
              className={clsx(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                seleccionada ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              <Icono aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className={clsx('block font-semibold', seleccionada ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                {v.etiqueta}
              </span>
              <span className="mt-0.5 block text-sm text-gray-500 dark:text-gray-400">{v.descripcion}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function ConsultoraReportes({ modo = 'consultora' }) {
  const idBase = useId()
  const reportes = useMemo(() => createReportesClient(modo === 'colaborador' ? '/colaborador' : '/consultora'), [modo])
  const empresas = useEmpresasReporte(reportes, modo)
  const [params, setParams] = useSearchParams()
  const vista = params.get('vista') === VISTA_DOCUMENTOS ? VISTA_DOCUMENTOS : VISTA_CARTA

  const cambiarVista = (id) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (id === VISTA_CARTA) next.delete('vista')
        else next.set('vista', id)
        return next
      },
      { replace: true }
    )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reportes</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {modo === 'colaborador' ? 'De las empresas que tenés asignadas.' : 'De todas las empresas cliente de tu consultora.'}
        </p>
      </header>

      <SelectorVista activa={vista} onCambiar={cambiarVista} idBase={idBase} />

      {VISTAS.map((v) => (
        <section
          key={v.id}
          role="tabpanel"
          id={`${idBase}-panel-${v.id}`}
          aria-labelledby={`${idBase}-tab-${v.id}`}
          hidden={v.id !== vista}
          className="rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-soft dark:border-gray-700/80 dark:bg-gray-900/50 sm:p-6"
        >
          {v.id === VISTA_CARTA ? <CartaAportesMes reportes={reportes} empresas={empresas} /> : <DocumentosReporte reportes={reportes} empresas={empresas} />}
        </section>
      ))}
    </div>
  )
}
