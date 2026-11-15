import { API_BASE_URL } from '../config/api.config';
import { getToken } from './auth.service';

/**
 * Servicio para la gestión y subida de archivos (Punto 7).
 * - Foto de perfil para usuarios (opcional).
 * - Evidencias fotográficas / radiográficas por procedimiento de plan de tratamiento.
 */

const getHeaders = (isMultipart = false) => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Sube una foto de perfil para usuario.
 * @param {File} file Archivo de imagen (JPEG, PNG, WEBP)
 * @returns {Promise<{ url: string, filename: string }>}
 */
export const subirFotoPerfil = async (file) => {
  const formData = new FormData();
  formData.append('archivo', file);

  const response = await fetch(`${API_BASE_URL}/archivos/foto-perfil`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error al subir foto de perfil.');
  }
  return data;
};

/**
 * Sube una fotografía o radiografía de evidencia a un procedimiento.
 * @param {number} idPlan ID del plan de tratamiento
 * @param {File} file Archivo de imagen
 * @param {string} [comentario] Descripción o nota clínica de la evidencia
 * @returns {Promise<Object>} Evidencia creada
 */
export const subirEvidenciaProcedimiento = async (idPlan, file, comentario = '') => {
  const formData = new FormData();
  formData.append('archivo', file);
  if (comentario) {
    formData.append('comentario', comentario);
  }

  const response = await fetch(`${API_BASE_URL}/archivos/evidencias/plan/${idPlan}`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error al subir imagen de evidencia.');
  }
  return data;
};

/**
 * Lista las evidencias fotográficas asociadas a un procedimiento.
 * @param {number} idPlan ID del plan de tratamiento
 * @returns {Promise<Array>} Lista de evidencias
 */
export const listarEvidenciasPorPlan = async (idPlan) => {
  const response = await fetch(`${API_BASE_URL}/archivos/evidencias/plan/${idPlan}`, {
    method: 'GET',
    headers: getHeaders(false),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Error al obtener evidencias del procedimiento.');
  }
  return response.json();
};

/**
 * Elimina una evidencia fotográfica por su ID.
 * @param {number} idEvidencia
 */
export const eliminarEvidencia = async (idEvidencia) => {
  const response = await fetch(`${API_BASE_URL}/archivos/evidencias/${idEvidencia}`, {
    method: 'DELETE',
    headers: getHeaders(false),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Error al eliminar evidencia.');
  }
  return response.json().catch(() => ({}));
};

/**
 * Resuelve una URL relativa a la URL absoluta del servidor.
 * @param {string} urlRelativa
 * @returns {string} URL absoluta
 */
export const resolverUrlArchivo = (urlRelativa) => {
  if (!urlRelativa) return '';
  if (urlRelativa.startsWith('http://') || urlRelativa.startsWith('https://')) {
    return urlRelativa;
  }
  return `${API_BASE_URL.replace('/api', '')}${urlRelativa}`;
};
