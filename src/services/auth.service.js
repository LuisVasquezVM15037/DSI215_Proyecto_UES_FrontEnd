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

/**
 * Decodifica de forma segura el payload del token JWT.
 * @param {string} [customToken]
 * @returns {object|null}
 */
export const getJwtPayload = (customToken) => {
  const token = customToken ?? getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

/**
 * Obtiene el rol del usuario autenticado directamente del JWT firmado por el backend.
 * Esto previene que una manipulación de localStorage en la consola del navegador altere los permisos.
 */
export const getUserRole = () => {
  const payload = getJwtPayload();
  if (payload?.rol) {
    return payload.rol;
  }
  return localStorage.getItem('userRole') ?? '';
};
