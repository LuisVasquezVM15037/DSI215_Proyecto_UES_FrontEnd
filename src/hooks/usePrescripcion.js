import { useState, useEffect } from 'react';
import { getMedicamentos, getPrescripcionByCita, createPrescripcion } from '../services/consulta.service';
import { cambiarEstado } from '../services/cita.service';
import { alertSuccess, alertError, alertWarning } from '../utils/alert.utils';

const DETALLE_INICIAL = {
  idMedicamento:     '',
  dosis:             '',
  frecuencia:        '',
  duracion:          '',
  indicaciones:      '',
  idPlanTratamiento: '',
};

/**
 * Hook de prescripción médica: catálogo de medicamentos, lista de detalles y guardado.
 */
export const usePrescripcion = (citaId, onGuardado) => {
  const [medicamentos,       setMedicamentos]       = useState([]);
  const [prescripcion,       setPrescripcion]       = useState(null);
  const [detalles,           setDetalles]           = useState([]);
  const [savingPrescripcion, setSavingPrescripcion] = useState(false);
  const [detalleActual,      setDetalleActual]      = useState(DETALLE_INICIAL);

  useEffect(() => {
    if (!citaId) return;
    Promise.all([loadMedicamentos(), loadPrescripcion()]);
  }, [citaId]);

  const loadMedicamentos = async () => {
    try {
      const data = await getMedicamentos();
      setMedicamentos(data ?? []);
    } catch (_) {}
  };

  const loadPrescripcion = async () => {
    try {
      const data = await getPrescripcionByCita(citaId);
      if (data) setPrescripcion(data);
    } catch (_) {}
  };

  /** Helper para actualizar un campo del detalle actual */
  const handleDetalleChange = (campo, valor) =>
    setDetalleActual(prev => ({ ...prev, [campo]: valor }));

  /** Agrega el medicamento configurado a la lista local (no guarda aún) */
  const handleAgregarDetalle = (hallazgos = []) => {
    const { idMedicamento, dosis, frecuencia, duracion } = detalleActual;
    if (!idMedicamento || !dosis || !frecuencia || !duracion) {
      alertWarning('Completa medicamento, dosis, frecuencia y duración.');
      return;
    }
    const med = medicamentos.find(m => m.idMedicamento === parseInt(idMedicamento));
    const hallazgo = hallazgos.find(h => h.idPlanTratamiento === parseInt(detalleActual.idPlanTratamiento));
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

  const handleEliminarDetalle = (index) =>
    setDetalles(prev => prev.filter((_, i) => i !== index));

  /** Guarda la prescripción y cambia el estado de la cita a FINALIZADA */
  const handleGuardarPrescripcion = async () => {
    if (detalles.length === 0) {
      alertWarning('Agrega al menos un medicamento antes de guardar.');
      return;
    }
    setSavingPrescripcion(true);
    try {
      const payload = {
        idCita: parseInt(citaId),
        detalles: detalles.map(d => ({
          idMedicamento:     parseInt(d.idMedicamento),
          idPlanTratamiento: d.idPlanTratamiento ? parseInt(d.idPlanTratamiento) : null,
          dosis:             d.dosis,
          frecuencia:        d.frecuencia,
          duracion:          parseInt(d.duracion),
          indicaciones:      d.indicaciones ?? '',
        })),
      };

      const data = await createPrescripcion(payload);
      setPrescripcion(data);

      // Cambiar estado de la cita — si falla no bloqueamos al usuario
      try {
        await cambiarEstado(citaId, 'FINALIZADA');
      } catch (err) {
        console.error('Prescripción guardada pero fallo al cambiar estado de cita:', err.message);
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
