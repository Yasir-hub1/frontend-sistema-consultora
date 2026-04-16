import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader2,
  X,
} from 'lucide-react'
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
      className="mx-auto max-w-3xl rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg dark:border-gray-600 dark:bg-gray-900"
      style={{ borderTopWidth: 4, borderTopColor: colorMarca || '#2563EB' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-700">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Documento de entrega
          </p>
          <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {nombreMarca || 'Tu consultora'}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Soporte: {correoSoporte || '—'} · {telSoporte || '—'}
          </p>
        </div>
        {logoUrl ? (
          <img
            src={logoAbsUrl(logoUrl)}
            alt="Logo"
            className="h-16 max-w-[140px] object-contain"
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
                <table className="w-full text-left text-sm">
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
        Vista previa · LaboraConsult · {new Date().getFullYear()}
      </p>
    </div>
  )
}

export default function ConsultoraConfiguracionInicial() {
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
    const res = await consultoraService.guardarPasoConfiguracion(paso, payload)
    if (res.success) {
      setStatus('Guardado correctamente.')
      if (res.data) setConfig(res.data)
      await loadConfig()
      if (paso < 4) setStep(paso + 1)
    } else setStatus(res.message)
  }

  const onLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus(null)
    setLogoUploading(true)
    const fd = new FormData()
    fd.append('logo', file)
    const res = await consultoraService.subirLogo(fd)
    setLogoUploading(false)
    e.target.value = ''
    if (res.success) {
      setStatus('Logo subido.')
      await loadConfig()
    } else setStatus(res.message)
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

  const finalizar = async () => {
    setStatus(null)
    const res = await consultoraService.finalizarConfiguracion()
    if (res.success) {
      setStatus(res.message || 'Consultora activa operativamente.')
      await loadConfig()
    } else {
      const pend = res.errors?.pendientes
      if (Array.isArray(pend) && pend.length) {
        setStatus(`${res.message}\n${pend.map((p) => `• ${p}`).join('\n')}`)
      } else {
        setStatus(res.message)
      }
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración inicial</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Cuatro pasos para dejar tu consultora lista. Los datos alimentan la vista previa del documento
          de entrega y la validación final.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              step === s.id
                ? 'bg-primary-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      {status && (
        <div className="whitespace-pre-line rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100">
          {status}
        </div>
      )}

      {step === 1 && (
        <Card title="Paso 1 — Identidad" subtitle={STEPS[0].desc}>
          <form
            onSubmit={f1.handleSubmit((d) => saveStep(1, d))}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Logo</p>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  {logoUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-primary-600" />
                  )}
                  <span>Subir imagen (PNG, JPG, SVG · máx. 2MB)</span>
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
                    className="h-14 max-w-[120px] rounded object-contain ring-1 ring-gray-200 dark:ring-gray-600"
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                URL pública:{' '}
                <code className="rounded bg-black/5 px-1 text-[10px] dark:bg-white/10">
                  POST {APP_CONFIG.apiUrl}/configuracion/logo
                </code>
              </p>
            </div>
            <Input
              label="Nombre comercial"
              {...f1.register('nombre_comercial', { required: 'Obligatorio' })}
              error={f1.formState.errors.nombre_comercial?.message}
            />
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
            <Button type="submit" className="sm:col-span-2">
              Guardar identidad
            </Button>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card title="Paso 2 — Datos bancarios" subtitle={STEPS[1].desc}>
          <form onSubmit={f2.handleSubmit(onPaso2)} className="grid gap-4 sm:grid-cols-2">
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
            <Button type="submit" className="sm:col-span-2">
              Guardar datos bancarios
            </Button>
          </form>
        </Card>
      )}

      {step === 3 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Campos del documento" subtitle="Activa bloques y marca obligatorios">
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Incluye el recuadro bancario para que el cliente vea cómo pagar. Reordena con las flechas.
            </p>
            <ul className="mb-4 space-y-2">
              {CAMPOS_PLANTILLA_CATALOGO.map((preset) => {
                const on = plantillaCampos.some((c) => c.id === preset.id)
                return (
                  <li key={preset.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-100 p-2 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-gray-300"
                        checked={on}
                        onChange={() => togglePreset(preset)}
                      />
                      <span className="text-sm">
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
            <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Orden en el documento</p>
            <ul className="space-y-2">
              {plantillaCampos.map((c, idx) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{c.etiqueta}</span>
                  {!c.solo_lectura && (
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={Boolean(c.obligatorio)}
                        onChange={(e) => setObligatorioCampo(c.id, e.target.checked)}
                      />
                      Oblig.
                    </label>
                  )}
                  <button
                    type="button"
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => moveCampo(idx, -1)}
                    aria-label="Subir"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => moveCampo(idx, 1)}
                    aria-label="Bajar"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Button type="button" className="mt-4 w-full" onClick={onPaso3}>
              Guardar plantilla
            </Button>
          </Card>

          <Card title="Vista previa" subtitle="Documento de entrega con datos de tu consultora">
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
          </Card>
        </div>
      )}

      {step === 4 && (
        <Card title="Paso 4 — Resumen y activación" subtitle={STEPS[3].desc}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Building2 className="h-4 w-4" />
                Validación previa a operar
              </h3>
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
                  >
                    {item.ok ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <span className={item.ok ? 'text-gray-700 dark:text-gray-300' : 'text-red-700 dark:text-red-300'}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-sm dark:border-gray-700 dark:bg-gray-800/40">
              <h4 className="font-semibold text-gray-900 dark:text-white">Datos guardados</h4>
              <dl className="mt-3 space-y-2 text-gray-600 dark:text-gray-300">
                <div>
                  <dt className="text-xs uppercase text-gray-400">Marca</dt>
                  <dd>{consultora?.nombre_comercial || consultora?.razon_social || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-gray-400">Soporte</dt>
                  <dd>
                    {config?.correo_soporte || '—'} · {config?.telefono_soporte || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-gray-400">Banco</dt>
                  <dd>{config?.banco || config?.institucion_financiera?.nombre || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-gray-400">Cuenta / moneda</dt>
                  <dd>
                    {config?.nro_cuenta || '—'} · {labelTipoCuenta(config?.tipo_cuenta)} ·{' '}
                    {labelMoneda(config?.moneda)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-gray-400">Campos en plantilla</dt>
                  <dd>{config?.plantilla_entrega?.campos?.length ?? 0}</dd>
                </div>
              </dl>
            </div>
          </div>
          <Button
            type="button"
            className="mt-6"
            disabled={!allChecklistOk}
            onClick={finalizar}
            title={!allChecklistOk ? 'Completa los ítems pendientes' : ''}
          >
            Activar consultora y comenzar a operar
          </Button>
          {!allChecklistOk && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              Revisa los pasos anteriores: el botón se habilita cuando todos los requisitos están en verde.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
