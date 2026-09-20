/**
 * Propósito:
 * Gestiona el ciclo de autenticación con el backend, el almacenamiento persistente de credenciales
 * y la extracción segura de datos de identidad directamente del token JWT firmado criptográficamente.
 *
 * Ubicación y Rol:
 * Capa de Servicios de Red / Seguridad (src/services/auth.service.js).
 * Responsable de la comunicación con el endpoint público de autenticación y de proveer getters seguros de sesión.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/views/LoginPage.jsx
 *   - src/context/AuthContext.jsx
 *   - src/components/ProtectedRoute.jsx
 *   - src/components/Layout.jsx
 * - Consume:
 *   - src/config/api.config.js (API_BASE_URL)
 *   - window.localStorage
 */

import { API_BASE_URL } from '../config/api.config';

/**
 * Propósito:
 * Realiza la petición HTTP POST al endpoint de inicio de sesión (/auth/login).
 * No emplea apiFetch debido a que en esta fase el cliente aún no posee un Bearer Token.
 *
 * Ubicación y Rol:
 * Servicio de red para autenticación inicial.
 *
 * Trazabilidad:
 * - Invocado desde: src/views/LoginPage.jsx.
 *
 * @param {string} username - Nombre de usuario o identificador de acceso.
 * @param {string} password - Contraseña en texto plano a enviar bajo protocolo TLS/HTTPS.
 * @returns {Promise<{ token: string, rol: string, nombreCompleto: string }>} Objeto con las credenciales emitidas por Spring Boot.
 * @throws {Error} Excepción cuando las credenciales son inválidas o el servicio no responde.
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

/**
 * Propósito:
 * Persiste los identificadores de sesión en el almacenamiento local del navegador al completar un inicio de sesión exitoso.
 *
 * @param {Object} params - Credenciales del usuario autenticado.
 * @param {string} params.token - Token JWT emitido por el servidor.
 * @param {string} params.rol - Nombre del rol asignado.
 * @param {string} params.nombreCompleto - Nombre completo del usuario para visualización en interfaz.
 */
export const saveSession = ({ token, rol, nombreCompleto }) => {
  localStorage.setItem('authToken',  token);
  localStorage.setItem('userRole',   rol);
  localStorage.setItem('userName',   nombreCompleto);
};

/**
 * Propósito:
 * Purga totalmente los datos de sesión almacenados en localStorage al efectuar logout o detectar token expirado.
 */
export const clearSession = () => localStorage.clear();

/**
 * Propósito:
 * Recupera el Bearer Token almacenado.
 * @returns {string|null} Token JWT activo o null si no existe sesión.
 */
export const getToken = () => localStorage.getItem('authToken') ?? null;

/**
 * Propósito:
 * Obtiene el nombre legible del usuario autenticado para encabezados y tarjetas de bienvenida.
 * @returns {string} Nombre completo del usuario o 'Usuario' por defecto.
 */
export const getUserName = () => localStorage.getItem('userName') ?? 'Usuario';

/**
 * Propósito:
 * Decodifica de forma segura la sección central (payload) del token JWT en formato Base64URL sin validar la firma en cliente.
 *
 * Ubicación y Rol:
 * Utilidad criptográfica de cliente para inspección de claims.
 *
 * @param {string} [customToken] - Token opcional a decodificar; por defecto toma el token del almacenamiento local.
 * @returns {Object|null} Objeto deserializado con los claims del JWT (sub, rol, exp, iat) o null si el token es inválido.
 */
export const getJwtPayload = (customToken) => {
  const token = customToken ?? getToken();
  if (!token) return null;
  try {
    // La estructura formal del JWT consta de tres segmentos separados por punto: cabecera.payload.firma
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

/**
 * Propósito:
 * Obtiene el rol del usuario directamente del payload firmado por el backend dentro del JWT.
 * Mitiga el riesgo de elevación local de privilegios mediante manipulación directa de localStorage en la consola del navegador.
 *
 * Ubicación y Rol:
 * Mecanismo de autorización e inspección de privilegios.
 *
 * Trazabilidad:
 * - Invocado desde: src/components/ProtectedRoute.jsx, src/components/Layout.jsx, src/context/AuthContext.jsx.
 *
 * @returns {string} Identificador del rol del usuario (ejemplo: 'ADMIN', 'ODONTOLOGO') o cadena vacía si no está autenticado.
 */
export const getUserRole = () => {
  const payload = getJwtPayload();
  // Se prioriza el claim 'rol' sellado en la firma criptográfica del JWT del servidor
  if (payload?.rol) {
    return payload.rol;
  }
  // Mecanismo de contingencia hacia la clave en almacenamiento si el token no estructurase el claim
  return localStorage.getItem('userRole') ?? '';
};

