import { useState, useEffect } from 'react';
import {
  getTratamientos, createTratamiento, createHallazgo,
} from '../services/consulta.service';
import { alertSuccess, alertError, alertWarning, toastSuccess } from '../utils/alert.utils';

/**
 * Hook de tratamientos: catálogo y registro de hallazgos en el odontograma.
 * FIX BUG-12: los hallazgos de múltiples piezas se crean en paralelo con Promise.all.
 */
export const useTratamientos = (evaluacion, onHallazgoRegistrado, existingHallazgos = []) => {
  const [tratamientos,        setTratamientos]        = useState([]);
  const [selectedTeeth,       setSelectedTeeth]       = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState('');
  const [customPrecio,        setCustomPrecio]        = useState('');
  const [savingHallazgo,      setSavingHallazgo]      = useState(false);

  useEffect(() => { loadTratamientos(); }, []);

  const loadTratamientos = async () => {
    try {
      const data = await getTratamientos();
      setTratamientos(data ?? []);
    } catch (_) {}
  };

  const handleOdontogramChange = (teeth) => setSelectedTeeth(teeth);

  const handleRegistrarHallazgo = async () => {
    if (!evaluacion?.idEvaluacionClinica) {
      alertWarning('Debes guardar el diagnóstico primero.');
      return;
    }
    if (selectedTeeth.length === 0) {
      alertWarning('Selecciona al menos una pieza dental en el odontograma.');
      return;
    }
    if (!selectedTratamiento) {
      alertWarning('Selecciona el tratamiento a registrar.');
      return;
    }
    if (!customPrecio || parseFloat(customPrecio) < 0) {
      alertWarning('Indica un precio válido para el tratamiento.');
      return;
    }

    // Regla de negocio: Cada hallazgo debe reportarse una vez por pieza dental
    const listaActual = Array.isArray(existingHallazgos) ? existingHallazgos : [];
    const piezasDuplicadas = selectedTeeth.filter(tooth => {
      const fdi = parseInt(String(tooth.notations?.fdi || tooth.id || '').replace('teeth-', ''), 10);
      return listaActual.some(h => h.piezaDental === fdi && String(h.estadoPlan || '').toUpperCase() !== 'CANCELADO');
    });

    if (piezasDuplicadas.length > 0) {
      const nombresPiezas = piezasDuplicadas
        .map(t => t.notations?.fdi || String(t.id || '').replace('teeth-', ''))
        .join(', ');
      alertWarning(`La(s) pieza(s) ${nombresPiezas} ya tiene(n) un hallazgo registrado en esta evaluación.`);
      return;
    }

    setSavingHallazgo(true);
    try {
      // Registrar hallazgos en paralelo con precioFloat y estado inicial PENDIENTE (Presupuestado)
      await Promise.all(
        selectedTeeth.map(tooth => {
          const fdi = String(tooth.notations?.fdi || tooth.id || '').replace('teeth-', '');
          const piezaNum = parseInt(fdi, 10);
          const precioNum = parseFloat(customPrecio) || 0;
          return createHallazgo({
            idEvaluacionClinica: evaluacion.idEvaluacionClinica,
            idTratamiento:       parseInt(selectedTratamiento, 10),
            piezaDental:         piezaNum,
            precioFloat:         precioNum,
            costoAplicado:       precioNum,
            estadoPlan:          'PENDIENTE',
          });
        })
      );
      toastSuccess('Hallazgo registrado en presupuesto');
      onHallazgoRegistrado?.();
      setSelectedTeeth([]);
      setSelectedTratamiento('');
      setCustomPrecio('');
    } catch (err) {
      alertError(err.message);
    } finally {
      setSavingHallazgo(false);
    }
  };

  /**
   * Crea un nuevo tratamiento en el catálogo.
   * La lógica de fetch sube al hook (sale de TratamientoSelector).
   */
  const handleCrearTratamiento = async (datos) => {
    const { nombreTratamiento, descripcionTratamiento, costoTratamiento } = datos;
    const nuevoItem = await createTratamiento({
      nombreTratamiento,
      descripcionTratamiento: descripcionTratamiento || nombreTratamiento,
      costoTratamiento: parseFloat(costoTratamiento),
    });
    await loadTratamientos();
    setSelectedTratamiento(String(nuevoItem.idTratamiento));
    setCustomPrecio(String(nuevoItem.costoTratamiento));
    toastSuccess('Tratamiento agregado al catálogo');
    return nuevoItem;
  };

  return {
    tratamientos,
    selectedTeeth,
    selectedTratamiento, setSelectedTratamiento,
    customPrecio,        setCustomPrecio,
    savingHallazgo,
    handleOdontogramChange,
    handleRegistrarHallazgo,
    handleCrearTratamiento,
  };
};
