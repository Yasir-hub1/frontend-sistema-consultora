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
} from 'lucide-react'

const Home = () => {
  const actores = [
    { titulo: 'Administrador del sistema', desc: 'Registra empresas consultoras y activación inicial.', icon: Shield },
    { titulo: 'Empresa consultora', desc: 'Configuración, equipo, empresas cliente y cumplimiento.', icon: Building2 },
    { titulo: 'Colaborador', desc: 'Personal, AFP, CAJA y Ministerio con permisos por módulo.', icon: Users },
    { titulo: 'Empresa cliente', desc: 'Portal de solo lectura, cobertura y descarga de documentos.', icon: FileCheck },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-600">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">LaboraConsult</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestión laboral AFP · CAJA · Ministerio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/flujo-operativo"
              className="hidden text-sm font-medium text-gray-600 hover:text-primary-600 sm:inline dark:text-gray-300"
            >
              Flujo operativo
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-gray-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-20 text-white dark:border-gray-800">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Cumplimiento documental para consultoras y sus empresas cliente
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Del registro de la consultora a las alertas automáticas y el portal de solo lectura del
            cliente: un solo flujo alineado a tu modelo de datos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Entrar al sistema
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/flujo-operativo"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" />
              Ver las 10 fases
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">Actores del sistema</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          Cada rol tiene acceso acotado según el flujo operativo oficial.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {actores.map(({ titulo, desc, icon: Icon }) => (
            <div
              key={titulo}
              className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 dark:border-gray-800 dark:bg-gray-900/50"
            >
              <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{titulo}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          LaboraConsult — Sistema de gestión laboral (Bolivia).
        </div>
      </footer>
    </div>
  )
}

export default Home
