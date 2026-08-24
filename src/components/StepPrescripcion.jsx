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
 * Panel izquierdo: formulario para agregar medicamentos.
 * Panel derecho: vista previa de la receta.
 */
const StepPrescripcion = ({
  hallazgos, medicamentos,
  prescripcion, setPrescripcion,
  detalles, detalleActual, handleDetalleChange,
  savingPrescripcion,
  onAgregarDetalle, onEliminarDetalle,
  onGuardarPrescripcion, onFinalizar, onVolver,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-card mt-4
                  flex-1 overflow-y-auto animate-fade-in">
    <div className="p-6">
      <h5 className="font-bold text-slate-800 mb-5">Emitir Prescripción Médica</h5>

      {prescripcion ? (
        /* Prescripción ya guardada */
        <div className="flex flex-wrap items-center justify-between gap-3 p-4
                        bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
            <i className="bi bi-check-circle-fill" />
            Ya existe una prescripción guardada para esta cita.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPrescripcion(null)}
              icon={<i className="bi bi-plus" />}>
              Añadir más medicamentos
            </Button>
            <Button variant="success" size="sm" onClick={onFinalizar}>
              Finalizar Consulta <i className="bi bi-arrow-right ms-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── PANEL IZQUIERDO: Formulario ──────────────────────────── */}
          <div>
            {/* Asociar a hallazgo */}
            <div className="mb-4">
              <Label>Asociar a Tratamiento / Hallazgo (opcional)</Label>
              <Select
                value={detalleActual.idPlanTratamiento ?? ''}
                onChange={e => handleDetalleChange('idPlanTratamiento', e.target.value)}
              >
                <option value="">Prescripción General</option>
                {hallazgos
                  .filter(h => h.estadoPlan?.toUpperCase() !== 'COMPLETADO')
                  .map(h => (
                    <option key={h.idPlanTratamiento} value={h.idPlanTratamiento}>
                      Pieza {h.piezaDental} — {h.nombreTratamiento}
                    </option>
                  ))}
              </Select>
            </div>

            {/* Formulario medicamento */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h6 className="text-sm font-bold text-primary-700 flex items-center gap-1.5">
                <i className="bi bi-capsule" />Agregar medicamento
              </h6>

              <div>
                <Label>Medicamento</Label>
                <Select
                  value={detalleActual.idMedicamento}
                  onChange={e => handleDetalleChange('idMedicamento', e.target.value)}
                >
                  <option value="">Seleccione...</option>
                  {medicamentos.map(m => (
                    <option key={m.idMedicamento} value={m.idMedicamento}>
                      {m.nombreMedicamento} — {m.concentracion}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Dosis</Label>
                  <Input placeholder="ej. 500mg"
                    value={detalleActual.dosis}
                    onChange={e => handleDetalleChange('dosis', e.target.value)} />
                </div>
                <div>
                  <Label>Frecuencia</Label>
                  <Input placeholder="ej. cada 8h"
                    value={detalleActual.frecuencia}
                    onChange={e => handleDetalleChange('frecuencia', e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Duración (días)</Label>
                <Input type="number" placeholder="ej. 7"
                  value={detalleActual.duracion}
                  onChange={e => handleDetalleChange('duracion', e.target.value)} />
              </div>

              <div>
                <Label>Indicaciones</Label>
                <textarea
                  rows={2}
                  placeholder="Tomar con alimentos..."
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

          {/* ── PANEL DERECHO: Vista previa ──────────────────────────── */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <h6 className="text-sm font-bold text-primary-700 flex items-center gap-1.5 mb-3">
              <i className="bi bi-file-medical" />Vista previa de receta
            </h6>

            {detalles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-400 text-center">
                  Agrega medicamentos para ver la receta aquí.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {detalles.map((d, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-3
                                            bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{d.nombreMedicamento}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {d.dosis} — {d.frecuencia} — {d.duracion} días
                      </p>
                      {d.indicaciones && (
                        <p className="text-xs text-slate-400 mt-0.5 italic">{d.indicaciones}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onEliminarDetalle(idx)}
                      aria-label="Eliminar medicamento"
                      className="w-7 h-7 flex items-center justify-center text-slate-400
                                 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                    >
                      <i className="bi bi-x text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" fullWidth onClick={onVolver}
                icon={<i className="bi bi-arrow-left" />}>
                Volver al odontograma
              </Button>
              <Button fullWidth onClick={onGuardarPrescripcion} loading={savingPrescripcion}
                disabled={detalles.length === 0 || savingPrescripcion}>
                Guardar Receta
              </Button>
              <Button variant="outline" fullWidth onClick={onFinalizar}>
                Finalizar sin medicamentos
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default StepPrescripcion;
