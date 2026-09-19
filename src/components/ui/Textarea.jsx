import React, { forwardRef } from 'react';

/**
 * Textarea component reutilizable y accesible con soporte para label, error y required.
 */
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
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
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
