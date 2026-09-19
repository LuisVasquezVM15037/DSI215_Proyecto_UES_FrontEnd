import React from 'react';
import { ESTADOS_CITA_OPCIONES } from '../constants/estados.constants';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

/**
 * Suma 1 hora a un valor de <input type="datetime-local"> ("YYYY-MM-DDTHH:mm")
 * y lo devuelve en el mismo formato y en hora LOCAL.
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

/**
 * Formulario de creación/edición de cita usando las primitivas UI estandarizadas.
 */
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
  const handleHoraInicioChange = (e) => {
    onChange(e);
    onChange({ target: { name: 'horaFinCita', value: calcularHoraFin(e.target.value) } });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 animate-fade-in">
      {/* Encabezado */}
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
        {/* Paciente */}
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

        {/* Odontólogo */}
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

        {/* Fecha */}
        <Input
          type="date"
          label="Fecha de la Cita"
          required
          name="fechaCita"
          value={formData.fechaCita}
          onChange={onChange}
        />

        {/* Horarios */}
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

        {/* Estado (solo en edición) */}
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

        {/* Acciones */}
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
