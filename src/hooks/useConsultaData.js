/**
 * Propósito:
 * Hook orquestador del estado y ciclo de vida de la consulta odontológica activa.
 * Administra los datos clínicos de la cita, la ficha de evaluación (diagnóstico y observaciones),
 * y la lista de hallazgos del odontograma (planes de tratamiento). Controla las actualizaciones
 * optimistas de estado, la normalización de importes monetarios y la regla de negocio para
 * la finalización de la cita médica según los hallazgos ejecutados.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useConsultaData.js'. Hook principal de lógica de negocio dentro del
 * subsistema de atención clínica.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/ActiveConsultationPage.jsx'
 * - Consume:
 *   - 'src/services/cita.service.js' ('getCitaById', 'cambiarEstado')
 *   - 'src/services/consulta.service.js' ('getEvaluacionByCita', 'createEvaluacion', 'getHallazgos', 'updateEstadoHallazgo', 'deleteHallazgo')
 *   - 'src/utils/cita.utils.js' ('getPrecioHallazgo')
 *   - 'src/utils/alert.utils.js' ('alertSuccess', 'alertError', 'alertWarning', 'confirmDelete', 'toastSuccess')
 *
 * Parámetros y Retornos:
 * @param {string|number} citaId - Identificador único de la cita clínica en curso.
 * @returns {Object} Estado clínico de la consulta y manejadores de acción:
 *   - cita {Object|null}: Información integral de la cita médica activa.
 *   - setCita {Function}: Mutador del estado de la cita.
 *   - loading {boolean}: Estado de carga inicial de cita y evaluación.
 *   - evaluacion {Object|null}: Registro de evaluación clínica asociado a la cita.
 *   - diagnostico {string}: Texto descriptivo del diagnóstico clínico emitido.
 *   - setDiagnostico {Function}: Mutador del texto de diagnóstico.
 *   - observaciones {string}: Anotaciones o comentarios adicionales del profesional.
 *   - setObservaciones {Function}: Mutador del texto de observaciones.
 *   - savingEval {boolean}: Bandera indicadora de persistencia en progreso de la evaluación.
 *   - hallazgos {Array<Object>}: Lista de procedimientos/hallazgos registrados en el odontograma.
 *   - setHallazgos {Function}: Mutador manual de la lista de hallazgos.
 *   - fetchHallazgos {Function}: Función para recargar los hallazgos desde el backend.
 *   - handleGuardarEvaluacion {Function}: Registra la evaluación clínica en el servidor.
 *   - handleCambiarEstado {Function}: Modifica el estado de un hallazgo mediante actualización optimista.
 *   - handleEliminarHallazgo {Function}: Elimina un hallazgo tras confirmación modal del usuario.
 *   - handleFinalizarConsulta {Function}: Evalúa cumplimiento de tratamientos y finaliza la cita.
 */

import { useState, useEffect } from 'react';
import { getCitaById, cambiarEstado } from '../services/cita.service';
import {
  getEvaluacionByCita, createEvaluacion,
  getHallazgos, updateEstadoHallazgo, deleteHallazgo,
} from '../services/consulta.service';
import { alertSuccess, alertError, alertWarning, confirmDelete, toastSuccess } from '../utils/alert.utils';
import { getPrecioHallazgo } from '../utils/cita.utils';

export const useConsultaData = (citaId) => {
  const [cita,          setCita]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [evaluacion,    setEvaluacion]    = useState(null);
  const [diagnostico,   setDiagnostico]   = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [savingEval,    setSavingEval]    = useState(false);
  const [hallazgos,     setHallazgos]     = useState([]);

  // Carga inicial de datos de la cita y su evaluación clínica
  useEffect(() => {
    if (!citaId) return;
    loadCita();
  }, [citaId]);

  // Carga reactiva de los hallazgos asociados al confirmarse una evaluación clínica
  useEffect(() => {
    if (evaluacion?.idEvaluacionClinica) {
      fetchHallazgos(evaluacion.idEvaluacionClinica);
    }
  }, [evaluacion]);

  /**
   * Recupera la cita específica mediante consulta directa por ID para prevenir descargas masivas
   */
  const loadCita = async () => {
    setLoading(true);
    try {
      const data = await getCitaById(citaId);
      setCita(data);
      await loadEvaluacion();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Consulta si existe una evaluación clínica previa para precargar diagnóstico y observaciones
   */
  const loadEvaluacion = async () => {
    try {
      const data = await getEvaluacionByCita(citaId);
      if (data) {
        setEvaluacion(data);
        setDiagnostico(data.diagnostico     ?? '');
        setObservaciones(data.observaciones ?? '');
      }
    } catch (_) {
      // Estado normal cuando la consulta apenas inicia y aún no cuenta con evaluación creada
    }
  };

  /**
   * Obtiene y normaliza los precios de los hallazgos registrados para el odontograma
   */
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

  /**
   * Valida y persiste la evaluación clínica primaria, habilitando el acceso al odontograma
   */
  const handleGuardarEvaluacion = async (onSuccess) => {
    if (!diagnostico.trim()) {
      alertWarning('El diagnóstico es obligatorio.');
      return;
    }
    setSavingEval(true);
    try {
      const data = await createEvaluacion({
        idCita: parseInt(citaId, 10),
        diagnostico,
        observaciones,
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

  /**
   * Modifica el estado del plan de tratamiento usando una estrategia de actualización optimista
   * para proporcionar retroalimentación inmediata, revirtiendo en caso de fallo del servidor.
   */
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
      // Reversión del estado local al valor previo al producirse un fallo
      setHallazgos(prevHallazgos);
    }
  };

  /**
   * Solicita confirmación explícita y suprime un hallazgo clínico
   */
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

  /**
   * Finaliza la consulta médica. Aplica la regla de negocio que verifica si existieron tratamientos
   * completados durante la sesión para transicionar la cita global al estado 'FINALIZADA'.
   */
  const handleFinalizarConsulta = async (onSuccess) => {
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

