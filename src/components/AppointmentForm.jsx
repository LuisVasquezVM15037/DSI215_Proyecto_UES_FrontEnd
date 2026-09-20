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

import React from 'react';
import { ESTADOS_CITA_OPCIONES } from '../constants/estados.constants';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

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
  /**
   * Manejador específico para la hora de inicio que recalcula automáticamente la hora de finalización
   */
  const handleHoraInicioChange = (e) => {
    onChange(e);
    onChange({ target: { name: 'horaFinCita', value: calcularHoraFin(e.target.value) } });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 animate-fade-in">
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
          variant="ghost"
          size="sm"
          onClick={onCancelar}
          icon={<i className="bi bi-arrow-left" />}
        >
          Volver
        </Button>
      </div>

      <div className="space-y-4">
        {/* Selector de Paciente */}
        <Select
          label="Paciente"
          required
          name="idPaciente"
          value={formData.idPaciente}
          onChange={onChange}
        >
          <option value="">Selecciona un paciente del expediente...</option>
          {pacientes.map(p => (
            <option key={p.idPaciente} value={p.idPaciente}>
              {p.nombrePaciente} {p.apellidoPaciente} — DUI: {p.numeroIdentidadPaciente}
            </option>
          ))}
        </Select>

        {/* Selector de Odontólogo Especialista */}
        <Select
          label="Odontólogo a cargo"
          required
          name="idOdontologo"
          value={formData.idOdontologo}
          onChange={onChange}
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
          value={formData.fechaCita}
          onChange={onChange}
        />

        {/* Definición de Horarios (Inicio y Fin automático) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Hora de Inicio"
            required
            name="horaInicioCita"
            value={formData.horaInicioCita}
            onChange={handleHoraInicioChange}
          />

          <div>
            <Input
              type="datetime-local"
              label="Hora de Finalización"
              name="horaFinCita"
              value={formData.horaFinCita}
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
            value={formData.estadoCita}
            onChange={onChange}
          >
            {ESTADOS_CITA_OPCIONES.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </Select>
        )}

        {/* Botonera de acciones */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" fullWidth onClick={onCancelar} disabled={loading}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onSubmit} loading={loading}>
            {isEditing ? 'Guardar Cambios' : 'Confirmar Cita'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
