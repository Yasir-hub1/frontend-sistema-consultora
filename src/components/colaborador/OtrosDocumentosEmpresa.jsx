import { useCallback, useEffect, useId, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { Download, Eye, FileText, FileUp, RotateCcw, Upload, X } from 'lucide-react'
import Button from '../common/Button'
import { colaboradorService } from '../../services/colaboradorService'
import { fechaSubida, problemaPdf, tamanoArchivo } from '../../utils/archivosPdf'

const LIMITE_DESCRIPCION = 2000

function useOtrosDocumentos(empresaId) {
  const [items, setItems] = useState([])
  const [estado, setEstado] = useState('cargando')

  const cargar = useCallback(async () => {
    setEstado('cargando')
    const res = await colaboradorService.listOtrosDocumentosEmpresa(empresaId)
    setItems(res.success ? res.data.items : [])
    setEstado(res.success ? 'listo' : 'error')
  }, [empresaId])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { items, estado, cargar }
}

function ZonaArchivo({ archivo, onElegir, onQuitar }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [arrastrando, setArrastrando] = useState(false)

  const elegir = (file) => {
    if (!file) return
    const problema = problemaPdf(file)
    if (problema) {
      toast.error(problema)
      return
    }
    onElegir(file)
  }

  if (archivo) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/70 px-3 py-2.5 dark:border-primary-800 dark:bg-primary-950/30">
        <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-300" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{archivo.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{tamanoArchivo(archivo.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onQuitar()
            if (inputRef.current) inputRef.current.value = ''
          }}
          aria-label={`Quitar ${archivo.name}`}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-white hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault()
        setArrastrando(true)
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault()
        setArrastrando(false)
        elegir(e.dataTransfer.files?.[0])
      }}
      className={clsx(
        'flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900',
        arrastrando
          ? 'border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-950/40'
          : 'border-gray-300 bg-white hover:border-primary-300 hover:bg-primary-50/40 dark:border-gray-600 dark:bg-gray-900/40 dark:hover:border-primary-700'
      )}
    >
      <FileUp aria-hidden="true" className="h-6 w-6 text-primary-600 dark:text-primary-300" />
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Arrastrá un PDF o elegilo desde tu equipo</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">Un archivo por vez · hasta 10 MB</span>
      <input ref={inputRef} id={inputId} type="file" accept=".pdf,application/pdf" className="sr-only" onChange={(e) => elegir(e.target.files?.[0])} />
    </label>
  )
}

function FormularioSubida({ empresaId, onSubido }) {
  const [archivo, setArchivo] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const descripcionId = useId()

  const subir = async () => {
    setSubiendo(true)
    const res = await colaboradorService.subirOtroDocumentoEmpresa(empresaId, archivo, descripcion)
    setSubiendo(false)
    if (!res.success) {
      toast.error(res.message || 'No se pudo subir el documento.')
      return
    }
    toast.success('Documento subido.')
    setArchivo(null)
    setDescripcion('')
    onSubido()
  }

  return (
    <section aria-label="Subir documento" className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <ZonaArchivo archivo={archivo} onElegir={setArchivo} onQuitar={() => setArchivo(null)} />
      <div>
        <label htmlFor={descripcionId} className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          Descripción <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          id={descripcionId}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          maxLength={LIMITE_DESCRIPCION}
          placeholder="Ej. Convenio marco 2026, comunicado interno…"
          className="input w-full resize-y py-2 text-sm"
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={subir} loading={subiendo} disabled={!archivo} icon={<Upload className="h-4 w-4" />}>
          Subir documento
        </Button>
      </div>
    </section>
  )
}

function FilaDocumento({ doc, cargandoVista, onVer, onDescargar }) {
  const subido = fechaSubida(doc.fecha_subida)
  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold tracking-wide text-red-700 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
          PDF
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-white" title={doc.nombre_original}>
            {doc.nombre_original}
          </p>
          {doc.descripcion ? <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{doc.descripcion}</p> : null}
          <p className="mt-0.5 text-xs tabular-nums text-gray-500 dark:text-gray-400">
            {tamanoArchivo(doc.tamano_bytes)}
            {subido ? ` · subido el ${subido}` : ''}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2 sm:justify-end">
        <Button type="button" size="sm" variant="secondary" icon={<Eye className="h-4 w-4" />} loading={cargandoVista} onClick={onVer}>
          Ver
        </Button>
        <Button type="button" size="sm" variant="outline" icon={<Download className="h-4 w-4" />} onClick={onDescargar}>
          Descargar
        </Button>
      </div>
    </li>
  )
}

function ListaCargando() {
  return (
    <ul aria-busy="true" className="divide-y divide-gray-100 rounded-2xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
      {[0, 1].map((n) => (
        <li key={n} className="flex items-center gap-3 px-4 py-4">
          <span className="h-9 w-9 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
          <span className="h-3 w-1/2 animate-pulse rounded bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
        </li>
      ))}
    </ul>
  )
}

export function ErrorCarga({ onReintentar }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-red-200 py-8 text-center dark:border-red-900">
      <p className="text-sm text-gray-700 dark:text-gray-300">La lista falló al cargar. Revisá tu conexión y reintentá.</p>
      <Button type="button" size="sm" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={onReintentar}>
        Reintentar
      </Button>
    </div>
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
export default function OtrosDocumentosEmpresa({ empresaId, canSubir, previa, onCantidad }) {
  const { items, estado, cargar } = useOtrosDocumentos(empresaId)
  const onCantidadRef = useRef(onCantidad)

  useEffect(() => {
    onCantidadRef.current = onCantidad
  }, [onCantidad])

  useEffect(() => {
    if (estado === 'listo') onCantidadRef.current?.(items.length)
  }, [estado, items])

  const descargar = async (doc) => {
    try {
      await colaboradorService.descargarOtroDocumentoEmpresa(empresaId, doc.id, doc.nombre_original)
    } catch {
      toast.error('No se pudo descargar el documento.')
    }
  }

  const ver = (doc) =>
    previa.abrir({
      clave: `otro-${doc.id}`,
      titulo: doc.nombre_original,
      obtener: () => colaboradorService.fetchOtroDocumentoEmpresaVistaPreviaBlob(empresaId, doc.id),
      descargar: () => descargar(doc),
    })

  let lista
  if (estado === 'cargando') lista = <ListaCargando />
  else if (estado === 'error') lista = <ErrorCarga onReintentar={cargar} />
  else if (items.length === 0) {
    lista = (
      <p className="rounded-2xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {canSubir ? 'Los documentos que subas aparecerán acá.' : 'Acá aparecerán los documentos de la empresa.'}
      </p>
    )
  } else {
    lista = (
      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-700 dark:bg-gray-900/30">
        {items.map((doc) => (
          <FilaDocumento
            key={doc.id}
            doc={doc}
            cargandoVista={previa.cargando === `otro-${doc.id}`}
            onVer={() => ver(doc)}
            onDescargar={() => descargar(doc)}
          />
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        PDFs generales de la empresa que no corresponden a una persona en particular: convenios, comunicados, actas.
      </p>
      {canSubir ? <FormularioSubida empresaId={empresaId} onSubido={cargar} /> : null}
      <section aria-label="Documentos cargados" className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Documentos cargados</h4>
        {lista}
      </section>
    </div>
  )
}
