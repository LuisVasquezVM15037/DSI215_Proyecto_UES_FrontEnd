/**
 * URL base del backend.
 * Leer de la variable de entorno VITE_API_URL.
 * En desarrollo: http://localhost:8080/api
 * En producción: https://tu-dominio.com/api
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
