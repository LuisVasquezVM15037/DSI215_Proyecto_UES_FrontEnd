import { API_BASE_URL } from '../config/api.config';

/**
 * Propósito:
 * Provee un cliente HTTP centralizado (patrón Wrapper sobre Fetch API) para todas las peticiones
 * autenticadas hacia el backend. Automatiza la inyección de encabezados de autorización Bearer JWT,
 * gestiona respuestas sin contenido (HTTP 204) e intercepta expiraciones de sesión (HTTP 401)
 * forzando el cierre de sesión seguro en el cliente.
 *
 * Ubicación y Rol:
 * Capa de Servicios de Red (src/services/api.service.js).
 * Intermediario fundamental entre los servicios de entidad y la API REST externa.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/services/cita.service.js
 *   - src/services/consulta.service.js
 *   - src/services/paciente.service.js
 *   - src/services/usuario.service.js
 * - Consume:
 *   - src/config/api.config.js (API_BASE_URL)
 *   - localStorage ('authToken')
 *
 * @param {string} endpoint - Ruta relativa del recurso solicitado (ejemplo: '/citas', '/pacientes/5').
 * @param {RequestInit} [options={}] - Parámetros de configuración estándar de Fetch API (method, body, headers, etc.).
 * @returns {Promise<any|null>} Promesa que resuelve al cuerpo de la respuesta en formato JSON, o null en respuestas sin contenido.
 * @throws {Error} Arroja una excepción con el mensaje de error provisto por el backend o el código de estado HTTP.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Inyección condicional del token de autenticación si existe en el almacenamiento local
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Se intercepta el error de no autorización (HTTP 401) para revocar la sesión local
  // y prevenir que la interfaz permanezca en un estado inconsistente o con datos desactualizados
  if (response.status === 401) {
    localStorage.clear();
    window.location.replace('/');
    return null;
  }

  // Las operaciones HTTP 204 (No Content) o con longitud cero no contienen cuerpo procesable;
  // intentar deserializarlas con .json() lanzaría una excepción de sintaxis en el motor de JavaScript
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null;
  }

  // Deserialización defensiva del cuerpo de respuesta: si no es JSON válido, se retorna un objeto vacío
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Error HTTP ${response.status}`);
  }

  return data;
};

