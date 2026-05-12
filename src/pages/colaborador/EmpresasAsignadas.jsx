import ColaboradorMiEmpresaDocumentosPanel from '../../components/colaborador/ColaboradorMiEmpresaDocumentosPanel'
import EmpresasAsignadasPanel from '../../components/colaborador/EmpresasAsignadasPanel'
import ColaboradorShell, { staggerDelayMs } from '../../components/colaborador/ColaboradorShell'

export default function ColaboradorEmpresasAsignadas() {
  const motionStagger = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'

  return (
    <ColaboradorShell className="min-w-0">
      <div className="space-y-6">
        <div className={`min-w-0 ${motionStagger}`}>
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
            Empresas asignadas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Solo verás empresas cliente que el titular te haya asignado. Busca, pagina y entra al personal de cada
            una. Los PDF legales de cada empresa (NIT, ROE, etc.) los cargás acá; el cliente solo los ve y descarga
            en su portal «Mi empresa».
          </p>
        </div>

        <div className={motionStagger} style={{ animationDelay: `${staggerDelayMs(1)}ms` }}>
          <ColaboradorMiEmpresaDocumentosPanel />
        </div>

        <div className={motionStagger} style={{ animationDelay: `${staggerDelayMs(2)}ms` }}>
          <EmpresasAsignadasPanel variant="page" />
        </div>
      </div>
    </ColaboradorShell>
  )
}
