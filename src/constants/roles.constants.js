/**
 * Propósito:
 * Define el catálogo formal de roles de usuario reconocidos por la plataforma para el control de acceso
 * basado en roles (RBAC). Provee una función auxiliar para la sanitización y comparación uniforme de identificadores de rol.
 *
 * Ubicación y Rol:
 * Capa de Constantes del Dominio (src/constants/roles.constants.js).
 * Establece el contrato de autorización que rige la navegación de rutas y la visualización de opciones de menú.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: src/App.jsx, src/components/Layout.jsx, src/components/ProtectedRoute.jsx.
 * - Consume: Ningún módulo externo (constantes puras).
 */

/**
 * Diccionario de roles del sistema. Los valores corresponden a las cadenas de texto
 * normalizadas utilizadas en las políticas de seguridad del cliente.
 * @type {Readonly<Record<string, string>>}
 */
export const ROLES = {
  ADMIN:               'admin',
  ODONTOLOGO:          'odontologo',
  RECEPCIONISTA:       'recepcionista',
  PACIENTE:            'paciente',
  GERENTE:             'gerente',
  ASISTENTEODONTOLOGO: 'asistenteodontologo',
  PROVEEDOR:           'proveedor',
  OTRO:                'otro',
};

/**
 * Propósito:
 * Normaliza cualquier identificador de rol recibido (desde backend, JWT o inputs) a minúsculas,
 * evitando discrepancias por diferencias de mayúsculas/minúsculas (ejemplo: 'ADMIN' vs 'admin').
 *
 * Ubicación y Rol:
 * Función utilitaria de autorización (src/constants/roles.constants.js).
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: src/components/ProtectedRoute.jsx, src/components/Layout.jsx.
 *
 * @param {string|null|undefined} role - Cadena que representa el rol a evaluar.
 * @returns {string} Cadena en minúsculas sin espacios residuales, o cadena vacía si el valor de entrada es nulo o indefinido.
 */
export const normalizeRole = (role) => String(role ?? '').trim().toLowerCase();

