import { useEffect, useMemo, useState } from 'react'
import { clsx } from 'clsx'
import * as XLSX from 'xlsx'

/**
 * Lee un .xlsx / .xls desde Blob y devuelve hojas con filas (array de arrays).
 * @param {Blob} blob
 * @returns {Promise<{ name: string, rows: unknown[][] }[]>}
 */
export function parseDeclaracionExcelBlob(blob) {
  return blob.arrayBuffer().then((buf) => {
    const wb = XLSX.read(buf, { type: 'array' })
    return wb.SheetNames.map((name) => {
      const sheet = wb.Sheets[name]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      return { name, rows }
    })
  })
}

/**
 * Tabla de vista previa de Excel (solo valores; sin estilos ni merges).
 * @param {{ name: string, rows: unknown[][] }[]} sheets
 */
export default function DeclaracionExcelPreview({ sheets }) {
  const [tab, setTab] = useState(0)

  useEffect(() => {
    setTab(0)
  }, [sheets])

  const active = sheets[tab] ?? { name: '', rows: [] }
  const paddedRows = useMemo(() => {
    const rows = Array.isArray(active.rows) ? active.rows : []
    const maxC = rows.reduce((m, r) => Math.max(m, Array.isArray(r) ? r.length : 0), 0)
    return rows.map((r) => {
      const arr = Array.isArray(r) ? [...r] : []
      while (arr.length < maxC) arr.push('')
      return arr
    })
  }, [active.rows])

  if (!sheets?.length) {
    return <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Sin datos para mostrar.</p>
  }

  return (
    <div className="flex max-h-[min(75vh,720px)] flex-col bg-gray-50 dark:bg-gray-950/80">
      {sheets.length > 1 ? (
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 px-2 py-2 dark:border-gray-700">
          {sheets.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              type="button"
              onClick={() => setTab(i)}
              className={clsx(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                tab === i
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700'
              )}
            >
              {s.name || `Hoja ${i + 1}`}
            </button>
          ))}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <tbody>
            {paddedRows.length === 0 ? (
              <tr>
                <td className="border border-gray-200 px-3 py-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Hoja vacía
                </td>
              </tr>
            ) : (
              paddedRows.map((row, i) => (
                <tr
                  key={i}
                  className={clsx(
                    i === 0 &&
                      'bg-gray-100/95 font-semibold text-gray-900 dark:bg-gray-800/95 dark:text-gray-100'
                  )}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="max-w-[14rem] truncate border border-gray-200 px-2 py-1.5 text-gray-800 dark:border-gray-700 dark:text-gray-200"
                      title={cell != null && cell !== '' ? String(cell) : ''}
                    >
                      {cell != null && cell !== '' ? String(cell) : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="shrink-0 border-t border-gray-200 px-3 py-2 text-[10px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Vista previa de datos (sin formato Excel). Descarga el archivo para ver el diseño completo.
      </p>
    </div>
  )
}
