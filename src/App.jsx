// ============================================================================
//  App.jsx — Configuración central de rutas de DentalCare
// ============================================================================

// Imports ───────────────────────────────────────────────────────────────

// React core
import { lazy, Suspense } from 'react';

// Enrutamiento
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Guard y layout compartido
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

// Constantes
import { ROLES } from './constants/roles.constants';

// Vista con carga ansiosa (eager) — PBI "Revisar accesos".
import AccessReviewPage from './views/AccessReviewPage';

/**
 * Vistas con carga diferida (lazy):
 * cada módulo genera su propio chunk en el build, de modo que el bundle inicial
 * solo carga el LoginPage + el shell de la aplicación (Layout y guards).
 */
const LoginPage = lazy(() => import('./views/LoginPage'));
const DashboardPage = lazy(() => import('./views/DashboardPage'));
const AppointmentPage = lazy(() => import('./views/AppointmentPage'));
const PatientManagementPage = lazy(() => import('./views/PatientManagementPage'));
const UserManagementPage = lazy(() => import('./views/UserManagementPage'));
const ConsultaIndexPage = lazy(() => import('./views/ConsultaIndexPage'));
const ActiveConsultationPage = lazy(() => import('./views/ActiveConsultationPage'));
const InventarioPage = lazy(() => import('./views/InventarioPage'));

// Vistas Sprint 4: Seguridad y Mantenimiento de BD (Admin TI)
const CambiarPasswordObligatorioPage = lazy(() => import('./views/CambiarPasswordObligatorioPage'));
const ResetPasswordTokenPage = lazy(() => import('./views/ResetPasswordTokenPage'));
const MantenimientoRespaldosPage = lazy(() => import('./views/MantenimientoRespaldosPage'));

// Componentes auxiliares ─────────────────────────────────────────────────

/**
 * Vista de respaldo (404) que se muestra cuando ninguna ruta coincide.
 */
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
    <i className="bi bi-exclamation-circle text-5xl text-slate-300" />
    <h2 className="text-2xl font-bold text-slate-600">404 — Página no encontrada</h2>
    <p className="text-slate-400 text-sm">Disculpe el inconveniente. La ruta que buscas no existe.</p>
  </div>
);

/**
 * Envoltura de conveniencia sobre <ProtectedRoute> para evitar repetir el
 * wrapper en cada ruta restringida por rol.
 *
 * @param {string[]}  roles    Lista de roles autorizados para la ruta.
 * @param {ReactNode} children Vista a renderizar si el rol del usuario es válido.
 */
const RoleRoute = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

//Árbol de rutas ──────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      {/* Suspense captura la carga de los chunks lazy y muestra el loader */}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>

          {/* ── Rutas públicas / directas ─────────────────────────────────── */}
          {/* Pantalla de login (punto de entrada sin sesión) */}
          <Route path="/" element={<LoginPage />} />

          {/* Restablecimiento por token criptográfico y cambio obligatorio (DENTALCARE-93) */}
          <Route path="/cambiar-password-obligatorio" element={<CambiarPasswordObligatorioPage />} />
          <Route path="/reset-password" element={<ResetPasswordTokenPage />} />

          {/* ── Rutas privadas ───────────────────────────────────────────── */}
          {/*
            Todas las rutas internas comparten el mismo Layout y el guard base
            <ProtectedRoute> (que solo exige sesión autenticada). Las rutas con
            restricción adicional de rol se envuelven con <RoleRoute>.
          */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard — cualquier rol autenticado */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Agenda: Solamente la secretaria puede crear, programar y reprogramar una cita / gerencia y administrador con acceso total*/}
            <Route path="/agenda" element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.GERENTE]}>
                <AppointmentPage />
              </RoleRoute>
            }
            />

            {/* Pacientes: admin + secretaria */}
            <Route path="/pacientes"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.GERENTE]}>
                  <PatientManagementPage />
                </RoleRoute>
              }
            />

            {/* Consulta (índice / listado) — admin + odontólogo */}
            <Route
              path="/consulta"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.ODONTOLOGO, ROLES.ADMIN]}>
                  <ConsultaIndexPage />
                </RoleRoute>
              }
            />

            {/* Consulta activa de una cita concreta — admin + odontólogo */}
            <Route
              path="/consulta/:citaId"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.ODONTOLOGO]}>
                  <ActiveConsultationPage />
                </RoleRoute>
              }
            />

            {/* Usuarios — solo admin */}
            <Route
              path="/usuarios"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.GERENTE]}>
                  <UserManagementPage />
                </RoleRoute>
              }
            />

            {/* Inventario — admin + asistente dental */}
            <Route
              path="/inventario"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.ASISTENTEODONTOLOGO, ROLES.GERENTE]}>
                  <InventarioPage />
                </RoleRoute>
              }
            />

            {/* Revisar accesos — solo admin */}
            <Route
              path="/revisar-accesos"
              element={
                <RoleRoute roles={[ROLES.ADMIN]}>
                  <AccessReviewPage />
                </RoleRoute>
              }
            />

            {/* Respaldos y contingencia de Base de Datos — solo admin (Sprint 4) */}
            <Route
              path="/mantenimiento/respaldos"
              element={
                <RoleRoute roles={[ROLES.ADMIN]}>
                  <MantenimientoRespaldosPage />
                </RoleRoute>
              }
            />

            {/* Catch-all dentro del layout: cualquier ruta no definida → 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
