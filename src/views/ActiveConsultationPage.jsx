import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConsultaData } from '../hooks/useConsultaData';
import { usePrescripcion } from '../hooks/usePrescripcion';
import { useTratamientos } from '../hooks/useTratamientos';
import ConsultaBanner from '../components/ConsultaBanner';
import StepEvaluacion from '../components/StepEvaluacion';
import StepOdontograma from '../components/StepOdontograma';
import StepPrescripcion from '../components/StepPrescripcion';
import StepCierre from '../components/StepCierre';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

/**
 * Página de consulta activa.
 * Orquesta los 4 pasos: Evaluación → Odontograma → Prescripción → Cierre.
 * Toda la lógica de negocio vive en los hooks especializados.
 */
const ActiveConsultationPage = () => {
  const { citaId } = useParams();
  const navigate   = useNavigate();
  const [step, setStep] = useState(1);

  // ── Hooks de datos ──────────────────────────────────────────────────────
  const consulta = useConsultaData(citaId);

  const prescripcion = usePrescripcion(
    citaId,
    () => setStep(4),   // onGuardado → avanza al cierre
  );

  const tratamientos = useTratamientos(
    consulta.evaluacion,
    () => consulta.fetchHallazgos(consulta.evaluacion?.idEvaluacionClinica),
  );

  // ── Loading inicial ──────────────────────────────────────────────────────
  if (consulta.loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner text="Cargando información clínica de la consulta..." />
      </div>
    );
  }

  if (!consulta.cita) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-4">
            <i className="bi bi-exclamation-triangle" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">
            No se pudo cargar la cita
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            La cita médica solicitada no existe o no se tienen permisos suficientes para acceder a su información clínica.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/consulta')}
            icon="bi-arrow-left"
            className="w-full justify-center"
          >
            Volver a Consultas
          </Button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 h-full min-h-0 p-4 gap-4 bg-surface overflow-hidden">

      {/* Banner con datos del paciente y stepper */}
      <ConsultaBanner
        cita={consulta.cita}
        step={step}
        onStepClick={setStep}
        onVolver={() => navigate('/consulta')}
      />

      {/* ── PASO 1: Evaluación ─────────────────────────────────────────── */}
      {step === 1 && (
        <StepEvaluacion
          cita={consulta.cita}
          evaluacion={consulta.evaluacion}
          diagnostico={consulta.diagnostico}
          setDiagnostico={consulta.setDiagnostico}
          observaciones={consulta.observaciones}
          setObservaciones={consulta.setObservaciones}
          savingEval={consulta.savingEval}
          onGuardar={() => consulta.handleGuardarEvaluacion(() => setStep(2))}
          onContinuar={() => setStep(2)}
        />
      )}

      {/* ── PASO 2: Odontograma ────────────────────────────────────────── */}
      {step === 2 && (
        <StepOdontograma
          cita={consulta.cita}
          hallazgos={consulta.hallazgos}
          onCambiarEstado={consulta.handleCambiarEstado}
          onEliminarHallazgo={consulta.handleEliminarHallazgo}
          tratamientos={tratamientos.tratamientos}
          selectedTeeth={tratamientos.selectedTeeth}
          selectedTratamiento={tratamientos.selectedTratamiento}
          setSelectedTratamiento={tratamientos.setSelectedTratamiento}
          customPrecio={tratamientos.customPrecio}
          setCustomPrecio={tratamientos.setCustomPrecio}
          savingHallazgo={tratamientos.savingHallazgo}
          onOdontogramChange={tratamientos.handleOdontogramChange}
          onRegistrarHallazgo={tratamientos.handleRegistrarHallazgo}
          onCrearTratamiento={tratamientos.handleCrearTratamiento}
          onVolver={() => setStep(1)}
          onContinuar={() => setStep(3)}
        />
      )}

      {/* ── PASO 3: Prescripción ───────────────────────────────────────── */}
      {step === 3 && (
        <StepPrescripcion
          hallazgos={consulta.hallazgos}
          medicamentos={prescripcion.medicamentos}
          prescripcion={prescripcion.prescripcion}
          setPrescripcion={prescripcion.setPrescripcion}
          detalles={prescripcion.detalles}
          detalleActual={prescripcion.detalleActual}
          handleDetalleChange={prescripcion.handleDetalleChange}
          savingPrescripcion={prescripcion.savingPrescripcion}
          onAgregarDetalle={prescripcion.handleAgregarDetalle}
          onEliminarDetalle={prescripcion.handleEliminarDetalle}
          onGuardarPrescripcion={prescripcion.handleGuardarPrescripcion}
          onFinalizar={() => consulta.handleFinalizarConsulta(() => setStep(4))}
          onVolver={() => setStep(2)}
        />
      )}

      {/* ── PASO 4: Cierre ─────────────────────────────────────────────── */}
      {step === 4 && (
        <StepCierre
          cita={consulta.cita}
          hallazgos={consulta.hallazgos}
          prescripcion={prescripcion.prescripcion}
          onVolver={() => navigate('/consulta')}
        />
      )}
    </div>
  );
};

export default ActiveConsultationPage;
