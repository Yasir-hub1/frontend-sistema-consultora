import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { normalizeRole, ROLES } from '../utils/roleUtils'
import { usePushNotifications } from '../hooks/usePushNotifications'

import Home from '../pages/public/Home'
import FlujoOperativoLaboraConsult from '../pages/public/laboraconsult/FlujoOperativoLaboraConsult'
import Login from '../pages/shared/Login'
import CambiarContrasenaInicial from '../pages/shared/CambiarContrasenaInicial'
import NotFound from '../pages/shared/NotFound'
import Perfil from '../pages/shared/Perfil'
import ActivarCuenta from '../pages/auth/ActivarCuenta'

import AdminDashboard from '../pages/admin/Dashboard'
import EmpresasConsultoras from '../pages/admin/EmpresasConsultoras'

import ConsultoraDashboard from '../pages/consultora/Dashboard'
import ConsultoraConfiguracion from '../pages/consultora/ConfiguracionInicial'
import ConsultoraMiEquipo from '../pages/consultora/MiEquipo'
import ConsultoraMisEmpresas from '../pages/consultora/MisEmpresas'
import ConsultoraEmpresaDetalle from '../pages/consultora/EmpresaClienteDetalle'
import ConsultoraAlertas from '../pages/consultora/Alertas'
import ConsultoraCatalogoDocumentos from '../pages/consultora/CatalogoDocumentos'
import ConsultoraReportes from '../pages/consultora/Reportes'

import ColaboradorDashboard from '../pages/colaborador/Dashboard'
import ColaboradorEmpresas from '../pages/colaborador/EmpresasAsignadas'
import ColaboradorPersonal from '../pages/colaborador/PersonalLista'
import ColaboradorEmpleado from '../pages/colaborador/EmpleadoGestion'

import TramitesListaPage from '../pages/tramites/TramitesLista'
import TramitesAgendaPage from '../pages/tramites/TramitesAgenda'
import TramiteDetallePage from '../pages/tramites/TramiteDetalle'

import EmpresaClienteDashboard from '../pages/empresa-cliente/Dashboard'
import EmpresaClientePersonal from '../pages/empresa-cliente/Personal'
import EmpresaClienteEmpleado from '../pages/empresa-cliente/EmpleadoVista'
import EmpresaClienteMiConsultora from '../pages/empresa-cliente/MiConsultora'
import EmpresaClienteMiEmpresa from '../pages/empresa-cliente/MiEmpresa'
import EmpresaClienteDeclaraciones from '../pages/empresa-cliente/DeclaracionesMensuales'
import EmpresaClienteOtrosDocumentos from '../pages/empresa-cliente/OtrosDocumentos'

function postLoginHome(user) {
  const r = normalizeRole(user?.rol)
  if (r === ROLES.ADMINISTRADOR) return '/admin/dashboard'
  if (r === ROLES.CONSULTORA) return '/consultora/dashboard'
  if (r === ROLES.COLABORADOR) return '/colaborador/dashboard'
  if (r === ROLES.EMPRESA_CLIENTE) return '/empresa-cliente/dashboard'
  return '/login'
}

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth()
  usePushNotifications(isAuthenticated)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flujo-operativo" element={<FlujoOperativoLaboraConsult />} />
      <Route path="/activar-cuenta" element={<ActivarCuenta />} />

      <Route
        path="/cambiar-contrasena-inicial"
        element={
          isAuthenticated && user ? (
            <CambiarContrasenaInicial />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={postLoginHome(user)} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMINISTRADOR]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="empresas-consultoras" element={<EmpresasConsultoras />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route
        path="/consultora"
        element={
          <ProtectedRoute requiredRoles={[ROLES.CONSULTORA]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/consultora/dashboard" replace />} />
        <Route path="dashboard" element={<ConsultoraDashboard />} />
        <Route path="configuracion" element={<ConsultoraConfiguracion />} />
        <Route path="mi-equipo" element={<ConsultoraMiEquipo />} />
        <Route path="mis-empresas" element={<ConsultoraMisEmpresas />} />
        <Route path="mis-empresas/:empresaId" element={<ConsultoraEmpresaDetalle />} />
        <Route path="alertas" element={<ConsultoraAlertas />} />
        <Route path="catalogo-documentos" element={<ConsultoraCatalogoDocumentos />} />
        <Route path="reportes" element={<ConsultoraReportes />} />
        <Route path="tramites" element={<TramitesListaPage />} />
        <Route path="tramites/agenda" element={<TramitesAgendaPage />} />
        <Route path="tramites/:id" element={<TramiteDetallePage />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route
        path="/colaborador"
        element={
          <ProtectedRoute requiredRoles={[ROLES.COLABORADOR]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/colaborador/dashboard" replace />} />
        <Route path="dashboard" element={<ColaboradorDashboard />} />
        <Route path="empresas" element={<ColaboradorEmpresas />} />
        <Route path="empresas/:empresaId/personal" element={<ColaboradorPersonal />} />
        <Route
          path="empresas/:empresaId/personal/:personalId"
          element={<ColaboradorEmpleado />}
        />
        <Route path="tramites" element={<TramitesListaPage />} />
        <Route path="tramites/agenda" element={<TramitesAgendaPage />} />
        <Route path="tramites/:id" element={<TramiteDetallePage />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route
        path="/empresa-cliente"
        element={
          <ProtectedRoute requiredRoles={[ROLES.EMPRESA_CLIENTE]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/empresa-cliente/dashboard" replace />} />
        <Route path="dashboard" element={<EmpresaClienteDashboard />} />
        <Route path="declaraciones-mensuales" element={<EmpresaClienteDeclaraciones />} />
        <Route path="otros-documentos" element={<EmpresaClienteOtrosDocumentos />} />
        <Route path="mi-empresa" element={<EmpresaClienteMiEmpresa />} />
        <Route path="personal" element={<EmpresaClientePersonal />} />
        <Route path="personal/:personalId" element={<EmpresaClienteEmpleado />} />
        <Route path="mi-consultora" element={<EmpresaClienteMiConsultora />} />
        <Route path="tramites" element={<TramitesListaPage />} />
        <Route path="tramites/agenda" element={<TramitesAgendaPage />} />
        <Route path="tramites/:id" element={<TramiteDetallePage />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
