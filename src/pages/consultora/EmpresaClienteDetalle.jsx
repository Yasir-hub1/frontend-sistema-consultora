import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Building2,
  Hash,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
  Briefcase,
  Search,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { consultoraService } from '../../services/consultoraService'

const CARGO_LABELS = {
  coordinador_general: 'Coordinador general',
  analista_afp: 'Analista AFP',
  analista_caja: 'Analista CAJA',
  analista_ministerio: 'Analista Ministerio',
  asistente: 'Asistente administrativo',
}

function cargoLabel(cargo) {
  return CARGO_LABELS[cargo] ?? cargo ?? '—'
}

function AccesoToggle({ enabled, busy, onToggle, title, disabled }) {
  return (
    <button
      type="button"
      title={title}
      role="switch"
      aria-checked={enabled}
      disabled={busy || disabled}
      onClick={() => onToggle(!enabled)}
      className={[
        'relative h-8 w-14 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        enabled ? 'bg-emerald-500 focus:ring-emerald-500' : 'bg-red-500 focus:ring-red-500',
        busy || disabled ? 'cursor-wait opacity-60' : '',
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

function portalEstadoBanner(portalHabilitado, tieneUsuario) {
  if (!tieneUsuario) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-100">
        <p className="font-medium">Sin usuario de portal</p>
        <p className="mt-1 text-xs opacity-90">
          Crea credenciales de solo lectura para que la empresa consulte su información. Podrás activar o
          suspender el acceso cuando quieras.
        </p>
      </div>
    )
  }
  if (portalHabilitado) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-100">
        <p className="font-medium">Portal habilitado</p>
        <p className="mt-1 text-xs opacity-90">
          La empresa puede iniciar sesión. El primer acceso exige cambio de contraseña si así lo definiste al
          crear o rotar la clave.
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-100">
      <p className="font-medium">Portal suspendido</p>
      <p className="mt-1 text-xs opacity-90">
        El usuario existe pero no puede entrar. Usa el interruptor para reactivar o define nuevas credenciales.
      </p>
    </div>
  )
}

function InfoItem({ icon: Icon, label, children, className = '' }) {
  if (children == null || children === '' || children === '—') return null
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{children}</div>
      </div>
    </div>
  )
}

export default function ConsultoraEmpresaClienteDetalle() {
  const { empresaId } = useParams()
  const [empresa, setEmpresa] = useState(null)
  const [colaboradoresEquipo, setColaboradoresEquipo] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [msg, setMsg] = useState(null)
  const [portalBusy, setPortalBusy] = useState(false)
  const [credModalOpen, setCredModalOpen] = useState(false)
  const [assignBusy, setAssignBusy] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const reload = useCallback(async () => {
    const res = await consultoraService.getEmpresaCliente(empresaId)
    if (res.success) {
      setEmpresa(res.data)
      return true
    }
    setMsg(res.message)
    return false
  }, [empresaId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      const [empRes, colRes] = await Promise.all([
        consultoraService.getEmpresaCliente(empresaId),
        consultoraService.listColaboradores({ per_page: 100 }),
      ])
      if (cancelled) return
      if (!empRes.success) {
        setLoadError(empRes.message)
        setEmpresa(null)
        setLoading(false)
        return
      }
      setEmpresa(empRes.data)
      if (colRes.success) {
        const payload = colRes.data
        const d = payload?.data ?? payload?.items ?? []
        setColaboradoresEquipo(Array.isArray(d) ? d : [])
      } else {
        setColaboradoresEquipo([])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [empresaId])

  useEffect(() => {
    if (!empresa) return
    const ids = (empresa.colaboradores ?? []).map((c) => Number(c.id)).filter((n) => !Number.isNaN(n))
    setSelectedIds(new Set(ids))
  }, [empresa])

  const portalHabilitado =
    Boolean(empresa?.usuario_id) &&
    Boolean(empresa?.usuario) &&
    empresa?.usuario?.estado !== 'inactivo'

  const tieneUsuario = Boolean(empresa?.usuario_id && empresa?.usuario)

  const accesoForm = useForm({
    defaultValues: { correo: '', password: '', acceso_habilitado: true },
  })

  useEffect(() => {
    if (!credModalOpen || !empresa) return
    accesoForm.reset({
      correo: empresa.usuario?.correo ?? empresa.correo_empresa ?? '',
      password: '',
      acceso_habilitado: portalHabilitado || !tieneUsuario,
    })
  }, [credModalOpen, empresa, portalHabilitado, tieneUsuario])

  const generarAcceso = async (data) => {
    setMsg(null)
    const res = await consultoraService.generarAccesoEmpresaCliente(empresaId, {
      correo: data.correo?.trim() || empresa?.correo_empresa,
      password: data.password,
      acceso_habilitado: Boolean(data.acceso_habilitado),
    })
    if (res.success) {
      setCredModalOpen(false)
      accesoForm.reset({ correo: '', password: '', acceso_habilitado: true })
      setMsg(res.data?.nota || res.message || 'Credenciales guardadas.')
      await reload()
    } else setMsg(res.message)
  }

  const togglePortal = async (next) => {
    if (!empresa?.usuario_id) return
    setMsg(null)
    setPortalBusy(true)
    const res = await consultoraService.patchEmpresaClienteAccesoPortal(empresaId, {
      acceso_habilitado: next,
    })
    setPortalBusy(false)
    if (res.success) {
      setMsg(res.message || 'Acceso al portal actualizado.')
      await reload()
    } else setMsg(res.message)
  }

  const toggleColab = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const colaboradoresFiltrados = useMemo(() => {
    const q = assignSearch.trim().toLowerCase()
    if (!q) return colaboradoresEquipo
    return colaboradoresEquipo.filter((c) => {
      const nombre = `${c.nombres ?? ''} ${c.apellidos ?? ''}`.toLowerCase()
      const mail = (c.usuario?.correo ?? '').toLowerCase()
      const user = (c.usuario?.nombre_usuario ?? '').toLowerCase()
      const ci = (c.ci ?? '').toLowerCase()
      return nombre.includes(q) || mail.includes(q) || user.includes(q) || ci.includes(q)
    })
  }, [colaboradoresEquipo, assignSearch])

  const guardarAsignaciones = async () => {
    setMsg(null)
    setAssignBusy(true)
    const res = await consultoraService.asignarColaboradoresEmpresa(empresaId, {
      colaborador_ids: Array.from(selectedIds),
    })
    setAssignBusy(false)
    if (res.success) {
      setMsg('Equipo asignado a esta empresa.')
      await reload()
    } else setMsg(res.message)
  }

  const repLegal = empresa
    ? [empresa.rep_legal_nombres, empresa.rep_legal_apellidos].filter(Boolean).join(' ').trim()
    : ''
  const displayNombre = empresa?.nombre ?? empresa?.razon_social ?? 'Empresa cliente'

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando empresa…</p>
      </div>
    )
  }

  if (loadError || !empresa) {
    return (
      <div className="space-y-4">
        <Link
          to="/consultora/mis-empresas"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis empresas
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{loadError || 'No se encontró la empresa.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Link
            to="/consultora/mis-empresas"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Mis empresas
          </Link>
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{displayNombre}</h1>
              {empresa.razon_social && empresa.nombre && empresa.razon_social !== empresa.nombre && (
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{empresa.razon_social}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <Hash className="h-3 w-3" />
                  NIT {empresa.nit ?? '—'}
                </span>
                {empresa.estado && (
                  <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-sky-600/15 dark:bg-sky-900/30 dark:text-sky-200">
                    {String(empresa.estado).replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            icon={<KeyRound className="h-4 w-4" />}
            onClick={() => {
              setMsg(null)
              setCredModalOpen(true)
            }}
          >
            {tieneUsuario ? 'Credenciales' : 'Crear acceso'}
          </Button>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Datos de la empresa" subtitle="Información registrada para esta cartera">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={MapPin} label="Ubicación">
                {[empresa.ciudad, empresa.departamento].filter(Boolean).join(' · ') || null}
              </InfoItem>
              <InfoItem icon={Building2} label="Dirección">{empresa.direccion}</InfoItem>
              <InfoItem icon={Phone} label="Teléfono">{empresa.telefono}</InfoItem>
              <InfoItem icon={Mail} label="Correo empresa">{empresa.correo_empresa}</InfoItem>
              {(repLegal || empresa.rep_legal_ci) && (
                <InfoItem icon={User} label="Representante legal">
                  {repLegal || '—'}
                  {empresa.rep_legal_ci ? (
                    <span className="mt-1 block text-xs text-gray-500">CI {empresa.rep_legal_ci}</span>
                  ) : null}
                </InfoItem>
              )}
              <InfoItem icon={Briefcase} label="Actividad económica">{empresa.actividad_economica}</InfoItem>
            </div>
            {empresa.matricula_comercio && (
              <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800">
                Mat. comercio: {empresa.matricula_comercio}
              </p>
            )}
          </Card>

          <Card
            title="Acceso al portal"
            subtitle="Usuario de la empresa cliente (vista de solo lectura)"
          >
            {portalEstadoBanner(portalHabilitado, tieneUsuario)}

            {tieneUsuario && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Usuario</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {empresa.usuario?.nombre_usuario ?? '—'}
                    </p>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                      {empresa.usuario?.correo ?? '—'}
                    </p>
                    {empresa.usuario?.debe_cambiar_contrasena && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Pendiente: cambio de contraseña en próximo acceso
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 border-t border-gray-200 pt-4 sm:border-t-0 sm:pt-0 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Portal</span>
                    <AccesoToggle
                      enabled={portalHabilitado}
                      busy={portalBusy}
                      title={
                        portalHabilitado
                          ? 'Portal activo — clic para suspender'
                          : 'Portal suspendido — clic para habilitar'
                      }
                      onToggle={togglePortal}
                    />
                  </div>
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Las credenciales se gestionan desde el botón «Credenciales» o «Crear acceso». La contraseña debe
              tener al menos 8 caracteres.
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Equipo en esta empresa"
            subtitle={`${selectedIds.size} colaborador${selectedIds.size !== 1 ? 'es' : ''} asignado${selectedIds.size !== 1 ? 's' : ''}`}
          >
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Marca quién de tu equipo puede trabajar con esta empresa cliente. Los cambios sustituyen la
              asignación anterior.
            </p>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Filtrar por nombre, CI o correo…"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                className="input w-full pl-10"
                aria-label="Filtrar colaboradores"
              />
            </div>
            {colaboradoresEquipo.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-700">
                No hay colaboradores en tu consultora.{' '}
                <Link to="/consultora/mi-equipo" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
                  Alta en Mi equipo
                </Link>
              </p>
            ) : (
              <ul className="max-h-[min(24rem,55vh)] space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
                {colaboradoresFiltrados.map((c) => {
                  const checked = selectedIds.has(Number(c.id))
                  const nombre = `${c.nombres ?? ''} ${c.apellidos ?? ''}`.trim()
                  return (
                    <li key={c.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleColab(Number(c.id))}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            {nombre || '—'}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {cargoLabel(c.cargo)}
                            {c.usuario?.correo ? ` · ${c.usuario.correo}` : ''}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
            {colaboradoresEquipo.length > 0 && colaboradoresFiltrados.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">Nadie coincide con el filtro.</p>
            )}
            <Button
              type="button"
              className="mt-4 w-full sm:w-auto"
              disabled={assignBusy || colaboradoresEquipo.length === 0}
              loading={assignBusy}
              onClick={guardarAsignaciones}
              icon={<Users className="h-4 w-4" />}
            >
              Guardar asignación
            </Button>
          </Card>

          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
            <div className="flex gap-2">
              <Shield className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
              <p>
                El portal de la empresa es independiente del acceso de tus analistas. Puedes bloquear el portal
                sin afectar al equipo interno.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={credModalOpen}
        onClose={() => setCredModalOpen(false)}
        title={tieneUsuario ? 'Credenciales del portal' : 'Crear acceso al portal'}
        size="md"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={accesoForm.handleSubmit(generarAcceso)} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tieneUsuario
              ? 'Actualiza correo y contraseña si lo necesitas. El acceso inmediato depende del interruptor principal y de la casilla inferior.'
              : 'Indica correo y contraseña inicial. Se creará un usuario de tipo empresa cliente.'}
          </p>
          <Input
            label="Correo de acceso"
            type="email"
            {...accesoForm.register('correo', {
              validate: (v) => {
                const trimmed = (v || '').trim()
                if (trimmed) return true
                if (empresa?.correo_empresa) return true
                return 'Indica un correo o completa el correo en los datos de la empresa'
              },
            })}
            error={accesoForm.formState.errors.correo?.message}
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            {...accesoForm.register('password', {
              required: 'Obligatorio',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
            error={accesoForm.formState.errors.password?.message}
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/40">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...accesoForm.register('acceso_habilitado')}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Habilitar acceso al iniciar o tras guardar</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                Si lo desactivas, el usuario quedará creado pero bloqueado hasta que lo actives desde el
                interruptor.
              </span>
            </span>
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setCredModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" icon={<KeyRound className="h-4 w-4" />} disabled={accesoForm.formState.isSubmitting}>
              {accesoForm.formState.isSubmitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
