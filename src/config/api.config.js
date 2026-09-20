/**
 * Propósito:
 * Centraliza la definición y resolución dinámica de la URL base para el consumo de la API REST del backend.
 * Permite alternar de manera transparente entre entornos de desarrollo local y producción según las variables de entorno.
 *
 * Ubicación y Rol:
 * Capa de Configuración (src/config/api.config.js).
 * Actúa como punto único de parametrización de conectividad de red de la aplicación.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: src/services/api.service.js, src/services/auth.service.js.
 * - Consume: import.meta.env (motor de variables de entorno de Vite).
 *
 * @type {string} API_BASE_URL - Dirección base del backend REST (ejemplo: 'http://localhost:8080/api').
 */
// Se utiliza el operador de fusión nula (??) para priorizar la variable inyectada por Vite en tiempo de build o ejecución,
// recurriendo al endpoint local por defecto si no existe configuración en el entorno.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

