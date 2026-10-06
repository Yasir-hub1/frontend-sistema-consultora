import { clsx } from 'clsx'
import { CheckCircle2, CircleDashed, Lock } from 'lucide-react'

export const ESTADO_PASO = {
  LISTO: 'listo',
  PENDIENTE: 'pendiente',
  BLOQUEADO: 'bloqueado',
}

const ESTILOS = {
  [ESTADO_PASO.LISTO]: {
    icono: CheckCircle2,
    chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800',
    numero: 'bg-emerald-600 text-white',
    barra: 'bg-emerald-500',
  },
  [ESTADO_PASO.PENDIENTE]: {
    icono: CircleDashed,
    chip: 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800',
    numero: 'bg-amber-500 text-white',
    barra: 'bg-amber-400',
  },
  [ESTADO_PASO.BLOQUEADO]: {
    icono: Lock,
    chip: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
    numero: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200',
    barra: 'bg-gray-200 dark:bg-gray-700',
  },
}

export function idPaso(numero) {
  return `cierre-paso-${numero}`
}

export function EstadoPaso({ estado, texto }) {
  const estilo = ESTILOS[estado]
  const Icono = estilo.icono
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1', estilo.chip)}>
      <Icono aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {texto}
    </span>
  )
}

export function ProgresoCierre({ pasos }) {
  return (
    <nav aria-label="Pasos del cierre del mes">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pasos.map((paso) => {
          const estilo = ESTILOS[paso.estado]
          return (
            <li key={paso.numero}>
              <a
                href={`#${idPaso(paso.numero)}`}
                className="group block rounded-xl p-2 -m-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span aria-hidden="true" className={clsx('block h-1.5 rounded-full transition-colors', estilo.barra)} />
                <span className="mt-2.5 flex items-center gap-2">
                  <span
                    className={clsx(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                      estilo.numero
                    )}
                  >
                    {paso.estado === ESTADO_PASO.LISTO ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : paso.numero}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 group-hover:underline dark:text-white">{paso.titulo}</span>
                </span>
                <span className="mt-1 block pl-8 text-xs text-gray-500 dark:text-gray-400">{paso.resumen}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function PasoCierre({ numero, titulo, descripcion, estado, resumen, acciones, children }) {
  const estilo = ESTILOS[estado]
  return (
    <section
      id={idPaso(numero)}
      aria-labelledby={`${idPaso(numero)}-titulo`}
      className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/50"
    >
      <header className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-800 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            aria-hidden="true"
            className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums', estilo.numero)}
          >
            {numero}
          </span>
          <div className="min-w-0">
            <h3 id={`${idPaso(numero)}-titulo`} className="text-base font-bold text-gray-900 dark:text-white">
              <span className="sr-only">Paso {numero}: </span>
              {titulo}
            </h3>
            {descripcion ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">{descripcion}</p>
            ) : null}
            <div className="mt-2">
              <EstadoPaso estado={estado} texto={resumen} />
            </div>
          </div>
        </div>
        {acciones ? <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">{acciones}</div> : null}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
