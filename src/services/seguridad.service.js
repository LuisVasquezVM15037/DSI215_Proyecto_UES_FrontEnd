import { API_BASE_URL } from '../config/api.config';
import { apiFetch } from './api.service';
import { getToken } from './auth.service';

/**
 * Servicio para la gestión de seguridad, contraseñas y contingencia de BD (Sprint 4).
 * Historias: DENTALCARE-93, DENTALCARE-53, DENTALCARE-64.
 */

// ── 1. Restablecimiento y cambio forzado de contraseña (DENTALCARE-93) ──────────

/**
 * Solicita el restablecimiento administrativo de la contraseña de un usuario.
 * @param {number|string} idUsuario
 * @returns {Promise<{ status: string, message: string, data: object }>}
 */
export const restablecerPassword = async (idUsuario) => {
  return await apiFetch(`/seguridad/restablecer-password/${idUsuario}`, {
    method: 'POST',
  });
};

/**
 * Valida si un token criptográfico de restablecimiento es vigente y no ha sido utilizado.
 * @param {string} token
 * @returns {Promise<{ status: string, data: { valido: boolean, username: string, email: string, nombreCompleto: string } }>}
 */
export const validarTokenReset = async (token) => {
  return await apiFetch(`/seguridad/validar-token/${token}`, {
    method: 'GET',
  });
};

/**
 * Cambia la contraseña obligatoriamente tras un reseteo o uso de credencial provisional.
 * @param {{ username?: string, passwordActual?: string, token?: string, passwordNueva: string, confirmarPasswordNueva?: string }} payload
 * @returns {Promise<{ status: string, message: string }>}
 */
export const cambiarPasswordObligatorio = async (payload) => {
  return await apiFetch('/seguridad/cambiar-password-obligatorio', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ── 2. Respaldos de Base de Datos (DENTALCARE-53) ──────────────────────────────

/**
 * Genera un volcado completo inmediato de la base de datos MySQL en el servidor.
 * @returns {Promise<{ status: string, message: string, data: object }>}
 */
export const generarRespaldo = async () => {
  return await apiFetch('/mantenimiento/respaldos/generar', {
    method: 'POST',
  });
};

/**
 * Obtiene la lista histórica de respaldos generados en el sistema.
 * @returns {Promise<{ status: string, data: Array<object> }>}
 */
export const listarRespaldos = async () => {
  return await apiFetch('/mantenimiento/respaldos', {
    method: 'GET',
  });
};

/**
 * Descarga el archivo .sql del respaldo directamente al navegador del administrador.
 * @param {number|string} id
 * @param {string} nombreArchivo
 */
export const descargarRespaldo = async (id, nombreArchivo = 'respaldo_dentalcare.sql') => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/mantenimiento/respaldos/${id}/descargar`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'No fue posible descargar el archivo de respaldo.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// ── 3. Restauración de Base de Datos (DENTALCARE-64) ───────────────────────────

/**
 * Ejecuta la restauración de la base de datos a partir de un respaldo histórico registrado.
 * @param {number|string} id
 * @param {{ adminPassword: string, confirmacionTexto: string, adminUsername?: string }} payload
 * @returns {Promise<{ status: string, message: string }>}
 */
export const restaurarRespaldo = async (id, payload) => {
  return await apiFetch(`/mantenimiento/respaldos/${id}/restaurar`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Restaura la base de datos cargando un archivo .sql externo con doble confirmación.
 * @param {File} file
 * @param {string} adminPassword
 * @param {string} confirmacionTexto
 * @param {string} [adminUsername]
 * @returns {Promise<{ status: string, message: string }>}
 */
export const restaurarDesdeArchivo = async (file, adminPassword, confirmacionTexto, adminUsername = '') => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('adminPassword', adminPassword);
  formData.append('confirmacionTexto', confirmacionTexto);
  if (adminUsername) {
    formData.append('adminUsername', adminUsername);
  }

  const response = await fetch(`${API_BASE_URL}/mantenimiento/respaldos/restaurar-archivo`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Error al restaurar la base de datos desde el archivo.');
  }
  return data;
};
