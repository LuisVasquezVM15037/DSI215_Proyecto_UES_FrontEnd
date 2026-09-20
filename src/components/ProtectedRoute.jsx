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
import { normalizeRole } from '../constants/roles.constants';
import { getUserRole } from '../services/auth.service';

/**
 * Propósito:
 * Decodifica la sección de claims del JWT almacenado y verifica que el tiempo actual no haya rebasado
 * la marca de expiración Unix (exp). Esta verificación se efectúa exclusivamente en el lado del cliente
 * para optimizar la experiencia de usuario antes de despachar peticiones de red hacia el servidor.
 *
 * @param {string|null} token - Token JWT en formato compacto (header.payload.signature).
 * @returns {boolean} true si el token posee una estructura válida y no ha expirado; false en caso contrario.
 */
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    // La carga útil del JWT reside en el segundo segmento codificado en Base64URL
    const payload = JSON.parse(atob(token.split('.')[1]));
    // El claim 'exp' se almacena en segundos; se multiplica por 1000 para contrastar con Date.now() en milisegundos
    return payload.exp * 1000 > Date.now();
  } catch {
    // Ante cualquier error de formato o deserialización se considera la sesión no válida
    return false;
  }
};

/**
 * Propósito:
 * Controla el acceso a las vistas protegidas:
 * 1. Si no hay sesión válida o el token expiró, limpia el almacenamiento y redirige al Login ('/').
 * 2. Si el rol del usuario no está autorizado para la ruta, lo redirige al Dashboard principal ('/dashboard').
 * 3. Si cumple con los requerimientos de autenticación y rol, renderiza los componentes hijos protegidos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes o vistas protegidas a renderizar.
 * @param {string[]} [props.allowedRoles] - Lista opcional de roles facultados para acceder a la ruta.
 * @returns {JSX.Element} Componente hijo autorizado o componente <Navigate> de redirección segura.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token         = localStorage.getItem('authToken');
  const authenticated = isTokenValid(token);
  // Se obtiene el rol validado directamente desde el payload del JWT firmado por el backend
  const userRole      = normalizeRole(getUserRole());

  if (!authenticated) {
    // Se purgan credenciales residuales para evitar estados inconsistentes
    localStorage.clear();
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

