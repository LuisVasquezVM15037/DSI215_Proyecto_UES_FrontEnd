import React from 'react';

/** Spinner de carga centrado con texto opcional */
//Usado para estados de carga dentro de secciones de la página
export const LoadingSpinner = ({ text = 'Cargando...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
    <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600
                    rounded-full animate-spin" />
    <p className="text-sm text-slate-500">{text}</p>
  </div>
);

/**
 * Estado vacío con ícono, título y acción opcional.
 *
 * @param {string} icon        - Clase Bootstrap Icons (ej: 'bi-calendar-x')
 * @param {string} title       - Título principal
 * @param {string} description - Descripción secundaria (opcional)
 * @param {React.ReactNode} action - Botón u otro elemento de acción
 */
export const EmptyState = ({ icon, title, description, action, className = '' }) => (
  // Columna centrada con espacio vertical 
  <div className={`flex flex-col items-center justify-center py-16 gap-3 text-center ${className}`}>
    {/* Spinner circular. border-t-primary-600 es el segmento visible que rota. */}
    {icon && <i className={`bi ${icon} text-5xl text-slate-300`} />}
    {/* Título principal del estado vacío */}
    <h6 className="font-semibold text-slate-600">{title}</h6>
    {/* Descripción secundaria: renderizada solo si se pasa el prop `description` */}
    {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
    {/* Acción (ej. un <Button>): renderizada solo si se pasa el prop `action` */}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
