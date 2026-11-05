import { apiFetch } from './api.service';

/**
 * Servicio API para Gestión de Lista de Espera de Pacientes.
 * DENTALCARE-92 (PBI-Secret-14)
 */

export const getListaEspera = (estado) => {
  const query = estado ? `?estado=${estado}` : '';
  return apiFetch(`/agenda/lista-espera${query}`);
};

export const getListaEsperaById = (id) => {
  return apiFetch(`/agenda/lista-espera/${id}`);
};

export const agregarListaEspera = (data) => {
  return apiFetch('/agenda/lista-espera', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const descartarListaEspera = (id) => {
  return apiFetch(`/agenda/lista-espera/${id}/descartar`, {
    method: 'PATCH',
  });
};

export const eliminarListaEspera = (id) => {
  return apiFetch(`/agenda/lista-espera/${id}`, {
    method: 'DELETE',
  });
};

export const asignarCitaListaEspera = (id, citaId) => {
  return apiFetch(`/agenda/lista-espera/${id}/asignar?citaId=${citaId}`, {
    method: 'POST',
  });
};
