import { useState, useEffect, useCallback } from 'react';
import {
  getPacientes, buscarPacientes,
  createPaciente, updatePaciente, deletePaciente,
} from '../services/paciente.service';
import { normalizarFechaNacimiento } from '../utils/cita.utils';
import { alertSuccess, alertError, confirmDelete } from '../utils/alert.utils';
import { useDebounce } from './useDebounce';

const FORM_INICIAL = {
  nombrePaciente:          '',
  apellidoPaciente:        '',
  numeroIdentidadPaciente: '',
  telefonoPaciente:        '',
  fechaNacimientoPaciente: '',
  emailPaciente:           '',
  contactoEmergencia:      '',
  alergias:                '',
};

/**
 * Hook del módulo de gestión de pacientes.
 * FIX BUG-03: debounce + AbortController para búsqueda sin race condition.
 * FIX BUG-04: se eliminó navigate no usado.
 * FIX BUG-06: padding de fecha con padStart, no regex.
 */
export const usePatientManagement = () => {
  const [patients,   setPatients]   = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [loading,    setLoading]    = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 350);

  // FIX BUG-03: un solo useEffect reactivo al término debounceado
  const loadPatients = useCallback(async (term, signal) => {
    setLoading(true);
    try {
      const data = term
        ? await buscarPacientes(term)
        : await getPacientes();
      if (!signal?.aborted) setPatients(data ?? []);
    } catch (err) {
      if (!signal?.aborted) alertError(err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPatients(debouncedSearch.trim(), controller.signal);
    return () => controller.abort();
  }, [debouncedSearch, loadPatients]);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSelect = (patient) => {
    setSelectedId(patient.idPaciente);
    setFormData({
      nombrePaciente:          patient.nombrePaciente,
      apellidoPaciente:        patient.apellidoPaciente,
      numeroIdentidadPaciente: patient.numeroIdentidadPaciente,
      telefonoPaciente:        patient.telefonoPaciente        ?? '',
      // FIX BUG-06: usar padStart en lugar de regex frágil
      fechaNacimientoPaciente: normalizarFechaNacimiento(patient.fechaNacimientoPaciente),
      emailPaciente:           patient.emailPaciente           ?? '',
      contactoEmergencia:      patient.contactoEmergencia      ?? '',
      alergias:                patient.alergias                ?? '',
    });
  };

  const handleCancel = () => {
    setSelectedId(null);
    setFormData(FORM_INICIAL);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = await createPaciente(formData);
      alertSuccess('Paciente registrado', `${data.nombrePaciente} ${data.apellidoPaciente} fue registrado correctamente.`);
      await loadPatients(debouncedSearch);
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updatePaciente(selectedId, formData);
      alertSuccess('Expediente actualizado', 'Los cambios fueron guardados correctamente.');
      await loadPatients(debouncedSearch);
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmDelete(
      `${formData.nombrePaciente} ${formData.apellidoPaciente}`,
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await deletePaciente(selectedId);
      alertSuccess('Eliminado', 'El expediente fue eliminado correctamente.');
      await loadPatients(debouncedSearch);
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = selectedId !== null;
  const handleSubmit = () => isEditing ? handleUpdate() : handleCreate();

  return {
    patients, selectedId, formData, loading, isEditing,
    searchTerm, setSearchTerm,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  };
};
