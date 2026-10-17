/**
 * Propósito:
 * Componente atómico de entrada multilínea (HTML textarea) con diseño uniforme,
 * soporte para etiquetas accesibles, estados de validación por error, texto de ayuda
 * y referencia vinculable mediante React forwardRef.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/Textarea.jsx'. Primitiva de formulario dentro de la capa
 * de componentes de presentación base.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/AppointmentForm.jsx'
 *   - 'src/components/ReprogramModal.jsx'
 *   - 'src/components/StepEvaluacion.jsx'
 *   - 'src/components/StepCierre.jsx'
 *   - 'src/components/StepPrescripcion.jsx'
 *   - 'src/views/PatientManagementPage.jsx'
 * - Consume:
 *   - React ('forwardRef').
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del campo multilínea.
 * @param {string} [props.label] - Etiqueta descriptiva del campo.
 * @param {string} [props.error] - Mensaje de error para activar estados visuales de validación fallida.
 * @param {string} [props.helperText] - Texto descriptivo o instructivo complementario.
 * @param {boolean} [props.required] - Si es true, añade indicador de campo requerido (*).
 * @param {string} [props.id] - Identificador único para enlazar label y textarea.
 * @param {number} [props.rows=3] - Cantidad predeterminada de filas visibles de texto.
 * @param {string} [props.className=''] - Clases utilitarias de Tailwind adicionales.
 * @param {boolean} [props.disabled] - Deshabilita el área de texto ante interacciones.
 * @param {React.Ref<HTMLTextAreaElement>} ref - Referencia directa al nodo textarea del DOM.
 * @returns {JSX.Element} Campo de texto multilínea estandarizado.
 */

import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  required,
  id,
  rows = 3,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Derivación determinista del ID para garantizar correspondencia con la etiqueta
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {/* Etiqueta asociada al campo multilínea */}
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight"
        >
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        {...props}
        className={`
          w-full p-3 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400
          transition-all duration-200 outline-none resize-none
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
          }
          ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'shadow-xs'}
          ${className}
        `}
      />

      {/* Retroalimentación visual: error crítico o ayuda contextual */}
      {error ? (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1 animate-fade-in">
          <i className="bi bi-exclamation-circle text-[11px]" />
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
