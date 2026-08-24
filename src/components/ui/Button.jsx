import React from 'react';

//Constructor de clases tailwind para usar en botones
const VARIANTS = {
  primary:  'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
  secondary:'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  danger:   'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  ghost:    'text-slate-600 hover:bg-slate-100',
  success:  'bg-emerald-600 text-white hover:bg-emerald-700',
  outline:  'border border-primary-600 text-primary-600 hover:bg-primary-50',
};

// SIZES Controla padding, tamaño de fuente y radio del botón.
const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg',
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-xl',
};

/**
 * Botón genérico reutilizado con variantes de estilo y tamaño.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'|'success'|'outline'} variant
 * @param {'xs'|'sm'|'md'|'lg'} size
 */
const Button = ({
  children, //texto o contenido
  variant = 'primary', //estilo isual
  size    = 'md', //tamaño
  className = '', //clase adicional opcional
  disabled, //desabilitacion de boton
  loading, //spinner y deshabilita el boton
  icon, //icono a la izquierda
  fullWidth, //si true, ocupa todo el ancho
  ...props //Resto de props nativas del <button>
}) => (
  <button
    {...props}
    // Deshabilita el botón si está explícitamente deshabilitado o si está cargando
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
      ${VARIANTS[variant] ?? VARIANTS.primary}
      ${SIZES[size]       ?? SIZES.md}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
  >
    {/* Spinner animado: visible solo cuando loading=true. Hereda color del texto via border-current */}
    {loading && (
      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    )}
    {/* Ícono: visible solo si no está cargando. Para cambiar posición (derecha), muévelo después de {children} */}
    {icon && !loading && <span className="text-sm">{icon}</span>}
     {/* Contenido principal del botón */}
    {children}
  </button>
);

export default Button;
