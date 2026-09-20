/**
 * Propósito:
 * Componente modal especializado para la reprogramación temporal y horaria de citas médicas.
 * Permite capturar una nueva fecha, hora de inicio y hora estimada de finalización,
 * encapsulando la interacción sobre una ventana modal accesible y gestionando su estado local.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ReprogramModal.jsx'. Componente de diálogo de dominio clínico
 * dentro de la capa de presentación de la agenda y consulta.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/AppointmentPage.jsx' (reprogramación manual desde el calendario de la agenda).
 *   - 'src/components/StepCierre.jsx' (reprogramación de sesiones posteriores para planes de tratamiento pendientes).
 * - Consume:
 *   - 'src/components/ui/Modal.jsx'
 *   - 'src/components/ui/Button.jsx'
 *   - 'src/components/ui/Input.jsx'
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del modal.
 * @param {Object|null} props.cita - Objeto de datos de la cita a reprogramar (controla visibilidad implícita).
 * @param {boolean} props.loading - Indicador de procesamiento asíncrono o petición en red activa.
 * @param {(datos: { fechaCita: string, horaInicioCita: string, horaFinCita: string }) => void} props.onConfirmar - Callback para enviar las nuevas coordenadas temporales al backend.
 * @param {() => void} props.onCerrar - Callback para cerrar el diálogo modal y resetear los campos.
 * @returns {JSX.Element} Modal de reprogramación con inputs de fecha y hora.
 */

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';

// Estructura limpia para la captura de horarios reprogramados
const INITIAL = { fechaCita: '', horaInicioCita: '', horaFinCita: '' };

const ReprogramModal = ({ cita, loading, onConfirmar, onCerrar }) => {
  const [reprogramData, setReprogramData] = useState(INITIAL);

  /**
   * Actualiza el valor de un campo temporal puntual
   */
  const handleChange = (campo, valor) =>
    setReprogramData(prev => ({ ...prev, [campo]: valor }));

  /**
   * Cierra el diálogo y reinicia el formulario local para prevenir fugas de estado
   */
  const handleClose = () => {
    setReprogramData(INITIAL);
    onCerrar();
  };

  return (
    <Modal
      // La visibilidad se controla según la presencia del objeto de la cita seleccionada
      isOpen={!!cita}
      onClose={handleClose}
      title="Reprogramar Cita"
      subtitle={cita ? `Paciente: ${cita.nombreCompletoPaciente}` : ''}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirmar(reprogramData)} loading={loading}>
            Confirmar Cambio
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Entrada de nueva fecha */}
        <Input
          type="date"
          label="Nueva Fecha"
          required
          value={reprogramData.fechaCita}
          onChange={e => handleChange('fechaCita', e.target.value)}
        />

        {/* Entrada de nueva hora de inicio */}
        <Input
          type="datetime-local"
          label="Nueva Hora de Inicio"
          required
          value={reprogramData.horaInicioCita}
          onChange={e => handleChange('horaInicioCita', e.target.value)}
        />

        {/* Entrada de nueva hora estimada de finalización */}
        <Input
          type="datetime-local"
          label="Nueva Hora de Fin"
          required
          value={reprogramData.horaFinCita}
          onChange={e => handleChange('horaFinCita', e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default ReprogramModal;
