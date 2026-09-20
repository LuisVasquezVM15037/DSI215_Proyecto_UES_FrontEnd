import { API_BASE_URL } from '../config/api.config';

/**
 * Propósito:
 * Provee un cliente HTTP centralizado (patrón Wrapper sobre Fetch API) para todas las peticiones
 * autenticadas hacia el backend. Automatiza la inyección de encabezados de autorización Bearer JWT,
 * gestiona respuestas sin contenido (HTTP 204) e intercepta expiraciones de sesión (HTTP 401)
 * delegando la respuesta a un manejador externo registrado por el AuthContext para garantizar
 * la consistencia del estado reactivo de sesión antes de redirigir.
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
 * - setUnauthorizedHandler invocado desde:
 *   - src/context/AuthContext.jsx (registra logout() + redirección al iniciar el proveedor)
 *
 * @param {string} endpoint - Ruta relativa del recurso solicitado (ejemplo: '/citas', '/pacientes/5').
 * @param {RequestInit} [options={}] - Parámetros de configuración estándar de Fetch API (method, body, headers, etc.).
 * @returns {Promise<any|null>} Promesa que resuelve al cuerpo de la respuesta en formato JSON, o null en respuestas sin contenido.
 * @throws {Error} Arroja una excepción con el mensaje de error provisto por el backend o el código de estado HTTP.
 */

/**
 * Callback invocado cuando el backend responde con HTTP 401 (token expirado o inválido).
 * Por defecto realiza el logout mínimo directo sobre localStorage; se sobreescribe por
 * AuthContext mediante 'setUnauthorizedHandler' para garantizar que el estado reactivo
 * de React también se limpie correctamente antes de la redirección.
 */
let _onUnauthorized = () => {
  localStorage.clear();
  window.location.replace('/');
};

/**
 * Propósito:
 * Registra el manejador de sesión expirada para que el interceptor HTTP 401 pueda
 * delegar el logout al AuthContext en lugar de manipular el almacenamiento directamente.
 * Debe ser llamado una única vez desde AuthProvider al montarse.
 *
 * @param {() => void} handler - Función de logout reactivo provista por AuthContext.
 */
export const setUnauthorizedHandler = (handler) => {
  _onUnauthorized = handler;
};

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

  // Se delega al handler registrado por AuthContext para limpiar el estado reactivo
  // antes de redirigir, evitando que la interfaz quede en un estado inconsistente
  if (response.status === 401) {
    _onUnauthorized();
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

