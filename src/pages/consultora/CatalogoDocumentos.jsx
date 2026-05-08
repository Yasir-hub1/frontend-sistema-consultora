import { useCallback, useEffect, useState } from 'react'
import { FileStack, Plus, Pencil, Trash2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { consultoraService } from '../../services/consultoraService'
import { clsx } from 'clsx'

const MODULOS = [
  { key: 'afp', label: 'AFP' },
  { key: 'caja', label: 'CAJA' },
  { key: 'ministerio', label: 'Ministerio' },
]

export default function ConsultoraCatalogoDocumentos() {
  const [modulo, setModulo] = useState('afp')
  const [cajaVariante, setCajaVariante] = useState('nacional')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formNombre, setFormNombre] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formOblig, setFormOblig] = useState(true)
  const [formPeriodico, setFormPeriodico] = useState(false)
  const [formCajaVar, setFormCajaVar] = useState('nacional')
  const [formOrden, setFormOrden] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = { modulo }
    if (modulo === 'caja') params.caja_variante = cajaVariante
    const res = await consultoraService.listTiposDocumentoCatalogo(params)
    setLoading(false)
    if (res.success) setRows(res.data)
    else toast.error(res.message || 'No se pudo cargar el catálogo')
  }, [modulo, cajaVariante])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setFormNombre('')
    setFormDesc('')
    setFormOblig(true)
    setFormPeriodico(modulo !== 'afp' ? false : false)
    setFormCajaVar(cajaVariante)
    setFormOrden('')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setFormNombre(row.nombre || '')
    setFormDesc(row.descripcion || '')
    setFormOblig(Boolean(row.obligatorio))
    setFormPeriodico(Boolean(row.es_periodico))
    setFormCajaVar(row.caja_variante || 'nacional')
    setFormOrden(row.orden_visualizacion != null ? String(row.orden_visualizacion) : '')
    setModalOpen(true)
  }

  const saveModal = async () => {
    const nombre = formNombre.trim()
    if (!nombre) {
      toast.error('Indica el nombre del documento')
      return
    }
    setSaving(true)
    const ordenVal = formOrden === '' ? null : Number(formOrden)
    let res
    if (editing) {
      res = await consultoraService.updateTipoDocumentoCatalogo(editing.id, {
        nombre,
        descripcion: formDesc.trim() || null,
        obligatorio: formOblig,
        es_periodico: formPeriodico,
        orden_visualizacion: ordenVal,
      })
    } else {
      res = await consultoraService.createTipoDocumentoCatalogo({
        modulo,
        nombre,
        descripcion: formDesc.trim() || null,
        obligatorio: formOblig,
        es_periodico: formPeriodico,
        caja_variante: modulo === 'caja' ? formCajaVar : undefined,
        orden_visualizacion: ordenVal,
      })
    }
    setSaving(false)
    if (res.success) {
      toast.success(editing ? 'Actualizado' : 'Tipo creado')
      setModalOpen(false)
      load()
    } else toast.error(res.message || 'Error al guardar')
  }

  const removeRow = async (row) => {
    if (row.es_sistema) return
    if (!window.confirm('¿Eliminar o desactivar este tipo?')) return
    const res = await consultoraService.deleteTipoDocumentoCatalogo(row.id)
    if (res.success) {
      toast.success(res.message || 'Listo')
      load()
    } else toast.error(res.message || 'Error')
  }

  const toggleActivo = async (row) => {
    const res = await consultoraService.updateTipoDocumentoCatalogo(row.id, { activo: !row.activo })
    if (res.success) {
      toast.success(row.activo ? 'Desactivado' : 'Activado')
      load()
    } else toast.error(res.message || 'Error')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <FileStack className="h-7 w-7 text-primary-600" />
          Catálogo de documentos
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Tipos que ven tus colaboradores al subir archivos por módulo. Los de origen sistema son plantilla global
          (editables aquí; los cambios aplican a todas las firmas). Podés añadir tipos propios de tu firma.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODULOS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setModulo(m.key)}
            className={clsx(
              'rounded-full px-4 py-2 text-xs font-bold transition',
              modulo === m.key
                ? 'bg-primary-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {modulo === 'caja' && (
        <div className="flex gap-2">
          {['nacional', 'petrolera'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setCajaVariante(v)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-bold uppercase',
                cajaVariante === v
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      <Card
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="card-title">
                Tipos — {MODULOS.find((x) => x.key === modulo)?.label}
                {modulo === 'caja' ? ` (${cajaVariante})` : ''}
              </h3>
              <p className="card-description">Orden en que aparecen en el legajo del colaborador.</p>
            </div>
            <Button type="button" onClick={openCreate} className="inline-flex shrink-0 items-center gap-2 self-start">
              <Plus className="h-4 w-4" />
              Añadir tipo
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay tipos para esta vista. Ejecuta el seeder de catálogo o crea uno propio.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700">
                  <th className="pb-2 pr-3">Nombre</th>
                  <th className="pb-2 pr-3">Origen</th>
                  <th className="pb-2 pr-3">Obl.</th>
                  <th className="pb-2 pr-3">Per.</th>
                  <th className="pb-2 pr-3">Estado</th>
                  <th className="pb-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((r) => (
                  <tr key={r.id} className={!r.activo ? 'opacity-50' : ''}>
                    <td className="py-3 pr-3 font-medium text-gray-900 dark:text-white">{r.nombre}</td>
                    <td className="py-3 pr-3">
                      {r.es_sistema ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <Lock className="h-3 w-3" />
                          Sistema
                        </span>
                      ) : (
                        <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-bold text-primary-800 dark:text-primary-200">
                          Firma
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3">{r.obligatorio ? 'Sí' : '—'}</td>
                    <td className="py-3 pr-3">{r.es_periodico ? 'Sí' : '—'}</td>
                    <td className="py-3 pr-3">{r.activo ? 'Activo' : 'Off'}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="Editar"
                          onClick={() => openEdit(r)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title={r.activo ? 'Desactivar' : 'Activar'}
                          onClick={() => toggleActivo(r)}
                          className="rounded-lg px-2 py-1 text-[10px] font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          {r.activo ? 'Off' : 'On'}
                        </button>
                        {!r.es_sistema ? (
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() => removeRow(r)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={
          editing
            ? editing.es_sistema
              ? 'Editar tipo (origen sistema)'
              : 'Editar tipo'
            : 'Nuevo tipo de documento'
        }
      >
        <div className="space-y-3">
          {editing?.es_sistema ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              Este tipo es plantilla global. Los cambios de nombre, descripción, obligatoriedad, periodicidad y orden se
              aplican en el catálogo base compartido.
            </p>
          ) : null}
          <Input label="Nombre" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={2}
              className="input w-full"
            />
          </div>
          {!editing && modulo === 'caja' && (
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Régimen CAJA</span>
              <div className="flex gap-2">
                {['nacional', 'petrolera'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormCajaVar(v)}
                    className={clsx(
                      'rounded-lg px-3 py-1.5 text-xs font-bold',
                      formCajaVar === v ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formOblig} onChange={(e) => setFormOblig(e.target.checked)} />
            Obligatorio para cumplimiento
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formPeriodico} onChange={(e) => setFormPeriodico(e.target.checked)} />
            Documento periódico (por mes)
          </label>
          <Input
            label="Orden (opcional)"
            value={formOrden}
            onChange={(e) => setFormOrden(e.target.value)}
            placeholder="Auto si vacío"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={saveModal} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
