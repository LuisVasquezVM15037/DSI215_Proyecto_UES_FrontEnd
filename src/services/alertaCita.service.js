import { apiFetch } from './api.service';

/**
 * Servicio API para Alertas y Recordatorios de Citas Próximas.
 * DENTALCARE-96 (PBI-Secret-15)
 */

export const getConfiguracionAlertaCita = (usuarioId) => {
  const query = usuarioId ? `?usuarioId=${usuarioId}` : '';
  return apiFetch(`/agenda/alertas-citas/configuracion${query}`);
};

export const guardarConfiguracionAlertaCita = (usuarioId, data) => {
  const query = usuarioId ? `?usuarioId=${usuarioId}` : '';
  return apiFetch(`/agenda/alertas-citas/configuracion${query}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const getCitasProximas = (usuarioId) => {
  const query = usuarioId ? `?usuarioId=${usuarioId}` : '';
  return apiFetch(`/agenda/alertas-citas/proximas${query}`);
};
