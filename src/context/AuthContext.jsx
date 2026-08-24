import React, { createContext, useContext, useMemo } from 'react';
import { getUserName, getUserRole, getToken, clearSession } from '../services/auth.service';

const AuthContext = createContext(null);

/**
 * Proveedor global de autenticación.
 * Envuelve la aplicación en App.jsx para exponer datos del usuario logueado.
 */
export const AuthProvider = ({ children }) => {
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

/** Hook para consumir el contexto de autenticación */
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>');
  return ctx;
};
