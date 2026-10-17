import { useState, useEffect } from 'react';
import {
  getTratamientos, createTratamiento, createHallazgo,
} from '../services/consulta.service';
import { alertSuccess, alertError, alertWarning, toastSuccess } from '../utils/alert.utils';

/**
 * Hook de tratamientos: catálogo y registro de hallazgos en el odontograma.
 * FIX BUG-12: los hallazgos de múltiples piezas se crean en paralelo con Promise.all.
 */
export const useTratamientos = (evaluacion, onHallazgoRegistrado) => {
  const [tratamientos,        setTratamientos]        = useState([]);
  const [selectedTeeth,       setSelectedTeeth]       = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState('');
  const [customPrecio,        setCustomPrecio]        = useState('');
  const [esGeneral,           setEsGeneral]           = useState(false);
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
    if (!esGeneral && selectedTeeth.length === 0) {
      alertWarning('Selecciona al menos una pieza dental en el odontograma, o activa la opción de Procedimiento General.');
      return;
    }
    if (!selectedTratamiento) {
      alertWarning('Selecciona el tratamiento o procedimiento a registrar.');
      return;
    }
    if (!customPrecio || parseFloat(customPrecio) < 0) {
      alertWarning('Indica un precio válido para el tratamiento.');
      return;
    }

    setSavingHallazgo(true);
    try {
      if (esGeneral) {
        // Procedimiento general (boca completa / sin pieza asociada)
        await createHallazgo({
          idEvaluacionClinica: evaluacion.idEvaluacionClinica,
          idTratamiento:       parseInt(selectedTratamiento),
          piezaDental:         null,
          costoAplicado:       parseFloat(customPrecio),
        });
        toastSuccess('Procedimiento general registrado');
      } else {
        // Tratamiento específico por piezas dentales
        await Promise.all(
          selectedTeeth.map(tooth => {
            const pieza = tooth.notations?.fdi || tooth.id;
            return createHallazgo({
              idEvaluacionClinica: evaluacion.idEvaluacionClinica,
              idTratamiento:       parseInt(selectedTratamiento),
              piezaDental:         parseInt(pieza),
              costoAplicado:       parseFloat(customPrecio),
            });
          })
        );
        toastSuccess('Hallazgo registrado');
      }
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
    if (!nombreTratamiento?.trim()) {
      throw new Error('El nombre del tratamiento es obligatorio.');
    }
    if (costoTratamiento === undefined || isNaN(parseFloat(costoTratamiento)) || parseFloat(costoTratamiento) < 0) {
      throw new Error('El costo del tratamiento debe ser un número válido mayor o igual a 0.');
    }
    const nuevoItem = await createTratamiento({
      nombreTratamiento: nombreTratamiento.trim(),
      descripcionTratamiento: (descripcionTratamiento && descripcionTratamiento.trim())
        ? descripcionTratamiento.trim()
        : nombreTratamiento.trim(),
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
    esGeneral,           setEsGeneral,
    savingHallazgo,
    handleOdontogramChange,
    handleRegistrarHallazgo,
    handleCrearTratamiento,
  };
};
