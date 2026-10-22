import React, { useState, useEffect, useMemo } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { getDisponibilidad } from '../services/cita.service';

const INITIAL = { fechaCita: '', horaInicioCita: '', horaFinCita: '' };

const Label = ({ children }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 text-sm border rounded-xl bg-white
               text-slate-800 outline-none focus:ring-2 focus:ring-primary-500
               focus:border-transparent transition-all ${
                 props.error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'
               } ${props.className ?? ''}`}
  />
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

const ReprogramModal = ({ cita, loading, onConfirmar, onCerrar }) => {
  const [reprogramData, setReprogramData] = useState(INITIAL);
  const [franjas, setFranjas] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    let activo = true;
    if (cita?.idOdontologo && reprogramData.fechaCita) {
      setLoadingSlots(true);
      getDisponibilidad(cita.idOdontologo, reprogramData.fechaCita)
        .then(data => {
          if (activo) setFranjas(data?.horariosDisponibles ?? []);
        })
        .catch(err => {
          console.error(err);
          if (activo) setFranjas([]);
        })
        .finally(() => {
          if (activo) setLoadingSlots(false);
        });
    } else {
      setFranjas([]);
    }
    return () => { activo = false; };
  }, [cita?.idOdontologo, reprogramData.fechaCita]);

  const hayConflicto = useMemo(() => {
    if (!reprogramData.horaInicioCita || !reprogramData.horaFinCita || franjas.length === 0) {
      return false;
    }
    return franjas.some(slot => {
      if (slot.idCita === cita?.idCitas) return false;
      if (!slot.disponible) {
        return reprogramData.horaInicioCita < slot.horaFinIso && reprogramData.horaFinCita > slot.horaInicioIso;
      }
      return false;
    });
  }, [reprogramData.horaInicioCita, reprogramData.horaFinCita, franjas, cita?.idCitas]);

  const handleChange = (campo, valor) => {
    setReprogramData(prev => {
      const next = { ...prev, [campo]: valor };
      if (campo === 'horaInicioCita') {
        next.horaFinCita = calcularHoraFin(valor);
      }
      return next;
    });
  };

  const handleSelectSlot = (slot) => {
    if (!slot.disponible) return;
    setReprogramData(prev => ({
      ...prev,
      horaInicioCita: slot.horaInicioIso,
      horaFinCita: slot.horaFinIso,
    }));
  };

  const handleClose = () => {
    setReprogramData(INITIAL);
    setFranjas([]);
    onCerrar();
  };

  return (
    <Modal
      isOpen={!!cita}
      onClose={handleClose}
      title="Reprogramar Cita Médica"
      subtitle={cita ? `Paciente: ${cita.nombreCompletoPaciente}` : ''}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirmar(reprogramData)}
            loading={loading}
            disabled={hayConflicto || !reprogramData.fechaCita || !reprogramData.horaInicioCita}
          >
            Confirmar Reprogramación
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Nueva Fecha de la Cita</Label>
          <Input
            type="date"
            value={reprogramData.fechaCita}
            onChange={e => handleChange('fechaCita', e.target.value)}
          />
        </div>

        {/* Franjas Horarias en Reprogramación */}
        {reprogramData.fechaCita && (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <i className="bi bi-clock text-primary-600"></i>
                Horarios Libres para el Especialista
              </span>
              {loadingSlots && (
                <span className="text-[11px] text-primary-600">Consultando...</span>
              )}
            </div>

            {loadingSlots ? (
              <p className="text-xs text-slate-400 text-center py-2">Consultando disponibilidad...</p>
            ) : franjas.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay horarios disponibles.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {franjas.map(slot => {
                  const isSelected =
                    reprogramData.horaInicioCita &&
                    reprogramData.horaInicioCita.startsWith(slot.horaInicioIso);

                  return (
                    <button
                      key={slot.horaInicio}
                      type="button"
                      disabled={!slot.disponible && slot.idCita !== cita?.idCitas}
                      onClick={() => handleSelectSlot(slot)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        !slot.disponible && slot.idCita !== cita?.idCitas
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 line-through'
                          : isSelected
                          ? 'border-primary-600 bg-primary-600 text-white font-bold'
                          : 'border-primary-200 bg-white text-primary-700 hover:bg-primary-50 cursor-pointer'
                      }`}
                    >
                      {slot.horaInicio} - {slot.horaFin}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {hayConflicto && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-red-500"></i>
            <span>Horario en conflicto con otra cita asignada al doctor. Elige una franja libre.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nueva Hora Inicio</Label>
            <Input
              type="datetime-local"
              value={reprogramData.horaInicioCita}
              onChange={e => handleChange('horaInicioCita', e.target.value)}
              error={hayConflicto}
            />
          </div>
          <div>
            <Label>Nueva Hora Fin</Label>
            <Input
              type="datetime-local"
              value={reprogramData.horaFinCita}
              readOnly
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReprogramModal;
