import { apiFetch } from './api.service';

export const getUsuarios   = ()         => apiFetch('/usuarios');
export const getRoles      = ()         => apiFetch('/roles');
export const getOdontologos= ()         => apiFetch('/odontologos');


//LINEA AGREGADA PARA EL PBI DE REVISAR ACCESOS
export const getRegistrosAcceso= ()     => apiFetch('/registros-acceso');

export const createUsuario = (data)     => apiFetch('/usuarios', {
  method: 'POST', body: JSON.stringify(data),
});

export const updateUsuario = (id, data) => apiFetch(`/usuarios/${id}`, {
  method: 'PUT', body: JSON.stringify(data),
});

/** El backend inhabilita al usuario (soft delete). */
export const deleteUsuario = (id)       => apiFetch(`/usuarios/${id}`, {
  method: 'DELETE',
});
