import { apiFetch } from './api.service';

/**
 * Servicio API para el Centro de Notificaciones.
 * DENTALCARE-71 (PBI-Secret-16)
 */

export const getNotificaciones = (params = {}) => {
  const query = new URLSearchParams();
  if (params.usuarioId) query.append('usuarioId', params.usuarioId);
  if (params.rol) query.append('rol', params.rol);
  if (params.soloNoLeidas !== undefined) query.append('soloNoLeidas', params.soloNoLeidas);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString();
  return apiFetch(`/notificaciones${qs ? `?${qs}` : ''}`);
};

export const getResumenNoLeidas = (params = {}) => {
  const query = new URLSearchParams();
  if (params.usuarioId) query.append('usuarioId', params.usuarioId);
  if (params.rol) query.append('rol', params.rol);

  const qs = query.toString();
  return apiFetch(`/notificaciones/resumen-no-leidas${qs ? `?${qs}` : ''}`);
};

export const marcarNotificacionLeida = (id) => {
  return apiFetch(`/notificaciones/${id}/marcar-leida`, {
    method: 'PATCH',
  });
};

export const marcarTodasNotificacionesLeidas = (params = {}) => {
  const query = new URLSearchParams();
  if (params.usuarioId) query.append('usuarioId', params.usuarioId);
  if (params.rol) query.append('rol', params.rol);

  const qs = query.toString();
  return apiFetch(`/notificaciones/marcar-todas-leidas${qs ? `?${qs}` : ''}`, {
    method: 'POST',
  });
};
