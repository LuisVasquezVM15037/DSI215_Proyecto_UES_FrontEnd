import Swal from 'sweetalert2';

/** Color primario para botones de confirmación (Tailwind primary-600) */
const PRIMARY   = '#0284c7';
const DANGER    = '#ef4444';
const SECONDARY = '#64748b';

// ── Alertas básicas ───────────────────────────────────────────────────────────

export const alertSuccess = (title, text, timer = 1800) =>
  Swal.fire({
    icon: 'success', title, text,
    confirmButtonColor: PRIMARY,
    timer,
    showConfirmButton: !timer,
    timerProgressBar: !!timer,
  });

export const alertError = (text, title = 'Error') =>
  Swal.fire({ icon: 'error', title, text, confirmButtonColor: PRIMARY });

export const alertWarning = (text, title = 'Atención') =>
  Swal.fire({ icon: 'warning', title, text, confirmButtonColor: PRIMARY });

export const alertInfo = (text, title = 'Información') =>
  Swal.fire({ icon: 'info', title, text, confirmButtonColor: PRIMARY });

// ── Diálogos de confirmación ──────────────────────────────────────────────────

/**
 * Confirmación genérica.
 * @returns {Promise<boolean>} true si el usuario confirmó
 */
export const confirmDialog = async (title, text, confirmText = 'Confirmar') => {
  const result = await Swal.fire({
    icon:              'question',
    title, text,
    showCancelButton:  true,
    confirmButtonText: confirmText,
    cancelButtonText:  'Cancelar',
    confirmButtonColor: PRIMARY,
    cancelButtonColor:  SECONDARY,
  });
  return result.isConfirmed;
};

/**
 * Confirmación de eliminación/acción destructiva.
 * @returns {Promise<boolean>}
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
 * Confirmación de desactivación de usuario.
 * @returns {Promise<boolean>}
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
 * Diálogo con textarea para ingresar motivo de cancelación.
 * @returns {Promise<string|null>} motivo ingresado, o null si canceló
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

/** Toast de éxito en la esquina superior derecha */
export const toastSuccess = (title) =>
  Swal.fire({
    toast: true, position: 'top-end',
    icon: 'success', title,
    showConfirmButton: false,
    timer: 1500, timerProgressBar: true,
  });
