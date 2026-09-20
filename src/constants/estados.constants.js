/**
 * Propósito:
 * Estandariza los estados finitos del ciclo de vida de las citas médicas y los planes de tratamiento
 * (hallazgos clínicos odontológicos). Evita el uso de cadenas de texto literales (magic strings)
 * y suministra las opciones legibles para componentes de selección en la interfaz de usuario.
 *
 * Ubicación y Rol:
 * Capa de Constantes del Dominio (src/constants/estados.constants.js).
 * Define las máquinas de estado clínico y administrativo del sistema.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/hooks/useConsultaIndex.js
 *   - src/views/ConsultaIndexPage.jsx
 *   - src/components/AppointmentForm.jsx
 *   - src/components/HallazgosList.jsx
 *   - src/components/TratamientoSelector.jsx
 *   - src/hooks/useTratamientos.js
 *   - src/hooks/useConsultaData.js
 * - Consume: Ningún módulo externo.
 */

/**
 * Enumeración de estados de una cita médica, sincronizada con el enum EstadoCita de Spring Boot.
 * @type {Readonly<Record<string, string>>}
 */
export const ESTADO_CITA = {
  PROGRAMADA:   'PROGRAMADA',
  PENDIENTE:    'PENDIENTE',     // Paciente presente en sala de espera (Check-in efectuado)
  EN_PROGRESO:  'EN_PROGRESO',   // Consulta clínica activa en consultorio
  COMPLETADA:   'COMPLETADA',
  FINALIZADA:   'FINALIZADA',    // Consulta concluida con registro clínico guardado
  REPROGRAMADA: 'REPROGRAMADA',
  NO_ASISTIO:   'NO_ASISTIO',    // Cita vencida por cambio de día sin asistencia del paciente
  CANCELADA:    'CANCELADA',
  OTRO:         'OTRO',
};

/**
 * Opciones para controles de selección (<select>) de estados de cita.
 * @type {Array<{ value: string, label: string }>}
 */
export const ESTADOS_CITA_OPCIONES = [
  { value: 'PROGRAMADA',   label: 'Programada' },
  { value: 'PENDIENTE',    label: 'Pendiente (En sala de espera)' },
  { value: 'EN_PROGRESO',  label: 'En Progreso' },
  { value: 'FINALIZADA',   label: 'Finalizada' },
  { value: 'REPROGRAMADA', label: 'Reprogramada' },
  { value: 'NO_ASISTIO',   label: 'No Asistió' },
  { value: 'CANCELADA',    label: 'Cancelada' },
  { value: 'OTRO',         label: 'Otro' },
];

/**
 * Subconjunto de estados que habilitan al personal médico a iniciar o retomar una consulta en consultorio.
 * @type {string[]}
 */
export const ESTADOS_INICIABLES = [
  ESTADO_CITA.PROGRAMADA,
  ESTADO_CITA.PENDIENTE,
  ESTADO_CITA.EN_PROGRESO,
];

/**
 * Enumeración de estados del plan de tratamiento (hallazgo dental), sincronizada con EstadoPlan de Spring Boot.
 * @type {Readonly<Record<string, string>>}
 */
export const ESTADO_HALLAZGO = {
  PENDIENTE:   'PENDIENTE',     // Hallazgo detectado y presupuestado, pendiente de confirmación
  PROGRAMADO:  'PROGRAMADO',    // Procedimiento agendado para ejecución en la sesión
  EN_PROGRESO: 'EN_PROGRESO',   // Intervención odontológica en ejecución
  COMPLETADO:  'COMPLETADO',    // Procedimiento concluido satisfactoriamente
  CANCELADO:   'CANCELADO',
  OTRO:        'OTRO',
};

/**
 * Opciones para controles de selección (<select>) de estados de hallazgo clínico.
 * @type {Array<{ value: string, label: string }>}
 */
export const ESTADOS_HALLAZGO_OPCIONES = [
  { value: 'PENDIENTE',   label: 'Presupuestado (Pendiente)' },
  { value: 'PROGRAMADO',  label: 'Programado' },
  { value: 'EN_PROGRESO', label: 'En Progreso' },
  { value: 'COMPLETADO',  label: 'Realizado (Completado)' },
  { value: 'CANCELADO',   label: 'Cancelado' },
  { value: 'OTRO',        label: 'Otro' },
];

