import React, { forwardRef } from 'react';

/**
 * Select component reutilizable y accesible con icono personalizado y soporte para label y error.
 */
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
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
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

        <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs flex items-center">
          <i className="bi bi-chevron-down" />
        </div>
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

Select.displayName = 'Select';

export default Select;
