/**
 * Propósito:
 * Provee un contexto de estado global (React Context API) para diseminar los datos de identidad,
 * permisos y estado de autenticación del usuario a lo largo de todo el árbol de componentes.
 * Centraliza la función de cierre de sesión seguro (logout) y expone un hook de consumo seguro.
 *
 * Ubicación y Rol:
 * Capa de Contexto Global / Estado de Sesión (src/context/AuthContext.jsx).
 * Orquestador transversal de autenticación en la interfaz.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: src/App.jsx (envolviendo el enrutador) o cualquier componente consumidor mediante useAuthContext.
 * - Consume:
 *   - src/services/auth.service.js (getUserName, getUserRole, getToken, clearSession)
 *   - react (createContext, useContext, useMemo)
 */

import React, { createContext, useContext, useMemo } from 'react';
import { getUserName, getUserRole, getToken, clearSession } from '../services/auth.service';

const AuthContext = createContext(null);

/**
 * Propósito:
 * Componente proveedor que calcula y memoriza los datos de sesión para evitar renders innecesarios
 * en componentes descendientes, exponiendo el objeto de contexto.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Nodos hijos subordinados en el árbol de React.
 * @returns {JSX.Element} Proveedor del contexto de autenticación.
 */
export const AuthProvider = ({ children }) => {
  // Se memoriza el valor del contexto para estabilizar la referencia de memoria entre renders
  const value = useMemo(() => ({
    userName: getUserName(),
    userRole: getUserRole(),
    isAuthenticated: !!getToken(),
    logout: () => {
      clearSession();
      window.location.replace('/');
    },
  }), []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Propósito:
 * Hook personalizado que facilita el acceso al contexto de autenticación, validando que el
 * componente consumidor esté anidado dentro de un <AuthProvider>.
 *
 * @returns {{ userName: string, userRole: string, isAuthenticated: boolean, logout: Function }} Estado y métodos de autenticación.
 * @throws {Error} Excepción si se invoca fuera del árbol de un AuthProvider.
 */
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext debe usarse dentro de un <AuthProvider>');
  }
  return ctx;
};

