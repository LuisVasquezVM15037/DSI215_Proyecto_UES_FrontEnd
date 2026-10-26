import React from 'react';
import { Navigate } from 'react-router-dom';
import { normalizeRole, hasRoleAccess } from '../constants/roles.constants';

/**
 * Decodifica el payload del token JWT y verifica que no haya expirado.
 * Esta función solo verifica la expiración del lado del cliente, no valida la firma (eso es responsabilidad del servidor).
 *
 * @param {string} token — Token JWT almacenado en localStorage.
 * @return {boolean} true si el token existe y no ha expirado, false en caso contrario.
 */
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * Guard de rutas privadas con control de acceso basado en roles (RBAC).
 * Si el token no existe o expiró, limpia el storage y redirige al login.
 * Si se definen allowedRoles, valida que el rol del usuario tenga permisos para la vista.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const authenticated = isTokenValid(token);
  const userRole = localStorage.getItem('userRole');

  // Si no está autenticado, limpiar almacenamiento y volver al login
  if (!authenticated) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  // Verificación RBAC: evalúa permisos de rol de forma insensible a mayúsculas/variantes
  if (allowedRoles && !hasRoleAccess(userRole, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
