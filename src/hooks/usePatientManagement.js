/**
 * Propósito:
 * Hook de gestión del catálogo y expedientes clínicos de pacientes.
 * Centraliza las operaciones CRUD (creación, edición, consulta y eliminación)
 * mediante TanStack Query ('useQuery' e invalidación con 'useQueryClient'),
 * implementa búsqueda indexada por clave de caché ['pacientes', debouncedSearch]
 * con cancelación nativa por AbortSignal, normalización de fechas de nacimiento
 * y validación de borrado mediante cuadros de diálogo confirmatorios.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/usePatientManagement.js'. Hook de lógica de negocio dentro de la
 * capa de hooks para la administración de pacientes.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/PatientManagementPage.jsx'
 * - Consume:
 *   - '@tanstack/react-query' ('useQuery', 'useQueryClient')
 *   - 'src/services/paciente.service.js' ('getPacientes', 'buscarPacientes', 'createPaciente', 'updatePaciente', 'deletePaciente')
 *   - 'src/utils/cita.utils.js' ('normalizarFechaNacimiento')
 *   - 'src/utils/alert.utils.js' ('alertSuccess', 'alertError', 'confirmDelete')
 *   - 'src/hooks/useDebounce.js' ('useDebounce')
 *
 * Parámetros y Retornos:
 * @returns {Object} Estado del módulo de pacientes y métodos transaccionales:
 *   - patients {Array<Object>}: Lista de registros de pacientes recuperados de caché.
 *   - selectedId {number|null}: ID del paciente en edición (null si se crea uno nuevo).
 *   - formData {Object}: Estado controlado del formulario de expediente del paciente.
 *   - loading {boolean}: Indicador de petición de red o mutación activa.
 *   - isEditing {boolean}: Bandera binaria indicadora de si se encuentra en modo edición.
 *   - searchTerm {string}: Criterio textual actual en la barra de búsqueda.
 *   - setSearchTerm {Function}: Mutador del término de búsqueda.
 *   - handleSelect {Function}: Carga los datos de un paciente seleccionado en el formulario.
 *   - handleChange {Function}: Manejador de cambio de campos en los inputs del formulario.
 *   - handleSubmit {Function}: Despacha creación o actualización según 'isEditing'.
 *   - handleCancel {Function}: Limpia el formulario y restablece el modo creación.
 *   - handleDelete {Function}: Ejecuta la eliminación tras confirmación explícita del usuario.
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPacientes, buscarPacientes,
  createPaciente, updatePaciente, deletePaciente,
} from '../services/paciente.service';
import { normalizarFechaNacimiento } from '../utils/cita.utils';
import { alertSuccess, alertError, confirmDelete } from '../utils/alert.utils';
import { useDebounce } from './useDebounce';

// Estructura limpia de partida para registrar o reiniciar el formulario de pacientes
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

export const usePatientManagement = () => {
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState(null);
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [mutating,   setMutating]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estabilización del término de búsqueda (350ms) para amortiguar consultas en el backend
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Consulta administrada con caché parametrizada por término de búsqueda y soporte de AbortSignal
  const { data: patients = [], isLoading: loadingQuery } = useQuery({
    queryKey: ['pacientes', debouncedSearch.trim()],
    queryFn: async ({ signal }) => {
      const term = debouncedSearch.trim();
      return term ? buscarPacientes(term, { signal }) : getPacientes({ signal });
    },
  });

  const loading = loadingQuery || mutating;

  /**
   * Manejador de cambios reactivo para inputs del formulario
   */
  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  /**
   * Prepara el formulario para editar los datos de un paciente seleccionado
   */
  const handleSelect = (patient) => {
    setSelectedId(patient.idPaciente);
    setFormData({
      nombrePaciente:          patient.nombrePaciente,
      apellidoPaciente:        patient.apellidoPaciente,
      numeroIdentidadPaciente: patient.numeroIdentidadPaciente,
      telefonoPaciente:        patient.telefonoPaciente        ?? '',
      // Normalización robusta de la fecha a formato ISO YYYY-MM-DD para el input tipo date
      fechaNacimientoPaciente: normalizarFechaNacimiento(patient.fechaNacimientoPaciente),
      emailPaciente:           patient.emailPaciente           ?? '',
      contactoEmergencia:      patient.contactoEmergencia      ?? '',
      alergias:                patient.alergias                ?? '',
    });
  };

  /**
   * Cancela la edición y reinicia los campos al estado base
   */
  const handleCancel = () => {
    setSelectedId(null);
    setFormData(FORM_INICIAL);
  };

  /**
   * Registra un nuevo paciente en la base de datos e invalida la caché
   */
  const handleCreate = async (overrideData) => {
    setMutating(true);
    try {
      const dataToSave = overrideData || formData;
      const data = await createPaciente(dataToSave);
      alertSuccess('Paciente registrado', `${data.nombrePaciente} ${data.apellidoPaciente} fue registrado correctamente.`);
      await queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  /**
   * Actualiza los datos de un paciente existente e invalida la caché
   */
  const handleUpdate = async (overrideData) => {
    setMutating(true);
    try {
      const dataToSave = overrideData || formData;
      await updatePaciente(selectedId, dataToSave);
      alertSuccess('Expediente actualizado', 'Los cambios fueron guardados correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  /**
   * Elimina un expediente previa confirmación por diálogo modal e invalida la caché
   */
  const handleDelete = async () => {
    const confirmed = await confirmDelete(
      `${formData.nombrePaciente} ${formData.apellidoPaciente}`,
    );
    if (!confirmed) return;
    setMutating(true);
    try {
      await deletePaciente(selectedId);
      alertSuccess('Eliminado', 'El expediente fue eliminado correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const isEditing = selectedId !== null;
  const handleSubmit = (overrideData) => isEditing ? handleUpdate(overrideData) : handleCreate(overrideData);

  return {
    patients, selectedId, formData, loading, isEditing,
    searchTerm, setSearchTerm,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  };
};

