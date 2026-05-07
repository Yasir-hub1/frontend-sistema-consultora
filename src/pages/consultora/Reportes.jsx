import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, FileText, Building2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { consultoraService } from '../../services/consultoraService'

function formatBytes(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  if (v < 1024) return `${v} B`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`
  return `${(v / (1024 * 1024)).toFixed(1)} MB`
}

export default function ConsultoraReportes() {
  const [mesGestion, setMesGestion] = useState(new Date().toISOString().slice(0, 7))
  const [modulo, setModulo] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewLoadingId, setPreviewLoadingId] = useState(null)
  const [exporting, setExporting] = useState(false)

  const [empresasCliente, setEmpresasCliente] = useState([])
  const [empresaResumenId, setEmpresaResumenId] = useState('')
  const [mesResumen, setMesResumen] = useState(new Date().toISOString().slice(0, 7))
  const [resumenData, setResumenData] = useState(null)
  const [resumenLoading, setResumenLoading] = useState(false)
  const [resumenPdfLoading, setResumenPdfLoading] = useState(false)
  const [resumenPreview, setResumenPreview] = useState(null)

  const load = async () => {
    setLoading(true)
    const res = await consultoraService.listReportesDeclaraciones({
      mes_gestion: mesGestion,
      modulo,
      per_page: 200,
    })
    setLoading(false)
    if (res.success) setRows(res.data?.data ?? [])
    else {
      setRows([])
      toast.error(res.message || 'No se pudo cargar el reporte.')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadEmpresas = async () => {
      const acc = []
      let page = 1
      let lastPage = 1
      do {
        const res = await consultoraService.listEmpresasCliente({ per_page: 100, page })
        if (!res.success) break
        const chunk = res.data?.data ?? []
        acc.push(...chunk)
        lastPage = res.data?.last_page ?? 1
        page += 1
      } while (page <= lastPage)
      setEmpresasCliente(acc)
    }
    void loadEmpresas()
  }, [])

  const totalSize = useMemo(
    () => rows.reduce((acc, r) => acc + Number(r?.tamano_bytes || 0), 0),
    [rows]
  )

  const onPreview = async (row) => {
    setPreviewLoadingId(row.id)
    const res = await consultoraService.fetchReporteDeclaracionPreviewBlob(row.id)
    setPreviewLoadingId(null)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo abrir la vista previa.')
      return
    }
    const url = URL.createObjectURL(res.blob)
    setPreview({ id: row.id, title: row.nombre_original, url })
  }

  const onClosePreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null)
  }

  const onConsultarResumen = async () => {
    if (!empresaResumenId || !mesResumen) {
      toast.error('Selecciona empresa y mes.')
      return
    }
    setResumenLoading(true)
    setResumenData(null)
    const res = await consultoraService.getResumenAportesMensual({
      empresa_cliente_id: Number(empresaResumenId),
      mes_gestion: mesResumen,
    })
    setResumenLoading(false)
    if (!res.success) {
      toast.error(res.message || 'No se pudo cargar el resumen.')
      return
    }
    setResumenData(res.data)
    toast.success('Datos del periodo cargados.')
  }

  const onResumenPdfPreview = async () => {
    if (!empresaResumenId || !mesResumen) {
      toast.error('Selecciona empresa y mes.')
      return
    }
    setResumenPdfLoading(true)
    const res = await consultoraService.fetchResumenAportesPdfBlob({
      empresa_cliente_id: Number(empresaResumenId),
      mes_gestion: mesResumen,
    })
    setResumenPdfLoading(false)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo generar el PDF.')
      return
    }
    const url = URL.createObjectURL(res.blob)
    setResumenPreview({ url, title: `Resumen aportes ${mesResumen}` })
  }

  const onCloseResumenPreview = () => {
    if (resumenPreview?.url) URL.revokeObjectURL(resumenPreview.url)
    setResumenPreview(null)
  }

  const onDescargarResumenPdf = async () => {
    if (!empresaResumenId || !mesResumen) {
      toast.error('Selecciona empresa y mes.')
      return
    }
    setResumenPdfLoading(true)
    const res = await consultoraService.fetchResumenAportesPdfBlob({
      empresa_cliente_id: Number(empresaResumenId),
      mes_gestion: mesResumen,
    })
    setResumenPdfLoading(false)
    if (!res.success || !res.blob) {
      toast.error(res.message || 'No se pudo descargar el PDF.')
      return
    }
    const nombre =
      resumenData?.empresa_cliente?.nombre ||
      resumenData?.empresa_cliente?.razon_social ||
      'empresa'
    const safe = String(nombre)
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 40)
    const downloadUrl = window.URL.createObjectURL(res.blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `resumen_aportes_${safe}_${mesResumen}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    toast.success('PDF descargado.')
  }

  const onExportPdf = async () => {
    if (!mesGestion) {
      toast.error('Selecciona un mes.')
      return
    }
    setExporting(true)
    const res = await consultoraService.exportarReporteDeclaracionesPdf({
      mes_gestion: mesGestion,
      modulo: modulo || null,
    })
    setExporting(false)
    if (!res.success) toast.error(res.message || 'No se pudo exportar el PDF consolidado.')
    else toast.success('Reporte PDF generado.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Filtra por mes y módulo (AFP, CAJA, Ministerio), previsualiza y exporta PDF consolidado. Genera la carta de
          detalle de aportes por empresa y mes según las declaraciones registradas.
        </p>
      </div>

      <Card
        title="Resumen mensual de aportes (carta)"
        subtitle="Consolida montos de todas las declaraciones del periodo (AFP, CAJA, Ministerio) y descarga el PDF tipo carta"
        gradient
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Empresa cliente</label>
            <select
              value={empresaResumenId}
              onChange={(e) => {
                setEmpresaResumenId(e.target.value)
                setResumenData(null)
              }}
              className="input w-full py-2.5"
            >
              <option value="">Seleccionar…</option>
              {empresasCliente.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre || e.razon_social || `Empresa #${e.id}`}
                  {e.nit ? ` · ${e.nit}` : ''}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Mes"
            type="month"
            value={mesResumen}
            onChange={(e) => {
              setMesResumen(e.target.value)
              setResumenData(null)
            }}
          />
          <div className="flex flex-col justify-end gap-2">
            <Button
              type="button"
              className="w-full"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => void onConsultarResumen()}
              disabled={resumenLoading}
            >
              {resumenLoading ? 'Consultando…' : 'Consultar montos'}
            </Button>
          </div>
        </div>

        {resumenData?.montos_fmt && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                  <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Concepto</th>
                  <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Total ganado</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">
                    {resumenData.montos_fmt.total_ganado}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Depósito CNS (10% T.G.)</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">
                    {resumenData.montos_fmt.deposito_cns}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Aportes gestora 19.92%</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">
                    {resumenData.montos_fmt.aportes_gestora}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Aporte solidario gestora</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">
                    {resumenData.montos_fmt.aporte_solidario}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                    Planilla MDT ({resumenData.mes_nombre} {resumenData.anio})
                  </td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">
                    {resumenData.montos_fmt.planilla_mdt}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Seprec registro poder</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">
                    {resumenData.montos_fmt.seprec}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-semibold dark:bg-gray-800/60">
                  <td className="px-3 py-2 text-gray-900 dark:text-white">Total aportes a pagar</td>
                  <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                    {resumenData.montos_fmt.total_aportes}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => void onResumenPdfPreview()}
            disabled={resumenPdfLoading || !empresaResumenId || !mesResumen}
          >
            {resumenPdfLoading ? 'PDF…' : 'Ver PDF'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<Download className="h-4 w-4" />}
            onClick={() => void onDescargarResumenPdf()}
            disabled={resumenPdfLoading || !empresaResumenId || !mesResumen}
          >
            Descargar PDF
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <Building2 className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom" />
          Los importes provienen de las declaraciones mensuales cargadas por módulo (incluyendo Ministerio: Total
          ganado, Planilla MDT mensual y SEPREC); el PDF usa logo, cuenta bancaria y datos de contacto de la
          configuración de la consultora.
        </p>
      </Card>

      <Card title="Filtros" subtitle="Parametriza el reporte y ejecuta búsqueda" gradient>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            label="Mes gestión"
            type="month"
            value={mesGestion}
            onChange={(e) => setMesGestion(e.target.value)}
          />
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Módulo</label>
            <select value={modulo} onChange={(e) => setModulo(e.target.value)} className="input w-full py-2.5">
              <option value="">Todos</option>
              <option value="afp">AFP</option>
              <option value="caja">CAJA</option>
              <option value="ministerio">Ministerio</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" className="w-full" onClick={() => void load()}>
              Buscar
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              icon={<Download className="h-4 w-4" />}
              onClick={() => void onExportPdf()}
              disabled={exporting}
            >
              {exporting ? 'Exportando…' : 'Exportar PDF'}
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Documentos encontrados"
        subtitle={`${rows.length} archivo(s) · ${formatBytes(totalSize)} total`}
        gradient
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando…</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Sin resultados para los filtros actuales.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                  <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Empresa</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Mes</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Módulo</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Archivo</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">Tamaño</th>
                  <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((r) => (
                  <tr key={r.id} className="bg-white dark:bg-gray-900/30">
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.empresa_nombre || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.mes_gestion}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-700 dark:text-gray-300">{String(r.modulo || '').toUpperCase()}</td>
                    <td className="max-w-[14rem] truncate px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.nombre_original}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-500 dark:text-gray-400">{formatBytes(r.tamano_bytes)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => void onPreview(r)}
                          disabled={previewLoadingId === r.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => void consultoraService.descargarReporteDeclaracion(r.id, r.nombre_original)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 dark:border-gray-600 dark:text-primary-300 dark:hover:bg-gray-800"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Descargar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(preview)}
        onClose={onClosePreview}
        title={preview?.title || 'Vista previa'}
        size="xl"
        bodyClassName="p-0"
      >
        {preview?.url ? (
          <iframe title={preview.title} src={preview.url} className="h-[75vh] w-full border-0 bg-gray-100" />
        ) : (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
            <FileText className="mb-2 h-5 w-5" />
            Sin vista previa.
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(resumenPreview)}
        onClose={onCloseResumenPreview}
        title={resumenPreview?.title || 'Resumen PDF'}
        size="xl"
        bodyClassName="p-0"
      >
        {resumenPreview?.url ? (
          <iframe title={resumenPreview.title} src={resumenPreview.url} className="h-[75vh] w-full border-0 bg-gray-100" />
        ) : (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
            <FileText className="mb-2 h-5 w-5" />
            Sin vista previa.
          </div>
        )}
      </Modal>
    </div>
  )
}
