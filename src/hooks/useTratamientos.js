/**
 * Propósito:
 * Hook del odontograma interactivo y catálogo de tratamientos dentales.
 * Administra las piezas dentales seleccionadas mediante notación FDI, valida la regla
 * de negocio de no duplicidad de hallazgos activos por diente, registra hallazgos
 * en lote mediante concurrencia con Promise.all asignando estado inicial 'PENDIENTE' (Presupuestado),
 * y permite la creación en caliente de nuevos tratamientos en el catálogo maestro.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useTratamientos.js'. Hook de lógica de negocio clínica dentro de
 * la capa de hooks del odontograma.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/StepOdontograma.jsx'
 * - Consume:
 *   - 'src/services/consulta.service.js' ('getTratamientos', 'createTratamiento', 'createHallazgo')
 *   - 'src/utils/alert.utils.js' ('alertError', 'alertWarning', 'toastSuccess')
 *
 * Parámetros y Retornos:
 * @param {Object} evaluacion - Objeto de evaluación clínica asociada a la cita médica.
 * @param {() => void} [onHallazgoRegistrado] - Callback para notificar y refrescar el listado de hallazgos.
 * @param {Array<Object>} [existingHallazgos=[]] - Lista actual de hallazgos para verificar duplicados por pieza.
 * @returns {Object} Estado del odontograma y operaciones de catálogo:
 *   - tratamientos {Array<Object>}: Catálogo general de procedimientos odontológicos.
 *   - selectedTeeth {Array<Object>}: Piezas dentales seleccionadas en el diagrama gráfico.
 *   - selectedTratamiento {string}: ID del tratamiento seleccionado en el formulario.
 *   - setSelectedTratamiento {Function}: Mutador del tratamiento seleccionado.
 *   - customPrecio {string}: Precio o tarifa personalizada a aplicar.
 *   - setCustomPrecio {Function}: Mutador del precio de tratamiento.
 *   - savingHallazgo {boolean}: Indicador de persistencia asíncrona de hallazgos.
 *   - handleOdontogramChange {Function}: Callback que recibe las piezas marcadas en el componente visual del odontograma.
 *   - handleRegistrarHallazgo {Function}: Valida y persiste los hallazgos para cada pieza seleccionada.
 *   - handleCrearTratamiento {Function}: Da de alta un nuevo procedimiento clínico en la base de datos.
 */

import { useState, useEffect } from 'react';
import {
  getTratamientos, createTratamiento, createHallazgo,
} from '../services/consulta.service';
import { alertError, alertWarning, toastSuccess } from '../utils/alert.utils';

export const useTratamientos = (evaluacion, onHallazgoRegistrado, existingHallazgos = []) => {
  const [tratamientos,        setTratamientos]        = useState([]);
  const [selectedTeeth,       setSelectedTeeth]       = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState('');
  const [customPrecio,        setCustomPrecio]        = useState('');
  const [savingHallazgo,      setSavingHallazgo]      = useState(false);

  /**
   * Recupera el catálogo de tratamientos odontológicos vigentes
   */
  const loadTratamientos = async () => {
    try {
      const data = await getTratamientos();
      setTratamientos(data ?? []);
    } catch (err) {
      console.error('Error al cargar catálogo de tratamientos:', err);
    }
  };

  useEffect(() => {
    loadTratamientos();
  }, []);

  /**
   * Actualiza el listado de dientes seleccionados en la interacción con el odontograma visual
   */
  const handleOdontogramChange = (teeth) => setSelectedTeeth(teeth);

  /**
   * Valida restricciones clínicas y persiste el hallazgo para las piezas marcadas
   */
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

    // Regla de integridad clínica: cada hallazgo debe reportarse una única vez por pieza dental (excluyendo cancelados)
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
      // Registro paralelo concurrente para optimizar la latencia cuando se seleccionan múltiples piezas
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
      
      // Reinicio de selección tras guardado exitoso
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
   * Crea un nuevo procedimiento en el catálogo maestro y lo selecciona de inmediato
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

