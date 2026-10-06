import { formatFileSize } from './formatters'

export const LIMITE_PDF_BYTES = 10 * 1024 * 1024

const fechaCorta = new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

export function esPdf(file) {
  if (!(file instanceof File)) return false
  if (file.type) return file.type === 'application/pdf'
  return file.name.toLowerCase().endsWith('.pdf')
}

export function problemaPdf(file) {
  if (!esPdf(file)) return 'Solo se aceptan archivos PDF.'
  if (file.size > LIMITE_PDF_BYTES) return 'El PDF supera los 10 MB.'
  return null
}

export function tamanoArchivo(bytes) {
  const n = Number(bytes)
  return Number.isFinite(n) && n > 0 ? formatFileSize(n) : '—'
}

export function fechaSubida(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : fechaCorta.format(d)
}
