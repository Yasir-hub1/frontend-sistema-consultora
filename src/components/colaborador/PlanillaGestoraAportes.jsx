import { clsx } from 'clsx'
import { AlertTriangle, Users } from 'lucide-react'
import { formatBolivianos } from '../../utils/formatters'

const monto = formatBolivianos

const importe = (valor) => formatBolivianos(valor).replace('Bs. ', '')

const CONCEPTOS = {
  base: { punto: 'bg-gray-400', texto: 'text-gray-700 dark:text-gray-200', borde: 'border-t-gray-300 dark:border-t-gray-600' },
  cns: { punto: 'bg-sky-500', texto: 'text-sky-800 dark:text-sky-200', borde: 'border-t-sky-400' },
  sip: { punto: 'bg-indigo-500', texto: 'text-indigo-800 dark:text-indigo-200', borde: 'border-t-indigo-400' },
  vivienda: { punto: 'bg-emerald-500', texto: 'text-emerald-800 dark:text-emerald-200', borde: 'border-t-emerald-400' },
  solidario: { punto: 'bg-rose-500', texto: 'text-rose-800 dark:text-rose-200', borde: 'border-t-rose-400' },
  afp: { punto: 'bg-violet-500', texto: 'text-violet-800 dark:text-violet-200', borde: 'border-t-violet-400' },
  ans: { punto: 'bg-orange-500', texto: 'text-orange-800 dark:text-orange-200', borde: 'border-t-orange-400' },
}

const GRUPOS = [
  { tono: 'base', columnas: [{ campo: 'total_ganado', etiqueta: 'Total ganado', fuerte: true }] },
  { tono: 'cns', columnas: [{ campo: 'cns', etiqueta: 'Depósito CNS', tasa: '10%', fuerte: true }] },
  {
    tono: 'sip',
    titulo: 'SIP · 13,92%',
    columnas: [
      { campo: 'jubilacion', etiqueta: 'Jubilación', tasa: '10%' },
      { campo: 'riesgo_profesional', etiqueta: 'Riesgo prof.', tasa: '1,71%' },
      { campo: 'riesgo_comun', etiqueta: 'Riesgo com.', tasa: '1,71%' },
      { campo: 'comision', etiqueta: 'Comisión', tasa: '0,50%' },
      { campo: 'subtotal_sip', etiqueta: 'Subtotal', fuerte: true },
    ],
  },
  { tono: 'vivienda', columnas: [{ campo: 'vivienda', etiqueta: 'Vivienda', tasa: '2%', fuerte: true }] },
  {
    tono: 'solidario',
    titulo: 'Fondo solidario · 4%',
    columnas: [
      { campo: 'patronal_solidario', etiqueta: 'Patronal', tasa: '3,50%' },
      { campo: 'asegurado_solidario', etiqueta: 'Asegurado', tasa: '0,50%' },
      { campo: 'fondo_solidario', etiqueta: 'Subtotal', fuerte: true },
    ],
  },
  { tono: 'afp', columnas: [{ campo: 'aporte_afp', etiqueta: 'AFP a pagar', tasa: '19,92%', fuerte: true }] },
  {
    tono: 'ans',
    titulo: 'Base aporte nacional solidario',
    columnas: [
      { campo: 'base_ans_1', etiqueta: 'Sobre 13.000' },
      { campo: 'base_ans_2', etiqueta: 'Sobre 25.000' },
      { campo: 'base_ans_3', etiqueta: 'Sobre 35.000' },
    ],
  },
]

const COLUMNAS = GRUPOS.flatMap((grupo) =>
  grupo.columnas.map((columna, indice) => ({ ...columna, tono: grupo.tono, inicioGrupo: indice === 0 }))
)

const COLUMNAS_SUBGRUPO = GRUPOS.filter((grupo) => grupo.titulo).flatMap((grupo) =>
  grupo.columnas.map((columna, indice) => ({ ...columna, tono: grupo.tono, inicioGrupo: indice === 0 }))
)

const TRAMOS_ANS = [
  { base: 'base_ans_1', aporte: 'ans_1', umbral: '13.000', tasa: '1,15%' },
  { base: 'base_ans_2', aporte: 'ans_2', umbral: '25.000', tasa: '5,74%' },
  { base: 'base_ans_3', aporte: 'ans_3', umbral: '35.000', tasa: '11,48%' },
]

const CELDA_FIJA = 'sticky left-0 bg-inherit'

const SEPARADOR_GRUPO = 'border-l border-gray-200 dark:border-gray-700'

function Punto({ tono }) {
  return <span aria-hidden="true" className={clsx('inline-block h-2 w-2 shrink-0 rounded-full', CONCEPTOS[tono].punto)} />
}

function Eyebrow({ as: Etiqueta = 'p', id, children }) {
  return (
    <Etiqueta id={id} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
      {children}
    </Etiqueta>
  )
}

function Encabezado({ children, tasa, tono, rowSpan, colSpan, inicioGrupo = true, alto = false }) {
  return (
    <th
      scope="col"
      rowSpan={rowSpan}
      colSpan={colSpan}
      className={clsx(
        'whitespace-nowrap bg-gray-50 px-3 text-center text-[10px] font-bold uppercase tracking-wide dark:bg-gray-900',
        alto ? 'py-2.5' : 'py-2',
        CONCEPTOS[tono].texto,
        inicioGrupo && SEPARADOR_GRUPO,
        (colSpan || rowSpan) && clsx('border-t-2', CONCEPTOS[tono].borde)
      )}
    >
      {children}
      {tasa ? <span className="mt-0.5 block font-medium normal-case tracking-normal opacity-80">{tasa}</span> : null}
    </th>
  )
}

function Celda({ valor, tono, fuerte, inicioGrupo }) {
  return (
    <td
      className={clsx(
        'whitespace-nowrap px-3 py-2.5 text-right text-xs tabular-nums',
        fuerte ? clsx('font-semibold', CONCEPTOS[tono].texto) : 'text-gray-600 dark:text-gray-300',
        inicioGrupo && SEPARADOR_GRUPO
      )}
    >
      {importe(valor)}
    </td>
  )
}

function TerminoPago({ tono, etiqueta, fuente, valor }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <p className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
        <Punto tono={tono} />
        {etiqueta}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{fuente}</p>
      <p className="mt-2 text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">{monto(valor)}</p>
    </div>
  )
}

function Operador({ children }) {
  return (
    <span aria-hidden="true" className="self-center text-center text-xl font-light text-gray-400 dark:text-gray-500">
      {children}
    </span>
  )
}

function EcuacionPago({ consolidado }) {
  return (
    <section aria-label="Resumen del pago" className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 dark:bg-gray-900/60 dark:ring-gray-700">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)_1.5rem_minmax(0,1fr)_1.5rem_minmax(0,1.3fr)] lg:gap-x-1 lg:gap-y-0">
        <TerminoPago tono="cns" etiqueta="Depósito CNS" fuente="10% del total ganado" valor={consolidado.cns} />
        <Operador>+</Operador>
        <TerminoPago tono="afp" etiqueta="AFP a pagar" fuente="Formulario SIP" valor={consolidado.aporte_afp} />
        <Operador>+</Operador>
        <TerminoPago tono="ans" etiqueta="Aporte nacional solidario" fuente="Formulario Fondo Solidario" valor={consolidado.ans} />
        <Operador>=</Operador>
        <div className="flex flex-col justify-center rounded-xl bg-amber-100 px-4 py-3 ring-1 ring-amber-300 dark:bg-amber-950/60 dark:ring-amber-800 lg:row-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-100">Total general a pagar</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-amber-950 dark:text-amber-50 sm:text-3xl">
            {monto(consolidado.total_general)}
          </p>
        </div>
        <div className="lg:col-start-3 lg:col-end-6 lg:px-3">
          <div className="hidden h-2.5 rounded-b-lg border-x border-b border-gray-300 dark:border-gray-600 lg:block" aria-hidden="true" />
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-lg px-1 pt-1.5 text-xs text-gray-600 dark:text-gray-300 lg:justify-center">
            <span>
              <span className="font-semibold text-gray-900 dark:text-white">Monto total Gestora</span>
              <span className="text-gray-500 dark:text-gray-400"> · AFP a pagar + aporte nacional solidario</span>
            </span>
            <span className="font-bold tabular-nums text-gray-900 dark:text-white">{monto(consolidado.gestora)}</span>
          </p>
        </div>
      </div>
    </section>
  )
}

function LineaLibro({ etiqueta, detalle, valor, tono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
          {tono ? <Punto tono={tono} /> : null}
          {etiqueta}
        </p>
        {detalle ? <p className="mt-0.5 pl-4 text-[11px] text-gray-500 dark:text-gray-400">{detalle}</p> : null}
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{monto(valor)}</span>
    </div>
  )
}

function TotalLibro({ etiqueta, valor, tono }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-4 border-t-[3px] border-double border-gray-300 pt-3 dark:border-gray-600">
      <p className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
        <Punto tono={tono} />
        {etiqueta}
      </p>
      <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{monto(valor)}</span>
    </div>
  )
}

function Formulario({ titulo, subtitulo, children, pie }) {
  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900/50">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{titulo}</h4>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitulo}</p>
      <div className="mt-3 flex-1 divide-y divide-gray-100 dark:divide-gray-800">{children}</div>
      {pie}
    </article>
  )
}

function FormularioSip({ consolidado }) {
  return (
    <Formulario
      titulo="Formulario SIP · AFP a pagar"
      subtitulo="SIP + vivienda + fondo solidario = 19,92% del total ganado."
      pie={
        <>
          <TotalLibro etiqueta="AFP a pagar" valor={consolidado.aporte_afp} tono="afp" />
          <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            Sin el 0,50% del asegurado (19,42%): {monto(consolidado.referencia_1942)}.
          </p>
        </>
      }
    >
      <LineaLibro tono="sip" etiqueta="SIP" detalle="Jubilación, riesgos y comisión · 13,92%" valor={consolidado.sip} />
      <LineaLibro tono="vivienda" etiqueta="Aporte patronal vivienda" detalle="2%" valor={consolidado.vivienda} />
      <LineaLibro
        tono="solidario"
        etiqueta="Fondo solidario"
        detalle="Patronal 3,50% + asegurado 0,50%"
        valor={consolidado.fondo_solidario}
      />
    </Formulario>
  )
}

function FormularioFondoSolidario({ consolidado, totales }) {
  return (
    <Formulario
      titulo="Formulario Fondo Solidario · Aporte nacional solidario"
      subtitulo="Se calcula una sola vez sobre la suma de las bases de todos los trabajadores."
      pie={<TotalLibro etiqueta="Total aporte nacional solidario" valor={consolidado.ans} tono="ans" />}
    >
      <table className="w-full text-sm">
        <caption className="sr-only">Excedentes, tasas y aporte por tramo</caption>
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <th scope="col" className="pb-1.5 text-left font-semibold">Excedente sobre</th>
            <th scope="col" className="pb-1.5 text-right font-semibold">Base</th>
            <th scope="col" className="pb-1.5 text-right font-semibold">Tasa</th>
            <th scope="col" className="pb-1.5 text-right font-semibold">Aporte</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {TRAMOS_ANS.map((tramo) => (
            <tr key={tramo.aporte}>
              <th scope="row" className="py-2.5 text-left font-normal text-gray-800 dark:text-gray-100">
                {tramo.umbral}
              </th>
              <td className="py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{monto(totales[tramo.base])}</td>
              <td className="py-2.5 text-right tabular-nums text-gray-500 dark:text-gray-400">× {tramo.tasa}</td>
              <td className="py-2.5 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                {monto(consolidado[tramo.aporte])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Formulario>
  )
}

function TablaTrabajadores({ filas, totales }) {
  return (
    <div
      role="region"
      aria-label="Detalle por trabajador, desplazable"
      tabIndex={0}
      className="max-h-[min(62vh,40rem)] overflow-auto overscroll-contain rounded-2xl border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-gray-700"
    >
      <table className="min-w-[1280px] border-separate border-spacing-0 text-left">
        <caption className="sr-only">Aportes por trabajador en bolivianos</caption>
        <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_theme(colors.gray.200)] dark:shadow-[0_1px_0_0_theme(colors.gray.700)]">
          <tr>
            <th
              scope="col"
              rowSpan={2}
              className="sticky left-0 z-10 min-w-[13rem] border-t-2 border-t-gray-300 bg-gray-50 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:border-t-gray-600 dark:bg-gray-900 dark:text-gray-300"
            >
              Persona
            </th>
            {GRUPOS.map((grupo) =>
              grupo.titulo ? (
                <Encabezado key={grupo.tono} tono={grupo.tono} colSpan={grupo.columnas.length}>
                  {grupo.titulo}
                </Encabezado>
              ) : (
                <Encabezado key={grupo.tono} tono={grupo.tono} rowSpan={2} tasa={grupo.columnas[0].tasa} alto>
                  {grupo.columnas[0].etiqueta}
                </Encabezado>
              )
            )}
          </tr>
          <tr>
            {COLUMNAS_SUBGRUPO.map((columna) => (
              <Encabezado key={columna.campo} tono={columna.tono} tasa={columna.tasa} inicioGrupo={columna.inicioGrupo}>
                {columna.etiqueta}
              </Encabezado>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr>
              <td colSpan={COLUMNAS.length + 1} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay trabajadores habilitados con total ganado en este periodo.
              </td>
            </tr>
          ) : (
            filas.map((fila) => (
              <tr
                key={fila.personal_id}
                className="bg-white even:bg-gray-50 hover:bg-sky-50 dark:bg-gray-900 dark:even:bg-gray-800 dark:hover:bg-sky-950 [&>td]:border-b [&>td]:border-gray-100 dark:[&>td]:border-gray-800"
              >
                <td className={clsx(CELDA_FIJA, 'z-10 px-3 py-2.5')}>
                  <p className="max-w-[16rem] truncate text-sm font-semibold text-gray-900 dark:text-white" title={fila.nombre}>
                    {fila.nombre}
                  </p>
                  <p className="text-[11px] tabular-nums text-gray-500 dark:text-gray-400">CUA {fila.numero_cua || '—'}</p>
                </td>
                {COLUMNAS.map((columna) => (
                  <Celda
                    key={columna.campo}
                    valor={fila[columna.campo]}
                    tono={columna.tono}
                    fuerte={columna.fuerte}
                    inicioGrupo={columna.inicioGrupo}
                  />
                ))}
              </tr>
            ))
          )}
        </tbody>
        {filas.length > 0 ? (
          <tfoot className="sticky bottom-0 z-20">
            <tr className="bg-amber-50 dark:bg-amber-950 [&>td]:border-t-2 [&>td]:border-amber-300 dark:[&>td]:border-amber-800">
              <td className={clsx(CELDA_FIJA, 'z-10 px-3 py-3 text-sm font-bold text-amber-950 dark:text-amber-50')}>Totales</td>
              {COLUMNAS.map((columna) => (
                <td
                  key={columna.campo}
                  className={clsx(
                    'whitespace-nowrap px-3 py-3 text-right text-xs font-bold tabular-nums text-amber-950 dark:text-amber-50',
                    columna.inicioGrupo && 'border-l border-l-amber-200 dark:border-l-amber-900'
                  )}
                >
                  {importe(totales[columna.campo])}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  )
}

function AvisoOmitidos({ omitidos }) {
  const deshabilitados = omitidos.deshabilitados ?? 0
  const sinTotal = omitidos.sin_total_ganado ?? 0
  if (deshabilitados === 0 && sinTotal === 0) return null

  return (
    <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
      <AlertTriangle aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
      <span>
        {deshabilitados > 0 ? `${deshabilitados} deshabilitado${deshabilitados === 1 ? '' : 's'} fuera de la planilla. ` : ''}
        {sinTotal > 0 ? `${sinTotal} sin total ganado, no se incluyeron.` : ''}
      </span>
    </p>
  )
}

export default function PlanillaGestoraAportes({ planilla }) {
  const filas = planilla?.filas ?? []
  const totales = planilla?.totales ?? {}
  const consolidado = planilla?.consolidado ?? {}
  const omitidos = planilla?.omitidos ?? {}
  const etiqueta = planilla?.periodo?.etiqueta ?? ''
  const trabajadores = planilla?.trabajadores ?? 0

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>Planilla mensual</Eyebrow>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{etiqueta}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700">
              <Users aria-hidden="true" className="h-3.5 w-3.5" />
              {trabajadores} trabajadores
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800">
              Periodo activo
            </span>
          </div>
        </div>
        <AvisoOmitidos omitidos={omitidos} />
      </header>

      <div className="space-y-2">
        <EcuacionPago consolidado={consolidado} />
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Total general = depósito CNS + monto total Gestora. Los días trabajados no prorratean los porcentajes: el cálculo usa el total ganado del mes.
        </p>
      </div>

      <section aria-labelledby="planilla-consolidacion" className="space-y-3">
        <div>
          <Eyebrow as="h4" id="planilla-consolidacion">
            Consolidación Gestora
          </Eyebrow>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mismos montos que los formularios SIP y Fondo Solidario de la Gestora.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <FormularioSip consolidado={consolidado} />
          <FormularioFondoSolidario consolidado={consolidado} totales={totales} />
        </div>
      </section>

      <section aria-labelledby="planilla-detalle" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Eyebrow as="h4" id="planilla-detalle">
            Detalle por trabajador
          </Eyebrow>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Importes en bolivianos (Bs.)</p>
        </div>
        <TablaTrabajadores filas={filas} totales={totales} />
        <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          Deslizá horizontalmente para ver todas las columnas. Cada aporte se redondea a 2 decimales por trabajador y después se suma.
          La base del aporte nacional solidario es lo que el total ganado supera cada umbral; un excedente menor a Bs. 1 cuenta como 0.
        </p>
      </section>
    </div>
  )
}
