/**
 * Propósito:
 * Componente de entrada de datos textuales con soporte para etiquetas semánticas (labels),
 * validación visual de errores, textos de ayuda descriptivos, iconos decorativos y
 * enlace directo mediante referencias de React (forwardRef).
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/Input.jsx'. Primitiva de formulario dentro de la capa
 * de componentes de presentación atómicos.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/AppointmentForm.jsx'
 *   - 'src/components/ReprogramModal.jsx'
 *   - 'src/components/StepEvaluacion.jsx'
 *   - 'src/views/LoginPage.jsx'
 *   - 'src/views/PatientManagementPage.jsx'
 *   - 'src/views/UserManagementPage.jsx'
 * - Consume:
 *   - React ('forwardRef').
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del campo de entrada.
 * @param {string} [props.label] - Texto de la etiqueta descriptiva del input.
 * @param {string} [props.error] - Mensaje de error de validación para desplegar feedback visual en rojo.
 * @param {string} [props.helperText] - Instrucción secundaria bajo el campo cuando no hay error.
 * @param {React.ReactNode} [props.icon] - Icono situado al inicio del campo (con ajuste automático de padding).
 * @param {boolean} [props.required] - Indica si el campo es obligatorio (agrega asterisco visual).
 * @param {string} [props.id] - Identificador único para enlazar label con input (generado por defecto si existe label).
 * @param {string} [props.className=''] - Clases utilitarias adicionales de Tailwind CSS.
 * @param {boolean} [props.disabled] - Deshabilita el elemento y aplica opacidad/bloqueo de cursor.
 * @param {React.Ref<HTMLInputElement>} ref - Referencia imperativa forwardRef hacia el nodo nativo HTML.
 * @returns {JSX.Element} Fragmento de interfaz accesible para captura de texto.
 */

import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  required,
  id,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Generación determinista del ID para garantizar la asociación accesible entre label e input
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {/* Etiqueta descriptiva accesible */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight"
        >
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Renderizado de icono prefijo posicionado de manera absoluta */}
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          {...props}
          className={`
            w-full py-2.5 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400
            transition-all duration-200 outline-none
            ${icon ? 'pl-10 pr-3.5' : 'px-3.5'}
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'shadow-xs'}
            ${className}
          `}
        />
      </div>

      {/* Visualización condicional: mensaje de error prioritario o texto de ayuda */}
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

Input.displayName = 'Input';

export default Input;
