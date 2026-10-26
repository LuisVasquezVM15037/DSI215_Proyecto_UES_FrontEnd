/**
 * Roles del sistema — DentalCare ERP
 * Importante: deben coincidir con lo que guarda auth.service.js en localStorage como 'userRole'
 */
export const ROLES = {
  ADMIN:               'admin',
  ODONTOLOGO:          'odontologo',
  RECEPCIONISTA:       'recepcionista',
  GERENTE:             'gerente',
  ASISTENTEODONTOLOGO: 'asistenteodontologo',
};

/**
 * Normaliza cualquier variante de rol (con guiones, mayúsculas, espacios) a una clave canónica.
 * @param {string} role
 * @returns {string} Rol canónico en minúsculas.
 */
export const normalizeRole = (role) => {
  if (!role) return '';
  const clean = String(role).trim().toLowerCase().replace(/[_\s-]/g, '');
  if (
    clean === 'asistente' ||
    clean === 'asistentedental' ||
    clean === 'asistenteodontologo' ||
    clean === 'asistenteodontologico'
  ) {
    return 'asistenteodontologo';
  }
  return clean;
};

/**
 * Evalúa si el rol del usuario posee acceso contra una lista de roles autorizados.
 * Realiza comparaciones normalizadas e insensibles a mayúsculas/minúsculas.
 * @param {string} userRole - Rol del usuario autenticado.
 * @param {Array<string>} allowedRoles - Lista de roles permitidos para la ruta o acción.
 * @returns {boolean} true si tiene permiso de acceso.
 */
export const hasRoleAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const userNorm = normalizeRole(userRole);
  return allowedRoles.some((allowed) => normalizeRole(allowed) === userNorm);
};

/**
 * Retorna el nombre institucional y formal del rol para la interfaz.
 * @param {string} role
 * @returns {string} Nombre formateado del rol (ej: "Asistente Odontológico").
 */
export const formatRoleName = (role) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'admin':
      return 'Administrador';
    case 'odontologo':
      return 'Odontólogo';
    case 'recepcionista':
      return 'Recepcionista';
    case 'asistenteodontologo':
      return 'Asistente Odontológico';
    case 'gerente':
      return 'Gerente General';
    default:
      return role || 'Personal';
  }
};

/**
 * Retorna el título o saludo amigable para el encabezado de bienvenida del dashboard.
 * @param {string} role
 * @returns {string} Saludo personalizado según rol (ej: "Doctor(a)", "Asistente", "Administrador(a)").
 */
export const getRoleGreeting = (role) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'admin':
      return 'Administrador(a)';
    case 'odontologo':
      return 'Doctor(a)';
    case 'recepcionista':
      return 'Recepcionista';
    case 'asistenteodontologo':
      return 'Asistente';
    case 'gerente':
      return 'Gerente';
    default:
      return 'Colaborador(a)';
  }
};
