/**
 * Propósito:
 * Componente de formulario para la creación y modificación de citas odontológicas.
 * Proporciona campos controlados para asignación de paciente, odontólogo especialista,
 * fecha de atención, hora de inicio y cálculo automatizado de la hora de finalización
 * (duración predeterminada de 1 hora en tiempo local), así como modificación del estado
 * clínico en modalidad de edición.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/AppointmentForm.jsx'. Componente de formulario de dominio dentro
 * de la capa de componentes de presentación del módulo de agenda.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/AppointmentPage.jsx'
 * - Consume:
 *   - 'src/constants/estados.constants.js' ('ESTADOS_CITA_OPCIONES')
 *   - 'src/components/ui/Button.jsx'
 *   - 'src/components/ui/Input.jsx'
 *   - 'src/components/ui/Select.jsx'
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del formulario.
 * @param {boolean} props.isEditing - Bandera que determina si se edita una cita existente o se crea una nueva.
 * @param {Date} props.date - Fecha actualmente seleccionada en el calendario.
 * @param {Object} props.formData - Estado controlado de los valores del formulario.
 * @param {Array<Object>} props.pacientes - Catálogo de pacientes disponibles para selección.
 * @param {Array<Object>} props.odontologos - Catálogo de profesionales odontólogos disponibles.
 * @param {boolean} props.loading - Indicador de procesamiento o persistencia activa.
 * @param {(e: React.ChangeEvent<any>) => void} props.onChange - Manejador de cambios en los campos del formulario.
 * @param {() => void} props.onSubmit - Callback para confirmar el guardado o actualización de la cita.
 * @param {() => void} props.onCancelar - Callback para descartar cambios y retornar a la vista de agenda.
 * @returns {JSX.Element} Formulario estilizado de alta/edición de citas médicas.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ESTADOS_CITA_OPCIONES } from '../constants/estados.constants';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

/**
 * Esquema de validación declarativa institucional para citas odontológicas
 */
const appointmentSchema = z.object({
  idPaciente: z
    .union([z.string(), z.number()])
    .refine(val => val !== '' && val !== null && val !== undefined, {
      message: 'Debe seleccionar un paciente de la lista.',
    }),
  idOdontologo: z
    .union([z.string(), z.number()])
    .refine(val => val !== '' && val !== null && val !== undefined, {
      message: 'Debe seleccionar un especialista odontólogo.',
    }),
  fechaCita: z.string().min(1, 'La fecha de la cita es obligatoria.'),
  horaInicioCita: z.string().min(1, 'La hora de inicio es obligatoria.'),
  horaFinCita: z.string().min(1, 'La hora de finalización es obligatoria.'),
  estadoCita: z.string().optional(),
});

/**
 * Función pura que calcula la hora de finalización sumando exactamente 1 hora
 * al valor de entrada datetime-local ("YYYY-MM-DDTHH:mm") preservando la hora local.
 *
 * @param {string} horaInicio - Cadena de fecha-hora local en formato ISO parcial.
 * @returns {string} Cadena en formato datetime-local con 1 hora incrementada.
 */
const calcularHoraFin = (horaInicio) => {
  if (!horaInicio) return '';
  const fin = new Date(horaInicio);
  if (Number.isNaN(fin.getTime())) return '';
  fin.setHours(fin.getHours() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  return `${fin.getFullYear()}-${pad(fin.getMonth() + 1)}-${pad(fin.getDate())}`
    + `T${pad(fin.getHours())}:${pad(fin.getMinutes())}`;
};

const AppointmentForm = ({
  isEditing,
  date,
  formData,
  pacientes,
  odontologos,
  loading,
  onChange,
  onSubmit,
  onCancelar,
}) => {
  // Inicialización de React Hook Form con validación declarativa Zod
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      idPaciente: formData?.idPaciente ?? '',
      idOdontologo: formData?.idOdontologo ?? '',
      fechaCita: formData?.fechaCita ?? '',
      horaInicioCita: formData?.horaInicioCita ?? '',
      horaFinCita: formData?.horaFinCita ?? '',
      estadoCita: formData?.estadoCita ?? 'PROGRAMADA',
    },
  });

  // Sincroniza los valores iniciales o modificados externamente desde la agenda
  useEffect(() => {
    reset({
      idPaciente: formData?.idPaciente ?? '',
      idOdontologo: formData?.idOdontologo ?? '',
      fechaCita: formData?.fechaCita ?? '',
      horaInicioCita: formData?.horaInicioCita ?? '',
      horaFinCita: formData?.horaFinCita ?? '',
      estadoCita: formData?.estadoCita ?? 'PROGRAMADA',
    });
  }, [formData, reset]);

  /**
   * Manejador específico para la hora de inicio que recalcula automáticamente la hora de finalización
   */
  const handleHoraInicioChange = (e) => {
    const val = e.target.value;
    setValue('horaInicioCita', val, { shouldValidate: true });
    const finCalculado = calcularHoraFin(val);
    setValue('horaFinCita', finCalculado, { shouldValidate: true });
    onChange?.(e);
    onChange?.({ target: { name: 'horaFinCita', value: finCalculado } });
  };

  /**
   * Actualiza el valor de React Hook Form y propaga el cambio al callback externo
   */
  const handleFieldChange = (name) => (e) => {
    setValue(name, e.target.value, { shouldValidate: true });
    onChange?.(e);
  };

  /**
   * Procesa el envío del formulario una vez superada la validación de Zod
   */
  const handleFormSubmit = (data) => {
    if (onChange) {
      Object.entries(data).forEach(([name, value]) => {
        onChange({ target: { name, value } });
      });
    }
    onSubmit?.(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 animate-fade-in"
    >
      {/* Encabezado descriptivo con botón de retorno */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
        <div>
          <h5 className="font-bold text-slate-800 text-base">
            {isEditing ? 'Editar Cita' : 'Programar Nueva Cita'}
          </h5>
          <p className="text-xs text-slate-400 mt-0.5">
            Fecha base seleccionada: {date?.toLocaleDateString('es-SV') ?? 'Hoy'}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancelar}
          icon={<i className="bi bi-arrow-left" />}
        >
          Volver
        </Button>
      </div>

      <div className="space-y-4">
        {/* Selector de Paciente con validación de error */}
        <Select
          label="Paciente"
          required
          name="idPaciente"
          value={watch('idPaciente')}
          error={errors.idPaciente?.message}
          onChange={handleFieldChange('idPaciente')}
        >
          <option value="">Selecciona un paciente del expediente...</option>
          {pacientes.map(p => (
            <option key={p.idPaciente} value={p.idPaciente}>
              {p.nombrePaciente} {p.apellidoPaciente} — DUI: {p.numeroIdentidadPaciente}
            </option>
          ))}
        </Select>

        {/* Selector de Odontólogo Especialista con validación de error */}
        <Select
          label="Odontólogo a cargo"
          required
          name="idOdontologo"
          value={watch('idOdontologo')}
          error={errors.idOdontologo?.message}
          onChange={handleFieldChange('idOdontologo')}
        >
          <option value="">Selecciona un especialista...</option>
          {odontologos.map(o => (
            <option key={o.idOdontologo} value={o.idOdontologo}>
              Dr(a). {o.nombreCompleto} — {o.jvpoId || o.especialidadOdontologo || 'General'}
            </option>
          ))}
        </Select>

        {/* Campo de Fecha de la Cita */}
        <Input
          type="date"
          label="Fecha de la Cita"
          required
          name="fechaCita"
          value={watch('fechaCita')}
          error={errors.fechaCita?.message}
          onChange={handleFieldChange('fechaCita')}
        />

        {/* Definición de Horarios (Inicio y Fin automático) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Hora de Inicio"
            required
            name="horaInicioCita"
            value={watch('horaInicioCita')}
            error={errors.horaInicioCita?.message}
            onChange={handleHoraInicioChange}
          />

          <div>
            <Input
              type="datetime-local"
              label="Hora de Finalización"
              name="horaFinCita"
              value={watch('horaFinCita')}
              error={errors.horaFinCita?.message}
              readOnly
              disabled
              helperText="Calculada automáticamente (duración estándar 1h)"
            />
          </div>
        </div>

        {/* Selector de Estado clínico visible únicamente durante la edición */}
        {isEditing && (
          <Select
            label="Estado de la Cita"
            name="estadoCita"
            value={watch('estadoCita')}
            error={errors.estadoCita?.message}
            onChange={handleFieldChange('estadoCita')}
          >
            {ESTADOS_CITA_OPCIONES.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </Select>
        )}

        {/* Botonera de acciones */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" fullWidth onClick={onCancelar} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            {isEditing ? 'Guardar Cambios' : 'Confirmar Cita'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AppointmentForm;
