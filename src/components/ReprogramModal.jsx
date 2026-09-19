import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';

const INITIAL = { fechaCita: '', horaInicioCita: '', horaFinCita: '' };

/**
 * Modal de reprogramación de cita con campos estilizados.
 */
const ReprogramModal = ({ cita, loading, onConfirmar, onCerrar }) => {
  const [reprogramData, setReprogramData] = useState(INITIAL);

  const handleChange = (campo, valor) =>
    setReprogramData(prev => ({ ...prev, [campo]: valor }));

  const handleClose = () => {
    setReprogramData(INITIAL);
    onCerrar();
  };

  return (
    <Modal
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
        <Input
          type="date"
          label="Nueva Fecha"
          required
          value={reprogramData.fechaCita}
          onChange={e => handleChange('fechaCita', e.target.value)}
        />

        <Input
          type="datetime-local"
          label="Nueva Hora de Inicio"
          required
          value={reprogramData.horaInicioCita}
          onChange={e => handleChange('horaInicioCita', e.target.value)}
        />

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
