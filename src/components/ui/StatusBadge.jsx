import React from 'react';
import { getEstadoConfig } from '../../utils/cita.utils';

/**
 * Indicador de estado de cita — usa ESTADO_CONFIG como única fuente de verdad.
 */

//IMPORTANTE: Para agregar un nuevo estado o cambiar colores/etiquetas, Editar `getEstadoConfig` en 'utils/cita.utils.js'.

//Clave del estado de la cita (ej: 'PROGRAMADA', 'CANCELADA', 'COMPLETADA').
const StatusBadge = ({ estado }) => {
  // `tw` contiene las clases Tailwind de color para ese estado (fondo + texto).
  // `label` contiene el texto legible para el usuario (ej: "Programada", "Cancelada").
  const { tw, label } = getEstadoConfig(estado);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tw}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
