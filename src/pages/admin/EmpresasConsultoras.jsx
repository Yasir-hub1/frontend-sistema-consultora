import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Search, Building2 } from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { adminInscripcionService } from '../../services/adminInscripcionService'
import { PAGINATION_CONFIG } from '../../utils/constants'

function AccesoToggle({ enabled, busy, onToggle, title }) {
  return (
    <button
      type="button"
      title={title}
      role="switch"
      aria-checked={enabled}
      disabled={busy}
      onClick={() => onToggle(!enabled)}
      className={[
        'relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        enabled ? 'bg-emerald-500 focus:ring-emerald-500' : 'bg-red-500 focus:ring-red-500',
        busy ? 'cursor-wait opacity-60' : '',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  )
}

function estadoFirmaBadge(estado) {
  const base =
    'inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset'
  const map = {
    pendiente_activacion: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-200',
    activo_sin_config: 'bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-200',
    activo_operativo: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-200',
  }
  const cls = map[estado] || 'bg-gray-50 text-gray-700 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300'
  return (
    <span className={`${base} ${cls}`} title={estado}>
      {estado?.replace(/_/g, ' ') ?? '—'}
    </span>
  )
}

export default function EmpresasConsultoras() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState(null)
  const [toggleBusyId, setToggleBusyId] = useState(null)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchDraft.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchDraft])

  useEffect(() => {
    setPage(1)
  }, [perPage])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await adminInscripcionService.getConsultoras({
      page,
      per_page: perPage,
      search,
    })
    if (res.success) {
      const payload = res.data
      const rows = payload?.data ?? payload?.items ?? []
      setList(Array.isArray(rows) ? rows : [])
      setTotal(Number(payload?.total) || 0)
      setLastPage(Math.max(1, Number(payload?.last_page) || 1))
    } else {
      setList([])
      setTotal(0)
      setLastPage(1)
      setMsg(res.message)
    }
    setLoading(false)
  }, [page, perPage, search])

  useEffect(() => {
    load()
  }, [load])

  const createForm = useForm({
    defaultValues: {
      razon_social: '',
      nit: '',
      representante_nombre: '',
      representante_ci: '',
      telefono: '',
      correo_acceso: '',
      ciudad: '',
      departamento: '',
      password: '',
      acceso_habilitado: true,
    },
  })

  const editForm = useForm({
    defaultValues: {
      razon_social: '',
      nit: '',
      representante_nombre: '',
      representante_ci: '',
      telefono: '',
      correo_acceso: '',
      ciudad: '',
      departamento: '',
      nombre_comercial: '',
      direccion: '',
    },
  })

  const accesoHabilitadoAlta = createForm.watch('acceso_habilitado')

  const onCreate = async (data) => {
    setMsg(null)
    const res = await adminInscripcionService.createConsultora({
      ...data,
      acceso_habilitado: Boolean(data.acceso_habilitado),
    })
    if (res.success) {
      setCreateOpen(false)
      createForm.reset()
      await load()
      setMsg(
        data.acceso_habilitado
          ? 'Consultora creada. El titular puede iniciar sesión y debe cambiar la contraseña en el primer acceso.'
          : 'Consultora creada con acceso al portal desactivado.'
      )
    } else {
      setMsg(res.message)
    }
  }

  const openEdit = async (row) => {
    setMsg(null)
    setEditingId(row.id)
    setEditOpen(true)
    setEditLoading(true)
    editForm.reset({
      razon_social: '',
      nit: '',
      representante_nombre: '',
      representante_ci: '',
      telefono: '',
      correo_acceso: '',
      ciudad: '',
      departamento: '',
      nombre_comercial: '',
      direccion: '',
    })
    const res = await adminInscripcionService.getConsultoraById(row.id)
    setEditLoading(false)
    if (!res.success) {
      setMsg(res.message)
      setEditOpen(false)
      return
    }
    const e = res.data
    const rep = [e.representante_nombres, e.representante_apellidos].filter(Boolean).join(' ').trim()
    editForm.reset({
      razon_social: e.razon_social ?? '',
      nit: e.nit ?? '',
      representante_nombre: rep,
      representante_ci: e.representante_ci ?? '',
      telefono: e.telefono ?? '',
      correo_acceso: e.usuario?.correo ?? e.correo_principal ?? '',
      ciudad: e.ciudad ?? '',
      departamento: e.departamento ?? '',
      nombre_comercial: e.nombre_comercial ?? '',
      direccion: e.direccion ?? '',
    })
  }

  const onEditSubmit = async (data) => {
    if (!editingId) return
    setMsg(null)
    const res = await adminInscripcionService.updateConsultora(editingId, data)
    if (res.success) {
      setEditOpen(false)
      setEditingId(null)
      await load()
      setMsg('Consultora actualizada correctamente.')
    } else {
      setMsg(res.message)
    }
  }

  const onToggleAcceso = async (row, next) => {
    setMsg(null)
    setToggleBusyId(row.id)
    const res = await adminInscripcionService.patchConsultoraAccesoUsuario(row.id, {
      acceso_habilitado: next,
    })
    setToggleBusyId(null)
    if (res.success) await load()
    else setMsg(res.message)
  }

  const rangeLabel =
    total === 0
      ? 'Sin registros'
      : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Empresas consultoras
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestión central: búsqueda, paginación, edición de datos y control de acceso al portal.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)} icon={<Building2 className="h-4 w-4" />}>
          Nueva consultora
        </Button>
      </div>

      {msg && (
        <div
          role="status"
          className="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100"
        >
          {msg}
        </div>
      )}

      <Card
        title="Directorio"
        subtitle={loading ? 'Cargando…' : rangeLabel}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por razón social, NIT o correo…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="input w-full pl-10"
              aria-label="Buscar consultoras"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="per-page" className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              Por página
            </label>
            <select
              id="per-page"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="input w-auto min-w-[5rem] py-2 text-sm"
            >
              {PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.filter((n) => n <= 50).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {list.length === 0 && !loading ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay consultoras que coincidan con los filtros.
          </p>
        ) : (
          <>
            {/* Móvil: tarjetas */}
            <ul className="space-y-3 md:hidden">
              {list.map((row) => {
                const habilitado = row.acceso_habilitado !== false
                return (
                  <li
                    key={row.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {row.razon_social ?? '—'}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">NIT {row.nit ?? '—'}</p>
                        <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-300">
                          {row.correo_acceso ?? row.correo ?? '—'}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {estadoFirmaBadge(row.estado)}
                          <span className="text-xs text-gray-500">Titular: {row.usuario_estado ?? '—'}</span>
                        </div>
                      </div>
                      <AccesoToggle
                        enabled={habilitado}
                        busy={toggleBusyId === row.id}
                        title={habilitado ? 'Portal habilitado' : 'Portal bloqueado'}
                        onToggle={(next) => onToggleAcceso(row, next)}
                      />
                    </div>
                    <div className="mt-3 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(row)} icon={<Pencil className="h-4 w-4" />}>
                        Editar
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>

            {/* Desktop: tabla */}
            <div className="hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 md:block">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                  <tr>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Razón social
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      NIT
                    </th>
                    <th scope="col" className="min-w-[10rem] px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Correo
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Estado firma
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Usuario
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                      Portal
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/20">
                  {list.map((row) => {
                    const habilitado = row.acceso_habilitado !== false
                    return (
                      <tr key={row.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                        <td className="max-w-[14rem] truncate px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {row.razon_social ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">{row.nit ?? '—'}</td>
                        <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600 dark:text-gray-300">
                          {row.correo_acceso ?? row.correo ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{estadoFirmaBadge(row.estado)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {row.usuario_estado ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <AccesoToggle
                              enabled={habilitado}
                              busy={toggleBusyId === row.id}
                              title={habilitado ? 'Portal habilitado — clic para bloquear' : 'Portal bloqueado — clic para habilitar'}
                              onToggle={(next) => onToggleAcceso(row, next)}
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(row)}
                            icon={<Pencil className="h-4 w-4" />}
                          >
                            Editar
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <Pagination
                currentPage={page}
                totalPages={lastPage}
                onPageChange={setPage}
                className="flex-col gap-3 sm:flex-row"
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Registrar consultora"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Razón social"
              {...createForm.register('razon_social', { required: 'Obligatorio' })}
              error={createForm.formState.errors.razon_social?.message}
            />
            <Input
              label="NIT"
              {...createForm.register('nit', { required: 'Obligatorio' })}
              error={createForm.formState.errors.nit?.message}
            />
            <Input
              label="Representante legal"
              {...createForm.register('representante_nombre', { required: 'Obligatorio' })}
              error={createForm.formState.errors.representante_nombre?.message}
            />
            <Input label="CI representante" {...createForm.register('representante_ci')} />
            <Input label="Teléfono" {...createForm.register('telefono')} />
            <Input
              label="Correo de acceso"
              type="email"
              {...createForm.register('correo_acceso', { required: 'Obligatorio' })}
              error={createForm.formState.errors.correo_acceso?.message}
            />
            <Input
              label="Contraseña inicial"
              type="password"
              autoComplete="new-password"
              {...createForm.register('password', {
                required: 'Obligatorio',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
              error={createForm.formState.errors.password?.message}
            />
            <Input label="Ciudad" {...createForm.register('ciudad')} />
            <Input label="Departamento" {...createForm.register('departamento')} />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-gray-300" {...createForm.register('acceso_habilitado')} />
            <span>Habilitar acceso al portal (cambio de contraseña en primer acceso)</span>
          </label>

          {!accesoHabilitadoAlta && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              El titular no podrá iniciar sesión hasta habilitar el acceso desde el listado.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createForm.formState.isSubmitting}>
              Crear
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditingId(null)
        }}
        title="Editar consultora"
        size="lg"
      >
        {editLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">Cargando datos…</p>
        ) : (
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Razón social"
                {...editForm.register('razon_social', { required: 'Obligatorio' })}
                error={editForm.formState.errors.razon_social?.message}
              />
              <Input
                label="NIT"
                {...editForm.register('nit', { required: 'Obligatorio' })}
                error={editForm.formState.errors.nit?.message}
              />
              {/* <Input
                label="Nombre comercial"
                {...editForm.register('nombre_comercial')}
              /> */}
              <Input label="Representante legal" {...editForm.register('representante_nombre', { required: 'Obligatorio' })} error={editForm.formState.errors.representante_nombre?.message} />
              <Input label="CI representante" {...editForm.register('representante_ci')} />
              <Input label="Teléfono" {...editForm.register('telefono')} />
              <Input
                label="Correo del titular (acceso)"
                type="email"
                {...editForm.register('correo_acceso', { required: 'Obligatorio' })}
                error={editForm.formState.errors.correo_acceso?.message}
              />
              <Input label="Ciudad" {...editForm.register('ciudad')} />
              <Input label="Departamento" {...editForm.register('departamento')} />
              {/* <Input label="Dirección" className="sm:col-span-2" {...editForm.register('direccion')} /> */}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Para cambiar la contraseña del titular o bloquear el portal, usa el interruptor en el listado o reestablece credenciales desde acceso de usuario.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditOpen(false)
                  setEditingId(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                Guardar cambios
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
