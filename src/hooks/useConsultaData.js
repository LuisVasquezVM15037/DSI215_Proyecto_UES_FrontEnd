import { useState, useEffect } from 'react';
import { getCitaById, cambiarEstado } from '../services/cita.service';
import {
  getEvaluacionByCita, createEvaluacion,
  getHallazgos, updateEstadoHallazgo, deleteHallazgo,
  getTratamientosPendientesPaciente,
} from '../services/consulta.service';
import { alertSuccess, alertError, alertWarning, confirmDelete, toastSuccess } from '../utils/alert.utils';

/**
 * Hook principal de la consulta activa.
 * Gestiona: cita, evaluación clínica, hallazgos del odontograma y trazabilidad de tratamientos pendientes.
 */
export const useConsultaData = (citaId) => {
  const [cita,         setCita]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [evaluacion,   setEvaluacion]   = useState(null);
  const [diagnostico,  setDiagnostico]  = useState('');
  const [observaciones,setObservaciones]= useState('');
  const [savingEval,   setSavingEval]   = useState(false);
  const [hallazgos,    setHallazgos]    = useState([]);
  const [tratamientosPendientesPrevios, setTratamientosPendientesPrevios] = useState([]);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!citaId) return;
    loadCita();
  }, [citaId]);

  // Cuando hay evaluación, cargar sus hallazgos
  useEffect(() => {
    if (evaluacion?.idEvaluacionClinica) {
      fetchHallazgos(evaluacion.idEvaluacionClinica);
    }
  }, [evaluacion]);

  const loadCita = async () => {
    setLoading(true);
    try {
      const data = await getCitaById(citaId);
      setCita(data);
      if (data?.idPaciente) {
        try {
          const pendientes = await getTratamientosPendientesPaciente(data.idPaciente);
          setTratamientosPendientesPrevios(pendientes || []);
        } catch (_) {}
      }
      await loadEvaluacion();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluacion = async () => {
    try {
      const data = await getEvaluacionByCita(citaId);
      if (data) {
        setEvaluacion(data);
        setDiagnostico(data.diagnostico   ?? '');
        setObservaciones(data.observaciones ?? '');
      }
    } catch (_) {
      // Normal que no exista aún — silencioso
    }
  };

  const fetchHallazgos = async (idEvaluacion) => {
    try {
      const data = await getHallazgos(idEvaluacion);
      setHallazgos(data ?? []);
    } catch (_) {}
  };

  // ── Guardar evaluación ────────────────────────────────────────────────────
  const handleGuardarEvaluacion = async (onSuccess) => {
    if (!diagnostico.trim()) {
      alertWarning('El diagnóstico es obligatorio.');
      return;
    }
    setSavingEval(true);
    try {
      const payload = {
        idCita:             parseInt(citaId),
        idCitas:            parseInt(citaId),
        diagnostico:        diagnostico.trim(),
        observaciones:      observaciones.trim() || undefined,
        motivoConsulta:     cita?.motivoCita || undefined,
        temperatura:        cita?.signosVitales?.temperatura,
        presionArterial:    cita?.signosVitales?.presionArterial,
        frecuenciaCardiaca: cita?.signosVitales?.frecuenciaCardiaca,
      };

      const guardada = await createEvaluacion(payload);
      setEvaluacion(guardada);
      toastSuccess('Diagnóstico guardado correctamente');
      onSuccess?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setSavingEval(false);
    }
  };

  // ── Cambiar estado de un hallazgo ──────────────────────────────────────────
  const handleCambiarEstado = async (idPlan, nuevoEstado) => {
    try {
      await updateEstadoHallazgo(idPlan, nuevoEstado);
      setHallazgos(prev =>
        prev.map(h => h.idPlanTratamiento === idPlan ? { ...h, estadoPlan: nuevoEstado } : h)
      );
      toastSuccess('Estado actualizado');
    } catch (err) {
      alertError(err.message);
    }
  };

  // ── Eliminar un hallazgo ───────────────────────────────────────────────────
  const handleEliminarHallazgo = async (idPlan) => {
    const confirmed = await confirmDelete('este hallazgo');
    if (!confirmed) return;
    try {
      await deleteHallazgo(idPlan);
      setHallazgos(prev => prev.filter(h => h.idPlanTratamiento !== idPlan));
      toastSuccess('Hallazgo eliminado');
    } catch (err) {
      alertError(err.message);
    }
  };

  // ── Finalizar consulta completa (Paso 4) ───────────────────────────────────
  const handleFinalizarConsulta = async (onSuccess) => {
    try {
      await cambiarEstado(citaId, 'COMPLETADA');
      setCita(prev => ({ ...prev, estadoCita: 'COMPLETADA' }));
      toastSuccess('Consulta y cita finalizadas');
    } catch (err) {
      console.error('No se pudo cambiar el estado de la cita:', err.message);
      alertError('Aviso: ' + (err.message || 'No se pudo actualizar el estado de la cita.'));
    } finally {
      onSuccess?.();
    }
  };

  return {
    cita, setCita, loading,
    evaluacion,
    diagnostico, setDiagnostico,
    observaciones, setObservaciones,
    savingEval,
    hallazgos, setHallazgos,
    tratamientosPendientesPrevios,
    fetchHallazgos,
    handleGuardarEvaluacion,
    handleCambiarEstado,
    handleEliminarHallazgo,
    handleFinalizarConsulta,
  };
};
