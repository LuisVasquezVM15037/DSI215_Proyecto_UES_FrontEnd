import React from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';

/**
 * Paso 3: Prescripción de medicamentos con formulario dual y visualización previa de receta médica.
 */
const StepPrescripcion = ({
  hallazgos,
  medicamentos,
  prescripcion,
  setPrescripcion,
  detalles,
  detalleActual,
  handleDetalleChange,
  savingPrescripcion,
  onAgregarDetalle,
  onEliminarDetalle,
  onGuardarPrescripcion,
  onFinalizar,
  onVolver,
}) => (
  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card mt-2
                  flex-1 overflow-y-auto animate-fade-in">
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

      <div className="border-b border-slate-100 pb-4">
        <h5 className="font-extrabold text-slate-800 text-lg font-display">
          3. Emisión de Prescripción y Receta Médica
        </h5>
        <p className="text-xs text-slate-400 mt-0.5">
          Agrega fármacos indicando dosificación, frecuencia y duración del tratamiento farmacológico.
        </p>
      </div>

      {prescripcion ? (
        /* Estado cuando la prescripción ya fue guardada previamente */
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-emerald-800 text-sm font-bold">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-check2-circle text-xl" />
            </div>
            <div>
              <p>Prescripción guardada exitosamente</p>
              <p className="text-xs text-emerald-600 font-normal mt-0.5">
                Los medicamentos ya forman parte del expediente clínico de esta consulta.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrescripcion(null)}
              icon={<i className="bi bi-plus-lg" />}
            >
              Añadir Más
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={onFinalizar}
              iconRight={<i className="bi bi-arrow-right" />}
            >
              Completar Consulta
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── PANEL IZQUIERDO: Formulario de adición de medicamentos (7 cols) ──── */}
          <div className="lg:col-span-7 space-y-4">

            {/* Asociación con pieza dental o hallazgo */}
            <Select
              label="Asociar a Tratamiento Odontológico (Opcional)"
              value={detalleActual.idPlanTratamiento ?? ''}
              onChange={e => handleDetalleChange('idPlanTratamiento', e.target.value)}
            >
              <option value="">Prescripción General (Sin pieza específica)</option>
              {hallazgos
                .filter(h => h.estadoPlan?.toUpperCase() !== 'COMPLETADO')
                .map(h => (
                  <option key={h.idPlanTratamiento} value={h.idPlanTratamiento}>
                    Pieza {h.piezaDental} — {h.nombreTratamiento}
                  </option>
                ))}
            </Select>

            {/* Tarjeta de configuración del fármaco */}
            <div className="border border-slate-200/80 rounded-3xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-2 text-primary-700">
                <i className="bi bi-capsule-pill text-base" />
                <h6 className="text-xs font-bold uppercase tracking-wider">
                  Detalles del Medicamento
                </h6>
              </div>

              <Select
                label="Fármaco o Principio Activo"
                required
                value={detalleActual.idMedicamento}
                onChange={e => handleDetalleChange('idMedicamento', e.target.value)}
              >
                <option value="">Selecciona un medicamento del catálogo...</option>
                {medicamentos.map(m => (
                  <option key={m.idMedicamento} value={m.idMedicamento}>
                    {m.nombreMedicamento} — {m.concentracion}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Dosis"
                  placeholder="ej. 500 mg, 1 tableta"
                  value={detalleActual.dosis}
                  onChange={e => handleDetalleChange('dosis', e.target.value)}
                />

                <Input
                  label="Frecuencia"
                  placeholder="ej. Cada 8 horas"
                  value={detalleActual.frecuencia}
                  onChange={e => handleDetalleChange('frecuencia', e.target.value)}
                />
              </div>

              <Input
                type="number"
                label="Duración del Tratamiento (Días)"
                min="1"
                placeholder="ej. 7"
                value={detalleActual.duracion}
                onChange={e => handleDetalleChange('duracion', e.target.value)}
              />

              <Textarea
                label="Indicaciones de Administración"
                rows={2}
                placeholder="Tomar después de los alimentos, evitar consumo de lácteos..."
                value={detalleActual.indicaciones}
                onChange={e => handleDetalleChange('indicaciones', e.target.value)}
              />

              <Button
                fullWidth
                onClick={() => onAgregarDetalle(hallazgos)}
                icon={<i className="bi bi-plus-circle" />}
              >
                Agregar a la Receta
              </Button>
            </div>
          </div>

          {/* ── PANEL DERECHO: Previsualización de la Receta (5 cols) ─────────────── */}
          <div className="lg:col-span-5 border border-slate-200/80 rounded-3xl p-5 flex flex-col min-h-[420px] bg-white shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <i className="bi bi-receipt text-primary-600 text-sm" />
                <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Hoja de Receta ({detalles.length})
                </h6>
              </div>
            </div>

            {detalles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-300 flex items-center justify-center mb-2">
                  <i className="bi bi-file-earmark-medical text-2xl" />
                </div>
                <p className="text-xs font-semibold text-slate-500">Receta sin fármacos</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                  Completa los campos del panel izquierdo para incluir medicamentos en la receta.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-1">
                {detalles.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {d.nombreMedicamento}
                      </p>
                      <p className="text-[11px] text-primary-700 font-semibold mt-0.5">
                        {d.dosis || 'Dosis regular'} · {d.frecuencia || 'C/8h'} · {d.duracion ? `${d.duracion} días` : ''}
                      </p>
                      {d.indicaciones && (
                        <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                          "{d.indicaciones}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onEliminarDetalle(idx)}
                      aria-label="Eliminar fármaco"
                      title="Eliminar de la receta"
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400
                                 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <i className="bi bi-trash text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Acciones de cierre del paso */}
            <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={onVolver}
                icon={<i className="bi bi-arrow-left" />}
              >
                Volver al Odontograma
              </Button>

              <Button
                fullWidth
                onClick={onGuardarPrescripcion}
                loading={savingPrescripcion}
                disabled={detalles.length === 0 || savingPrescripcion}
                icon={<i className="bi bi-check2-circle" />}
              >
                Guardar Receta Médica
              </Button>

              <Button
                variant="outline"
                fullWidth
                onClick={onFinalizar}
              >
                Finalizar sin Medicamentos
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  </div>
);

export default StepPrescripcion;
