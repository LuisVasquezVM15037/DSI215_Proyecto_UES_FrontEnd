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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';

/**
 * Esquema de validación declarativa Zod para reprogramación temporal de citas
 */
const reprogramSchema = z.object({
  fechaCita: z.string().min(1, 'La nueva fecha es obligatoria.'),
  horaInicioCita: z.string().min(1, 'La hora de inicio es obligatoria.'),
  horaFinCita: z.string().min(1, 'La hora de finalización es obligatoria.'),
}).refine(data => {
  if (data.horaInicioCita && data.horaFinCita) {
    return new Date(data.horaFinCita) > new Date(data.horaInicioCita);
  }
  return true;
}, {
  message: 'La hora de finalización debe ser posterior a la hora de inicio.',
  path: ['horaFinCita'],
});

const ReprogramModal = ({ cita, loading, onConfirmar, onCerrar }) => {
  // Inicialización de React Hook Form con esquema Zod
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reprogramSchema),
    defaultValues: {
      fechaCita: '',
      horaInicioCita: '',
      horaFinCita: '',
    },
  });

  // Resetea el formulario cada vez que se abre con una nueva cita
  useEffect(() => {
    if (cita) {
      reset({
        fechaCita: '',
        horaInicioCita: '',
        horaFinCita: '',
      });
    }
  }, [cita, reset]);

  /**
   * Cierra el diálogo y reinicia el formulario local para prevenir fugas de estado
   */
  const handleClose = () => {
    reset();
    onCerrar();
  };

  /**
   * Ejecuta la confirmación del cambio solo tras validación exitosa
   */
  const handleFormSubmit = (data) => {
    onConfirmar(data);
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
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit(handleFormSubmit)} loading={loading}>
            Confirmar Cambio
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        {/* Entrada de nueva fecha */}
        <Input
          type="date"
          label="Nueva Fecha"
          required
          value={watch('fechaCita')}
          error={errors.fechaCita?.message}
          onChange={e => setValue('fechaCita', e.target.value, { shouldValidate: true })}
        />

        {/* Entrada de nueva hora de inicio */}
        <Input
          type="datetime-local"
          label="Nueva Hora de Inicio"
          required
          value={watch('horaInicioCita')}
          error={errors.horaInicioCita?.message}
          onChange={e => setValue('horaInicioCita', e.target.value, { shouldValidate: true })}
        />

        {/* Entrada de nueva hora estimada de finalización */}
        <Input
          type="datetime-local"
          label="Nueva Hora de Fin"
          required
          value={watch('horaFinCita')}
          error={errors.horaFinCita?.message}
          onChange={e => setValue('horaFinCita', e.target.value, { shouldValidate: true })}
        />
      </form>
    </Modal>
  );
};

export default ReprogramModal;
