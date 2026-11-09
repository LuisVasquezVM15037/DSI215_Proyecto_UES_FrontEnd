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

export const getCitasParaRecordatorio = (fecha) => {
  const query = fecha ? `?fecha=${fecha}` : '';
  return apiFetch(`/agenda/alertas-citas/recordatorios${query}`);
};

export const enviarRecordatorioCita = (idCita, canal = 'WHATSAPP') => {
  return apiFetch(`/agenda/alertas-citas/${idCita}/enviar-recordatorio?canal=${canal}`, {
    method: 'POST',
  });
};

export const enviarRecordatorioMasivo = (fecha, canal = 'CORREO', idsCitas = []) => {
  const queryParts = [];
  if (fecha) queryParts.push(`fecha=${fecha}`);
  if (canal) queryParts.push(`canal=${canal}`);
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  return apiFetch(`/agenda/alertas-citas/enviar-recordatorio-masivo${query}`, {
    method: 'POST',
    body: JSON.stringify(idsCitas || []),
  });
};
