/**
 * Propósito:
 * Hook de gestión integral de la agenda clínica y calendario de citas odontológicas.
 * Orquesta la recuperación asíncrona concurrente de citas, pacientes y odontólogos,
 * ejecuta la regla de sincronización automática de citas vencidas (cambio a NO_ASISTIO),
 * deriva colecciones memoizadas por fecha y provee operaciones transaccionales para
 * crear, actualizar, cancelar con justificación, reprogramar y registrar check-in en sala de espera.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useAgenda.js'. Hook de lógica de negocio dentro de la capa de hooks
 * personalizados del módulo de agenda.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/AppointmentPage.jsx'
 * - Consume:
 *   - 'src/services/cita.service.js' ('getCitas', 'createCita', 'updateCita', 'cancelarCita', 'cambiarEstado')
 *   - 'src/services/paciente.service.js' ('getPacientes')
 *   - 'src/services/usuario.service.js' ('getOdontologos')
 *   - 'src/utils/cita.utils.js' ('normalizarFecha', 'formatDT', 'formatFechaHeader', 'formatHora', 'getEstadoConfig', 'sincronizarCitasVencidas')
 *   - 'src/utils/alert.utils.js' ('alertSuccess', 'alertError', 'alertWarning', 'promptMotivoCancelacion')
 *
 * Parámetros y Retornos:
 * @param {Date} date - Instancia de objeto Date que representa el día seleccionado en el calendario interactivo.
 * @returns {Object} Estado de la agenda y métodos de interacción transaccional:
 *   - appointments {Array<Object>}: Lista global de citas médicas sincronizadas.
 *   - loading {boolean}: Estado de procesamiento asíncrono o petición en red.
 *   - pacientes {Array<Object>}: Catálogo general de pacientes para asignación.
 *   - odontologos {Array<Object>}: Catálogo de profesionales odontólogos disponibles.
 *   - selectedCita {Object|null}: Cita actualmente enfocada para edición o reprogramación.
 *   - setSelectedCita {Function}: Mutador de cita seleccionada.
 *   - isEditing {boolean}: Bandera que distingue el modo de guardado (creación vs edición).
 *   - formData {Object}: Estado controlado de los campos del formulario de cita.
 *   - citasDelDia {Array<Object>}: Citas pertenecientes estrictamente a la fecha seleccionada.
 *   - citasPorFecha {Object}: Mapa agrupado indexado por clave 'YYYY-MM-DD'.
 *   - handleChange {Function}: Manejador de cambios en inputs de formulario.
 *   - prepararNuevaCita {Function}: Reinicia el formulario para agendar una nueva cita.
 *   - prepararEditarCita {Function}: Carga los datos de una cita existente en el formulario.
 *   - handleCancelar {Function}: Solicita motivo y cancela la cita.
 *   - handleReprogramar {Function}: Actualiza fecha y horario de una cita existente.
 *   - handleCheckIn {Function}: Transiciona la cita a PENDIENTE (recepción en sala).
 *   - handleDeshacerCheckIn {Function}: Revierte la cita a PROGRAMADA.
 *   - handleSubmit {Function}: Despacha el guardado (crear o actualizar) según isEditing.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  getCitas, createCita, updateCita,
  cancelarCita, cambiarEstado,
} from '../services/cita.service';
import { getPacientes } from '../services/paciente.service';
import { getOdontologos } from '../services/usuario.service';
import {
  normalizarFecha, formatDT,
  formatFechaHeader, formatHora, getEstadoConfig,
  sincronizarCitasVencidas,
} from '../utils/cita.utils';
import {
  alertSuccess, alertError,
  promptMotivoCancelacion, alertWarning,
} from '../utils/alert.utils';

// Re-exportación de funciones auxiliares para evitar importaciones duplicadas en vistas consumidoras
export { normalizarFecha, formatHora, formatFechaHeader, formatDT, getEstadoConfig, sincronizarCitasVencidas };

// Estructura base para el formulario de citas
const FORM_INICIAL = {
  idPaciente:     '',
  idOdontologo:   '',
  fechaCita:      '',
  horaInicioCita: '',
  horaFinCita:    '',
  estadoCita:     'PROGRAMADA',
};

export const useAgenda = (date) => {
  const [appointments, setAppointments] = useState([]);
  const [pacientes,    setPacientes]    = useState([]);
  const [odontologos,  setOdontologos]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [formData,     setFormData]     = useState(FORM_INICIAL);

  // Inicialización de datos al montar el componente
  useEffect(() => {
    fetchAll();
  }, []);

  /**
   * Carga concurrente de citas, pacientes y odontólogos para optimizar el tiempo de respuesta inicial.
   * Ejecuta inmediatamente la sincronización de citas pasadas no atendidas.
   */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [citas, pacs, odont] = await Promise.all([
        getCitas(), getPacientes(), getOdontologos(),
      ]);
      // Sincroniza citas cuya fecha expiró sin registrarse asistencia, actualizándolas a NO_ASISTIO
      const citasSync = await sincronizarCitasVencidas(citas ?? [], cambiarEstado);
      setAppointments(citasSync);
      setPacientes(pacs    ?? []);
      setOdontologos(odont ?? []);
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recarga exclusivamente el conjunto de citas para reflejar mutaciones en la agenda
   */
  const refetchCitas = async () => {
    try {
      const citas = await getCitas();
      const citasSync = await sincronizarCitasVencidas(citas ?? [], cambiarEstado);
      setAppointments(citasSync);
    } catch (err) {
      alertError(err.message);
    }
  };

  // Formateo de fecha de referencia en formato ISO estándar YYYY-MM-DD
  const fechaSeleccionada = date.toISOString().split('T')[0];

  // Filtro memoizado de citas correspondientes al día seleccionado en la vista
  const citasDelDia = useMemo(() =>
    appointments.filter(a => normalizarFecha(a.fechaCita) === fechaSeleccionada),
    [appointments, fechaSeleccionada],
  );

  // Mapa de agregación para visualización en calendarios mensuales o semanales
  const citasPorFecha = useMemo(() =>
    appointments.reduce((acc, a) => {
      const key = normalizarFecha(a.fechaCita);
      if (!key) return acc;
      acc[key] = [...(acc[key] ?? []), a];
      return acc;
    }, {}),
    [appointments],
  );

  /**
   * Prepara el estado del formulario para registrar una nueva cita en la fecha seleccionada
   */
  const prepararNuevaCita = () => {
    setIsEditing(false);
    setSelectedCita(null);
    setFormData({ ...FORM_INICIAL, fechaCita: fechaSeleccionada });
  };

  /**
   * Inicializa el formulario con los valores existentes de una cita seleccionada para edición
   */
  const prepararEditarCita = (cita) => {
    setIsEditing(true);
    setSelectedCita(cita);
    setFormData({
      idPaciente:     cita.idPaciente    ?? '',
      idOdontologo:   cita.idOdontologo  ?? '',
      fechaCita:      normalizarFecha(cita.fechaCita),
      horaInicioCita: formatDT(cita.horaInicioCita),
      horaFinCita:    formatDT(cita.horaFinCita),
      estadoCita:     cita.estadoCita    ?? 'PROGRAMADA',
    });
  };

  /**
   * Manejador genérico para mutaciones en campos controlados
   */
  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  /**
   * Orquesta la persistencia de una cita (creación o actualización)
   */
  const handleSubmit = async (onSuccess) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        idPaciente:   parseInt(formData.idPaciente, 10),
        idOdontologo: parseInt(formData.idOdontologo, 10),
      };
      if (isEditing) {
        await updateCita(selectedCita.idCitas, payload);
        alertSuccess('Cita actualizada', 'Los cambios fueron guardados correctamente.');
      } else {
        const data = await createCita(payload);
        alertSuccess('Cita registrada', `Cita para ${data?.nombreCompletoPaciente} registrada correctamente.`);
      }
      await refetchCitas();
      onSuccess?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Proceso de cancelación con captura modal obligatoria de justificación clínica o administrativa
   */
  const handleCancelar = async (cita) => {
    const motivo = await promptMotivoCancelacion(cita.nombreCompletoPaciente);
    if (!motivo) return; // Si el usuario cancela el diálogo modal
    setLoading(true);
    try {
      await cancelarCita(cita.idCitas, motivo);
      alertSuccess('Cita cancelada', 'La cita fue cancelada correctamente.');
      await refetchCitas();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reprograma una cita existente actualizando fechas y restableciendo su estado a PROGRAMADA
   */
  const handleReprogramar = async (idCita, reprogramData, onSuccess) => {
    const { fechaCita, horaInicioCita, horaFinCita } = reprogramData;
    if (!fechaCita || !horaInicioCita || !horaFinCita) {
      alertWarning('Completa fecha, hora inicio y hora fin.');
      return;
    }
    setLoading(true);
    try {
      await updateCita(idCita, {
        idPaciente:   selectedCita.idPaciente,
        idOdontologo: selectedCita.idOdontologo,
        estadoCita:   'PROGRAMADA',
        ...reprogramData,
      });
      alertSuccess('Cita reprogramada', 'La cita fue reprogramada correctamente.');
      await refetchCitas();
      onSuccess?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra el arribo físico del paciente a la clínica, pasando la cita al estado PENDIENTE
   */
  const handleCheckIn = async (cita) => {
    setLoading(true);
    try {
      await cambiarEstado(cita.idCitas, 'PENDIENTE');
      alertSuccess('Check-in registrado', `${cita.nombreCompletoPaciente} ha llegado y está en sala de espera.`);
      await refetchCitas();
    } catch (err) {
      alertError(err.message || 'Error al registrar check-in');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Revierte el check-in si fue ejecutado por equivocación, regresando al estado PROGRAMADA
   */
  const handleDeshacerCheckIn = async (cita) => {
    setLoading(true);
    try {
      await cambiarEstado(cita.idCitas, 'PROGRAMADA');
      alertSuccess('Check-in revertido', `La cita de ${cita.nombreCompletoPaciente} regresó al estado Programada.`);
      await refetchCitas();
    } catch (err) {
      alertError(err.message || 'Error al revertir check-in');
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments, loading,
    pacientes, odontologos,
    selectedCita, setSelectedCita,
    isEditing, formData,
    citasDelDia, citasPorFecha,
    handleChange,
    prepararNuevaCita,
    prepararEditarCita,
    handleCancelar,
    handleReprogramar,
    handleCheckIn,
    handleDeshacerCheckIn,
    handleSubmit,
  };
};

