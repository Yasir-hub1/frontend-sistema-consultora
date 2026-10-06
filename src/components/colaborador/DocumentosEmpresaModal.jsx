import { useCallback, useId, useState } from 'react'
import { clsx } from 'clsx'
import Modal from '../common/Modal'
import DocumentosLegalesEmpresa, { CATALOGO_LEGAL } from './DocumentosLegalesEmpresa'
import OtrosDocumentosEmpresa from './OtrosDocumentosEmpresa'
import { MODAL_DOCUMENTOS_CLASES, VistaPreviaPdfModal, useVistaPreviaPdf } from './VistaPreviaPdf'

export const CAMPO_LEGALES = 'documentos_legales_count'
export const CAMPO_OTROS = 'otros_documentos_count'

function etiquetaConteo(campo, cantidad) {
  if (cantidad == null) return null
  return campo === CAMPO_LEGALES ? `${cantidad}/${CATALOGO_LEGAL.length}` : String(cantidad)
}

function Pestanas({ pestanas, activa, onCambiar, idBase }) {
  return (
    <div role="tablist" aria-label="Tipo de documentos" className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      {pestanas.map((p) => {
        const seleccionada = p.campo === activa
        const conteo = etiquetaConteo(p.campo, p.cantidad)
        return (
          <button
            key={p.campo}
            type="button"
            role="tab"
            id={`${idBase}-tab-${p.campo}`}
            aria-selected={seleccionada}
            aria-controls={`${idBase}-panel`}
            onClick={() => onCambiar(p.campo)}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              seleccionada
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            )}
          >
            {p.etiqueta}
            {conteo ? (
              <span
                className={clsx(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  seleccionada ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-200' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                {conteo}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function ContenidoDocumentos({ empresa, verLegales, canSubirLegales, canSubirOtros, previa, onCantidad }) {
  const idBase = useId()
  const [activa, setActiva] = useState(verLegales ? CAMPO_LEGALES : CAMPO_OTROS)
  const [conteos, setConteos] = useState({
    [CAMPO_LEGALES]: empresa[CAMPO_LEGALES],
    [CAMPO_OTROS]: empresa[CAMPO_OTROS],
  })

  const registrar = useCallback(
    (campo) => (cantidad) => {
      setConteos((prev) => (prev[campo] === cantidad ? prev : { ...prev, [campo]: cantidad }))
      onCantidad?.(empresa.id, campo, cantidad)
    },
    [empresa.id, onCantidad]
  )

  const pestanas = [
    verLegales ? { campo: CAMPO_LEGALES, etiqueta: 'Legales', cantidad: conteos[CAMPO_LEGALES] } : null,
    { campo: CAMPO_OTROS, etiqueta: 'Otros documentos', cantidad: conteos[CAMPO_OTROS] },
  ].filter(Boolean)

  return (
    <div className="space-y-5">
      {pestanas.length > 1 ? <Pestanas pestanas={pestanas} activa={activa} onCambiar={setActiva} idBase={idBase} /> : null}
      <div role={pestanas.length > 1 ? 'tabpanel' : undefined} id={`${idBase}-panel`} aria-labelledby={`${idBase}-tab-${activa}`}>
        {activa === CAMPO_LEGALES ? (
          <DocumentosLegalesEmpresa empresaId={empresa.id} canSubir={canSubirLegales} previa={previa} onCantidad={registrar(CAMPO_LEGALES)} />
        ) : (
          <OtrosDocumentosEmpresa empresaId={empresa.id} canSubir={canSubirOtros} previa={previa} onCantidad={registrar(CAMPO_OTROS)} />
        )}
      </div>
    </div>
  )
}

/**
 * @param {{
 *   empresa: { id: number, nombre: string, documentos_legales_count?: number, otros_documentos_count?: number } | null,
 *   verLegales?: boolean,
 *   canSubirLegales?: boolean,
 *   canSubirOtros: boolean,
 *   onClose: () => void,
 *   onCantidad?: (empresaId: number, campo: string, cantidad: number) => void,
 * }} props
 */
export default function DocumentosEmpresaModal({ empresa, verLegales = false, canSubirLegales = false, canSubirOtros, onClose, onCantidad }) {
  const previa = useVistaPreviaPdf()

  const cerrar = () => {
    previa.cerrar()
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={Boolean(empresa)}
        onClose={cerrar}
        closeOnEscape={!previa.vista}
        title={
          <span className="block">
            {verLegales ? 'Documentos' : 'Otros documentos'}
            <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">{empresa?.nombre}</span>
          </span>
        }
        size="lg"
        {...MODAL_DOCUMENTOS_CLASES}
        bodyClassName="p-4 sm:p-6"
      >
        {empresa ? (
          <ContenidoDocumentos
            key={empresa.id}
            empresa={empresa}
            verLegales={verLegales}
            canSubirLegales={canSubirLegales}
            canSubirOtros={canSubirOtros}
            previa={previa}
            onCantidad={onCantidad}
          />
        ) : null}
      </Modal>
      <VistaPreviaPdfModal vista={previa.vista} onClose={previa.cerrar} />
    </>
  )
}
