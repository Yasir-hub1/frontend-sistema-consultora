import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { tramiteService } from '../../services/tramiteService'
import { ROLES } from '../../utils/roleUtils'
import { hoyFechaLocal } from '../../utils/tramiteUtils'

const TAREA_VACIA = { nombre: '', requiere_documento: false }

const TIPOS_RECURRENTES_DEFAULT = ['afp_mensual', 'caja_mensual', 'ministerio_mensual', 'planilla_sueldos']

export default function CrearTramiteModal({
  isOpen,
  onClose,
  rol,
  empresas = [],
  colaboradores = [],
  colaboradorMiId = null,
  onCreated,
}) {
  const [tipos, setTipos] = useState([])
  const [saving, setSaving] = useState(false)
  const [tareasCustom, setTareasCustom] = useState([{ ...TAREA_VACIA }])
  const [colaboradoresEmpresa, setColaboradoresEmpresa] = useState([])
  const [colaboradoresSel, setColaboradoresSel] = useState([])
  const [cargandoCols, setCargandoCols] = useState(false)
  const prevTipoRef = useRef(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      empresa_cliente_id: '',
      tipo: 'afp_mensual',
      nombre: '',
      descripcion: '',
      fecha_inicio: hoyFechaLocal(),
      fecha_vencimiento: '',
      es_recurrente: true,
      notificar_cada_periodo: true,
      notificar_asignacion: true,
    },
  })

  const tipoWatch = watch('tipo')
  const empresaWatch = watch('empresa_cliente_id')
  const esRecurrenteWatch = watch('es_recurrente')
  const tipoSeleccionado = tipos.find((x) => x.key === tipoWatch)
  const esPersonalizado = tipoWatch === 'personalizado'
  const esColaborador = rol === ROLES.COLABORADOR

  const listaColaboradores = empresaWatch
    ? colaboradoresEmpresa.length > 0
      ? colaboradoresEmpresa
      : colaboradores
    : colaboradores

  useEffect(() => {
    if (!isOpen) return
    void (async () => {
      const res = await tramiteService.getTipos(rol)
      if (res.success) setTipos(res.data?.tipos ?? [])
    })()
  }, [isOpen, rol])

  useEffect(() => {
    if (!isOpen) {
      prevTipoRef.current = null
      setColaboradoresSel([])
      setColaboradoresEmpresa([])
      return
    }
    if (prevTipoRef.current !== tipoWatch) {
      const t = tipos.find((x) => x.key === tipoWatch)
      if (t) setValue('nombre', t.label)
      if (TIPOS_RECURRENTES_DEFAULT.includes(tipoWatch)) {
        setValue('es_recurrente', true)
      }
      if (tipoWatch === 'personalizado') {
        setTareasCustom([{ ...TAREA_VACIA }, { ...TAREA_VACIA }])
      }
      prevTipoRef.current = tipoWatch
    }
  }, [tipoWatch, tipos, isOpen, setValue])

  useEffect(() => {
    if (!isOpen || !empresaWatch) {
      setColaboradoresEmpresa([])
      setColaboradoresSel([])
      return
    }
    void (async () => {
      setCargandoCols(true)
      const res = await tramiteService.getColaboradoresAsignables(rol, Number(empresaWatch))
      setCargandoCols(false)
      if (res.success) {
        const cols = res.data?.colaboradores ?? []
        setColaboradoresEmpresa(cols)
        if (esColaborador && colaboradorMiId) {
          const yo = cols.find((c) => c.id === colaboradorMiId)
          if (yo) setColaboradoresSel([yo.id])
        }
      } else {
        setColaboradoresEmpresa([])
      }
    })()
  }, [isOpen, empresaWatch, rol, esColaborador, colaboradorMiId])

  const toggleColaborador = (id) => {
    setColaboradoresSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const onSubmit = async (values) => {
    if (!values.empresa_cliente_id) {
      toast.error('Selecciona una empresa cliente.')
      return
    }
    if (colaboradoresSel.length === 0) {
      toast.error('Asigna al menos un colaborador responsable.')
      return
    }
    if (esPersonalizado) {
      const validas = tareasCustom.filter((t) => t.nombre.trim())
      if (validas.length === 0) {
        toast.error('Agrega al menos una tarea para el trámite personalizado.')
        return
      }
    }
    if (!values.fecha_inicio) {
      toast.error('La fecha de inicio es obligatoria.')
      return
    }
    if (!values.fecha_vencimiento) {
      toast.error('La fecha de vencimiento es obligatoria.')
      return
    }
    if (values.fecha_vencimiento < values.fecha_inicio) {
      toast.error('La fecha de vencimiento no puede ser anterior a la de inicio.')
      return
    }

    setSaving(true)
    const payload = {
      ...values,
      empresa_cliente_id: Number(values.empresa_cliente_id),
      colaboradores_ids: colaboradoresSel,
      fecha_inicio: values.fecha_inicio,
      fecha_vencimiento: values.fecha_vencimiento,
      es_recurrente: Boolean(values.es_recurrente),
      notificar_cada_periodo: Boolean(values.notificar_cada_periodo),
      notificar_asignacion: Boolean(values.notificar_asignacion && colaboradoresSel.length > 0),
    }

    if (esPersonalizado) {
      payload.tareas = tareasCustom
        .filter((t) => t.nombre.trim())
        .map((t) => ({
          nombre: t.nombre.trim(),
          requiere_documento: Boolean(t.requiere_documento),
        }))
    }

    const res = await tramiteService.create(rol, payload)
    setSaving(false)
    if (res.success) {
      toast.success(res.message || 'Trámite creado')
      reset()
      setTareasCustom([{ ...TAREA_VACIA }])
      setColaboradoresSel([])
      prevTipoRef.current = null
      onCreated?.(res.data)
      onClose()
    } else {
      toast.error(res.message || 'No se pudo crear el trámite')
    }
  }

  const actualizarTarea = (idx, field, value) => {
    setTareasCustom((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo trámite" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Empresa cliente <span className="text-red-500">*</span>
            </label>
            <select
              className="input w-full"
              {...register('empresa_cliente_id', { required: true })}
            >
              <option value="">Seleccionar…</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre || e.razon_social}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <select className="input w-full" {...register('tipo', { required: true })}>
              {tipos.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label} ({t.tareas_preview} tareas)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Nombre del trámite"
              helperText="Puedes personalizar el nombre; se actualiza al cambiar el tipo."
              {...register('nombre', { required: true })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Colaboradores responsables <span className="text-red-500">*</span>
            </label>
            {!empresaWatch ? (
              <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/40">
                Selecciona primero la empresa para ver colaboradores disponibles.
              </p>
            ) : cargandoCols ? (
              <p className="text-xs text-gray-500">Cargando colaboradores…</p>
            ) : listaColaboradores.length === 0 ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                No hay colaboradores con acceso a esta empresa.
              </p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                {listaColaboradores.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={colaboradoresSel.includes(c.id)}
                      onChange={() => toggleColaborador(c.id)}
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {c.nombre || [c.nombres, c.apellidos].filter(Boolean).join(' ')}
                      {c.es_yo ? (
                        <span className="ml-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                          (yo)
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-1 text-[11px] text-gray-500">
              Puedes asignarte a ti mismo y a otros colaboradores con acceso a la empresa.
            </p>
          </div>

          {tipoSeleccionado && !esPersonalizado ? (
            <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tareas incluidas ({tipoSeleccionado.tareas_preview})
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {(tipoSeleccionado.tareas ?? []).map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>
                      {t.nombre}
                      {t.requiere_documento ? (
                        <span className="ml-1 text-[11px] text-amber-700 dark:text-amber-300">
                          (requiere documento)
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {esPersonalizado ? (
            <div className="sm:col-span-2 space-y-3 rounded-xl border border-primary-200/80 bg-primary-50/30 p-4 dark:border-primary-900/50 dark:bg-primary-950/20">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Tareas personalizadas</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="gap-1"
                  onClick={() => setTareasCustom((prev) => [...prev, { ...TAREA_VACIA }])}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </Button>
              </div>
              {tareasCustom.map((t, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs text-gray-500">Nombre de la tarea</label>
                    <input
                      className="input w-full"
                      value={t.nombre}
                      onChange={(e) => actualizarTarea(idx, 'nombre', e.target.value)}
                      placeholder={`Tarea ${idx + 1}`}
                    />
                  </div>
                  <label className="flex items-center gap-2 pb-2 text-xs text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={t.requiere_documento}
                      onChange={(e) => actualizarTarea(idx, 'requiere_documento', e.target.checked)}
                    />
                    Requiere documento
                  </label>
                  {tareasCustom.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setTareasCustom((prev) => prev.filter((_, i) => i !== idx))}
                      className="mb-1 rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      aria-label="Quitar tarea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción (opcional)
            </label>
            <textarea className="input min-h-[80px] w-full" {...register('descripcion')} />
          </div>

          <Input
            label="Fecha inicio"
            type="date"
            required
            error={errors.fecha_inicio?.message}
            {...register('fecha_inicio', { required: 'La fecha de inicio es obligatoria' })}
          />
          <Input
            label={esRecurrenteWatch ? 'Vencimiento del período actual' : 'Fecha vencimiento'}
            type="date"
            required
            error={errors.fecha_vencimiento?.message}
            helperText={
              esRecurrenteWatch
                ? 'Obligatoria. Define el vencimiento del primer período mensual.'
                : 'Obligatoria. Debe ser igual o posterior a la fecha de inicio.'
            }
            {...register('fecha_vencimiento', {
              required: 'La fecha de vencimiento es obligatoria',
              validate: (value, formValues) =>
                !value || !formValues.fecha_inicio || value >= formValues.fecha_inicio
                  || 'No puede ser anterior a la fecha de inicio',
            })}
          />

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary-200/80 bg-primary-50/40 p-3 dark:border-primary-800/50 dark:bg-primary-950/20">
              <input type="checkbox" className="mt-0.5" {...register('es_recurrente')} />
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Trámite recurrente (mensual)
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Se crea una sola vez. Cada mes se reinician las tareas para subir documentos del período sin volver a
                  crear el trámite.
                </span>
              </span>
            </label>
          </div>

          {esRecurrenteWatch ? (
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                <input type="checkbox" className="mt-0.5" {...register('notificar_cada_periodo')} />
                <span>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    Notificar al iniciar cada período mensual
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                    Los responsables recibirán alerta cuando comience un nuevo mes.
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {colaboradoresSel.length > 0 ? (
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                <input type="checkbox" className="mt-0.5" {...register('notificar_asignacion')} />
                <span>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    Notificar a los responsables
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                    Se enviará una alerta a cada colaborador asignado.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              saving
              || !empresaWatch
              || colaboradoresSel.length === 0
              || !watch('fecha_inicio')
              || !watch('fecha_vencimiento')
            }
          >
            {saving ? 'Creando…' : 'Crear trámite'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
