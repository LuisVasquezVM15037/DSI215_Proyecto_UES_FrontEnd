import React, { useState, useMemo, useEffect } from 'react';
import { ESTADOS_CITA_OPCIONES } from '../constants/estados.constants';
import Button from './ui/Button';
import SearchableSelect from './ui/SearchableSelect';
import { getDisponibilidad } from '../services/cita.service';
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
                transition-all ${props.error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} ${props.className ?? ''}`}
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
  const [franjasHorarias, setFranjasHorarias] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  // ── Cálculo dinámico de horarios disponibles (DENTALCARE-62 / PBI-Secret-09) ──
  useEffect(() => {
    let activo = true;
    if (formData.idOdontologo && formData.fechaCita) {
      setLoadingSlots(true);
      getDisponibilidad(formData.idOdontologo, formData.fechaCita)
        .then(data => {
          if (activo) {
            setFranjasHorarias(data?.horariosDisponibles ?? []);
          }
        })
        .catch(err => {
          console.error('Error al consultar disponibilidad:', err);
          if (activo) setFranjasHorarias([]);
        })
        .finally(() => {
          if (activo) setLoadingSlots(false);
        });
    } else {
      setFranjasHorarias([]);
    }
    return () => { activo = false; };
  }, [formData.idOdontologo, formData.fechaCita]);

  // ── Detección de conflicto de horario (DENTALCARE-60 / PBI-Secret-08) ────────
  const hayConflictoHorario = useMemo(() => {
    if (!formData.horaInicioCita || !formData.horaFinCita || franjasHorarias.length === 0) {
      return false;
    }
    return franjasHorarias.some(slot => {
      // Ignorar la cita propia si estamos editando
      if (isEditing && formData.idCitas && slot.idCita === formData.idCitas) {
        return false;
      }
      if (!slot.disponible) {
        // Conflicto si hay solapamiento: inicio < slotFin && fin > slotInicio
        return formData.horaInicioCita < slot.horaFinIso && formData.horaFinCita > slot.horaInicioIso;
      }
      return false;
    });
  }, [formData.horaInicioCita, formData.horaFinCita, franjasHorarias, isEditing, formData.idCitas]);

  const handleHoraInicioChange = (e) => {
    const nuevaHoraInicio = e.target.value;
    onChange(e);
    onChange({ target: { name: 'horaFinCita', value: calcularHoraFin(nuevaHoraInicio) } });
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

  const handleSelectSlot = (slot) => {
    if (!slot.disponible) return;
    onChange({ target: { name: 'horaInicioCita', value: slot.horaInicioIso } });
    onChange({ target: { name: 'horaFinCita', value: slot.horaFinIso } });
    if (errors.horaInicioCita) {
      setErrors(prev => ({ ...prev, horaInicioCita: '' }));
    }
  };

  const handleValidateAndSubmit = () => {
    const newErrors = {};
    if (!formData.idPaciente) newErrors.idPaciente = 'Debe seleccionar un paciente de la lista.';
    if (!formData.idOdontologo) newErrors.idOdontologo = 'Debe seleccionar un odontólogo especialista.';
    if (!formData.fechaCita) newErrors.fechaCita = 'La fecha de la cita es obligatoria.';
    if (!formData.horaInicioCita) newErrors.horaInicioCita = 'La hora de inicio es obligatoria.';

    if (hayConflictoHorario) {
      newErrors.horaInicioCita = 'Conflicto detectado: El odontólogo ya tiene una cita asignada en ese bloque horario.';
    }

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

        {/* ── FRANIAS HORARIAS DISPONIBLES EN TIEMPO REAL (DENTALCARE-62) ── */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i className="bi bi-clock-history text-primary-600"></i>
              Horarios Disponibles (Selección Directa)
            </span>
            {loadingSlots && (
              <span className="text-[11px] text-primary-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
                Consultando agenda...
              </span>
            )}
          </div>

          {!formData.idOdontologo || !formData.fechaCita ? (
            <p className="text-[11px] text-slate-400 italic">
              Selecciona el odontólogo y la fecha para calcular los horarios libres en tiempo real.
            </p>
          ) : loadingSlots ? (
            <div className="py-4 text-center text-xs text-slate-400">
              Verificando disponibilidad de agenda médica...
            </div>
          ) : franjasHorarias.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">
              No hay franjas horarias configuradas para la fecha seleccionada.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {franjasHorarias.map((slot) => {
                const isSelected =
                  formData.horaInicioCita &&
                  formData.horaInicioCita.startsWith(slot.horaInicioIso);

                return (
                  <button
                    key={slot.horaInicio}
                    type="button"
                    disabled={!slot.disponible}
                    onClick={() => handleSelectSlot(slot)}
                    title={slot.disponible ? 'Clic para seleccionar horario' : slot.motivo || 'Horario ocupado'}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold text-center transition-all flex flex-col items-center justify-center border ${
                      !slot.disponible
                        ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 line-through'
                        : isSelected
                        ? 'border-primary-600 bg-primary-600 text-white shadow-sm ring-2 ring-primary-200 font-bold'
                        : 'border-primary-200 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-300 active:scale-95 cursor-pointer shadow-xs'
                    }`}
                  >
                    <span>{slot.horaInicio} - {slot.horaFin}</span>
                    <span className="text-[10px] font-normal opacity-90">
                      {slot.disponible ? 'Disponible' : 'Ocupado'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── ALERTA DE CONFLICTO DE HORARIO (DENTALCARE-60) ── */}
        {hayConflictoHorario && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
            <i className="bi bi-exclamation-triangle-fill text-red-500 text-base mt-0.5 shrink-0"></i>
            <div>
              <strong className="font-bold block">Conflicto de Horario Detectado</strong>
              <span>
                El odontólogo ya tiene una cita agendada que se solapa con el horario seleccionado.
                Por favor, elige uno de los horarios libres marcados como disponibles.
              </span>
            </div>
          </div>
        )}

        {/* Horas Manuales / Automáticas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Hora inicio</Label>
            <Input
              type="datetime-local"
              name="horaInicioCita"
              value={formData.horaInicioCita}
              onChange={handleHoraInicioChange}
              error={errors.horaInicioCita || hayConflictoHorario}
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
            <p className="mt-1 text-[11px] text-slate-400">Calculada automáticamente (1 hora).</p>
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
          <Button
            fullWidth
            onClick={handleValidateAndSubmit}
            loading={loading}
            disabled={hayConflictoHorario}
            className={hayConflictoHorario ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isEditing ? 'Guardar Cambios' : 'Confirmar Cita'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
