/**
 * Propósito:
 * Componente visual de tarjeta para la visualización de citas médicas en la agenda.
 * Soporta dos variantes de diseño (modo compacto para calendarios semanales y modo extendido
 * con línea temporal para la vista diaria). Ofrece acciones rápidas contextuales para recepción
 * en sala de espera (Check-in), reversión de check-in, reprogramación de horario, edición y cancelación.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/AppointmentCard.jsx'. Componente de dominio clínico dentro de la
 * capa de componentes de presentación del módulo de agenda.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/AppointmentPage.jsx'
 * - Consume:
 *   - 'src/utils/cita.utils.js' ('formatHora')
 *   - 'src/components/ui/StatusBadge.jsx'
 *   - 'src/components/ui/AvatarBadge.jsx'
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.app - Objeto de datos con la información completa de la cita médica.
 * @param {boolean} [props.compact=false] - Si es true, renderiza la versión reducida apta para columnas semanales.
 * @param {(cita: Object) => void} [props.onEditar] - Callback para abrir la edición de la cita.
 * @param {(cita: Object) => void} [props.onCancelar] - Callback para iniciar la cancelación con motivo.
 * @param {(cita: Object) => void} [props.onReprogram] - Callback para abrir el modal de reprogramación.
 * @param {(cita: Object) => void} [props.onCheckIn] - Callback para transicionar la cita a PENDIENTE (recepción).
 * @param {(cita: Object) => void} [props.onDeshacerCheckIn] - Callback para revertir el estado a PROGRAMADA.
 * @returns {JSX.Element} Tarjeta renderizada con datos del paciente, horario, estado y acciones disponibles.
 */

import React from 'react';
import { formatHora } from '../utils/cita.utils';
import StatusBadge from './ui/StatusBadge';
import AvatarBadge from './ui/AvatarBadge';

const AppointmentCard = ({ app, compact = false, onEditar, onCancelar, onReprogram, onCheckIn, onDeshacerCheckIn }) => {
  // Regla de integridad: No se permite cancelar citas que ya alcanzaron un estado terminal
  const canCancel = !['CANCELADA', 'COMPLETADA', 'FINALIZADA'].includes(app.estadoCita);
  const initials = `${app.nombreCompletoPaciente?.[0] ?? '?'}`;

  /**
   * Subcomponente interno para la botonera de acciones rápidas
   */
  const Actions = () => (
    <div className="flex items-center gap-1">
      {/* Botón rápido de recepción / check-in (exclusivo para citas PROGRAMADAS) */}
      {app.estadoCita === 'PROGRAMADA' && onCheckIn && (
        <button
          type="button"
          onClick={() => onCheckIn?.(app)}
          aria-label="Registrar check-in"
          title="Marcar llegada (Check-in)"
          className="w-7 h-7 rounded-xl text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
        >
          <i className="bi bi-person-check-fill text-xs" />
        </button>
      )}

      {/* Botón de reversión de check-in si el paciente se retira o se marcó por error */}
      {app.estadoCita === 'PENDIENTE' && onDeshacerCheckIn && (
        <button
          type="button"
          onClick={() => onDeshacerCheckIn?.(app)}
          aria-label="Deshacer check-in"
          title="Deshacer check-in"
          className="w-7 h-7 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
        >
          <i className="bi bi-arrow-counterclockwise text-xs" />
        </button>
      )}

      {/* Botón de reprogramación modal de fecha u horario */}
      {onReprogram && (
        <button
          type="button"
          onClick={() => onReprogram?.(app)}
          aria-label="Reprogramar cita"
          title="Reprogramar fecha/hora"
          className="w-8 h-8 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600
                     flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
        >
          <i className="bi bi-calendar-event text-xs" />
        </button>
      )}

      {/* Botón para abrir el formulario de edición de campos */}
      <button
        type="button"
        onClick={() => onEditar?.(app)}
        aria-label="Editar cita"
        title="Editar detalles"
        className="w-8 h-8 rounded-xl text-slate-400 hover:bg-primary-50 hover:text-primary-600
                   flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
      >
        <i className="bi bi-pencil text-xs" />
      </button>

      {/* Botón condicional de cancelación */}
      {canCancel && (
        <button
          type="button"
          onClick={() => onCancelar?.(app)}
          aria-label="Cancelar cita"
          title="Cancelar cita"
          className="w-8 h-8 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500
                     flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
        >
          <i className="bi bi-trash text-xs" />
        </button>
      )}
    </div>
  );

  // Variante compacta optimizada para columnas angostas en la visualización semanal
  if (compact) {
    return (
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-primary-200
                      hover:shadow-card transition-all mb-2.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">
              {app.nombreCompletoPaciente}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <i className="bi bi-clock text-[10px]" />
              {formatHora(app.horaInicioCita)}
            </p>
          </div>
          <StatusBadge estado={app.estadoCita} />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
            {app.especialidadOdontologo || 'General'}
          </span>
          <Actions />
        </div>
      </div>
    );
  }

  // Variante estándar con indicador de línea cronológica vertical para la vista detallada por día
  return (
    <div className="flex gap-3.5 mb-3 group">
      {/* Indicador de hora lateral con conector vertical tipo timeline */}
      <div className="flex flex-col items-center flex-shrink-0 w-16 pt-1">
        <span className="text-xs font-bold text-primary-700 tabular-nums px-2 py-0.5 rounded-lg bg-primary-50">
          {formatHora(app.horaInicioCita)}
        </span>
        <div className="w-0.5 flex-1 bg-slate-200 my-1.5 group-hover:bg-primary-300 transition-colors" />
        <div className="w-2.5 h-2.5 rounded-full border-2 border-primary-500 bg-white" />
      </div>

      {/* Contenedor principal de datos clínicos y administrativos */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4
                      hover:border-primary-300 hover:shadow-card-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarBadge initials={initials} size="md" />
            <div className="min-w-0 flex-1">
              <h6 className="text-sm font-bold text-slate-800 truncate leading-snug">
                {app.nombreCompletoPaciente}
              </h6>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <i className="bi bi-person-badge text-[11px]" />
                <span>{app.especialidadOdontologo || 'Odontología General'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
            <StatusBadge estado={app.estadoCita} />

            {/* Acción destacada de Check-in para recepción */}
            {app.estadoCita === 'PROGRAMADA' && onCheckIn && (
              <button
                type="button"
                onClick={() => onCheckIn?.(app)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-all active:scale-95 shadow-2xs cursor-pointer"
                title="Registrar llegada del paciente a la clínica (Check-in)"
              >
                <i className="bi bi-person-check-fill text-sm" />
                <span>Check-in</span>
              </button>
            )}

            {app.estadoCita === 'PENDIENTE' && onDeshacerCheckIn && (
              <button
                type="button"
                onClick={() => onDeshacerCheckIn?.(app)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/60 transition-all active:scale-95 cursor-pointer"
                title="Deshacer check-in y regresar a Programada"
              >
                <i className="bi bi-arrow-counterclockwise text-xs" />
                <span>Deshacer</span>
              </button>
            )}

            <Actions />
          </div>
        </div>
      </div>
    </div>
  );
};


export default AppointmentCard;
