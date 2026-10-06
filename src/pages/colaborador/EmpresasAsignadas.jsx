import EmpresasAsignadasPanel from '../../components/colaborador/EmpresasAsignadasPanel'
import ColaboradorShell, { staggerDelayMs } from '../../components/colaborador/ColaboradorShell'

const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

export default function ColaboradorEmpresasAsignadas() {
  return (
    <ColaboradorShell className="min-w-0">
      <div className="space-y-6">
        <header className={`min-w-0 ${motionStagger}`}>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">Empresas asignadas</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Las empresas cliente con las que trabajás. En cada una, <strong className="font-semibold text-gray-800 dark:text-gray-200">Ver personal</strong>{' '}
            abre su personal y <strong className="font-semibold text-gray-800 dark:text-gray-200">Documentos</strong> los PDFs de la empresa.
          </p>
        </header>

        <div className={motionStagger} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
          <EmpresasAsignadasPanel variant="page" />
        </div>
      </div>
    </ColaboradorShell>
  )
}
