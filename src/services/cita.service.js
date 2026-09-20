/**
 * Propósito:
 * Encapsula las operaciones de red vinculadas a la gestión de citas odontológicas:
 * consulta de agenda, programación de nuevas citas, modificaciones de horario,
 * cancelaciones justificadas y transiciones de estado clínico (check-in, inasistencia, finalización).
 *
 * Ubicación y Rol:
 * Capa de Servicios de Red de Entidad (src/services/cita.service.js).
 * Conecta los controladores de agenda y consulta con los endpoints '/api/citas'.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/hooks/useAgenda.js
 *   - src/hooks/useConsultaIndex.js
 *   - src/hooks/useConsultaData.js
 *   - src/hooks/useHomeDashboard.js
 *   - src/utils/cita.utils.js (sincronizarCitasVencidas)
 * - Consume:
 *   - src/services/api.service.js (apiFetch)
 */

import { apiFetch } from './api.service';

/**
 * Propósito:
 * Recupera el listado completo de citas médicas registradas en la base de datos institucional.
 *
 * @returns {Promise<Array<Object>>} Lista de objetos de cita con datos del paciente, odontólogo, fechas y estado.
 */
export const getCitas = () => apiFetch('/citas');

/**
 * Propósito:
 * Obtiene el detalle exhaustivo de una cita médica a partir de su identificador único numérico.
 *
 * @param {number|string} id - Identificador único de la cita (idCitas).
 * @returns {Promise<Object>} Datos detallados de la cita solicitada.
 */
export const getCitaById = (id) => apiFetch(`/citas/${id}`);

/**
 * Propósito:
 * Envía una solicitud de creación para agendar una nueva cita en el sistema.
 *
 * @param {Object} data - Carga útil con idPaciente, idOdontologo, fechaCita, horaInicioCita, horaFinCita y estadoCita.
 * @returns {Promise<Object>} Registro de la cita persistida retornado por el backend.
 */
export const createCita = (data) => apiFetch('/citas', {
  method: 'POST',
  body: JSON.stringify(data),
});

/**
 * Propósito:
 * Actualiza la información general o la reprogramación temporal de una cita existente.
 *
 * @param {number|string} id - Identificador de la cita a modificar.
 * @param {Object} data - Datos actualizados de la cita.
 * @returns {Promise<Object>} Objeto de la cita con las modificaciones aplicadas.
 */
export const updateCita = (id, data) => apiFetch(`/citas/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

/**
 * Propósito:
 * Cancela formalmente una cita registrando de forma obligatoria el motivo de la cancelación.
 *
 * @param {number|string} id - Identificador de la cita a cancelar.
 * @param {string} motivo - Justificación textual de la cancelación de la cita.
 * @returns {Promise<Object>} Cita actualizada en estado CANCELADA.
 */
export const cancelarCita = (id, motivo) => apiFetch(`/citas/${id}/cancelar`, {
  method: 'PUT',
  body: JSON.stringify({ motivoCancelacion: motivo }),
});

/**
 * Propósito:
 * Ejecuta una transición atómica del estado operativo de una cita médica (ej. PROGRAMADA -> PENDIENTE -> FINALIZADA).
 *
 * @param {number|string} id - Identificador único de la cita.
 * @param {string} estado - Nuevo estado clínico o administrativo (ej. 'PENDIENTE', 'FINALIZADA', 'NO_ASISTIO').
 * @returns {Promise<Object>} Cita con el nuevo estado persistido en la base de datos.
 */
export const cambiarEstado = (id, estado) => apiFetch(`/citas/${id}/estado`, {
  method: 'PUT',
  body: JSON.stringify({ estado }),
});

