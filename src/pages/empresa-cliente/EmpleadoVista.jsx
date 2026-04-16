import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import { empresaClienteService } from '../../services/empresaClienteService'

const tabs = ['afp', 'caja', 'ministerio']

export default function EmpresaClienteEmpleadoVista() {
  const { personalId } = useParams()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('afp')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    let c = false
    ;(async () => {
      const res = await empresaClienteService.getPersonal(personalId)
      if (c) return
      if (res.success) setData(res.data)
      else setMsg(res.message)
    })()
    return () => {
      c = true
    }
  }, [personalId])

  const docs =
    tab === 'afp'
      ? data?.documentos_afp ?? data?.afp?.documentos ?? []
      : tab === 'caja'
        ? data?.documentos_caja ?? data?.caja?.documentos ?? []
        : data?.documentos_ministerio ?? data?.ministerio?.documentos ?? []

  const solicitarDescarga = async (docId) => {
    const res = await empresaClienteService.getUrlDescargaDocumento(docId)
    if (res.success && res.data?.url) {
      window.open(res.data.url, '_blank', 'noopener,noreferrer')
    } else {
      setMsg(res.message || 'No se pudo obtener enlace de descarga')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {data ? `${data.nombres} ${data.apellidos}` : 'Empleado'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Documentos visibles y descarga con URL firmada (solo lectura).
        </p>
      </div>

      {msg && <p className="text-sm text-amber-800 dark:text-amber-200">{msg}</p>}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card title={`Documentos ${tab.toUpperCase()}`}>
        {!Array.isArray(docs) || docs.length === 0 ? (
          <p className="text-sm text-gray-500">No hay documentos en este módulo.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>{d.nombre_original ?? d.tipo_documento?.nombre}</span>
                <button
                  type="button"
                  onClick={() => solicitarDescarga(d.id)}
                  className="text-primary-600 hover:underline"
                >
                  Descargar
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
