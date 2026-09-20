/**
 * Propósito:
 * Componente visual de indicador o insignia (badge) de estado para citas médicas.
 * Renderiza una píldora con fondo tonal, texto descriptivo y un indicador puntual (dot)
 * animado o estático, utilizando la configuración centralizada de la capa de utilidades.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/StatusBadge.jsx'. Elemento de presentación en la capa
 * de componentes de interfaz atómicos.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/AppointmentCard.jsx'
 *   - 'src/views/AppointmentPage.jsx'
 *   - 'src/views/DashboardPage.jsx'
 * - Consume:
 *   - 'src/utils/cita.utils.js' ('getEstadoConfig').
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.estado - Clave identificadora del estado de la cita (ej. 'PROGRAMADA', 'COMPLETADA', 'CANCELADA', etc.).
 * @param {'sm'|'md'} [props.size='sm'] - Escala de tamaño visual de la insignia.
 * @returns {JSX.Element} Insignia estilizada con indicador cromático de estado.
 */

import React from 'react';
import { getEstadoConfig } from '../../utils/cita.utils';

// Diccionario de clases Tailwind para el punto indicador (dot) asociado a cada estado clínico
const DOT_COLORS = {
  PROGRAMADA:   'bg-amber-500',
  PENDIENTE:    'bg-teal-500 animate-pulse',
  EN_PROGRESO:  'bg-sky-500 animate-pulse',
  COMPLETADA:   'bg-emerald-500',
  FINALIZADA:   'bg-emerald-500',
  REPROGRAMADA: 'bg-violet-500',
  NO_ASISTIO:   'bg-rose-500',
  CANCELADA:    'bg-red-500',
  OTRO:         'bg-slate-400',
};

const StatusBadge = ({ estado, size = 'sm' }) => {
  // Consulta la configuración semántica de colores y textos desde la fuente única de verdad
  const { tw, label } = getEstadoConfig(estado);
  const dotColor = DOT_COLORS[estado] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight ${tw}`}>
      {/* Indicador circular puntual con animación de pulso si el estado requiere atención activa */}
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
      {label}
    </span>
  );
};

export default StatusBadge;
