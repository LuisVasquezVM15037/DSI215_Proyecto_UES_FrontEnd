/**
 * Propósito:
 * Centraliza las llamadas a la API correspondientes al flujo médico de la consulta odontológica:
 * registro y consulta de evaluación diagnóstica, odontograma/hallazgos patológicos,
 * catálogo de procedimientos terapéuticos y emisión de prescripciones farmacológicas.
 *
 * Ubicación y Rol:
 * Capa de Servicios de Red de Entidad Clínica (src/services/consulta.service.js).
 * Suministra la capa de persistencia remota para los cuatro pasos de la consulta médica.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/hooks/useConsultaData.js
 *   - src/hooks/useTratamientos.js
 *   - src/hooks/usePrescripcion.js
 *   - src/components/StepEvaluacion.jsx
 * - Consume:
 *   - src/services/api.service.js (apiFetch)
 */

import { apiFetch } from './api.service';

// ── 1. Evaluación clínica (Paso 1) ──────────────────────────────────────────

/**
 * Propósito:
 * Obtiene la evaluación diagnóstica previa ligada a una cita odontológica específica.
 *
 * @param {number|string} citaId - Identificador único de la cita médica.
 * @returns {Promise<Object|null>} Registro de evaluación clínica o null si aún no se ha elaborado.
 */
export const getEvaluacionByCita = (citaId) => apiFetch(`/consulta/evaluacion/cita/${citaId}`);

/**
 * Propósito:
 * Registra o guarda la anamnesis, examen intraoral y diagnóstico presuntivo de la sesión.
 *
 * @param {Object} data - Datos clínicos (idCita, motivoConsulta, observaciones, diagnostico).
 * @returns {Promise<Object>} Evaluación clínica persistida con su idEvaluacionClinica generado.
 */
export const createEvaluacion = (data) => apiFetch('/consulta/evaluacion', {
  method: 'POST',
  body: JSON.stringify(data),
});

// ── 2. Odontograma y Hallazgos Clínicos (Paso 2) ───────────────────────────

/**
 * Propósito:
 * Lista todos los hallazgos y procedimientos asignados al odontograma en una evaluación.
 *
 * @param {number|string} idEval - Identificador de la evaluación clínica.
 * @returns {Promise<Array<Object>>} Colección de hallazgos registrados con su estado y pieza dental.
 */
export const getHallazgos = (idEval) => apiFetch(`/consulta/hallazgos/${idEval}`);

/**
 * Propósito:
 * Asocia un nuevo procedimiento o patología a una pieza dental específica en el odontograma.
 *
 * @param {Object} data - Objeto de hallazgo (idEvaluacionClinica, idTratamiento, numeroDiente, estadoPlan, costo).
 * @returns {Promise<Object>} Hallazgo persistido en la base de datos.
 */
export const createHallazgo = (data) => apiFetch('/consulta/hallazgo', {
  method: 'POST',
  body: JSON.stringify(data),
});

/**
 * Propósito:
 * Actualiza el estado de tratamiento de un hallazgo dental (ej. PENDIENTE -> PROGRAMADO -> COMPLETADO).
 *
 * @param {number|string} id - Identificador del plan de tratamiento / hallazgo (idPlan).
 * @param {string} est - Nuevo estado del hallazgo (ej. 'COMPLETADO', 'CANCELADO').
 * @returns {Promise<Object>} Hallazgo actualizado.
 */
export const updateEstadoHallazgo = (id, est) => apiFetch(`/consulta/hallazgo/${id}/estado`, {
  method: 'PATCH',
  body: JSON.stringify({ estado: est }),
});

/**
 * Propósito:
 * Elimina físicamente un hallazgo erróneo o cancelado del odontograma.
 *
 * @param {number|string} id - Identificador del hallazgo a remover.
 * @returns {Promise<null>} Respuesta vacía tras la supresión.
 */
export const deleteHallazgo = (id) => apiFetch(`/consulta/hallazgo/${id}`, {
  method: 'DELETE',
});

// ── 3. Catálogo de Procedimientos / Tratamientos ───────────────────────────

/**
 * Propósito:
 * Obtiene el catálogo maestro de tratamientos odontológicos con sus costos base.
 *
 * @returns {Promise<Array<Object>>} Lista de tratamientos disponibles (profilaxis, endodoncia, etc.).
 */
export const getTratamientos = () => apiFetch('/consulta/tratamientos');

/**
 * Propósito:
 * Registra una nueva prestación en el catálogo clínico institucional.
 *
 * @param {Object} data - Datos del procedimiento (nombreTratamiento, costoTratamiento, descripcion).
 * @returns {Promise<Object>} Tratamiento creado.
 */
export const createTratamiento = (data) => apiFetch('/consulta/tratamientos', {
  method: 'POST',
  body: JSON.stringify(data),
});

// ── 4. Catálogo de Fármacos y Prescripción Médica (Paso 3) ──────────────────

/**
 * Propósito:
 * Recupera el vademécum o catálogo de medicamentos disponibles para prescripción.
 *
 * @returns {Promise<Array<Object>>} Lista de medicamentos registrados.
 */
export const getMedicamentos = () => apiFetch('/consulta/medicamentos');

/**
 * Propósito:
 * Consulta la receta médica digital emitida para una cita específica.
 *
 * @param {number|string} citaId - Identificador de la cita médica.
 * @returns {Promise<Object|null>} Receta emitida con arreglo de detalles o null.
 */
export const getPrescripcionByCita = (citaId) => apiFetch(`/consulta/prescripcion/cita/${citaId}`);

/**
 * Propósito:
 * Guarda y emite formalmente una receta médica con sus indicaciones posológicas.
 *
 * @param {Object} data - Objeto de prescripción (idCita, detalles: [{ idMedicamento, dosis, frecuencia, duracion, indicaciones }]).
 * @returns {Promise<Object>} Prescripción persistida.
 */
export const createPrescripcion = (data) => apiFetch('/consulta/prescripcion', {
  method: 'POST',
  body: JSON.stringify(data),
});

