/**
 * Propósito:
 * Componente atómico de interfaz de usuario para botones de acción interactivos.
 * Proporciona un conjunto configurable de variantes visuales (primary, secondary, danger, etc.),
 * escalas de tamaño, soporte nativo de micro-interacciones, indicador de carga (spinner),
 * e inserción de iconos a la izquierda o derecha del texto.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/Button.jsx'. Corresponde a la capa de primitivas de UI
 * (Design System / Atomos) dentro de la arquitectura de presentación.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: Múltiples componentes de dominio y vistas del sistema, tales como:
 *   - 'src/components/AppointmentCard.jsx'
 *   - 'src/components/AppointmentForm.jsx'
 *   - 'src/components/ReprogramModal.jsx'
 *   - 'src/components/StepEvaluacion.jsx', 'StepOdontograma.jsx', 'StepPrescripcion.jsx', 'StepCierre.jsx'
 *   - 'src/views/LoginPage.jsx', 'src/views/PatientManagementPage.jsx', 'src/views/UserManagementPage.jsx', etc.
 * - Consume:
 *   - React (núcleo de renderizado).
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Nodo de contenido o etiqueta textual del botón.
 * @param {'primary'|'secondary'|'danger'|'ghost'|'success'|'outline'|'dental'} [props.variant='primary'] - Esquema de color y borde.
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='md'] - Escala tipográfica y espaciado (padding).
 * @param {string} [props.className=''] - Clases CSS complementarias de Tailwind.
 * @param {boolean} [props.disabled] - Estado deshabilitado manual.
 * @param {boolean} [props.loading] - Si es true, deshabilita la interacción y despliega un indicador animado.
 * @param {React.ReactNode} [props.icon] - Elemento visual/icono alineado a la izquierda.
 * @param {React.ReactNode} [props.iconRight] - Elemento visual/icono alineado a la derecha.
 * @param {boolean} [props.fullWidth] - Si es true, expande el botón al 100% del contenedor padre.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Tipo nativo de elemento button HTML.
 * @returns {JSX.Element} Elemento button con clases utilitarias de Tailwind reactivas.
 */

import React from 'react';

// Diccionario de estilos semánticos para centralizar tokens de diseño visual
const VARIANTS = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md hover:shadow-primary-500/20 active:bg-primary-800 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
  danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 active:bg-red-200 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 active:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
  outline:   'border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  dental:    'bg-dental-600 text-white hover:bg-dental-700 shadow-sm hover:shadow-md hover:shadow-dental-500/20 active:bg-dental-800 focus-visible:ring-2 focus-visible:ring-dental-500 focus-visible:ring-offset-2',
};

// Escala de tamaños para estandarizar proporciones según el contexto de uso
const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg font-medium',
  sm: 'px-3.5 py-2 text-xs rounded-xl font-semibold',
  md: 'px-4 py-2.5 text-sm rounded-xl font-semibold',
  lg: 'px-5 py-3 text-base rounded-xl font-semibold',
};

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
    // Deshabilita el botón si la propiedad disabled es verdadera o si se encuentra en estado de carga asíncrona
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
    {/* Indicador de carga circular condicional */}
    {loading && (
      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
    )}
    {/* Icono a la izquierda, ocultado durante el estado de carga para no alterar el espaciado */}
    {icon && !loading && <span className="flex-shrink-0 flex items-center">{icon}</span>}
    {children}
    {/* Icono complementario a la derecha */}
    {iconRight && !loading && <span className="flex-shrink-0 flex items-center">{iconRight}</span>}
  </button>
);

export default Button;
