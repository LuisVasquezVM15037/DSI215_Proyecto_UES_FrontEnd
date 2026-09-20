/**
 * Propósito:
 * Hook utilitario para estabilización y control de tasa (debouncing) de valores reactivos.
 * Retrasa la propagación de un valor cambiante hasta que haya transcurrido un intervalo
 * de tiempo especificado sin nuevas modificaciones, mitigando la sobrecarga de consultas
 * HTTP al filtrar o buscar en tiempo real.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useDebounce.js'. Hook utilitario agnóstico de dominio dentro de
 * la capa de lógica de estado personalizada.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/hooks/usePatientManagement.js' (optimización de búsqueda de pacientes por nombre o documento).
 * - Consume:
 *   - React ('useState', 'useEffect').
 *
 * Parámetros y Retornos:
 * @param {any} value - Valor reactivo de entrada sujeto a cambios frecuentes (ej. texto de búsqueda).
 * @param {number} [delay=300] - Tiempo de espera en milisegundos antes de propagar el nuevo valor.
 * @returns {any} El valor estabilizado una vez concluida la ventana temporal de inactividad.
 */

import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura un temporizador para diferir la actualización del estado interno
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // Función de limpieza para cancelar el temporizador si el valor cambia antes de que expire la ventana
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

