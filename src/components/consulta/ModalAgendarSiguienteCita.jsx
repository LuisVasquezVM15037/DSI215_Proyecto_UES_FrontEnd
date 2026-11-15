import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { getDisponibilidad, createCita } from '../../services/cita.service';
import { alertSuccess, alertError } from '../../utils/alert.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Modal para agendar la próxima cita de seguimiento de un paciente (Punto 5).
 * Se utiliza directamente en StepCierre sin necesidad de salir del flujo de consulta.
 */
export default function ModalAgendarSiguienteCita({
  isOpen,
  onClose,
  cita,
  hallazgosPendientes = [],
  onCitaAgendada,
}) {
  // Fecha mínima: mañana
  const manana = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [fechaCita, setFechaCita] = useState('');
  const [franjas, setFranjas] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);

  const idOdontologo = cita?.idOdontologo || cita?.odontologo?.idOdontologo;
  const idPaciente = cita?.idPaciente || cita?.paciente?.idPaciente;
  const nombrePaciente = cita?.nombreCompletoPaciente || cita?.paciente?.nombrePaciente || 'Paciente';

  // Al abrir el modal, sugerir fecha inicial (mañana)
  useEffect(() => {
    if (isOpen) {
      setFechaCita(manana);
      setSlotSeleccionado(null);
    }
  }, [isOpen, manana]);

  // Cargar disponibilidad dinámica al cambiar la fecha
  useEffect(() => {
    let activo = true;
    if (isOpen && idOdontologo && fechaCita) {
      setLoadingSlots(true);
      setSlotSeleccionado(null);
      getDisponibilidad(idOdontologo, fechaCita)
        .then((data) => {
          if (activo) {
            setFranjas(data?.horariosDisponibles ?? []);
          }
        })
        .catch((err) => {
          console.error('Error al obtener disponibilidad:', err);
          if (activo) setFranjas([]);
        })
        .finally(() => {
          if (activo) setLoadingSlots(false);
        });
    } else {
      setFranjas([]);
    }
    return () => {
      activo = false;
    };
  }, [isOpen, idOdontologo, fechaCita]);

  const handleSelectSlot = (slot) => {
    if (!slot.disponible) return;
    setSlotSeleccionado(slot);
  };

  const handleGuardarCita = async () => {
    if (!fechaCita) {
      alertError('Selecciona una fecha para la cita.');
      return;
    }
    if (!slotSeleccionado) {
      alertError('Selecciona un horario disponible de la lista.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        idOdontologo: parseInt(idOdontologo),
        idPaciente: parseInt(idPaciente),
        fechaCita: fechaCita,
        horaInicioCita: slotSeleccionado.horaInicioIso,
        horaFinCita: slotSeleccionado.horaFinIso,
        estadoCita: 'PROGRAMADA',
      };

      const nuevaCita = await createCita(payload);
      alertSuccess(
        'Próxima cita agendada',
        `La cita para ${nombrePaciente} quedó programada para el ${fechaCita} de ${slotSeleccionado.horaInicio} a ${slotSeleccionado.horaFin}.`
      );

      onCitaAgendada?.(nuevaCita || {
        fechaCita,
        horaInicio: slotSeleccionado.horaInicio,
        horaFin: slotSeleccionado.horaFin,
      });
      onClose();
    } catch (err) {
      alertError(err.message || 'No se pudo agendar la cita de seguimiento.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Cita de Seguimiento"
      subtitle={`Paciente: ${nombrePaciente}`}
      size="lg"
    >
      <div className="space-y-4">

        {/* Resumen de procedimientos pendientes */}
        {hallazgosPendientes.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <i className="bi bi-hourglass-split text-amber-600"></i>
              Procedimientos a continuar en la próxima sesión:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hallazgosPendientes.map((h) => (
                <span
                  key={h.idPlanTratamiento}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800 text-[11px] font-medium"
                >
                  {h.piezaDental ? `P.${h.piezaDental}` : 'General'}: {h.nombreTratamiento}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Selector de fecha */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Fecha para la próxima cita *
          </label>
          <input
            type="date"
            min={manana}
            value={fechaCita}
            onChange={(e) => setFechaCita(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Horarios disponibles */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Horarios Disponibles del Odontólogo *
          </label>

          {loadingSlots && (
            <p className="text-xs text-slate-400 py-3 text-center">Consultando agenda disponible...</p>
          )}

          {!loadingSlots && franjas.length === 0 && (
            <p className="text-xs text-slate-400 py-3 text-center italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No hay horarios disponibles para la fecha seleccionada. Por favor elige otro día.
            </p>
          )}

          {!loadingSlots && franjas.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {franjas.map((slot, idx) => {
                const isSelected = slotSeleccionado?.horaInicioIso === slot.horaInicioIso;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!slot.disponible}
                    onClick={() => handleSelectSlot(slot)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                      !slot.disponible
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm scale-102 ring-2 ring-primary-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 cursor-pointer'
                    }`}
                  >
                    <div>{slot.horaInicio}</div>
                    <div className="text-[10px] font-normal opacity-80">{slot.horaFin}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Slot seleccionado */}
        {slotSeleccionado && (
          <div className="p-3 bg-primary-50/80 border border-primary-200 rounded-xl text-xs flex items-center justify-between text-primary-900">
            <div className="flex items-center gap-2">
              <i className="bi bi-clock-fill text-primary-600 text-sm"></i>
              <span>
                Horario seleccionado: <strong>{slotSeleccionado.horaInicio} — {slotSeleccionado.horaFin}</strong> ({fechaCita})
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-primary-200 text-primary-800 px-2 py-0.5 rounded-full">
              Confirmado
            </span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarCita}
            loading={submitting}
            disabled={!slotSeleccionado || !fechaCita}
            icon={<i className="bi bi-calendar-check" />}
          >
            Agendar Cita
          </Button>
        </div>

      </div>
    </Modal>
  );
}
