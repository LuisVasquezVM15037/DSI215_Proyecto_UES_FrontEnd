import React from 'react';
import { formatHora, getEstadoConfig } from '../utils/cita.utils';
import StatusBadge from './ui/StatusBadge';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Tarjeta de citas con dos modos de visualización.
 * compact=false → vista día (con línea de tiempo lateral)
 * compact=true  → vista semana (compacta, sin línea)
 */
const AppointmentCard = ({ app, compact = false, onEditar, onCancelar, onReprogram }) => {
  // Determina si el botón de cancelar debe mostrarse.
  // Los estados en este array indican citas que ya no pueden ser canceladas.
  const canCancel = !['CANCELADA', 'COMPLETADA', 'FINALIZADA'].includes(app.estadoCita);
//app> Objeto cita con campos: nombreCompletoPaciente, estadoCita, horaInicioCita, especialidadOdontologo.
//compact> Activa el modo compacto. Default: false
//onEditar> Callback al presionar el botón de editar. Recibe el objeto `app`.
//onCancelar> Callback al presionar el botón de cancelar. Recibe el objeto `app`.
//onReprogram> Callback al presionar el botón de reprogramar. Recibe el objeto `app`.
  const Actions = () => (
    <div className="flex items-center gap-0.5">
      {/* Botón Editar: siempre visible. Para cambiar ícono, edita 'bi-pencil'. */}
      <button
        onClick={() => onEditar?.(app)}
        aria-label="Editar cita"
        title="Editar"
        className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary-600
                   flex items-center justify-center transition-colors"
      >
        <i className="bi bi-pencil text-xs" />
      </button>
      {/* Botón Cancelar: visible solo si `canCancel` es true (el estado permite cancelación).*/}
      {canCancel && (
        <button
          onClick={() => onCancelar?.(app)}
          aria-label="Cancelar cita"
          title="Cancelar"
          className="w-7 h-7 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500
                     flex items-center justify-center transition-colors"
        >
          <i className="bi bi-trash text-xs" />
        </button>
      )}
      {/* Botón Reprogramar: visible solo si el padre pasa el prop `onReprogram` Para que aparezca condicionalmente por estado, agrega otra condición aquí. */}
      {onReprogram && (
        <button
          onClick={() => onReprogram?.(app)}
          aria-label="Reprogramar cita"
          title="Reprogramar"
          className="w-7 h-7 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600
                     flex items-center justify-center transition-colors"
        >
          <i className="bi bi-calendar-event text-xs" />
        </button>
      )}
    </div>
  );
// Para modificar qué datos se muestran en modo compacto, edita este bloque.
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl
                      bg-white border border-slate-100 hover:border-slate-200
                      hover:shadow-card transition-all mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {app.nombreCompletoPaciente}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <i className="bi bi-clock text-[10px]" />
            {formatHora(app.horaInicioCita)} — {app.especialidadOdontologo}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge estado={app.estadoCita} />
          <Actions />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-3">
      {/* Indicador de hora lateral */}
      <div className="flex flex-col items-center flex-shrink-0 w-12 pt-1">
        <span className="text-xs font-bold text-primary-600 tabular-nums leading-none">
          {formatHora(app.horaInicioCita)}
        </span>
        <div className="w-px flex-1 bg-primary-100 mt-1.5 mb-1" />
        <div className="w-2 h-2 rounded-full bg-primary-300" />
      </div>

      {/* Tarjeta */}
      <div className="flex-1 bg-white border border-slate-100 rounded-xl p-3
                      hover:border-primary-200 hover:shadow-card transition-all">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h6 className="text-sm font-semibold text-slate-800 truncate leading-tight">
              {app.nombreCompletoPaciente}
            </h6>
            <p className="text-xs text-slate-400 mt-0.5">{app.especialidadOdontologo}</p>
          </div>
          <StatusBadge estado={app.estadoCita} />
        </div>
        <div className="flex justify-end">
          <Actions />
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
