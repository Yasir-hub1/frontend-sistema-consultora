import { clsx } from 'clsx'

/** Wraps empresa-cliente pages: soft gradient mesh + readable content layer. */
export default function EmpresaClienteShell({ children, className }) {
  return (
    <div className={clsx('relative isolate', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 mx-auto h-[min(20rem,38vh)] max-w-6xl overflow-hidden"
      >
        <div className="absolute -left-28 top-0 h-[18rem] w-[18rem] rounded-full bg-gradient-to-br from-primary-400/20 via-primary-500/10 to-transparent blur-3xl dark:from-primary-500/15 dark:via-primary-700/10" />
        <div className="absolute -right-24 top-8 h-[16rem] w-[16rem] rounded-full bg-gradient-to-bl from-teal-400/18 via-emerald-400/8 to-transparent blur-3xl dark:from-teal-600/12 dark:via-emerald-800/8" />
        <div className="absolute left-1/2 top-[4.5rem] h-px w-[min(90%,36rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary-400/30 to-transparent dark:via-primary-500/20" />
      </div>
      {children}
    </div>
  )
}

/** Tailwind-friendly stagger delay (ms). Cap to keep long lists sensible. */
export function staggerDelayMs(index, step = 70, max = 420) {
  return Math.min(index * step, max)
}
