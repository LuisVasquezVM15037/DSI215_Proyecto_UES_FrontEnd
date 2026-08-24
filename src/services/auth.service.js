import { API_BASE_URL } from '../config/api.config';

/**
 * Autentica al usuario contra el backend Spring Boot.
 * NO usa apiFetch porque en este endpoint todavía no hay token.
 *
 * @returns {{ token: string, rol: string, nombreCompleto: string }}
 */
export const loginService = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Credenciales incorrectas.');
  }
  return data;
};

/** Guarda las credenciales del usuario logueado en localStorage. */
export const saveSession = ({ token, rol, nombreCompleto }) => {
  localStorage.setItem('authToken',  token);
  localStorage.setItem('userRole',   rol);
  localStorage.setItem('userName',   nombreCompleto);
};

/** Elimina toda la sesión del localStorage. */
export const clearSession = () => localStorage.clear();

// ── Getters de sesión ─────────────────────────────────────────────────────────
export const getToken    = () => localStorage.getItem('authToken') ?? null;
export const getUserName = () => localStorage.getItem('userName')  ?? 'Usuario';
export const getUserRole = () => localStorage.getItem('userRole')  ?? '';
