/**
 * Propósito:
 * Estandariza la capa de retroalimentación modal interactiva (diálogos, notificaciones toast,
 * advertencias y confirmaciones de acciones destructivas) mediante SweetAlert2, garantizando
 * uniformidad tipográfica y de colores con el sistema de diseño Tailwind CSS.
 *
 * Ubicación y Rol:
 * Capa de Utilidades de Interfaz de Usuario (src/utils/alert.utils.js).
 * Controlador transversal de notificaciones y confirmaciones de usuario.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/hooks/useAgenda.js
 *   - src/hooks/useConsultaData.js
 *   - src/hooks/useConsultaIndex.js
 *   - src/hooks/usePatientManagement.js
 *   - src/hooks/usePrescripcion.js
 *   - src/hooks/useTratamientos.js
 *   - src/hooks/useUserManagement.js
 *   - src/components/Layout.jsx
 * - Consume:
 *   - sweetalert2
 */

import Swal from 'sweetalert2';

// Códigos hexadecimales alineados con la paleta de Tailwind CSS (primary-600, red-500, slate-500)
const PRIMARY   = '#0284c7';
const DANGER    = '#ef4444';
const SECONDARY = '#64748b';

// ── 1. Modales Informativos y de Alerta ──────────────────────────────────────

/**
 * Propósito:
 * Despliega un cuadro de diálogo modal de éxito que se autocierra tras un intervalo temporal.
 *
 * @param {string} title - Encabezado principal del mensaje.
 * @param {string} text - Descripción detallada del resultado satisfactorio.
 * @param {number} [timer=1800] - Tiempo de permanencia en pantalla expresado en milisegundos.
 * @returns {Promise<any>} Promesa de resolución del diálogo de SweetAlert2.
 */
export const alertSuccess = (title, text, timer = 1800) =>
  Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: PRIMARY,
    timer,
    showConfirmButton: !timer,
    timerProgressBar: !!timer,
  });

/**
 * Propósito:
 * Despliega un cuadro de diálogo modal de error crítico que requiere interacción manual del usuario.
 *
 * @param {string} text - Descripción detallada del fallo o excepción capturada.
 * @param {string} [title='Error'] - Título del modal de error.
 * @returns {Promise<any>} Promesa de resolución de SweetAlert2.
 */
export const alertError = (text, title = 'Error') =>
  Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: PRIMARY,
  });

/**
 * Propósito:
 * Muestra una advertencia sobre condiciones que impiden continuar una operación de negocio.
 *
 * @param {string} text - Explicación de la condición o requisito insatisfecho.
 * @param {string} [title='Atención'] - Título de la alerta.
 * @returns {Promise<any>} Promesa de resolución de SweetAlert2.
 */
export const alertWarning = (text, title = 'Atención') =>
  Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: PRIMARY,
  });

/**
 * Propósito:
 * Notifica al usuario información relevante de solo lectura sin connotación de error.
 *
 * @param {string} text - Mensaje informativo.
 * @param {string} [title='Información'] - Título del diálogo.
 * @returns {Promise<any>} Promesa de resolución de SweetAlert2.
 */
export const alertInfo = (text, title = 'Información') =>
  Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonColor: PRIMARY,
  });

// ── 2. Diálogos de Confirmación Asíncrona ───────────────────────────────────

/**
 * Propósito:
 * Solicita confirmación explícita al usuario para operaciones no destructivas (ej. confirmar cierre de consulta).
 *
 * @param {string} title - Pregunta o acción a confirmar.
 * @param {string} text - Detalles o consecuencias de la acción.
 * @param {string} [confirmText='Confirmar'] - Etiqueta del botón de aceptación.
 * @returns {Promise<boolean>} Resuelve true si el usuario confirmó positivamente, false en caso de cancelación.
 */
export const confirmDialog = async (title, text, confirmText = 'Confirmar') => {
  const result = await Swal.fire({
    icon:              'question',
    title,
    text,
    showCancelButton:  true,
    confirmButtonText: confirmText,
    cancelButtonText:  'Cancelar',
    confirmButtonColor: PRIMARY,
    cancelButtonColor:  SECONDARY,
  });
  return result.isConfirmed;
};

/**
 * Propósito:
 * Solicita confirmación de alta criticidad para eliminación permanente de entidades (pacientes, citas, tratamientos).
 *
 * @param {string} nombre - Nombre del registro o entidad sujeta a eliminación.
 * @param {string} [textoExtra=''] - Mensaje adicional o advertencia de irreversibilidad.
 * @returns {Promise<boolean>} Resuelve true si el usuario ratificó la eliminación.
 */
export const confirmDelete = async (nombre, textoExtra = '') =>
  Swal.fire({
    icon:              'warning',
    title:             `¿Eliminar "${nombre}"?`,
    text:              textoExtra || 'Esta acción no se puede deshacer.',
    showCancelButton:  true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText:  'Cancelar',
    confirmButtonColor: DANGER,
    cancelButtonColor:  SECONDARY,
  }).then(r => r.isConfirmed);

/**
 * Propósito:
 * Solicita ratificación para la inhabilitación lógica de una cuenta de usuario o empleado.
 *
 * @param {string} nombre - Nombre del empleado o usuario a inhabilitar.
 * @returns {Promise<boolean>} Resuelve true si se confirmó la baja lógica.
 */
export const confirmDeactivate = async (nombre) =>
  Swal.fire({
    icon:              'warning',
    title:             'Desactivar usuario',
    text:              `El usuario "${nombre}" será inhabilitado y no podrá iniciar sesión.`,
    showCancelButton:  true,
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText:  'Cancelar',
    confirmButtonColor: DANGER,
    cancelButtonColor:  SECONDARY,
  }).then(r => r.isConfirmed);

/**
 * Propósito:
 * Abre un modal con campo de entrada multilínea (<textarea>) para capturar la justificación
 * obligatoria de cancelación de una cita médica.
 *
 * @param {string} nombrePaciente - Nombre del paciente titular de la cita.
 * @returns {Promise<string|null>} Cadena con el motivo registrado o null si se canceló la acción.
 */
export const promptMotivoCancelacion = async (nombrePaciente) => {
  const { value, isConfirmed } = await Swal.fire({
    title:             'Cancelar cita',
    text:              `Cita de ${nombrePaciente}`,
    input:             'textarea',
    inputLabel:        'Motivo de cancelación',
    inputPlaceholder:  'Escriba el motivo...',
    showCancelButton:  true,
    confirmButtonText: 'Confirmar cancelación',
    cancelButtonText:  'Volver',
    confirmButtonColor: DANGER,
    cancelButtonColor:  SECONDARY,
    inputValidator:    (v) => { if (!v?.trim()) return 'El motivo es obligatorio.'; },
  });
  return isConfirmed ? value : null;
};

/**
 * Propósito:
 * Despliega una notificación flotante no bloqueante (Toast) en el extremo superior derecho de la pantalla.
 *
 * @param {string} title - Mensaje sintético a mostrar.
 * @returns {Promise<any>} Promesa de resolución del Toast.
 */
export const toastSuccess = (title) =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });

