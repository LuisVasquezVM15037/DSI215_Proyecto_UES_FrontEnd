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
// NOTA: a diferencia del resto, esta vista NO usa lazy(). Ver comentario al final
// del archivo para la mejora pendiente de consistencia.
import AccessReviewPage from './views/AccessReviewPage';

/**
 * Vistas con carga diferida (lazy):
 * cada módulo genera su propio chunk en el build, de modo que el bundle inicial
 * solo carga el LoginPage + el shell de la aplicación (Layout y guards).
 */
const LoginPage              = lazy(() => import('./views/LoginPage'));
const DashboardPage          = lazy(() => import('./views/DashboardPage'));
const AppointmentPage        = lazy(() => import('./views/AppointmentPage'));
const PatientManagementPage  = lazy(() => import('./views/PatientManagementPage'));
const UserManagementPage     = lazy(() => import('./views/UserManagementPage'));
const ConsultaIndexPage      = lazy(() => import('./views/ConsultaIndexPage'));
const ActiveConsultationPage = lazy(() => import('./views/ActiveConsultationPage'));

// Componentes auxiliares ─────────────────────────────────────────────────

/**
 * Vista de respaldo (404) que se muestra cuando ninguna ruta coincide.
 */
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
    <i className="bi bi-exclamation-circle text-5xl text-slate-300" />
    <h2 className="text-2xl font-bold text-slate-600">404 — Página no encontrada</h2>
    <p className="text-slate-400 text-sm">La ruta que buscas no existe.</p>
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

            {/* Agenda: todos los roles */}
            <Route path="/agenda" element={<AppointmentPage />} />

            {/* Pacientes: admin + secretaria */}
            <Route
              path="/pacientes"
              element={
                <RoleRoute roles={[ROLES.ADMIN, ROLES.SECRETARIA]}>
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
                <RoleRoute roles={[ROLES.ADMIN]}>
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
