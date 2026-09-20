/**
 * Propósito:
 * Hook gestor del índice y sala de recepción de consultas médicas.
 * Coordina la consulta y sincronización de citas y pacientes mediante la caché global
 * de TanStack Query ('useQuery' e invalidación con 'useQueryClient'), la sincronización
 * automática de citas vencidas, la segmentación de citas del día según la zona horaria local,
 * el cálculo de métricas de atención en tiempo real (en espera, programadas, completadas, ausencias),
 * el control de flujo de check-in de pacientes y la búsqueda histórica de expedientes de citas previas.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useConsultaIndex.js'. Hook de lógica de presentación y negocio en
 * la capa de hooks de atención médica.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/ConsultaIndexPage.jsx'
 * - Consume:
 *   - '@tanstack/react-query' ('useQuery', 'useQueryClient')
 *   - 'src/services/cita.service.js' ('getCitas', 'cambiarEstado')
 *   - 'src/services/paciente.service.js' ('getPacientes')
 *   - 'src/utils/cita.utils.js' ('normalizarFecha', 'getHoyLocal', 'sincronizarCitasVencidas')
 *   - 'src/utils/alert.utils.js' ('alertError', 'alertSuccess')
 *   - 'src/constants/estados.constants.js' ('ESTADOS_INICIABLES')
 *
 * Parámetros y Retornos:
 * @returns {Object} Estado del módulo de recepción de consultas y operaciones disponibles:
 *   - citasDeHoy {Array<Object>}: Citas médicas programadas para la fecha local en curso.
 *   - loading {boolean}: Estado de carga inicial o refresco de datos en caché.
 *   - stats {Object}: Indicadores numéricos agregados (total, enEspera, programadas, pendientes, completadas, noAsistieron).
 *   - searchTerm {string}: Término de búsqueda para filtrar expedientes de pacientes.
 *   - setSearchTerm {Function}: Mutador del término de búsqueda.
 *   - pacientesFiltrados {Array<Object>}: Lista de pacientes coincidentes con el término de búsqueda.
 *   - showHistorial {boolean}: Bandera que controla la visibilidad del modal de historial clínico.
 *   - handleCerrarHistorial {Function}: Cierra el visor de historial y resetea el paciente seleccionado.
 *   - pacienteSeleccionado {Object|null}: Paciente cuyo historial se está inspeccionando.
 *   - citasPaciente {Array<Object>}: Citas históricas del paciente seleccionado.
 *   - handleBuscarHistorial {Function}: Carga el historial de citas asociadas a un paciente.
 *   - handleCheckIn {Function}: Cambia el estado de una cita a PENDIENTE (recepcionado) e invalida caché.
 *   - handleDeshacerCheckIn {Function}: Regresa la cita al estado PROGRAMADA e invalida caché.
 *   - refetchCitas {Function}: Revalida el conjunto de citas mediante el cliente de TanStack Query.
 */

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCitas, cambiarEstado } from '../services/cita.service';
import { getPacientes } from '../services/paciente.service';
import { normalizarFecha, getHoyLocal, sincronizarCitasVencidas } from '../utils/cita.utils';
import { alertError, alertSuccess } from '../utils/alert.utils';
import { ESTADOS_INICIABLES } from '../constants/estados.constants';

export const useConsultaIndex = () => {
  const queryClient = useQueryClient();

  // Estados locales para la funcionalidad de búsqueda de historial de pacientes
  const [searchTerm,           setSearchTerm]           = useState('');
  const [showHistorial,        setShowHistorial]        = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [citasPaciente,        setCitasPaciente]        = useState([]);
  const [mutating,             setMutating]             = useState(false);

  // Memoización de la fecha local para evitar recálculos en renders sucesivos y prevenir desfases UTC
  const hoy = useMemo(() => getHoyLocal(), []);

  // Consulta administrada de citas médicas sincronizadas
  const { data: citas = [], isLoading: loadingCitas } = useQuery({
    queryKey: ['citas'],
    queryFn: async () => {
      const todasCitas = await getCitas();
      return sincronizarCitasVencidas(todasCitas ?? [], cambiarEstado);
    },
  });

  // Consulta en caché del catálogo de pacientes
  const { data: pacientes = [], isLoading: loadingPacientes } = useQuery({
    queryKey: ['pacientes'],
    queryFn: getPacientes,
  });

  const loading = loadingCitas || loadingPacientes || mutating;

  /**
   * Refresco selectivo de citas forzando la invalidación de la clave ['citas']
   */
  const refetchCitas = async () => {
    await queryClient.invalidateQueries({ queryKey: ['citas'] });
  };

  /**
   * Recepción del paciente en clínica: transiciona la cita al estado PENDIENTE e invalida caché
   */
  const handleCheckIn = async (cita) => {
    setMutating(true);
    try {
      await cambiarEstado(cita.idCitas, 'PENDIENTE');
      alertSuccess('Check-in registrado', `${cita.nombreCompletoPaciente} está en sala de espera.`);
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message || 'Error al registrar check-in');
    } finally {
      setMutating(false);
    }
  };

  /**
   * Reversión del check-in: regresa la cita al estado PROGRAMADA e invalida caché
   */
  const handleDeshacerCheckIn = async (cita) => {
    setMutating(true);
    try {
      await cambiarEstado(cita.idCitas, 'PROGRAMADA');
      alertSuccess('Check-in cancelado', `La cita de ${cita.nombreCompletoPaciente} regresó a Programada.`);
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message || 'Error al revertir check-in');
    } finally {
      setMutating(false);
    }
  };

  // Filtrado de citas programadas para el día actual
  const citasDeHoy = useMemo(() =>
    citas.filter(c => normalizarFecha(c.fechaCita) === hoy),
    [citas, hoy],
  );

  // Cálculo de indicadores estadísticos en tiempo de renderizado
  const stats = useMemo(() => ({
    total:        citasDeHoy.length,
    enEspera:     citasDeHoy.filter(c => c.estadoCita === 'PENDIENTE').length,
    programadas:  citasDeHoy.filter(c => c.estadoCita === 'PROGRAMADA').length,
    pendientes:   citasDeHoy.filter(c => ESTADOS_INICIABLES.includes(c.estadoCita)).length,
    completadas:  citasDeHoy.filter(c => ['COMPLETADA', 'FINALIZADA'].includes(c.estadoCita)).length,
    noAsistieron: citasDeHoy.filter(c => c.estadoCita === 'NO_ASISTIO').length,
  }), [citasDeHoy]);

  // Filtrado reactivo de pacientes por coincidencia en nombre o documento de identidad
  const pacientesFiltrados = useMemo(() => {
    const term = searchTerm.trim();
    if (term.length < 2) return [];
    const lower = term.toLowerCase();
    return pacientes.filter(p =>
      `${p.nombrePaciente} ${p.apellidoPaciente}`.toLowerCase().includes(lower) ||
      p.numeroIdentidadPaciente?.includes(term)
    );
  }, [searchTerm, pacientes]);

  /**
   * Abre la visualización del historial médico para un paciente en particular
   */
  const handleBuscarHistorial = (paciente) => {
    setPacienteSeleccionado(paciente);
    setCitasPaciente(citas.filter(c => c.idPaciente === paciente.idPaciente));
    setShowHistorial(true);
    setSearchTerm('');
  };

  /**
   * Cierra el visor modal de historial clínico
   */
  const handleCerrarHistorial = () => {
    setShowHistorial(false);
    setPacienteSeleccionado(null);
    setCitasPaciente([]);
  };

  return {
    citasDeHoy, loading, stats,
    searchTerm, setSearchTerm,
    pacientesFiltrados,
    showHistorial, handleCerrarHistorial,
    pacienteSeleccionado, citasPaciente,
    handleBuscarHistorial,
    handleCheckIn,
    handleDeshacerCheckIn,
    refetchCitas,
  };
};

