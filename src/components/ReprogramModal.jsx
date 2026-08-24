import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

//Este Componente es un modal para reprogramar citas. Maneja su propio estado local para la fecha y hora de la cita, y recibe props para controlar su visibilidad, cargar estado, y funciones de confirmación y cierre.

// Estado inicial para el formulario de reprogramación
const INITIAL = { fechaCita: '', horaInicioCita: '', horaFinCita: '' };

// Componentes auxiliares para el formulario
const Label = ({ children }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">{children}</label>
);

// Componente de input estilizado
const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
               text-slate-800 outline-none focus:ring-2 focus:ring-primary-500
               focus:border-transparent transition-all"
  />
);

/**
 * Modal de reprogramación de cita.
 * Maneja su propio estado de fecha/hora (local al modal).
 */
const ReprogramModal = ({ cita, loading, onConfirmar, onCerrar }) => {
  const [reprogramData, setReprogramData] = useState(INITIAL);

  // Función para actualizar el estado del formulario
  const handleChange = (campo, valor) =>
    setReprogramData(prev => ({ ...prev, [campo]: valor }));

  // Función para cerrar el modal y resetear el estado
  const handleClose = () => {
    setReprogramData(INITIAL);
    onCerrar();
  };
  // Si no hay cita, no renderizamos nada (modal cerrado)
  return (
    <Modal
      isOpen={!!cita} // El modal se abre si hay una cita seleccionada
      onClose={handleClose} // Cierra el modal al hacer clic fuera o en el botón de cerrar
      title="Reprogramar Cita"
      // Si hay una cita, mostramos el nombre del paciente en el subtítulo
      subtitle={cita ? `Paciente: ${cita.nombreCompletoPaciente}` : ''}
      size="sm"
      // El footer del modal contiene los botones de cancelar y confirmar, con el estado de carga para deshabilitar el botón de cancelar
      footer={
        <>
        {/*El botón de cancelar se deshabilita si estamos en estado de carga para evitar cierres accidentales */}
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          {/*El botón de confirmar muestra un estado de carga si estamos procesando la confirmación, y llama a la función onConfirmar con los datos del formulario al hacer clic */}
          <Button onClick={() => onConfirmar(reprogramData)} loading={loading}>
            Confirmar cambio
          </Button>
        </>
      }
    >
      {/*El cuerpo del modal contiene el formulario para ingresar la nueva fecha y hora de la cita, con etiquetas y campos de entrada estilizados. Cada campo actualiza el estado local del modal al cambiar su valor. */}
      <div className="space-y-4">
        <div>
          <Label>Nueva Fecha</Label>
          {/*El campo de fecha permite seleccionar una nueva fecha para la cita, y actualiza el estado local del modal con el valor seleccionado. */}
          <Input
            type="date"
            value={reprogramData.fechaCita}
            onChange={e => handleChange('fechaCita', e.target.value)}
          />
        </div>
        <div>
          <Label>Nueva Hora Inicio</Label>
          {/*El campo de hora de inicio permite seleccionar una nueva hora de inicio para la cita, y actualiza el estado local del modal con el valor seleccionado. */}
          <Input
            type="datetime-local"
            value={reprogramData.horaInicioCita}
            onChange={e => handleChange('horaInicioCita', e.target.value)}
          />
        </div>
        <div>
          <Label>Nueva Hora Fin</Label>
          {/*El campo de hora de fin permite seleccionar una nueva hora de fin para la cita, y actualiza el estado local del modal con el valor seleccionado. */}
          <Input
            type="datetime-local"
            value={reprogramData.horaFinCita}
            onChange={e => handleChange('horaFinCita', e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReprogramModal;
