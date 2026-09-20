/**
 * Propósito:
 * Hook de gestión de recetas y prescripciones farmacológicas asociadas a la consulta médica.
 * Administra el catálogo de medicamentos, permite la adición temporal de detalles posológicos
 * (dosis, frecuencia, duración, justificación por pieza dental), y ejecuta la persistencia
 * atómica en el backend finalizando la cita clínica.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/usePrescripcion.js'. Hook de lógica de dominio clínico dentro
 * de la capa de hooks de atención médica.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/StepPrescripcion.jsx'
 * - Consume:
 *   - 'src/services/consulta.service.js' ('getMedicamentos', 'getPrescripcionByCita', 'createPrescripcion')
 *   - 'src/services/cita.service.js' ('cambiarEstado')
 *   - 'src/utils/alert.utils.js' ('alertSuccess', 'alertError', 'alertWarning')
 *
 * Parámetros y Retornos:
 * @param {string|number} citaId - Identificador único de la cita sobre la cual se prescribe.
 * @param {() => void} [onGuardado] - Callback ejecutado exitosamente tras persistir la prescripción.
 * @returns {Object} Estado de prescripción y métodos de control de receta:
 *   - medicamentos {Array<Object>}: Catálogo general de medicamentos disponibles.
 *   - prescripcion {Object|null}: Receta persistida previamente en la cita (si existe).
 *   - setPrescripcion {Function}: Mutador del estado de la prescripción.
 *   - detalles {Array<Object>}: Lista local de renglones posológicos preparados para emisión.
 *   - detalleActual {Object}: Formulario controlado del renglón farmacológico en captura.
 *   - setDetalleActual {Function}: Mutador del formulario del renglón en edición.
 *   - handleDetalleChange {Function}: Modifica una propiedad puntual del renglón en captura.
 *   - savingPrescripcion {boolean}: Estado de persistencia asíncrona en red.
 *   - handleAgregarDetalle {Function}: Valida y añade un renglón farmacológico a la lista local.
 *   - handleEliminarDetalle {Function}: Suprime un renglón de la prescripción en preparación.
 *   - handleGuardarPrescripcion {Function}: Envía la receta al servidor y finaliza la cita.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedicamentos, getPrescripcionByCita, createPrescripcion } from '../services/consulta.service';
import { cambiarEstado } from '../services/cita.service';
import { alertSuccess, alertError, alertWarning } from '../utils/alert.utils';

// Estructura en blanco para la captura posológica de un medicamento
const DETALLE_INICIAL = {
  idMedicamento:     '',
  dosis:             '',
  frecuencia:        '',
  duracion:          '',
  indicaciones:      '',
  idPlanTratamiento: '',
};

export const usePrescripcion = (citaId, onGuardado) => {
  const queryClient = useQueryClient();

  const [prescripcion,  setPrescripcion]  = useState(null);
  const [detalles,      setDetalles]      = useState([]);
  const [detalleActual, setDetalleActual] = useState(DETALLE_INICIAL);

  // Consulta reactiva del catálogo maestro de medicamentos farmacéuticos con caché compartida
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: async () => {
      const data = await getMedicamentos();
      return data ?? [];
    },
  });

  // Consulta reactiva de la prescripción previa registrada en la cita médica
  const { data: prescripcionData = null } = useQuery({
    queryKey: ['prescripcion', citaId],
    queryFn: async () => {
      try {
        return await getPrescripcionByCita(citaId);
      } catch (_) {
        return null;
      }
    },
    enabled: !!citaId,
  });

  // Sincronización del estado de prescripción cuando se recuperan datos existentes en el servidor
  useEffect(() => {
    if (prescripcionData) {
      setPrescripcion(prescripcionData);
    }
  }, [prescripcionData]);

  /**
   * Actualiza dinámicamente una clave específica dentro del renglón en preparación
   */
  const handleDetalleChange = (campo, valor) =>
    setDetalleActual(prev => ({ ...prev, [campo]: valor }));

  /**
   * Valida y agrega el medicamento configurado al listado temporal en memoria
   */
  const handleAgregarDetalle = (hallazgos = []) => {
    const { idMedicamento, dosis, frecuencia, duracion } = detalleActual;
    if (!idMedicamento || !dosis || !frecuencia || !duracion) {
      alertWarning('Completa medicamento, dosis, frecuencia y duración.');
      return;
    }
    const med = medicamentos.find(m => m.idMedicamento === parseInt(idMedicamento, 10));
    const hallazgo = hallazgos.find(h => h.idPlanTratamiento === parseInt(detalleActual.idPlanTratamiento, 10));
    
    // Etiqueta visual de justificación para distinguir si atiende una pieza dental específica o es general
    const justificacionVisual = hallazgo
      ? `Pieza ${hallazgo.piezaDental} - ${hallazgo.nombreTratamiento}`
      : 'Prescripción General';

    setDetalles(prev => [...prev, {
      ...detalleActual,
      nombreMedicamento: med?.nombreMedicamento,
      justificacionVisual,
    }]);
    setDetalleActual(DETALLE_INICIAL);
  };

  /**
   * Elimina un renglón posológico del listado local por su índice
   */
  const handleEliminarDetalle = (index) =>
    setDetalles(prev => prev.filter((_, i) => i !== index));

  // Mutación para persistencia de la receta clínica y transición del estado de la cita médica
  const guardarPrescripcionMutation = useMutation({
    mutationFn: async (payload) => {
      const data = await createPrescripcion(payload);
      // Transición del estado de la cita médica: si falla la actualización de estado no se bloquea la confirmación de la receta
      try {
        await cambiarEstado(citaId, 'FINALIZADA');
      } catch (err) {
        console.error('Prescripción guardada pero falló al cambiar estado de cita:', err.message);
      }
      return data;
    },
    onSuccess: (data) => {
      setPrescripcion(data);
      queryClient.setQueryData(['prescripcion', citaId], data);
      queryClient.invalidateQueries({ queryKey: ['prescripcion', citaId] });
      queryClient.invalidateQueries({ queryKey: ['cita', citaId] });
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      alertSuccess('Prescripción guardada', '', 1800);
      onGuardado?.();
    },
    onError: (err) => {
      alertError(err.message);
    },
  });

  /**
   * Persiste la receta en el backend y transiciona la cita médica a estado FINALIZADA
   */
  const handleGuardarPrescripcion = async () => {
    if (detalles.length === 0) {
      alertWarning('Agrega al menos un medicamento antes de guardar.');
      return;
    }
    const payload = {
      idCita: parseInt(citaId, 10),
      detalles: detalles.map(d => ({
        idMedicamento:     parseInt(d.idMedicamento, 10),
        idPlanTratamiento: d.idPlanTratamiento ? parseInt(d.idPlanTratamiento, 10) : null,
        dosis:             d.dosis,
        frecuencia:        d.frecuencia,
        duracion:          parseInt(d.duracion, 10),
        indicaciones:      d.indicaciones ?? '',
      })),
    };
    try {
      await guardarPrescripcionMutation.mutateAsync(payload);
    } catch (_) {
      // Manejado en onError
    }
  };

  const savingPrescripcion = guardarPrescripcionMutation.isPending;

  return {
    medicamentos,
    prescripcion, setPrescripcion,
    detalles,
    detalleActual,
    setDetalleActual,
    handleDetalleChange,
    savingPrescripcion,
    handleAgregarDetalle,
    handleEliminarDetalle,
    handleGuardarPrescripcion,
  };
};

