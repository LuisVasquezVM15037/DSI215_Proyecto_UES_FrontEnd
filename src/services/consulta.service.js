import { apiFetch } from './api.service';

// ── Evaluación clínica ────────────────────────────────────────────────────────
export const getEvaluacionByCita  = (citaId)  => apiFetch(`/consulta/evaluacion/cita/${citaId}`);
export const createEvaluacion     = (data)    => apiFetch('/consulta/evaluacion', {
  method: 'POST', body: JSON.stringify(data),
});

// ── Hallazgos ─────────────────────────────────────────────────────────────────
export const getHallazgos         = (idEval)  => apiFetch(`/consulta/hallazgos/${idEval}`);
export const createHallazgo       = (data)    => apiFetch('/consulta/hallazgo', {
  method: 'POST', body: JSON.stringify(data),
});
export const updateEstadoHallazgo = (id, est) => apiFetch(`/consulta/hallazgo/${id}/estado`, {
  method: 'PATCH', body: JSON.stringify({ estado: est }),
});
export const deleteHallazgo       = (id)      => apiFetch(`/consulta/hallazgo/${id}`, {
  method: 'DELETE',
});

// ── Tratamientos (catálogo) ───────────────────────────────────────────────────
export const getTratamientos      = ()         => apiFetch('/consulta/tratamientos');
export const createTratamiento    = (data)     => apiFetch('/consulta/tratamientos', {
  method: 'POST', body: JSON.stringify(data),
});

// ── Medicamentos ──────────────────────────────────────────────────────────────
export const getMedicamentos      = ()         => apiFetch('/consulta/medicamentos');

// ── Prescripción ──────────────────────────────────────────────────────────────
export const getPrescripcionByCita = (citaId)  => apiFetch(`/consulta/prescripcion/cita/${citaId}`);
export const createPrescripcion    = (data)    => apiFetch('/consulta/prescripcion', {
  method: 'POST', body: JSON.stringify(data),
});
