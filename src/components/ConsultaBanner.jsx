import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

//Banner superior de la consulta activa. Muestra info del paciente y el indicador de pasos.
//cita> Objeto cita con campos: nombreCompletoPaciente, numeroIdentidadPaciente, especialidadOdontologo.
//step> Paso actual de la consulta (1-4).
//onStepClick> Callback al hacer click en un paso completado. Recibe el número del paso.
//onVolver> Callback al hacer click en el botón volver.

// Configuración de pasos para el indicador. Edita las etiquetas o agrega más pasos según tu flujo de consulta.
const STEPS = [
  { num: 1, label: 'Evaluación'  },
  { num: 2, label: 'Odontograma' },
  { num: 3, label: 'Prescripción'},
  { num: 4, label: 'Cierre'      },
];

/**
 * Banner superior de la consulta activa.
 * Muestra info del paciente y el indicador de pasos.
 */
const ConsultaBanner = ({ cita, step, onStepClick, onVolver }) => (
  <div className="flex items-center justify-between gap-4 bg-white rounded-2xl
                  border border-slate-200 shadow-card px-5 py-3 flex-shrink-0
                  animate-fade-in-down">

    {/* Info del paciente */}
    <div className="flex items-center gap-4 min-w-0">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors
                        ${step >= 4 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
    {/* Nombre del paciente */}
      <div className="min-w-0">
        <span className="text-xs text-slate-400 block leading-none mb-0.5">Consulta en curso</span>
        <h6 className="font-bold text-slate-800 text-sm truncate leading-tight">
          {cita.nombreCompletoPaciente}
        </h6>
      </div>

      <div className="hidden sm:block w-px h-8 bg-slate-200 flex-shrink-0" />
{/* DUI del paciente */}
      <div className="hidden sm:block min-w-0">
        <span className="text-[10px] text-slate-400 block uppercase tracking-wide">DUI</span>
        <span className="text-sm font-semibold text-slate-700">{cita.numeroIdentidadPaciente}</span>
      </div>

      <div className="hidden md:block w-px h-8 bg-slate-200 flex-shrink-0" />
{/* Especialidad del odontólogo */}
      <div className="hidden md:block min-w-0">
        <span className="text-[10px] text-slate-400 block uppercase tracking-wide">Especialidad</span>
        <span className="text-sm font-semibold text-slate-700">{cita.especialidadOdontologo}</span>
      </div>
    </div>

    {/* Indicador de pasos en el mismo banner  de la info del paciente atendido en la cita*/}
    <nav aria-label="Pasos de la consulta" className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const done   = step > s.num; // El paso ya fue completado
        const active = step === s.num; // El paso está activo ahora
        return (
          <React.Fragment key={s.num}>
            {/* Botón de paso individual.
                Solo es clickeable si el paso ya está completado (done=true).
                Estados visuales: active (azul) | done (verde) | pendiente (gris). */}
            <button
              type="button"
              onClick={() => done && onStepClick(s.num)} // Solo navega si el paso está completado
              disabled={!done} // Pasos futuros deshabilitados
              aria-label={s.label}
              aria-current={active ? 'step' : undefined} // Indica el paso actual para accesibilidad
              // Paso activo: azul, paso completado: verde, paso pendiente: gris
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                          transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary-500
                          disabled:cursor-default 
                          ${active
                            ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                            : done
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 cursor-default'}`}
            >
              {/* Si el paso está completo, muestra ícono check; si no, muestra el número */}
              {done
                ? <i className="bi bi-check-circle-fill text-[11px]" aria-hidden="true" />
                : <span className="w-4 h-4 rounded-full border border-current flex items-center
                                   justify-center text-[10px] leading-none">{s.num}</span>
              }
              {/* Label del paso: oculto en mobile (visible solo en sm+).
                  Para mostrar siempre, quita 'hidden sm:inline'. */}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {/* Línea conectora entre pasos (no se muestra después del último paso) */}
            {i < STEPS.length - 1 && (
              <div className={`w-3 h-px flex-shrink-0 ${step > s.num + 1 ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </nav>

    {/* Botón volver  al fial del banner en la parte derecha*/}
    <button
      type="button"
      onClick={onVolver}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600
                 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors
                 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-primary-500"
    >
      <i className="bi bi-arrow-left text-xs" />
      {/* El boton se oculta en mobile. Para mostrarlo siempre, quitar 'hidden sm:inline'. */}
      <span className="hidden sm:inline">Volver</span>
    </button>
  </div>
);

export default ConsultaBanner;
