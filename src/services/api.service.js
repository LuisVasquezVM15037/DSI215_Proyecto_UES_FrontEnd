import { API_BASE_URL } from '../config/api.config';

/**
 * Wrapper sobre fetch que:
 *  - Inyecta la URL base automáticamente
 *  - Adjunta el JWT desde localStorage en cada petición
 *  - Redirige al login cuando el servidor responde 401
 *  - Lanza un Error con el mensaje del backend en caso de fallo HTTP
 *
 * @param {string} endpoint  - Ruta relativa, ej: '/citas' o '/pacientes/1'
 * @param {RequestInit} options - Opciones de fetch (method, body, headers…)
 * @returns {Promise<any|null>} - JSON de respuesta, o null si es 204 No Content
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Token expirado o no autenticado → limpiar y redirigir
  if (response.status === 401) {
    localStorage.clear();
    window.location.replace('/');
    return null;
  }

  // Sin contenido (DELETE, algunos PUT) → retornar null sin intentar parsear JSON
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Error HTTP ${response.status}`);
  }

  return data;
};
