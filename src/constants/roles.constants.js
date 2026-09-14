/**
 * Roles del sistema — Importante: deben coincidir exactamente con lo que
 * guarda auth.service.js en localStorage como 'userRole'
 */
export const ROLES = {
  ADMIN:          'admin',
  ODONTOLOGO:     'odontologo',
  RECEPCIONISTA:  'recepcionista',
  PACIENTE:       'paciente',
  GERENTE:        'gerente',
  ASISTENTEODONTOLOGO: 'asistenteOdontologo',
  PROVEEDOR:       'proveedor',
  OTRO:          'otro',
};

/** Helper: normaliza el rol a minúsculas para comparaciones de ser necesario*/
export const normalizeRole = (role) => String(role ?? '').toLowerCase();
