import React from 'react'
import { Link } from 'react-router-dom'
import {
  Layers,
  Building2,
  Users,
  FileCheck,
  Shield,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Landmark,
  Briefcase,
  LineChart,
} from 'lucide-react'

const Home = () => {
  const actores = [
    { titulo: 'Administrador del sistema', desc: 'Registra empresas consultoras y activación inicial.', icon: Shield },
    { titulo: 'Empresa consultora', desc: 'Configuración, equipo, empresas cliente y cumplimiento.', icon: Building2 },
    { titulo: 'Colaborador', desc: 'Personal, AFP, CAJA y Ministerio con permisos por módulo.', icon: Users },
    { titulo: 'Empresa cliente', desc: 'Portal de solo lectura, cobertura y descarga de documentos.', icon: FileCheck },
  ]

  const servicios = [
    {
      titulo: 'Gestión AFP',
      desc: 'Control operativo de aportes y validaciones para evitar observaciones y mora.',
      icon: Landmark,
    },
    {
      titulo: 'Caja y Salud',
      desc: 'Seguimiento de altas, bajas y reportes para seguridad social con trazabilidad.',
      icon: Briefcase,
    },
    {
      titulo: 'Ministerio de Trabajo',
      desc: 'Cumplimiento laboral con alertas y documentos centralizados por empresa cliente.',
      icon: FileCheck,
    },
  ]

  const metricas = [
    { valor: '4', etiqueta: 'Roles operativos integrados' },
    { valor: '10', etiqueta: 'Fases del flujo oficial' },
    { valor: '24/7', etiqueta: 'Acceso al portal de clientes' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 shadow-soft">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Consult-360</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestión laboral AFP · CAJA · Ministerio</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#servicios" className="text-sm font-medium text-slate-600 transition hover:text-primary-700 dark:text-slate-300">
              Servicios
            </a>
            <a href="#actores" className="text-sm font-medium text-slate-600 transition hover:text-primary-700 dark:text-slate-300">
              Actores
            </a>
            <a href="#metodologia" className="text-sm font-medium text-slate-600 transition hover:text-primary-700 dark:text-slate-300">
              Metodología
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-primary-800 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-primary-700"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-primary-950 to-primary-900 px-4 pb-24 pt-16 text-white dark:border-slate-800 md:px-6 md:pt-20">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-primary-500/25 blur-3xl animate-pulse-slow" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-pulse-slow [animation-delay:300ms]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
              Precision administrativa
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Gestión de consultoría con diseño claro y control total
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
              Desde la activación de consultoras hasta el portal de empresa cliente, tu operación laboral
              se ejecuta en un flujo único con alertas, trazabilidad y cumplimiento documental.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 transition hover:scale-[1.02] hover:bg-slate-100"
              >
                Entrar al sistema
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/flujo-operativo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4" />
                Ver flujo operativo
              </Link>
            </div>
          </div>
          <div className="animate-fade-in-up-slow rounded-3xl border border-white/15 bg-white/10 p-6 shadow-soft-lg backdrop-blur-md">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100">Visión de plataforma</p>
            <div className="mt-5 space-y-4">
              {metricas.map((item, idx) => (
                <div
                  key={item.etiqueta}
                  className={`rounded-2xl border border-white/15 bg-white/10 p-4 animate-scale-in ${
                    idx === 1 ? '[animation-delay:100ms]' : idx === 2 ? '[animation-delay:200ms]' : ''
                  }`}
                >
                  <p className="text-2xl font-extrabold">{item.valor}</p>
                  <p className="text-sm text-slate-200">{item.etiqueta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300">Servicios clave</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Cobertura integral para cumplimiento laboral
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Adaptamos la operación real de consultora, colaboradores y empresas cliente en una interfaz
              moderna orientada a productividad.
            </p>
          </div>
          <div className="text-6xl font-black leading-none text-primary-100 dark:text-primary-900/70">01</div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {servicios.map(({ titulo, desc, icon: Icon }, idx) => (
            <div
              key={titulo}
              className={`group rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900 animate-fade-in-up ${
                idx === 1 ? '[animation-delay:120ms]' : idx === 2 ? '[animation-delay:220ms]' : ''
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 transition group-hover:scale-105 dark:bg-primary-900/40 dark:text-primary-300">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-300">
                Detalles del servicio
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="actores" className="bg-slate-100/80 py-20 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Actores del sistema</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-300">
            Permisos segmentados por rol para mantener control y visibilidad en cada etapa del proceso.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {actores.map(({ titulo, desc, icon: Icon }, idx) => (
              <div
                key={titulo}
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-950 animate-fade-in-up ${
                  idx === 1 ? '[animation-delay:80ms]' : idx === 2 ? '[animation-delay:150ms]' : idx === 3 ? '[animation-delay:220ms]' : ''
                }`}
              >
                <Icon className="h-8 w-8 text-primary-700 dark:text-primary-300" />
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{titulo}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="metodologia" className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:items-center md:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-8 text-white shadow-soft-lg">
            <h3 className="text-2xl font-extrabold">Metodología operativa</h3>
            <p className="mt-4 text-slate-200">
              Centralizamos tareas críticas con criterios de precisión, alertas y visibilidad para decisiones más rápidas.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-200" />
                <p className="text-sm text-slate-100">Precisión documental en cada carga y validación.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-200" />
                <p className="text-sm text-slate-100">Flujo claro entre consultora, colaborador y empresa cliente.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-200" />
                <p className="text-sm text-slate-100">Alertas y trazabilidad para cumplimiento normativo continuo.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 inline-flex rounded-xl bg-primary-100 p-2 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                <LineChart className="h-5 w-5" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Visibilidad ejecutiva</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                El tablero y las alertas permiten detectar pendientes antes de convertirse en riesgo operativo.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-3xl font-extrabold text-primary-700 dark:text-primary-300">99%</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tareas críticas centralizadas</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-3xl font-extrabold text-primary-700 dark:text-primary-300">+40%</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Mejora en tiempos operativos</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 dark:text-slate-400 md:flex-row md:px-6">
          <p>Consult-360 — Sistema de gestión laboral (Bolivia).</p>
          <div className="flex items-center gap-4">
            <Link to="/flujo-operativo" className="hover:text-primary-700 dark:hover:text-primary-300">
              Flujo operativo
            </Link>
            <Link to="/login" className="hover:text-primary-700 dark:hover:text-primary-300">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
