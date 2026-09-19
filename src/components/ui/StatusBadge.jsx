import React from 'react';
import { getEstadoConfig } from '../../utils/cita.utils';

/**
 * Indicador de estado de cita — usa ESTADO_CONFIG como única fuente de verdad.
 */

//IMPORTANTE: Para agregar un nuevo estado o cambiar colores/etiquetas, Editar `getEstadoConfig` en 'utils/cita.utils.js'.

//Clave del estado de la cita (ej: 'PROGRAMADA', 'CANCELADA', 'COMPLETADA').
const DOT_COLORS = {
  PROGRAMADA:   'bg-amber-500',
  PENDIENTE:    'bg-amber-500',
  EN_PROGRESO:  'bg-sky-500 animate-pulse',
  COMPLETADA:   'bg-emerald-500',
  FINALIZADA:   'bg-emerald-500',
  REPROGRAMADA: 'bg-violet-500',
  NO_ASISTIO:   'bg-red-500',
  CANCELADA:    'bg-red-500',
  OTRO:         'bg-slate-400',
};

const StatusBadge = ({ estado, size = 'sm' }) => {
  const { tw, label } = getEstadoConfig(estado);
  const dotColor = DOT_COLORS[estado] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight ${tw}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
      {label}
    </span>
  );
};

export default StatusBadge;
