/**
 * Propósito:
 * Provee funciones matemáticas, de manipulación de fechas y formateo de estados clínicos/administrativos.
 * Resuelve la discrepancia de formatos entre la serialización de fechas de Jackson en Spring Boot
 * (arreglos numéricos [año, mes, día, hora, minuto]) y los estándares de JavaScript (ISO 8601 y objetos Date),
 * gestiona el cálculo de disponibilidad de agenda y sincroniza inasistencias por cambio de día.
 *
 * Ubicación y Rol:
 * Capa de Utilidades de Dominio (src/utils/cita.utils.js).
 * Motor transversal de normalización de tiempo, validación de traslape de citas y renderizado de estados.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - src/hooks/useAgenda.js
 *   - src/hooks/useConsultaIndex.js
 *   - src/hooks/useConsultaData.js
 *   - src/views/AppointmentPage.jsx
 *   - src/views/ConsultaIndexPage.jsx
 *   - src/components/AppointmentCard.jsx
 *   - src/components/AppointmentForm.jsx
 *   - src/components/HallazgosList.jsx
 *   - src/components/ui/StatusBadge.jsx
 * - Consume:
 *   - Ningún servicio de red directo (funciones puras y de orquestación de parámetros).
 */

// ── 1. Normalización y Conversión de Fechas ─────────────────────────────────

/**
 * Propósito:
 * Convierte cualquier representación de fecha proveniente del backend o de inputs a formato canónico 'YYYY-MM-DD'.
 *
 * Ubicación y Rol:
 * Utilidad de normalización de cadenas de fecha.
 *
 * Trazabilidad:
 * - Invocado desde: src/hooks/useAgenda.js, src/hooks/useConsultaIndex.js, src/views/AppointmentPage.jsx.
 *
 * @param {Array<number>|Date|string|number|null} fecha - Fecha en formato arreglo [y,m,d], objeto Date, ISO string o timestamp.
 * @returns {string} Cadena en formato 'YYYY-MM-DD' o cadena vacía si el valor es nulo.
 */
export const normalizarFecha = (fecha) => {
  if (!fecha) return '';

  // Spring Boot deserializa LocalDate por defecto como un arreglo numérico [año, mes, día]
  if (Array.isArray(fecha)) {
    const [y, m, d] = fecha;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  if (fecha instanceof Date) {
    return fecha.toISOString().split('T')[0];
  }

  if (typeof fecha === 'number') {
    return new Date(fecha).toISOString().split('T')[0];
  }

  const fechaString = String(fecha);
  return fechaString.includes('T') ? fechaString.split('T')[0] : fechaString;
};

// ── 2. Generación de Slots y Disponibilidad Horaria ─────────────────────────

export const HORA_APERTURA = '08:00';
export const HORA_CIERRE = '18:00';
export const SLOT_MINUTOS = 30;
export const DURACION_CITA_MIN = 60;

/**
 * Convierte una hora en formato militar 'HH:mm' a minutos acumulados del día para facilitar operaciones aritméticas.
 * @param {string} hhmm - Hora en formato 'HH:mm'.
 * @returns {number} Minutos transcurridos desde medianoche (ej. '08:30' -> 510).
 */
const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Convierte minutos acumulados a una representación canónica de hora 'HH:mm'.
 * @param {number} min - Total de minutos.
 * @returns {string} Hora formateada a dos dígitos.
 */
const aHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/**
 * Suma una cantidad entera de minutos a una hora base 'HH:mm'.
 * @param {string} hhmm - Hora base.
 * @param {number} mins - Minutos a adicionar.
 * @returns {string} Nueva hora resultante en 'HH:mm'.
 */
export const sumarMinutos = (hhmm, mins) => aHHMM(aMinutos(hhmm) + mins);

/**
 * Propósito:
 * Calcula todos los intervalos de inicio disponibles en la jornada laboral y evalúa si colisionan con citas previamente agendadas.
 *
 * Ubicación y Rol:
 * Motor de cálculo de agenda y prevención de solapamientos horarios.
 *
 * @param {string[]} [ocupadas=[]] - Arreglo de horas 'HH:mm' que ya cuentan con una cita registrada.
 * @returns {Array<{ value: string, label: string, disponible: boolean }>} Lista de slots con su bandera de disponibilidad.
 */
export const generarSlots = (ocupadas = []) => {
  const cierre = aMinutos(HORA_CIERRE);
  const ocupadasMin = ocupadas.map(aMinutos);
  const slots = [];

  // Se itera en múltiplos de SLOT_MINUTOS garantizando que la cita proyectada concluya antes del cierre
  for (let t = aMinutos(HORA_APERTURA); t + DURACION_CITA_MIN <= cierre; t += SLOT_MINUTOS) {
    const finNueva = t + DURACION_CITA_MIN;
    // Dos intervalos [t, finNueva) y [o, o + DURACION) se intersecan si t < finExistente y o < finNueva
    const seSolapa = ocupadasMin.some(o => t < o + DURACION_CITA_MIN && o < finNueva);
    slots.push({ value: aHHMM(t), label: aHHMM(t), disponible: !seSolapa });
  }
  return slots;
};

/**
 * Propósito:
 * Genera la fecha en formato ISO 'YYYY-MM-DD' preservando estrictamente la zona horaria local de la clínica (UTC-6),
 * evitando desfases de fecha ocasionados por la conversión automática a UTC de Date.prototype.toISOString().
 *
 * @param {Date|string|number} fecha - Instancia o valor representativo de una fecha.
 * @returns {string} Cadena 'YYYY-MM-DD' en hora local.
 */
export const obtenerFechaLocalISO = (fecha) => {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Propósito:
 * Transforma arreglos [y, m, d, h, min] o ISO strings en instancias de objeto Date nativo.
 *
 * @param {Array<number>|string|null} dt - Valor temporal de origen.
 * @returns {Date|null} Instancia Date o null si no se suministró valor.
 */
export const toDate = (dt) => {
  if (!dt) return null;
  // Los arreglos de LocalDateTime de Java usan meses basados en 1 (enero = 1), mientras Date de JS usa base 0 (enero = 0)
  if (Array.isArray(dt)) {
    return new Date(dt[0], dt[1] - 1, dt[2], dt[3] ?? 0, dt[4] ?? 0);
  }
  return new Date(dt);
};

/**
 * Propósito:
 * Formatea una fecha u hora al estándar legible 'HH:MM AM/PM' bajo la convención regional de El Salvador ('es-SV').
 *
 * @param {Array<number>|string|Date} hora - Objeto o arreglo temporal.
 * @returns {string} Hora formateada legible o '--:--' en caso de dato nulo.
 */
export const formatHora = (hora) => {
  const d = toDate(hora);
  return d
    ? d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
};

/**
 * Propósito:
 * Formatea una clave 'YYYY-MM-DD' en texto descriptivo largo para encabezados de calendario (ej. 'lunes 26 de mayo').
 *
 * @param {string} fechaStr - Cadena en formato 'YYYY-MM-DD'.
 * @returns {string} Fecha verbalizada en español.
 */
export const formatFechaHeader = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
};

/**
 * Propósito:
 * Formatea un valor temporal para campos de formulario tipo <input type="datetime-local"> ('YYYY-MM-DDTHH:mm').
 *
 * @param {Array<number>|string|null} dt - Fecha y hora de origen.
 * @returns {string} Cadena apta para controles HTML5 datetime-local.
 */
export const formatDT = (dt) => {
  if (!dt) return '';
  if (Array.isArray(dt)) {
    const [y, mo, d, h, min] = dt;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  return dt.substring(0, 16);
};

/**
 * Propósito:
 * Retorna la fecha del día actual en formato 'YYYY-MM-DD' en hora local del cliente.
 *
 * @returns {string} Fecha actual en 'YYYY-MM-DD'.
 */
export const getHoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Propósito:
 * Normaliza fechas de nacimiento para campos de formulario tipo <input type="date">.
 *
 * @param {Array<number>|string|null} fechaNac - Fecha de nacimiento.
 * @returns {string} Fecha en 'YYYY-MM-DD'.
 */
export const normalizarFechaNacimiento = (fechaNac) => {
  if (!fechaNac) return '';
  if (Array.isArray(fechaNac)) {
    const [y, m, d] = fechaNac;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return fechaNac;
};

// ── 3. Mapeo Visual de Estados (Tailwind CSS) ───────────────────────────────

/**
 * Configuración visual y descriptiva de los estados de cita médica para insignias de estado.
 * @type {Record<string, { tw: string, label: string }>}
 */
export const ESTADO_CONFIG = {
  PROGRAMADA:   { tw: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200', label: 'Programada' },
  PENDIENTE:    { tw: 'bg-teal-50    text-teal-700    ring-1 ring-teal-200',  label: 'En sala de espera' },
  EN_PROGRESO:  { tw: 'bg-sky-50     text-sky-700     ring-1 ring-sky-200',   label: 'En progreso' },
  COMPLETADA:   { tw: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', label: 'Completada' },
  FINALIZADA:   { tw: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', label: 'Finalizada' },
  REPROGRAMADA: { tw: 'bg-violet-50  text-violet-700  ring-1 ring-violet-200', label: 'Reprogramada' },
  NO_ASISTIO:   { tw: 'bg-rose-50    text-rose-600    ring-1 ring-rose-200',  label: 'No asistió' },
  CANCELADA:    { tw: 'bg-red-50     text-red-600     ring-1 ring-red-200',   label: 'Cancelada' },
  OTRO:         { tw: 'bg-slate-100  text-slate-600',                          label: 'Otro' },
};

/**
 * Retorna la configuración de estilos de un estado de cita, garantizando valor de contingencia ante estados imprevistos.
 * @param {string} estado - Clave del estado evaluado.
 * @returns {{ tw: string, label: string }}
 */
export const getEstadoConfig = (estado) =>
  ESTADO_CONFIG[estado] ?? { tw: 'bg-slate-100 text-slate-500', label: estado ?? '—' };

// ── 4. Sincronización Automática de Inasistencias ───────────────────────────

/**
 * Propósito:
 * Examina la nómina de citas cargadas y detecta aquellas cuya fecha programada pertenece a un día pasado
 * (fechaCita < hoy) y que aún se encuentren en estado PROGRAMADA o PENDIENTE (el paciente no asistió a su cita).
 * Envía las actualizaciones correspondientes a la API REST para persistir el estado 'NO_ASISTIO' en la base de datos
 * y retorna la lista reflejando el cambio en memoria de manera inmediata.
 *
 * Ubicación y Rol:
 * Motor de sincronización reactiva de inasistencias en la capa de utilidades.
 *
 * Trazabilidad:
 * - Invocado desde: src/hooks/useAgenda.js (fetchAll, refetchCitas) y src/hooks/useConsultaIndex.js (loadAll, refetchCitas).
 *
 * @param {Array<Object>} listaCitas - Arreglo de citas obtenido de la API.
 * @param {Function} cambiarEstadoFn - Función delegada para ejecutar el cambio de estado remoto (id, nuevoEstado).
 * @returns {Promise<Array<Object>>} Lista de citas con los estados sincronizados.
 */
export const sincronizarCitasVencidas = async (listaCitas, cambiarEstadoFn) => {
  if (!Array.isArray(listaCitas) || !cambiarEstadoFn || listaCitas.length === 0) {
    return listaCitas || [];
  }
  const hoy = getHoyLocal();

  // Se filtran únicamente citas no atendidas cuya fecha ya venció (comparación léxica de formato ISO 'YYYY-MM-DD')
  const vencidas = listaCitas.filter(c => {
    const fecha = normalizarFecha(c.fechaCita);
    if (!fecha) return false;
    const esDiaPasado = fecha < hoy;
    const estadoNoFinal = ['PROGRAMADA', 'PENDIENTE'].includes(c.estadoCita);
    return esDiaPasado && estadoNoFinal;
  });

  if (vencidas.length === 0) return listaCitas;

  const actualizadasIds = new Set();
  // Se procesan las peticiones en paralelo mediante Promise.allSettled para que la falla individual de un registro
  // no aborte la actualización de las demás citas vencidas
  await Promise.allSettled(
    vencidas.map(async (c) => {
      try {
        await cambiarEstadoFn(c.idCitas, 'NO_ASISTIO');
        actualizadasIds.add(c.idCitas);
      } catch (err) {
        console.error(`Fallo al sincronizar inasistencia de cita ID ${c.idCitas}:`, err);
      }
    })
  );

  return listaCitas.map(c =>
    actualizadasIds.has(c.idCitas) ? { ...c, estadoCita: 'NO_ASISTIO' } : c
  );
};

// ── 5. Mapeo Visual de Hallazgos y Precios ───────────────────────────────────

/**
 * Configuración visual y descriptiva de los estados de un hallazgo dental.
 * @type {Record<string, { tw: string, label: string }>}
 */
export const HALLAZGO_ESTADO_CONFIG = {
  PENDIENTE:   { tw: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/80', label: 'Presupuestado' },
  PROGRAMADO:  { tw: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80', label: 'Programado' },
  EN_PROGRESO: { tw: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200/80', label: 'En Progreso' },
  COMPLETADO:  { tw: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80', label: 'Realizado' },
  CANCELADO:   { tw: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/80', label: 'Cancelado' },
  OTRO:        { tw: 'bg-slate-100 text-slate-600', label: 'Otro' },
};

/**
 * Propósito:
 * Extrae el costo monetario de un hallazgo odontológico garantizando compatibilidad ante diferentes nombres
 * de atributo devueltos por el backend (precioFloat, costoTratamiento, costoAplicado, precio, costo).
 *
 * @param {Object|null} h - Objeto representativo del hallazgo clínico.
 * @returns {number} Valor numérico del precio o 0 si no es válido.
 */
export const getPrecioHallazgo = (h) => {
  if (!h) return 0;
  // Se evalúan en cascada las posibles propiedades donde el DTO de Spring Boot serializa el valor económico
  const val = h.precioFloat ?? h.costoTratamiento ?? h.costoAplicado ?? h.precio ?? h.costo;
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};


