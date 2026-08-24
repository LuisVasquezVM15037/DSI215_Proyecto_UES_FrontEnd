import { useState, useEffect } from 'react';

/**
 * Retrasa la actualización de un valor hasta que el usuario deje de escribir.
 * Soluciona el problema de múltiples peticiones HTTP al buscar.
 *
 * @param {any}    value  - Valor a debounce (ej: searchTerm)
 * @param {number} delay  - Milisegundos de espera (por defecto 300ms)
 * @returns El valor estabilizado
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
