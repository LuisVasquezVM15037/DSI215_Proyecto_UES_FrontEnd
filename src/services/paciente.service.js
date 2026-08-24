import { apiFetch } from './api.service';

export const getPacientes    = ()           => apiFetch('/pacientes');
export const getPacienteById = (id)         => apiFetch(`/pacientes/${id}`);
export const buscarPacientes = (term)       => apiFetch(`/pacientes/buscar?term=${encodeURIComponent(term)}`);

export const createPaciente  = (data)       => apiFetch('/pacientes', {
  method: 'POST', body: JSON.stringify(data),
});

export const updatePaciente  = (id, data)   => apiFetch(`/pacientes/${id}`, {
  method: 'PUT', body: JSON.stringify(data),
});

export const deletePaciente  = (id)         => apiFetch(`/pacientes/${id}`, {
  method: 'DELETE',
});
