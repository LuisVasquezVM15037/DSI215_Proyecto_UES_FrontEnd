import React from 'react';

// Constructor de clases tailwind para usar en botones con micro-interacciones
const VARIANTS = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md hover:shadow-primary-500/20 active:bg-primary-800 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
  danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 active:bg-red-200 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 active:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
  outline:   'border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  dental:    'bg-dental-600 text-white hover:bg-dental-700 shadow-sm hover:shadow-md hover:shadow-dental-500/20 active:bg-dental-800 focus-visible:ring-2 focus-visible:ring-dental-500 focus-visible:ring-offset-2',
};

// SIZES: Controla padding, tamaño de fuente y radio del botón.
const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg font-medium',
  sm: 'px-3.5 py-2 text-xs rounded-xl font-semibold',
  md: 'px-4 py-2.5 text-sm rounded-xl font-semibold',
  lg: 'px-5 py-3 text-base rounded-xl font-semibold',
};

/**
 * Botón genérico reutilizado con variantes de estilo, tamaño y micro-interacciones.
 */
const Button = ({
  children,
  variant = 'primary',
  size    = 'md',
  className = '',
  disabled,
  loading,
  icon,
  iconRight,
  fullWidth,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    {...props}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center gap-2 select-none cursor-pointer
      transition-all duration-150 active:scale-[0.98] outline-none
      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
      ${VARIANTS[variant] ?? VARIANTS.primary}
      ${SIZES[size]       ?? SIZES.md}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
  >
    {loading && (
      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
    )}
    {icon && !loading && <span className="flex-shrink-0 flex items-center">{icon}</span>}
    {children}
    {iconRight && !loading && <span className="flex-shrink-0 flex items-center">{iconRight}</span>}
  </button>
);

export default Button;
