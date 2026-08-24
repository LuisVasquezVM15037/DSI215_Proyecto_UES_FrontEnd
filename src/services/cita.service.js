import { apiFetch } from './api.service';

// Obtiene la lista completa de citas
export const getCitas      = ()           => apiFetch('/citas');
// Obtiene una cita específica por su ID
export const getCitaById   = (id)         => apiFetch(`/citas/${id}`);

// Crea una nueva cita con los datos proporcionados
export const createCita    = (data)       => apiFetch('/citas', {
  method: 'POST', body: JSON.stringify(data),
});

// Actualiza los datos de una cita existente
export const updateCita    = (id, data)   => apiFetch(`/citas/${id}`, {
  method: 'PUT', body: JSON.stringify(data),
});

// Cancela una cita y registra el motivo de cancelación
export const cancelarCita  = (id, motivo) => apiFetch(`/citas/${id}/cancelar`, {
  method: 'PUT', body: JSON.stringify({ motivoCancelacion: motivo }),
});
// Cambia el estado de una cita
export const cambiarEstado = (id, estado) => apiFetch(`/citas/${id}/estado`, {
  method: 'PUT', body: JSON.stringify({ estado }),
});
