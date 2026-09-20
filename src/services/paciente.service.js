/**
 * Propósito:
 * Provee las operaciones de red necesarias para la administración del expediente y padrón de pacientes:
 * consulta general, búsqueda con filtrado por coincidencia, registro inicial, actualización y eliminación.
 *
 * Ubicación y Rol:
 * Capa de Servicios de Red de Entidad (src/services/paciente.service.js).
 * Interfaz entre los controladores de gestión de pacientes y los endpoints '/api/pacientes'.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/hooks/usePatientManagement.js
 *   - src/hooks/useAgenda.js
 *   - src/hooks/useConsultaIndex.js
 * - Consume:
 *   - src/services/api.service.js (apiFetch)
 */

import { apiFetch } from './api.service';

/**
 * Propósito:
 * Obtiene el padrón completo de pacientes registrados en la clínica.
 *
 * @returns {Promise<Array<Object>>} Arreglo de registros de pacientes con datos personales y demográficos.
 */
export const getPacientes = () => apiFetch('/pacientes');

/**
 * Propósito:
 * Recupera el registro individual de un paciente por su identificador primario.
 *
 * @param {number|string} id - Identificador único del paciente (idPaciente).
 * @returns {Promise<Object>} Datos del paciente consultado.
 */
export const getPacienteById = (id) => apiFetch(`/pacientes/${id}`);

/**
 * Propósito:
 * Realiza una búsqueda de pacientes en el backend por nombre, apellido o número de documento (DUI).
 *
 * @param {string} term - Término de búsqueda a consultar.
 * @returns {Promise<Array<Object>>} Lista de pacientes que satisfacen el criterio de búsqueda.
 */
export const buscarPacientes = (term) => apiFetch(`/pacientes/buscar?term=${encodeURIComponent(term)}`);

/**
 * Propósito:
 * Registra un nuevo paciente en la base de datos de la clínica.
 *
 * @param {Object} data - Datos demográficos y de contacto del paciente.
 * @returns {Promise<Object>} Paciente registrado retornado por el backend.
 */
export const createPaciente = (data) => apiFetch('/pacientes', {
  method: 'POST',
  body: JSON.stringify(data),
});

/**
 * Propósito:
 * Modifica los datos personales o de contacto de un paciente previamente registrado.
 *
 * @param {number|string} id - Identificador del paciente a actualizar.
 * @param {Object} data - Objeto con los campos actualizados.
 * @returns {Promise<Object>} Registro del paciente modificado.
 */
export const updatePaciente = (id, data) => apiFetch(`/pacientes/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

/**
 * Propósito:
 * Elimina el registro de un paciente de la base de datos.
 *
 * @param {number|string} id - Identificador del paciente a remover.
 * @returns {Promise<null>} Respuesta vacía tras la confirmación de la baja.
 */
export const deletePaciente = (id) => apiFetch(`/pacientes/${id}`, {
  method: 'DELETE',
});

