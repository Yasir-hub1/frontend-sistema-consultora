import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Mail,
  Phone,
  Shield,
  UserPlus,
  Users,
  Fingerprint,
  Briefcase,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { consultoraService } from '../../services/consultoraService'
import { PAGINATION_CONFIG } from '../../utils/constants'

const CARGO_LABELS = {
  coordinador_general: 'Coordinador general',
  analista_afp: 'Analista AFP',
  analista_caja: 'Analista CAJA',
  analista_ministerio: 'Analista Ministerio',
  asistente: 'Asistente administrativo',
}

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
        'relative h-8 w-14 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        enabled ? 'bg-emerald-500 focus:ring-emerald-500' : 'bg-red-500 focus:ring-red-500',
        busy ? 'cursor-wait opacity-60' : '',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform',
          enabled ? 'translate-x-7' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}

function cargoLabel(cargo) {
  return CARGO_LABELS[cargo] ?? cargo ?? '—'
}

const MODULOS_PERMISO = [
  { key: 'afp', label: 'AFP' },
  { key: 'caja', label: 'CAJA' },
  { key: 'ministerio', label: 'Ministerio' },
]

const CAMPOS_PERMISO_MODULO = [
  'puede_registrar_personal',
  'puede_editar_personal',
  'puede_subir_documentos',
  'puede_gestionar_modulo',
]

/** Normaliza valores que a veces vienen como 0/1 o string desde APIs. */
function normalizePermisoBool(v) {
  if (v === true || v === 1 || v === '1') return true
  if (v === false || v === 0 || v === '0' || v === '' || v == null) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  return Boolean(v)
}

function buildPermDraft(row) {
  const permisos = MODULOS_PERMISO.map(({ key: modulo }) => {
    const cur = Array.isArray(row.permisos_por_modulo)
      ? row.permisos_por_modulo.find((p) => String(p.modulo) === modulo)
      : null
    return {
      modulo,
      puede_registrar_personal: normalizePermisoBool(cur?.puede_registrar_personal),
      puede_editar_personal: normalizePermisoBool(cur?.puede_editar_personal),
      puede_subir_documentos: normalizePermisoBool(cur?.puede_subir_documentos),
      puede_gestionar_modulo: normalizePermisoBool(cur?.puede_gestionar_modulo),
    }
  })
  return {
    puede_editar_empresa_cliente: normalizePermisoBool(row.puede_editar_empresa_cliente),
    permisos,
  }
}

function serializePermisosParaApi(permisos) {
  return permisos.map((p) => {
    const o = { modulo: String(p.modulo) }
    for (const campo of CAMPOS_PERMISO_MODULO) {
      o[campo] = normalizePermisoBool(p[campo])
    }
    return o
  })
}

function estadoBadge(estado, habilitado) {
  if (!habilitado) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800 ring-1 ring-red-600/15 dark:bg-red-900/30 dark:text-red-200">
        Acceso bloqueado
      </span>
    )
  }
  if (estado === 'activo') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/15 dark:bg-emerald-900/30 dark:text-emerald-200">
        Activo
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      {estado ?? '—'}
    </span>
  )
}

export default function ConsultoraMiEquipo() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [toggleBusyId, setToggleBusyId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [permRow, setPermRow] = useState(null)
  const [permDraft, setPermDraft] = useState(() => buildPermDraft({ permisos_por_modulo: [] }))
  const [permSaving, setPermSaving] = useState(false)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [stats, setStats] = useState({ en_equipo: 0, con_portal_activo: 0 })

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
    const res = await consultoraService.listColaboradores({
      page,
      per_page: perPage,
      search,
    })
    if (res.success) {
      const payload = res.data
      const d = payload?.data ?? payload?.items ?? []
      setRows(Array.isArray(d) ? d : [])
      setTotal(Number(payload?.total) || 0)
      setLastPage(Math.max(1, Number(payload?.last_page) || 1))
      const st = payload?.stats
      if (st && typeof st.en_equipo === 'number') {
        setStats({
          en_equipo: st.en_equipo,
          con_portal_activo: Number(st.con_portal_activo) || 0,
        })
      }
    } else {
      setRows([])
      setTotal(0)
      setLastPage(1)
      setMsg(res.message)
    }
    setLoading(false)
  }, [page, perPage, search])

  useEffect(() => {
    load()
  }, [load])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombres: '',
      apellidos: '',
      ci: '',
      telefono: '',
      correo: '',
      cargo: 'coordinador_general',
      fecha_ingreso: '',
      password: '',
      acceso_habilitado: true,
    },
  })

  const accesoAlta = watch('acceso_habilitado')

  const closeModal = () => {
    setModalOpen(false)
    reset()
  }

  const onCreate = async (data) => {
    setMsg(null)
    const res = await consultoraService.createColaborador({
      ...data,
      acceso_habilitado: Boolean(data.acceso_habilitado),
    })
    if (res.success) {
      closeModal()
      await load()
      setMsg(
        data.acceso_habilitado
          ? 'Colaborador creado. Deberá cambiar la contraseña en el primer acceso.'
          : 'Colaborador creado con acceso desactivado; puedes habilitarlo desde la tabla.'
      )
    } else {
      setMsg(res.message)
    }
  }

  const onToggleAcceso = async (row, next) => {
    setMsg(null)
    setToggleBusyId(row.id)
    const res = await consultoraService.patchColaboradorAcceso(row.id, { acceso_habilitado: next })
    setToggleBusyId(null)
    if (res.success) await load()
    else setMsg(res.message)
  }

  const openPermisos = (row) => {
    setMsg(null)
    setPermRow(row)
    setPermDraft(buildPermDraft(row))
    setPermModalOpen(true)
  }

  const closePermisos = () => {
    setPermModalOpen(false)
    setPermRow(null)
  }

  const patchPermisoCampo = (idx, campo, valor) => {
    setPermDraft((d) => ({
      ...d,
      permisos: d.permisos.map((p, i) => (i === idx ? { ...p, [campo]: Boolean(valor) } : p)),
    }))
  }

  const patchPermisoGlobal = (campo, valor) => {
    setPermDraft((d) => ({
      ...d,
      permisos: d.permisos.map((p) => ({ ...p, [campo]: Boolean(valor) })),
    }))
  }

  const patchDeclaracionAguinaldoGlobal = (valor) => {
    // Aguinaldo (empresa) se habilita cuando puede declarar al menos un módulo.
    setPermDraft((d) => ({
      ...d,
      permisos: d.permisos.map((p) => ({ ...p, puede_gestionar_modulo: Boolean(valor) })),
    }))
  }

  const guardarPermisos = async () => {
    if (!permRow) return
    setPermSaving(true)
    setMsg(null)
    const res = await consultoraService.updateColaboradorPermisos(permRow.id, {
      puede_editar_empresa_cliente: normalizePermisoBool(permDraft.puede_editar_empresa_cliente),
      permisos: serializePermisosParaApi(permDraft.permisos),
    })
    setPermSaving(false)
    if (res.success) {
      closePermisos()
      await load()
      setMsg('Permisos actualizados.')
    } else {
      setMsg(res.message)
    }
  }

  const rangeLabel =
    total === 0
      ? loading
        ? 'Cargando…'
        : 'Sin registros'
      : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total}`

  const enEquipoCount = stats.en_equipo
  const activosCount = stats.con_portal_activo
  const sinColaboradores = !loading && enEquipoCount === 0 && !search

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mi equipo
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Alta de colaboradores con credenciales controladas. El interruptor verde permite el acceso
            al portal; rojo lo suspende sin borrar el usuario. Desde «Permisos» defines si pueden editar
            legajos, registrar personal o la ficha de la empresa cliente.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setMsg(null)
            setModalOpen(true)
          }}
          icon={<UserPlus className="h-4 w-4" />}
          className="shrink-0"
        >
          Nuevo colaborador
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{enEquipoCount}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">En el equipo</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activosCount}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Con portal activo</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Primer acceso</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contraseña inicial + cambio obligatorio al entrar
              </p>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          role="status"
          className="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100"
        >
          {msg}
        </div>
      )}

      <Card title="Colaboradores" subtitle={rangeLabel}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, CI, correo, usuario o teléfono…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="input w-full pl-10"
              aria-label="Buscar colaboradores"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="mi-equipo-per-page" className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              Por página
            </label>
            <select
              id="mi-equipo-per-page"
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

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : sinColaboradores ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center dark:border-gray-700 dark:bg-gray-900/20">
            <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Aún no hay colaboradores
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
              Invita al primer miembro del equipo con el botón «Nuevo colaborador».
            </p>
            <Button type="button" className="mt-5" onClick={() => setModalOpen(true)} icon={<UserPlus className="h-4 w-4" />}>
              Registrar colaborador
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay colaboradores que coincidan con la búsqueda.
          </p>
        ) : (
          <>
            {/* Móvil: tarjetas */}
            <ul className="space-y-3 md:hidden">
              {rows.map((r) => {
                const habilitado = r.acceso_habilitado !== false
                const nombre = `${r.nombres ?? ''} ${r.apellidos ?? ''}`.trim()
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{nombre || '—'}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <Briefcase className="h-3 w-3" />
                            {cargoLabel(r.cargo)}
                          </span>
                          {estadoBadge(r.usuario_estado ?? r.estado, habilitado)}
                        </div>
                        {r.usuario?.correo && (
                          <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-gray-500">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {r.usuario.correo}
                          </p>
                        )}
                        {r.telefono && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {r.telefono}
                          </p>
                        )}
                        {r.usuario?.nombre_usuario && (
                          <p className="mt-1 font-mono text-[11px] text-gray-400">
                            @{r.usuario.nombre_usuario}
                          </p>
                        )}
                      </div>
                      <AccesoToggle
                        enabled={habilitado}
                        busy={toggleBusyId === r.id}
                        title={habilitado ? 'Portal activo' : 'Portal bloqueado'}
                        onToggle={(next) => onToggleAcceso(r, next)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 w-full !py-2 text-xs"
                      icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                      onClick={() => openPermisos(r)}
                    >
                      Permisos de módulos y empresa
                    </Button>
                  </li>
                )
              })}
            </ul>

            {/* Desktop: tabla */}
            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 md:block">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/90">
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Persona
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Rol
                    </th>
                    <th scope="col" className="min-w-[10rem] px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Contacto
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Usuario
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      Estado
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                      Portal
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                      Permisos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/30">
                  {rows.map((r) => {
                    const habilitado = r.acceso_habilitado !== false
                    const nombre = `${r.nombres ?? ''} ${r.apellidos ?? ''}`.trim()
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-gray-50/90 dark:hover:bg-gray-800/50"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">{nombre || '—'}</span>
                          {r.ci && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">CI {r.ci}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                          {cargoLabel(r.cargo)}
                        </td>
                        <td className="max-w-[14rem] px-4 py-3">
                          <p className="truncate text-gray-700 dark:text-gray-300">{r.usuario?.correo ?? '—'}</p>
                          {r.telefono && (
                            <p className="truncate text-xs text-gray-500">{r.telefono}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {r.usuario?.nombre_usuario ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {estadoBadge(r.usuario_estado ?? r.estado, habilitado)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <AccesoToggle
                              enabled={habilitado}
                              busy={toggleBusyId === r.id}
                              title={
                                habilitado
                                  ? 'Acceso activo — clic para suspender'
                                  : 'Acceso suspendido — clic para habilitar'
                              }
                              onToggle={(next) => onToggleAcceso(r, next)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="secondary"
                              className="!py-1.5 !px-2.5 text-xs"
                              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                              onClick={() => openPermisos(r)}
                            >
                              Permisos
                            </Button>
                          </div>
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
        isOpen={modalOpen}
        onClose={closeModal}
        title="Nuevo colaborador"
        size="lg"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Los datos crean el usuario del colaborador. La contraseña inicial debe tener al menos 8 caracteres.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Nombres"
              {...register('nombres', { required: 'Obligatorio' })}
              error={errors.nombres?.message}
            />
            <Input
              label="Apellidos"
              {...register('apellidos', { required: 'Obligatorio' })}
              error={errors.apellidos?.message}
            />
            <Input
              label="CI"
              {...register('ci', { required: 'Obligatorio' })}
              error={errors.ci?.message}
            />
            <Input label="Teléfono" {...register('telefono')} />
            <Input
              label="Correo (acceso al sistema)"
              type="email"
              {...register('correo', { required: 'Obligatorio' })}
              error={errors.correo?.message}
            />
            <Input
              label="Contraseña inicial"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Obligatorio',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
              error={errors.password?.message}
            />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cargo
              </label>
              <select
                className="input w-full"
                {...register('cargo', { required: true })}
              >
                <option value="coordinador_general">Coordinador general</option>
                <option value="analista_afp">Analista AFP</option>
                <option value="analista_caja">Analista CAJA</option>
                <option value="analista_ministerio">Analista Ministerio</option>
                <option value="asistente">Asistente administrativo</option>
              </select>
            </div>
            <Input
              label="Fecha de ingreso"
              type="date"
              className="sm:col-span-2"
              {...register('fecha_ingreso')}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/40">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('acceso_habilitado')}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Habilitar acceso al portal</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                Si lo desactivas, el colaborador no podrá iniciar sesión hasta que lo actives desde la tabla.
              </span>
            </span>
          </label>

          {!accesoAlta && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/25 dark:text-amber-100">
              El usuario se creará con el portal bloqueado (interruptor rojo en el listado).
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} icon={<UserPlus className="h-4 w-4" />}>
              {isSubmitting ? 'Creando…' : 'Crear colaborador'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={permModalOpen}
        onClose={closePermisos}
        title={permRow ? `Permisos — ${permRow.nombres ?? ''} ${permRow.apellidos ?? ''}`.trim() : 'Permisos'}
        size="lg"
        bodyClassName="p-4 sm:p-6 max-h-[85vh] overflow-y-auto"
      >
        {permRow ? (
          <div className="space-y-5">
            {/*
              Registrar/Editar son permisos globales en backend (OR por módulos).
              Se muestran una sola vez para evitar duplicidad visual.
            */}
            {(() => {
              const registrarGlobal = permDraft.permisos.some((p) => Boolean(p.puede_registrar_personal))
              const editarGlobal = permDraft.permisos.some((p) => Boolean(p.puede_editar_personal))
              const aguinaldoGlobal = permDraft.permisos.some((p) => Boolean(p.puede_gestionar_modulo))
              return (
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Permisos globales del colaborador</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        campo: 'puede_registrar_personal',
                        checked: registrarGlobal,
                        label: 'Registrar nuevo personal',
                        hint: 'Habilita el botón de alta de personal para todo el portal colaborador.',
                      },
                      {
                        campo: 'puede_editar_personal',
                        checked: editarGlobal,
                        label: 'Editar legajo (datos del empleado)',
                        hint: 'Permite editar ficha del trabajador y régimen CAJA en todo el portal colaborador.',
                      },
                      {
                        campo: 'puede_gestionar_modulo_global',
                        checked: aguinaldoGlobal,
                        label: 'Cargar declaración de aguinaldo (empresa)',
                        hint: 'Habilita la carga anual de aguinaldo en Personal. Se aplica sobre módulos para mantener coherencia.',
                      },
                    ].map(({ campo, checked, label, hint }) => (
                      <label
                        key={campo}
                        className="flex cursor-pointer items-start gap-2 rounded-lg border border-transparent p-1 text-xs text-gray-700 hover:border-gray-200 dark:text-gray-300 dark:hover:border-gray-600"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={checked}
                          onChange={(e) => {
                            if (campo === 'puede_gestionar_modulo_global') {
                              patchDeclaracionAguinaldoGlobal(e.target.checked)
                            } else {
                              patchPermisoGlobal(campo, e.target.checked)
                            }
                          }}
                        />
                        <span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{label}</span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                            {hint}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })()}

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cada fila corresponde a <strong className="font-semibold text-gray-800 dark:text-gray-200">AFP, CAJA o Ministerio</strong> y controla
              acciones operativas del módulo. Los permisos globales se configuran una sola vez arriba.
            </p>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/40">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={permDraft.puede_editar_empresa_cliente}
                onChange={(e) =>
                  setPermDraft((d) => ({ ...d, puede_editar_empresa_cliente: e.target.checked }))
                }
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">
                <span className="font-semibold">Editar ficha de empresa cliente</span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Datos generales de la empresa (no incluye credenciales del portal empresa).
                </span>
              </span>
            </label>

            <div className="space-y-4">
              {permDraft.permisos.map((p, idx) => {
                const label = MODULOS_PERMISO.find((m) => m.key === p.modulo)?.label ?? p.modulo
                return (
                  <div
                    key={p.modulo}
                    className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          campo: 'puede_subir_documentos',
                          label: 'Subir documentos del módulo',
                          hint: 'Habilita solo la carga de archivos del catálogo de este módulo en Gestión de empleado.',
                        },
                        {
                          campo: 'puede_gestionar_modulo',
                          label: 'Cargar declaración mensual del módulo',
                          hint: 'Habilita la declaración mensual de este módulo en Personal > Declaración mensual.',
                        },
                      ].map(({ campo, label, hint }) => (
                        <label
                          key={campo}
                          className="flex cursor-pointer items-start gap-2 rounded-lg border border-transparent p-1 text-xs text-gray-700 hover:border-gray-200 dark:text-gray-300 dark:hover:border-gray-600"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={Boolean(p[campo])}
                            onChange={(e) => patchPermisoCampo(idx, campo, e.target.checked)}
                          />
                          <span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{label}</span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                              {hint}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={closePermisos} disabled={permSaving}>
                Cancelar
              </Button>
              <Button type="button" onClick={guardarPermisos} disabled={permSaving}>
                {permSaving ? 'Guardando…' : 'Guardar permisos'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
