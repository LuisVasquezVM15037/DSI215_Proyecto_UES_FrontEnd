/**
 * Roles del sistema — Importante: deben coincidir exactamente con lo que
 * guarda auth.service.js en localStorage como 'userRole'
 */
export const ROLES = {
  ADMIN:          'admin',
  ODONTOLOGO:     'odontologo',
  SECRETARIA:  'secretaria',
};

/** Helper: normaliza el rol a minúsculas para comparaciones de ser necesario*/
export const normalizeRole = (role) => String(role ?? '').toLowerCase();
