import { clsx } from 'clsx'
import { estadoTramiteConfig } from '../../utils/tramiteUtils'

export default function TramiteEstadoBadge({ estado, className, showDot = true }) {
  const cfg = estadoTramiteConfig(estado)
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        cfg.badge,
        className
      )}
    >
      {showDot ? <span className={clsx('h-1.5 w-1.5 rounded-full', cfg.dot)} aria-hidden /> : null}
      {cfg.label}
    </span>
  )
}
