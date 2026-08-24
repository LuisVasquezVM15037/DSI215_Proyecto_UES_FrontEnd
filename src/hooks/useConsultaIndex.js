import { useState, useEffect, useMemo } from 'react';
import { getCitas } from '../services/cita.service';
import { getPacientes } from '../services/paciente.service';
import { normalizarFecha, getHoyLocal } from '../utils/cita.utils';
import { alertError } from '../utils/alert.utils';
import { ESTADOS_INICIABLES } from '../constants/estados.constants';

/**
 * Hook del módulo de consultas.
 * Carga las citas de hoy, permite buscar historial de pacientes.
 */
export const useConsultaIndex = () => {
  const [citas,     setCitas]    = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading,   setLoading]  = useState(true);

  // Historial
  const [searchTerm,           setSearchTerm]           = useState('');
  const [showHistorial,        setShowHistorial]        = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [citasPaciente,        setCitasPaciente]        = useState([]);

  // FIX BUG-05: memoizar 'hoy' para que no cambie en cada render
  const hoy = useMemo(() => getHoyLocal(), []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [todasCitas, todosPacientes] = await Promise.all([
          getCitas(), getPacientes(),
        ]);
        setCitas(todasCitas       ?? []);
        setPacientes(todosPacientes ?? []);
      } catch (err) {
        alertError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // ── Datos derivados ────────────────────────────────────────────────────────
  const citasDeHoy = useMemo(() =>
    citas.filter(c => normalizarFecha(c.fechaCita) === hoy),
    [citas, hoy],
  );

  const stats = useMemo(() => ({
    total:       citasDeHoy.length,
    pendientes:  citasDeHoy.filter(c => ESTADOS_INICIABLES.includes(c.estadoCita)).length,
    completadas: citasDeHoy.filter(c => ['COMPLETADA','FINALIZADA'].includes(c.estadoCita)).length,
    noAsistieron:citasDeHoy.filter(c => c.estadoCita === 'NO_ASISTIO').length,
  }), [citasDeHoy]);

  const pacientesFiltrados = useMemo(() => {
    const term = searchTerm.trim();
    if (term.length < 2) return [];
    const lower = term.toLowerCase();
    return pacientes.filter(p =>
      `${p.nombrePaciente} ${p.apellidoPaciente}`.toLowerCase().includes(lower) ||
      p.numeroIdentidadPaciente?.includes(term)
    );
  }, [searchTerm, pacientes]);

  // ── Historial ─────────────────────────────────────────────────────────────
  const handleBuscarHistorial = (paciente) => {
    setPacienteSeleccionado(paciente);
    setCitasPaciente(citas.filter(c => c.idPaciente === paciente.idPaciente));
    setShowHistorial(true);
    setSearchTerm('');
  };

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
  };
};
