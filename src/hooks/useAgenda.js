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
} from '../utils/cita.utils';
import {
  alertSuccess, alertError,
  promptMotivoCancelacion, alertWarning,
} from '../utils/alert.utils';

// Re-exportar helpers para los componentes que los necesitan
export { normalizarFecha, formatHora, formatFechaHeader, formatDT, getEstadoConfig };

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
      setAppointments(citas ?? []);
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
      setAppointments(citas ?? []);
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
    handleSubmit,
  };
};
