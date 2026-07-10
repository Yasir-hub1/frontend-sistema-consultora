import { clsx } from 'clsx'
import { estadoTramiteConfig } from '../../utils/tramiteUtils'

export default function TramiteProgreso({ pct = 0, estado, className, showLabel = true }) {
  const cfg = estadoTramiteConfig(estado)
  const value = Math.min(100, Math.max(0, Number(pct) || 0))

  return (
    <div className={clsx('space-y-1.5', className)}>
      {showLabel ? (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-600 dark:text-gray-400">Progreso</span>
          <span className="font-bold text-gray-900 dark:text-white">{value}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={clsx(
            'h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
            cfg.gradient
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
