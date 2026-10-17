/**
 * Propósito:
 * Componente atómico de selección desplegable (HTML select) estilizado con Tailwind CSS.
 * Proporciona un contenedor accesible con flecha indicadora personalizada, soporte para labels,
 * estados de validación de error, texto de ayuda y reenvío de referencias (forwardRef).
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/Select.jsx'. Primitiva de formulario dentro de la capa
 * de componentes de interfaz reutilizables.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/AppointmentForm.jsx'
 *   - 'src/components/ReprogramModal.jsx'
 *   - 'src/components/StepPrescripcion.jsx'
 *   - 'src/views/PatientManagementPage.jsx'
 *   - 'src/views/UserManagementPage.jsx'
 * - Consume:
 *   - React ('forwardRef').
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del selector.
 * @param {string} [props.label] - Texto de la etiqueta del select.
 * @param {string} [props.error] - Mensaje de error para despliegue de validación fallida.
 * @param {string} [props.helperText] - Texto descriptivo secundario.
 * @param {boolean} [props.required] - Si es true, marca el campo con asterisco rojo de obligatoriedad.
 * @param {string} [props.id] - Identificador único HTML (autogenerado si existe label).
 * @param {React.ReactNode} props.children - Elementos <option> o <optgroup> a renderizar.
 * @param {string} [props.className=''] - Clases utilitarias adicionales.
 * @param {boolean} [props.disabled] - Deshabilita la interacción del usuario.
 * @param {React.Ref<HTMLSelectElement>} ref - Referencia imperativa forwardRef hacia el elemento nativo select.
 * @returns {JSX.Element} Control desplegable estandarizado y accesible.
 */

import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  helperText,
  required,
  id,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Generación determinista del atributo 'id' para asociar el elemento label con el select
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {/* Etiqueta semántica de accesibilidad */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-tight"
        >
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          {...props}
          className={`
            w-full py-2.5 pl-3.5 pr-10 text-sm rounded-xl border bg-white text-slate-800
            transition-all duration-200 outline-none appearance-none cursor-pointer
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'shadow-xs'}
            ${className}
          `}
        >
          {children}
        </select>

        {/* Flecha indicadora estilizada que sustituye el icono nativo del navegador */}
        <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs flex items-center">
          <i className="bi bi-chevron-down" />
        </div>
      </div>

      {/* Retroalimentación de error o mensaje de ayuda informativo */}
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

Select.displayName = 'Select';

export default Select;
