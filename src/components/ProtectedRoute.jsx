/**
 * Propósito:
 * Componente Guard de seguridad perimetral para rutas protegidas en React Router.
 * Valida la existencia y vigencia temporal del token JWT en el cliente, y aplica políticas
 * de autorización basadas en roles (RBAC) restringiendo el acceso a vistas administrativas o médicas.
 *
 * Ubicación y Rol:
 * Capa de Seguridad / Enrutamiento (src/components/ProtectedRoute.jsx).
 * Interceptor de navegación que condiciona el renderizado de vistas privadas o redirige a login/dashboard.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: src/App.jsx (envolviendo el Layout raíz y cada Route restringida con RoleRoute).
 * - Consume:
 *   - src/constants/roles.constants.js (normalizeRole)
 *   - src/services/auth.service.js (getUserRole)
 *   - react-router-dom (Navigate)
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Propósito:
 * Controla el acceso a las vistas protegidas:
 * 1. Si no hay sesión válida o el token expiró, invoca logout() y redirige al Login ('/').
 * 2. Si el rol del usuario no está autorizado para la ruta, lo redirige al Dashboard principal ('/dashboard').
 * 3. Si cumple con los requerimientos de autenticación y rol, renderiza los componentes hijos protegidos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes o vistas protegidas a renderizar.
 * @param {string[]} [props.allowedRoles] - Lista opcional de roles facultados para acceder a la ruta.
 * @returns {JSX.Element} Componente hijo autorizado o componente <Navigate> de redirección segura.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole, logout } = useAuth();

  if (!isAuthenticated) {
    // Purga el estado reactivo y de almacenamiento en memoria
    logout();
    // La propiedad replace sobreescribe la entrada actual en el historial de navegación para bloquear el botón "Atrás"
    return <Navigate to="/" replace />;
  }

  // Verificación de lista de control de acceso basada en roles (RBAC)
  if (allowedRoles && !allowedRoles.includes(String(userRole).toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

