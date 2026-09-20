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
  const [medicamentos,       setMedicamentos]       = useState([]);
  const [prescripcion,       setPrescripcion]       = useState(null);
  const [detalles,           setDetalles]           = useState([]);
  const [savingPrescripcion, setSavingPrescripcion] = useState(false);
  const [detalleActual,      setDetalleActual]      = useState(DETALLE_INICIAL);

  // Carga concurrente del catálogo de medicamentos y la prescripción previa
  useEffect(() => {
    if (!citaId) return;
    Promise.all([loadMedicamentos(), loadPrescripcion()]);
  }, [citaId]);

  /**
   * Recupera el catálogo maestro de medicamentos farmacéuticos
   */
  const loadMedicamentos = async () => {
    try {
      const data = await getMedicamentos();
      setMedicamentos(data ?? []);
    } catch (_) {
      // Manejo silencioso en fallo de carga inicial
    }
  };

  /**
   * Consulta si la cita ya contaba con una prescripción guardada anteriormente
   */
  const loadPrescripcion = async () => {
    try {
      const data = await getPrescripcionByCita(citaId);
      if (data) setPrescripcion(data);
    } catch (_) {
      // Manejo silencioso si la cita aún no posee receta médica
    }
  };

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

  /**
   * Persiste la receta en el backend y transiciona la cita médica a estado FINALIZADA
   */
  const handleGuardarPrescripcion = async () => {
    if (detalles.length === 0) {
      alertWarning('Agrega al menos un medicamento antes de guardar.');
      return;
    }
    setSavingPrescripcion(true);
    try {
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

      const data = await createPrescripcion(payload);
      setPrescripcion(data);

      // Transición del estado de la cita médica: si falla la actualización de estado no se bloquea la confirmación de la receta
      try {
        await cambiarEstado(citaId, 'FINALIZADA');
      } catch (err) {
        console.error('Prescripción guardada pero falló al cambiar estado de cita:', err.message);
      }

      alertSuccess('Prescripción guardada', '', 1800);
      onGuardado?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setSavingPrescripcion(false);
    }
  };

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

