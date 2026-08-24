/**
 * Valores posibles del campo estadoCita en el backend.
 * Usar estas constantes en lugar de strings literales.
 */
export const ESTADO_CITA = {
  PROGRAMADA:   'PROGRAMADA',
  PENDIENTE:    'PENDIENTE',
  EN_PROGRESO:  'EN_PROGRESO',
  COMPLETADA:   'COMPLETADA',
  FINALIZADA:   'FINALIZADA',
  REPROGRAMADA: 'REPROGRAMADA',
  NO_ASISTIO:   'NO_ASISTIO',
  CANCELADA:    'CANCELADA',
  OTRO:         'OTRO',
};

/** Lista para poblar <select> de estado de cita */
export const ESTADOS_CITA_OPCIONES = [
  { value: 'PROGRAMADA',   label: 'Programada'   },
  { value: 'PENDIENTE',    label: 'Pendiente'    },
  { value: 'EN_PROGRESO',  label: 'En Progreso'  },
  { value: 'FINALIZADA',   label: 'Finalizada'   },
  { value: 'REPROGRAMADA', label: 'Reprogramada' },
  { value: 'NO_ASISTIO',   label: 'No Asistió'   },
  { value: 'CANCELADA',    label: 'Cancelada'    },
  { value: 'OTRO',         label: 'Otro'         },
];

/** Estados que permiten iniciar o continuar una consulta */
export const ESTADOS_INICIABLES = [
  ESTADO_CITA.PROGRAMADA,
  ESTADO_CITA.PENDIENTE,
  ESTADO_CITA.EN_PROGRESO,
];

/**
 * Valores posibles del campo estadoPlan (plan de tratamiento / hallazgo).
 */
export const ESTADO_HALLAZGO = {
  PENDIENTE:   'PENDIENTE',
  PROGRAMADO:  'PROGRAMADO',
  EN_PROGRESO: 'EN_PROGRESO',
  COMPLETADO:  'COMPLETADO',
  CANCELADO:   'CANCELADO',
  OTRO:        'OTRO',
};

/** Lista para poblar <select> de estado de hallazgo */
export const ESTADOS_HALLAZGO_OPCIONES = [
  { value: 'PENDIENTE',   label: 'Pendiente'   },
  { value: 'PROGRAMADO',  label: 'Programado'  },
  { value: 'EN_PROGRESO', label: 'En progreso' },
  { value: 'COMPLETADO',  label: 'Completado'  },
  { value: 'CANCELADO',   label: 'Cancelado'   },
  { value: 'OTRO',        label: 'Otro'        },
];
