/**
 * Propósito:
 * Provee los servicios de red para la administración de personal, catálogo de roles institucionales,
 * filtrado especializado de odontólogos y consulta de pistas de auditoría de accesos al sistema.
 *
 * Ubicación y Rol:
 * Capa de Servicios de Red de Entidad (src/services/usuario.service.js).
 * Interfaz entre los módulos administrativos y los endpoints '/api/usuarios', '/api/roles' y '/api/registros-acceso'.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/hooks/useUserManagement.js
 *   - src/hooks/useAgenda.js
 *   - src/views/AccessReviewPage.jsx
 * - Consume:
 *   - src/services/api.service.js (apiFetch)
 */

import { apiFetch } from './api.service';

/**
 * Propósito:
 * Obtiene la nómina completa de usuarios del sistema (activos e inactivos).
 *
 * @returns {Promise<Array<Object>>} Lista de usuarios con información de credenciales y roles.
 */
export const getUsuarios = () => apiFetch('/usuarios');

/**
 * Propósito:
 * Consulta el catálogo de roles del sistema configurados en la base de datos.
 *
 * @returns {Promise<Array<Object>>} Lista de roles disponibles.
 */
export const getRoles = () => apiFetch('/roles');

/**
 * Propósito:
 * Recupera exclusivamente los usuarios cuyo rol corresponde a odontólogos facultados para atención médica.
 *
 * @returns {Promise<Array<Object>>} Lista de odontólogos disponibles para asignación de citas.
 */
export const getOdontologos = () => apiFetch('/odontologos');

/**
 * Propósito:
 * Obtiene el registro de auditoría de intentos de inicio de sesión exitosos y fallidos.
 *
 * @returns {Promise<Array<Object>>} Pistas de auditoría de accesos.
 */
export const getRegistrosAcceso = () => apiFetch('/registros-acceso');

/**
 * Propósito:
 * Da de alta a un nuevo empleado o usuario en el sistema.
 *
 * @param {Object} data - Datos del usuario (nombre, apellido, username, email, password, idRol).
 * @returns {Promise<Object>} Usuario creado.
 */
export const createUsuario = (data) => apiFetch('/usuarios', {
  method: 'POST',
  body: JSON.stringify(data),
});

/**
 * Propósito:
 * Modifica la información, credenciales o rol de un usuario existente.
 *
 * @param {number|string} id - Identificador del usuario a modificar.
 * @param {Object} data - Datos actualizados del usuario.
 * @returns {Promise<Object>} Usuario actualizado.
 */
export const updateUsuario = (id, data) => apiFetch(`/usuarios/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

/**
 * Propósito:
 * Aplica una baja lógica (soft delete) sobre la cuenta de usuario, inhabilitando su acceso sin destruir su trazabilidad histórica.
 *
 * @param {number|string} id - Identificador del usuario a inhabilitar.
 * @returns {Promise<null>} Respuesta vacía tras procesar la inhabilitación.
 */
export const deleteUsuario = (id) => apiFetch(`/usuarios/${id}`, {
  method: 'DELETE',
});

