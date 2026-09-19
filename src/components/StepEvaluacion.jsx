import React from 'react';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import StatusBadge from './ui/StatusBadge';

/**
 * Paso 1: Evaluación clínica inicial del paciente.
 */
const StepEvaluacion = ({
  cita,
  evaluacion,
  diagnostico,
  setDiagnostico,
  observaciones,
  setObservaciones,
  savingEval,
  onGuardar,
  onContinuar,
}) => (
  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card mt-2 animate-fade-in flex-1 overflow-y-auto">
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

      <div className="border-b border-slate-100 pb-4">
        <h5 className="font-extrabold text-slate-800 text-lg font-display">
          1. Evaluación y Anamnesis Clínica Inicial
        </h5>
        <p className="text-xs text-slate-400 mt-0.5">
          Registra el motivo principal de la consulta odontológica y antecedentes relevantes del paciente.
        </p>
      </div>

      {/* Tarjetas informativas de alerta y estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alerta de Alergias */}
        <div className="p-4 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="bi bi-shield-exclamation text-base" />
          </div>
          <div>
            <h6 className="font-bold text-red-800 text-xs uppercase tracking-wider">
              Alergias y Condiciones Médicas
            </h6>
            <p className="text-xs text-red-700/90 mt-1 leading-relaxed">
              Verifica el expediente clínico para descartar reacciones a anestésicos, antibióticos o coagulopatías antes de intervenir.
            </p>
          </div>
        </div>

        {/* Estado actual de la cita */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start justify-between gap-3">
          <div>
            <h6 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Estado de la Cita
            </h6>
            <p className="text-xs text-slate-400 mt-1">
              Atención médica asignada a {cita.especialidadOdontologo || 'Odontología General'}
            </p>
          </div>
          <StatusBadge estado={cita.estadoCita} />
        </div>
      </div>

      {/* Formulario de evaluación */}
      <div className="space-y-4">
        <Textarea
          label="Diagnóstico Inicial / Motivo de Consulta"
          required
          rows={3}
          placeholder="Describe los síntomas del paciente, piezas afectadas a simple vista o motivo de la visita..."
          value={diagnostico}
          onChange={e => setDiagnostico(e.target.value)}
        />

        <Textarea
          label="Observaciones y Antecedentes Odontológicos"
          rows={2}
          placeholder="Higiene bucal, sensibilidad térmica, tratamientos previos en la misma zona..."
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {evaluacion && (
          <Button variant="secondary" onClick={onContinuar}>
            Continuar sin Modificar
          </Button>
        )}

        <Button
          onClick={onGuardar}
          loading={savingEval}
          iconRight={<i className="bi bi-arrow-right" />}
        >
          Guardar y Avanzar a Odontograma
        </Button>
      </div>

    </div>
  </div>
);

export default StepEvaluacion;
