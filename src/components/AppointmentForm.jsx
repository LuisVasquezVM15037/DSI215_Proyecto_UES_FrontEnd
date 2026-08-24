import React from 'react';
import { ESTADOS_CITA_OPCIONES } from '../constants/estados.constants';
import Button from './ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

//Tarjeta de cita con acciones de crear, editar, cancelar y reprogramar. El botón de cancelar se muestra solo si el estado de la cita lo permite (no está cancelada, completada o finalizada). El botón de reprogramar se muestra solo si el padre pasa el prop `onReprogram`. En modo compacto, solo se muestran el nombre del paciente y el estado, junto con los botones de acción.

const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                text-slate-800 placeholder-slate-400 outline-none
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all ${props.className ?? ''}`}
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

/**
 * Suma 1 hora a un valor de <input type="datetime-local"> ("YYYY-MM-DDTHH:mm")
 * y lo devuelve en el mismo formato y en hora LOCAL (sin pasar por UTC).
 */
const calcularHoraFin = (horaInicio) => {
  if (!horaInicio) return '';
  const fin = new Date(horaInicio);          // datetime-local sin offset → hora local
  if (Number.isNaN(fin.getTime())) return '';
  fin.setHours(fin.getHours() + 1);          // maneja el cambio de día automáticamente
  const pad = (n) => String(n).padStart(2, '0');
  return `${fin.getFullYear()}-${pad(fin.getMonth() + 1)}-${pad(fin.getDate())}`
    + `T${pad(fin.getHours())}:${pad(fin.getMinutes())}`;
};

/**
 * Formulario de creación/edición de cita.
 * Puramente presentacional — sin lógica de fetch.
 */
const AppointmentForm = ({
  isEditing, date, formData,
  pacientes, odontologos, loading,
  onChange, onSubmit, onCancelar,
}) => {
  // Al cambiar la hora de inicio: propaga inicio y, además, calcula y propaga fin (+1h).
  const handleHoraInicioChange = (e) => {
    onChange(e);                                                  // 1) hora inicio
    onChange({ target: { name: 'horaFinCita', value: calcularHoraFin(e.target.value) } }); // 2) hora fin
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
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
        {/* Paciente */}
        <div>
          <Label required>Paciente</Label>
          <Select name="idPaciente" value={formData.idPaciente} onChange={onChange}>
            <option value="">Seleccione un paciente...</option>
            {pacientes.map(p => (
              <option key={p.idPaciente} value={p.idPaciente}>
                {p.nombrePaciente} {p.apellidoPaciente} — {p.numeroIdentidadPaciente}
              </option>
            ))}
          </Select>
        </div>

        {/* Odontólogo */}
        <div>
          <Label required>Odontólogo</Label>
          <Select name="idOdontologo" value={formData.idOdontologo} onChange={onChange}>
            <option value="">Seleccione un odontólogo...</option>
            {odontologos.map(o => (
              <option key={o.idOdontologo} value={o.idOdontologo}>
                Dr(a). {o.nombreCompleto} -- {o.jvpoId}
              </option>
            ))}
          </Select>
        </div>

        {/* Fecha */}
        <div>
          <Label required>Fecha</Label>
          <Input type="date" name="fechaCita" value={formData.fechaCita} onChange={onChange} />
        </div>

        {/* Horas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Hora inicio</Label>
            <Input
              type="datetime-local"
              name="horaInicioCita"
              value={formData.horaInicioCita}
              onChange={handleHoraInicioChange}
            />
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
            <p className="mt-1 text-[11px] text-slate-400">Se calcula sola: 1 hora de duración.</p>
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {isEditing && (
          <div>
            <Label>Estado</Label>
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
          <Button fullWidth onClick={onSubmit} loading={loading}>
            {isEditing ? 'Guardar Cambios' : 'Confirmar Cita'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
