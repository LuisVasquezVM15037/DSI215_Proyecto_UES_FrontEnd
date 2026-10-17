import React, { useState, useMemo } from 'react';
import { ESTADOS_CITA_OPCIONES } from '../constants/estados.constants';
import Button from './ui/Button';
import SearchableSelect from './ui/SearchableSelect';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white
                text-slate-800 placeholder-slate-400 outline-none
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all ${props.error ? 'border-red-400' : 'border-slate-200'} ${props.className ?? ''}`}
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
               text-slate-800 outline-none focus:ring-2 focus:ring-primary-500
               focus:border-transparent transition-all"
  >
    {children}
  </select>
);

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
  isEditing, date, formData,
  pacientes = [], odontologos = [], loading,
  onChange, onSubmit, onCancelar,
}) => {
  const [errors, setErrors] = useState({});

  const pacienteOptions = useMemo(() => (
    pacientes.map(p => ({
      value: p.idPaciente,
      label: `${p.nombrePaciente} ${p.apellidoPaciente}`,
      sublabel: `DUI: ${p.numeroIdentidadPaciente || 'Menor / Sin DUI'}`,
    }))
  ), [pacientes]);

  const odontologoOptions = useMemo(() => (
    odontologos.map(o => ({
      value: o.idOdontologo,
      label: `Dr(a). ${o.nombreCompleto}`,
      sublabel: o.jvpoId ? `JVPO: ${o.jvpoId}` : (o.especialidadOdontologo || 'Especialista'),
    }))
  ), [odontologos]);

  const handleHoraInicioChange = (e) => {
    onChange(e);
    onChange({ target: { name: 'horaFinCita', value: calcularHoraFin(e.target.value) } });
    if (errors.horaInicioCita) {
      setErrors(prev => ({ ...prev, horaInicioCita: '' }));
    }
  };

  const handleFieldChange = (name, value) => {
    onChange({ target: { name, value } });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleValidateAndSubmit = () => {
    const newErrors = {};
    if (!formData.idPaciente) newErrors.idPaciente = 'Debe seleccionar un paciente de la lista.';
    if (!formData.idOdontologo) newErrors.idOdontologo = 'Debe seleccionar un odontólogo especialista.';
    if (!formData.fechaCita) newErrors.fechaCita = 'La fecha de la cita es obligatoria.';
    if (!formData.horaInicioCita) newErrors.horaInicioCita = 'La hora de inicio es obligatoria.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h5 className="font-bold text-slate-800">
          {isEditing ? 'Editar Cita' : `Nueva Cita — ${date.toLocaleDateString('es-SV')}`}
        </h5>
        <Button variant="ghost" size="sm" onClick={onCancelar} icon={<i className="bi bi-arrow-left" />}>
          Volver
        </Button>
      </div>

      <div className="space-y-4">
        {/* Paciente con control de búsqueda predictivo */}
        <div>
          <Label required>Paciente</Label>
          <SearchableSelect
            name="idPaciente"
            value={formData.idPaciente}
            options={pacienteOptions}
            onChange={(e) => handleFieldChange('idPaciente', e.target.value)}
            placeholder="Escribe para buscar paciente por nombre o DUI..."
            error={errors.idPaciente}
          />
        </div>

        {/* Odontólogo con control de búsqueda predictivo */}
        <div>
          <Label required>Odontólogo Especialista</Label>
          <SearchableSelect
            name="idOdontologo"
            value={formData.idOdontologo}
            options={odontologoOptions}
            onChange={(e) => handleFieldChange('idOdontologo', e.target.value)}
            placeholder="Escribe para buscar odontólogo por nombre o JVPO..."
            error={errors.idOdontologo}
          />
        </div>

        {/* Fecha */}
        <div>
          <Label required>Fecha</Label>
          <Input
            type="date"
            name="fechaCita"
            value={formData.fechaCita}
            onChange={(e) => handleFieldChange('fechaCita', e.target.value)}
            error={errors.fechaCita}
          />
          {errors.fechaCita && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <i className="bi bi-exclamation-circle" /> {errors.fechaCita}
            </p>
          )}
        </div>

        {/* Horas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Hora inicio</Label>
            <Input
              type="datetime-local"
              name="horaInicioCita"
              value={formData.horaInicioCita}
              onChange={handleHoraInicioChange}
              error={errors.horaInicioCita}
            />
            {errors.horaInicioCita && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <i className="bi bi-exclamation-circle" /> {errors.horaInicioCita}
              </p>
            )}
          </div>
          <div>
            <Label>Hora fin</Label>
            <Input
              type="datetime-local"
              name="horaFinCita"
              value={formData.horaFinCita}
              readOnly
              tabIndex={-1}
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
              title="Se calcula automáticamente (1 hora de duración)"
            />
            <p className="mt-1 text-[11px] text-slate-400">Calculada automáticamente (1 hora de duración).</p>
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {isEditing && (
          <div>
            <Label>Estado de la cita</Label>
            <Select name="estadoCita" value={formData.estadoCita} onChange={onChange}>
              {ESTADOS_CITA_OPCIONES.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={onCancelar} disabled={loading}>
            Cancelar
          </Button>
          <Button fullWidth onClick={handleValidateAndSubmit} loading={loading}>
            {isEditing ? 'Guardar Cambios' : 'Confirmar Cita'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
