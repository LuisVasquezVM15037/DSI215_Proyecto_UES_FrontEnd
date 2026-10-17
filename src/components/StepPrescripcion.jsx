import React from 'react';
import Button from './ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Label = ({ children }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">{children}</label>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white
                text-slate-800 placeholder-slate-400 outline-none
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all ${props.className ?? ''}`}
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white
               text-slate-800 outline-none focus:ring-2 focus:ring-primary-500
               focus:border-transparent transition-all"
  >
    {children}
  </select>
);

/**
 * Paso 3: Prescripción de medicamentos.
 * Panel izquierdo: formulario para agregar medicamentos (asociables a cualquier procedimiento, incluyendo completados).
 * Panel derecho: medicamentos ya guardados en la receta + nuevos medicamentos en borrador.
 */
const StepPrescripcion = ({
  hallazgos = [], medicamentos = [],
  prescripcion, setPrescripcion,
  detalles = [], detalleActual, handleDetalleChange,
  savingPrescripcion,
  onAgregarDetalle, onEliminarDetalle,
  onGuardarPrescripcion, onFinalizar, onVolver,
}) => {
  const tieneGuardados = prescripcion?.detalles?.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card mt-4
                    flex-1 overflow-y-auto animate-fade-in">
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h5 className="font-bold text-slate-800">Emitir Prescripción Médica</h5>
            <p className="text-xs text-slate-500 mt-0.5">
              Asocia medicamentos a los procedimientos realizados o genera una receta general para el paciente.
            </p>
          </div>

          {tieneGuardados && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200
                            rounded-xl text-xs font-semibold text-emerald-700">
              <i className="bi bi-check-circle-fill" />
              Receta activa con {prescripcion.detalles.length} medicamento(s)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── PANEL IZQUIERDO: Formulario de adición ──────────────── */}
          <div>
            {/* Asociar a hallazgo */}
            <div className="mb-4">
              <Label>Asociar a Procedimiento / Hallazgo (opcional)</Label>
              <Select
                value={detalleActual.idPlanTratamiento ?? ''}
                onChange={e => handleDetalleChange('idPlanTratamiento', e.target.value)}
              >
                <option value="">Prescripción General (Sin procedimiento específico)</option>
                {hallazgos.map(h => (
                  <option key={h.idPlanTratamiento} value={h.idPlanTratamiento}>
                    {h.piezaDental ? `Pieza ${h.piezaDental}` : 'General'}: {h.nombreTratamiento} [{h.estadoPlan}]
                  </option>
                ))}
              </Select>
            </div>

            {/* Formulario medicamento */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
              <h6 className="text-sm font-bold text-primary-700 flex items-center gap-1.5">
                <i className="bi bi-capsule" />Agregar medicamento a la receta
              </h6>

              <div>
                <Label>Medicamento *</Label>
                <Select
                  value={detalleActual.idMedicamento}
                  onChange={e => handleDetalleChange('idMedicamento', e.target.value)}
                >
                  <option value="">Seleccione un medicamento...</option>
                  {medicamentos.map(m => (
                    <option key={m.idMedicamento} value={m.idMedicamento}>
                      {m.nombreMedicamento} — {m.concentracion} ({m.componenteActivo})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Dosis *</Label>
                  <Input placeholder="ej. 500 mg / 1 tableta"
                    value={detalleActual.dosis}
                    onChange={e => handleDetalleChange('dosis', e.target.value)} />
                </div>
                <div>
                  <Label>Frecuencia *</Label>
                  <Input placeholder="ej. Cada 8 horas"
                    value={detalleActual.frecuencia}
                    onChange={e => handleDetalleChange('frecuencia', e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Duración (días) *</Label>
                <Input type="number" min="1" placeholder="ej. 5"
                  value={detalleActual.duracion}
                  onChange={e => handleDetalleChange('duracion', e.target.value)} />
              </div>

              <div>
                <Label>Indicaciones adicionales</Label>
                <textarea
                  rows={2}
                  placeholder="Tomar después de los alimentos..."
                  value={detalleActual.indicaciones}
                  onChange={e => handleDetalleChange('indicaciones', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white
                             text-slate-800 placeholder-slate-400 outline-none resize-none
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <Button fullWidth onClick={() => onAgregarDetalle(hallazgos)}
                icon={<i className="bi bi-plus-circle" />}>
                Agregar a la receta
              </Button>
            </div>
          </div>

          {/* ── PANEL DERECHO: Medicamentos guardados y borrador ─────── */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[460px] bg-white">
            <h6 className="text-sm font-bold text-slate-800 flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-primary-700">
                <i className="bi bi-file-medical" />Detalle de la receta
              </span>
              <span className="text-xs font-normal text-slate-400">
                {(prescripcion?.detalles?.length || 0) + detalles.length} item(s)
              </span>
            </h6>

            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">

              {/* Sección 1: Medicamentos ya guardados previamente en base de datos */}
              {tieneGuardados && (
                <div>
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <i className="bi bi-check2-all" />Medicamentos ya guardados en esta consulta
                  </p>
                  <div className="space-y-1.5">
                    {prescripcion.detalles.map((d, idx) => (
                      <div key={idx} className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-emerald-950">{d.nombreMedicamento}</p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Guardado</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {d.dosisPrescripcion || d.dosis} • {d.frecuenciaPrescripcion || d.frecuencia} • {d.duracionPrescripcion || d.duracion} días
                        </p>
                        {(d.indicacionesPrescripcion || d.indicaciones) && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">{d.indicacionesPrescripcion || d.indicaciones}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección 2: Nuevos medicamentos en borrador (pendientes de guardar) */}
              {detalles.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <i className="bi bi-hourglass-split" />Nuevos medicamentos listos para guardar ({detalles.length})
                  </p>
                  <div className="space-y-1.5">
                    {detalles.map((d, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2 p-2.5
                                                bg-amber-50/50 border border-amber-200/70 rounded-xl">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">{d.nombreMedicamento}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {d.dosis} • {d.frecuencia} • {d.duracion} días
                          </p>
                          {d.justificacionVisual && (
                            <span className="inline-block text-[10px] bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded mt-1 font-medium">
                              {d.justificacionVisual}
                            </span>
                          )}
                          {d.indicaciones && (
                            <p className="text-[10px] text-slate-400 mt-0.5 italic">{d.indicaciones}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onEliminarDetalle(idx)}
                          aria-label="Eliminar medicamento"
                          className="w-6 h-6 flex items-center justify-center text-slate-400
                                     hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                        >
                          <i className="bi bi-x text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!tieneGuardados && detalles.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                  <i className="bi bi-capsule text-3xl mb-2 text-slate-300" />
                  <p className="text-xs text-center">
                    No hay medicamentos en la receta.<br />
                    Agrega los medicamentos necesarios desde el formulario izquierdo.
                  </p>
                </div>
              )}
            </div>

            {/* Acciones del pie */}
            <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-slate-100">
              {detalles.length > 0 && (
                <Button fullWidth onClick={() => onGuardarPrescripcion()} loading={savingPrescripcion}>
                  <i className="bi bi-save" />
                  Guardar medicamentos en la receta ({detalles.length})
                </Button>
              )}

              <Button
                variant={tieneGuardados || detalles.length === 0 ? 'success' : 'outline'}
                fullWidth
                onClick={onFinalizar}
              >
                Finalizar Consulta y Ver Resumen
                <i className="bi bi-arrow-right ms-1" />
              </Button>

              <Button variant="secondary" fullWidth onClick={onVolver}
                icon={<i className="bi bi-arrow-left" />}>
                Volver al odontograma
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPrescripcion;
