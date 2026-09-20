/**
 * Propósito:
 * Hook del panel principal (Dashboard). Recupera las citas clínicas del día gestionadas
 * mediante la caché de TanStack Query ('useQuery'), extrae el nombre del usuario autenticado,
 * genera el texto de fecha en español y sintetiza métricas ejecutivas de gestión médica
 * (total, completadas, reprogramadas y pendientes).
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useHomeDashboard.js'. Hook de lógica de presentación y resumen estadístico
 * dentro de la capa de hooks de la aplicación.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/DashboardPage.jsx'
 * - Consume:
 *   - '@tanstack/react-query' ('useQuery')
 *   - 'src/services/cita.service.js' ('getCitas')
 *   - 'src/services/auth.service.js' ('getUserName')
 *   - 'src/utils/cita.utils.js' ('normalizarFecha', 'getHoyLocal')
 *
 * Parámetros y Retornos:
 * @returns {Object} Datos consolidados para el dashboard:
 *   - citasHoy {Array<Object>}: Primeras 4 citas del día para renderizado en tarjeta resumida.
 *   - loading {boolean}: Estado de carga asíncrona de las citas provisto por TanStack Query.
 *   - userName {string}: Nombre del usuario logueado extraído de la sesión.
 *   - today {string}: Fecha actual formateada en lenguaje natural en español (ej. 'lunes, 19 de septiembre').
 *   - stats {Object}: Agregación numérica con métricas del día (total, completadas, reprogramadas, pendientes).
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCitas } from '../services/cita.service';
import { normalizarFecha, getHoyLocal } from '../utils/cita.utils';
import { useAuth } from '../context/AuthContext';

export const useHomeDashboard = () => {
  // Obtención reactiva del nombre de usuario desde el contexto de autenticación
  const { userName } = useAuth();

  // Clave de fecha actual normalizada en hora local
  const hoy = useMemo(() => getHoyLocal(), []);

  // Cadena textual localizada de la fecha para el encabezado del panel
  const today = new Date().toLocaleDateString('es-SV', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Consulta sincronizada mediante TanStack Query con clave de caché global ['citas']
  const { data: todasCitas = [], isLoading: loading } = useQuery({
    queryKey: ['citas'],
    queryFn: getCitas,
  });

  // Deriva reactivamente las citas del día actual a partir de la colección en caché
  const citasHoy = useMemo(() => {
    return (todasCitas ?? []).filter(c => normalizarFecha(c.fechaCita) === hoy);
  }, [todasCitas, hoy]);

  // Síntesis de métricas clínicas del día actual computadas de forma memorizada
  const stats = useMemo(() => ({
    total:         citasHoy.length,
    completadas:   citasHoy.filter(c => c.estadoCita === 'COMPLETADA' || c.estadoCita === 'FINALIZADA').length,
    reprogramadas: citasHoy.filter(c => c.estadoCita === 'REPROGRAMADA').length,
    pendientes:    citasHoy.filter(c => ['PROGRAMADA', 'PENDIENTE'].includes(c.estadoCita)).length,
  }), [citasHoy]);

  return {
    // Se limita a un máximo de 4 citas para no desbordar el widget visual del panel de control
    citasHoy: citasHoy.slice(0, 4),
    loading,
    userName,
    today,
    stats,
  };
};

