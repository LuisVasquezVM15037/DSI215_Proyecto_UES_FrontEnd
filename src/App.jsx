/**
 * Propósito:
 * Componente raíz y enrutador declarativo central de la aplicación DentalCare.
 * Configura la topología de navegación mediante React Router DOM, aplica técnicas de optimización
 * de rendimiento mediante división de código (code splitting con React.lazy y Suspense) y
 * establece el perímetro de seguridad encapsulando vistas privadas dentro de los guards de autorización.
 *
 * Ubicación y Rol:
 * Capa de Enrutamiento y Composición Principal (src/App.jsx).
 * Orquesta la estructura de páginas y la jerarquía de layouts del sistema.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: src/main.jsx (punto de entrada montado en el DOM).
 * - Consume:
 *   - react-router-dom (BrowserRouter, Routes, Route)
 *   - src/components/ProtectedRoute.jsx (Guard de autenticación y roles)
 *   - src/components/Layout.jsx (Shell maestro con sidebar y header)
 *   - src/components/ui/LoadingScreen.jsx (Fallback visual de carga de chunks)
 *   - src/constants/roles.constants.js (ROLES)
 *   - Vistas dinámicas (LoginPage, DashboardPage, AppointmentPage, etc.)
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingScreen from './components/ui/LoadingScreen';
import { ROLES } from './constants/roles.constants';
import AccessReviewPage from './views/AccessReviewPage';

// Carga diferida (Code Splitting): Cada módulo de vista se compila en un chunk independiente,
// reduciendo el peso de transferencia inicial y optimizando el First Contentful Paint (FCP)
const LoginPage              = lazy(() => import('./views/LoginPage'));
const DashboardPage          = lazy(() => import('./views/DashboardPage'));
const AppointmentPage        = lazy(() => import('./views/AppointmentPage'));
const PatientManagementPage  = lazy(() => import('./views/PatientManagementPage'));
const UserManagementPage     = lazy(() => import('./views/UserManagementPage'));
const ConsultaIndexPage      = lazy(() => import('./views/ConsultaIndexPage'));
const ActiveConsultationPage = lazy(() => import('./views/ActiveConsultationPage'));

/**
 * Propósito:
 * Componente visual de respaldo renderizado cuando la URL solicitada no coincide con ninguna ruta declarada (HTTP 404).
 *
 * @returns {JSX.Element} Vista de recurso no encontrado.
 */
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full py-20 gap-4 animate-fade-in text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
      <i className="bi bi-compass text-3xl" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-slate-800">404 — Página no encontrada</h2>
      <p className="text-slate-400 text-xs mt-1">La ruta solicitada no existe o no se encuentra disponible.</p>
    </div>
  </div>
);

/**
 * Propósito:
 * Envoltura de conveniencia (Higher-Order Component funcional) que encapsula <ProtectedRoute>
 * preconfigurando el arreglo de roles facultados para simplificar la declaración del árbol de rutas.
 *
 * @param {Object} props - Propiedades de la ruta restringida.
 * @param {string[]} props.roles - Colección de roles autorizados.
 * @param {React.ReactNode} props.children - Vista o elemento a proteger.
 * @returns {JSX.Element}
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

          {/* ── Ruta pública ─────────────────────────────────────────────── */}
          {/* Pantalla de login (único punto de entrada sin sesión) */}
          <Route path="/" element={<LoginPage />} />

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
                <RoleRoute roles={[ROLES.ADMIN, ROLES.ODONTOLOGO]}>
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

            {/* Revisar accesos — solo admin */}
            <Route
              path="/revisar-accesos"
              element={
                <RoleRoute roles={[ROLES.ADMIN]}>
                  <AccessReviewPage />
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
