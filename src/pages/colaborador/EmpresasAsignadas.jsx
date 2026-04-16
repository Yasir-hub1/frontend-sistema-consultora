import EmpresasAsignadasPanel from '../../components/colaborador/EmpresasAsignadasPanel'

export default function ColaboradorEmpresasAsignadas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Empresas asignadas</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Solo verás empresas cliente que el titular te haya asignado. Busca, pagina y entra al personal de cada
          una.
        </p>
      </div>

      <EmpresasAsignadasPanel variant="page" />
    </div>
  )
}
