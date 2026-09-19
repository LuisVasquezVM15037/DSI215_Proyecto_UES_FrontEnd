import React, { forwardRef } from 'react';

/**
 * Input component reusable y accesible con soporte para icono, label, error y required.
 */
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
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
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
