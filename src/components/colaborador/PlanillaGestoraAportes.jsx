import { clsx } from 'clsx'
import { formatBolivianos } from '../../utils/formatters'

function monto(valor) {
  return formatBolivianos(valor)
}

function Celda({ children, tono = 'base', fuerte = false }) {
  const tonos = {
    base: 'text-gray-700 dark:text-gray-200',
    cns: 'text-sky-800 dark:text-sky-200',
    sip: 'text-indigo-900 dark:text-indigo-100',
    vivienda: 'text-emerald-800 dark:text-emerald-200',
    solidario: 'text-rose-800 dark:text-rose-200',
    total: 'font-semibold text-amber-950 dark:text-amber-100',
  }

  return (
    <td
      className={clsx(
        'whitespace-nowrap px-2.5 py-2.5 text-right text-xs tabular-nums',
        tonos[tono],
        fuerte && 'font-semibold'
      )}
    >
      {children}
    </td>
  )
}

function Encabezado({ children, tono, rowSpan, colSpan, className }) {
  const tonos = {
    base: 'bg-gray-50 text-gray-500 dark:bg-gray-800/90 dark:text-gray-300',
    cns: 'bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-100',
    sip: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100',
    vivienda: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
    solidario: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100',
  }

  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      className={clsx(
        'whitespace-nowrap px-2.5 py-2 text-center text-[10px] font-bold uppercase tracking-wide',
        tonos[tono],
        className
      )}
    >
      {children}
    </th>
  )
}

function FilaDesglose({ etiqueta, valor }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 text-sm last:border-0 dark:border-gray-800">
      <span className="text-gray-600 dark:text-gray-300">{etiqueta}</span>
      <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{monto(valor)}</span>
    </div>
  )
}

export default function PlanillaGestoraAportes({ planilla }) {
  const filas = planilla?.filas ?? []
  const totales = planilla?.totales ?? {}
  const consolidado = planilla?.consolidado ?? {}
  const omitidos = planilla?.omitidos ?? {}
  const etiqueta = planilla?.periodo?.etiqueta ?? ''

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Bloque A · Tabla matricial
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Planilla mensual — {etiqueta}</h3>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800">
          Periodo activo
        </span>
      </div>

      {(omitidos.deshabilitados > 0 || omitidos.sin_total_ganado > 0) && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
          {omitidos.deshabilitados > 0
            ? `${omitidos.deshabilitados} deshabilitado${omitidos.deshabilitados === 1 ? '' : 's'} fuera de la planilla. `
            : ''}
          {omitidos.sin_total_ganado > 0
            ? `${omitidos.sin_total_ganado} sin total ganado, no se incluyeron.`
            : ''}
        </p>
      )}

      <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-gray-200 shadow-sm dark:border-gray-700">
        <table className="min-w-[1180px] border-collapse text-left">
          <thead>
            <tr>
              <Encabezado tono="base" rowSpan={2} className="sticky left-0 z-20 min-w-[12rem] text-left">
                Persona
              </Encabezado>
              <Encabezado tono="base" rowSpan={2}>
                Total ganado
              </Encabezado>
              <Encabezado tono="cns" rowSpan={2}>
                Depósito CNS
                <span className="mt-0.5 block font-medium normal-case tracking-normal">10%</span>
              </Encabezado>
              <Encabezado tono="sip" colSpan={5}>
                SIP / Gestora
              </Encabezado>
              <Encabezado tono="vivienda" rowSpan={2}>
                Aporte vivienda
                <span className="mt-0.5 block font-medium normal-case tracking-normal">2%</span>
              </Encabezado>
              <Encabezado tono="solidario" colSpan={6}>
                Aportes solidarios
              </Encabezado>
            </tr>
            <tr>
              <Encabezado tono="sip">Jubilación 10%</Encabezado>
              <Encabezado tono="sip">Riesgo prof. 1,71%</Encabezado>
              <Encabezado tono="sip">Riesgo com. 1,71%</Encabezado>
              <Encabezado tono="sip">Comisión 0,50%</Encabezado>
              <Encabezado tono="sip">Subtotal SIP</Encabezado>
              <Encabezado tono="solidario">Patronal 3,50%</Encabezado>
              <Encabezado tono="solidario">Asegurado 0,50%</Encabezado>
              <Encabezado tono="solidario">Fondo 1,15%</Encabezado>
              <Encabezado tono="solidario">Fondo 5,74%</Encabezado>
              <Encabezado tono="solidario">Fondo 11,48%</Encabezado>
              <Encabezado tono="solidario">Subtotal</Encabezado>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/40">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-10 text-center text-sm text-gray-500">
                  No hay trabajadores habilitados con total ganado en este periodo.
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.personal_id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2.5 dark:bg-gray-900">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{fila.nombre}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">CUA {fila.numero_cua || '—'}</p>
                  </td>
                  <Celda fuerte>{monto(fila.total_ganado)}</Celda>
                  <Celda tono="cns">{monto(fila.cns)}</Celda>
                  <Celda tono="sip">{monto(fila.jubilacion)}</Celda>
                  <Celda tono="sip">{monto(fila.riesgo_profesional)}</Celda>
                  <Celda tono="sip">{monto(fila.riesgo_comun)}</Celda>
                  <Celda tono="sip">{monto(fila.comision)}</Celda>
                  <Celda tono="sip" fuerte>
                    {monto(fila.subtotal_sip)}
                  </Celda>
                  <Celda tono="vivienda">{monto(fila.vivienda)}</Celda>
                  <Celda tono="solidario">{monto(fila.patronal_solidario)}</Celda>
                  <Celda tono="solidario">{monto(fila.asegurado_solidario)}</Celda>
                  <Celda tono="solidario">{monto(fila.fondo_1)}</Celda>
                  <Celda tono="solidario">{monto(fila.fondo_5)}</Celda>
                  <Celda tono="solidario">{monto(fila.fondo_10)}</Celda>
                  <Celda tono="solidario" fuerte>
                    {monto(fila.subtotal_solidarios)}
                  </Celda>
                </tr>
              ))
            )}
          </tbody>
          {filas.length > 0 ? (
            <tfoot>
              <tr className="bg-amber-100/90 dark:bg-amber-950/40">
                <td className="sticky left-0 z-10 bg-amber-100 px-3 py-3 text-sm font-bold text-amber-950 dark:bg-amber-950 dark:text-amber-50">
                  Totales
                </td>
                <Celda tono="total">{monto(totales.total_ganado)}</Celda>
                <Celda tono="total">{monto(totales.cns)}</Celda>
                <Celda tono="total">{monto(totales.jubilacion)}</Celda>
                <Celda tono="total">{monto(totales.riesgo_profesional)}</Celda>
                <Celda tono="total">{monto(totales.riesgo_comun)}</Celda>
                <Celda tono="total">{monto(totales.comision)}</Celda>
                <Celda tono="total">{monto(totales.subtotal_sip)}</Celda>
                <Celda tono="total">{monto(totales.vivienda)}</Celda>
                <Celda tono="total">{monto(totales.patronal_solidario)}</Celda>
                <Celda tono="total">{monto(totales.asegurado_solidario)}</Celda>
                <Celda tono="total">{monto(totales.fondo_1)}</Celda>
                <Celda tono="total">{monto(totales.fondo_5)}</Celda>
                <Celda tono="total">{monto(totales.fondo_10)}</Celda>
                <Celda tono="total">{monto(totales.subtotal_solidarios)}</Celda>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Deslizá horizontalmente para ver CNS, SIP, vivienda y los fondos solidarios. Cada concepto se redondea a 2 decimales por trabajador y después se suma.
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Bloque B · Consolidación AFP / Gestora
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Referencia de consolidación para SIP + vivienda + aportes solidarios. {planilla?.trabajadores ?? 0} trabajadores.
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Monto total Gestora a pagar</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Incluye el aporte nacional solidario por tramos.</p>
            <div className="mt-3 rounded-xl bg-sky-50 px-4 py-3 dark:bg-sky-950/40">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
                Referencia 19,42% / 19,92%
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
                {monto(consolidado.gestora)}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-sky-900/80 dark:text-sky-100/80">
                SIP 13,92% + vivienda 2% + patronal solidario 3,50% = 19,42% ({monto(consolidado.referencia_1942)}).
                Con el 0,50% del asegurado = 19,92% ({monto(consolidado.referencia_1992)}).
              </p>
            </div>
            <div className="mt-3">
              <FilaDesglose etiqueta="SIP / Gestora" valor={consolidado.sip} />
              <FilaDesglose etiqueta="Aporte vivienda" valor={consolidado.vivienda} />
              <FilaDesglose etiqueta="Aportes solidarios" valor={consolidado.solidarios} />
              <FilaDesglose etiqueta="De ese solidario, aporte nacional" valor={consolidado.ans} />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Cómo se calcula</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                <li>CNS = total ganado × 10%.</li>
                <li>Gestora plana = total ganado × 19,92% (jubilación, riesgos, comisión, vivienda, patronal solidario y solidario del asegurado).</li>
                <li>
                  Aporte nacional solidario, solo si la diferencia es positiva: 1,15% × (total − 13.000) + 5,74% × (total − 25.000) + 11,48% × (total − 35.000).
                </li>
                <li>Ejemplo de Bs. 38.000: 287,50 + 746,20 + 344,40 = Bs. 1.378,10, además del 19,92%.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-sky-200 bg-white px-4 py-3 dark:border-sky-900 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Depósito CNS</span>
                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{monto(consolidado.cns)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-100 px-4 py-4 dark:bg-amber-950/50">
        <p className="text-sm font-bold uppercase tracking-wide text-amber-950 dark:text-amber-50">Total general a pagar</p>
        <p className="text-2xl font-bold tabular-nums text-amber-950 dark:text-amber-50">{monto(consolidado.total_general)}</p>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        El total general suma el depósito CNS y el monto Gestora. Los días trabajados no prorratean estos porcentajes: el cálculo usa el total ganado cargado en la pestaña.
      </p>
    </div>
  )
}
