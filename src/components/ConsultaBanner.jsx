import React from 'react';

const STEPS = [
  { num: 1, label: 'Evaluación',   icon: 'bi-clipboard-pulse' },
  { num: 2, label: 'Odontograma',  icon: 'bi-diagram-3' },
  { num: 3, label: 'Prescripción', icon: 'bi-capsule' },
  { num: 4, label: 'Cierre',       icon: 'bi-check2-circle' },
];

/**
 * Banner superior de la consulta activa con datos del paciente y stepper de progreso interactivo.
 */
const ConsultaBanner = ({ cita, step, onStepClick, onVolver }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-3xl
                  border border-slate-200/80 shadow-card px-6 py-3.5 flex-shrink-0
                  animate-fade-in-down">

    {/* Datos del paciente */}
    <div className="flex items-center gap-4 min-w-0">
      <div className="relative flex items-center justify-center flex-shrink-0">
        <span className={`w-3 h-3 rounded-full transition-colors ${step >= 4 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        <span className={`absolute w-5 h-5 rounded-full animate-ping opacity-30 ${step >= 4 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
      </div>

      <div className="min-w-0">
        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider block leading-none mb-1">
          Consulta en Curso
        </span>
        <h6 className="font-extrabold text-slate-800 text-sm md:text-base truncate leading-tight font-display">
          {cita.nombreCompletoPaciente}
        </h6>
      </div>

      <div className="hidden sm:block w-px h-8 bg-slate-200 flex-shrink-0" />

      <div className="hidden sm:block min-w-0">
        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">DUI</span>
        <span className="text-xs font-bold text-slate-700">{cita.numeroIdentidadPaciente}</span>
      </div>

      <div className="hidden md:block w-px h-8 bg-slate-200 flex-shrink-0" />

      <div className="hidden md:block min-w-0">
        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">Especialidad</span>
        <span className="text-xs font-bold text-slate-700">{cita.especialidadOdontologo || 'General'}</span>
      </div>
    </div>

    {/* Stepper de progreso clínico */}
    <div className="flex items-center justify-between lg:justify-end gap-3 flex-shrink-0">
      <nav aria-label="Pasos de la consulta clínica" className="flex items-center gap-1.5">
        {STEPS.map((s, i) => {
          const done   = step > s.num;
          const active = step === s.num;

          return (
            <React.Fragment key={s.num}>
              <button
                type="button"
                onClick={() => done && onStepClick(s.num)}
                disabled={!done}
                aria-label={s.label}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold
                            transition-all duration-200 outline-none
                            ${active
                              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25 scale-105'
                              : done
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-default'}`}
              >
                {done ? (
                  <i className="bi bi-check-circle-fill text-[12px]" aria-hidden="true" />
                ) : (
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] leading-none ${active ? 'border-white text-white' : 'border-slate-300 text-slate-400'}`}>
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>

              {i < STEPS.length - 1 && (
                <div className={`w-4 h-0.5 rounded-full flex-shrink-0 transition-colors ${step > s.num ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Botón Salir / Volver */}
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600
                   border border-slate-200/80 rounded-xl hover:bg-slate-100 transition-colors
                   flex-shrink-0 outline-none active:scale-95"
      >
        <i className="bi bi-arrow-left text-xs" />
        <span className="hidden sm:inline">Volver</span>
      </button>
    </div>
  </div>
);

export default ConsultaBanner;
