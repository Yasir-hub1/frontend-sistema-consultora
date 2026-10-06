import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { consultoraService } from '../services/consultoraService'

async function todasLasEmpresasDeConsultora() {
  const empresas = []
  let page = 1
  let lastPage = 1
  do {
    const r = await consultoraService.listEmpresasCliente({ per_page: 100, page })
    if (!r.success) break
    empresas.push(...(r.data?.data ?? []))
    lastPage = r.data?.last_page ?? 1
    page += 1
  } while (page <= lastPage)
  return empresas
}

function unirSinRepetir(principal, extra) {
  const vistos = new Set(principal.map((e) => Number(e.id)))
  return [...principal, ...extra.filter((e) => !vistos.has(Number(e.id)))]
}

/**
 * Un usuario consultora puede estar ligado también como colaborador, por eso se une
 * la lista del módulo de reportes con la cartera paginada de la consultora.
 */
export function useEmpresasReporte(reportes, modo) {
  const [empresas, setEmpresas] = useState([])

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      const res = await reportes.listEmpresasClienteReporte()
      const deReportes = res.success && Array.isArray(res.data) ? res.data : []
      const lista = modo === 'colaborador' ? deReportes : unirSinRepetir(deReportes, await todasLasEmpresasDeConsultora())
      if (cancelado) return
      setEmpresas(lista)
      if (lista.length === 0 && !res.success) toast.error(res.message || 'No se pudo cargar la lista de empresas.')
    })()
    return () => {
      cancelado = true
    }
  }, [reportes, modo])

  return empresas
}

export function nombreEmpresa(e) {
  return e?.nombre || e?.razon_social || `Empresa #${e?.id}`
}
