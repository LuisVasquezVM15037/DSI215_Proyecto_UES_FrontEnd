import { useState, useEffect } from 'react';
import { getCitaById, cambiarEstado } from '../services/cita.service';
import {
  getEvaluacionByCita, createEvaluacion,
  getHallazgos, updateEstadoHallazgo, deleteHallazgo,
} from '../services/consulta.service';
import { alertSuccess, alertError, alertWarning, confirmDelete, toastSuccess } from '../utils/alert.utils';

import { getPrecioHallazgo } from '../utils/cita.utils';

/**
 * Hook principal de la consulta activa.
 * Gestiona: cita, evaluación clínica y hallazgos del odontograma.
 */
export const useConsultaData = (citaId) => {
  const [cita,         setCita]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [evaluacion,   setEvaluacion]   = useState(null);
  const [diagnostico,  setDiagnostico]  = useState('');
  const [observaciones,setObservaciones]= useState('');
  const [savingEval,   setSavingEval]   = useState(false);
  const [hallazgos,    setHallazgos]    = useState([]);

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
      // FIX BUG-09: pedir solo la cita por ID, no todas
      const data = await getCitaById(citaId);
      setCita(data);
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
      const normalizados = (data ?? []).map(h => ({
        ...h,
        precioFloat: getPrecioHallazgo(h),
        costoTratamiento: getPrecioHallazgo(h),
      }));
      setHallazgos(normalizados);
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
      const data = await createEvaluacion({
        idCita: parseInt(citaId), diagnostico, observaciones,
      });
      setEvaluacion(data);
      alertSuccess('Evaluación guardada', 'Puedes continuar al odontograma.', 1800);
      onSuccess?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setSavingEval(false);
    }
  };

  // ── Cambiar estado de hallazgo (optimistic update) ────────────────────────
  const handleCambiarEstado = async (idPlan, nuevoEstado) => {
    const prevHallazgos = hallazgos;
    setHallazgos(prev =>
      prev.map(h => h.idPlanTratamiento === idPlan ? { ...h, estadoPlan: nuevoEstado } : h)
    );
    try {
      await updateEstadoHallazgo(idPlan, nuevoEstado);
      toastSuccess('Estado actualizado');
    } catch (err) {
      alertError(err.message);
      setHallazgos(prevHallazgos); // Revertir
    }
  };

  // ── Eliminar hallazgo ─────────────────────────────────────────────────────
  const handleEliminarHallazgo = async (idPlan) => {
    const confirmed = await confirmDelete('este hallazgo');
    if (!confirmed) return;
    try {
      await deleteHallazgo(idPlan);
      setHallazgos(prev => prev.filter(h => h.idPlanTratamiento !== idPlan));
    } catch (err) {
      alertError(err.message);
    }
  };

  // ── Finalizar consulta ────────────────────────────────────────────────────
  const handleFinalizarConsulta = async (onSuccess) => {
    // Regla de negocio: si se realizó al menos un hallazgo, la consulta pasa a FINALIZADA
    const tieneRealizados = (hallazgos ?? []).some(h => {
      const st = String(h.estadoPlan || '').toUpperCase();
      return st === 'COMPLETADO' || st === 'FINALIZADO';
    });

    if (tieneRealizados) {
      try {
        await cambiarEstado(citaId, 'FINALIZADA');
        setCita(prev => ({ ...prev, estadoCita: 'FINALIZADA' }));
      } catch (err) {
        console.error('No se pudo cambiar el estado de la cita a FINALIZADA:', err.message);
      }
    }

    onSuccess?.();
  };

  return {
    cita, setCita, loading,
    evaluacion,
    diagnostico, setDiagnostico,
    observaciones, setObservaciones,
    savingEval,
    hallazgos, setHallazgos,
    fetchHallazgos,
    handleGuardarEvaluacion,
    handleCambiarEstado,
    handleEliminarHallazgo,
    handleFinalizarConsulta,
  };
};
