import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { CheckCircle2, Circle, Download, Eye, RefreshCw, Upload } from 'lucide-react'
import Button from '../common/Button'
import { colaboradorService } from '../../services/colaboradorService'
import { empresaClienteService } from '../../services/empresaClienteService'
import { fechaSubida, problemaPdf, tamanoArchivo } from '../../utils/archivosPdf'
import { ErrorCarga } from './OtrosDocumentosEmpresa'

export const CATALOGO_LEGAL = empresaClienteService.DOCUMENTOS_MI_EMPRESA

const NOMBRES_LEGIBLES = {
  nit: 'NIT',
  roe: 'ROE',
  matricula_comercio: 'Matrícula de comercio',
  licencia_funcionamiento: 'Licencia de funcionamiento',
  certificado_patronal_caja: 'Certificado patronal de la Caja',
  formulario_inscripcion_gestora: 'Formulario de inscripción a la Gestora',
  certificacion_nit: 'Certificación de NIT',
}

function nombreLegible(doc) {
  return NOMBRES_LEGIBLES[doc.key] ?? doc.label
}

function useDocumentosLegales(empresaId) {
  const [subidos, setSubidos] = useState(new Map())
  const [estado, setEstado] = useState('cargando')

  const cargar = useCallback(async () => {
    setEstado('cargando')
    const res = await colaboradorService.listMiEmpresaDocumentos(empresaId)
    const items = res.success ? res.data?.items ?? [] : []
    setSubidos(new Map(items.filter((r) => r.subido).map((r) => [r.tipo_documento, r])))
    setEstado(res.success ? 'listo' : 'error')
  }, [empresaId])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { subidos, estado, cargar }
}

export function MedidorLegal({ cargados, total = CATALOGO_LEGAL.length, className }) {
  return (
    <span className={clsx('flex gap-0.5', className)} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={clsx('h-1.5 flex-1 rounded-full', i < cargados ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700')}
        />
      ))}
    </span>
  )
}

function FilaLegal({ doc, archivo, canSubir, subiendo, cargandoVista, onSubir, onVer, onDescargar }) {
  const inputRef = useRef(null)
  const subido = fechaSubida(archivo?.fecha_subida)
  const nombre = nombreLegible(doc)

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {archivo ? (
          <CheckCircle2 aria-label="Cargado" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Circle aria-label="Pendiente" className="mt-0.5 h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
        )}
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white">{nombre}</p>
          {archivo ? (
            <p className="truncate text-xs tabular-nums text-gray-500 dark:text-gray-400" title={archivo.nombre_original}>
              {archivo.nombre_original} · {tamanoArchivo(archivo.tamano_bytes)}
              {subido ? ` · ${subido}` : ''}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">Pendiente de cargar</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
        {archivo ? (
          <>
            <Button type="button" size="sm" variant="secondary" icon={<Eye className="h-4 w-4" />} loading={cargandoVista} onClick={onVer}>
              Ver
            </Button>
            <Button type="button" size="sm" variant="outline" icon={<Download className="h-4 w-4" />} onClick={onDescargar} aria-label={`Descargar ${nombre}`}>
              Descargar
            </Button>
          </>
        ) : null}
        {canSubir ? (
          <>
            <Button
              type="button"
              size="sm"
              variant={archivo ? 'ghost' : 'primary'}
              icon={archivo ? <RefreshCw className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              loading={subiendo}
              onClick={() => inputRef.current?.click()}
              aria-label={`${archivo ? 'Reemplazar' : 'Subir'} ${nombre}`}
            >
              {archivo ? 'Reemplazar' : 'Subir PDF'}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) onSubir(file)
              }}
            />
          </>
        ) : null}
      </div>
    </li>
  )
}

/**
 * @param {{
 *   empresaId: number,
 *   canSubir: boolean,
 *   previa: ReturnType<typeof import('./VistaPreviaPdf').useVistaPreviaPdf>,
 *   onCantidad?: (cantidad: number) => void,
 * }} props
 */
export default function DocumentosLegalesEmpresa({ empresaId, canSubir, previa, onCantidad }) {
  const { subidos, estado, cargar } = useDocumentosLegales(empresaId)
  const [subiendoClave, setSubiendoClave] = useState(null)
  const onCantidadRef = useRef(onCantidad)
  const cargados = useMemo(() => CATALOGO_LEGAL.filter((doc) => subidos.has(doc.key)).length, [subidos])

  useEffect(() => {
    onCantidadRef.current = onCantidad
  }, [onCantidad])

  useEffect(() => {
    if (estado === 'listo') onCantidadRef.current?.(cargados)
  }, [estado, cargados])

  const subir = async (doc, file) => {
    const problema = problemaPdf(file)
    if (problema) {
      toast.error(problema)
      return
    }
    setSubiendoClave(doc.key)
    const res = await colaboradorService.uploadMiEmpresaDocumento(empresaId, doc.key, file)
    setSubiendoClave(null)
    if (!res.success) {
      toast.error(res.message || 'No se pudo subir el documento.')
      return
    }
    toast.success(`${nombreLegible(doc)} cargado.`)
    cargar()
  }

  const descargar = async (doc, archivo) => {
    try {
      await colaboradorService.descargarMiEmpresaDocumento(empresaId, doc.key, archivo.nombre_original || `${doc.key}.pdf`)
    } catch {
      toast.error('No se pudo descargar el documento.')
    }
  }

  const ver = (doc, archivo) =>
    previa.abrir({
      clave: `legal-${doc.key}`,
      titulo: nombreLegible(doc),
      obtener: () => colaboradorService.fetchMiEmpresaDocumentoVistaPreviaBlob(empresaId, doc.key),
      descargar: () => descargar(doc, archivo),
    })

  if (estado === 'error') return <ErrorCarga onReintentar={cargar} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {canSubir
            ? 'Cargás estos PDFs en nombre del cliente. En su portal «Mi empresa» los ve y descarga.'
            : 'Estos PDFs los ve y descarga el cliente en su portal «Mi empresa».'}
        </p>
        {estado === 'listo' ? (
          <div className="flex shrink-0 items-center gap-2">
            <MedidorLegal cargados={cargados} className="w-24" />
            <span className="text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-200">
              {cargados} de {CATALOGO_LEGAL.length}
            </span>
          </div>
        ) : null}
      </div>

      <ul
        aria-busy={estado === 'cargando'}
        className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-700 dark:bg-gray-900/30"
      >
        {CATALOGO_LEGAL.map((doc) =>
          estado === 'cargando' ? (
            <li key={doc.key} className="flex items-center gap-3 px-4 py-4">
              <span className="h-5 w-5 animate-pulse rounded-full bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
              <span className="text-sm text-gray-400">{nombreLegible(doc)}</span>
            </li>
          ) : (
            <FilaLegal
              key={doc.key}
              doc={doc}
              archivo={subidos.get(doc.key)}
              canSubir={canSubir}
              subiendo={subiendoClave === doc.key}
              cargandoVista={previa.cargando === `legal-${doc.key}`}
              onSubir={(file) => subir(doc, file)}
              onVer={() => ver(doc, subidos.get(doc.key))}
              onDescargar={() => descargar(doc, subidos.get(doc.key))}
            />
          )
        )}
      </ul>
    </div>
  )
}
