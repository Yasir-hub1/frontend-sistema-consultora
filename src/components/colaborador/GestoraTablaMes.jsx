import { useCallback, useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { CopyCheck, Pencil, Power, RotateCcw, Save } from 'lucide-react'
import Button from '../common/Button'
import { formatBolivianos } from '../../utils/formatters'

const DIAS_VALIDOS = /^\d{1,2}$/
const MONTO_VALIDO = /^\d{1,8}(\.\d{1,2})?$/
const CAMPO_DIAS = 'dias'
const CAMPO_TOTAL = 'total'

function textoDias(valor) {
  return String(valor ?? '').trim()
}

function textoTotal(valor) {
  return String(valor ?? '').trim().replace(',', '.')
}

function diasValidos(valor) {
  return DIAS_VALIDOS.test(valor) && Number(valor) <= 31
}

function mismosDias(a, b) {
  return diasValidos(a) && diasValidos(b) ? Number(a) === Number(b) : a === b
}

function mismoTotal(a, b) {
  return MONTO_VALIDO.test(a) && MONTO_VALIDO.test(b) ? Number(a).toFixed(2) === Number(b).toFixed(2) : a === b
}

function evaluarFila(row, borrador) {
  const dias = borrador?.[CAMPO_DIAS] ?? String(row.dias_trabajados ?? '')
  const total = borrador?.[CAMPO_TOTAL] ?? String(row.total_ganado ?? '')
  const diasLimpios = textoDias(dias)
  const totalLimpio = textoTotal(total)
  return {
    dias,
    total,
    modificada:
      row.habilitado &&
      (!mismosDias(diasLimpios, String(row.dias_trabajados ?? '')) || !mismoTotal(totalLimpio, String(row.total_ganado ?? ''))),
    errorDias: diasValidos(diasLimpios) ? null : 'Días: entero de 0 a 31.',
    errorTotal: MONTO_VALIDO.test(totalLimpio) ? null : 'Total: monto como 8500.00.',
    filaGuardable: { personal_id: row.id, dias_trabajados: Number(diasLimpios), total_ganado: totalLimpio },
  }
}

export function useEdicionMes(rows) {
  const [borradores, setBorradores] = useState({})

  const evaluaciones = useMemo(() => new Map(rows.map((row) => [row.id, evaluarFila(row, borradores[row.id])])), [rows, borradores])
  const habilitadas = useMemo(() => rows.filter((row) => row.habilitado), [rows])
  const modificadas = useMemo(() => [...evaluaciones.values()].filter((fila) => fila.modificada), [evaluaciones])
  const conError = modificadas.filter((fila) => fila.errorDias || fila.errorTotal).length

  const cambiar = useCallback((id, campo, valor) => {
    setBorradores((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }))
  }, [])

  const aplicarATodos = useCallback(
    (origenId, campo) => {
      const valor = evaluaciones.get(origenId)?.[campo]
      if (valor == null) return
      setBorradores((prev) => {
        const next = { ...prev }
        for (const row of habilitadas) next[row.id] = { ...next[row.id], [campo]: valor }
        return next
      })
    },
    [evaluaciones, habilitadas]
  )

  const descartar = useCallback(() => setBorradores({}), [])

  return {
    evaluaciones,
    habilitadasEnPagina: habilitadas.length,
    cambios: modificadas.length,
    conError,
    filasGuardables: modificadas.map((fila) => fila.filaGuardable),
    cambiar,
    aplicarATodos,
    descartar,
  }
}

function moverFoco(evento, campo) {
  if (evento.key !== 'Enter') return
  evento.preventDefault()
  const campos = [...(evento.currentTarget.closest('[data-tabla-mes]')?.querySelectorAll(`[data-campo="${campo}"]`) ?? [])]
  const actual = campos.indexOf(evento.currentTarget)
  campos[actual + (evento.shiftKey ? -1 : 1)]?.focus()
}

function BotonATodos({ etiqueta, valorVisible, nombre, deshabilitado, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      title={`Copiar ${valorVisible} a las demás personas habilitadas de la página`}
      aria-label={`Copiar ${etiqueta} de ${nombre} a las demás personas habilitadas de la página`}
      className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-gray-500 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-primary-900/40 dark:hover:text-primary-200"
    >
      <CopyCheck aria-hidden="true" className="h-3.5 w-3.5" />
      A todos
    </button>
  )
}

function CampoDias({ fila, nombre, mostrarATodos, onCambiar, onAplicarATodos }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        data-campo={CAMPO_DIAS}
        aria-label={`Días trabajados de ${nombre}`}
        aria-invalid={fila.errorDias ? 'true' : undefined}
        title={fila.errorDias || undefined}
        value={fila.dias}
        onChange={(e) => onCambiar(e.target.value)}
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => moverFoco(e, CAMPO_DIAS)}
        className={clsx(
          'input h-9 w-16 rounded-lg px-2 text-right text-sm tabular-nums',
          fila.errorDias && 'border-red-400 ring-1 ring-red-300 dark:border-red-500'
        )}
      />
      {mostrarATodos ? (
        <BotonATodos
          etiqueta="los días"
          valorVisible={`${fila.dias} días`}
          nombre={nombre}
          deshabilitado={Boolean(fila.errorDias)}
          onClick={onAplicarATodos}
        />
      ) : null}
    </div>
  )
}

function CampoTotal({ fila, nombre, mostrarATodos, onCambiar, onAplicarATodos }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="relative w-36">
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-gray-400">Bs.</span>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          data-campo={CAMPO_TOTAL}
          aria-label={`Total ganado de ${nombre}`}
          aria-invalid={fila.errorTotal ? 'true' : undefined}
          title={fila.errorTotal || undefined}
          value={fila.total}
          onChange={(e) => onCambiar(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => moverFoco(e, CAMPO_TOTAL)}
          className={clsx(
            'input h-9 w-full rounded-lg pl-9 pr-2 text-right text-sm font-semibold tabular-nums',
            fila.errorTotal && 'border-red-400 ring-1 ring-red-300 dark:border-red-500'
          )}
        />
      </div>
      {mostrarATodos ? (
        <BotonATodos
          etiqueta="el total ganado"
          valorVisible={`Bs. ${fila.total}`}
          nombre={nombre}
          deshabilitado={Boolean(fila.errorTotal)}
          onClick={onAplicarATodos}
        />
      ) : null}
    </div>
  )
}

function ValorSoloLectura({ children, fuerte = false }) {
  return (
    <p className={clsx('text-right tabular-nums', fuerte ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300')}>
      {children}
    </p>
  )
}

function ValorExcluido({ children }) {
  return <p className="text-right tabular-nums text-gray-400 line-through decoration-gray-300 dark:text-gray-500 dark:decoration-gray-600">{children}</p>
}

function AccionesFila({ row, toggling, onEditar, onAlternar }) {
  return (
    <div className="inline-flex items-center justify-end gap-1">
      {row.habilitado ? (
        <button
          type="button"
          onClick={onEditar}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/40"
        >
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          Editar
        </button>
      ) : null}
      <button
        type="button"
        disabled={toggling}
        onClick={onAlternar}
        className={clsx(
          'inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold disabled:opacity-50',
          row.habilitado
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
            : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800'
        )}
      >
        <Power aria-hidden="true" className="h-3.5 w-3.5" />
        {row.habilitado ? 'Deshabilitar' : 'Habilitar'}
      </button>
    </div>
  )
}

function NombrePersona({ row }) {
  return (
    <>
      <p className={clsx('font-medium', row.habilitado ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>{row.nombre}</p>
      {row.habilitado ? null : (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
          Deshabilitado · no cuenta este mes
        </p>
      )}
    </>
  )
}

function BarraGuardado({ cambios, conError, guardando, onGuardar, onDescartar }) {
  if (cambios === 0) return null
  return (
    <div
      role="status"
      className="sticky bottom-3 z-10 mt-4 flex flex-col gap-3 rounded-xl border border-primary-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-primary-800 dark:bg-gray-900/95 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-gray-700 dark:text-gray-200">
        <span className="font-semibold tabular-nums">{cambios}</span> {cambios === 1 ? 'persona con cambios' : 'personas con cambios'} sin guardar
        {conError > 0 ? <span className="text-red-600 dark:text-red-400"> · {conError} con datos inválidos</span> : null}
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} disabled={guardando} onClick={onDescartar}>
          Descartar
        </Button>
        <Button type="button" size="sm" icon={<Save className="h-4 w-4" />} loading={guardando} disabled={conError > 0} onClick={onGuardar}>
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}

function CeldaDias({ row, campos, editable }) {
  if (!row.habilitado) return <ValorExcluido>{row.dias_trabajados}</ValorExcluido>
  if (!editable) return <ValorSoloLectura>{row.dias_trabajados}</ValorSoloLectura>
  return <CampoDias {...campos} onCambiar={campos.onCambiarDias} onAplicarATodos={campos.onDiasATodos} />
}

function CeldaTotal({ row, campos, editable }) {
  if (!row.habilitado) return <ValorExcluido>{formatBolivianos(row.total_ganado)}</ValorExcluido>
  if (!editable) return <ValorSoloLectura fuerte>{formatBolivianos(row.total_ganado)}</ValorSoloLectura>
  return <CampoTotal {...campos} onCambiar={campos.onCambiarTotal} onAplicarATodos={campos.onTotalATodos} />
}

export default function GestoraTablaMes({ rows, canEdit, edicion, guardando, togglingId, onGuardar, onEditarLegajo, onAlternar }) {
  const columnaEncabezado = 'px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'

  const camposDe = (row) => ({
    fila: edicion.evaluaciones.get(row.id),
    nombre: row.nombre,
    mostrarATodos: edicion.habilitadasEnPagina > 1,
    onCambiarDias: (valor) => edicion.cambiar(row.id, CAMPO_DIAS, valor),
    onCambiarTotal: (valor) => edicion.cambiar(row.id, CAMPO_TOTAL, valor),
    onDiasATodos: () => edicion.aplicarATodos(row.id, CAMPO_DIAS),
    onTotalATodos: () => edicion.aplicarATodos(row.id, CAMPO_TOTAL),
  })

  const acciones = (row) =>
    canEdit ? (
      <AccionesFila row={row} toggling={togglingId === row.id} onEditar={() => onEditarLegajo(row.id)} onAlternar={() => onAlternar(row)} />
    ) : (
      <span className="text-xs text-gray-400">Solo lectura</span>
    )

  return (
    <>
      <ul data-tabla-mes className="space-y-3 md:hidden">
        {rows.map((row) => {
          const campos = camposDe(row)
          return (
            <li
              key={row.id}
              className={clsx(
                'rounded-xl border p-4',
                !row.habilitado && 'border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900',
                row.habilitado && campos.fila?.modificada && 'border-primary-300 bg-white dark:border-primary-700 dark:bg-gray-900/50',
                row.habilitado && !campos.fila?.modificada && 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/50'
              )}
            >
              <NombrePersona row={row} />
              <p className="mt-0.5 text-xs text-gray-500">CUA/RUA {row.numero_cua || '—'}</p>
              <div className="mt-3 grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Días</p>
                  <CeldaDias row={row} campos={campos} editable={canEdit} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Total ganado</p>
                  <CeldaTotal row={row} campos={campos} editable={canEdit} />
                </div>
              </div>
              <div className="mt-3 flex justify-end border-t border-gray-100 pt-2 dark:border-gray-800">{acciones(row)}</div>
            </li>
          )
        })}
      </ul>

      <div data-tabla-mes className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 md:block">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/90">
            <tr>
              <th scope="col" className={columnaEncabezado}>
                Persona
              </th>
              <th scope="col" className={columnaEncabezado}>
                CUA/RUA
              </th>
              <th scope="col" className={clsx(columnaEncabezado, 'text-right')}>
                Días trabajados
              </th>
              <th scope="col" className={clsx(columnaEncabezado, 'text-right')}>
                Total ganado
              </th>
              <th scope="col" className={clsx(columnaEncabezado, 'text-right')}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
            {rows.map((row) => {
              const campos = camposDe(row)
              return (
                <tr
                  key={row.id}
                  className={clsx(
                    'transition-colors',
                    !row.habilitado && 'bg-gray-50 dark:bg-gray-900/70',
                    row.habilitado && campos.fila?.modificada && 'bg-primary-50/60 shadow-[inset_3px_0_0_0_theme(colors.primary.500)] dark:bg-primary-950/30',
                    row.habilitado && !campos.fila?.modificada && 'hover:bg-gray-50/90 dark:hover:bg-gray-800/50'
                  )}
                >
                  <td className="px-4 py-2.5">
                    <NombrePersona row={row} />
                  </td>
                  <td className={clsx('whitespace-nowrap px-4 py-2.5 tabular-nums', row.habilitado ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400')}>
                    {row.numero_cua || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <CeldaDias row={row} campos={campos} editable={canEdit} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <CeldaTotal row={row} campos={campos} editable={canEdit} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">{acciones(row)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {canEdit ? (
        <BarraGuardado
          cambios={edicion.cambios}
          conError={edicion.conError}
          guardando={guardando}
          onGuardar={onGuardar}
          onDescartar={edicion.descartar}
        />
      ) : null}
    </>
  )
}
