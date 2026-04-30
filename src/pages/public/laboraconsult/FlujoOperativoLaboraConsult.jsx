import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Circle, Eye, Filter, GitMerge, Layers, Workflow } from 'lucide-react'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import Alert from '../../../components/common/Alert'
import { ACTOR_META, FLUJO_FASES } from './flujoOperativoData'

const actorOptions = [
  { value: 'todos', label: 'Todos los actores' },
  { value: 'admin', label: ACTOR_META.admin.nombre },
  { value: 'sistema', label: ACTOR_META.sistema.nombre },
  { value: 'consultora', label: ACTOR_META.consultora.nombre },
  { value: 'colaborador', label: ACTOR_META.colaborador.nombre },
  { value: 'empresa', label: ACTOR_META.empresa.nombre },
]

function FlujoOperativoLaboraConsult() {
  const [faseActual, setFaseActual] = useState(0)
  const [actorFiltro, setActorFiltro] = useState('todos')
  const [pasoSeleccionado, setPasoSeleccionado] = useState(null)

  const fase = FLUJO_FASES[faseActual]

  const pasosFiltrados = useMemo(() => {
    if (actorFiltro === 'todos') return fase.pasos
    return fase.pasos.filter((paso) => paso.actor === actorFiltro)
  }, [fase, actorFiltro])

  const conteoActores = useMemo(() => {
    const conteo = { admin: 0, sistema: 0, consultora: 0, colaborador: 0, empresa: 0 }
    fase.pasos.forEach((paso) => {
      conteo[paso.actor] += 1
    })
    return conteo
  }, [fase])

  const goToFase = (index) => {
    setFaseActual(index)
    setActorFiltro('todos')
    setPasoSeleccionado(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card
          className="border border-primary-200/60"
          title="Consult-360 - Flujo Operativo Integrado"
          subtitle="Vista ejecutable de negocio alineada a DB v2, modelos y relaciones del sistema"
          headerClassName="pb-4"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-primary-50 p-4 dark:bg-primary-900/20">
              <p className="text-xs font-semibold uppercase text-primary-700 dark:text-primary-300">Fases operativas</p>
              <p className="mt-1 text-2xl font-bold text-primary-800 dark:text-primary-200">{FLUJO_FASES.length}</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-900/20">
              <p className="text-xs font-semibold uppercase text-violet-700 dark:text-violet-300">Pasos de la fase actual</p>
              <p className="mt-1 text-2xl font-bold text-violet-800 dark:text-violet-200">{fase.pasos.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">Progreso de lectura</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">{faseActual + 1}/{FLUJO_FASES.length}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-3" title="Navegacion por fases" subtitle="Selecciona una fase del flujo">
            <div className="space-y-2">
              {FLUJO_FASES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToFase(index)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    index === faseActual
                      ? 'border-primary-500 bg-primary-100/70 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100'
                      : 'border-gray-200 bg-white/60 text-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200'
                  }`}
                >
                  <p className="font-semibold">Fase {index + 1}</p>
                  <p className="text-xs opacity-80">{item.titulo.replace(/^Fase\s\d+\s-\s/, '')}</p>
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-6 lg:col-span-9">
            <Card>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center rounded-full border border-primary-300 bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 dark:border-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                      <Circle className="mr-2 h-2.5 w-2.5 fill-current" />
                      Fase {faseActual + 1} de {FLUJO_FASES.length}
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{fase.titulo}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{fase.descripcion}</p>
                  </div>
                  <div className="w-full max-w-xs">
                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      <Filter className="h-3.5 w-3.5" />
                      Filtrar pasos
                    </label>
                    <select
                      value={actorFiltro}
                      onChange={(e) => setActorFiltro(e.target.value)}
                      className="input h-10"
                    >
                      {actorOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {Object.entries(ACTOR_META).map(([actor, meta]) => (
                    <div key={actor} className="rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/60">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{meta.nombre}</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{conteoActores[actor]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Secuencia operativa" subtitle="Haz clic en un paso para ver detalle en modal">
              <div className="space-y-4">
                {pasosFiltrados.length === 0 ? (
                  <Alert type="warning" title="Sin pasos para el filtro actual">
                    No existen pasos de este actor en la fase seleccionada.
                  </Alert>
                ) : (
                  pasosFiltrados.map((paso, idx) => {
                    const actor = ACTOR_META[paso.actor]
                    return (
                      <div key={`${paso.titulo}-${idx}`}>
                        <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                          <div className="flex flex-wrap items-start gap-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${actor.badgeClass}`}>
                              {actor.short}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{paso.titulo}</p>
                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{paso.detalle}</p>
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{paso.ubicacion}</p>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Eye className="h-3.5 w-3.5" />}
                              onClick={() => setPasoSeleccionado({ ...paso, actorMeta: actor, idx: idx + 1 })}
                            >
                              Ver detalle
                            </Button>
                          </div>
                        </div>
                        {idx < pasosFiltrados.length - 1 && (
                          <div className="my-1 flex justify-center text-gray-400">
                            <GitMerge className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </Card>

            <Alert type="info" title="Resultado de la fase actual" variant="glass">
              <p className="text-sm leading-relaxed">{fase.resumen}</p>
            </Alert>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
                disabled={faseActual === 0}
                onClick={() => goToFase(Math.max(0, faseActual - 1))}
              >
                Fase anterior
              </Button>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Fase {faseActual + 1} de {FLUJO_FASES.length}
              </span>
              <Button
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
                disabled={faseActual === FLUJO_FASES.length - 1}
                onClick={() => goToFase(Math.min(FLUJO_FASES.length - 1, faseActual + 1))}
              >
                Siguiente fase
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(pasoSeleccionado)}
        onClose={() => setPasoSeleccionado(null)}
        title={pasoSeleccionado?.titulo}
        size="lg"
        footer={(
          <Button variant="primary" onClick={() => setPasoSeleccionado(null)}>
            Entendido
          </Button>
        )}
      >
        {pasoSeleccionado && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${pasoSeleccionado.actorMeta.badgeClass}`}>
                {pasoSeleccionado.actorMeta.nombre}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                Paso {pasoSeleccionado.idx}
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Contexto</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{pasoSeleccionado.ubicacion}</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Detalle operativo</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-gray-100">{pasoSeleccionado.detalle}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                  <Workflow className="h-3.5 w-3.5" /> Impacto en flujo
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">Este paso condiciona la transicion segura al siguiente tramo operativo.</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                  <Layers className="h-3.5 w-3.5" /> Relacion de datos
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">Mantiene consistencia entre usuarios, empresas, personal, documentos y alertas.</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default FlujoOperativoLaboraConsult
