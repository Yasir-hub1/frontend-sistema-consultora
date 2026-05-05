/**
 * Normaliza mensajes inesperados provenientes del backend/integraciones.
 * Evita mostrar textos ajenos al flujo funcional de la app.
 */
export function sanitizeUiMessage(message, fallback = 'Ocurrió un problema al cargar la información.') {
  if (typeof message !== 'string') return fallback
  const clean = message.replace(/\s+/g, ' ').trim()
  if (!clean) return fallback

  const looksLikeExternalMemo =
    /(estimado|estimada)/i.test(clean) &&
    /(proceso de desarrollo|adecuaci[oó]n|base s[oó]lida|funcionalidades)/i.test(clean)

  if (looksLikeExternalMemo) {
    return 'Estamos actualizando funcionalidades. Vuelve a intentar en unos minutos.'
  }

  return clean
}
