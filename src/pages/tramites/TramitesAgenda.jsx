import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import TramitesCalendario from '../../components/tramites/TramitesCalendario'
import { useTramiteContext } from '../../hooks/useTramiteContext'
import { motionStagger, staggerDelayMs } from '../../utils/tramiteUtils'

export default function TramitesAgendaPage() {
  const { rol, basePath } = useTramiteContext()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${motionStagger}`}>
        <div>
          <Link
            to={basePath}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a trámites
          </Link>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/60 px-3 py-1 text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-300">
            <CalendarDays className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wide sm:text-xs">Agenda</span>
          </div>
          <h1 className="mt-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
            Calendario de vencimientos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Fechas de <strong className="font-medium text-gray-800 dark:text-gray-200">vencimiento</strong> de
            trámites. Cada evento muestra empresa, tipo y estado con color.
          </p>
        </div>
      </div>

      <div className={motionStagger} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
        <TramitesCalendario
          rol={rol}
          onSelectEvent={(ev) => navigate(`${basePath}/${ev.tramite_id ?? ev.id}`)}
        />
      </div>
    </div>
  )
}
