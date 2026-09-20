/**
 * Propósito:
 * Provee un contexto de estado global (React Context API) reactivo y centralizado para
 * gestionar la sesión, identidad, permisos y ciclo de vida de autenticación del usuario.
 * Centraliza las funciones atómicas de inicio de sesión (login) y cierre de sesión (logout),
 * garantizando la actualización sincrónica en memoria y almacenamiento local sin requerir
 * recargas forzadas del navegador (F5).
 *
 * Ubicación y Rol:
 * Capa de Contexto Global / Estado de Sesión (src/context/AuthContext.jsx).
 * Fuente única de la verdad (Single Source of Truth) para la autenticación en el ERP.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/App.jsx' (envolviendo el enrutador de la aplicación).
 * - Consumido mediante 'useAuth' desde:
 *   - 'src/components/ProtectedRoute.jsx'
 *   - 'src/components/Layout.jsx'
 *   - 'src/views/LoginPage.jsx'
 *   - 'src/hooks/useHomeDashboard.js'
 * - Consume:
 *   - 'src/services/auth.service.js' (loginService, saveSession, clearSession, getToken, getUserName, getUserRole)
 *   - 'src/constants/roles.constants.js' (normalizeRole)
 *   - React (createContext, useContext, useState, useEffect, useMemo, useCallback)
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getUserName,
  getUserRole,
  getToken,
  clearSession,
  saveSession,
  loginService,
} from '../services/auth.service';
import { normalizeRole } from '../constants/roles.constants';

const AuthContext = createContext(null);

/**
 * Función auxiliar para verificar la vigencia del token JWT por tiempo de expiración
 *
 * @param {string|null} tok - Token JWT compacto
 * @returns {boolean} true si el token existe y no ha expirado
 */
const checkTokenValidity = (tok) => {
  if (!tok) return false;
  try {
    const payload = JSON.parse(atob(tok.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * Proveedor de contexto que expone el estado reactivo de sesión y métodos de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken]       = useState(() => getToken());
  const [userName, setUserName] = useState(() => getUserName());
  const [userRole, setUserRole] = useState(() => normalizeRole(getUserRole()));

  // Determina si el usuario cuenta con una sesión válida y vigente en el cliente
  const isAuthenticated = useMemo(() => {
    return !!token && checkTokenValidity(token);
  }, [token]);

  /**
   * Inicia sesión autenticando con el backend, sincronizando el almacenamiento y actualizando el estado reactivo
   */
  const login = useCallback(async (identifier, password) => {
    const data = await loginService(identifier, password);
    saveSession(data);
    const newToken = data.token;
    const newName = data.nombreCompleto || 'Usuario';
    const newRole = normalizeRole(data.rol);
    setToken(newToken);
    setUserName(newName);
    setUserRole(newRole);
    return data;
  }, []);

  /**
   * Cierra la sesión activa purga el almacenamiento local y limpia de inmediato el estado en memoria
   */
  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUserName('');
    setUserRole('');
  }, []);

  // Sincroniza el estado reactivo si la sesión cambia en otra pestaña o ventana del navegador
  useEffect(() => {
    const handleStorageChange = () => {
      const currentTok = getToken();
      if (!currentTok || !checkTokenValidity(currentTok)) {
        logout();
      } else {
        setToken(currentTok);
        setUserName(getUserName());
        setUserRole(normalizeRole(getUserRole()));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);

  // Objeto de contexto estable y memoizado
  const value = useMemo(() => ({
    token,
    userName,
    userRole,
    isAuthenticated,
    login,
    logout,
  }), [token, userName, userRole, isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook oficial de consumo del contexto de autenticación
 *
 * @returns {{ token: string|null, userName: string, userRole: string, isAuthenticated: boolean, login: Function, logout: Function }}
 * @throws {Error} Si se invoca fuera del árbol de un <AuthProvider>
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
};

// Alias de compatibilidad hacia atrás
export const useAuthContext = useAuth;
