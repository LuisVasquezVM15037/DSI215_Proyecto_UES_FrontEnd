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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCitaById, cambiarEstado } from '../services/cita.service';
import {
  getEvaluacionByCita, createEvaluacion,
  getHallazgos, updateEstadoHallazgo, deleteHallazgo,
} from '../services/consulta.service';
import { alertSuccess, alertError, alertWarning, confirmDelete, toastSuccess } from '../utils/alert.utils';
import { getPrecioHallazgo } from '../utils/cita.utils';

export const useConsultaData = (citaId) => {
  const queryClient = useQueryClient();

  // Estado local para captura interactiva de formulario clínico
  const [diagnostico,   setDiagnostico]   = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Consulta reactiva de la cita médica activa por ID con caché institucional TanStack Query
  const { data: cita = null, isLoading: loadingCita } = useQuery({
    queryKey: ['cita', citaId],
    queryFn: () => getCitaById(citaId),
    enabled: !!citaId,
  });

  // Consulta reactiva de la evaluación clínica previa asociada a la cita médica
  const { data: evaluacion = null, isLoading: loadingEval } = useQuery({
    queryKey: ['evaluacion', citaId],
    queryFn: async () => {
      try {
        return await getEvaluacionByCita(citaId);
      } catch (_) {
        // Estado esperado cuando la consulta es nueva y aún no posee evaluación registrada
        return null;
      }
    },
    enabled: !!citaId,
  });

  // Identificador de la evaluación activa para scoping de hallazgos
  const evaluacionId = evaluacion?.idEvaluacionClinica;

  // Consulta reactiva y normalización de precios de hallazgos vinculados a la evaluación clínica
  const { data: hallazgos = [] } = useQuery({
    queryKey: ['hallazgos', evaluacionId],
    queryFn: async () => {
      const data = await getHallazgos(evaluacionId);
      return (data ?? []).map(h => ({
        ...h,
        precioFloat: getPrecioHallazgo(h),
        costoTratamiento: getPrecioHallazgo(h),
      }));
    },
    enabled: !!evaluacionId,
  });

  // Sincronización del formulario clínico al recibir o actualizar la evaluación en caché
  useEffect(() => {
    if (evaluacion) {
      setDiagnostico(evaluacion.diagnostico ?? '');
      setObservaciones(evaluacion.observaciones ?? '');
    }
  }, [evaluacion]);

  // Mutación para persistir la evaluación clínica inicial
  const { mutateAsync: guardarEvaluacionMutate, isPending: savingEval } = useMutation({
    mutationFn: (payload) => createEvaluacion(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['evaluacion', citaId], data);
      queryClient.invalidateQueries({ queryKey: ['evaluacion', citaId] });
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
  });

  /**
   * Valida y persiste la evaluación clínica primaria, habilitando el acceso al odontograma
   */
  const handleGuardarEvaluacion = async (onSuccess) => {
    if (!diagnostico.trim()) {
      alertWarning('El diagnóstico es obligatorio.');
      return;
    }
    try {
      const data = await guardarEvaluacionMutate({
        idCita: parseInt(citaId, 10),
        diagnostico,
        observaciones,
      });
      alertSuccess('Evaluación guardada', 'Puedes continuar al odontograma.', 1800);
      onSuccess?.();
      return data;
    } catch (err) {
      alertError(err.message);
    }
  };

  // Mutación con actualización optimista para modificar el estado de un hallazgo clínico
  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ idPlan, nuevoEstado }) => updateEstadoHallazgo(idPlan, nuevoEstado),
    onMutate: async ({ idPlan, nuevoEstado }) => {
      const queryKey = ['hallazgos', evaluacionId];
      await queryClient.cancelQueries({ queryKey });
      const prevHallazgos = queryClient.getQueryData(queryKey) || [];
      queryClient.setQueryData(queryKey, old =>
        (old || []).map(h => h.idPlanTratamiento === idPlan ? { ...h, estadoPlan: nuevoEstado } : h)
      );
      return { prevHallazgos, queryKey };
    },
    onError: (err, variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.prevHallazgos);
      }
      alertError(err.message);
    },
    onSuccess: () => {
      toastSuccess('Estado actualizado');
    },
    onSettled: (data, error, variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  /**
   * Modifica el estado del plan de tratamiento ejecutando actualización optimista con rollback en caso de error
   */
  const handleCambiarEstado = async (idPlan, nuevoEstado) => {
    try {
      await cambiarEstadoMutation.mutateAsync({ idPlan, nuevoEstado });
    } catch (_) {
      // Manejado automáticamente en onError
    }
  };

  // Mutación para supresión de hallazgo clínico
  const eliminarHallazgoMutation = useMutation({
    mutationFn: (idPlan) => deleteHallazgo(idPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hallazgos', evaluacionId] });
    },
    onError: (err) => {
      alertError(err.message);
    },
  });

  /**
   * Solicita confirmación explícita y suprime un hallazgo clínico invalidando la caché
   */
  const handleEliminarHallazgo = async (idPlan) => {
    const confirmed = await confirmDelete('este hallazgo');
    if (!confirmed) return;
    try {
      await eliminarHallazgoMutation.mutateAsync(idPlan);
    } catch (_) {
      // Manejado en onError
    }
  };

  // Mutación para actualizar el estado de la cita médica a FINALIZADA
  const finalizarCitaMutation = useMutation({
    mutationFn: () => cambiarEstado(citaId, 'FINALIZADA'),
    onSuccess: () => {
      queryClient.setQueryData(['cita', citaId], prev => prev ? { ...prev, estadoCita: 'FINALIZADA' } : prev);
      queryClient.invalidateQueries({ queryKey: ['cita', citaId] });
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
    onError: (err) => {
      console.error('No se pudo cambiar el estado de la cita a FINALIZADA:', err.message);
    },
  });

  /**
   * Finaliza la consulta médica transicionando la cita global al estado 'FINALIZADA' si hubo tratamientos cumplidos
   */
  const handleFinalizarConsulta = async (onSuccess) => {
    const tieneRealizados = (hallazgos ?? []).some(h => {
      const st = String(h.estadoPlan || '').toUpperCase();
      return st === 'COMPLETADO' || st === 'FINALIZADO';
    });

    if (tieneRealizados) {
      try {
        await finalizarCitaMutation.mutateAsync();
      } catch (_) {
        // Manejado en el logger de la mutación
      }
    }

    onSuccess?.();
  };

  // Métodos de compatibilidad y control de caché para componentes consumidores
  const setCita = (updater) => {
    queryClient.setQueryData(['cita', citaId], updater);
  };

  const setHallazgos = (updater) => {
    if (evaluacionId) {
      queryClient.setQueryData(['hallazgos', evaluacionId], updater);
    }
  };

  const fetchHallazgos = async (idEvaluacion) => {
    const targetId = idEvaluacion || evaluacionId;
    if (targetId) {
      return queryClient.invalidateQueries({ queryKey: ['hallazgos', targetId] });
    }
  };

  const loading = loadingCita || loadingEval;

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

