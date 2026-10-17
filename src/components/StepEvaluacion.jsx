import React from 'react';
import Button from './ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

//Este componente representa el paso de evaluación clínica inicial en el proceso de atención médica. Permite al médico registrar el diagnóstico inicial y observaciones relevantes sobre el paciente, así como mostrar alertas importantes como alergias. El diseño es limpio y enfocado en la usabilidad, con campos de texto amplios y botones claros para guardar o continuar.

//Todas las funciones y estados relacionados con el diagnóstico y observaciones se manejan a través de props, lo que permite una fácil integración con la lógica de negocio y manejo de datos en el componente padre.

// Componente para mostrar etiquetas de campos con indicación de obligatoriedad
const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);
// Componente de textarea estilizado para inputs de diagnóstico y observaciones
const Textarea = ({ rows = 3, ...props }) => (
  <textarea
    rows={rows}
    {...props}
    className={`w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                text-slate-800 placeholder-slate-400 outline-none resize-none
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all ${props.className ?? ''}`}
  />
);

/**
 * Paso 1: Evaluación clínica inicial.
 */

//cita>: objeto con detalles de la cita médica actual (fecha, hora, estado, etc.)
//evaluacion>: objeto con detalles de la evaluación clínica previa (si existe), o null si es la primera vez que se evalúa al paciente.
//diagnostico>: estado local para almacenar el diagnóstico inicial ingresado por el médico.
//setDiagnostico>: función para actualizar el estado del diagnóstico.
//observaciones>: estado local para almacenar las observaciones adicionales ingresadas por el médico.
//setObservaciones>: función para actualizar el estado de las observaciones.
const StepEvaluacion = ({
  cita, evaluacion,
  diagnostico,    setDiagnostico,
  observaciones,  setObservaciones,
  savingEval, onGuardar, onContinuar,
}) => {
  const [error, setError] = React.useState('');

  const handleSave = () => {
    if (!diagnostico?.trim()) {
      setError('El diagnóstico inicial es obligatorio para avanzar al odontograma.');
      return;
    }
    setError('');
    onGuardar();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card mt-4 animate-fade-in flex-1 overflow-y-auto">
      <div className="p-6">
        <h5 className="font-bold text-slate-800 mb-5">Revisión inicial del paciente</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Alergias */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h6 className="font-bold text-red-700 text-sm flex items-center gap-2 mb-1">
              <i className="bi bi-exclamation-triangle-fill" />Alergias y alertas
            </h6>
            <p className="text-xs text-red-600">
              Verificar alergias en el expediente del paciente antes de proceder.
            </p>
          </div>

          {/* Estado de la cita */}
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <h6 className="font-bold text-primary-700 text-sm mb-2">Estado de la cita</h6>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
              ${cita.estadoCita === 'PROGRAMADA'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'}`}>
              {cita.estadoCita}
            </span>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="mb-4">
          <FieldLabel required>Diagnóstico inicial</FieldLabel>
          <Textarea
            rows={3}
            placeholder="Describe el motivo de consulta y hallazgos iniciales..."
            value={diagnostico}
            onChange={e => {
              setDiagnostico(e.target.value);
              if (error) setError('');
            }}
            className={error ? 'border-red-400 focus:ring-red-400' : ''}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <i className="bi bi-exclamation-circle" /> {error}
            </p>
          )}
        </div>

        {/* Observaciones */}
        <div className="mb-6">
          <FieldLabel>Observaciones adicionales</FieldLabel>
          <Textarea
            rows={2}
            placeholder="Observaciones, antecedentes relevantes..."
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          {evaluacion && (
            <Button variant="secondary" onClick={onContinuar}>
              Continuar sin cambios
            </Button>
          )}

          <Button onClick={handleSave} loading={savingEval}>
            Guardar y continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepEvaluacion;
