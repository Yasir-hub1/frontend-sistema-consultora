import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { AlertTriangle, CalendarClock, CheckCircle2, Layers } from 'lucide-react'
import { motionStagger, staggerDelayMs } from '../../utils/tramiteUtils'

const CARDS = [
  {
    key: 'activos',
    label: 'Activos',
    desc: 'En curso o pendientes',
    icon: Layers,
    tone: 'from-primary-500/20 to-sky-500/10 text-primary-700 dark:text-primary-300 border-primary-200/60 dark:border-primary-800/50',
    iconBg: 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300',
    filter: '',
  },
  {
    key: 'proximos_vencer',
    label: 'Próximos a vencer',
    desc: 'Vencen en 7 días',
    icon: CalendarClock,
    tone: 'from-amber-500/15 to-orange-500/10 text-amber-800 dark:text-amber-200 border-amber-200/60 dark:border-amber-800/50',
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    filter: 'proximos',
  },
  {
    key: 'vencidos',
    label: 'Vencidos',
    desc: 'Requieren atención',
    icon: AlertTriangle,
    tone: 'from-red-500/15 to-rose-500/10 text-red-800 dark:text-red-200 border-red-200/60 dark:border-red-800/50',
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200',
    filter: 'vencido',
  },
  {
    key: 'completados',
    label: 'Completados',
    desc: 'Cerrados con éxito',
    icon: CheckCircle2,
    tone: 'from-emerald-500/15 to-teal-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/50',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200',
    filter: 'completado',
  },
]

export default function TramiteResumenCards({ resumen, basePath, className }) {
  const data = resumen || {}

  return (
    <div className={clsx('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {CARDS.map((c, idx) => {
        const Icon = c.icon
        const count = data[c.key] ?? 0
        return (
          <Link
            key={c.key}
            to={c.filter ? `${basePath}?estado=${c.filter}` : basePath}
            className={clsx(
              'group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] motion-reduce:transform-none',
              c.tone,
              motionStagger
            )}
            style={{ animationDelay: `${staggerDelayMs(idx)}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums">{count}</p>
                <p className="mt-1 text-xs opacity-75">{c.desc}</p>
              </div>
              <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', c.iconBg)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl transition group-hover:scale-110 dark:bg-white/5" />
          </Link>
        )
      })}
    </div>
  )
}
