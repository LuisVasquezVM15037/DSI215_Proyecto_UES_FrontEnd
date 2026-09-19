// Hook useAgenda: estado + CRUD de citas, pacientes y odontólogos
// aca se importan los servicios y utils necesarios para manejar la agenda de citas, incluyendo funciones para obtener, crear, actualizar y cancelar citas,
// así como para manejar pacientes y odontólogos. También se definen constantes y funciones auxiliares para formatear fechas y horas, y para mostrar alertas al usuario. 
// El hook devuelve un objeto con el estado de la agenda y las funciones necesarias para interactuar con ella desde los componentes que lo utilicen.

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

// Re-exportar helpers para los componentes que los necesitan
export { normalizarFecha, formatHora, formatFechaHeader, formatDT, getEstadoConfig, sincronizarCitasVencidas };

const FORM_INICIAL = {
  idPaciente:     '',
  idOdontologo:   '',
  fechaCita:      '',
  horaInicioCita: '',
  horaFinCita:    '',
  estadoCita:     'PROGRAMADA',
};

/**
 * Hook de agenda: estado + CRUD de citas, pacientes y odontólogos.
 * @param {Date} date - Fecha seleccionada en el calendario
 */
export const useAgenda = (date) => {
  const [appointments, setAppointments] = useState([]);
  const [pacientes,    setPacientes]    = useState([]);
  const [odontologos,  setOdontologos]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [formData,     setFormData]     = useState(FORM_INICIAL);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [citas, pacs, odont] = await Promise.all([
        getCitas(), getPacientes(), getOdontologos(),
      ]);
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

  const refetchCitas = async () => {
    try {
      const citas = await getCitas();
      const citasSync = await sincronizarCitasVencidas(citas ?? [], cambiarEstado);
      setAppointments(citasSync);
    } catch (err) {
      alertError(err.message);
    }
  };

  // ── Datos derivados (memoizados) ───────────────────────────────────────────
  const fechaSeleccionada = date.toISOString().split('T')[0];

  const citasDelDia = useMemo(() =>
    appointments.filter(a => normalizarFecha(a.fechaCita) === fechaSeleccionada),
    [appointments, fechaSeleccionada],
  );

  const citasPorFecha = useMemo(() =>
    appointments.reduce((acc, a) => {
      const key = normalizarFecha(a.fechaCita);
      if (!key) return acc;
      acc[key] = [...(acc[key] ?? []), a];
      return acc;
    }, {}),
    [appointments],
  );

  // ── Preparacion de formulario ────────────────────────────────────────────────────
  const prepararNuevaCita = () => {
    setIsEditing(false);
    setSelectedCita(null);
    setFormData({ ...FORM_INICIAL, fechaCita: fechaSeleccionada });
  };

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

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (onSuccess) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        idPaciente:   parseInt(formData.idPaciente),
        idOdontologo: parseInt(formData.idOdontologo),
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

  const handleCancelar = async (cita) => {
    const motivo = await promptMotivoCancelacion(cita.nombreCompletoPaciente);
    if (!motivo) return;
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
