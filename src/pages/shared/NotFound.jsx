import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Página no encontrada
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            La ruta solicitada no existe en LaboraConsult.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full rounded-md bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
          >
            Ir al inicio
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="block w-full rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
