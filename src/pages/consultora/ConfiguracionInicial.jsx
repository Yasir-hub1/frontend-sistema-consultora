import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader2,
  Settings2,
  Sparkles,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { consultoraService } from '../../services/consultoraService'
import { getApiOrigin, APP_CONFIG } from '../../utils/constants'

const STEPS = [
  { id: 1, title: 'Identidad', desc: 'Logo, marca y contacto de soporte' },
  { id: 2, title: 'Datos bancarios', desc: 'Institución, cuenta y moneda' },
  { id: 3, title: 'Plantilla de entrega', desc: 'Campos y vista previa del documento' },
  { id: 4, title: 'Resumen', desc: 'Validar y activar operación' },
]

const TIPO_CUENTA_OPTS = [
  { value: 'ahorro', label: 'Cuenta de ahorro' },
  { value: 'corriente', label: 'Cuenta corriente' },
]

const MONEDA_OPTS = [
  { value: 'BOB', label: 'Bolivianos (BOB)' },
  { value: 'USD', label: 'Dólares (USD)' },
]

const CAMPOS_PLANTILLA_CATALOGO = [
  { id: 'fecha_entrega', etiqueta: 'Fecha de entrega', obligatorio: true },
  { id: 'periodo_gestion', etiqueta: 'Período de gestión', obligatorio: true },
  { id: 'empresa_cliente', etiqueta: 'Razón social — empresa cliente', solo_lectura: true },
  { id: 'nit_cliente', etiqueta: 'NIT — empresa cliente', solo_lectura: true },
  { id: 'responsable_consultora', etiqueta: 'Responsable (consultora)', obligatorio: true },
  { id: 'bloque_datos_bancarios', etiqueta: 'Recuadro datos bancarios (automático)', solo_lectura: true },
  { id: 'observaciones', etiqueta: 'Observaciones', obligatorio: false },
  { id: 'firma_consultora', etiqueta: 'Firma y sello — consultora', obligatorio: true },
  { id: 'firma_cliente', etiqueta: 'Firma y sello — empresa cliente', obligatorio: true },
]

const TIPO_INST_LABEL = {
  banco: 'Bancos múltiples',
  pyme: 'Bancos PYME',
  cooperativa: 'Cooperativas de ahorro y crédito',
}

function labelTipoCuenta(v) {
  return TIPO_CUENTA_OPTS.find((o) => o.value === v)?.label ?? v
}

function labelMoneda(v) {
  return MONEDA_OPTS.find((o) => o.value === v)?.label ?? v
}

function firstFormErrorMessage(errors) {
  const first = Object.values(errors || {})[0]
  return first?.message || ''
}

function logoAbsUrl(logoUrl) {
  if (!logoUrl) return ''
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl
  return `${getApiOrigin()}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`
}

function EntregaPreview({
  nombreMarca,
  colorMarca,
  logoUrl,
  correoSoporte,
  telSoporte,
  institucionNombre,
  nroCuenta,
  tipoCuenta,
  titular,
  moneda,
  campos,
}) {
  const ordenados = [...campos].sort((a, b) => {
    const ai = CAMPOS_PLANTILLA_CATALOGO.findIndex((c) => c.id === a.id)
    const bi = CAMPOS_PLANTILLA_CATALOGO.findIndex((c) => c.id === b.id)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  return (
    <div
      className="mx-auto max-w-3xl rounded-xl border-2 border-gray-200 bg-white p-4 shadow-lg sm:rounded-2xl sm:p-8 dark:border-gray-600 dark:bg-gray-900"
      style={{ borderTopWidth: 4, borderTopColor: colorMarca || '#2563EB' }}
    >
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between dark:border-gray-700">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
            Documento de entrega
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
            {nombreMarca || 'Tu consultora'}
          </h3>
          <p className="mt-1 break-words text-xs text-gray-600 sm:text-sm dark:text-gray-400">
            Soporte: {correoSoporte || '—'} · {telSoporte || '—'}
          </p>
        </div>
        {logoUrl ? (
          <img
            src={logoAbsUrl(logoUrl)}
            alt="Logo"
            className="h-12 max-w-[120px] object-contain sm:h-16 sm:max-w-[140px]"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
            Sin logo
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          <span className="font-medium">Cliente:</span>{' '}
          <span className="italic text-slate-600 dark:text-slate-300">
            Empresa cliente (ejemplo) — se completará al generar la entrega
          </span>
        </p>

        {ordenados.map((c) => {
          if (c.id === 'bloque_datos_bancarios') {
            return (
              <div
                key={c.id}
                className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30"
              >
                <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-200">
                  Datos para abono / transferencia
                </p>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[240px] text-left text-sm">
                  <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/50">
                    <tr>
                      <th className="py-1.5 pr-3 font-medium text-gray-600 dark:text-gray-300">Institución</th>
                      <td>{institucionNombre || '—'}</td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 font-medium text-gray-600 dark:text-gray-300">Cuenta</th>
                      <td>{nroCuenta || '—'}</td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 font-medium text-gray-600 dark:text-gray-300">Tipo</th>
                      <td>{labelTipoCuenta(tipoCuenta)}</td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 font-medium text-gray-600 dark:text-gray-300">Titular</th>
                      <td>{titular || '—'}</td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 font-medium text-gray-600 dark:text-gray-300">Moneda</th>
                      <td>{labelMoneda(moneda)}</td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            )
          }

          if (c.id?.startsWith('firma_')) {
            return (
              <div key={c.id} className="mt-6 border-t border-dashed border-gray-200 pt-4 dark:border-gray-600">
                <p className="font-medium text-gray-800 dark:text-gray-200">{c.etiqueta}</p>
                <div className="mt-8 h-px w-2/3 bg-gray-300 dark:bg-gray-600" />
                <p className="mt-1 text-xs text-gray-500">Nombre y sello</p>
              </div>
            )
          }

          return (
            <div key={c.id} className="border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-gray-800 dark:text-gray-200">{c.etiqueta}</span>
                {c.obligatorio && (
                  <span className="shrink-0 text-xs text-rose-600 dark:text-rose-400">Obligatorio</span>
                )}
              </div>
              <p className="mt-1 text-xs italic text-gray-400">
                {c.solo_lectura ? 'Valor automático en el documento final' : '______________'}
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-center text-[10px] text-gray-400">
        Vista previa · Consult-360 · {new Date().getFullYear()}
      </p>
    </div>
  )
}

export default function ConsultoraConfiguracionInicial() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState(null)
  const [instituciones, setInstituciones] = useState([])
  const [consultora, setConsultora] = useState(null)
  const [config, setConfig] = useState(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [plantillaCampos, setPlantillaCampos] = useState(() =>
    CAMPOS_PLANTILLA_CATALOGO.filter((c) =>
      ['fecha_entrega', 'periodo_gestion', 'empresa_cliente', 'bloque_datos_bancarios', 'firma_consultora', 'firma_cliente'].includes(c.id)
    ).map((c) => ({
      id: c.id,
      etiqueta: c.etiqueta,
      obligatorio: Boolean(c.obligatorio),
      solo_lectura: Boolean(c.solo_lectura),
    }))
  )

  const f1 = useForm({
    defaultValues: {
      nombre_comercial: '',
      color_marca: '#2563EB',
      correo_soporte: '',
      telefono_contacto: '',
    },
  })

  const f2 = useForm({
    defaultValues: {
      institucion_financiera_id: '',
      nro_cuenta: '',
      tipo_cuenta: 'ahorro',
      titular_cuenta: '',
      moneda: 'BOB',
    },
  })

  const hydrateForms = useCallback((data) => {
    const e = data.consultora
    const cfg = data.configuracion
    setConsultora(e)
    setConfig(cfg)

    f1.reset({
      nombre_comercial: e?.nombre_comercial ?? '',
      color_marca: cfg?.color_marca ?? '#2563EB',
      correo_soporte: cfg?.correo_soporte ?? '',
      telefono_contacto: cfg?.telefono_soporte ?? '',
    })

    f2.reset({
      institucion_financiera_id: cfg?.institucion_financiera_id
        ? String(cfg.institucion_financiera_id)
        : '',
      nro_cuenta: cfg?.nro_cuenta ?? '',
      tipo_cuenta: cfg?.tipo_cuenta === 'corriente' ? 'corriente' : 'ahorro',
      titular_cuenta: cfg?.titular_cuenta ?? '',
      moneda: cfg?.moneda === 'USD' ? 'USD' : 'BOB',
    })

    const campos = cfg?.plantilla_entrega?.campos
    if (Array.isArray(campos) && campos.length > 0) {
      setPlantillaCampos(campos)
    }
  }, [f1, f2])

  const loadConfig = useCallback(async () => {
    const res = await consultoraService.getMiConfiguracion()
    if (res.success && res.data) {
      hydrateForms(res.data)
    }
  }, [hydrateForms])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [cfgRes, instRes] = await Promise.all([
        consultoraService.getMiConfiguracion(),
        consultoraService.getInstitucionesFinancieras(),
      ])
      if (cancelled) return
      if (instRes.success) setInstituciones(instRes.data)
      if (cfgRes.success && cfgRes.data) hydrateForms(cfgRes.data)
    })()
    return () => {
      cancelled = true
    }
  }, [hydrateForms])

  useEffect(() => {
    if (step === 4) loadConfig()
  }, [step, loadConfig])

  const institucionesPorTipo = useMemo(() => {
    const g = { banco: [], pyme: [], cooperativa: [] }
    instituciones.forEach((row) => {
      const t = row.tipo && g[row.tipo] ? row.tipo : 'banco'
      if (g[t]) g[t].push(row)
    })
    return g
  }, [instituciones])

  const saveStep = async (paso, payload) => {
    setStatus(null)
    const phaseSuccess = {
      1: 'Identidad guardada correctamente.',
      2: 'Datos bancarios guardados correctamente.',
      3: 'Plantilla de entrega guardada correctamente.',
    }
    const toastId = toast.loading('Guardando…')
    const res = await consultoraService.guardarPasoConfiguracion(paso, payload)
    if (res.success) {
      toast.success(phaseSuccess[paso] || 'Guardado correctamente.', { id: toastId })
      setStatus('Guardado correctamente.')
      if (res.data) setConfig(res.data)
      await loadConfig()
      if (paso < 4) setStep(paso + 1)
    } else {
      toast.error(res.message || 'No se pudo guardar. Revisa los datos e intenta de nuevo.', {
        id: toastId,
      })
      setStatus(res.message)
    }
  }

  const onLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus(null)
    setLogoUploading(true)
    const toastId = toast.loading('Subiendo logo…')
    const fd = new FormData()
    fd.append('logo', file)
    const res = await consultoraService.subirLogo(fd)
    setLogoUploading(false)
    e.target.value = ''
    if (res.success) {
      toast.success('Logo subido correctamente.', { id: toastId })
      setStatus('Logo subido.')
      await loadConfig()
    } else {
      toast.error(res.message || 'No se pudo subir el logo.', { id: toastId })
      setStatus(res.message)
    }
  }

  const onPaso2 = (d) => {
    saveStep(2, {
      institucion_financiera_id: Number(d.institucion_financiera_id),
      nro_cuenta: d.nro_cuenta,
      tipo_cuenta: d.tipo_cuenta,
      titular_cuenta: d.titular_cuenta,
      moneda: d.moneda,
    })
  }

  const onPaso3 = () => {
    if (!plantillaCampos.length) {
      toast.error('Añade al menos un campo a la plantilla de entrega antes de guardar.')
      return
    }
    saveStep(3, {
      plantilla_entrega: { campos: plantillaCampos },
    })
  }

  const togglePreset = (preset) => {
    setPlantillaCampos((prev) => {
      const exists = prev.some((c) => c.id === preset.id)
      if (exists) return prev.filter((c) => c.id !== preset.id)
      return [
        ...prev,
        {
          id: preset.id,
          etiqueta: preset.etiqueta,
          obligatorio: Boolean(preset.obligatorio),
          solo_lectura: Boolean(preset.solo_lectura),
        },
      ]
    })
  }

  const moveCampo = (idx, delta) => {
    setPlantillaCampos((prev) => {
      const j = idx + delta
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      const t = next[idx]
      next[idx] = next[j]
      next[j] = t
      return next
    })
  }

  const setObligatorioCampo = (id, val) => {
    setPlantillaCampos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, obligatorio: val } : c))
    )
  }

  const f1v = f1.watch()
  const f2v = f2.watch()
  const instNombre =
    instituciones.find((i) => String(i.id) === String(f2v.institucion_financiera_id))?.nombre ??
    config?.institucion_financiera?.nombre ??
    config?.banco ??
    ''

  const checklist = useMemo(() => {
    const cfg = config
    const e = consultora
    const campos = cfg?.plantilla_entrega?.campos ?? []
    return [
      {
        ok: Boolean(cfg?.logo_url),
        text: 'Logo de la consultora',
      },
      {
        ok: Boolean(cfg?.correo_soporte && cfg?.telefono_soporte),
        text: 'Correo y teléfono de soporte',
      },
      {
        ok: Boolean((e?.nombre_comercial || e?.razon_social || '').trim()),
        text: 'Nombre comercial o razón social',
      },
      {
        ok: Boolean(cfg?.institucion_financiera_id && cfg?.nro_cuenta && cfg?.titular_cuenta),
        text: 'Institución financiera y datos de cuenta',
      },
      {
        ok: Array.isArray(campos) && campos.length > 0,
        text: 'Plantilla de entrega con al menos un campo',
      },
    ]
  }, [config, consultora])

  const allChecklistOk = checklist.every((c) => c.ok)

  const finalizar = async () => {
    if (!allChecklistOk) {
      toast.error('Completa todos los requisitos del resumen antes de activar la consultora.')
      return
    }
    setStatus(null)
    const toastId = toast.loading('Activando consultora…')
    const res = await consultoraService.finalizarConfiguracion()
    if (res.success) {
      const msg = res.message || 'Consultora activa operativamente.'
      toast.success(`${msg} Te llevamos al inicio.`, { id: toastId, duration: 4500 })
      setStatus(msg)
      navigate('/consultora/dashboard', { replace: true })
    } else {
      const pend = res.errors?.pendientes
      let detail = ''
      if (Array.isArray(pend) && pend.length) {
        setStatus(`${res.message}\n${pend.map((p) => `• ${p}`).join('\n')}`)
        const short = pend.slice(0, 4).join(' · ')
        detail = pend.length > 4 ? `${short}…` : short
      } else {
        setStatus(res.message)
      }
      toast.error(
        `${res.message || 'No se pudo completar la activación.'}${detail ? ` — ${detail}` : ''}`,
        { id: toastId, duration: 6000 }
      )
    }
  }

  const motionEnter = 'animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none'
  const progressPct = Math.min(100, Math.max(0, ((step - 1) / (STEPS.length - 1)) * 100))

  return (
    <div className="relative isolate min-w-0 space-y-6 pb-2">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-4 -z-10 mx-auto h-48 max-w-4xl overflow-hidden opacity-90">
        <div className="absolute -left-20 top-0 h-44 w-44 rounded-full bg-gradient-to-br from-primary-400/20 via-violet-400/15 to-transparent blur-3xl dark:from-primary-600/15 dark:via-violet-600/12" />
        <div className="absolute -right-16 top-8 h-40 w-40 rounded-full bg-gradient-to-bl from-violet-400/18 to-fuchsia-500/10 blur-3xl dark:from-violet-600/12" />
      </div>

      <header className={`${motionEnter}`}>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-primary-50/80 px-3 py-1 text-primary-800 shadow-sm dark:border-primary-900/50 dark:bg-primary-950/40 dark:text-primary-200">
          <Settings2 className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wide sm:text-xs">Asistente de arranque</span>
          <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </div>
        <h1 className="mt-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-white dark:via-gray-100 dark:to-gray-300">
          Configuración inicial
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Cuatro pasos para dejar tu consultora lista. Los datos alimentan la vista previa del documento de entrega y
          la validación final.
        </p>
        <p className="mt-2 text-xs font-medium text-gray-500 md:hidden dark:text-gray-400">
          Paso {step} de {STEPS.length}
        </p>
      </header>

      <div className={`hidden md:block ${motionEnter}`} style={{ animationDelay: '60ms' }}>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-center text-[11px] text-gray-500 dark:text-gray-400">
          Progreso del asistente
        </p>
      </div>

      <div
        className={`-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [scrollbar-width:thin] md:mx-0 md:flex-wrap md:overflow-visible ${motionEnter}`}
        style={{ animationDelay: '100ms' }}
        role="tablist"
        aria-label="Pasos de configuración"
      >
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={step === s.id}
            onClick={() => setStep(s.id)}
            className={clsx(
              'min-h-[72px] w-[min(88vw,280px)] shrink-0 snap-start rounded-2xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.99] motion-reduce:active:scale-100 md:min-h-0 md:w-auto md:flex-1 md:min-w-[140px]',
              step === s.id
                ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-950/35 dark:shadow-primary-900/20'
                : 'border-gray-200/90 bg-white/80 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-gray-600'
            )}
          >
            <span
              className={clsx(
                'text-[10px] font-bold uppercase tracking-wide',
                step === s.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Paso {s.id}
            </span>
            <span className="mt-0.5 block font-semibold text-gray-900 dark:text-white">{s.title}</span>
            <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
              {s.desc}
            </span>
          </button>
        ))}
      </div>

      {status && (
        <div
          role="status"
          className={`animate-fade-in whitespace-pre-line rounded-xl border border-primary-200/90 bg-primary-50/95 p-4 text-sm text-primary-900 shadow-sm backdrop-blur-sm motion-reduce:animate-none dark:border-primary-800 dark:bg-primary-900/25 dark:text-primary-100`}
        >
          {status}
        </div>
      )}

      {step === 1 && (
        <Card title="Paso 1 — Identidad" subtitle={STEPS[0].desc} gradient>
          <form
            onSubmit={f1.handleSubmit(
              (d) => saveStep(1, d),
              (errors) => {
                const msg = firstFormErrorMessage(errors)
                toast.error(
                  msg ? `Falta completar: ${msg}` : 'Completa los campos obligatorios del paso 1.'
                )
              }
            )}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Logo</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <label className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 px-4 py-3 text-sm transition-colors hover:border-primary-300 hover:bg-primary-50/30 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-primary-700 dark:hover:bg-gray-800 sm:w-auto sm:justify-start">
                  {logoUploading ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary-600 motion-reduce:animate-none" />
                  ) : (
                    <ImagePlus className="h-5 w-5 shrink-0 text-primary-600" />
                  )}
                  <span className="text-center sm:text-left">Subir imagen (PNG, JPG, SVG · máx. 2MB)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    className="hidden"
                    disabled={logoUploading}
                    onChange={onLogoChange}
                  />
                </label>
                {config?.logo_url && (
                  <img
                    src={logoAbsUrl(config.logo_url)}
                    alt="Logo actual"
                    className="mx-auto h-16 max-w-[140px] rounded-lg object-contain ring-2 ring-gray-200/80 dark:ring-gray-600 sm:mx-0"
                  />
                )}
              </div>
              <p className="mt-2 break-all text-xs text-gray-500 dark:text-gray-400">
                URL API:{' '}
                <code className="rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
                  POST {APP_CONFIG.apiUrl}/configuracion/logo
                </code>
              </p>
            </div>
            {/* <Input
              label="Nombre comercial"
              {...f1.register('nombre_comercial', { required: 'Obligatorio' })}
              error={f1.formState.errors.nombre_comercial?.message}
            /> */}
            <Input label="Color marca" type="color" {...f1.register('color_marca')} />
            <Input
              label="Correo soporte (visible a clientes)"
              type="email"
              {...f1.register('correo_soporte', { required: 'Obligatorio' })}
              error={f1.formState.errors.correo_soporte?.message}
            />
            <Input
              label="Teléfono soporte"
              {...f1.register('telefono_contacto', { required: 'Obligatorio' })}
              error={f1.formState.errors.telefono_contacto?.message}
            />
            <Button type="submit" className="w-full min-h-[48px] sm:col-span-2 sm:min-h-0 sm:w-auto">
              Guardar identidad
            </Button>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card title="Paso 2 — Datos bancarios" subtitle={STEPS[1].desc} gradient>
          <form
            onSubmit={f2.handleSubmit(
              onPaso2,
              (errors) => {
                const msg = firstFormErrorMessage(errors)
                toast.error(
                  msg ? `Falta completar: ${msg}` : 'Completa los datos bancarios obligatorios.'
                )
              }
            )}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label htmlFor="inst-fin" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Institución financiera
              </label>
              <select
                id="inst-fin"
                className="input w-full"
                {...f2.register('institucion_financiera_id', { required: 'Selecciona una institución' })}
              >
                <option value="">— Seleccionar —</option>
                {(['banco', 'pyme', 'cooperativa']).map((tipo) => (
                  <optgroup key={tipo} label={TIPO_INST_LABEL[tipo] ?? tipo}>
                    {(institucionesPorTipo[tipo] || []).map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.nombre}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {f2.formState.errors.institucion_financiera_id && (
                <p className="mt-1 text-xs text-red-600">
                  {f2.formState.errors.institucion_financiera_id.message}
                </p>
              )}
            </div>
            <Input
              label="Número de cuenta"
              {...f2.register('nro_cuenta', { required: 'Obligatorio' })}
              error={f2.formState.errors.nro_cuenta?.message}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de cuenta
              </label>
              <select className="input w-full" {...f2.register('tipo_cuenta', { required: true })}>
                {TIPO_CUENTA_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Titular de la cuenta"
              {...f2.register('titular_cuenta', { required: 'Obligatorio' })}
              error={f2.formState.errors.titular_cuenta?.message}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Moneda
              </label>
              <select className="input w-full" {...f2.register('moneda', { required: true })}>
                {MONEDA_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full min-h-[48px] sm:col-span-2 sm:min-h-0 sm:w-auto">
              Guardar datos bancarios
            </Button>
          </form>
        </Card>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Campos del documento" subtitle="Activa bloques y marca obligatorios" gradient>
            <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Incluye el recuadro bancario para que el cliente vea cómo pagar. Reordena con las flechas.
            </p>
            <ul className="mb-4 max-h-[min(50vh,22rem)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {CAMPOS_PLANTILLA_CATALOGO.map((preset) => {
                const on = plantillaCampos.some((c) => c.id === preset.id)
                return (
                  <li key={preset.id}>
                    <label
                      className={clsx(
                        'flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200',
                        on
                          ? 'border-primary-200 bg-primary-50/50 dark:border-primary-900/50 dark:bg-primary-950/20'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800/40'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={on}
                        onChange={() => togglePreset(preset)}
                      />
                      <span className="min-w-0 text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{preset.etiqueta}</span>
                        {preset.solo_lectura && (
                          <span className="ml-2 text-xs text-gray-400">(automático)</span>
                        )}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Orden en el documento</p>
            <ul className="space-y-2">
              {plantillaCampos.map((c, idx) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200/90 bg-white/90 px-3 py-2.5 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900/50"
                >
                  <span className="min-w-0 flex-1 basis-[8rem] truncate font-medium text-gray-900 dark:text-white">
                    {c.etiqueta}
                  </span>
                  {!c.solo_lectura && (
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600"
                        checked={Boolean(c.obligatorio)}
                        onChange={(e) => setObligatorioCampo(c.id, e.target.checked)}
                      />
                      Oblig.
                    </label>
                  )}
                  <div className="ml-auto flex shrink-0 gap-0.5">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => moveCampo(idx, -1)}
                      aria-label="Subir"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => moveCampo(idx, 1)}
                      aria-label="Bajar"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Button type="button" className="mt-4 w-full min-h-[48px] sm:min-h-0" onClick={onPaso3}>
              Guardar plantilla
            </Button>
          </Card>

          <Card title="Vista previa" subtitle="Documento de entrega con datos de tu consultora" gradient>
            <div className="-mx-1 overflow-x-auto pb-1 sm:mx-0">
            <EntregaPreview
              nombreMarca={f1v.nombre_comercial || consultora?.nombre_comercial || consultora?.razon_social}
              colorMarca={f1v.color_marca}
              logoUrl={config?.logo_url}
              correoSoporte={f1v.correo_soporte}
              telSoporte={f1v.telefono_contacto}
              institucionNombre={instNombre}
              nroCuenta={f2v.nro_cuenta}
              tipoCuenta={f2v.tipo_cuenta}
              titular={f2v.titular_cuenta}
              moneda={f2v.moneda}
              campos={plantillaCampos}
            />
            </div>
          </Card>
        </div>
      )}

      {step === 4 && (
        <Card title="Paso 4 — Resumen y activación" subtitle={STEPS[3].desc} gradient>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                  <Building2 className="h-4 w-4" />
                </span>
                Validación previa a operar
              </h3>
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li
                    key={item.text}
                    className={clsx(
                      'flex items-start gap-3 rounded-xl border px-3 py-3 text-sm transition-shadow duration-200',
                      item.ok
                        ? 'border-emerald-200/80 bg-emerald-50/40 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20'
                        : 'border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15'
                    )}
                  >
                    {item.ok ? (
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <span
                      className={
                        item.ok
                          ? 'font-medium text-gray-800 dark:text-gray-200'
                          : 'font-medium text-amber-900 dark:text-amber-100'
                      }
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200/90 bg-gradient-to-b from-gray-50/90 to-white/50 p-4 text-sm shadow-sm dark:border-gray-700 dark:from-gray-900/60 dark:to-gray-900/40">
              <h4 className="font-semibold text-gray-900 dark:text-white">Datos guardados</h4>
              <dl className="mt-3 space-y-3 text-gray-600 dark:text-gray-300">
                <div className="border-b border-gray-100 pb-2 dark:border-gray-800">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Marca</dt>
                  <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">
                    {consultora?.nombre_comercial || consultora?.razon_social || '—'}
                  </dd>
                </div>
                <div className="border-b border-gray-100 pb-2 dark:border-gray-800">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Soporte</dt>
                  <dd className="mt-0.5 break-words font-medium">
                    {config?.correo_soporte || '—'} · {config?.telefono_soporte || '—'}
                  </dd>
                </div>
                <div className="border-b border-gray-100 pb-2 dark:border-gray-800">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Banco</dt>
                  <dd className="mt-0.5 font-medium">{config?.banco || config?.institucion_financiera?.nombre || '—'}</dd>
                </div>
                <div className="border-b border-gray-100 pb-2 dark:border-gray-800">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Cuenta / moneda</dt>
                  <dd className="mt-0.5 font-medium">
                    {config?.nro_cuenta || '—'} · {labelTipoCuenta(config?.tipo_cuenta)} ·{' '}
                    {labelMoneda(config?.moneda)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Campos en plantilla</dt>
                  <dd className="mt-0.5 text-lg font-bold tabular-nums text-primary-600 dark:text-primary-400">
                    {config?.plantilla_entrega?.campos?.length ?? 0}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <Button
            type="button"
            className="mt-6 w-full min-h-[52px] text-base font-semibold shadow-md shadow-primary-600/15 transition-all hover:shadow-lg disabled:opacity-60 sm:w-auto sm:min-h-0 sm:text-sm"
            disabled={!allChecklistOk}
            onClick={finalizar}
            title={!allChecklistOk ? 'Completa los ítems pendientes' : ''}
          >
            Activar consultora y comenzar a operar
          </Button>
          {!allChecklistOk && (
            <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100">
              Revisa los pasos anteriores: el botón se habilita cuando todos los requisitos están completos.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
