/**
 * Utilidades de fecha/hora y estado de citas.
 */

// ── Normalización de fechas ───────────────────────────────────────────────────

/** Convierte array [y,m,d] o string ISO → 'yyyy-MM-dd' */
export const normalizarFecha = (fecha) => {
  // 1. Si no hay fecha (null, undefined, '')
  if (!fecha) return '';

  // 2. Si la fecha viene como arreglo [año, mes, día]
  if (Array.isArray(fecha)) {
    const [y, m, d] = fecha;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // 3. Si la fecha es un objeto Date de JavaScript
  if (fecha instanceof Date) {
    // toISOString() lo convierte a formato 'YYYY-MM-DDTHH:mm:ss.sssZ'
    return fecha.toISOString().split('T')[0];
  }

  // 4. Si la fecha es un número (timestamp en milisegundos)
  if (typeof fecha === 'number') {
    return new Date(fecha).toISOString().split('T')[0];
  }

  // 5. Si no fue nada de lo anterior, se fuerza a que sea un String por seguridad
  const fechaString = String(fecha);

  return fechaString.includes('T') ? fechaString.split('T')[0] : fechaString;
};

// ── Generación de slots y validación de solapamientos de citas al momento de crearlas────────────────

export const HORA_APERTURA = '08:00';   // ajustar al horario de la clínica
export const HORA_CIERRE = '18:00';
export const SLOT_MINUTOS = 30;         
export const DURACION_CITA_MIN = 60;     // la cita dura 1 hora

//── Formateo de fechas y horas para UI ─────────────────────────────────────────
const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const aHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Suma minutos a una hora "HH:mm" y devuelve "HH:mm" */
export const sumarMinutos = (hhmm, mins) => aHHMM(aMinutos(hhmm) + mins);

/**
 * Genera los slots de inicio en múltiplos de SLOT_MINUTOS.
 * Marca como no disponible el slot cuya cita (de DURACION_CITA_MIN)
 * se solape con una ya existente.
 *
 * @param {string[]} ocupadas  horas de inicio ya programadas ("HH:mm")
 */
export const generarSlots = (ocupadas = []) => {
  const cierre = aMinutos(HORA_CIERRE);
  const ocupadasMin = ocupadas.map(aMinutos);
  const slots = [];
// Se recorre desde la apertura hasta el cierre, generando slots cada SLOT_MINUTOS
  for (let t = aMinutos(HORA_APERTURA); t + DURACION_CITA_MIN <= cierre; t += SLOT_MINUTOS) {
    const finNueva = t + DURACION_CITA_MIN;
    const seSolapa = ocupadasMin.some(o => t < o + DURACION_CITA_MIN && o < finNueva);
    slots.push({ value: aHHMM(t), label: aHHMM(t), disponible: !seSolapa });
  }
  return slots;
};

//Para obtener la fecha y hora local en UTC 6 
export const obtenerFechaLocalISO = (fecha) => {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Devuelve YYYY-MM-DD en hora local
};

/** Convierte array [y,m,d,h,min] o string ISO a Date */
export const toDate = (dt) => {
  if (!dt) return null;
  if (Array.isArray(dt)) {
    return new Date(dt[0], dt[1] - 1, dt[2], dt[3] ?? 0, dt[4] ?? 0);
  }
  return new Date(dt);
};

/** Formatea a 'HH:MM AM/PM' en hora local */
export const formatHora = (hora) => {
  const d = toDate(hora);
  return d
    ? d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
};

/** Formatea 'yyyy-MM-dd' para encabezados de semana. Ej: 'lunes 26 de mayo' */
export const formatFechaHeader = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
};

/** Formatea datetime para inputs datetime-local: 'yyyy-MM-ddTHH:mm' */
export const formatDT = (dt) => {
  if (!dt) return '';
  if (Array.isArray(dt)) {
    const [y, mo, d, h, min] = dt;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  return dt.substring(0, 16);
};

/** Retorna 'yyyy-MM-dd' del día de hoy en hora local (esto no UTC) */
export const getHoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Normaliza la fecha de nacimiento de array [y,m,d] a string 'yyyy-MM-dd' para input date */
export const normalizarFechaNacimiento = (fechaNac) => {
  if (!fechaNac) return '';
  if (Array.isArray(fechaNac)) {
    const [y, m, d] = fechaNac;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return fechaNac;
};

// ── Mapeo de estado → UI ──────────────────────────────────────────────────────

/**
 * Mapa completo de estado { tw: clases Tailwind, label: texto legible }
 * Esta es la úncia definición
 */
export const ESTADO_CONFIG = {
  PROGRAMADA: { tw: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200', label: 'Programada' },
  PENDIENTE: { tw: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200', label: 'Pendiente' },
  EN_PROGRESO: { tw: 'bg-sky-50     text-sky-700     ring-1 ring-sky-200', label: 'En progreso' },
  COMPLETADA: { tw: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', label: 'Completada' },
  FINALIZADA: { tw: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', label: 'Finalizada' },
  REPROGRAMADA: { tw: 'bg-violet-50  text-violet-700  ring-1 ring-violet-200', label: 'Reprogramada' },
  NO_ASISTIO: { tw: 'bg-red-50     text-red-600     ring-1 ring-red-200', label: 'No asistió' },
  CANCELADA: { tw: 'bg-red-50     text-red-600     ring-1 ring-red-200', label: 'Cancelada' },
  OTRO: { tw: 'bg-slate-100  text-slate-600', label: 'Otro' },
};

/** Devuelve la config de un estado, con fallback seguro */
export const getEstadoConfig = (estado) =>
  ESTADO_CONFIG[estado] ?? { tw: 'bg-slate-100 text-slate-500', label: estado ?? '—' };

// ── Mapeo de estado hallazgo  a Tailwind ───────────────────────────────────────
export const HALLAZGO_ESTADO_CONFIG = {
  PENDIENTE: { tw: 'bg-amber-50   text-amber-700', label: 'Pendiente' },
  PROGRAMADO: { tw: 'bg-sky-50     text-sky-700', label: 'Programado' },
  EN_PROGRESO: { tw: 'bg-blue-50    text-blue-700', label: 'En progreso' },
  COMPLETADO: { tw: 'bg-emerald-50 text-emerald-700', label: 'Completado' },
  CANCELADO: { tw: 'bg-red-50     text-red-600', label: 'Cancelado' },
  OTRO: { tw: 'bg-slate-100  text-slate-600', label: 'Otro' },
};
