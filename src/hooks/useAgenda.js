/**
 * Propósito:
 * Hook de gestión integral de la agenda clínica y calendario de citas odontológicas.
 * Administra las consultas de citas, pacientes y odontólogos mediante la caché de TanStack Query
 * ('useQuery' e invalidación con 'useQueryClient'), ejecuta la regla de sincronización automática
 * de citas vencidas (cambio a NO_ASISTIO), deriva colecciones memoizadas por fecha y provee
 * operaciones transaccionales para crear, actualizar, cancelar con justificación, reprogramar
 * y registrar check-in en sala de espera sincronizando la caché automáticamente.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useAgenda.js'. Hook de lógica de negocio dentro de la capa de hooks
 * personalizados del módulo de agenda.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/AppointmentPage.jsx'
 * - Consume:
 *   - '@tanstack/react-query' ('useQuery', 'useQueryClient')
 *   - 'src/services/cita.service.js' ('getCitas', 'createCita', 'updateCita', 'cancelarCita', 'cambiarEstado')
 *   - 'src/services/paciente.service.js' ('getPacientes')
 *   - 'src/services/usuario.service.js' ('getOdontologos')
 *   - 'src/utils/cita.utils.js' ('normalizarFecha', 'formatDT', 'formatFechaHeader', 'formatHora', 'getEstadoConfig', 'sincronizarCitasVencidas')
 *   - 'src/utils/alert.utils.js' ('alertSuccess', 'alertError', 'alertWarning', 'promptMotivoCancelacion')
 *
 * Parámetros y Retornos:
 * @param {Date} date - Instancia de objeto Date que representa el día seleccionado en el calendario interactivo.
 * @returns {Object} Estado de la agenda y métodos de interacción transaccional:
 *   - appointments {Array<Object>}: Lista global de citas médicas sincronizadas en caché.
 *   - loading {boolean}: Estado de procesamiento asíncrono o mutación activa en red.
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
 *   - handleCancelar {Function}: Solicita motivo, cancela la cita e invalida caché.
 *   - handleReprogramar {Function}: Actualiza fecha y horario de una cita existente e invalida caché.
 *   - handleCheckIn {Function}: Transiciona la cita a PENDIENTE (recepción en sala) e invalida caché.
 *   - handleDeshacerCheckIn {Function}: Revierte la cita a PROGRAMADA e invalida caché.
 *   - handleSubmit {Function}: Despacha el guardado (crear o actualizar) sincronizando la caché.
 */

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const [selectedCita, setSelectedCita] = useState(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [formData,     setFormData]     = useState(FORM_INICIAL);
  const [mutating,     setMutating]     = useState(false);

  // Consulta administrada de citas médicas sincronizadas con detección de inasistencias
  const { data: appointments = [], isLoading: loadingCitas } = useQuery({
    queryKey: ['citas'],
    queryFn: async () => {
      const data = await getCitas();
      return sincronizarCitasVencidas(data ?? [], cambiarEstado);
    },
  });

  // Consulta en caché del catálogo de pacientes
  const { data: pacientes = [], isLoading: loadingPacientes } = useQuery({
    queryKey: ['pacientes'],
    queryFn: getPacientes,
  });

  // Consulta en caché del catálogo de profesionales odontólogos
  const { data: odontologos = [], isLoading: loadingOdontologos } = useQuery({
    queryKey: ['odontologos'],
    queryFn: getOdontologos,
  });

  // El indicador de carga global refleja peticiones iniciales o mutaciones activas
  const loading = loadingCitas || loadingPacientes || loadingOdontologos || mutating;

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
   * Orquesta la persistencia de una cita (creación o actualización) e invalida la caché
   */
  const handleSubmit = async (onSuccess) => {
    setMutating(true);
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
      // Invalida la clave ['citas'] para forzar revalidación automática en toda la app
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
      onSuccess?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  /**
   * Proceso de cancelación con captura modal obligatoria e invalidación de caché
   */
  const handleCancelar = async (cita) => {
    const motivo = await promptMotivoCancelacion(cita.nombreCompletoPaciente);
    if (!motivo) return; // Si el usuario cancela el diálogo modal
    setMutating(true);
    try {
      await cancelarCita(cita.idCitas, motivo);
      alertSuccess('Cita cancelada', 'La cita fue cancelada correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  /**
   * Reprograma una cita existente actualizando fechas y sincronizando la caché
   */
  const handleReprogramar = async (idCita, reprogramData, onSuccess) => {
    const { fechaCita, horaInicioCita, horaFinCita } = reprogramData;
    if (!fechaCita || !horaInicioCita || !horaFinCita) {
      alertWarning('Completa fecha, hora inicio y hora fin.');
      return;
    }
    setMutating(true);
    try {
      await updateCita(idCita, {
        idPaciente:   selectedCita.idPaciente,
        idOdontologo: selectedCita.idOdontologo,
        estadoCita:   'PROGRAMADA',
        ...reprogramData,
      });
      alertSuccess('Cita reprogramada', 'La cita fue reprogramada correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
      onSuccess?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  /**
   * Registra el arribo físico del paciente a la clínica, pasando la cita al estado PENDIENTE
   */
  const handleCheckIn = async (cita) => {
    setMutating(true);
    try {
      await cambiarEstado(cita.idCitas, 'PENDIENTE');
      alertSuccess('Check-in registrado', `${cita.nombreCompletoPaciente} ha llegado y está en sala de espera.`);
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message || 'Error al registrar check-in');
    } finally {
      setMutating(false);
    }
  };

  /**
   * Revierte el check-in si fue ejecutado por equivocación, regresando al estado PROGRAMADA
   */
  const handleDeshacerCheckIn = async (cita) => {
    setMutating(true);
    try {
      await cambiarEstado(cita.idCitas, 'PROGRAMADA');
      alertSuccess('Check-in revertido', `La cita de ${cita.nombreCompletoPaciente} regresó al estado Programada.`);
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message || 'Error al revertir check-in');
    } finally {
      setMutating(false);
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

